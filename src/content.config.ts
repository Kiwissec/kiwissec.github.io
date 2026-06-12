import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { COURSE_CAT_IDS } from "./data/course-cats";

// 常變動內容（課程 / 服務 / 消息 / 見證 / 常見問題）以 src/data/<collection>/*.json
// 每筆一檔維護，透過 Astro Content Collections 在 build 時以 Zod schema 驗證
//（schema 不符會讓 astro build 失敗）。線上內容由 public repo（kiwissec.github.io）
// 的 Sveltia CMS 維護——本 repo 的 JSON 僅為 dev 種子、會落後線上；想在這裡改
// 線上內容是常見誤區，雙 repo 分工見 README「部署與雙 repo」。穩定的單例與分類
//（nav/hero/footer/courseCats…）留在 src/data/site.ts。
//
// getCollection() 不保證順序，故消費端一律自行排序：courses/services/
// testimonials/faq 依 `order`、news 依 `date` 由新到舊。
//
// 課程資料對齊七維思官方《資訊與資安課程型錄 v20260503》。
// 課程分類字彙的單一來源為 src/data/course-cats.ts。

// CMS 可編輯的連結欄位值會原樣渲染進 <a href>，故在 schema 邊界擋掉
// javascript: / data: 等可執行 scheme：僅接受站內路徑（/ 或 # 開頭）
// 或 http(s) 絕對網址。站內路徑禁止第二個 / 或 \：// 與 /\ 會被瀏覽器
// 解析成 protocol-relative 外站網址，不是站內路徑。
const safeHref = z
  .string()
  .refine(
    (v) =>
      /^\/(?![/\\])/.test(v) || v.startsWith("#") || /^https?:\/\//.test(v),
    { message: "href 僅接受站內路徑（/ 或 # 開頭）或 http(s):// 網址" },
  );

// 五個 collection 的 loader 設定除目錄名外完全相同（per-file JSON、
// entry id 取檔名）；變更理由相同，集中一處。
const jsonLoader = (name: string) =>
  glob({
    pattern: "**/*.json",
    base: `./src/data/${name}`,
    generateId: ({ entry }) => entry.replace(/\.json$/, ""),
  });

const courses = defineCollection({
  loader: jsonLoader("courses"),
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
  loader: jsonLoader("services"),
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
          href: safeHref,
          primary: z.boolean().optional(),
          external: z.boolean().optional(),
        }),
      )
      .nonempty(),
  }),
});

const news = defineCollection({
  loader: jsonLoader("news"),
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
    // 維持純展示卡片，不破壞既有資料。限定 http(s)：裸 z.url() 會接受
    // javascript: 等可執行 scheme，而此值原樣渲染進 <a href>。
    url: z.url({ protocol: /^https?$/ }).optional(),
  }),
});

const testimonials = defineCollection({
  loader: jsonLoader("testimonials"),
  schema: z.object({
    id: z.string(),
    order: z.number().int().nonnegative(),
    q: z.string(),
    who: z.string(),
    icon: z.string(),
  }),
});

const faq = defineCollection({
  loader: jsonLoader("faq"),
  schema: z.object({
    id: z.string(),
    order: z.number().int().nonnegative(),
    q: z.string(),
    a: z.string(),
  }),
});

export const collections = { courses, services, news, testimonials, faq };
