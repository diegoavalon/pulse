import { describe, test, expect } from "vite-plus/test";
import {
  extractRaw,
  extractSummary,
  extractDetail,
  extractRun,
  extractAndPersistRun,
  type ExtractionOptions,
  type BrowserTimeOutput,
  type CoachOutput,
  type HarLog,
} from "../src/index.js";
import { extractPartialCWV, validateCWV, extractTransfer } from "../src/cwv.js";
import { extractRequests, extractBlockers, inferType, isThirdParty } from "../src/har.js";
import { extractCoachScore, extractCoachAdvice, deriveAdviceFromCWV } from "../src/coach.js";

// ---- fixtures ---------------------------------------------------------------

import btGood from "./fixtures/browsertime-good.json" with { type: "json" };
import btPoor from "./fixtures/browsertime-poor.json" with { type: "json" };
import btMissing from "./fixtures/browsertime-missing.json" with { type: "json" };
import harExample from "./fixtures/har-example.json" with { type: "json" };
import coachExample from "./fixtures/coach-example.json" with { type: "json" };
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE_OPTS: ExtractionOptions = {
  pageId: "homepage",
  label: "Homepage",
  url: "https://www.ehealthinsurance.com/",
  group: "core",
  profile: "mobile",
  runId: "2026-05-29T13-41-03",
  timestamp: "2026-05-29T13:41:03Z",
  iterations: 3,
  domain: "ehealthinsurance.com",
};

async function makeRunDir(options?: {
  bt?: BrowserTimeOutput;
  coach?: CoachOutput | null;
  har?: HarLog | null;
  screenshotFiles?: string[];
  invalidBtJson?: boolean;
}): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pulse-extractor-run-"));
  if (options?.invalidBtJson) {
    await writeFile(join(dir, "browsertime.json"), "{", "utf8");
  } else {
    await writeFile(join(dir, "browsertime.json"), JSON.stringify(options?.bt ?? btGood), "utf8");
  }

  if (options?.coach !== undefined) {
    if (options.coach !== null) {
      await writeFile(join(dir, "coach.json"), JSON.stringify(options.coach), "utf8");
    }
  } else {
    await writeFile(join(dir, "coach.json"), JSON.stringify(coachExample), "utf8");
  }

  if (options?.har !== undefined) {
    if (options.har !== null) {
      await writeFile(join(dir, "har.json"), JSON.stringify(options.har), "utf8");
    }
  } else {
    await writeFile(join(dir, "har.json"), JSON.stringify(harExample), "utf8");
  }

  const screenshots = options?.screenshotFiles ?? ["afterPageCompleteCheck.jpg"];
  if (screenshots.length > 0) {
    const shotsDir = join(dir, "screenshots");
    await mkdir(shotsDir, { recursive: true });
    for (const f of screenshots) {
      await writeFile(join(shotsDir, f), "img", "utf8");
    }
  }

  return dir;
}

// ---- CWV extraction ---------------------------------------------------------

describe("extractPartialCWV", () => {
  test("extracts all metrics from good fixture", () => {
    const partial = extractPartialCWV(btGood as BrowserTimeOutput);
    expect(partial.LCP).toBe(1540);
    expect(partial.CLS).toBe(0.041);
    expect(partial.TBT).toBe(8);
    expect(partial.FCP).toBe(1264);
    expect(partial.TTFB).toBe(888);
    expect(partial.INP).toBeNull();
  });

  test("extracts poor-CLS metrics correctly", () => {
    const partial = extractPartialCWV(btPoor as BrowserTimeOutput);
    expect(partial.LCP).toBe(4320);
    expect(partial.CLS).toBe(0.769);
    expect(partial.TBT).toBe(820);
  });

  test("returns null for missing metrics", () => {
    const partial = extractPartialCWV(btMissing as BrowserTimeOutput);
    expect(partial.LCP).toBe(2100);
    expect(partial.FCP).toBe(1400);
    expect(partial.CLS).toBeNull();
    expect(partial.TBT).toBeNull();
    expect(partial.TTFB).toBeNull();
  });

  test("returns all null for empty statistics", () => {
    const empty: BrowserTimeOutput = {};
    const partial = extractPartialCWV(empty);
    expect(partial.LCP).toBeNull();
    expect(partial.CLS).toBeNull();
    expect(partial.TBT).toBeNull();
  });
});

