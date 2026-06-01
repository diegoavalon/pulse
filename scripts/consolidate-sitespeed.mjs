import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const extractorDist = pathToFileURL(path.resolve("packages/extractor/dist/index.mjs")).href;
const { extractAndPersistRun } = await import(extractorDist);

const artifactsRoot = path.resolve(process.argv[2] ?? "collection-artifacts");
const dataRoot = path.resolve(process.argv[3] ?? "data");
const urls = JSON.parse(await fs.readFile(path.resolve("urls.json"), "utf8"));
const urlById = new Map(urls.map((u) => [u.id, u]));

const runDirs = await findRunDirs(artifactsRoot);
if (runDirs.length === 0) {
  throw new Error(`No extracted run directories found under ${artifactsRoot}`);
}

const warnings = [];
for (const runDir of runDirs) {
  const rel = path.relative(artifactsRoot, runDir).split(path.sep);
  const idx = rel.indexOf("runs");
  if (idx === -1 || rel.length < idx + 4) {
    warnings.push(`Skipping unrecognized run path: ${runDir}`);
    continue;
  }

  const pageId = rel[idx + 1];
  const profile = rel[idx + 2];
  const runId = rel[idx + 3];
  const pageMeta = urlById.get(pageId);
  if (!pageMeta) {
    warnings.push(`Skipping unknown page id '${pageId}' from ${runDir}`);
    continue;
  }

  const opts = {
    pageId,
    label: pageMeta.label,
    url: pageMeta.url,
    group: pageMeta.group,
    profile,
    runId,
    timestamp: runIdToIsoTimestamp(runId),
    iterations: 3,
    domain: new URL(pageMeta.url).hostname,
  };

  const result = await extractAndPersistRun(runDir, dataRoot, opts, 14);
  if ("errors" in result) {
    warnings.push(
      `Extraction failed for ${pageId}/${profile}/${runId}: ${result.errors.join("; ")}`,
    );
    continue;
  }
  warnings.push(...result.warnings.map((w) => `${pageId}/${profile}/${runId}: ${w}`));
}

if (warnings.length > 0) {
  await fs.writeFile(
    path.join(dataRoot, "_extract-warnings.log"),
    warnings.join("\n") + "\n",
    "utf8",
  );
}

async function findRunDirs(root) {
  const matches = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const names = new Set(entries.map((e) => e.name));
    if (names.has("browsertime.json")) {
      matches.push(dir);
      return;
    }
    await Promise.all(
      entries.filter((e) => e.isDirectory()).map((e) => walk(path.join(dir, e.name))),
    );
  }
  await walk(root);
  return matches;
}

function runIdToIsoTimestamp(runId) {
  const [datePart, timePart = "00-00-00"] = runId.split("T");
  const iso = `${datePart}T${timePart.replace(/-/g, ":")}Z`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}
