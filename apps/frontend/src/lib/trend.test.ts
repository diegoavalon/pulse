import { describe, it, expect } from "vite-plus/test";
import { PAGES, summary, THRESHOLDS } from "./data.js";

// ---- trend grouping by tracked page and profile --------------------------

describe("trend grouping by page and profile", () => {
  it("each page has independent mobile and desktop trend histories", () => {
    for (const page of PAGES) {
      const mobileTrend = page.mobile.lcpTrend;
      const desktopTrend = page.desktop.lcpTrend;

      expect(mobileTrend).toBeDefined();
      expect(desktopTrend).toBeDefined();
      expect(mobileTrend.length).toBeGreaterThan(0);
      expect(desktopTrend.length).toBeGreaterThan(0);

      // Mobile and desktop should have different trend data
      expect(mobileTrend).not.toEqual(desktopTrend);
    }
  });

  it("trend histories are keyed by page ID + profile combination", () => {
    const seenKeys = new Set<string>();

    for (const page of PAGES) {
      for (const profile of ["mobile", "desktop"] as const) {
        const key = `${page.id}:${profile}`;
        expect(seenKeys.has(key)).toBe(false);
        seenKeys.add(key);

        const data = page[profile];
        expect(data.lcpTrend).toBeDefined();
        expect(data.scoreTrend).toBeDefined();
      }
    }

    // Should have exactly 2 * PAGES.length unique combinations
    expect(seenKeys.size).toBe(PAGES.length * 2);
  });

  it("all pages in the same group can be independently queried by profile", () => {
    const groupedByGroup = new Map<string, typeof PAGES>();

    for (const page of PAGES) {
      const group = page.group;
      if (!groupedByGroup.has(group)) {
        groupedByGroup.set(group, []);
      }
      groupedByGroup.get(group)!.push(page);
    }

    for (const [_groupName, pagesInGroup] of groupedByGroup) {
      for (const profile of ["mobile", "desktop"] as const) {
        const trends = pagesInGroup.map((p) => p[profile].lcpTrend);

        // All trends should exist
        expect(trends.every((t) => t.length > 0)).toBe(true);

        // Each page in group should have unique trend data
        for (let i = 0; i < trends.length; i++) {
          for (let j = i + 1; j < trends.length; j++) {
            expect(trends[i]).not.toEqual(trends[j]);
          }
        }
      }
    }
  });
});

// ---- profile switching without mixing histories --------------------------

describe("profile switching preserves isolation", () => {
  it("switching profile does not contaminate trend data", () => {
    for (const page of PAGES) {
      const mobileData = page.mobile;
      const desktopData = page.desktop;

      // Verify that mobile and desktop CWV values are different
      expect(mobileData.cwv).not.toEqual(desktopData.cwv);

      // Verify that trends follow the current profile's performance
      const mobileLcpLast = mobileData.lcpTrend[mobileData.lcpTrend.length - 1];
      const desktopLcpLast = desktopData.lcpTrend[desktopData.lcpTrend.length - 1];

      expect(mobileLcpLast).toBe(mobileData.cwv.LCP);
      expect(desktopLcpLast).toBe(desktopData.cwv.LCP);

      // Mobile should not equal desktop
      expect(mobileLcpLast).not.toBe(desktopLcpLast);
    }
  });

  it("summary statistics are computed independently per profile", () => {
    const mobileSummary = summary("mobile");
    const desktopSummary = summary("desktop");

    expect(mobileSummary).toBeDefined();
    expect(desktopSummary).toBeDefined();

    // Both summaries should cover all pages
    expect(mobileSummary.total).toBe(PAGES.length);
    expect(desktopSummary.total).toBe(PAGES.length);

    // Average scores should be different (desktop typically better)
    expect(mobileSummary.avgScore).not.toBe(desktopSummary.avgScore);
    expect(desktopSummary.avgScore).toBeGreaterThan(mobileSummary.avgScore);

    // Rating counts should differ between profiles
    expect(mobileSummary.counts).not.toEqual(desktopSummary.counts);
  });

  it("querying one profile never returns data from the other profile", () => {
    // Mobile queries
    const mobileSummary = summary("mobile");
    let mobileGoodCount = 0;

    for (const page of PAGES) {
      if (page.mobile.status === "good") mobileGoodCount++;
    }

    expect(mobileSummary.counts.good).toBe(mobileGoodCount);

    // Desktop queries
    const desktopSummary = summary("desktop");
    let desktopGoodCount = 0;

    for (const page of PAGES) {
      if (page.desktop.status === "good") desktopGoodCount++;
    }

    expect(desktopSummary.counts.good).toBe(desktopGoodCount);

    // The counts must be independently calculated
    expect(mobileGoodCount).not.toBe(desktopGoodCount);
  });

  it("delta calculations use same-profile historical data only", () => {
    for (const page of PAGES) {
      for (const profile of ["mobile", "desktop"] as const) {
        const data = page[profile];
        const trend = data.lcpTrend;

        if (trend.length >= 2) {
          const currentLcp = trend[trend.length - 1];
          const previousLcp = trend[trend.length - 2];
          const expectedDelta = currentLcp - previousLcp;

          expect(data.lcpDelta).toBeCloseTo(expectedDelta, 1);
        }
      }
    }
  });
});

