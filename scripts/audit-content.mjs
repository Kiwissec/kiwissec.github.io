// Content-integrity audit for src/data/*.json.
//
// Fast, precise checks for content that now lives in plain JSON a
// non-technical editor (or a future CMS) may edit by hand. What the existing
// safety nets do and don't catch:
//
//   - `astro build` (Zod) validates field types/enums but is BLIND to all
//     three issues below.
//   - The e2e suite pins each collection's total count (courses 26, services 4,
//     testimonials 6, news 6), so it INDIRECTLY catches a dropped/overwritten
//     row — but only as a count mismatch ("expected 26, received 25"), not a
//     precise diagnosis, and only while those counts stay maintained.
//   - Duplicate `order` and a missing / non-file `news.img` change no count and
//     produce no build error, so NEITHER build nor e2e catches them at all.
//
// Checks (all hard-fail):
//   1. `id` present + unique — file() SILENTLY DROPS an id-less row (build
//      exits 0) and only WARNs on a duplicate id (last wins). Gives a precise,
//      count-independent diagnosis instead of a vague count drift.
//   2. `order` unique (ordered collections) — equal order => unstable sort,
//      counts unchanged => invisible to build and e2e.
//   3. `news.img` is a real FILE under public/assets/news/ — public/ is copied
//      verbatim, so a missing file (or a same-named directory) renders a broken
//      <img> with no build error. Uses statSync().isFile() — existsSync() alone
//      would pass a directory.
//   4. every DECLARED category (COURSE_CAT_IDS in src/data/course-cats.ts) has a
//      `.cat-<id>` rule in src/styles/site.css — the taxonomy is single-sourced
//      but the per-category colour rule can't be generated from it; a missing
//      rule renders uncoloured cards silently.
//
// Dependency-free (node: builtins only). Collects every violation, then exits
// 1 if any were found. Wired into CI before the build (fail-fast).

import { readFileSync, statSync } from "node:fs";

// Repo root, anchored to this script's location (scripts/), not the cwd.
const root = new URL("../", import.meta.url);
const readJson = (rel) => JSON.parse(readFileSync(new URL(rel, root), "utf8"));

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

const collections = {
  courses: readJson("src/data/courses.json"),
  services: readJson("src/data/services.json"),
  news: readJson("src/data/news.json"),
  testimonials: readJson("src/data/testimonials.json"),
};

// 1. `id` present + unique (every collection).
for (const [name, items] of Object.entries(collections)) {
  const seen = new Map();
  items.forEach((item, i) => {
    const id = item?.id;
    if (typeof id !== "string" || id.trim() === "") {
      fail(`[${name}] item #${i} has no valid "id" — file() would silently drop it`);
      return;
    }
    if (seen.has(id)) {
      fail(`[${name}] duplicate id "${id}" (#${seen.get(id)} and #${i}) — later overwrites earlier`);
    } else {
      seen.set(id, i);
    }
  });
}

// 2. `order` present + unique (ordered collections only; news is date-sorted).
for (const name of ["courses", "services", "testimonials"]) {
  const seen = new Map();
  for (const item of collections[name]) {
    const order = item?.order;
    if (typeof order !== "number" || !Number.isInteger(order)) {
      fail(`[${name}] "${item?.id ?? "?"}" has no integer "order"`);
      continue;
    }
    if (seen.has(order)) {
      fail(`[${name}] duplicate order ${order} ("${seen.get(order)}" and "${item.id}") — unstable render order`);
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
    fail(`[news] "${item.id}" img "${img}" must be a bare filename (no "/" or "..")`);
    continue;
  }
  if (!isFile(`public/assets/news/${img}`)) {
    fail(`[news] "${item.id}" img "${img}" is not a file under public/assets/news/ — renders a broken image with no build error`);
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
  fail(`[course-cats] could not read COURSE_CAT_IDS from src/data/course-cats.ts`);
}
// Strip CSS comments, then match a real selector token (not a substring) so
// ".cat-awarenessX" or "/* .cat-foo */" don't falsely satisfy ".cat-foo".
const css = readFileSync(new URL("src/styles/site.css", root), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);
for (const cat of declaredCats) {
  if (!new RegExp(`\\.cat-${cat}(?![\\w-])`).test(css)) {
    fail(`[course-cats] category "${cat}" has no ".cat-${cat}" rule in src/styles/site.css — cards render uncoloured`);
  }
}

if (errors.length > 0) {
  console.error(`\ncontent audit FAILED — ${errors.length} issue(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  "content audit passed: id present+unique, order unique, news images exist, category CSS present.",
);
