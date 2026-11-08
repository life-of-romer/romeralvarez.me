import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// One folder per language: src/content/blog/<lang>/<slug>.md (or .mdx for posts with components). The same file name links translations.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// One YAML file per project: src/content/projects/<slug>.yaml. The project pages are in Spanish;
// only the summary and role are translated, for the block on the home page.
const projects = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      order: z.number(),
      year: z.number(),
      client: z.string(),
      role: z.object({ es: z.string(), en: z.string(), it: z.string() }),
      status: z.string(),
      url: z.url(),
      poster: image(),
      posterAlt: z.string(),
      summary: z.object({ es: z.string(), en: z.string(), it: z.string() }),
      intro: z.string(),
      /** Blog post slug (src/content/blog/es/<slug>) telling how it was made. */
      caseStudy: z.string().optional(),
      features: z.array(z.object({ title: z.string(), text: z.string(), anchor: z.string() })),
      stack: z.array(z.object({ name: z.string(), use: z.string() })),
      tools: z.array(z.object({ name: z.string(), use: z.string() })),
    }),
});

export const collections = { blog, projects };
