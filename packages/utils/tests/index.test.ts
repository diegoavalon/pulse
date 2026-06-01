import { expect, test, describe } from "vite-plus/test";
import {
  rateMetric,
  rateCoachScore,
  ratePageStatus,
  formatMetricValue,
  formatBytes,
  validateMetricValue,
  validateCoachScore,
  latestSnapshots,
  extractMetricSeries,
  extractScoreSeries,
  type CWV,
  type SummaryRecord,
  type TrendCatalog,
  type PageHistory,
} from "../src/index.js";

describe("Metric rating classification", () => {
  describe("rateMetric - LCP boundaries", () => {
    test("LCP ≤2500ms is good", () => {
      expect(rateMetric("LCP", 2500)).toBe("good");
      expect(rateMetric("LCP", 1500)).toBe("good");
      expect(rateMetric("LCP", 0)).toBe("good");
    });

    test("LCP 2501-4000ms is ni", () => {
      expect(rateMetric("LCP", 2501)).toBe("ni");
      expect(rateMetric("LCP", 3000)).toBe("ni");
      expect(rateMetric("LCP", 4000)).toBe("ni");
    });

    test("LCP >4000ms is poor", () => {
      expect(rateMetric("LCP", 4001)).toBe("poor");
      expect(rateMetric("LCP", 5500)).toBe("poor");
    });
  });

  describe("rateMetric - CLS boundaries", () => {
    test("CLS ≤0.1 is good", () => {
      expect(rateMetric("CLS", 0.1)).toBe("good");
      expect(rateMetric("CLS", 0.05)).toBe("good");
      expect(rateMetric("CLS", 0)).toBe("good");
    });

    test("CLS 0.101-0.25 is ni", () => {
      expect(rateMetric("CLS", 0.11)).toBe("ni");
      expect(rateMetric("CLS", 0.2)).toBe("ni");
      expect(rateMetric("CLS", 0.25)).toBe("ni");
    });

    test("CLS >0.25 is poor (homepage 0.769 case)", () => {
      expect(rateMetric("CLS", 0.26)).toBe("poor");
      expect(rateMetric("CLS", 0.769)).toBe("poor");
      expect(rateMetric("CLS", 1.2)).toBe("poor");
    });
  });

  describe("rateMetric - TBT boundaries", () => {
    test("TBT ≤200ms is good", () => {
      expect(rateMetric("TBT", 200)).toBe("good");
      expect(rateMetric("TBT", 100)).toBe("good");
      expect(rateMetric("TBT", 0)).toBe("good");
    });

    test("TBT 201-600ms is ni", () => {
      expect(rateMetric("TBT", 201)).toBe("ni");
      expect(rateMetric("TBT", 400)).toBe("ni");
      expect(rateMetric("TBT", 600)).toBe("ni");
    });

    test("TBT >600ms is poor", () => {
      expect(rateMetric("TBT", 601)).toBe("poor");
      expect(rateMetric("TBT", 820)).toBe("poor");
    });
  });

  describe("rateMetric - FCP boundaries", () => {
    test("FCP ≤1800ms is good", () => {
      expect(rateMetric("FCP", 1800)).toBe("good");
      expect(rateMetric("FCP", 1000)).toBe("good");
    });

    test("FCP 1801-3000ms is ni", () => {
      expect(rateMetric("FCP", 1801)).toBe("ni");
      expect(rateMetric("FCP", 2500)).toBe("ni");
      expect(rateMetric("FCP", 3000)).toBe("ni");
    });

    test("FCP >3000ms is poor", () => {
      expect(rateMetric("FCP", 3001)).toBe("poor");
    });
  });

  describe("rateMetric - TTFB boundaries", () => {
    test("TTFB ≤800ms is good", () => {
      expect(rateMetric("TTFB", 800)).toBe("good");
      expect(rateMetric("TTFB", 500)).toBe("good");
    });

    test("TTFB 801-1800ms is ni", () => {
      expect(rateMetric("TTFB", 801)).toBe("ni");
      expect(rateMetric("TTFB", 1200)).toBe("ni");
      expect(rateMetric("TTFB", 1800)).toBe("ni");
    });

    test("TTFB >1800ms is poor", () => {
      expect(rateMetric("TTFB", 1801)).toBe("poor");
    });
  });

  describe("rateMetric - INP (MVP null handling)", () => {
    test("INP null returns na", () => {
      expect(rateMetric("INP", null)).toBe("na");
      expect(rateMetric("INP", undefined)).toBe("na");
    });

    test("INP with value uses Phase 2 thresholds", () => {
      expect(rateMetric("INP", 200)).toBe("good");
      expect(rateMetric("INP", 350)).toBe("ni");
      expect(rateMetric("INP", 600)).toBe("poor");
    });
  });
});

