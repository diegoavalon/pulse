/**
 * Retention management for per-run detail records.
 *
 * Summary history is unbounded — every SummaryRecord is kept forever.
 * Full detail records (requests, screenshots) are pruned after retentionDays
 * to keep storage bounded. The run ID encodes the capture timestamp in
 * YYYY-MM-DDTHH-MM-SS format, allowing date-based pruning without stat calls.
 */

/** Parse a run ID like "2026-05-29T13-41-03" into a Date */
export function parseRunId(runId: string): Date | null {
  // Normalise the time separator: "T13-41-03" → "T13:41:03"
  const iso = runId.replace(/T(\d{2})-(\d{2})-(\d{2})$/, "T$1:$2:$3Z");
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

/** Return the age of a run in whole days relative to `now` */
export function runAgeInDays(runId: string, now: Date): number | null {
  const runDate = parseRunId(runId);
  if (!runDate) return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((now.getTime() - runDate.getTime()) / msPerDay);
}

/** True if a run should be pruned given the retention policy */
export function shouldPrune(runId: string, retentionDays: number, now: Date): boolean {
  const age = runAgeInDays(runId, now);
  if (age === null) return false; // unparseable IDs are kept (safe default)
  return age > retentionDays;
}

/** Filter a list of run IDs down to those within the retention window */
export function filterByRetention(
  runIds: string[],
  retentionDays: number,
  now: Date = new Date(),
): { keep: string[]; prune: string[] } {
  const keep: string[] = [];
  const prune: string[] = [];
  for (const id of runIds) {
    if (shouldPrune(id, retentionDays, now)) {
      prune.push(id);
    } else {
      keep.push(id);
    }
  }
  return { keep, prune };
}

/**
 * Filesystem-level pruning of detail run directories.
 * Reads the run directory listing, identifies stale runs, and removes them.
 * Summary records are left untouched regardless of run age.
 *
 * Directory structure expected:
 *   dataRoot/<pageId>/<profile>/<runId>/
 *
 * Returns the list of pruned run directory paths.
 */
export async function pruneDetailRuns(
  dataRoot: string,
  retentionDays: number,
  now: Date = new Date(),
): Promise<{ pruned: string[]; errors: Array<{ path: string; error: string }> }> {
  const { readdir, rm, stat } = await import("node:fs/promises");
  const { join } = await import("node:path");

  const pruned: string[] = [];
  const errors: Array<{ path: string; error: string }> = [];

  let pageIds: string[];
  try {
    pageIds = await readdir(dataRoot);
  } catch {
    return { pruned, errors }; // dataRoot doesn't exist yet — nothing to prune
  }

  for (const pageId of pageIds) {
    const pagePath = join(dataRoot, pageId);
    let profiles: string[];
    try {
      profiles = await readdir(pagePath);
    } catch {
      continue;
    }

    for (const profile of profiles) {
      if (profile !== "mobile" && profile !== "desktop") continue;
      const profilePath = join(pagePath, profile);
      let runIds: string[];
      try {
        runIds = await readdir(profilePath);
      } catch {
        continue;
      }

      const { prune } = filterByRetention(runIds, retentionDays, now);
      for (const runId of prune) {
        const runPath = join(profilePath, runId);
        try {
          const s = await stat(runPath);
          if (s.isDirectory()) {
            await rm(runPath, { recursive: true, force: true });
            pruned.push(runPath);
          }
        } catch (err) {
          errors.push({ path: runPath, error: String(err) });
        }
      }
    }
  }

  return { pruned, errors };
}
