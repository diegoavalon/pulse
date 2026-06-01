import { describe, expect, test } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const workflowPath = resolve(import.meta.dirname, "../../../.github/workflows/collect.yml");
const workflow = readFileSync(workflowPath, "utf8");

describe("collect workflow contract", () => {
  test("includes scheduled and manual triggers", () => {
    expect(workflow).toContain("schedule:");
    expect(workflow).toContain('cron: "0 14 * * *"');
    expect(workflow).toContain('cron: "0 15 * * *"');
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("page_id:");
    expect(workflow).toContain("run_id:");
  });

  test("runs mobile/desktop matrix profiles", () => {
    expect(workflow).toContain("profile: mobile");
    expect(workflow).toContain("profile: desktop");
    expect(workflow).toContain("ITERATIONS");
    expect(workflow).toContain("collect-sitespeed.mjs");
  });

  test("hands off artifacts to a single committer job", () => {
    expect(workflow).toContain("name: sitespeed-${{ matrix.profile }}");
    expect(workflow).toContain("actions/download-artifact@v4");
    expect(workflow).toContain("needs: collect");
    expect(workflow).toContain("consolidate");
    expect(workflow).toContain("git add data");
    expect(workflow).toContain("git commit");
  });

  test("prevents overlapping runs", () => {
    expect(workflow).toContain("concurrency:");
    expect(workflow).toContain("group: pulse-collection");
    expect(workflow).toContain("cancel-in-progress: false");
  });
});
