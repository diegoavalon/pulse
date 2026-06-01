/* Retained fixture detail — deterministically expands each page's summary
   symptoms into the diagnostics a sitespeed.io run would retain. */

import {
  PAGES,
  rating,
  fmtMs,
  fmtCls,
  type Profile,
  type Page,
  type ProfileData,
  type Transfer,
} from "./data.js";

// ---- types ----------------------------------------------------------------

export interface Request {
  url: string;
  type: RequestType;
  start: number;
  ttfb: number;
  dur: number;
  size: number;
  blocking: boolean;
  priority: string;
  lcp?: boolean;
}

export interface Blocker {
  url: string;
  name: string;
  host: string;
  type: RequestType;
  size: number;
  blockMs: number;
  third: boolean;
}

export type AdviceSeverity = "high" | "med" | "low";
export interface Advice {
  sev: AdviceSeverity;
  metric: string;
  title: string;
  body: string;
  savings: number | null;
}

export type ReviewState = "available" | "pending" | "unavailable";
export interface ReviewInfo {
  state: ReviewState;
  reason: string;
}

export type FilmFrame = {
  t: number;
  progress: number;
  fcp: boolean;
  lcp: boolean;
};

export interface Timing {
  ttfb: number;
  fcp: number;
  lcp: number;
  dcl: number;
  load: number;
}

export interface DetailData {
  id: string;
  profile: Profile;
  page: Page;
  d: ProfileData;
  load: number;
  timing: Timing;
  requests: Request[];
  requestsByType: Record<string, number>;
  totalRequests: number;
  shownRequests: number;
  blockers: Blocker[];
  transfer: Transfer;
  third: number;
  advice: Advice[];
  hasScreenshots: boolean;
  noShotReason: string | null;
  filmstrip: FilmFrame[];
  review: ReviewInfo;
  run: { index: number; total: number; kind: string; when: string };
}

export type RequestType = "document" | "css" | "js" | "font" | "image" | "xhr";

// ---- constants ------------------------------------------------------------

const DOMAIN = "www.ehealthinsurance.com";

export const TYPE_COLOR: Record<RequestType, string> = {
  document: "var(--muted)",
  css: "var(--ni)",
  js: "var(--accent)",
  font: "var(--lime)",
  image: "var(--good)",
  xhr: "var(--poor)",
};

export const TYPE_ICON: Record<RequestType, string> = {
  document: "FileText",
  css: "Code",
  js: "Code",
  font: "FileText",
  image: "ImageIcon",
  xhr: "Layers",
};

const POOL = {
  css: [
    "/assets/app.7f3c.css",
    "/assets/theme.2a91.css",
    "//fonts.googleapis.com/css2",
    "/assets/vendor.b81e.css",
  ],
  js: [
    "/assets/runtime.4d2f.js",
    "/assets/vendor.9c0a.js",
    "/assets/main.5e7b.js",
    "/assets/resources-ifp.1ab3.js",
    "//www.googletagmanager.com/gtm.js",
    "//cdn.optimizely.com/js/2841.js",
    "//connect.facebook.net/en_US/fbevents.js",
  ],
  font: ["/assets/HankenGrotesk.woff2", "/assets/JetBrainsMono.woff2"],
  image: [
    "/assets/hero-family.webp",
    "/img/logo.svg",
    "/img/plan-card-1.webp",
    "/img/badge-sprite.png",
    "/img/carrier-logos.webp",
    "//doubleclick.net/pixel.gif",
  ],
  xhr: ["/api/eligibility", "/api/plans?zip=94107", "/api/quotes", "//hotjar.com/api/v2/site"],
};

// ---- review states per page -----------------------------------------------

const REVIEW: Record<string, ReviewInfo> = {
  "dependent-on-health-plan": {
    state: "unavailable",
    reason:
      "No passing baseline run to diff against — capture this page green once to unlock AI review.",
  },
  "medicare-part-b-giveback": {
    state: "pending",
    reason: "Queued for AI review · 2 runs ahead in the analysis worker.",
  },
  "medicare-advantage-to-medigap": {
    state: "pending",
    reason: "Queued for AI review · running now.",
  },
};