describe("Coach score rating", () => {
  test("Score ≥80 is good", () => {
    expect(rateCoachScore(100)).toBe("good");
    expect(rateCoachScore(90)).toBe("good");
    expect(rateCoachScore(80)).toBe("good");
  });

  test("Score 50-79 is ni", () => {
    expect(rateCoachScore(79)).toBe("ni");
    expect(rateCoachScore(65)).toBe("ni");
    expect(rateCoachScore(50)).toBe("ni");
  });

  test("Score <50 is poor", () => {
    expect(rateCoachScore(49)).toBe("poor");
    expect(rateCoachScore(30)).toBe("poor");
    expect(rateCoachScore(0)).toBe("poor");
  });
});

describe("Page status (headline metrics)", () => {
  test("All good headline metrics → good", () => {
    const cwv: CWV = {
      LCP: 2000,
      CLS: 0.05,
      TBT: 100,
      FCP: 1500,
      TTFB: 600,
      INP: null,
    };
    expect(ratePageStatus(cwv)).toBe("good");
  });

  test("One poor headline metric → poor (homepage CLS 0.769 case)", () => {
    const cwv: CWV = {
      LCP: 1540,
      CLS: 0.769,
      TBT: 8,
      FCP: 1264,
      TTFB: 888,
      INP: null,
    };
    expect(ratePageStatus(cwv)).toBe("poor");
  });

  test("One ni headline metric → ni", () => {
    const cwv: CWV = {
      LCP: 3000,
      CLS: 0.05,
      TBT: 100,
      FCP: 1500,
      TTFB: 700,
      INP: null,
    };
    expect(ratePageStatus(cwv)).toBe("ni");
  });

  test("Non-headline poor metrics do not affect status", () => {
    const cwv: CWV = {
      LCP: 2000,
      CLS: 0.05,
      TBT: 100,
      FCP: 4000,
      TTFB: 2000,
      INP: null,
    };
    expect(ratePageStatus(cwv)).toBe("good");
  });
});

describe("Metric value formatting", () => {
  test("CLS formatted to 3 decimals", () => {
    expect(formatMetricValue("CLS", 0.769)).toBe("0.769");
    expect(formatMetricValue("CLS", 0.1)).toBe("0.100");
    expect(formatMetricValue("CLS", 0.05)).toBe("0.050");
  });

  test("Milliseconds <1s formatted as 'N ms'", () => {
    expect(formatMetricValue("LCP", 950)).toBe("950 ms");
    expect(formatMetricValue("TBT", 8)).toBe("8 ms");
    expect(formatMetricValue("TTFB", 888)).toBe("888 ms");
  });

  test("Milliseconds ≥1s formatted as 'N.NN s' with trailing zeros removed", () => {
    expect(formatMetricValue("LCP", 1540)).toBe("1.54 s");
    expect(formatMetricValue("LCP", 2500)).toBe("2.5 s");
    expect(formatMetricValue("LCP", 3000)).toBe("3 s");
  });

  test("Null values formatted as em dash", () => {
    expect(formatMetricValue("INP", null)).toBe("—");
    expect(formatMetricValue("LCP", null)).toBe("—");
  });
});

describe("Bytes formatting", () => {
  test("Bytes <1KB formatted as 'N B'", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(999)).toBe("999 B");
  });

  test("Bytes ≥1KB <1MB formatted as 'N KB'", () => {
    expect(formatBytes(1000)).toBe("1 KB");
    expect(formatBytes(42000)).toBe("42 KB");
    expect(formatBytes(900000)).toBe("900 KB");
  });

  test("Bytes ≥1MB formatted as 'N.N MB'", () => {
    expect(formatBytes(1000000)).toBe("1.0 MB");
    expect(formatBytes(2300000)).toBe("2.3 MB");
    expect(formatBytes(4600000)).toBe("4.6 MB");
  });
});

describe("Metric value validation", () => {
  test("Valid CWV timings accepted", () => {
    expect(validateMetricValue("LCP", 2500)).toBe(true);
    expect(validateMetricValue("TBT", 0)).toBe(true);
    expect(validateMetricValue("TTFB", 888)).toBe(true);
  });

  test("Valid CLS values accepted", () => {
    expect(validateMetricValue("CLS", 0.05)).toBe(true);
    expect(validateMetricValue("CLS", 0.769)).toBe(true);
    expect(validateMetricValue("CLS", 2.5)).toBe(true);
  });

  test("INP null is valid in MVP", () => {
    expect(validateMetricValue("INP", null)).toBe(true);
  });

  test("Negative values rejected", () => {
    expect(validateMetricValue("LCP", -100)).toBe(false);
    expect(validateMetricValue("CLS", -0.1)).toBe(false);
  });

  test("Excessive CLS values rejected (>10)", () => {
    expect(validateMetricValue("CLS", 10)).toBe(false);
    expect(validateMetricValue("CLS", 15)).toBe(false);
  });

  test("Excessive timing values rejected (>60s)", () => {
    expect(validateMetricValue("LCP", 60001)).toBe(false);
    expect(validateMetricValue("TBT", 100000)).toBe(false);
  });

  test("Null non-INP metrics rejected", () => {
    expect(validateMetricValue("LCP", null)).toBe(false);
    expect(validateMetricValue("CLS", null)).toBe(false);
  });
});

