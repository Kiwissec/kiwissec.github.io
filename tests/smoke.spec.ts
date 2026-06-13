import { test, expect } from "@playwright/test";
// Counts are derived from the same data sources the pages render from, so adding
// or removing a course / service / news item / testimonial needs NO test edit
// (content is hand-maintained in src/data/*.json by non-engineers). The tests
// still assert the rendered count MATCHES the data and that filters behave —
// only the magic numbers are gone.
import { loadCollection } from "../src/data/_loadCollection.js";
import { footer, resources } from "../src/data/site";
import { COURSE_CAT_IDS, COURSE_CAT_META } from "../src/data/course-cats";
import { GA4_MEASUREMENT_ID } from "../src/lib/analytics";

// 在收集測試的 module scope 載入：collection 缺失或為空時，原始
// ENOENT / undefined 取值會讓整個 suite 以無指引的 stack trace 崩潰；
// 改丟可行動的訊息（audit:content 能給精確診斷）。
const loadOrExplain = (name: string) => {
  try {
    const items = loadCollection(name);
    if (items.length === 0) throw new Error(`collection "${name}" is empty`);
    return items;
  } catch (err) {
    throw new Error(
      `cannot load content collection "${name}" — run \`npm run audit:content\` for a precise diagnosis (${(err as Error).message})`,
    );
  }
};

const courses = loadOrExplain("courses");
const news = loadOrExplain("news");
const services = loadOrExplain("services");
const testimonials = loadOrExplain("testimonials");
const faq = loadOrExplain("faq");

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
      await expect(page.locator("main#main")).toHaveCount(1);
      await expect(page.locator("footer.footer")).toBeVisible();
      expect(errors, errors.join("\n")).toEqual([]);
    });
  }
});

test("brand assets use the hat-gold set and resolve", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.locator(".nav-mark")).toHaveAttribute(
    "src",
    /mark-hat-gold\.png$/,
  );
  await expect(page.locator(".footer-logo")).toHaveAttribute(
    "src",
    /lockup-stacked-hat-gold\.png$/,
  );
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    /logo\.ico$/,
  );
  for (const path of [
    "/assets/logos/mark-hat-gold.png",
    "/assets/logos/lockup-stacked-hat-gold.png",
    "/assets/logo.ico",
    "/assets/og_image.webp",
  ]) {
    expect((await request.get(path)).status(), path).toBe(200);
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
  await expect(page.locator("main#main")).toHaveCount(1);
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

test("every indexed page exposes a unique title and non-empty description", async ({
  page,
}) => {
  // Guards SEO metadata integrity: duplicate or missing titles/descriptions
  // dilute relevance signals. Reuses the canonical route list above.
  const seen = new Map<string, string>();
  for (const route of routes) {
    await page.goto(route);
    const title = (await page.title()).trim();
    expect(title, `${route} should have a non-empty <title>`).not.toBe("");
    const desc = (
      await page.locator('meta[name="description"]').getAttribute("content")
    )?.trim();
    expect(
      desc,
      `${route} should have a non-empty meta description`,
    ).toBeTruthy();
    expect(
      seen.has(title),
      `${route} title "${title}" duplicates ${seen.get(title)}`,
    ).toBe(false);
    seen.set(title, route);
  }
});

test("course and legal pages carry a BreadcrumbList matching the visible trail", async ({
  page,
}) => {
  await page.goto(`/courses/${courses[0].id}/`);
  let lds = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((el) => JSON.parse(el.textContent ?? "{}")));
  const courseCrumb = lds.find((o) => o["@type"] === "BreadcrumbList");
  expect(courseCrumb, "course detail has a BreadcrumbList").toBeTruthy();
  expect(courseCrumb.itemListElement[0].name).toBe("首頁");
  expect(
    courseCrumb.itemListElement.map((i: { name: string }) => i.name),
  ).toContain("企業資安課程");

  await page.goto("/policy/");
  lds = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((el) => JSON.parse(el.textContent ?? "{}")));
  const legalCrumb = lds.find((o) => o["@type"] === "BreadcrumbList");
  expect(legalCrumb, "legal page has a BreadcrumbList").toBeTruthy();
  expect(
    legalCrumb.itemListElement.map((i: { name: string }) => i.name),
  ).toContain("隱私權政策");
});

