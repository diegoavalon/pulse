/**
 * Extractor — converts raw sitespeed.io browsertime/HAR output into the
 * dashboard data contracts consumed by scorecard, trend, and detail views.
 *
 * Usage (in-memory, ideal for tests):
 *   import { extractSummary, extractDetail } from "extractor";
 *   const summary = extractSummary(browsertimeJson, coachJson, opts);
 *   const detail  = extractDetail(browsertimeJson, harJson, coachJson, screenshots, opts);
 *
 * Usage (filesystem):
 *   import { extractRun, pruneDetailRuns } from "extractor";
 *   const result = await extractRun("/data/homepage/mobile/2026-05-29T13-41-03", opts);
 *   await pruneDetailRuns("/data", 14);
 */

import type { SummaryRecord, Profile } from "utils";
import type { DetailRecord } from "utils";
import {
  extractPartialCWV,
  validateCWV,
  coerceCWV,
  extractTransfer,
  extractSitespeedVersion,
  extractRequestCounts,
  extractPageTiming,
} from "./cwv.js";
import { extractRequests, extractBlockers } from "./har.js";
import { extractCoachScore, extractCoachAdvice, deriveAdviceFromCWV } from "./coach.js";
import { pruneDetailRuns } from "./retention.js";
import type { BrowserTimeOutput, CoachOutput, HarLog } from "./types.js";

export type { BrowserTimeOutput, CoachOutput, HarLog } from "./types.js";
export {
  pruneDetailRuns,
  filterByRetention,
  parseRunId,
  runAgeInDays,
  shouldPrune,
} from "./retention.js";

// ---- extraction options ----------------------------------------------------

export interface ExtractionOptions {
  /** Stable page ID from urls.json */
  pageId: string;
  /** Human-readable page label */
  label: string;
  /** Canonical URL */
  url: string;
  /** Page group (e.g., "core", "medicare") */
  group: string;
  /** Profile dimension */
  profile: Profile;
  /** Run identifier in YYYY-MM-DDTHH-MM-SS format */
  runId: string;
  /** ISO 8601 UTC timestamp */
  timestamp: string;
  /** Number of iterations run */
  iterations: number;
  /** Domain string for third-party detection (e.g., "ehealthinsurance.com") */
  domain?: string;
}

export interface ExtractionResult {
  summary: SummaryRecord;
  detail: DetailRecord;
  /** Non-fatal warnings from the extraction (e.g., missing optional fields) */
  warnings: string[];
}

export interface ExtractionError {
  errors: string[];
}

export interface PersistResult {
  summaryPath: string;
  detailPath: string;
  screenshotsCopied: string[];
  prunedDetailRuns: string[];
  warnings: string[];
}

// ---- in-memory extraction --------------------------------------------------

/**
 * Build a SummaryRecord from raw browsertime + optional coach output.
 * Returns ExtractionError if required CWV metrics are missing or invalid.
 */
export function extractSummary(
  bt: BrowserTimeOutput,
  coach: CoachOutput | null,
  opts: ExtractionOptions,
): SummaryRecord | ExtractionError {
  const partial = extractPartialCWV(bt);
  const errs = validateCWV(partial);
  if (errs.length > 0) return { errors: errs };

  const cwv = coerceCWV(partial);
  const transfer = extractTransfer(bt);
  const { requests, thirdPartyRequests } = extractRequestCounts(bt);

  return {
    id: opts.pageId,
    label: opts.label,
    url: opts.url,
    profile: opts.profile,
    timestamp: opts.timestamp,
    iterations: opts.iterations,
    cwv,
    coachScore: extractCoachScore(coach),
    transfer,
    requests,
    thirdPartyRequests,
    sitespeedVersion: extractSitespeedVersion(bt),
    runId: opts.runId,
    schemaVersion: "1",
  };
}

/**
 * Build a DetailRecord from raw browsertime + optional HAR + optional coach output.
 * Always succeeds; missing optional inputs (HAR, screenshots) produce empty arrays.
 */
export function extractDetail(
  bt: BrowserTimeOutput,
  har: HarLog | null,
  coach: CoachOutput | null,
  screenshotPaths: string[],
  opts: ExtractionOptions,
): { detail: DetailRecord; warnings: string[] } {
  const partial = extractPartialCWV(bt);
  const warnings = validateCWV(partial);
  const cwv = coerceCWV(partial);
  const domain = opts.domain ?? "ehealthinsurance.com";

  const requests = har ? extractRequests(har, domain) : [];
  const blockers = extractBlockers(requests, domain);
  const transfer = extractTransfer(bt);
  const { thirdPartyRequests } = extractRequestCounts(bt);
  const timing = extractPageTiming(cwv);

  const advice =
    coach && coach.median?.coachAdvice?.performance?.advice
      ? extractCoachAdvice(coach)
      : deriveAdviceFromCWV(cwv);

  return {
    detail: {
      id: opts.pageId,
      profile: opts.profile,
      runId: opts.runId,
      timestamp: opts.timestamp,
      timing,
      requests,
      blockers,
      transfer,
      thirdPartyRequests,
      advice,
      hasScreenshots: screenshotPaths.length > 0,
      screenshotPaths,
      schemaVersion: "1",
    },
    warnings,
  };
}

/**
 * Extract both summary and detail from a single set of raw inputs.
 * Returns ExtractionError if required CWV metrics are absent.
 */