describe("validateCWV", () => {
  test("good metrics pass validation", () => {
    const partial = extractPartialCWV(btGood as BrowserTimeOutput);
    expect(validateCWV(partial)).toHaveLength(0);
  });

  test("poor metrics still pass validation (they're valid values)", () => {
    const partial = extractPartialCWV(btPoor as BrowserTimeOutput);
    expect(validateCWV(partial)).toHaveLength(0);
  });

  test("missing required metrics fail validation", () => {
    const partial = extractPartialCWV(btMissing as BrowserTimeOutput);
    const errors = validateCWV(partial);
    expect(errors.some((e) => e.includes("CLS"))).toBe(true);
    expect(errors.some((e) => e.includes("TBT"))).toBe(true);
    expect(errors.some((e) => e.includes("TTFB"))).toBe(true);
  });

  test("negative LCP fails validation", () => {
    const partial = extractPartialCWV(btGood as BrowserTimeOutput);
    partial.LCP = -100;
    expect(validateCWV(partial).some((e) => e.includes("negative"))).toBe(true);
  });

  test("excessive CLS (≥10) fails validation", () => {
    const partial = extractPartialCWV(btGood as BrowserTimeOutput);
    partial.CLS = 12;
    expect(validateCWV(partial).some((e) => e.includes("CLS"))).toBe(true);
  });

  test("LCP over 60s fails validation", () => {
    const partial = extractPartialCWV(btGood as BrowserTimeOutput);
    partial.LCP = 70000;
    expect(validateCWV(partial).some((e) => e.includes("LCP"))).toBe(true);
  });
});

describe("extractTransfer", () => {
  test("extracts transfer breakdown from good fixture", () => {
    const tr = extractTransfer(btGood as BrowserTimeOutput);
    expect(tr.js).toBe(900000);
    expect(tr.css).toBe(120000);
    expect(tr.image).toBe(800000);
    expect(tr.other).toBe(480000);
    expect(tr.total).toBe(2300000);
  });

  test("falls back to zero for missing transfer stats", () => {
    const tr = extractTransfer(btMissing as BrowserTimeOutput);
    expect(tr.js).toBe(0);
    expect(tr.total).toBe(0);
  });
});

// ---- HAR extraction --------------------------------------------------------

describe("inferType", () => {
  test("HTML → document", () => {
    expect(inferType("text/html", "")).toBe("document");
  });
  test("CSS MIME → css", () => {
    expect(inferType("text/css", "")).toBe("css");
  });
  test("JS by URL extension", () => {
    expect(inferType(undefined, "/assets/app.js")).toBe("js");
  });
  test("WebP image → image", () => {
    expect(inferType("image/webp", "")).toBe("image");
  });
  test("JSON API path → xhr", () => {
    expect(inferType("application/json", "/api/eligibility")).toBe("xhr");
  });
  test("woff2 font → font", () => {
    expect(inferType(undefined, "/assets/HankenGrotesk.woff2")).toBe("font");
  });
});

describe("isThirdParty", () => {
  test("protocol-relative URL is third-party", () => {
    expect(isThirdParty("//cdn.example.com/script.js", "ehealthinsurance.com")).toBe(true);
  });
  test("same-domain URL is first-party", () => {
    expect(isThirdParty("https://www.ehealthinsurance.com/app.js", "ehealthinsurance.com")).toBe(
      false,
    );
  });
  test("googletagmanager is third-party", () => {
    expect(isThirdParty("https://www.googletagmanager.com/gtm.js", "ehealthinsurance.com")).toBe(
      true,
    );
  });
});

describe("extractRequests from HAR", () => {
  test("extracts 5 requests from har-example fixture", () => {
    const reqs = extractRequests(harExample as HarLog, "ehealthinsurance.com");
    expect(reqs).toHaveLength(5);
  });

  test("first request is document type", () => {
    const reqs = extractRequests(harExample as HarLog, "ehealthinsurance.com");
    expect(reqs[0].type).toBe("document");
    expect(reqs[0].blocking).toBe(false);
  });

  test("CSS request is marked blocking and first-party", () => {
    const reqs = extractRequests(harExample as HarLog, "ehealthinsurance.com");
    const css = reqs.find((r) => r.type === "css")!;
    expect(css.blocking).toBe(true);
    expect(css.thirdParty).toBe(false);
  });

  test("GTM request is blocking and third-party", () => {
    const reqs = extractRequests(harExample as HarLog, "ehealthinsurance.com");
    const gtm = reqs.find((r) => r.url.includes("googletagmanager"))!;
    expect(gtm.blocking).toBe(true);
    expect(gtm.thirdParty).toBe(true);
  });

  test("LCP image is marked isLCP", () => {
    const reqs = extractRequests(harExample as HarLog, "ehealthinsurance.com");
    const lcp = reqs.find((r) => r.isLCP)!;
    expect(lcp).toBeDefined();
    expect(lcp.type).toBe("image");
  });

  test("returns empty for null HAR", () => {
    const reqs = extractRequests({ log: { entries: [] } } as HarLog, "ehealthinsurance.com");
    expect(reqs).toHaveLength(0);
  });
});