// ---- units and labels for chart data configuration -----------------------

describe("chart data units and labels", () => {
  it("LCP trend data is in milliseconds", () => {
    for (const page of PAGES) {
      for (const profile of ["mobile", "desktop"] as const) {
        const lcpTrend = page[profile].lcpTrend;

        // All values should be reasonable millisecond values
        for (const value of lcpTrend) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThan(20000); // < 20s is reasonable max
        }

        // Last value should match current CWV.LCP
        expect(lcpTrend[lcpTrend.length - 1]).toBe(page[profile].cwv.LCP);
      }
    }
  });

  it("score trend data is unitless percentage (0-100)", () => {
    for (const page of PAGES) {
      for (const profile of ["mobile", "desktop"] as const) {
        const scoreTrend = page[profile].scoreTrend;

        // All values should be in 0-100 range
        for (const value of scoreTrend) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(100);
          expect(Number.isInteger(value)).toBe(true);
        }

        // Last value should match current score
        expect(scoreTrend[scoreTrend.length - 1]).toBe(page[profile].score);
      }
    }
  });

  it("THRESHOLDS define expected units for all metrics", () => {
    const expectedMetrics = ["LCP", "CLS", "TBT", "FCP", "TTFB", "INP"];

    for (const metric of expectedMetrics) {
      expect(THRESHOLDS[metric]).toBeDefined();
      expect(THRESHOLDS[metric].unit).toBeDefined();
      expect(THRESHOLDS[metric].good).toBeDefined();
      expect(THRESHOLDS[metric].ni).toBeDefined();
      expect(THRESHOLDS[metric].lowerBetter).toBeDefined();
    }

    // Verify expected units
    expect(THRESHOLDS.LCP.unit).toBe("ms");
    expect(THRESHOLDS.CLS.unit).toBe("");
    expect(THRESHOLDS.TBT.unit).toBe("ms");
    expect(THRESHOLDS.FCP.unit).toBe("ms");
    expect(THRESHOLDS.TTFB.unit).toBe("ms");
    expect(THRESHOLDS.INP.unit).toBe("ms");
  });

  it("threshold boundaries are numerically comparable to trend data", () => {
    for (const page of PAGES) {
      for (const profile of ["mobile", "desktop"] as const) {
        const lcpTrend = page[profile].lcpTrend;
        const currentLcp = lcpTrend[lcpTrend.length - 1];

        // LCP values should be comparable to threshold values
        expect(typeof currentLcp).toBe("number");
        expect(typeof THRESHOLDS.LCP.good).toBe("number");
        expect(typeof THRESHOLDS.LCP.ni).toBe("number");

        // Values should be in same scale (both in ms)
        const isGood = currentLcp <= THRESHOLDS.LCP.good;
        const isNi = currentLcp <= THRESHOLDS.LCP.ni;

        expect(typeof isGood).toBe("boolean");
        expect(typeof isNi).toBe("boolean");
      }
    }
  });

  it("all CWV metrics have lowerBetter=true except for scores", () => {
    expect(THRESHOLDS.LCP.lowerBetter).toBe(true);
    expect(THRESHOLDS.CLS.lowerBetter).toBe(true);
    expect(THRESHOLDS.TBT.lowerBetter).toBe(true);
    expect(THRESHOLDS.FCP.lowerBetter).toBe(true);
    expect(THRESHOLDS.TTFB.lowerBetter).toBe(true);
    expect(THRESHOLDS.INP.lowerBetter).toBe(true);
  });
});