export function extractRaw(
  bt: BrowserTimeOutput,
  har: HarLog | null,
  coach: CoachOutput | null,
  screenshotPaths: string[],
  opts: ExtractionOptions,
): ExtractionResult | ExtractionError {
  const summaryResult = extractSummary(bt, coach, opts);
  if ("errors" in summaryResult) return summaryResult;

  const { detail, warnings } = extractDetail(bt, har, coach, screenshotPaths, opts);
  return { summary: summaryResult, detail, warnings };
}

// ---- filesystem extraction -------------------------------------------------

/**
 * Read and extract from a run directory produced by sitespeed.io.
 *
 * Expected directory layout:
 *   <runDir>/
 *     browsertime.json   (required)
 *     coach.json         (optional)
 *     har.json           (optional)
 *     screenshots/       (optional directory)
 *       *.jpg / *.png
 */
export async function extractRun(
  runDir: string,
  opts: ExtractionOptions,
): Promise<ExtractionResult | ExtractionError> {
  const { readFile, readdir, stat } = await import("node:fs/promises");
  const { join } = await import("node:path");

  // browsertime.json — required
  let bt: BrowserTimeOutput;
  try {
    const raw = await readFile(join(runDir, "browsertime.json"), "utf8");
    bt = JSON.parse(raw) as BrowserTimeOutput;
  } catch (err) {
    return { errors: [`Cannot read browsertime.json: ${String(err)}`] };
  }

  // coach.json — optional
  let coach: CoachOutput | null = null;
  try {
    const raw = await readFile(join(runDir, "coach.json"), "utf8");
    coach = JSON.parse(raw) as CoachOutput;
  } catch {
    // coach.json absent — will derive advice from CWV
  }

  // har.json — optional
  let har: HarLog | null = null;
  try {
    const raw = await readFile(join(runDir, "har.json"), "utf8");
    har = JSON.parse(raw) as HarLog;
  } catch {
    // har.json absent — waterfall will be empty
  }

  // screenshots directory — optional
  const screenshotPaths: string[] = [];
  try {
    const screenshotsDir = join(runDir, "screenshots");
    const s = await stat(screenshotsDir);
    if (s.isDirectory()) {
      const files = await readdir(screenshotsDir);
      for (const f of files) {
        if (/\.(jpg|jpeg|png|webp)$/i.test(f)) {
          screenshotPaths.push(join("screenshots", f));
        }
      }
    }
  } catch {
    // screenshots directory absent — hasScreenshots will be false
  }

  return extractRaw(bt, har, coach, screenshotPaths, opts);
}

/**
 * Extract from a raw run directory and persist committed outputs:
 *   data/<pageId>/<profile>/summary.json
 *   data/<pageId>/<profile>/<runId>/detail.json
 *   data/<pageId>/<profile>/<runId>/screenshots/*
 *
 * Summary history is append-only by runId (upsert semantics); detail runs are
 * pruned by retention policy after write.
 */
export async function extractAndPersistRun(
  runDir: string,
  dataRoot: string,
  opts: ExtractionOptions,
  retentionDays = 14,
): Promise<PersistResult | ExtractionError> {
  const extracted = await extractRun(runDir, opts);
  if ("errors" in extracted) return extracted;

  const { mkdir, writeFile, copyFile } = await import("node:fs/promises");
  const { join, dirname } = await import("node:path");

  const warnings = [...extracted.warnings];
  const profilePath = join(dataRoot, opts.pageId, opts.profile);
  const runOutPath = join(profilePath, opts.runId);
  const detailPath = join(runOutPath, "detail.json");
  const summaryPath = join(profilePath, "summary.json");
  const screenshotsCopied: string[] = [];

  await mkdir(runOutPath, { recursive: true });
  await writeFile(detailPath, JSON.stringify(extracted.detail, null, 2) + "\n", "utf8");

  for (const relPath of extracted.detail.screenshotPaths) {
    const src = join(runDir, relPath);
    const dest = join(runOutPath, relPath);
    try {
      await mkdir(dirname(dest), { recursive: true });
      await copyFile(src, dest);
      screenshotsCopied.push(relPath);
    } catch (err) {
      warnings.push(`Could not copy screenshot ${relPath}: ${String(err)}`);
    }
  }

  const currentSummary = await readSummaryHistory(summaryPath, warnings);
  const withoutCurrentRun = currentSummary.filter(
    (record) => record.runId !== extracted.summary.runId,
  );
  const nextSummary = [...withoutCurrentRun, extracted.summary].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp),
  );
  await mkdir(profilePath, { recursive: true });
  await writeFile(summaryPath, JSON.stringify(nextSummary, null, 2) + "\n", "utf8");

  const pruneResult = await pruneDetailRuns(dataRoot, retentionDays);
  for (const err of pruneResult.errors) {
    warnings.push(`Retention prune failed for ${err.path}: ${err.error}`);
  }

  return {
    summaryPath,
    detailPath,
    screenshotsCopied,
    prunedDetailRuns: pruneResult.pruned,
    warnings,
  };
}

async function readSummaryHistory(
  summaryPath: string,
  warnings: string[],
): Promise<SummaryRecord[]> {
  const { readFile } = await import("node:fs/promises");

  try {
    const raw = await readFile(summaryPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      warnings.push("Existing summary.json was not an array; resetting history.");
      return [];
    }
    const valid = parsed.filter(isSummaryRecord);
    if (valid.length !== parsed.length) {
      warnings.push("Existing summary.json contained invalid records; skipped malformed entries.");
    }
    return valid;
  } catch {
    return [];
  }
}

function isSummaryRecord(value: unknown): value is SummaryRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.profile === "string" &&
    typeof record.timestamp === "string" &&
    typeof record.runId === "string"
  );
}
