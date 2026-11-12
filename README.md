# romeralvarez.me

Personal site of Romer Alvarez, Software Engineer. Built with [Astro](https://astro.build) and deployed to GitHub Pages.

## Structure

```
src/
  pages/               home in English (/), Italian (/it/) and Spanish (/es/), blog under /es/blog/
  components/          Home, Header, Footer, Icon
  layouts/             Base (head, SEO, header, footer) and Post
  content/blog/<lang>/ blog posts in Markdown, one folder per language
  content/systems/     one YAML per system (company work shown with a diagram)
  i18n/                interface strings, one JSON per language with the same keys
  scripts/             the pipeline line and the 3D scenes (three.js, loaded on demand)
  styles/global.css    design tokens and base styles
public/models/         3D pieces for the hero (GLB)
```

## Writing

- New post: add `src/content/blog/es/<slug>.md` with `title`, `description`, `pubDate` and `tags`.
- New interface text: add the key to `en.json`, `it.json` and `es.json`. The build fails if a language is missing a key.

## Commands

| Command           | What it does                   |
| ----------------- | ------------------------------ |
| `npm install`     | Install dependencies           |
| `npm run dev`     | Local server at localhost:4321 |
| `npm run build`   | Build the site into `dist/`    |
| `npm run preview` | Serve the build locally        |
| `npm run check`   | Type-check the project         |

Requires Node 22.23.4 or newer.
