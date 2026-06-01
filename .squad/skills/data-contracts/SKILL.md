# Data Contract Design for Time-Series Performance Data

**Skill Owner:** Livingston (Data/AI Engineer)  
**First Applied:** Issue #5 (Profile-Aware Trend History)  
**Status:** Active

## Pattern

Design append-friendly, type-safe data contracts for performance monitoring time-series that enforce profile isolation, explicit units, and graceful degradation.

## When to Apply

Use this pattern when:

- Building time-series data structures for performance metrics
- Supporting multiple independent dimensions (e.g., mobile/desktop profiles)
- Balancing lightweight summary records with rich detail retention
- Preparing data for charting libraries (Chart.js, D3, etc.)
- Ensuring extraction scripts and UI consume the same contract

## Key Principles

### 1. Profile Isolation

**Problem:** Mobile and desktop profiles have non-comparable network/CPU conditions. Mixing them produces misleading trends.

**Solution:**

```typescript
interface PageHistory {
  id: string;
  mobile: SummaryRecord[]; // Independent mobile time series
  desktop: SummaryRecord[]; // Independent desktop time series
}
```

**Validation:** Test that querying mobile history returns zero desktop records.

### 2. Explicit Units

**Problem:** Ambiguous numeric fields (e.g., `lcp: 2500`) lead to "is this seconds or milliseconds?" bugs.

**Solution:**

- Use field name conventions: `LCP` (always ms), `CLS` (always unitless)
- Add TypeScript comments: `/** Largest Contentful Paint in milliseconds */`
- Never wrap in unit objects: `{ value: 2500, unit: "ms" }` adds extraction complexity

**Example:**

```typescript
interface CWV {
  /** Largest Contentful Paint in milliseconds */
  LCP: number;
  /** Cumulative Layout Shift (unitless) */
  CLS: number;
  // ...
}
```

### 3. Append-Friendly Structure

**Problem:** Time-series sorted at write time require re-sorting on every append, slowing consolidation.

**Solution:**

- Store chronological arrays (oldest first)
- Append new records to end
- No sorting required

**Example:**

```typescript
// Good: chronological append
history.mobile.push(newRecord); // O(1)

// Bad: sorted insert
history.mobile.push(newRecord);
history.mobile.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // O(n log n)
```

### 4. Graceful Degradation

**Problem:** Detail data expires (14-day rolling), but trends must show all historical runs.

**Solution:**

- Summary records never reference detail
- UI checks detail availability separately
- Trend charts work with summary-only data

**Example:**

```typescript
interface SummaryRecord {
  // No detail dependency — fully self-contained
  cwv: CWV;
  coachScore: number;
  // ...
}

// UI layer handles detail expiration
const hasDetail = detailExists(pageId, profile, timestamp);
const fallback = hasDetail ? "View Detail" : "Summary Only (detail expired)";
```

### 5. Type-Safe Thresholds

**Problem:** Hardcoded threshold checks scatter across codebase, leading to inconsistent classification.

**Solution:**

- Centralize thresholds with units
- Pure classification functions
- Test boundary values

**Example:**

```typescript
const CWV_THRESHOLDS: Record<keyof CWV, ThresholdDef> = {
  LCP: { good: 2500, ni: 4000, unit: "ms", lowerBetter: true },
  // ...
};

function rateMetric(metric: keyof CWV, value: number | null): Rating {
  if (value === null) return "na";
  const t = CWV_THRESHOLDS[metric];
  if (value <= t.good) return "good";
  if (value <= t.ni) return "ni";
  return "poor";
}

// Test exact boundaries
test("LCP 2500ms is good", () => expect(rateMetric("LCP", 2500)).toBe("good"));
test("LCP 2501ms is ni", () => expect(rateMetric("LCP", 2501)).toBe("ni"));
```

### 6. Chart-Ready Extraction

**Problem:** Chart libraries expect `{ x, y }` arrays, requiring transformation at render time.

**Solution:**

- Provide pre-transformation helpers
- Return chart-ready structures

**Example:**

```typescript
function extractMetricSeries(
  history: PageHistory,
  profile: Profile,
  metric: keyof CWV,
): MetricPoint[] {
  return history[profile].map((rec) => ({
    timestamp: rec.timestamp, // Chart.js x-axis
    value: rec.cwv[metric], // Chart.js y-axis
  }));
}

// Usage in Chart.js component
const lcpData = extractMetricSeries(pageHistory, "mobile", "LCP");
chart.data.datasets[0].data = lcpData;
```

## Testing Checklist

- [ ] Profile isolation: mobile and desktop histories never mix
- [ ] Boundary values: test exact threshold boundaries (e.g., LCP 2500ms, 2501ms, 4000ms, 4001ms)
- [ ] Null handling: metrics that may be null (e.g., INP in MVP) return "na" rating
- [ ] Formatting: units display correctly ("1.54 s", "888 ms", "0.769" for CLS)
- [ ] Append-only: new records added to end of chronological arrays
- [ ] Latest extraction: `latestSnapshots` returns most recent run per profile
- [ ] Time-series extraction: chart helpers return correct `{ timestamp, value }[]` format

## Common Pitfalls

**Mixing Profiles:**

```typescript
// BAD: Combined profile array
interface PageHistory {
  records: SummaryRecord[]; // mobile and desktop mixed!
}

// GOOD: Separate profile arrays
interface PageHistory {
  mobile: SummaryRecord[];
  desktop: SummaryRecord[];
}
```

**Ambiguous Units:**

```typescript
// BAD: Is this seconds or milliseconds?
interface CWV {
  lcp: number;
}

// GOOD: Unit explicit in field name and comment
interface CWV {
  /** Largest Contentful Paint in milliseconds */
  LCP: number;
}
```

**Detail Dependency:**

```typescript
// BAD: Summary references detail
interface SummaryRecord {
  detailPath: string; // Creates dependency on 14-day retention
}

// GOOD: Summary is self-contained
interface SummaryRecord {
  cwv: CWV; // No detail dependency
}
```

## Example Implementation

See `packages/utils/src/summary.ts` and `packages/utils/src/thresholds.ts` for full reference implementation.

## References

- Issue #5: https://github.com/diegoavalon/pulse/issues/5
- Google Web Vitals: https://web.dev/vitals/
- Chart.js Data Structures: https://www.chartjs.org/docs/latest/general/data-structures.html
