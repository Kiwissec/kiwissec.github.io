import { test, expect } from "@playwright/test";
// Counts are derived from the same data sources the pages render from, so adding
// or removing a course / service / news item / testimonial needs NO test edit
// (content is hand-maintained in src/data/*.json by non-engineers). The tests
// still assert the rendered count MATCHES the data and that filters behave —
// only the magic numbers are gone.
import { loadCollection } from "../src/data/_loadCollection.js";
import { resources } from "../src/data/site";
import { COURSE_CAT_IDS, COURSE_CAT_META } from "../src/data/course-cats";

const courses = loadCollection("courses");
const news = loadCollection("news");
const services = loadCollection("services");
const testimonials = loadCollection("testimonials");

const coursesInCat = (cat: string) =>
  courses.filter((c) => c.cat === cat).length;

// Pick a category that currently has courses so the filter / deep-link tests stay
// meaningful as content changes (the tab itself always renders from the taxonomy,
// so this only guards against an empty category making the assertion trivial).
const FILTER_CAT =
  COURSE_CAT_IDS.find((id) => coursesInCat(id) > 0) ?? COURSE_CAT_IDS[0];

// Derive a search term that exists in the data (first course's first tag; the
// schema guarantees tags is non-empty) so the search test never silently degrades
// when course copy is edited. Mirror CoursesCatalog's searchText (title + desc +
// tags, lower-cased) so the expected hit count tracks the data.
const SEARCH_TERM = courses[0].tags[0];
const searchHits = courses.filter((c) =>
  (c.title + " " + c.desc + " " + c.tags.join(" "))
    .toLowerCase()
    .includes(SEARCH_TERM.toLowerCase()),
).length;

// Derive an existing news tag (prefer one that doesn't cover every item, so the
// filter visibly narrows) — its tab is then guaranteed to render even after
// partners rename or remove tags, which is editable per the maintenance guide.
const newsTags = [...new Set(news.map((n) => n.tag))];
const NEWS_TAG =
  newsTags.find((t) => news.filter((n) => n.tag === t).length < news.length) ??
  newsTags[0];
const newsInTag = news.filter((n) => n.tag === NEWS_TAG).length;

// News items may carry an optional external `url` (e.g. the source Facebook
// post) which renders a new-tab link. Course detail content (intro / outline /
// audience / objectives) is optional too — pick a course that has an outline so
// the detail-page assertion stays meaningful as content is edited.
const newsWithUrl = news.filter(
  (n) => typeof n.url === "string" && n.url.length > 0,
);
const courseWithOutline = courses.find(
  (c) => Array.isArray(c.outline) && c.outline.length > 0,
);

const routes = [
  "/",
  "/services/",
  "/courses/",
  "/news/",
  "/policy/",
  "/terms/",
  "/return/",
  "/consumer/",
];

test.describe("every page loads cleanly", () => {
  for (const route of routes) {
    test(`${route} returns 200, renders nav+footer, no console errors`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      const resp = await page.goto(route);
      expect(resp?.status()).toBe(200);
      await expect(page.locator(".nav-brand")).toBeVisible();
      await expect(page.locator("footer.footer")).toBeVisible();
      expect(errors, errors.join("\n")).toEqual([]);
    });
  }
});

test.describe("legal pages show their last-updated date", () => {
  for (const route of ["/policy/", "/terms/", "/consumer/", "/return/"]) {
    test(`${route} renders the legal-updated line`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator(".legal-updated")).toContainText(
        "最後更新日期",
      );
    });
  }
});

test("unknown routes get the branded 404 page", async ({ page }) => {
  const resp = await page.goto("/no-such-page/");
  expect(resp?.status()).toBe(404);
  await expect(page.locator(".nav-brand")).toBeVisible();
  await expect(page.locator("h1")).toContainText("找不到頁面");
  await expect(page.locator("footer.footer")).toBeVisible();
  // The 404 content renders at arbitrary URLs (and /404.html answers 200), so
  // it must not advertise indexable signals: noindex, no canonical, no og:url.
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
});

test("sitemap lists real pages and excludes the 404 page", async ({
  request,
}) => {
  // Pins @astrojs/sitemap's automatic 404 exclusion so a future major bump
  // can't silently start advertising the 404 page (or drop real pages).
  const resp = await request.get("/sitemap-0.xml");
  expect(resp.status()).toBe(200);
  const xml = await resp.text();
  expect(xml).toContain("/services/");
  expect(xml).not.toContain("/404/");
});

test.describe("canonical and og:url name the final trailing-slash URL", () => {
  // `site` differs between preview (127.0.0.1) and production, so compare
  // pathnames: the canonical must use the same trailing-slash form the page is
  // actually served at (and that the sitemap declares), not a 301 source.
  for (const route of ["/", "/services/", `/courses/${courses[0].id}/`]) {
    test(`${route} canonical matches the served path`, async ({ page }) => {
      await page.goto(route);
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(canonical).toBeTruthy();
      expect(new URL(canonical!).pathname).toBe(new URL(page.url()).pathname);
      const ogUrl = await page
        .locator('meta[property="og:url"]')
        .getAttribute("content");
      expect(ogUrl).toBe(canonical);
    });
  }
});

