// Google Analytics 4 (GA4) measurement config.
//
// The Measurement ID is a PUBLIC value by design — it ships in every visitor's
// client HTML — so it lives here as a named constant, NOT a secret / env var:
// there is nothing to hide, and an env var would add a second place to set it
// (the deploy repo's build workflow is maintained separately) for no security
// gain.
//
// The snippet self-guards on the production hostname (see ga4Snippet): gtag only
// loads and fires on the live domain. `npm run dev`, `npm run preview`, the CI
// E2E run, and any locally served production build run on a different host, so
// they emit an inert script that never contacts Google or sends a hit — no
// analytics pollution from non-production traffic, enforced in code rather than
// by an (IP-based, CI-blind) GA4 backend filter.
//
// Continuous with the former WordPress site on the same domain: reusing this ID
// keeps pre- and post-migration data in one GA4 property.
export const GA4_MEASUREMENT_ID = "G-703SPY5T6G";

/**
 * Build a host-guarded GA4 gtag.js snippet.
 *
 * Returns a single inline `<script>` (raw HTML, emitted verbatim via `set:html`
 * so Astro does not bundle it) that injects the gtag.js loader and sends the
 * page_view ONLY when the page is served from `productionHost`. Off that host
 * the script returns immediately — no network request, no hit. `new Date()` is
 * literal text in the returned string: it runs in the browser, not at build time.
 *
 * No Subresource Integrity on the loader, by design: gtag.js is served and
 * updated by Google with no published hash, so a pinned `integrity` would break
 * on every update. SRI applies only to version-pinned, immutable assets (e.g.
 * the Font Awesome / font CDN links in Base.astro), not to this.
 *
 * @param measurementId GA4 Measurement ID, e.g. "G-XXXXXXXXXX".
 * @param productionHost Hostname allowed to send analytics, e.g. "kiwissec.com".
 *   Pass Astro.site.hostname so the canonical domain stays single-sourced in
 *   astro.config.mjs.
 * @returns The guarded `<script>` markup as a single HTML string.
 */
export function ga4Snippet(
  measurementId: string,
  productionHost: string,
): string {
  return (
    `<script>(function(){` +
    `if(location.hostname!==${JSON.stringify(productionHost)})return;` +
    `var s=document.createElement('script');s.async=true;` +
    `s.src='https://www.googletagmanager.com/gtag/js?id=${measurementId}';` +
    `document.head.appendChild(s);` +
    `window.dataLayer=window.dataLayer||[];` +
    `function gtag(){dataLayer.push(arguments);}` +
    `gtag('js',new Date());` +
    `gtag('config','${measurementId}');` +
    `})();</script>`
  );
}