test("course detail pages carry Course structured data", async ({ page }) => {
  const c = courses[0];
  await page.goto(`/courses/${c.id}/`);
  const lds = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((el) => JSON.parse(el.textContent ?? "{}")));
  const course = lds.find((o) => o["@type"] === "Course");
  expect(course, "course detail has a Course node").toBeTruthy();
  expect(course.name).toBe(c.title);
  expect(course.description).toBeTruthy();
  expect(course.provider?.name).toContain("七維思");
});

test("the site-wide Organization node identifies an education provider", async ({
  page,
}) => {
  await page.goto("/");
  const lds = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((el) => JSON.parse(el.textContent ?? "{}")));
  const org = lds.find((o) => [o["@type"]].flat().includes("Organization"));
  expect(org, "homepage has an Organization node").toBeTruthy();
  expect([org["@type"]].flat()).toContain("EducationalOrganization");
  expect(org.name).toContain("七維思");
});

test("content images declare explicit dimensions to reserve layout space", async ({
  page,
}) => {
  await page.goto("/");
  for (const sel of [".deco-saturn", ".deco-rocket"]) {
    await expect(page.locator(sel)).toHaveAttribute("width", /\d+/);
    await expect(page.locator(sel)).toHaveAttribute("height", /\d+/);
  }
  await page.goto("/news/");
  const thumb = page.locator(".news-thumb").first();
  await expect(thumb).toHaveAttribute("width", /\d+/);
  await expect(thumb).toHaveAttribute("height", /\d+/);
});

test("font awesome stylesheet loads without blocking render", async ({
  request,
}) => {
  // Assert the loading strategy from the emitted HTML so the test never depends
  // on the CDN being reachable: the icon stylesheet is preloaded as a style and
  // swapped to rel=stylesheet on load, with a <noscript> stylesheet fallback.
  const html = await (await request.get("/")).text();
  expect(html).toMatch(
    /rel="preload" as="style"[^>]*font-awesome[^>]*onload="[^"]*rel='stylesheet'/,
  );
  expect(html).toMatch(/<noscript>[\s\S]*?font-awesome[\s\S]*?<\/noscript>/);
});

test("the page emits a host-guarded GA4 tag with the configured measurement id", async ({
  request,
}) => {
  // The gtag.js loader + config are injected but guarded so they only fire on the
  // production host — preview / CI run on 127.0.0.1 and never send a hit. Assert
  // from the emitted HTML so the test never depends on Google's CDN being
  // reachable, and read the id from the same module the page does so the two
  // can't drift.
  const html = await (await request.get("/")).text();
  expect(html).toContain(`gtag/js?id=${GA4_MEASUREMENT_ID}`);
  expect(html).toContain(`gtag('config','${GA4_MEASUREMENT_ID}')`);
  expect(html, "GA4 tag must stay host-guarded").toContain(
    "location.hostname!==",
  );
});

test("the footer tel link dials the international (E.164) number", async ({
  page,
}) => {
  await page.goto("/");
  const telLink = page.locator('footer.footer a[href^="tel:"]');
  // independent invariant: an international number, not a data-plumbing echo
  // (the data-derived check below uses the same transform as Footer.astro and
  // would silently follow a regression of phoneTel back to the local format)
  await expect(telLink).toHaveAttribute("href", /^tel:\+\d+$/);
  const expected = "tel:" + footer.phoneTel.replace(/[^0-9+]/g, "");
  await expect(telLink).toHaveAttribute("href", expected);
});