test("internal nav and footer links use the trailing-slash form", async ({
  page,
}) => {
  await page.goto("/");
  const hrefs = await page
    .locator(".nav-links a, footer.footer a")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
  const internalPages = hrefs.filter(
    (h) => h.startsWith("/") && !h.includes("#"),
  );
  expect(internalPages.length).toBeGreaterThan(0);
  for (const href of internalPages) {
    expect(href, `${href} should end with a trailing slash`).toMatch(
      /\/(\?.*)?$/,
    );
  }
});

test("home matches the design composition", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero-brand")).toHaveText("七維思資安");
  await expect(page.locator(".hero h1 .hl")).toHaveText("學習資安不拐彎");
  await expect(page.locator(".prod.prod-link")).toHaveCount(services.length); // services teaser
  await expect(page.locator(".cat-card")).toHaveCount(COURSE_CAT_IDS.length); // course categories
  await expect(page.locator(".voice-card")).toHaveCount(testimonials.length); // testimonials
  await expect(page.locator(".res-card")).toHaveCount(resources.length); // learning resources
  await expect(page.locator("#news")).toHaveCount(0); // news removed from landing
});

test("courses: category filter, search and ?cat= deep-link", async ({
  page,
}) => {
  await page.goto("/courses/");
  await expect(page.locator(".course-card")).toHaveCount(courses.length);

  await page.click(`.course-tab[data-cat="${FILTER_CAT}"]`);
  await expect(page.locator(".course-card:visible")).toHaveCount(
    coursesInCat(FILTER_CAT),
  );

  await page.click('.course-tab[data-cat="all"]');
  await page.fill(".course-search-input", SEARCH_TERM);
  await expect(page.locator(".course-card:visible")).toHaveCount(searchHits);

  await page.goto(`/courses/?cat=${FILTER_CAT}`);
  await expect(page.locator(".course-card:visible")).toHaveCount(
    coursesInCat(FILTER_CAT),
  );
  await expect(page.locator(".course-tab.is-active")).toContainText(
    COURSE_CAT_META[FILTER_CAT].label,
  );
});

test("news tag filter narrows the list", async ({ page }) => {
  await page.goto("/news/");
  await expect(page.locator(".news")).toHaveCount(news.length);
  await page.click(`.course-tab[data-tag="${NEWS_TAG}"]`);
  await expect(page.locator(".news:visible")).toHaveCount(newsInTag);
});

test("faq accordion keeps a single panel open", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".faq-item.open")).toHaveCount(1);
  await page.locator(".faq-q").nth(2).click();
  await expect(page.locator(".faq-item.open")).toHaveCount(1);
  await expect(page.locator(".faq-item").nth(2)).toHaveClass(/open/);
});

test("mobile navigation opens the offcanvas menu", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile viewport only");
  await page.goto("/");
  await expect(page.locator(".nav-toggle")).toBeVisible();
  await page.click(".nav-toggle");
  await expect(page.locator(".nav.open .nav-links")).toBeVisible();

  // Dropdown is a disclosure: collapsed by default (aria matches hidden),
  // expands on tap (aria matches visible).
  const group = page.locator(".nav-group").first();
  const top = group.locator(".nav-grouptop");
  await expect(top).toHaveAttribute("aria-expanded", "false");
  await expect(group.locator(".nav-dropdown")).toBeHidden();
  await top.click();
  await expect(top).toHaveAttribute("aria-expanded", "true");
  await expect(group.locator(".nav-dropdown")).toBeVisible();
});

test("aria-current marks only the real current page", async ({ page }) => {
  // Home has no nav link pointing to itself; in-page anchors must not be current.
  await page.goto("/");
  await expect(page.locator('.nav-links [aria-current="page"]')).toHaveCount(0);
  // On a real page, exactly one nav link is current.
  await page.goto("/news/");
  await expect(page.locator('.nav-links [aria-current="page"]')).toHaveCount(1);
  await expect(page.locator('.nav-links a[aria-current="page"]')).toContainText(
    "最新消息",
  );
});

test("news items with a url link to their source post in a new tab", async ({
  page,
}) => {
  test.skip(newsWithUrl.length === 0, "no news item has a url");
  await page.goto("/news/");
  const links = page.locator(".news .news-link");
  await expect(links).toHaveCount(newsWithUrl.length);
  const first = links.first();
  await expect(first).toHaveAttribute("target", "_blank");
  await expect(first).toHaveAttribute("rel", /noopener/);
  // The link points at one of the data-defined source urls (no fabricated href).
  const href = await first.getAttribute("href");
  expect(newsWithUrl.map((n) => n.url)).toContain(href);
});

test("course cards link to a detail page that renders the course", async ({
  page,
}) => {
  const c = courses[0];
  await page.goto("/courses/");
  const card = page.locator(`.course-card[href$="/courses/${c.id}/"]`);
  await expect(card).toHaveCount(1);
  await card.click();
  await expect(page).toHaveURL(new RegExp(`/courses/${c.id}/$`));
  await expect(page.locator("h1")).toContainText(c.title);
});

test("course detail page renders the migrated outline when present", async ({
  page,
}) => {
  test.skip(!courseWithOutline, "no course has outline content");
  const c = courseWithOutline;
  await page.goto(`/courses/${c.id}/`);
  await expect(page.getByRole("heading", { name: "課程大綱" })).toBeVisible();
  await expect(page.locator(".course-outline li")).toHaveCount(
    c.outline.length,
  );
});
