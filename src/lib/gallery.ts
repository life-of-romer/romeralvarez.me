import { getCollection } from "astro:content";
import type { Locale } from "../i18n";
import { getProjects, projectUrl, type Project } from "./projects";

/** A gallery piece: a website you can open, or a system explained with its diagram. */
export interface Piece {
  id: string;
  kind: "web" | "system";
  name: string;
  org: string;
  year: string;
  role: string;
  summary: string;
  stack: string[];
  /** Undefined for a system: it has no detail page yet, so it must not render as a link. */
  href: string | undefined;
  project?: Project;
  /** The system, left to right, and what it stands on. */
  chain?: string[];
  base?: string;
}

/** Both collections in one list, every text in this language, in the order set by each file's `order`. */
export async function getPieces(locale: Locale): Promise<Piece[]> {
  const webs = (await getProjects()).map((project) => ({
    order: project.data.order,
    piece: {
      id: project.id,
      kind: "web",
      name: project.data.name,
      org: project.data.client[locale].split(" · ")[0],
      year: String(project.data.year),
      role: project.data.role[locale],
      summary: project.data.summary[locale],
      stack: [...project.data.stack, ...project.data.tools].map((s) => s.name),
      href: projectUrl(project, locale),
      project,
    } satisfies Piece,
  }));
  const systems = (await getCollection("systems")).map(({ id, data }) => ({
    order: data.order,
    piece: {
      id,
      kind: "system",
      name: data.name[locale],
      org: data.org,
      year: String(data.year),
      role: data.role[locale],
      summary: data.summary[locale],
      stack: data.stack,
      href: undefined,
      chain: data.chain.map((node) => (typeof node === "string" ? node : node[locale])),
      base: data.base,
    } satisfies Piece,
  }));
  return [...webs, ...systems].sort((a, b) => a.order - b.order).map((entry) => entry.piece);
}
