import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const OUTPUT_ROOT = path.resolve("artifacts", "runs");
const URLS_FILE = path.resolve("urls.json");
const IMAGE = "sitespeedio/sitespeed.io:latest";

const profile = process.env.PROFILE;
const throttle = process.env.THROTTLE;
const viewport = process.env.VIEWPORT;
const iterations = process.env.ITERATIONS ?? "3";
const requestedPageId = process.env.PAGE_ID?.trim();
const overrideRunId = process.env.RUN_ID?.trim();

if (!profile || !throttle || !viewport) {
  throw new Error("PROFILE, THROTTLE, and VIEWPORT must be set by the workflow matrix.");
}

const urls = JSON.parse(await fs.readFile(URLS_FILE, "utf8"));
const selected = requestedPageId ? urls.filter((u) => u.id === requestedPageId) : urls;

if (selected.length === 0) {
  throw new Error(
    requestedPageId
      ? `page_id '${requestedPageId}' was not found in urls.json`
      : "No tracked pages found in urls.json",
  );
}

const runId =
  overrideRunId ||
  new Date()
    .toISOString()
    .replace(/:/g, "-")
    .replace(/\.\d{3}Z$/, "");
const [viewportWidth, viewportHeight] = viewport.split("x");

await fs.mkdir(OUTPUT_ROOT, { recursive: true });

for (const pageMeta of selected) {
  const pageId = pageMeta.id;
  const url = pageMeta.url;
  const pageRunRoot = path.join(OUTPUT_ROOT, pageId, profile, runId);
  const rawRoot = path.join(pageRunRoot, "raw");
  await fs.mkdir(rawRoot, { recursive: true });

  await runSitespeed({
    url,
    outputFolder: rawRoot,
    throttle,
    iterations,
    viewportWidth,
    viewportHeight,
  });

  const normalized = await normalizeRunOutput(rawRoot);
  if (!normalized.browsertime) {
    throw new Error(`No browsertime JSON found for page '${pageId}' (${profile}).`);
  }

  await fs.copyFile(normalized.browsertime, path.join(pageRunRoot, "browsertime.json"));
  if (normalized.har) await fs.copyFile(normalized.har, path.join(pageRunRoot, "har.json"));
  if (normalized.coach) await fs.copyFile(normalized.coach, path.join(pageRunRoot, "coach.json"));

  const screenshotsDest = path.join(pageRunRoot, "screenshots");
  if (normalized.screenshots.length > 0) {
    await fs.mkdir(screenshotsDest, { recursive: true });
    await Promise.all(
      normalized.screenshots.map(async (src) => {
        await fs.copyFile(src, path.join(screenshotsDest, path.basename(src)));
      }),
    );
  }
}

async function runSitespeed({
  url,
  outputFolder,
  throttle,
  iterations,
  viewportWidth,
  viewportHeight,
}) {
  const args = [
    "run",
    "--rm",
    "-v",
    `${process.cwd()}:/sitespeed.io`,
    IMAGE,
    url,
    "--browsertime.iterations",
    iterations,
    "--browsertime.connectivity.profile",
    throttle,
    "--browsertime.viewport",
    `${viewportWidth}x${viewportHeight}`,
    "--outputFolder",
    outputFolder.replace(process.cwd(), "/sitespeed.io"),
    "--xvfb",
    "--screenshot",
    "--video",
    "false",
    "--slug",
    "run",
  ];

  await run("docker", args);
}

async function normalizeRunOutput(rawRoot) {
  const allFiles = await walkFiles(rawRoot);
  const jsonFiles = allFiles.filter((f) => f.endsWith(".json"));
  const harFiles = allFiles.filter((f) => f.endsWith(".har"));
  const imageFiles = allFiles.filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));

  const browsertime =
    jsonFiles.find((f) => /browsertime(\.json)?$/i.test(path.basename(f))) ??
    jsonFiles.find((f) => /browsertime/i.test(f));
  const coach =
    jsonFiles.find((f) => /coach(\.json)?$/i.test(path.basename(f))) ??
    jsonFiles.find((f) => /coach/i.test(f));
  const har =
    harFiles.find((f) => /browsertime\.har$/i.test(path.basename(f))) ??
    harFiles[0] ??
    jsonFiles.find((f) => /har(\.json)?$/i.test(path.basename(f)));

  return {
    browsertime,
    coach,
    har,
    screenshots: imageFiles,
  };
}

async function walkFiles(root) {
  const out = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else out.push(fullPath);
    }
  }
  await walk(root);
  return out;
}

async function run(cmd, args) {
  await new Promise((resolve, reject) => {
    const cp = spawn(cmd, args, { stdio: "inherit" });
    cp.on("error", reject);
    cp.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}
