// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://romeralvarez.me",
  trailingSlash: "ignore",
  i18n: {
    locales: ["en", "it", "es"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    { name: "Funnel Display", cssVariable: "--font-display", provider: fontProviders.google(), weights: [500] },
    { name: "Funnel Sans", cssVariable: "--font-sans", provider: fontProviders.google(), weights: [400, 500], styles: ["normal", "italic"] },
    { name: "Geist Mono", cssVariable: "--font-mono", provider: fontProviders.google(), weights: [500] },
    // Alien Thai's own faces, loaded only by its blog components.
    { name: "Big Shoulders", cssVariable: "--font-at-display", provider: fontProviders.google(), weights: [800] },
    { name: "Hanken Grotesk", cssVariable: "--font-at-sans", provider: fontProviders.google(), weights: [400, 500] },
  ],
  markdown: {
    shikiConfig: { theme: "github-light", wrap: true },
  },
  // Old blog URLs (AstroPaper) keep working after the move to /es/blog/.
  redirects: {
    "/blog": "/es/blog/",
    "/blog/comunicacion-entre-sistemas-distribuidos": "/es/blog/comunicacion-entre-sistemas-distribuidos/",
    "/blog/conociendo-keycloak": "/es/blog/conociendo-keycloak/",
    "/blog/despliegue-en-azure-kubernetes-service": "/es/blog/despliegue-de-aplicaciones-en-azure/",
    "/blog/el-camino-a-mi-primer-empleo-en-el-sector-tech": "/es/blog/el-camino-a-tech/",
    "/blog/excepciones-chequeadas-y-no-chequeadas---java": "/es/blog/excepciones-chequeadas-y-no-chequeadas-java/",
    "/blog/introducción-a-hilos-y-concurrencia": "/es/blog/hilos-y-concurrencia/",
    "/blog/introduccion-al-manejo-de-excepciones": "/es/blog/manejo-de-excepciones/",
    "/blog/monitorizacion-de-sistemas-distribuidos": "/es/blog/monitorizacion-de-sistemas-distribuidos/",
    "/blog/primera-entrada-al-blog": "/es/blog/presentacion/",
    "/blog/revisando-refactorizando-y-actualizando-la-implementacion-keycloak": "/es/blog/refactorizando-keycloak/",
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: "en", locales: { en: "en", it: "it", es: "es" } },
    }),
    mdx(),
  ],
});
