import type { APIRoute } from "astro";

// Dynamic robots.txt — the Sitemap URL is derived from the configured `site`
// + `base`, so it always matches the deploy target (no hard-coded domain).
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const sitemap = site
    ? new URL(`${base}/sitemap-index.xml`, site).href
    : `${base}/sitemap-index.xml`;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
