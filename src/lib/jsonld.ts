// Schema.org JSON-LD builders for per-page structured data. Absolute URLs go
// through absoluteUrl() so they track the configured `site` / `base` (same
// source of truth as canonical / og:url), with no hard-coded domain.
import { absoluteUrl } from "./site";

/** One step in a breadcrumb trail. Omit `path` for a step with no own URL. */
export interface Crumb {
  name: string;
  path?: string;
}

/**
 * Build a schema.org BreadcrumbList from a page's navigation trail. Pass the
 * crumbs in the same order they appear in the visible `.crumbs` nav so the
 * structured and visible breadcrumbs agree.
 */
export function breadcrumbLd(crumbs: Crumb[], site: URL | undefined) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.path ? { item: absoluteUrl(crumb.path, site) } : {}),
    })),
  };
}

/** Fields a course page provides for its Course structured data. */
export interface CourseInfo {
  title: string;
  desc: string;
  tags?: string[];
  objectives?: string[];
}

/**
 * Build a schema.org Course for a course detail page. Intentionally omits
 * hasCourseInstance / offers: these are B2B custom on-site trainings with no
 * fixed schedule or price, so fabricating instances would be inaccurate. This
 * is entity-level markup (valid Schema.org); Course rich-result eligibility,
 * which needs instances/offers, is out of scope.
 */
export function courseLd(course: CourseInfo, site: URL | undefined) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.desc,
    inLanguage: "zh-TW",
    provider: {
      "@type": "Organization",
      name: "七維思股份有限公司 Kiwissec",
      ...(site ? { url: site.href } : {}),
    },
    ...(course.tags?.length ? { about: course.tags } : {}),
    ...(course.objectives?.length ? { teaches: course.objectives } : {}),
  };
}
