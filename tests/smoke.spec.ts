import { test, expect } from "@playwright/test";

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
  await expect(page.locator(".prod.prod-link")).toHaveCount(4); // services teaser
  await expect(page.locator(".cat-card")).toHaveCount(3); // course categories
  await expect(page.locator(".voice-card")).toHaveCount(6); // testimonials
  await expect(page.locator(".res-card")).toHaveCount(3); // learning resources
  await expect(page.locator("#news")).toHaveCount(0); // news removed from landing
});

test("courses: category filter, search and ?cat= deep-link", async ({
  page,
}) => {
  await page.goto("/courses/");
  await expect(page.locator(".course-card")).toHaveCount(26);

  await page.click('.course-tab[data-cat="offensive"]');
  await expect(page.locator(".course-card:visible")).toHaveCount(9);

  await page.click('.course-tab[data-cat="all"]');
  await page.fill(".course-search-input", "滲透");
  await expect(page.locator(".course-card:visible")).toHaveCount(6);

  await page.goto("/courses/?cat=defensive");
  await expect(page.locator(".course-card:visible")).toHaveCount(4);
  await expect(page.locator(".course-tab.is-active")).toContainText("資安防護");
});

test("news tag filter narrows the list", async ({ page }) => {
  await page.goto("/news/");
  await expect(page.locator(".news")).toHaveCount(6);
  await page.click('.course-tab[data-tag="新聞發佈"]');
  await expect(page.locator(".news:visible")).toHaveCount(2);
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
