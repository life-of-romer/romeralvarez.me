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

// One YAML file per project: src/content/projects/<slug>.yaml. Every text is written in the three languages.
const localized = z.object({ es: z.string(), en: z.string(), it: z.string() });
const projects = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      order: z.number(),
      year: z.number(),
      client: localized,
      role: localized,
      status: localized,
      url: z.url(),
      poster: image(),
      posterAlt: localized,
      summary: localized,
      intro: localized,
      /** Blog post slug (src/content/blog/<lang>/<slug>) telling how it was made. */
      caseStudy: z.string().optional(),
      /** The pitch for the case study, shown above its link. */
      caseStudyText: localized.optional(),
      features: z.array(z.object({ title: localized, text: localized, anchor: z.string() })),
      stack: z.array(z.object({ name: z.string(), use: localized })),
      tools: z.array(z.object({ name: z.string(), use: localized })),
    }),
});

export const collections = { blog, projects };
