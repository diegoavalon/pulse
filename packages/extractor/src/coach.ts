/**
 * Extract coach score and ranked advice from sitespeed.io coach output.
 * Returns defaults when coach data is absent.
 */

import type { CommittedAdvice, AdviceSeverity } from "utils";
import type { CoachOutput } from "./types.js";
import type { CWV } from "utils";
import { rateMetric } from "utils";

/** Extract coach score (0-100). Returns 0 when absent. */
export function extractCoachScore(coach: CoachOutput | null): number {
  const score = coach?.median?.coachAdvice?.score;
  if (typeof score !== "number" || score < 0 || score > 100) return 0;
  return Math.round(score);
}

/** Map a coach score fraction (0-1) to advice severity */
function scoreToSeverity(score: number): AdviceSeverity {
  if (score < 0.5) return "high";
  if (score < 0.75) return "medium";
  return "low";
}

/**
 * Extract advice items from the sitespeed.io coach performance advice block.
 * Each advice item maps to a CommittedAdvice with severity derived from its score.
 */
export function extractCoachAdvice(coach: CoachOutput | null): CommittedAdvice[] {
  const adviceMap = coach?.median?.coachAdvice?.performance?.advice;
  if (!adviceMap) return [];

  const items: CommittedAdvice[] = [];
  for (const [key, item] of Object.entries(adviceMap)) {
    if (!item?.advice || !item.weight || item.weight < 2) continue;
    const score = typeof item.score === "number" ? item.score / 100 : 0.5;
    items.push({
      severity: scoreToSeverity(score),
      metric: mapAdviceKeyToMetric(key),
      title: formatAdviceTitle(key),
      description: String(item.advice),
      savingsMs: null,
    });
  }

  // Sort: high first, then medium, then low
  const RANK: Record<AdviceSeverity, number> = { high: 0, medium: 1, low: 2 };
  items.sort((a, b) => RANK[a.severity] - RANK[b.severity]);
  return items;
}

/**
 * Derive fallback advice from CWV metric ratings when coach output is unavailable.
 * Covers the most actionable headline metrics.
 */
export function deriveAdviceFromCWV(cwv: CWV): CommittedAdvice[] {
  const items: CommittedAdvice[] = [];

  if (rateMetric("LCP", cwv.LCP) !== "good") {
    items.push({
      severity: rateMetric("LCP", cwv.LCP) === "poor" ? "high" : "medium",
      metric: "LCP",
      title: "Preload the LCP image",
      description:
        'The largest element was fetched at low priority. Add <link rel="preload"> and fetchpriority="high".',
      savingsMs: Math.round(cwv.LCP * 0.18),
    });
  }
  if (rateMetric("CLS", cwv.CLS) !== "good") {
    items.push({
      severity: rateMetric("CLS", cwv.CLS) === "poor" ? "high" : "medium",
      metric: "CLS",
      title: "Reserve space for late-loading content",
      description:
        "Set explicit width/height on images and reserve height for injected ad slots to prevent layout shifts.",
      savingsMs: null,
    });
  }
  if (rateMetric("TBT", cwv.TBT) !== "good") {
    items.push({
      severity: rateMetric("TBT", cwv.TBT) === "poor" ? "high" : "medium",
      metric: "TBT",
      title: "Break up long main-thread tasks",
      description:
        "Third-party tags add blocking time. Load them via a web worker or defer to idle.",
      savingsMs: Math.round(cwv.TBT * 0.5),
    });
  }
  items.push({
    severity: "low",
    metric: "TTFB",
    title: "Enable Brotli + long-lived caching on static assets",
    description: "Add Cache-Control: max-age=31536000, immutable to hashed JS/CSS bundles.",
    savingsMs: null,
  });

  return items;
}

// ---- private helpers -------------------------------------------------------

function mapAdviceKeyToMetric(key: string): string {
  const k = key.toLowerCase();
  if (k.includes("lcp") || k.includes("paint") || k.includes("render")) return "LCP";
  if (k.includes("cls") || k.includes("layout") || k.includes("shift")) return "CLS";
  if (k.includes("tbt") || k.includes("blocking") || k.includes("task")) return "TBT";
  if (k.includes("fcp") || k.includes("first")) return "FCP";
  if (k.includes("ttfb") || k.includes("byte")) return "TTFB";
  if (k.includes("cache") || k.includes("expire")) return "TTFB";
  return "General";
}

function formatAdviceTitle(key: string): string {
  // Convert camelCase/PascalCase coach key to readable title
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
