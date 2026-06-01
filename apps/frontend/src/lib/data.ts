export type Rating = "good" | "ni" | "poor" | "na";
export type Profile = "mobile" | "desktop";

export interface CWV {
  LCP: number;
  CLS: number;
  TBT: number;
  FCP: number;
  TTFB: number;
  INP: number | null;
}

export interface ProfileData {
  cwv: CWV;
  score: number;
  status: Rating;
  lcpTrend: number[];
  scoreTrend: number[];
  lcpDelta: number;
  scoreDelta: number;
}

export interface Transfer {
  total: number;
  js: number;
  css: number;
  image: number;
  other: number;
}

export interface Page {
  id: string;
  label: string;
  group: string;
  url: string;
  transfer: Transfer;
  requests: number;
  third: number;
  mobile: ProfileData;
  desktop: ProfileData;
}

export interface Summary {
  counts: { good: number; ni: number; poor: number };
  total: number;
  avgScore: number;
}

// --- Google CWV thresholds ---
export const THRESHOLDS: Record<
  string,
  { good: number; ni: number; unit: string; lowerBetter: boolean }
> = {
  LCP: { good: 2500, ni: 4000, unit: "ms", lowerBetter: true },
  CLS: { good: 0.1, ni: 0.25, unit: "", lowerBetter: true },
  TBT: { good: 200, ni: 600, unit: "ms", lowerBetter: true },
  FCP: { good: 1800, ni: 3000, unit: "ms", lowerBetter: true },
  TTFB: { good: 800, ni: 1800, unit: "ms", lowerBetter: true },
  INP: { good: 200, ni: 500, unit: "ms", lowerBetter: true },
};

export const HEADLINE = ["LCP", "CLS", "TBT"] as const;
export const GROUPS = ["core", "medicare", "resources-ifp", "corporate"] as const;
export const LAST_RUN = "2026-05-29T13:41:03Z";

const RANK: Record<Rating, number> = { good: 0, ni: 1, poor: 2, na: -1 };

export function rating(metric: string, value: number | null): Rating {
  if (value === null || value === undefined) return "na";
  const t = THRESHOLDS[metric];
  if (!t) return "na";
  if (value <= t.good) return "good";
  if (value <= t.ni) return "ni";
  return "poor";
}

export function pageStatus(cwv: CWV): Rating {
  let worst: Rating = "good";
  for (const m of HEADLINE) {
    const r = rating(m, cwv[m]);
    if (RANK[r] > RANK[worst]) worst = r;
  }
  return worst;
}

export function fmtMs(v: number | null): string {
  if (v === null || v === undefined) return "—";
  if (v >= 1000) return (v / 1000).toFixed(2).replace(/\.?0+$/, "") + " s";
  return Math.round(v) + " ms";
}

export function fmtCls(v: number | null): string {
  if (v === null || v === undefined) return "—";
  return v.toFixed(3);
}

export function fmtBytes(b: number): string {
  if (b >= 1e6) return (b / 1e6).toFixed(1) + " MB";
  if (b >= 1e3) return Math.round(b / 1e3) + " KB";
  return b + " B";
}

export function fmtMetric(metric: string, v: number | null): string {
  return metric === "CLS" ? fmtCls(v) : fmtMs(v);
}

export function scoreBand(s: number): Rating {
  return s >= 80 ? "good" : s >= 50 ? "ni" : "poor";
}

// Deterministic PRNG (mulberry32)
function mulberry(seed: number) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function series(seed: number, end: number, vol: number, driftFrac: number): number[] {
  const rnd = mulberry(seed);
  const n = 14;
  const start = end * (1 + driftFrac);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const base = start + (end - start) * (i / (n - 1));
    const noise = (rnd() - 0.5) * 2 * vol * end;
    out.push(Math.max(0, base + noise));
  }
  out[n - 1] = end;
  return out;
}

interface RawPage {
  id: string;
  label: string;
  group: string;
  url: string;
  m: CWV;
  score: number;
  d: CWV;
  dscore: number;
  transfer: Transfer;
  requests: number;
  third: number;
}

function buildProfile(cwv: CWV, score: number, seedBase: number, drift: number): ProfileData {
  const lcpTrend = series(seedBase * 7 + 1, cwv.LCP, 0.06, drift);
  const scoreTrend = series(seedBase * 13 + 3, score, 0.05, -drift).map((v) =>
    Math.max(0, Math.min(100, Math.round(v))),
  );
  const prevLcp = lcpTrend[lcpTrend.length - 2];
  const prevScore = scoreTrend[scoreTrend.length - 2];
  return {
    cwv,
    score,
    status: pageStatus(cwv),
    lcpTrend,
    scoreTrend,
    lcpDelta: cwv.LCP - prevLcp,
    scoreDelta: score - prevScore,
  };
}

