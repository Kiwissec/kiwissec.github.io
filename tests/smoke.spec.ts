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