const NO_SHOTS: Record<string, string> = {
  "dependent-on-health-plan":
    "Capture timed out — page exceeded the 10 s visual-complete budget on this profile.",
};

// ---- helpers ---------------------------------------------------------------

function mulberry(seed: number) {
  return function () {
    seed = ((seed + 0x6d2b79f5) | 0) >>> 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isThirdParty(url: string): boolean {
  return url.startsWith("//") || (url.startsWith("http") && !url.includes(DOMAIN));
}

function getHost(url: string): string {
  if (url === "") return DOMAIN;
  if (url.startsWith("//")) return url.slice(2).split("/")[0];
  if (url.startsWith("http")) {
    try {
      return new URL(url).host;
    } catch {
      return DOMAIN;
    }
  }
  return DOMAIN;
}

export function getFileName(url: string): string {
  if (url === "") return "/";
  const clean = url.split("?")[0];
  const seg = clean.split("/").filter(Boolean);
  return seg.length ? seg[seg.length - 1] : clean;
}

function pageIndex(id: string): number {
  return PAGES.findIndex((p) => p.id === id);
}

// ---- request waterfall builder --------------------------------------------

function buildRequests(
  page: Page,
  d: ProfileData,
  rnd: () => number,
): { load: number; reqs: Request[]; blockers: Request[] } {
  const load = Math.round(d.cwv.LCP * 1.55 + d.cwv.TTFB + 500);
  const tr = page.transfer;
  const reqs: Request[] = [];
  const blockers: Request[] = [];

  // document
  reqs.push({
    url: "",
    type: "document",
    start: 0,
    ttfb: d.cwv.TTFB,
    dur: Math.round(d.cwv.TTFB + 60),
    size: 42000,
    blocking: false,
    priority: "Highest",
  });

  const afterDoc = Math.round(d.cwv.TTFB + 40);

  // render-blocking CSS
  const cssCount = Math.min(POOL.css.length, 2 + Math.round(rnd() * 2));
  const headJsCount = d.cwv.TBT > 300 ? 3 : d.cwv.TBT > 150 ? 2 : 1;

  POOL.css.slice(0, cssCount).forEach((url) => {
    const third = isThirdParty(url);
    const dur = Math.round(120 + rnd() * 160 + (third ? 220 : 0));
    const start = afterDoc + Math.round(rnd() * 40);
    const size = Math.round((tr.css / cssCount) * (0.7 + rnd() * 0.6));
    const o: Request = {
      url,
      type: "css",
      start,
      ttfb: Math.round(dur * 0.5),
      dur,
      size,
      blocking: true,
      priority: "Highest",
    };
    reqs.push(o);
    blockers.push(o);
  });

  POOL.js.slice(0, headJsCount).forEach((url) => {
    const third = isThirdParty(url);
    const dur = Math.round(180 + rnd() * 260 + (third ? 260 : 0));
    const start = afterDoc + Math.round(20 + rnd() * 80);
    const size = Math.round(((tr.js * 0.45) / headJsCount) * (0.7 + rnd() * 0.7));
    const o: Request = {
      url,
      type: "js",
      start,
      ttfb: Math.round(dur * 0.55),
      dur,
      size,
      blocking: true,
      priority: third ? "Low" : "High",
    };
    reqs.push(o);
    blockers.push(o);
  });

  // fonts
  POOL.font.forEach((url) => {
    reqs.push({
      url,
      type: "font",
      start: Math.round(d.cwv.FCP * 0.6 + rnd() * 120),
      ttfb: 40,
      dur: Math.round(90 + rnd() * 120),
      size: Math.round(28000 + rnd() * 18000),
      blocking: false,
      priority: "High",
    });
  });

  // images — first is the LCP candidate
  const imgCount = Math.min(POOL.image.length, 3 + Math.round(rnd() * 2));
  POOL.image.slice(0, imgCount).forEach((url, i) => {
    const isLcp = i === 0;
    const start = isLcp
      ? Math.round(d.cwv.LCP * 0.45)
      : Math.round(d.cwv.FCP + rnd() * (load - d.cwv.FCP) * 0.7);
    const dur = Math.round((isLcp ? 380 : 160) + rnd() * 240);
    const size = Math.round((tr.image / imgCount) * (0.6 + rnd() * 0.8));
    reqs.push({
      url,
      type: "image",
      start,
      ttfb: Math.round(dur * 0.4),
      dur,
      size,
      blocking: false,
      priority: isLcp ? "High" : "Low",
      lcp: isLcp,
    });
  });

  // XHR + async JS tail
  const xhrCount = d.cwv.TBT > 250 ? 3 : 2;
  POOL.xhr.slice(0, xhrCount).forEach((url) => {
    const start = Math.round(d.cwv.FCP + 120 + rnd() * (load - d.cwv.FCP) * 0.6);
    reqs.push({
      url,
      type: "xhr",
      start,
      ttfb: Math.round(120 + rnd() * 200),
      dur: Math.round(200 + rnd() * 360),
      size: Math.round(6000 + rnd() * 40000),
      blocking: false,
      priority: "Low",
    });
  });
  POOL.js.slice(headJsCount, headJsCount + 2).forEach((url) => {
    const start = Math.round(d.cwv.FCP + rnd() * (load - d.cwv.FCP) * 0.5);
    reqs.push({
      url,
      type: "js",
      start,
      ttfb: Math.round(80 + rnd() * 160),
      dur: Math.round(160 + rnd() * 300),
      size: Math.round(40000 + rnd() * 120000),
      blocking: false,
      priority: "Low",
    });
  });

  reqs.sort((a, b) => a.start - b.start);
  return { load, reqs, blockers };
}

// ---- coach advice ---------------------------------------------------------

function buildAdvice(page: Page, d: ProfileData, wf: { blockers: Request[] }): Advice[] {
  const out: Advice[] = [];

  function sev(metric: string): AdviceSeverity {
    const r = rating(metric, d.cwv[metric as keyof typeof d.cwv] as number);
    return r === "poor" ? "high" : r === "ni" ? "med" : "low";
  }

  const blockerMs = wf.blockers.reduce((a, b) => a + b.dur, 0);

  if (rating("LCP", d.cwv.LCP) !== "good") {
    out.push({
      sev: sev("LCP"),
      metric: "LCP",
      title: "Preload the LCP image and serve it modern-format",
      body: `The largest element is hero-family.webp, fetched at low priority ${fmtMs(Math.round(d.cwv.LCP * 0.45))} in. Add <link rel="preload"> and fetchpriority="high".`,
      savings: Math.round(d.cwv.LCP * 0.18),
    });
  }
  if (wf.blockers.length) {
    out.push({
      sev: blockerMs > 700 ? "high" : "med",
      metric: "FCP",
      title: "Eliminate render-blocking resources",
      body: `${wf.blockers.length} resources block first paint for ~${fmtMs(blockerMs)}. Inline critical CSS and defer non-critical stylesheets and head scripts.`,
      savings: Math.round(blockerMs * 0.4),
    });
  }
  if (rating("CLS", d.cwv.CLS) !== "good") {
    out.push({
      sev: sev("CLS"),
      metric: "CLS",
      title: "Reserve space for late-loading content",
      body: `Layout shifts total ${fmtCls(d.cwv.CLS)}. Set explicit width/height on images and reserve height for the carrier-logos band and injected ad slots.`,
      savings: null,
    });
  }
  if (rating("TBT", d.cwv.TBT) !== "good") {
    out.push({
      sev: sev("TBT"),
      metric: "TBT",
      title: "Break up long main-thread tasks",
      body: `Third-party tags (GTM, Optimizely, FB) add ${fmtMs(d.cwv.TBT)} of blocking time. Load them via a web worker or defer to idle.`,
      savings: Math.round(d.cwv.TBT * 0.5),
    });
  }
  if (page.third > 40) {
    out.push({
      sev: "med",
      metric: "TBT",
      title: "Trim third-party requests",
      body: `${page.third} of ${page.requests} requests are third-party. Audit tag-manager containers and remove unused vendors.`,
      savings: null,
    });
  }
  out.push({
    sev: "low",
    metric: "TTFB",
    title: "Enable Brotli + long-lived caching on static assets",
    body: "Static JS/CSS responded without immutable cache headers. Add Cache-Control: max-age=31536000, immutable to hashed bundles.",
    savings: null,
  });

  return out;
}

// ---- filmstrip ------------------------------------------------------------

function buildFilmstrip(d: ProfileData, load: number): FilmFrame[] {
  const stops = [0.12, 0.28, 0.46, 0.66, 0.84, 1];
  const frames: FilmFrame[] = stops.map((f) => {
    const t = Math.round(load * f);
    const progress =
      t < d.cwv.FCP
        ? 0
        : t < d.cwv.LCP
          ? 0.45 + 0.4 * ((t - d.cwv.FCP) / Math.max(1, d.cwv.LCP - d.cwv.FCP))
          : 1;
    return { t, progress: Math.max(0, Math.min(1, progress)), fcp: false, lcp: false };
  });

  let fcpTagged = false;
  let lcpTagged = false;
  for (const fr of frames) {
    if (!fcpTagged && fr.t >= d.cwv.FCP) {
      fr.fcp = true;
      fcpTagged = true;
    }
    if (!lcpTagged && fr.t >= d.cwv.LCP) {
      fr.lcp = true;
      lcpTagged = true;
    }
  }
  return frames;
}

// ---- memoized detail builder ----------------------------------------------

const cache = new Map<string, DetailData>();

export function detail(id: string, profile: Profile): DetailData | null {
  const key = `${id}:${profile}`;
  if (cache.has(key)) return cache.get(key)!;

  const idx = pageIndex(id);
  const page = PAGES[idx];
  if (!page) return null;

  const d = page[profile];
  const rnd = mulberry((idx + 1) * 131 + (profile === "mobile" ? 17 : 53));
  const wf = buildRequests(page, d, rnd);

  const byType: Record<string, number> = {};
  wf.reqs.forEach((r) => {
    byType[r.type] = (byType[r.type] || 0) + 1;
  });

  const det: DetailData = {
    id,
    profile,
    page,
    d,
    load: wf.load,
    timing: {
      ttfb: d.cwv.TTFB,
      fcp: d.cwv.FCP,
      lcp: d.cwv.LCP,
      dcl: Math.round(d.cwv.FCP + (wf.load - d.cwv.FCP) * 0.35),
      load: wf.load,
    },
    requests: wf.reqs,
    requestsByType: byType,
    totalRequests: page.requests,
    shownRequests: wf.reqs.length,
    blockers: wf.blockers.map((b) => ({
      url: b.url,
      name: getFileName(b.url),
      host: getHost(b.url),
      type: b.type,
      size: b.size,
      blockMs: b.dur,
      third: isThirdParty(b.url),
    })),
    transfer: page.transfer,
    third: page.third,
    advice: buildAdvice(page, d, wf),
    hasScreenshots: !NO_SHOTS[id],
    noShotReason: NO_SHOTS[id] ?? null,
    filmstrip: buildFilmstrip(d, wf.load),
    review: REVIEW[id] ?? {
      state: "available",
      reason: "AI review complete — opens the annotated trace with prioritized fixes.",
    },
    run: { index: 3, total: 3, kind: "median", when: "2026-05-29T13:41:03Z" },
  };

  cache.set(key, det);
  return det;
}

export { fmtMs, fmtBytes, fmtMetric } from "./data.js";
export type { Profile, Page } from "./data.js";