test("footer social links carry human-readable accessible names", async ({
  page,
}) => {
  await page.goto("/");
  const links = page.locator("footer.footer .socials a");
  await expect(links).toHaveCount(footer.socials.length);
  for (const [, href, label] of footer.socials) {
    await expect(
      page.locator(`footer.footer .socials a[href="${href}"]`),
    ).toHaveAttribute("aria-label", label);
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
  await expect(page.locator(".faq-item")).toHaveCount(faq.length); // faq entries
  await expect(page.locator("#news")).toHaveCount(0); // news removed from landing
});

test("courses: category filter, search and ?cat= deep-link", async ({
  page,
}) => {
  await page.goto("/courses/");
  await expect(page.locator(".course-card")).toHaveCount(courses.length);

  // every card badge carries its category icon (colour-independent encoding)
  await expect(page.locator(".course-cat i")).toHaveCount(courses.length);

  await page.click(`.course-tab[data-cat="${FILTER_CAT}"]`);
  await expect(page.locator(".course-card:visible")).toHaveCount(
    coursesInCat(FILTER_CAT),
  );
  // filter buttons expose toggle semantics (aria-pressed tracks the choice)
  await expect(
    page.locator(`.course-tab[data-cat="${FILTER_CAT}"]`),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('.course-tab[data-cat="all"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(
    page.locator(".course-card:visible .course-cat i").first(),
  ).toHaveClass(COURSE_CAT_META[FILTER_CAT].icon);
  // the chosen category survives a reload / share (URL carries ?cat=)
  await expect(page).toHaveURL(new RegExp(`\\?cat=${FILTER_CAT}$`));

  await page.click('.course-tab[data-cat="all"]');
  await expect(page).not.toHaveURL(/cat=/);
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
  // Switching panels needs a second item; with one item the click would just
  // toggle the open panel closed, which is a different behaviour to assert.
  test.skip(faq.length < 2, "needs at least two FAQ items to switch between");
  const last = faq.length - 1;
  await page.goto("/");
  await expect(page.locator(".faq-item.open")).toHaveCount(1);
  await page.locator(".faq-q").nth(last).click();
  await expect(page.locator(".faq-item.open")).toHaveCount(1);
  await expect(page.locator(".faq-item").nth(last)).toHaveClass(/open/);
});

test.describe("faq stays readable without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the default-open answer is visible with JS disabled", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.locator(".faq-item.open .faq-a-inner").first(),
    ).toBeVisible();
  });
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

test.describe("main content does not skip heading levels", () => {
  for (const route of [
    "/",
    "/services/",
    "/courses/",
    "/news/",
    `/courses/${courses[0].id}/`,
  ]) {
    test(`${route} heading outline increments by at most one`, async ({
      page,
    }) => {
      await page.goto(route);
      const levels = await page
        .locator("main h1, main h2, main h3, main h4, main h5, main h6")
        .evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
      expect(levels[0]).toBe(1);
      let prev = 1;
      for (const level of levels) {
        expect(level, `h${level} after h${prev}`).toBeLessThanOrEqual(prev + 1);
        prev = level;
      }
    });
  }
});

test("the skip link is the first focusable element and targets main", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await expect(skip).toHaveAttribute("href", "#main");
  await expect(page.locator("main#main")).toHaveCount(1);
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

test("news cards open an on-page dialog with the full story", async ({
  page,
}) => {
  await page.goto("/news/");
  // every item is openable in-site now (url no longer gates clickability)
  await expect(page.locator(".news .news-link")).toHaveCount(news.length);

  const card = page.locator(".news").first();
  const dialog = card.locator(".news-dialog");
  const cardTitle = await card.locator(".news-link").innerText();

  await card.locator(".news-link").click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".news-dialog-title")).toHaveText(cardTitle);

  // the dialog must not inherit the card's line-clamp (innerText can't see
  // visual truncation, so assert the computed style directly)
  for (const sel of [".news-dialog-title", ".news-dialog-desc"]) {
    const clamp = await dialog
      .locator(sel)
      .evaluate((el) => getComputedStyle(el).webkitLineClamp);
    expect(clamp, `${sel} should not be line-clamped`).toBe("none");
  }
  // the UA gives dialog { color: CanvasText } — the brand color must be
  // declared on the dialog title itself, not inherited from card rules
  const titleColor = await dialog
    .locator(".news-dialog-title")
    .evaluate((el) => getComputedStyle(el).color);
  expect(titleColor, "dialog title keeps the brand brown").toBe(
    "rgb(102, 79, 64)",
  );

  // close button restores focus to the opener
  await dialog.locator(".news-dialog-close").click();
  await expect(dialog).toBeHidden();
  await expect(card.locator(".news-link")).toBeFocused();

  // native <dialog> Escape handling still applies
  await card.locator(".news-link").click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("news dialogs keep the source post link external and safe", async ({
  page,
}) => {
  test.skip(newsWithUrl.length === 0, "no news item has a url");
  await page.goto("/news/");
  const links = page.locator(".news-dialog-src");
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
