import { describe, test, expect } from "vite-plus/test";
import { parseRunId, runAgeInDays, shouldPrune, filterByRetention } from "../src/retention.js";

const NOW = new Date("2026-05-29T13:41:03Z");

// ---- parseRunId -------------------------------------------------------------

describe("parseRunId", () => {
  test("parses standard sitespeed run ID", () => {
    const d = parseRunId("2026-05-29T13-41-03");
    expect(d).not.toBeNull();
    expect(d!.getUTCFullYear()).toBe(2026);
    expect(d!.getUTCMonth()).toBe(4); // May = 4
    expect(d!.getUTCDate()).toBe(29);
  });

  test("parses run from 14 days ago", () => {
    const d = parseRunId("2026-05-15T07-00-00");
    expect(d).not.toBeNull();
    expect(d!.getUTCDate()).toBe(15);
  });

  test("returns null for malformed run ID", () => {
    expect(parseRunId("not-a-run-id")).toBeNull();
    expect(parseRunId("")).toBeNull();
    expect(parseRunId("2026-99-99T00-00-00")).toBeNull();
  });
});

// ---- runAgeInDays -----------------------------------------------------------

describe("runAgeInDays", () => {
  test("today's run is 0 days old", () => {
    expect(runAgeInDays("2026-05-29T13-41-03", NOW)).toBe(0);
  });

  test("run from 1 day ago is 1 day old", () => {
    expect(runAgeInDays("2026-05-28T13-41-03", NOW)).toBe(1);
  });

  test("run from 14 days ago is 14 days old", () => {
    expect(runAgeInDays("2026-05-15T13-41-03", NOW)).toBe(14);
  });

  test("run from 30 days ago is 30 days old", () => {
    expect(runAgeInDays("2026-04-29T13-41-03", NOW)).toBe(30);
  });

  test("returns null for invalid run ID", () => {
    expect(runAgeInDays("invalid", NOW)).toBeNull();
  });
});

// ---- shouldPrune ------------------------------------------------------------

describe("shouldPrune", () => {
  const RETENTION = 14;

  test("run today should not be pruned", () => {
    expect(shouldPrune("2026-05-29T13-41-03", RETENTION, NOW)).toBe(false);
  });

  test("run exactly at retention boundary should not be pruned", () => {
    expect(shouldPrune("2026-05-15T13-41-03", RETENTION, NOW)).toBe(false);
  });

  test("run one day beyond retention should be pruned", () => {
    expect(shouldPrune("2026-05-14T13-41-03", RETENTION, NOW)).toBe(true);
  });

  test("very old run should be pruned", () => {
    expect(shouldPrune("2026-01-01T00-00-00", RETENTION, NOW)).toBe(true);
  });

  test("unparseable run ID is kept (safe default)", () => {
    expect(shouldPrune("garbage-id", RETENTION, NOW)).toBe(false);
  });
});

// ---- filterByRetention ------------------------------------------------------

describe("filterByRetention", () => {
  const RUNS = [
    "2026-05-29T13-41-03", // today
    "2026-05-28T13-41-03", // 1 day ago
    "2026-05-15T13-41-03", // 14 days ago (boundary)
    "2026-05-14T13-41-03", // 15 days ago — prune
    "2026-04-29T13-41-03", // 30 days ago — prune
    "2026-01-01T00-00-00", // very old — prune
  ];

  test("keeps runs within retention window", () => {
    const { keep } = filterByRetention(RUNS, 14, NOW);
    expect(keep).toHaveLength(3);
    expect(keep).toContain("2026-05-29T13-41-03");
    expect(keep).toContain("2026-05-28T13-41-03");
    expect(keep).toContain("2026-05-15T13-41-03");
  });

  test("prunes runs beyond retention window", () => {
    const { prune } = filterByRetention(RUNS, 14, NOW);
    expect(prune).toHaveLength(3);
    expect(prune).toContain("2026-05-14T13-41-03");
    expect(prune).toContain("2026-04-29T13-41-03");
    expect(prune).toContain("2026-01-01T00-00-00");
  });

  test("empty list returns empty keep and prune", () => {
    const { keep, prune } = filterByRetention([], 14, NOW);
    expect(keep).toHaveLength(0);
    expect(prune).toHaveLength(0);
  });

  test("shorter retention window prunes more runs", () => {
    const { prune } = filterByRetention(RUNS, 7, NOW);
    expect(prune.length).toBeGreaterThan(3);
  });

  test("infinite retention window keeps everything", () => {
    const { keep, prune } = filterByRetention(RUNS, 999999, NOW);
    expect(keep).toHaveLength(RUNS.length);
    expect(prune).toHaveLength(0);
  });
});
