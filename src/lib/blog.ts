import { getCollection, type CollectionEntry } from "astro:content";
import { localePath, type Locale } from "../i18n";

export type Post = CollectionEntry<"blog">;

/** Entries live in <lang>/<slug>.md(x), so the id starts with the language. */
export const postLocale = (post: Post) => post.id.split("/")[0] as Locale;
export const postSlug = (post: Post) => post.id.split("/").slice(1).join("/");
export const postUrl = (post: Post) => localePath(postLocale(post), `/blog/${postSlug(post)}/`);

/** Every language has its own blog index at <lang>/blog/. */
export const blogIndexUrl = (locale: Locale) => localePath(locale, "/blog/");

/** Every language a post is published in, keyed by locale (same slug in each folder). */
export async function getTranslations(post: Post) {
  const slug = postSlug(post);
  const all = await getCollection("blog", (p) => postSlug(p) === slug && (import.meta.env.DEV || !p.data.draft));
  return Object.fromEntries(all.map((p) => [postLocale(p), p])) as Partial<Record<Locale, Post>>;
}

export async function getPosts(locale: Locale) {
  // Drafts render in `astro dev` so they can be previewed, never in the build.
  const posts = await getCollection("blog", (p) => postLocale(p) === locale && (import.meta.env.DEV || !p.data.draft));
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * The whole blog as read in one language: each post in that language when it has been
 * translated, otherwise in Spanish, where every post is written first.
 */
export async function getPostsFor(locale: Locale) {
  return Promise.all((await getPosts("es")).map(async (post) => (await getTranslations(post))[locale] ?? post));
}

export const formatDate = (date: Date, locale: Locale) =>
  date.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
