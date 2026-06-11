import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { COURSE_CAT_IDS } from "./data/course-cats";

// 常變動內容（課程 / 服務 / 消息 / 見證 / 常見問題）以 src/data/*.json 維護，透過
// Astro Content Collections 在 build 時以 Zod schema 驗證（schema 不符會讓 astro
// build 失敗），與呈現分離、利於日後 CMS 編輯。穩定的單例與分類（nav/hero/footer/
// courseCats…）仍留在 src/data/site.ts。
//
// getCollection() 不保證順序，故消費端一律自行排序：courses/services/
// testimonials/faq 依 `order`、news 依 `date` 由新到舊。
//
// 課程資料對齊七維思官方《資訊與資安課程型錄 v20260503》。
// 課程分類字彙的單一來源為 src/data/course-cats.ts。

const courses = defineCollection({
  loader: glob({
    pattern: "**/*.json",
    base: "./src/data/courses",
    generateId: ({ entry }) => entry.replace(/\.json$/, ""),
  }),
  schema: z.object({
    id: z.string(),
    order: z.number().int().nonnegative(),
    cat: z.enum(COURSE_CAT_IDS),
    title: z.string(),
    tags: z.array(z.string()).nonempty(),
    desc: z.string(),
    hours: z.string(),
    // 課程內頁（/courses/<id>）的延伸內容，對齊 kiwissec.com 既有課程頁結構：
    // 介紹 / 課程大綱 / 適用人員 / 課程目標。皆 optional 作漸進增強——未填時內頁
    // 仍以摘要＋洽詢 CTA 正常呈現，故先上 schema、後補內容不會破壞 build。
    intro: z.string().optional(),
    outline: z.array(z.string()).optional(),
    audience: z.string().optional(),
    objectives: z.array(z.string()).optional(),
  }),
});

const services = defineCollection({
  loader: glob({
    pattern: "**/*.json",
    base: "./src/data/services",
    generateId: ({ entry }) => entry.replace(/\.json$/, ""),
  }),
  schema: z.object({
    id: z.string(),
    order: z.number().int().nonnegative(),
    icon: z.string(),
    name: z.string(),
    short: z.string(),
    desc: z.string(),
    points: z.array(z.string()).nonempty(),
    cta: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
          primary: z.boolean().optional(),
          external: z.boolean().optional(),
        }),
      )
      .nonempty(),
  }),
});

const news = defineCollection({
  loader: glob({
    pattern: "**/*.json",
    base: "./src/data/news",
    generateId: ({ entry }) => entry.replace(/\.json$/, ""),
  }),
  schema: z.object({
    id: z.string(),
    tag: z.string(),
    // 保持字串（勿用 z.coerce.date()）：NewsCard 直接渲染 {item.date}，
    // Date 物件會印成 "Tue Jul 31 2023"；字串亦可正確排序。
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    img: z.string(),
    title: z.string(),
    desc: z.string(),
    // 連往原始貼文（例如 Facebook）；optional 以漸進增強——留空時 NewsCard
    // 維持純展示卡片，不破壞既有資料。
    url: z.url().optional(),
  }),
});

const testimonials = defineCollection({
  loader: glob({
    pattern: "**/*.json",
    base: "./src/data/testimonials",
    generateId: ({ entry }) => entry.replace(/\.json$/, ""),
  }),
  schema: z.object({
    id: z.string(),
    order: z.number().int().nonnegative(),
    q: z.string(),
    who: z.string(),
    icon: z.string(),
  }),
});

const faq = defineCollection({
  loader: glob({
    pattern: "**/*.json",
    base: "./src/data/faq",
    generateId: ({ entry }) => entry.replace(/\.json$/, ""),
  }),
  schema: z.object({
    id: z.string(),
    order: z.number().int().nonnegative(),
    q: z.string(),
    a: z.string(),
  }),
});

export const collections = { courses, services, news, testimonials, faq };
