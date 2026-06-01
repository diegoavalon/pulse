import { PAGES } from "$lib/data.js";
import type { EntryGenerator } from "./$types.js";

export const prerender = true;

export const entries: EntryGenerator = () => PAGES.map((p) => ({ id: p.id }));
