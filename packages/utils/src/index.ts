// Summary data contract exports
export type {
  Profile,
  CWV,
  Transfer,
  SummaryRecord,
  PageHistory,
  TrendCatalog,
  LatestSnapshot,
  MetricPoint,
} from "./summary.js";

export { latestSnapshots, extractMetricSeries, extractScoreSeries } from "./summary.js";

// Detail diagnostic record exports
export type {
  ResourceType,
  CommittedRequest,
  CommittedBlocker,
  CommittedAdvice,
  AdviceSeverity,
  PageTiming,
  DetailRecord,
} from "./detail.js";

// Threshold and classification exports
export type { Rating, ThresholdDef } from "./thresholds.js";

export {
  CWV_THRESHOLDS,
  HEADLINE_METRICS,
  rateMetric,
  rateCoachScore,
  ratePageStatus,
  formatMetricValue,
  formatBytes,
  validateMetricValue,
  validateCoachScore,
} from "./thresholds.js";