// ---- summary-only historical runs visible when detail unavailable --------

describe("summary-only historical runs remain visible", () => {
  it("trend data exists independently of detail availability", () => {
    for (const page of PAGES) {
      for (const profile of ["mobile", "desktop"] as const) {
        const data = page[profile];

        // Trend arrays should have historical data
        expect(data.lcpTrend.length).toBeGreaterThan(1);
        expect(data.scoreTrend.length).toBeGreaterThan(1);

        // Trend length indicates historical depth regardless of detail
        expect(data.lcpTrend.length).toBe(data.scoreTrend.length);
      }
    }
  });

  it("all trend points are summary-level data (LCP + score)", () => {
    for (const page of PAGES) {
      for (const profile of ["mobile", "desktop"] as const) {
        const data = page[profile];

        // Every trend point should be a valid number
        for (const lcp of data.lcpTrend) {
          expect(typeof lcp).toBe("number");
          expect(lcp).toBeGreaterThanOrEqual(0);
        }

        for (const score of data.scoreTrend) {
          expect(typeof score).toBe("number");
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("historical runs include enough points for meaningful trends", () => {
    // Per the fixture, we expect 14 data points (2 weeks of daily runs)
    const expectedMinPoints = 10; // At least 10 points for a trend

    for (const page of PAGES) {
      for (const profile of ["mobile", "desktop"] as const) {
        const data = page[profile];

        expect(data.lcpTrend.length).toBeGreaterThanOrEqual(expectedMinPoints);
        expect(data.scoreTrend.length).toBeGreaterThanOrEqual(expectedMinPoints);
      }
    }
  });

  it("deltas are computed from penultimate summary record", () => {
    for (const page of PAGES) {
      for (const profile of ["mobile", "desktop"] as const) {
        const data = page[profile];

        // Delta should be difference between last two trend points
        const lcpCurrent = data.lcpTrend[data.lcpTrend.length - 1];
        const lcpPrevious = data.lcpTrend[data.lcpTrend.length - 2];
        const scoreCurrent = data.scoreTrend[data.scoreTrend.length - 1];
        const scorePrevious = data.scoreTrend[data.scoreTrend.length - 2];

        expect(data.lcpDelta).toBeCloseTo(lcpCurrent - lcpPrevious, 1);
        expect(data.scoreDelta).toBeCloseTo(scoreCurrent - scorePrevious, 1);
      }
    }
  });
});

// ---- latest status and trend views share one summary contract ------------

describe("latest status and trend views use same summary", () => {
  it("latest trend point equals current CWV values", () => {
    for (const page of PAGES) {
      for (const profile of ["mobile", "desktop"] as const) {
        const data = page[profile];
        const latestLcp = data.lcpTrend[data.lcpTrend.length - 1];
        const latestScore = data.scoreTrend[data.scoreTrend.length - 1];

        expect(latestLcp).toBe(data.cwv.LCP);
        expect(latestScore).toBe(data.score);
      }
    }
  });

  it("current status is derived from latest summary CWV", () => {
    for (const page of PAGES) {
      for (const profile of ["mobile", "desktop"] as const) {
        const data = page[profile];

        // Status should be computed from current CWV
        expect(data.status).toBeDefined();
        expect(["good", "ni", "poor"]).toContain(data.status);

        // The status should reflect the worst headline metric
        const lcpRating =
          data.cwv.LCP <= THRESHOLDS.LCP.good
            ? "good"
            : data.cwv.LCP <= THRESHOLDS.LCP.ni
              ? "ni"
              : "poor";
        const clsRating =
          data.cwv.CLS <= THRESHOLDS.CLS.good
            ? "good"
            : data.cwv.CLS <= THRESHOLDS.CLS.ni
              ? "ni"
              : "poor";
        const tbtRating =
          data.cwv.TBT <= THRESHOLDS.TBT.good
            ? "good"
            : data.cwv.TBT <= THRESHOLDS.TBT.ni
              ? "ni"
              : "poor";

        const ratings = [lcpRating, clsRating, tbtRating];
        const worstRating = ratings.includes("poor")
          ? "poor"
          : ratings.includes("ni")
            ? "ni"
            : "good";

        expect(data.status).toBe(worstRating);
      }
    }
  });

  it("summary aggregates use the same ProfileData contract", () => {
    const mobileSummary = summary("mobile");
    const desktopSummary = summary("desktop");

    // Summaries aggregate status from ProfileData.status
    let manualMobileGood = 0;
    let manualMobileNi = 0;
    let manualMobilePoor = 0;

    for (const page of PAGES) {
      if (page.mobile.status === "good") manualMobileGood++;
      else if (page.mobile.status === "ni") manualMobileNi++;
      else if (page.mobile.status === "poor") manualMobilePoor++;
    }

    expect(mobileSummary.counts.good).toBe(manualMobileGood);
    expect(mobileSummary.counts.ni).toBe(manualMobileNi);
    expect(mobileSummary.counts.poor).toBe(manualMobilePoor);

    // Desktop should similarly aggregate from ProfileData
    let manualDesktopGood = 0;
    let manualDesktopNi = 0;
    let manualDesktopPoor = 0;

    for (const page of PAGES) {
      if (page.desktop.status === "good") manualDesktopGood++;
      else if (page.desktop.status === "ni") manualDesktopNi++;
      else if (page.desktop.status === "poor") manualDesktopPoor++;
    }

    expect(desktopSummary.counts.good).toBe(manualDesktopGood);
    expect(desktopSummary.counts.ni).toBe(manualDesktopNi);
    expect(desktopSummary.counts.poor).toBe(manualDesktopPoor);
  });

  it("average score in summary matches mean of ProfileData scores", () => {
    for (const profile of ["mobile", "desktop"] as const) {
      const sum = summary(profile);

      let totalScore = 0;
      for (const page of PAGES) {
        totalScore += page[profile].score;
      }
      const expectedAvg = Math.round(totalScore / PAGES.length);

      expect(sum.avgScore).toBe(expectedAvg);
    }
  });

  it("trend and current state are both derived from ProfileData", () => {
    for (const page of PAGES) {
      for (const profile of ["mobile", "desktop"] as const) {
        const data = page[profile];

        // Verify all fields exist on the same contract
        expect(data.cwv).toBeDefined();
        expect(data.score).toBeDefined();
        expect(data.status).toBeDefined();
        expect(data.lcpTrend).toBeDefined();
        expect(data.scoreTrend).toBeDefined();
        expect(data.lcpDelta).toBeDefined();
        expect(data.scoreDelta).toBeDefined();

        // Latest trend points must equal current values (same contract)
        expect(data.lcpTrend[data.lcpTrend.length - 1]).toBe(data.cwv.LCP);
        expect(data.scoreTrend[data.scoreTrend.length - 1]).toBe(data.score);
      }
    }
  });
});
