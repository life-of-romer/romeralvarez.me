import { getCollection, getEntry, type CollectionEntry } from "astro:content";

export type Project = CollectionEntry<"projects">;

/** Project pages are in Spanish, like the blog. */
export const projectUrl = (project: Project) => `/es/proyectos/${project.id}/`;

export async function getProjects() {
  const projects = await getCollection("projects");
  return projects.sort((a, b) => a.data.order - b.data.order);
}

/** The case study's URL, only when the post exists and is published (drafts show in `astro dev`). */
export async function caseStudyUrl(project: Project) {
  if (!project.data.caseStudy) return undefined;
  const post = await getEntry("blog", `es/${project.data.caseStudy}`);
  if (!post || (post.data.draft && !import.meta.env.DEV)) return undefined;
  return `/es/blog/${project.data.caseStudy}/`;
}