describe("extractBlockers", () => {
  test("identifies 2 blocking requests from har-example", () => {
    const reqs = extractRequests(harExample as HarLog, "ehealthinsurance.com");
    const blockers = extractBlockers(reqs, "ehealthinsurance.com");
    expect(blockers).toHaveLength(2);
  });

  test("blocker has name, host, blockMs", () => {
    const reqs = extractRequests(harExample as HarLog, "ehealthinsurance.com");
    const blockers = extractBlockers(reqs, "ehealthinsurance.com");
    for (const b of blockers) {
      expect(b.name).toBeTruthy();
      expect(b.host).toBeTruthy();
      expect(b.blockMs).toBeGreaterThan(0);
    }
  });

  test("third-party blocker is flagged", () => {
    const reqs = extractRequests(harExample as HarLog, "ehealthinsurance.com");
    const blockers = extractBlockers(reqs, "ehealthinsurance.com");
    const thirdPartyBlocker = blockers.find((b) => b.thirdParty);
    expect(thirdPartyBlocker).toBeDefined();
  });
});

// ---- Coach extraction -------------------------------------------------------

describe("extractCoachScore", () => {
  test("extracts score 72 from coach fixture", () => {
    expect(extractCoachScore(coachExample as CoachOutput)).toBe(72);
  });

  test("returns 0 for null coach", () => {
    expect(extractCoachScore(null)).toBe(0);
  });

  test("returns 0 for out-of-range score", () => {
    expect(extractCoachScore({ median: { coachAdvice: { score: 150 } } })).toBe(0);
  });
});

describe("extractCoachAdvice", () => {
  test("extracts advice items from coach fixture", () => {
    const advice = extractCoachAdvice(coachExample as CoachOutput);
    expect(advice.length).toBeGreaterThan(0);
  });

  test("advice is sorted high → medium → low", () => {
    const advice = extractCoachAdvice(coachExample as CoachOutput);
    const RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };
    for (let i = 1; i < advice.length; i++) {
      expect(RANK[advice[i].severity]).toBeGreaterThanOrEqual(RANK[advice[i - 1].severity]);
    }
  });

  test("returns empty array for null coach", () => {
    expect(extractCoachAdvice(null)).toHaveLength(0);
  });
});

describe("deriveAdviceFromCWV", () => {
  test("poor CLS produces CLS advice item", () => {
    const cwv = { LCP: 1540, CLS: 0.769, TBT: 8, FCP: 1264, TTFB: 888, INP: null };
    const advice = deriveAdviceFromCWV(cwv);
    expect(advice.find((a) => a.metric === "CLS")).toBeDefined();
  });

  test("poor TBT produces TBT advice item with savings", () => {
    const cwv = { LCP: 3000, CLS: 0.05, TBT: 820, FCP: 2000, TTFB: 1000, INP: null };
    const advice = deriveAdviceFromCWV(cwv);
    const tbtAdv = advice.find((a) => a.metric === "TBT")!;
    expect(tbtAdv).toBeDefined();
    expect(tbtAdv.savingsMs).toBeGreaterThan(0);
  });

  test("always includes a low-severity caching advice item", () => {
    const cwv = { LCP: 1540, CLS: 0.041, TBT: 8, FCP: 1264, TTFB: 400, INP: null };
    const advice = deriveAdviceFromCWV(cwv);
    expect(advice.find((a) => a.severity === "low")).toBeDefined();
  });
});

// ---- Full extraction pipeline -----------------------------------------------

