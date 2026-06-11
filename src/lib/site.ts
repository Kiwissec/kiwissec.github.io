// Base-path helper. Astro injects the configured `base` as import.meta.env.BASE_URL
// (e.g. '/' for kiwissec.github.io, or '/Official-website/' if previewed as a
// project page). Prefix only internal absolute links so a base change stays a
// single config knob — external URLs, mailto:, tel: and bare #hash pass through.
//
// Internal page paths are also normalised to a TRAILING SLASH, matching the
// build output (`build.format: 'directory'`, `trailingSlash: 'always'`) and the
// sitemap. GitHub Pages 301-redirects the slash-less form (/services →
// /services/), so links would otherwise pay a redirect hop and canonical /
// og:url would name a URL that redirects to itself. Paths with a file
// extension (assets, robots.txt) are left untouched — file endpoints are only
// reachable without a trailing slash.
const BASE = import.meta.env.BASE_URL;

const HAS_FILE_EXTENSION = /\.[a-z0-9]+$/i;

function ensureTrailingSlash(href: string): string {
  const [, path = "", suffix = ""] = href.match(/^([^?#]*)([?#].*)?$/) ?? [];
  if (path === "" || path.endsWith("/") || HAS_FILE_EXTENSION.test(path)) {
    return href;
  }
  return `${path}/${suffix}`;
}

export function withBase(href: string): string {
  if (!href.startsWith("/")) return href;
  const prefix = BASE.replace(/\/$/, "");
  return prefix + ensureTrailingSlash(href);
}

// Absolute URL for canonical / Open Graph (needs the configured `site`).
export function absoluteUrl(path: string, site: URL | undefined): string {
  const rel = withBase(path);
  return site ? new URL(rel, site).href : rel;
}