const RAW: RawPage[] = [
  {
    id: "homepage",
    label: "Homepage",
    group: "core",
    url: "https://www.ehealthinsurance.com/",
    m: { LCP: 1540, CLS: 0.769, TBT: 8, FCP: 1264, TTFB: 888, INP: null },
    score: 72,
    d: { LCP: 980, CLS: 0.041, TBT: 0, FCP: 720, TTFB: 410, INP: null },
    dscore: 91,
    transfer: {
      total: 2300000,
      js: 900000,
      css: 120000,
      image: 800000,
      other: 480000,
    },
    requests: 101,
    third: 34,
  },
  {
    id: "medicare-part-b-giveback",
    label: "Medicare Part B Give-Back (Social Security)",
    group: "medicare",
    url: "https://www.ehealthinsurance.com/medicare/managing-medicare/medicare-part-b-giveback-social-security/",
    m: { LCP: 3180, CLS: 0.092, TBT: 410, FCP: 2010, TTFB: 940, INP: null },
    score: 58,
    d: { LCP: 1820, CLS: 0.038, TBT: 90, FCP: 1080, TTFB: 520, INP: null },
    dscore: 78,
    transfer: {
      total: 3100000,
      js: 1400000,
      css: 180000,
      image: 1100000,
      other: 420000,
    },
    requests: 138,
    third: 51,
  },
  {
    id: "individual-insurance-cost",
    label: "How Much Does Individual Health Insurance Cost?",
    group: "resources-ifp",
    url: "https://www.ehealthinsurance.com/resources/individual-and-family/how-much-does-individual-health-insurance-cost",
    m: { LCP: 2380, CLS: 0.061, TBT: 180, FCP: 1620, TTFB: 760, INP: null },
    score: 84,
    d: { LCP: 1420, CLS: 0.022, TBT: 40, FCP: 940, TTFB: 380, INP: null },
    dscore: 95,
    transfer: {
      total: 1900000,
      js: 760000,
      css: 140000,
      image: 640000,
      other: 360000,
    },
    requests: 88,
    third: 22,
  },
  {
    id: "dependent-on-health-plan",
    label: "Can You Add a Dependent to Your Health Insurance Plan?",
    group: "resources-ifp",
    url: "https://www.ehealthinsurance.com/resources/individual-and-family/can-added-dependent-health-insurance-plan",
    m: { LCP: 4320, CLS: 0.214, TBT: 820, FCP: 2640, TTFB: 1210, INP: null },
    score: 41,
    d: { LCP: 2380, CLS: 0.118, TBT: 320, FCP: 1380, TTFB: 690, INP: null },
    dscore: 69,
    transfer: {
      total: 4600000,
      js: 2100000,
      css: 210000,
      image: 1700000,
      other: 590000,
    },
    requests: 184,
    third: 73,
  },
  {
    id: "careers-benefits",
    label: "Careers — Benefits",
    group: "corporate",
    url: "https://www.ehealthinsurance.com/about-ehealth/careers-benefit",
    m: { LCP: 2760, CLS: 0.108, TBT: 240, FCP: 1740, TTFB: 820, INP: null },
    score: 70,
    d: { LCP: 1560, CLS: 0.047, TBT: 60, FCP: 980, TTFB: 440, INP: null },
    dscore: 88,
    transfer: {
      total: 2700000,
      js: 1100000,
      css: 160000,
      image: 980000,
      other: 460000,
    },
    requests: 119,
    third: 44,
  },
  {
    id: "two-health-insurance-plans",
    label: "Can You Have Two Health Insurance Plans?",
    group: "resources-ifp",
    url: "https://www.ehealthinsurance.com/resources/individual-and-family/can-you-have-two-health-insurance-plans",
    m: { LCP: 2190, CLS: 0.054, TBT: 120, FCP: 1480, TTFB: 700, INP: null },
    score: 86,
    d: { LCP: 1280, CLS: 0.019, TBT: 20, FCP: 860, TTFB: 360, INP: null },
    dscore: 96,
    transfer: {
      total: 1700000,
      js: 640000,
      css: 130000,
      image: 600000,
      other: 330000,
    },
    requests: 79,
    third: 18,
  },
  {
    id: "medicare-eligibility-retire-62",
    label: "Medicare Eligibility if You Retire at 62",
    group: "medicare",
    url: "https://www.ehealthinsurance.com/medicare/eligibility/if-i-retire-at-age-62-will-i-be-eligible-for-medicare-at-that-time/",
    m: { LCP: 3540, CLS: 0.182, TBT: 560, FCP: 2210, TTFB: 1010, INP: null },
    score: 52,
    d: { LCP: 1980, CLS: 0.071, TBT: 140, FCP: 1180, TTFB: 560, INP: null },
    dscore: 81,
    transfer: {
      total: 3300000,
      js: 1500000,
      css: 190000,
      image: 1150000,
      other: 460000,
    },
    requests: 147,
    third: 58,
  },
  {
    id: "out-of-pocket-maximum",
    label: "How Does an Out-of-Pocket Maximum Work?",
    group: "resources-ifp",
    url: "https://www.ehealthinsurance.com/resources/individual-and-family/pocket-maximum-work",
    m: { LCP: 2620, CLS: 0.088, TBT: 300, FCP: 1690, TTFB: 790, INP: null },
    score: 74,
    d: { LCP: 1490, CLS: 0.031, TBT: 70, FCP: 920, TTFB: 420, INP: null },
    dscore: 90,
    transfer: {
      total: 2500000,
      js: 1050000,
      css: 150000,
      image: 880000,
      other: 420000,
    },
    requests: 112,
    third: 39,
  },
  {
    id: "medicare-advantage-to-medigap",
    label: "Can I Switch from Medicare Advantage to Medigap?",
    group: "medicare",
    url: "https://www.ehealthinsurance.com/medicare/enrollment/can-i-switch-from-medicare-advantage-to-medigap/",
    m: { LCP: 1880, CLS: 0.034, TBT: 90, FCP: 1190, TTFB: 610, INP: null },
    score: 92,
    d: { LCP: 1120, CLS: 0.012, TBT: 10, FCP: 700, TTFB: 300, INP: null },
    dscore: 98,
    transfer: {
      total: 1200000,
      js: 480000,
      css: 90000,
      image: 380000,
      other: 250000,
    },
    requests: 54,
    third: 11,
  },
  {
    id: "urgent-care-cost",
    label: "How Much Does an Urgent Care Visit Cost?",
    group: "resources-ifp",
    url: "https://www.ehealthinsurance.com/resources/individual-and-family/how-much-does-an-urgent-care-visit-cost",
    m: { LCP: 2940, CLS: 0.126, TBT: 220, FCP: 1820, TTFB: 860, INP: null },
    score: 67,
    d: { LCP: 1640, CLS: 0.052, TBT: 50, FCP: 1000, TTFB: 470, INP: null },
    dscore: 87,
    transfer: {
      total: 2100000,
      js: 820000,
      css: 140000,
      image: 760000,
      other: 380000,
    },
    requests: 96,
    third: 29,
  },
];

