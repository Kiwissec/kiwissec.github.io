// Read a content collection stored as one JSON file per entry under
// src/data/<name>/ and return the parsed entry objects.
//
// Shared by the build-time content audit (scripts/audit-content.mjs) and the
// Playwright smoke tests (tests/smoke.spec.ts) so both see exactly the rows the
// site renders. Astro's own glob() loader in src/content.config.ts reads the
// same files at build time but only runs inside the Astro runtime, so it can't
// be reused here — this helper is the dependency-free (node: builtins only)
// equivalent for the audit/test contexts.
//
// Order is by filename for determinism; callers that care about display order
// sort by `order` / `date` themselves (mirroring the components, which never
// rely on collection order — see src/content.config.ts).

import { readdirSync, readFileSync } from "node:fs";

const DATA_DIR = new URL("./", import.meta.url);

export function loadCollection(name) {
  const dir = new URL(`${name}/`, DATA_DIR);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(new URL(f, dir), "utf8")));
}
