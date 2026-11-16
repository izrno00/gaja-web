## Project rules (read first, every task)

1. **Before every task, read [`PRD.md`](PRD.md) in full.** It is the single source of truth for scope, tech stack, design tokens (colours, fonts, border radius), UI rules, behaviour and conventions. Follow it strictly.
2. **Read every file in [`tasks/`](tasks/)** to see what earlier agents built. Reuse their components and tokens; never duplicate them.
3. **The site is in Croatian.** All visible text, alt text, form messages and meta tags are in Croatian with correct diacritics (č, ć, đ, š, ž).
4. **Only use the 4 palette colours, the Poppins and Noticia Text fonts, and the 4px border radius** defined in `PRD.md`. The styling is plain CSS (no Tailwind).
5. **When a page is finished,** write a detailed handoff file at `tasks/<page>.md` (e.g. `pocetna.md`, `o-nama.md`, `usluge.md`, `kontakt.md`, `politika-privatnosti.md`). Its required structure is in `PRD.md` §12.3.
6. **Git:** `main` is the only branch. Commit to `main` after each finished page. Never create other branches.
7. **Typography scale (user decision; overrides the heading sizes in `PRD.md` §4.2).** Use `rem` sizes from this scale only, through the tokens in `src/styles/global.css`. Never hard-code a font size in a component.

   | Element | Size | Token | Weight |
   |---|---|---|---|
   | `h1` (every h1, incl. the home hero) | 3.815rem | `--text-h1` | Bold 700 |
   | `h2` | 3.052rem | `--text-h2` | SemiBold 600 |
   | `h3` (only if needed) | 2.441rem | `--text-h3` | SemiBold 600 |
   | Paragraphs, normal | 1rem | `--text-body` | Medium 500 |
   | Paragraphs, smaller | 0.8rem | `--text-small` | Medium 500 |

   - `h1`, `h2` and `h3` get these sizes globally from `global.css`, so components shouldn't set heading sizes again.
   - A small heading inside a component (e.g. a feature title) that must not be as big as an `h3` should not use a heading tag. Use the intermediate step `--text-lg` (1.25rem, the next step on the same 1.25 scale) on a `dt`/`p`/`strong` instead.
   - Existing UI sizes (nav, button, banner, logo, hero lead) stay as defined in `global.css`.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
