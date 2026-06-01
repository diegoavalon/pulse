/**
 * Retained diagnostic detail contract — committed per-run records for detail views.
 * Pruned to the configured retention window (default 14 days).
 */

import type { Profile, Transfer } from "./summary.js";

export type ResourceType = "document" | "css" | "js" | "font" | "image" | "xhr" | "other";

/** Single HTTP request extracted from a HAR or browsertime session */
export interface CommittedRequest {
  /** Full resource URL */
  url: string;
  /** Resource content type bucket */
  type: ResourceType;
  /** Start offset from navigation start in milliseconds */
  startMs: number;
  /** Full request duration in milliseconds */
  durationMs: number;
  /** Time-to-first-byte for this request in milliseconds */
  waitMs: number;
  /** Transfer size in bytes */
  sizeBytes: number;
  /** True if this resource blocked first paint */
  blocking: boolean;
  /** True if the URL is from a third-party origin */
  thirdParty: boolean;
  /** True if this is the Largest Contentful Paint candidate resource */
  isLCP: boolean;
}

/** A render-blocking resource with additional diagnostic context */
export interface CommittedBlocker {
  /** File name (last path segment) */
  name: string;
  /** Hostname of the resource origin */
  host: string;
  /** Full resource URL */
  url: string;
  /** Content type */
  type: ResourceType;
  /** Transfer size in bytes */
  sizeBytes: number;
  /** Estimated blocking duration in milliseconds */
  blockMs: number;
  /** True if from a third-party origin */
  thirdParty: boolean;
}

export type AdviceSeverity = "high" | "medium" | "low";

/** Single coach advice item extracted from sitespeed.io coach output */
export interface CommittedAdvice {
  /** Severity of the issue */
  severity: AdviceSeverity;
  /** Affected metric (e.g., "LCP", "TBT") */
  metric: string;
  /** Short actionable title */
  title: string;
  /** Detailed description with specifics for this page */
  description: string;
  /** Estimated time savings in milliseconds (null when not quantifiable) */
  savingsMs: number | null;
}

/** Page load timing markers in milliseconds from navigation start */
export interface PageTiming {
  /** Time to First Byte */
  ttfb: number;
  /** First Contentful Paint */
  fcp: number;
  /** Largest Contentful Paint */
  lcp: number;
  /** DOMContentLoaded event */
  dcl: number;
  /** Full page load event */
  load: number;
}

/**
 * Retained diagnostic detail record for a single page/profile/run.
 * Written alongside summary records; pruned after retentionDays.
 * Path: data/<pageId>/<profile>/<runId>/detail.json
 */
export interface DetailRecord {
  /** Stable page ID from urls.json */
  id: string;
  /** Profile dimension */
  profile: Profile;
  /** Run identifier in YYYY-MM-DDTHH-MM-SS format */
  runId: string;
  /** ISO 8601 UTC timestamp */
  timestamp: string;
  /** Page load timing markers */
  timing: PageTiming;
  /** All HTTP requests captured in this run */
  requests: CommittedRequest[];
  /** Render-blocking resources derived from requests */
  blockers: CommittedBlocker[];
  /** Transfer breakdown by resource type */
  transfer: Transfer;
  /** Total third-party request count */
  thirdPartyRequests: number;
  /** Coach advice items ranked by severity */
  advice: CommittedAdvice[];
  /** Whether screenshots were captured for this run */
  hasScreenshots: boolean;
  /** Paths to screenshot files relative to the run directory */
  screenshotPaths: string[];
  /** Schema version for future migrations */
  schemaVersion?: string;
}
