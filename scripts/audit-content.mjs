// Content-integrity audit for src/data/*.json.
//
// Fast, precise checks for content that now lives in plain JSON a
// non-technical editor (or a future CMS) may edit by hand. What the existing
// safety nets do and don't catch:
//
//   - `astro build` (Zod) validates field types/enums but is BLIND to all
//     the issues below.
//   - The e2e suite derives each collection's expected count from the same
//     JSON (tests/smoke.spec.ts), so it INDIRECTLY catches a dropped/
//     overwritten row — but only as a count mismatch, not a precise diagnosis.
//   - Duplicate `order` and a missing / non-file `news.img` change no count and
//     produce no build error, so NEITHER build nor e2e catches them at all.
//
// Checks (all hard-fail):
//   1. `id` equals its filename (sans .json) — routes derive from the FILENAME
//      (the glob loader's generateId) while links and the e2e tests read the
//      `id` FIELD, so a drift 404s /courses/<id>/ in e2e with a confusing
//      message. Equality also implies id presence and uniqueness (filenames
//      are unique), which Zod's per-file validation can't see across files.
//   2. `order` unique (ordered collections) — equal order => unstable sort,
//      counts unchanged => invisible to build and e2e.
//   3. `news.img` is a real FILE under public/assets/news/ AND real WebP
//      (.webp extension + RIFF/WEBP magic bytes) — public/ is copied verbatim,
//      so a missing file (or a same-named directory) renders a broken <img>
//      with no build error. The CMS auto-converts supported uploads
//      (JPG/PNG/GIF/AVIF) to WebP, but HEIC/BMP/TIFF pass through unchanged
//      and a direct push to the branch bypasses the CMS entirely — this check
//      is what makes "news images are WebP" an enforced invariant rather than
//      a hope. Magic bytes catch a renamed non-WebP file the extension check
//      would trust.
//   4. every DECLARED category (COURSE_CAT_IDS in src/data/course-cats.ts) has a
//      `.cat-<id>` rule in src/styles/site.css — the taxonomy is single-sourced
//      but the per-category colour rule can't be generated from it; a missing
//      rule renders uncoloured cards silently.
//   5. no collection is empty — deleting the last entry in the CMS removes the
//      whole directory from the checkout; the build still exits 0 and renders a
//      hollow section (the sync script's rollout check only guards NEW
//      collections, and only at sync time).
//   6. news `tag` is not the show-all sentinel「全部」— NewsList builds its
//      filter tabs as ["全部", ...tags] and treats 全部 as "show everything",
//      so a real tag named 全部 renders a second conflicting button that can
//      never narrow the list; the tag field is free text in the CMS, so this
//      is the only place the collision can be caught with a clear message.
//
// Dependency-free (node: builtins only). Collects every violation, then exits
// 1 if any were found. Wired into CI before the build (fail-fast).

import { readFileSync, statSync } from "node:fs";
import { loadCollectionEntries } from "../src/data/_loadCollection.js";

// Repo root, anchored to this script's location (scripts/), not the cwd.
const root = new URL("../", import.meta.url);

// A valid asset must be a regular FILE: statSync throws on a missing path and
// .isFile() is false for a directory (which existsSync() would wrongly accept).
const isFile = (rel) => {
  try {
    return statSync(new URL(rel, root)).isFile();
  } catch {
    return false;
  }
};

const errors = [];
const fail = (msg) => errors.push(msg);

// readdirSync throws when the directory itself is gone (git drops empty dirs,
// so "CMS deleted the last entry" looks like a missing directory) — report that
// as a clean audit failure instead of an unhandled exception. Other errors
// (e.g. malformed JSON) carry the failing file in their message and must NOT
// be misreported as a seeding problem.
const loadOrEmpty = (name) => {
  try {
    return loadCollectionEntries(name);
  } catch (err) {
    fail(
      err?.code === "ENOENT"
        ? `[${name}] src/data/${name}/ is missing or unreadable — not seeded?`
        : `[${name}] ${err.message}`,
    );
    // null（而非 []）標記「載入失敗、已報錯」：避免檢查 5 對其實有檔案
    // 的 collection 疊加一條誤導的 empty 訊息。
    return null;
  }
};

// entries 保留檔名供檢查 1；其餘檢查只需要資料本身。
const collectionEntries = {
  courses: loadOrEmpty("courses"),
  services: loadOrEmpty("services"),
  news: loadOrEmpty("news"),
  testimonials: loadOrEmpty("testimonials"),
  faq: loadOrEmpty("faq"),
};
const collections = Object.fromEntries(
  Object.entries(collectionEntries).map(([name, entries]) => [
    name,
    (entries ?? []).map((e) => e.data),
  ]),
);

// 5. no collection may be empty (an emptied collection renders a hollow
//    section with no build error; see header note). Skips collections that
//    already failed to load (null) — they have a precise error already.
for (const [name, entries] of Object.entries(collectionEntries)) {
  if (entries && entries.length === 0) {
    fail(`[${name}] collection is empty — its section renders hollow`);
  }
}

