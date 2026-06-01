/**
 * Extract Core Web Vitals from browsertime statistics.
 * All headline metrics (LCP, CLS, TBT, FCP, TTFB) are extracted from
 * statistics.timings medians. INP is always null in MVP (requires RUM).
 */

import type { CWV, Transfer } from "utils";
import type { BrowserTimeOutput } from "./types.js";

/** Nullable CWV for extraction — required fields may be missing in raw data */
export interface PartialCWV {
  LCP: number | null;
  CLS: number | null;
  TBT: number | null;
  FCP: number | null;
  TTFB: number | null;
  INP: null;
}

/**
 * Extract CWV metrics from browsertime statistics.
 * Returns null for individual metrics that are absent in the raw output.
 */
export function extractPartialCWV(bt: BrowserTimeOutput): PartialCWV {
  const t = bt.statistics?.timings;
  return {
    LCP: t?.largestContentfulPaint?.median ?? null,
    CLS: t?.cumulativeLayoutShift?.median ?? null,
    TBT: t?.cpu?.longTasks?.totalBlockingTime?.median ?? null,
    FCP: t?.firstContentfulPaint?.median ?? null,
    TTFB: t?.timeToFirstByte?.median ?? null,
    INP: null,
  };
}

/**
 * Validate that all required CWV metrics are present and within expected bounds.
 * Returns a list of error strings; empty array means valid.
 */
export function validateCWV(partial: PartialCWV): string[] {
  const errors: string[] = [];
  const required = ["LCP", "CLS", "TBT", "FCP", "TTFB"] as const;

  for (const m of required) {
    const v = partial[m];
    if (v === null || v === undefined) {
      errors.push(`Missing required metric: ${m}`);
      continue;
    }
    if (v < 0) {
      errors.push(`${m} is negative: ${v}`);
      continue;
    }
    if (m === "CLS" && v >= 10) {
      errors.push(`CLS is unreasonably large: ${v}`);
    } else if (m !== "CLS" && v >= 60000) {
      errors.push(`${m} exceeds 60 s: ${v}`);
    }
  }
  return errors;
}

/**
 * Promote PartialCWV to CWV, replacing null required fields with 0.
 * Call validateCWV first if you want strict handling.
 */
export function coerceCWV(partial: PartialCWV): CWV {
  return {
    LCP: partial.LCP ?? 0,
    CLS: partial.CLS ?? 0,
    TBT: partial.TBT ?? 0,
    FCP: partial.FCP ?? 0,
    TTFB: partial.TTFB ?? 0,
    INP: null,
  };
}

/** Extract transfer breakdown from browsertime statistics */
export function extractTransfer(bt: BrowserTimeOutput): Transfer {
  const tr = bt.statistics?.transfer;
  const js = tr?.javascript?.median ?? 0;
  const css = tr?.css?.median ?? 0;
  const image = tr?.image?.median ?? 0;
  const other = tr?.other?.median ?? 0;
  const total = tr?.total?.median ?? js + css + image + other;
  return { total, js, css, image, other };
}

/** Extract sitespeed version from browsertime info */
export function extractSitespeedVersion(bt: BrowserTimeOutput): string {
  return bt.info?.["sitespeed.io"]?.version ?? "unknown";
}

/** Extract request counts from browsertime statistics */
export function extractRequestCounts(bt: BrowserTimeOutput): {
  requests: number;
  thirdPartyRequests: number;
} {
  const pi = bt.statistics?.pageinfo;
  return {
    requests: pi?.requests?.median ?? 0,
    thirdPartyRequests: pi?.thirdParty?.requests?.median ?? 0,
  };
}

/**
 * Extract page timing markers for the detail record.
 * load is estimated as LCP * 1.55 + TTFB + 500ms when not directly available.
 */
export function extractPageTiming(cwv: CWV): {
  ttfb: number;
  fcp: number;
  lcp: number;
  dcl: number;
  load: number;
} {
  const load = Math.round(cwv.LCP * 1.55 + cwv.TTFB + 500);
  return {
    ttfb: cwv.TTFB,
    fcp: cwv.FCP,
    lcp: cwv.LCP,
    dcl: Math.round(cwv.FCP + (load - cwv.FCP) * 0.35),
    load,
  };
}
