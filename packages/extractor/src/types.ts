/**
 * Raw sitespeed.io / browsertime output shapes.
 * Fields are optional throughout — real runs omit sections when unavailable.
 */

// ---- browsertime.json -------------------------------------------------------

export interface BrowserTimeStatTimings {
  largestContentfulPaint?: { median?: number };
  firstContentfulPaint?: { median?: number };
  timeToFirstByte?: { median?: number };
  cumulativeLayoutShift?: { median?: number };
  cpu?: {
    longTasks?: {
      totalBlockingTime?: { median?: number };
    };
  };
}

export interface BrowserTimeStatTransfer {
  javascript?: { median?: number };
  css?: { median?: number };
  image?: { median?: number };
  other?: { median?: number };
  total?: { median?: number };
}

export interface BrowserTimeStatPageInfo {
  requests?: { median?: number };
  thirdParty?: { requests?: { median?: number } };
}

export interface BrowserTimeStatistics {
  timings?: BrowserTimeStatTimings;
  transfer?: BrowserTimeStatTransfer;
  pageinfo?: BrowserTimeStatPageInfo;
}

export interface BrowserTimeInfo {
  /** sitespeed.io version */
  "sitespeed.io"?: { version?: string };
  browsertime?: { version?: string };
  timestamp?: string;
}

/** Root of a browsertime.json run file */
export interface BrowserTimeOutput {
  info?: BrowserTimeInfo;
  /** Page URL */
  url?: string;
  /** ISO 8601 run timestamp */
  timestamp?: string;
  statistics?: BrowserTimeStatistics;
}

// ---- coach.json (sitespeed.io coach plugin) ---------------------------------

export interface CoachAdviceItem {
  score?: number;
  advice?: string;
  weight?: number;
}

export interface CoachPerformanceAdvice {
  score?: number;
  advice?: Record<string, CoachAdviceItem>;
}

export interface CoachAdviceSet {
  score?: number;
  performance?: CoachPerformanceAdvice;
}

/** Root of a coach.json run file */
export interface CoachOutput {
  median?: {
    coachAdvice?: CoachAdviceSet;
  };
}

// ---- HAR (HTTP Archive 1.2) ------------------------------------------------

export interface HarEntryTimings {
  blocked?: number;
  dns?: number;
  connect?: number;
  send?: number;
  /** Time to first byte (server wait) in ms */
  wait?: number;
  receive?: number;
  ssl?: number;
}

export interface HarRequest {
  method?: string;
  url?: string;
  httpVersion?: string;
  headers?: Array<{ name: string; value: string }>;
  bodySize?: number;
}

export interface HarResponse {
  status?: number;
  content?: {
    size?: number;
    mimeType?: string;
    compression?: number;
  };
  bodySize?: number;
  redirectURL?: string;
}

/** Single HAR request entry */
export interface HarEntry {
  startedDateTime?: string;
  /** Offset from page load start in ms */
  _initiatorType?: string;
  /** Whether this request blocked first paint (sitespeed extension) */
  _blocking?: boolean;
  /** Whether this is a third-party request (sitespeed extension) */
  _thirdParty?: boolean;
  /** Whether this was the LCP resource (sitespeed extension) */
  _lcp?: boolean;
  /** Offset from page navigation start in ms (sitespeed extension) */
  _startMs?: number;
  request?: HarRequest;
  response?: HarResponse;
  timings?: HarEntryTimings;
  time?: number;
}

/** Root of a HAR file */
export interface HarLog {
  log?: {
    entries?: HarEntry[];
    pages?: Array<{ id?: string; startedDateTime?: string }>;
  };
}
