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
//
// loadCollectionEntries 另回傳檔名（{ file, data }）：audit 用它檢查
// id ↔ 檔名的不變量（路由由檔名產生、連結與測試用 id 欄位）。

import { readdirSync, readFileSync } from "node:fs";

const DATA_DIR = new URL("./", import.meta.url);

export function loadCollectionEntries(name) {
  const dir = new URL(`${name}/`, DATA_DIR);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => {
      try {
        return {
          file: f,
          data: JSON.parse(readFileSync(new URL(f, dir), "utf8")),
        };
      } catch (err) {
        // SyntaxError 不含檔名，沒有這層包裝時呼叫端只能猜是哪個檔壞了。
        throw new Error(`src/data/${name}/${f}: ${err.message}`, {
          cause: err,
        });
      }
    });
}

export function loadCollection(name) {
  return loadCollectionEntries(name).map((e) => e.data);
}
