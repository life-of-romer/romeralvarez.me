# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally:

- **Prospective clients** (businesses that need a website, product or platform): they should leave thinking "I want this for my business" and write to Romer.
- **Recruiters and engineering teams**: they should see technical judgement, the stack, and what Romer personally did on each piece of work, then get in touch.

## Product Purpose

Personal site of Romer Alvarez, Software Engineer working remotely. It presents what he builds (products, tools, platforms), how he got here, what he writes, and turns visitors into conversations (email, LinkedIn, GitHub).

## Positioning

A backend and cloud-platform engineer (Kubernetes on AWS, Terraform, observability, AI agents in production at RatedPower/Enverus; Java/Spring Boot at PwC) who also ships finished, designed products end to end for real clients.

## Operating Context

- Astro site, statically built, trilingual (en, es, it) via `src/i18n`. Blog posts are written in Spanish only.
- Analytics via Umami (cookieless) with `data-umami-event` attributes on key links.
- Content collections live in `src/content`; the blog uses MDX for posts with custom components.

## Capabilities and Constraints

- Projects section: a short block on the home page that leads to a dedicated `/projects` page.
- The projects page is a gallery of two kinds of piece, in English, Spanish and Italian: websites that open (one page per project) and systems explained with a diagram (collection `systems`). A type filter switches between them.
- System pieces have no detail page yet, so they don't link anywhere.
- Each piece should show technologies, Romer's role, and link to the live result where one exists.
- The gallery has four pieces so far and the carousel is designed for more.

## Brand Commitments

- Voice: first person, direct, short sentences, no corporate filler.
- Name "Romer Alvarez"; contact email and profiles in `src/site.ts`.

## Evidence on Hand

- Alien Thai: website for a Muay Thai, Brazilian jiu-jitsu and capoeira gym in Tegueste, Tenerife. Draft case study at `src/content/blog/es/` (MDX, `draft: true`, text marked provisional), components in `src/components/blog/alien-thai/`, images in `src/assets/blog/alien-thai/`, and an archived first version at `public/blog/alien-thai/v1/`.
- No testimonials, metrics, or client quotes exist. Do not invent them.

## Product Principles

1. Show the real work, not claims about it: live links, real screenshots, real stack.
2. Make Romer's own role explicit on every project.
3. Every page ends in a way to get in touch.
4. One project done well beats a padded grid.