describe("Coach score validation", () => {
  test("Valid scores 0-100 accepted", () => {
    expect(validateCoachScore(0)).toBe(true);
    expect(validateCoachScore(50)).toBe(true);
    expect(validateCoachScore(100)).toBe(true);
  });

  test("Negative scores rejected", () => {
    expect(validateCoachScore(-1)).toBe(false);
  });

  test("Scores >100 rejected", () => {
    expect(validateCoachScore(101)).toBe(false);
  });
});

describe("Trend catalog data structures", () => {
  const mockSummary1: SummaryRecord = {
    id: "homepage",
    label: "Homepage",
    url: "https://www.qa.ehealthinsurance.com/",
    profile: "mobile",
    timestamp: "2026-05-28T10:00:00Z",
    iterations: 3,
    cwv: { LCP: 2000, CLS: 0.05, TBT: 100, FCP: 1500, TTFB: 600, INP: null },
    coachScore: 85,
    transfer: { total: 2000000, js: 800000, css: 100000, image: 700000, other: 400000 },
    requests: 90,
    thirdPartyRequests: 30,
    sitespeedVersion: "41.2.0",
    runId: "2026-05-28T10-00-00",
  };

  const mockSummary2: SummaryRecord = {
    ...mockSummary1,
    timestamp: "2026-05-29T10:00:00Z",
    cwv: { LCP: 1800, CLS: 0.04, TBT: 90, FCP: 1400, TTFB: 550, INP: null },
    coachScore: 88,
    runId: "2026-05-29T10-00-00",
  };

  const mockSummary3: SummaryRecord = {
    ...mockSummary1,
    profile: "desktop",
    timestamp: "2026-05-28T10:00:00Z",
    cwv: { LCP: 1200, CLS: 0.02, TBT: 30, FCP: 900, TTFB: 400, INP: null },
    coachScore: 95,
    runId: "2026-05-28T10-00-00",
  };

  const mockPageHistory: PageHistory = {
    id: "homepage",
    label: "Homepage",
    url: "https://www.qa.ehealthinsurance.com/",
    group: "Acquisition",
    mobile: [mockSummary1, mockSummary2],
    desktop: [mockSummary3],
  };

  const mockCatalog: TrendCatalog = {
    pages: { homepage: mockPageHistory },
    lastUpdated: "2026-05-29T10:00:00Z",
    pageCount: 1,
  };

  test("latestSnapshots extracts most recent per profile", () => {
    const snapshots = latestSnapshots(mockCatalog);
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].id).toBe("homepage");
    expect(snapshots[0].mobile?.timestamp).toBe("2026-05-29T10:00:00Z");
    expect(snapshots[0].desktop?.timestamp).toBe("2026-05-28T10:00:00Z");
  });

  test("latestSnapshots handles missing profiles", () => {
    const emptyHistory: PageHistory = {
      ...mockPageHistory,
      mobile: [],
      desktop: [],
    };
    const emptyCatalog: TrendCatalog = {
      pages: { homepage: emptyHistory },
      lastUpdated: "2026-05-29T10:00:00Z",
      pageCount: 1,
    };
    const snapshots = latestSnapshots(emptyCatalog);
    expect(snapshots[0].mobile).toBeNull();
    expect(snapshots[0].desktop).toBeNull();
  });

  test("extractMetricSeries builds time-series points", () => {
    const series = extractMetricSeries(mockPageHistory, "mobile", "LCP");
    expect(series).toHaveLength(2);
    expect(series[0]).toEqual({ timestamp: "2026-05-28T10:00:00Z", value: 2000 });
    expect(series[1]).toEqual({ timestamp: "2026-05-29T10:00:00Z", value: 1800 });
  });

  test("extractScoreSeries builds coach score time-series", () => {
    const series = extractScoreSeries(mockPageHistory, "mobile");
    expect(series).toHaveLength(2);
    expect(series[0]).toEqual({ timestamp: "2026-05-28T10:00:00Z", value: 85 });
    expect(series[1]).toEqual({ timestamp: "2026-05-29T10:00:00Z", value: 88 });
  });

  test("Profile isolation: mobile and desktop do not mix", () => {
    const mobileSeries = extractMetricSeries(mockPageHistory, "mobile", "LCP");
    const desktopSeries = extractMetricSeries(mockPageHistory, "desktop", "LCP");
    expect(mobileSeries).toHaveLength(2);
    expect(desktopSeries).toHaveLength(1);
    expect(mobileSeries[0].value).toBe(2000);
    expect(desktopSeries[0].value).toBe(1200);
  });
});
