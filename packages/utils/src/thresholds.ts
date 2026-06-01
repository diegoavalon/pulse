/**
 * Threshold classification for Core Web Vitals and Coach Score.
 * Based on Google Web Vitals standards and sitespeed.io scoring.
 */

import type { CWV } from "./summary.js";

/** Metric rating: good, needs improvement (ni), poor, or not available (na) */
export type Rating = "good" | "ni" | "poor" | "na";

/** Threshold definition with unit and direction */
export interface ThresholdDef {
  /** Upper bound for "good" rating */
  good: number;
  /** Upper bound for "needs improvement" rating; above this is "poor" */
  ni: number;
  /** Unit string for display (e.g., "ms", "", "bytes") */
  unit: string;
  /** True if lower values are better (default true for CWV) */
  lowerBetter: boolean;
}

/**
 * Google Web Vitals thresholds.
 * LCP ≤2.5s good, ≤4s ni, >4s poor
 * CLS ≤0.1 good, ≤0.25 ni, >0.25 poor
 * TBT ≤200ms good, ≤600ms ni, >600ms poor (lab proxy for INP)
 * FCP ≤1.8s good, ≤3s ni, >3s poor
 * TTFB ≤800ms good, ≤1.8s ni, >1.8s poor
 * INP ≤200ms good, ≤500ms ni, >500ms poor (RUM-only; Phase 2)
 *
 * Refs:
 * - https://web.dev/vitals/
 * - https://web.dev/articles/inp
 * - https://web.dev/articles/tbt
 */
export const CWV_THRESHOLDS: Record<keyof CWV, ThresholdDef> = {
  LCP: { good: 2500, ni: 4000, unit: "ms", lowerBetter: true },
  CLS: { good: 0.1, ni: 0.25, unit: "", lowerBetter: true },
  TBT: { good: 200, ni: 600, unit: "ms", lowerBetter: true },
  FCP: { good: 1800, ni: 3000, unit: "ms", lowerBetter: true },
  TTFB: { good: 800, ni: 1800, unit: "ms", lowerBetter: true },
  INP: { good: 200, ni: 500, unit: "ms", lowerBetter: true },
};

/** Headline metrics for scorecard status (worst of these determines page rating) */
export const HEADLINE_METRICS: (keyof CWV)[] = ["LCP", "CLS", "TBT"];

/**
 * Classify a single metric value using Google Web Vitals thresholds.
 * Returns "na" for null/undefined (e.g., INP in MVP).
 */
export function rateMetric(metric: keyof CWV, value: number | null | undefined): Rating {
  if (value === null || value === undefined) return "na";
  const t = CWV_THRESHOLDS[metric];
  if (!t) return "na";

  // Test boundary values exactly
  if (value <= t.good) return "good";
  if (value <= t.ni) return "ni";
  return "poor";
}

/**
 * Classify coach score (0-100) into rating bands.
 * ≥80 good, ≥50 ni, <50 poor
 */
export function rateCoachScore(score: number): Rating {
  if (score >= 80) return "good";
  if (score >= 50) return "ni";
  return "poor";
}

/**
 * Determine overall page status from CWV.
 * Returns the worst rating among headline metrics (LCP, CLS, TBT).
 */
export function ratePageStatus(cwv: CWV): Rating {
  const RANK: Record<Rating, number> = { good: 0, ni: 1, poor: 2, na: -1 };
  let worst: Rating = "good";

  for (const m of HEADLINE_METRICS) {
    const r = rateMetric(m, cwv[m]);
    if (RANK[r] > RANK[worst]) worst = r;
  }

  return worst;
}

/**
 * Format metric value with appropriate unit and precision.
 */
export function formatMetricValue(metric: keyof CWV, value: number | null): string {
  if (value === null || value === undefined) return "—";

  if (metric === "CLS") {
    // CLS is unitless, display to 3 decimal places
    return value.toFixed(3);
  }

  // All other CWV metrics are in milliseconds
  if (value >= 1000) {
    // Display as seconds if ≥1s, remove trailing zeros
    return (value / 1000).toFixed(2).replace(/\.?0+$/, "") + " s";
  }
  return Math.round(value) + " ms";
}

/**
 * Format transfer size in bytes to human-readable units.
 */
export function formatBytes(bytes: number): string {
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
  if (bytes >= 1e3) return Math.round(bytes / 1e3) + " KB";
  return bytes + " B";
}

/**
 * Validate that a metric value is within expected bounds.
 * Returns true if valid, false otherwise.
 * Used to catch extraction errors or corrupt data.
 */
export function validateMetricValue(metric: keyof CWV, value: number | null): boolean {
  if (metric === "INP" && value === null) return true; // INP is null in MVP
  if (value === null || value === undefined) return false;
  if (value < 0) return false; // No negative timings
  if (metric === "CLS") {
    // CLS typically 0-1, but can exceed 1 in pathological cases
    return value >= 0 && value < 10;
  }
  // Timing metrics should be reasonable (< 60s)
  return value >= 0 && value < 60000;
}

/**
 * Validate coach score is within expected range (0-100).
 */
export function validateCoachScore(score: number): boolean {
  return score >= 0 && score <= 100;
}
