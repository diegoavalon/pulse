/**
 * Summary data contract — Tier 1 committed records for trends.
 * Units are explicit in field names or comments.
 */

export type Profile = "mobile" | "desktop";

/** Core Web Vitals metrics */
export interface CWV {
  /** Largest Contentful Paint in milliseconds */
  LCP: number;
  /** Cumulative Layout Shift (unitless) */
  CLS: number;
  /** Total Blocking Time in milliseconds (lab proxy for INP) */
  TBT: number;
  /** First Contentful Paint in milliseconds */
  FCP: number;
  /** Time to First Byte in milliseconds */
  TTFB: number;
  /** Interaction to Next Paint in milliseconds (null in MVP; requires RUM) */
  INP: number | null;
}

/** Transfer sizes by resource type */
export interface Transfer {
  /** Total transfer in bytes */
  total: number;
  /** JavaScript transfer in bytes */
  js: number;
  /** CSS transfer in bytes */
  css: number;
  /** Image transfer in bytes */
  image: number;
  /** Other resources in bytes */
  other: number;
}

/**
 * Single run summary record.
 * One record per page/profile/run; appended to data/<id>/<profile>/summary.json
 */
export interface SummaryRecord {
  /** Stable page ID (e.g., "homepage") from urls.json */
  id: string;
  /** Human-readable page label */
  label: string;
  /** Canonical URL tracked */
  url: string;
  /** Profile dimension: mobile (4g) or desktop (cable) */
  profile: Profile;
  /** ISO 8601 UTC timestamp (e.g., "2026-05-29T13:41:03Z") */
  timestamp: string;
  /** Number of iterations (fixed at 3 for MVP) */
  iterations: number;
  /** Core Web Vitals metrics */
  cwv: CWV;
  /** sitespeed.io coach score (0-100) */
  coachScore: number;
  /** Transfer sizes by resource type */
  transfer: Transfer;
  /** Total HTTP requests */
  requests: number;
  /** Third-party HTTP requests */
  thirdPartyRequests: number;
  /** sitespeed.io version (e.g., "41.2.0") */
  sitespeedVersion: string;
  /** Run identifier in YYYY-MM-DDTHH-MM-SS format */
  runId: string;
  /** Optional schema version for future migrations */
  schemaVersion?: string;
}

/**
 * Profile-aware time series for a single page.
 * Each profile (mobile/desktop) maintains independent history.
 */
export interface PageHistory {
  /** Stable page ID */
  id: string;
  /** Human-readable label */
  label: string;
  /** Canonical URL */
  url: string;
  /** Page group (e.g., "Acquisition", "Shopping") */
  group: string;
  /** Mobile profile time series (chronological order, oldest first) */
  mobile: SummaryRecord[];
  /** Desktop profile time series (chronological order, oldest first) */
  desktop: SummaryRecord[];
}

/**
 * Complete trend history catalog for all tracked pages.
 * Top-level index keyed by page ID.
 */
export interface TrendCatalog {
  /** Map of page ID to profile-aware history */
  pages: Record<string, PageHistory>;
  /** Last update timestamp ISO 8601 UTC */
  lastUpdated: string;
  /** Total number of tracked pages */
  pageCount: number;
}

/**
 * Latest summary snapshot for dashboard scorecard.
 * Derived from the most recent SummaryRecord per page/profile.
 */
export interface LatestSnapshot {
  /** Page ID */
  id: string;
  /** Page label */
  label: string;
  /** Page group */
  group: string;
  /** Canonical URL */
  url: string;
  /** Latest mobile summary (null if no mobile runs exist) */
  mobile: SummaryRecord | null;
  /** Latest desktop summary (null if no desktop runs exist) */
  desktop: SummaryRecord | null;
}

/**
 * Extract the latest summary for each page/profile from a TrendCatalog.
 * Used to derive scorecard state and trend deltas.
 */
export function latestSnapshots(catalog: TrendCatalog): LatestSnapshot[] {
  return Object.values(catalog.pages).map((pg) => ({
    id: pg.id,
    label: pg.label,
    group: pg.group,
    url: pg.url,
    mobile: pg.mobile.length > 0 ? pg.mobile[pg.mobile.length - 1] : null,
    desktop: pg.desktop.length > 0 ? pg.desktop[pg.desktop.length - 1] : null,
  }));
}

/**
 * Extract time-series data for charting a specific metric.
 * Returns arrays of { timestamp, value } pairs for the requested profile.
 */
export interface MetricPoint {
  /** ISO 8601 UTC timestamp */
  timestamp: string;
  /** Metric value (units depend on metric type) */
  value: number;
}

export function extractMetricSeries(
  history: PageHistory,
  profile: Profile,
  metric: keyof CWV,
): MetricPoint[] {
  return history[profile].map((rec) => ({
    timestamp: rec.timestamp,
    value: rec.cwv[metric] ?? 0,
  }));
}

export function extractScoreSeries(history: PageHistory, profile: Profile): MetricPoint[] {
  return history[profile].map((rec) => ({
    timestamp: rec.timestamp,
    value: rec.coachScore,
  }));
}
