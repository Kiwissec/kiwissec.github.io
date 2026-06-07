// Single source of truth for the course-category taxonomy.
//
// Consumed by:
//   - src/content.config.ts  → the `courses.cat` Zod enum
//   - src/data/site.ts       → `courseCats` (prepends the synthetic "all")
//   - src/components/CoursesCatalog.astro (client island) → `VALID` whitelist
//   - src/components/CoursesTeaser.astro → category cards (label / icon / blurb)
//
// Adding a category here updates all of the above at once. The ONE thing it
// cannot generate is the per-category colour rule `.cat-<id>` in
// src/styles/site.css — add a matching rule there too (scripts/audit-content.mjs
// fails the build if a used category has no `.cat-<id>` rule).

export const COURSE_CAT_IDS = ["awareness", "offensive", "defensive"] as const;

export type CourseCatId = (typeof COURSE_CAT_IDS)[number];

export interface CourseCatMeta {
  label: string;
  icon: string; // Font Awesome class for the teaser card
  blurb: string; // teaser card one-liner
}

export const COURSE_CAT_META: Record<CourseCatId, CourseCatMeta> = {
  awareness: {
    label: "資安意識",
    icon: "fa-solid fa-user-shield",
    blurb: "全員適用、無技術門檻，建立日常防護直覺",
  },
  offensive: {
    label: "攻防演練",
    icon: "fa-solid fa-bug",
    blurb: "技術人員的滲透測試與紅隊實戰",
  },
  defensive: {
    label: "資安防護",
    icon: "fa-solid fa-shield-halved",
    blurb: "防禦維運、DevSecOps、雲端與事件應變",
  },
};