describe("extractSummary", () => {
  test("returns SummaryRecord for good fixture", () => {
    const result = extractSummary(
      btGood as BrowserTimeOutput,
      coachExample as CoachOutput,
      BASE_OPTS,
    );
    expect("errors" in result).toBe(false);
    if ("errors" in result) return;
    expect(result.id).toBe("homepage");
    expect(result.profile).toBe("mobile");
    expect(result.cwv.LCP).toBe(1540);
    expect(result.coachScore).toBe(72);
    expect(result.sitespeedVersion).toBe("41.2.0");
    expect(result.runId).toBe("2026-05-29T13-41-03");
    expect(result.iterations).toBe(3);
  });

  test("returns ExtractionError for incomplete fixture", () => {
    const result = extractSummary(btMissing as BrowserTimeOutput, null, BASE_OPTS);
    expect("errors" in result).toBe(true);
    if (!("errors" in result)) return;
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("coachScore is 0 when coach is null", () => {
    const result = extractSummary(btGood as BrowserTimeOutput, null, BASE_OPTS);
    expect("errors" in result).toBe(false);
    if ("errors" in result) return;
    expect(result.coachScore).toBe(0);
  });
});

describe("extractDetail", () => {
  test("produces DetailRecord from full inputs", () => {
    const { detail, warnings } = extractDetail(
      btGood as BrowserTimeOutput,
      harExample as HarLog,
      coachExample as CoachOutput,
      ["screenshots/afterPageCompleteCheck.jpg"],
      BASE_OPTS,
    );
    expect(detail.id).toBe("homepage");
    expect(detail.hasScreenshots).toBe(true);
    expect(detail.screenshotPaths).toHaveLength(1);
    expect(detail.requests.length).toBeGreaterThan(0);
    expect(detail.blockers.length).toBeGreaterThan(0);
    expect(warnings).toHaveLength(0);
  });

  test("produces DetailRecord with empty requests when HAR is null", () => {
    const { detail } = extractDetail(btGood as BrowserTimeOutput, null, null, [], BASE_OPTS);
    expect(detail.requests).toHaveLength(0);
    expect(detail.blockers).toHaveLength(0);
    expect(detail.hasScreenshots).toBe(false);
  });

  test("falls back to CWV-derived advice when coach is null", () => {
    const { detail } = extractDetail(btPoor as BrowserTimeOutput, null, null, [], {
      ...BASE_OPTS,
      pageId: "dependent-on-health-plan",
    });
    // btPoor has poor CLS — should generate CLS advice
    expect(detail.advice.find((a) => a.metric === "CLS")).toBeDefined();
  });

  test("transfer values are correct", () => {
    const { detail } = extractDetail(btGood as BrowserTimeOutput, null, null, [], BASE_OPTS);
    expect(detail.transfer.total).toBe(2300000);
    expect(detail.transfer.js).toBe(900000);
  });

  test("warnings are emitted for incomplete metrics", () => {
    const { warnings } = extractDetail(btMissing as BrowserTimeOutput, null, null, [], BASE_OPTS);
    expect(warnings.length).toBeGreaterThan(0);
  });
});

describe("extractRaw (end-to-end pipeline)", () => {
  test("success path produces both summary and detail", () => {
    const result = extractRaw(
      btGood as BrowserTimeOutput,
      harExample as HarLog,
      coachExample as CoachOutput,
      ["screenshots/screen.jpg"],
      BASE_OPTS,
    );
    expect("errors" in result).toBe(false);
    if ("errors" in result) return;
    expect(result.summary.cwv.LCP).toBe(1540);
    expect(result.detail.requests.length).toBeGreaterThan(0);
    expect(result.detail.hasScreenshots).toBe(true);
  });

  test("returns ExtractionError when CWV metrics are missing", () => {
    const result = extractRaw(btMissing as BrowserTimeOutput, null, null, [], BASE_OPTS);
    expect("errors" in result).toBe(true);
  });

  test("desktop profile produces lower metrics than mobile for same page", () => {
    const mobile = extractRaw(btPoor as BrowserTimeOutput, null, null, [], {
      ...BASE_OPTS,
      profile: "mobile",
      pageId: "dependent-on-health-plan",
    });
    const desktop = extractRaw(btGood as BrowserTimeOutput, null, null, [], {
      ...BASE_OPTS,
      profile: "desktop",
      pageId: "dependent-on-health-plan",
    });
    expect("errors" in mobile).toBe(false);
    expect("errors" in desktop).toBe(false);
    if ("errors" in mobile || "errors" in desktop) return;
    expect(desktop.summary.cwv.LCP).toBeLessThan(mobile.summary.cwv.LCP);
  });
});

describe("extractRun (filesystem)", () => {
  test("reads browsertime, coach, HAR, and screenshots from run directory", async () => {
    const runDir = await makeRunDir();
    try {
      const result = await extractRun(runDir, BASE_OPTS);
      expect("errors" in result).toBe(false);
      if ("errors" in result) return;
      expect(result.summary.runId).toBe(BASE_OPTS.runId);
      expect(result.detail.requests.length).toBeGreaterThan(0);
      expect(result.detail.hasScreenshots).toBe(true);
      expect(result.detail.screenshotPaths).toContain("screenshots/afterPageCompleteCheck.jpg");
    } finally {
      await rm(runDir, { recursive: true, force: true });
    }
  });

  test("handles missing optional diagnostics", async () => {
    const runDir = await makeRunDir({ coach: null, har: null, screenshotFiles: [] });
    try {
      const result = await extractRun(runDir, BASE_OPTS);
      expect("errors" in result).toBe(false);
      if ("errors" in result) return;
      expect(result.detail.requests).toHaveLength(0);
      expect(result.detail.hasScreenshots).toBe(false);
      expect(result.detail.advice.length).toBeGreaterThan(0);
    } finally {
      await rm(runDir, { recursive: true, force: true });
    }
  });

  test("returns ExtractionError for invalid browsertime JSON", async () => {
    const runDir = await makeRunDir({ invalidBtJson: true });
    try {
      const result = await extractRun(runDir, BASE_OPTS);
      expect("errors" in result).toBe(true);
      if (!("errors" in result)) return;
      expect(result.errors[0]).toContain("Cannot read browsertime.json");
    } finally {
      await rm(runDir, { recursive: true, force: true });
    }
  });

  test("returns ExtractionError for incomplete browsertime metrics", async () => {
    const runDir = await makeRunDir({ bt: btMissing, coach: null, har: null, screenshotFiles: [] });
    try {
      const result = await extractRun(runDir, BASE_OPTS);
      expect("errors" in result).toBe(true);
      if (!("errors" in result)) return;
      expect(result.errors.some((err) => err.includes("Missing required metric"))).toBe(true);
    } finally {
      await rm(runDir, { recursive: true, force: true });
    }
  });
});

describe("extractAndPersistRun", () => {
  test("writes summary/detail outputs and prunes stale detail runs while keeping summary history", async () => {
    const runDir = await makeRunDir();
    const dataRoot = await mkdtemp(join(tmpdir(), "pulse-extractor-data-"));

    try {
      const profilePath = join(dataRoot, BASE_OPTS.pageId, BASE_OPTS.profile);
      const staleRunId = "2026-01-01T00-00-00";
      const staleRunPath = join(profilePath, staleRunId);
      await mkdir(staleRunPath, { recursive: true });
      await writeFile(join(staleRunPath, "detail.json"), JSON.stringify({ stale: true }), "utf8");

      const staleSummary = {
        id: BASE_OPTS.pageId,
        label: BASE_OPTS.label,
        url: BASE_OPTS.url,
        profile: BASE_OPTS.profile,
        timestamp: "2026-01-01T00:00:00Z",
        iterations: 3,
        cwv: { LCP: 2000, CLS: 0.05, TBT: 10, FCP: 1200, TTFB: 700, INP: null },
        coachScore: 90,
        transfer: { total: 100, js: 25, css: 25, image: 25, other: 25 },
        requests: 10,
        thirdPartyRequests: 1,
        sitespeedVersion: "41.0.0",
        runId: staleRunId,
        schemaVersion: "1",
      };
      await mkdir(profilePath, { recursive: true });
      await writeFile(
        join(profilePath, "summary.json"),
        JSON.stringify([staleSummary], null, 2),
        "utf8",
      );

      const result = await extractAndPersistRun(runDir, dataRoot, BASE_OPTS, 14);
      expect("errors" in result).toBe(false);
      if ("errors" in result) return;

      const summaryRaw = await readFile(result.summaryPath, "utf8");
      const summary = JSON.parse(summaryRaw) as Array<{ runId: string }>;
      expect(summary.some((rec) => rec.runId === BASE_OPTS.runId)).toBe(true);
      expect(summary.some((rec) => rec.runId === staleRunId)).toBe(true);

      const detailStats = await stat(result.detailPath);
      expect(detailStats.isFile()).toBe(true);
      expect(result.screenshotsCopied).toContain("screenshots/afterPageCompleteCheck.jpg");

      await expect(stat(staleRunPath)).rejects.toThrow();
      expect(result.prunedDetailRuns.some((p) => p.endsWith(staleRunId))).toBe(true);
    } finally {
      await rm(runDir, { recursive: true, force: true });
      await rm(dataRoot, { recursive: true, force: true });
    }
  });
});
