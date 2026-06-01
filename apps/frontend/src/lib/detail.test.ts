import { describe, it, expect } from "vite-plus/test";
import { detail, getFileName } from "./detail.js";
import { PAGES, rating } from "./data.js";

// ---- detail availability --------------------------------------------------

describe("detail availability", () => {
  it("returns detail for every tracked page + both profiles", () => {
    for (const page of PAGES) {
      for (const profile of ["mobile", "desktop"] as const) {
        const det = detail(page.id, profile);
        expect(det).not.toBeNull();
        expect(det!.id).toBe(page.id);
        expect(det!.profile).toBe(profile);
        expect(det!.page).toBe(page);
      }
    }
  });

  it("returns null for an unknown page id", () => {
    expect(detail("not-a-real-page", "mobile")).toBeNull();
  });

  it("memoises — same object on repeated calls", () => {
    const a = detail("homepage", "mobile");
    const b = detail("homepage", "mobile");
    expect(a).toBe(b);
  });

  it("returns different objects for different profiles", () => {
    const m = detail("homepage", "mobile");
    const d = detail("homepage", "desktop");
    expect(m).not.toBe(d);
    expect(m!.d.score).not.toBe(d!.d.score);
  });
});

// ---- missing optional diagnostics ----------------------------------------

describe("screenshot availability", () => {
  it("dependent-on-health-plan has no screenshots on mobile", () => {
    const det = detail("dependent-on-health-plan", "mobile");
    expect(det!.hasScreenshots).toBe(false);
    expect(det!.noShotReason).toMatch(/timeout|budget/i);
  });

  it("homepage has screenshots", () => {
    const det = detail("homepage", "mobile");
    expect(det!.hasScreenshots).toBe(true);
    expect(det!.noShotReason).toBeNull();
  });

  it("filmstrip is non-empty when screenshots are available", () => {
    const det = detail("homepage", "mobile");
    expect(det!.filmstrip.length).toBeGreaterThan(0);
  });

  it("filmstrip has at most one FCP-tagged frame and one LCP-tagged frame", () => {
    for (const page of PAGES) {
      const det = detail(page.id, "mobile")!;
      const fcpFrames = det.filmstrip.filter((f) => f.fcp);
      const lcpFrames = det.filmstrip.filter((f) => f.lcp);
      expect(fcpFrames.length).toBeLessThanOrEqual(1);
      expect(lcpFrames.length).toBeLessThanOrEqual(1);
    }
  });
});

// ---- review availability states ------------------------------------------

describe("review states", () => {
  it("dependent-on-health-plan review is unavailable", () => {
    expect(detail("dependent-on-health-plan", "mobile")!.review.state).toBe("unavailable");
  });

  it("medicare-part-b-giveback review is pending", () => {
    expect(detail("medicare-part-b-giveback", "mobile")!.review.state).toBe("pending");
  });

  it("medicare-advantage-to-medigap review is pending", () => {
    expect(detail("medicare-advantage-to-medigap", "mobile")!.review.state).toBe("pending");
  });

  it("all other pages have review available", () => {
    const noReview = new Set([
      "dependent-on-health-plan",
      "medicare-part-b-giveback",
      "medicare-advantage-to-medigap",
    ]);
    for (const page of PAGES) {
      if (!noReview.has(page.id)) {
        expect(detail(page.id, "mobile")!.review.state).toBe("available");
      }
    }
  });
});

// ---- render-blocking resources -------------------------------------------

describe("render-blocking resources", () => {
  it("every page has at least one blocker on mobile (CSS or JS in head)", () => {
    for (const page of PAGES) {
      const det = detail(page.id, "mobile")!;
      expect(det.blockers.length).toBeGreaterThan(0);
    }
  });

  it("blocker count increases with higher TBT pages", () => {
    // dependent-on-health-plan has TBT=820ms (poor) — should have more head JS blockers
    const heavy = detail("dependent-on-health-plan", "mobile")!;
    const light = detail("medicare-advantage-to-medigap", "mobile")!;
    expect(heavy.blockers.length).toBeGreaterThanOrEqual(light.blockers.length);
  });

  it("blockers have required fields", () => {
    const det = detail("homepage", "mobile")!;
    for (const b of det.blockers) {
      expect(b.name).toBeTruthy();
      expect(b.host).toBeTruthy();
      expect(b.blockMs).toBeGreaterThan(0);
      expect(b.size).toBeGreaterThan(0);
    }
  });
});

// ---- profile / page selection behavior -----------------------------------

describe("profile selection", () => {
  it("desktop scores are consistently higher than mobile for the same page", () => {
    for (const page of PAGES) {
      const m = detail(page.id, "mobile")!;
      const d = detail(page.id, "desktop")!;
      // Desktop scores should be >= mobile for all fixture pages
      expect(d.d.score).toBeGreaterThanOrEqual(m.d.score);
    }
  });

  it("waterfall load time is lower for desktop than mobile", () => {
    for (const page of PAGES) {
      const m = detail(page.id, "mobile")!;
      const d = detail(page.id, "desktop")!;
      expect(d.load).toBeLessThan(m.load);
    }
  });

  it("advice severity aligns with metric ratings", () => {
    // homepage has poor CLS on mobile — should have a CLS advice item
    const det = detail("homepage", "mobile")!;
    const clsRating = rating("CLS", det.d.cwv.CLS);
    if (clsRating !== "good") {
      const clsAdv = det.advice.find((a) => a.metric === "CLS");
      expect(clsAdv).toBeDefined();
    }
  });
});

// ---- waterfall integrity -------------------------------------------------

describe("waterfall requests", () => {
  it("all requests have non-negative start times and positive duration", () => {
    for (const page of PAGES) {
      const det = detail(page.id, "mobile")!;
      for (const req of det.requests) {
        expect(req.start).toBeGreaterThanOrEqual(0);
        expect(req.dur).toBeGreaterThan(0);
      }
    }
  });

  it("first request is the document", () => {
    const det = detail("homepage", "mobile")!;
    expect(det.requests[0].type).toBe("document");
    expect(det.requests[0].start).toBe(0);
  });

  it("LCP image is marked on requests", () => {
    const det = detail("homepage", "mobile")!;
    const lcpReqs = det.requests.filter((r) => r.lcp);
    expect(lcpReqs.length).toBe(1);
    expect(lcpReqs[0].type).toBe("image");
  });
});

// ---- filename helper -------------------------------------------------------

describe("getFileName", () => {
  it("returns / for empty string", () => {
    expect(getFileName("")).toBe("/");
  });

  it("returns last path segment", () => {
    expect(getFileName("/assets/app.7f3c.css")).toBe("app.7f3c.css");
  });

  it("strips query string", () => {
    expect(getFileName("/api/plans?zip=94107")).toBe("plans");
  });

  it("handles protocol-relative URLs", () => {
    expect(getFileName("//www.googletagmanager.com/gtm.js")).toBe("gtm.js");
  });
});
