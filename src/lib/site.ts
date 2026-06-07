// Base-path helper. Astro injects the configured `base` as import.meta.env.BASE_URL
// (e.g. '/' for kiwissec.github.io, or '/Official-website/' if previewed as a
// project page). Prefix only internal absolute links so a base change stays a
// single config knob — external URLs, mailto:, tel: and bare #hash pass through.
const BASE = import.meta.env.BASE_URL;

export function withBase(href: string): string {
  if (!href.startsWith("/")) return href;
  const prefix = BASE.replace(/\/$/, "");
  return prefix + href || "/";
}

// Absolute URL for canonical / Open Graph (needs the configured `site`).
export function absoluteUrl(path: string, site: URL | undefined): string {
  const rel = withBase(path);
  return site ? new URL(rel, site).href : rel;
}
