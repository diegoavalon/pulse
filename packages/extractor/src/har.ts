/**
 * Extract request waterfall and render-blocking resources from HAR data.
 * HAR is optional — returns empty arrays when absent.
 */

import type { CommittedRequest, CommittedBlocker, ResourceType } from "utils";
import type { HarLog, HarEntry } from "./types.js";

/** Infer resource type from MIME type and URL */
export function inferType(mimeType: string | undefined, url: string): ResourceType {
  if (!mimeType && !url) return "other";
  const m = mimeType?.toLowerCase() ?? "";
  const u = url.toLowerCase();

  if (m.includes("html") || m.includes("text/html")) return "document";
  if (m.includes("javascript") || m.includes("ecmascript") || u.endsWith(".js")) return "js";
  if (m.includes("css") || u.endsWith(".css")) return "css";
  if (m.includes("font") || u.endsWith(".woff2") || u.endsWith(".woff") || u.endsWith(".ttf"))
    return "font";
  if (
    m.includes("image") ||
    u.endsWith(".webp") ||
    u.endsWith(".jpg") ||
    u.endsWith(".png") ||
    u.endsWith(".svg") ||
    u.endsWith(".gif")
  )
    return "image";
  if (m.includes("json") || m.includes("xml") || u.includes("/api/")) return "xhr";
  return "other";
}

/** Extract last path segment from URL for display */
export function urlFileName(url: string): string {
  if (!url) return "/";
  const clean = url.split("?")[0];
  const seg = clean.split("/").filter(Boolean);
  return seg.length ? seg[seg.length - 1] : clean;
}

/** Extract hostname from URL */
export function urlHost(url: string, domain: string): string {
  if (!url) return domain;
  if (url.startsWith("//")) return url.slice(2).split("/")[0];
  try {
    return new URL(url).host;
  } catch {
    return domain;
  }
}

/** True if the URL is from a third-party origin relative to domain */
export function isThirdParty(url: string, domain: string): boolean {
  if (!url) return false;
  if (url.startsWith("//")) return true;
  try {
    const h = new URL(url.startsWith("http") ? url : `https:${url}`).host;
    return !h.includes(domain);
  } catch {
    return false;
  }
}

/** Total duration of a HAR entry in ms */
function entryDuration(entry: HarEntry): number {
  if (entry.time != null && entry.time > 0) return entry.time;
  const t = entry.timings;
  if (!t) return 0;
  return Math.max(
    0,
    (t.blocked ?? 0) +
      (t.dns ?? 0) +
      (t.connect ?? 0) +
      (t.send ?? 0) +
      (t.wait ?? 0) +
      (t.receive ?? 0),
  );
}

/** Wait time (TTFB for this request) */
function entryWait(entry: HarEntry): number {
  return Math.max(0, entry.timings?.wait ?? 0);
}

/** Transfer size in bytes */
function entrySize(entry: HarEntry): number {
  return entry.response?.content?.size ?? entry.response?.bodySize ?? 0;
}

/**
 * Extract committed requests from a HAR log.
 * Skips entries without a URL or with invalid timing.
 */
export function extractRequests(har: HarLog, domain: string): CommittedRequest[] {
  const entries = har.log?.entries ?? [];
  return entries
    .filter((e) => e.request?.url)
    .map((e) => {
      const url = e.request!.url!;
      const dur = entryDuration(e);
      const type = inferType(e.response?.content?.mimeType, url);
      return {
        url,
        type,
        startMs: e._startMs ?? 0,
        durationMs: dur,
        waitMs: entryWait(e),
        sizeBytes: entrySize(e),
        blocking: e._blocking ?? false,
        thirdParty: e._thirdParty ?? isThirdParty(url, domain),
        isLCP: e._lcp ?? false,
      } satisfies CommittedRequest;
    });
}

/**
 * Derive render-blocking resources from a request list.
 * A request is a blocker if it has blocking=true and has measurable duration.
 */
export function extractBlockers(requests: CommittedRequest[], domain: string): CommittedBlocker[] {
  return requests
    .filter((r) => r.blocking && r.durationMs > 0)
    .map((r) => ({
      name: urlFileName(r.url),
      host: urlHost(r.url, domain),
      url: r.url,
      type: r.type,
      sizeBytes: r.sizeBytes,
      blockMs: r.durationMs,
      thirdParty: r.thirdParty,
    }));
}
