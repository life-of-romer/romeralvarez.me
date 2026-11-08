import { getCollection, type CollectionEntry } from "astro:content";
import { localePath, type Locale } from "../i18n";
import { getTranslations, postUrl } from "./blog";

export type Project = CollectionEntry<"projects">;

/** Each language names the section in its own words. */
const sections: Record<Locale, string> = { en: "projects", it: "progetti", es: "proyectos" };

export const projectsIndexUrl = (locale: Locale) => localePath(locale, `/${sections[locale]}/`);
export const projectUrl = (project: Project, locale: Locale) => localePath(locale, `/${sections[locale]}/${project.id}/`);

export async function getProjects() {
  const projects = await getCollection("projects");
  return projects.sort((a, b) => a.data.order - b.data.order);
}

/**
 * The case study's URL in this language, falling back to Spanish when the post isn't translated.
 * Undefined when there is none, or it is a draft (drafts show in `astro dev`).
 */
export async function caseStudyUrl(project: Project, locale: Locale) {
  if (!project.data.caseStudy) return undefined;
  const original = (await getCollection("blog", (p) => p.id === `es/${project.data.caseStudy}`))[0];
  if (!original || (original.data.draft && !import.meta.env.DEV)) return undefined;
  const post = (await getTranslations(original))[locale] ?? original;
  return { href: postUrl(post), locale: post.id.split("/")[0] as Locale };
}