// 1. `id` equals its filename (every collection; see header note 1).
for (const [name, entries] of Object.entries(collectionEntries)) {
  for (const { file, data } of entries ?? []) {
    const expected = file.replace(/\.json$/, "");
    if (data?.id !== expected) {
      fail(
        `[${name}] ${file}: id "${data?.id ?? "(missing)"}" must equal the filename "${expected}" — routes use the filename, links and tests use the id`,
      );
    }
  }
}

// 2. `order` present + unique (ordered collections only; news is date-sorted).
for (const name of ["courses", "services", "testimonials", "faq"]) {
  const seen = new Map();
  for (const item of collections[name]) {
    const order = item?.order;
    if (typeof order !== "number" || !Number.isInteger(order)) {
      fail(`[${name}] "${item?.id ?? "?"}" has no integer "order"`);
      continue;
    }
    if (seen.has(order)) {
      fail(
        `[${name}] duplicate order ${order} ("${seen.get(order)}" and "${item.id}") — unstable render order`,
      );
    } else {
      seen.set(order, item.id);
    }
  }
}

// 3. news `img` is a safe bare filename that exists under public/assets/news/.
for (const item of collections.news) {
  const img = item?.img;
  if (typeof img !== "string" || img.trim() === "") {
    fail(`[news] "${item?.id ?? "?"}" has no "img"`);
    continue;
  }
  if (/[\\/]/.test(img) || img.includes("..")) {
    fail(
      `[news] "${item.id}" img "${img}" must be a bare filename (no "/" or "..")`,
    );
    continue;
  }
  if (!isFile(`public/assets/news/${img}`)) {
    fail(
      `[news] "${item.id}" img "${img}" is not a file under public/assets/news/ — renders a broken image with no build error`,
    );
    continue;
  }
  if (!/\.webp$/i.test(img)) {
    fail(
      `[news] "${item.id}" img "${img}" is not .webp — the CMS auto-converts JPG/PNG/GIF/AVIF uploads, but HEIC/BMP/TIFF (and files pushed straight to the branch) land unchanged; convert the image to WebP and re-upload`,
    );
    continue;
  }
  const bytes = readFileSync(new URL(`public/assets/news/${img}`, root));
  if (
    bytes.length < 12 ||
    bytes.toString("latin1", 0, 4) !== "RIFF" ||
    bytes.toString("latin1", 8, 12) !== "WEBP"
  ) {
    fail(
      `[news] "${item.id}" img "${img}" has a .webp name but not WebP bytes (RIFF/WEBP header missing) — re-export it as real WebP`,
    );
  }
}

// 6. news `tag` must not collide with the show-all sentinel (see header
//    note 6).
for (const item of collections.news) {
  if (item?.tag === "全部") {
    fail(
      `[news] "${item.id}" uses the reserved tag "全部" — that label is the show-all filter; pick another tag`,
    );
  }
}

// 4. every DECLARED course category has a `.cat-<id>` colour rule in site.css.
//    The taxonomy is single-sourced in src/data/course-cats.ts and everything
//    else (Zod enum, courseCats, the island VALID, teaser icon/blurb) is derived
//    from it — so those can't drift. The ONE copy it can't generate is the CSS
//    colour rule. We check the DECLARED set (COURSE_CAT_IDS), not just the cats
//    courses currently use, because the UI renders a tab/teaser card for every
//    declared category even before a course uses it.
//    node can't reliably import a .ts, so read the single, stable source line.
const catSrc = readFileSync(new URL("src/data/course-cats.ts", root), "utf8");
const catMatch = catSrc.match(/COURSE_CAT_IDS\s*=\s*\[([^\]]*)\]/);
const declaredCats = catMatch
  ? [...catMatch[1].matchAll(/["']([^"']+)["']/g)].map((m) => m[1])
  : [];
if (declaredCats.length === 0) {
  fail(
    `[course-cats] could not read COURSE_CAT_IDS from src/data/course-cats.ts`,
  );
}
// Strip CSS comments, then match a real selector token (not a substring) so
// ".cat-awarenessX" or "/* .cat-foo */" don't falsely satisfy ".cat-foo".
const css = readFileSync(new URL("src/styles/site.css", root), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);
for (const cat of declaredCats) {
  if (!new RegExp(`\\.cat-${cat}(?![\\w-])`).test(css)) {
    fail(
      `[course-cats] category "${cat}" has no ".cat-${cat}" rule in src/styles/site.css — cards render uncoloured`,
    );
  }
}

if (errors.length > 0) {
  console.error(`\ncontent audit FAILED — ${errors.length} issue(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  "content audit passed: id matches filename, order unique, news images are real WebP, news tags valid, category CSS present, no empty collection.",
);