export const PAGES: Page[] = RAW.map((p, idx) => ({
  id: p.id,
  label: p.label,
  group: p.group,
  url: p.url,
  transfer: p.transfer,
  requests: p.requests,
  third: p.third,
  mobile: buildProfile(p.m, p.score, idx + 1, 0.1),
  desktop: buildProfile(p.d, p.dscore, idx + 21, 0.06),
}));

export function summary(profile: Profile): Summary {
  const counts = { good: 0, ni: 0, poor: 0 };
  let scoreSum = 0;
  for (const p of PAGES) {
    counts[p[profile].status as "good" | "ni" | "poor"]++;
    scoreSum += p[profile].score;
  }
  return { counts, total: PAGES.length, avgScore: Math.round(scoreSum / PAGES.length) };
}

// minutes-ago offsets for the runs feed (by PAGES index, newest first)
const OFFSETS = [1, 4, 9, 16, 24, 35, 52, 78, 126, 300];
const BASE = new Date(LAST_RUN);

export interface RunEntry {
  page: Page;
  mins: number;
  at: Date;
}

export function recentRuns(limit = 7): RunEntry[] {
  return PAGES.map((page, i) => ({
    page,
    mins: OFFSETS[i] ?? i * 33 + 7,
    at: new Date(BASE.getTime() - (OFFSETS[i] ?? i * 33 + 7) * 60000),
  }))
    .sort((a, b) => a.mins - b.mins)
    .slice(0, limit);
}

export function relTime(mins: number): string {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function clockTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
