# PRD: GAJA TRANS website

> **Every agent: read this whole file before every task.** Then read every file in `tasks/` to see what earlier agents built. This document is the single source of truth. If a user instruction contradicts it, follow the user and record the deviation in your `tasks/<page>.md` handoff file.

---

## 1. Project overview

| | |
|---|---|
| **Client** | GAJA TRANS j.d.o.o. |
| **OIB** | 03762709970 |
| **Business** | Transport services company in Croatia |
| **Phone** | 099 213 2638 (link: `tel:+385992132638`) |
| **WhatsApp** | `https://wa.me/385992132638` |
| **Email** | gajatrans2025@gmail.com |
| **Address** | Nikole Šubića Zrinskog 32, 31220 Višnjevac |
| **Service area** | All of Croatia (to be confirmed with the client) |
| **Site language** | Croatian only (`<html lang="hr">`). All visible text, alt text, form messages and meta tags are in Croatian, with correct diacritics (č, ć, đ, š, ž). |
| **Design source** | Figma file `gaja-trans`, key `Jsx3aZNexmyIshiX7RDZtj`, frame `Desktop` (node `61:88`) is the home hero. Colour palette frame is node `61:87`. |
| **Hosting** | Cloudflare Pages (static). The domain is not decided yet. |

**Note:** the Figma design writes the address without diacritics ("Nikole Subica Zrniskog 32, 31220 Visnjevac"). That is a typo in the design. Always use the spelling in the table above.

---

## 2. Scope of work

### 2.1 Pages

| Page | Nav label | URL | Notes |
|---|---|---|---|
| Početna | Početna | `/` | Hero is already designed in Figma. Other sections will come from reference images. |
| O nama | O nama | `/o-nama` | |
| Usluge | Usluge | `/usluge` | A single page listing all services. **No** per-service subpages for now. |
| Kontakt | Kontakt | `/kontakt` | Holds the inquiry form (the only form on the site) and the Google Maps embed. |
| Politika privatnosti | (footer link only) | `/politika-privatnosti` | Required because the form collects personal data. |

The site is built **page by page, section by section**. The user supplies a reference image and instructions for each section. Do not invent sections the user hasn't asked for.

### 2.2 Services (exact names, use everywhere)

1. Prijevoz i dostava
2. Selidbe
3. Skladištenje
4. Uređenje okoliša
5. Čišćenje prostora
6. Dodatne usluge

### 2.3 Out of scope for now (do not build unless asked)

- Mobile and tablet layouts. A dedicated responsive pass comes **after all pages are finished**. Build so that pass is easy (see §8).
- Working hours.
- Analytics of any kind, and therefore no cookie banner.
- Per-service subpages.
- Final SEO polish. The basics are in scope (§10) and a deeper SEO pass comes later.
- Real photography. Use placeholders (§4.5) until the client sends photos.
- Multiple languages.

---

## 3. Tech stack

| Area | Choice |
|---|---|
| Framework | **Astro** (v7, already installed). Static output (default). No server adapter is needed for Cloudflare Pages. |
| Styling | **Plain CSS only.** No Tailwind, Sass or CSS-in-JS. Global tokens and base styles go in `src/styles/global.css`, and component styles go in scoped `<style>` blocks inside `.astro` files. |
| JavaScript | Vanilla TS/JS in Astro `<script>` tags. No UI framework (React/Vue/Svelte) unless a feature really needs one. Small helper libraries that make the result smoother are allowed. Prefer native APIs (IntersectionObserver, CSS transitions) first. |
| Fonts | **Self-hosted**, never loaded from the Google Fonts CDN (GDPR). Use `@fontsource/poppins` and `@fontsource/noticia-text`, or Astro's font API with local files. The **latin-ext** subset must be included for Croatian characters. |
| Images | `astro:assets` (`<Image />` / `<Picture />`) for optimisation. Source images live in `src/assets/`. |
| Icons | Inline SVG components. They replace the Flaticon PNGs used in Figma (telephone, envelope, location, arrow-right "next"). Lucide icons (ISC licence) or hand-written SVGs are fine. Icons use `currentColor`. |
| Forms | **Web3Forms** (`https://api.web3forms.com/submit`) with honeypot and **hCaptcha** (§7). |
| Sitemap | `@astrojs/sitemap`. It needs `site` set in `astro.config.mjs`. Use a placeholder domain until the real one is decided, and leave a clear `TODO` comment. |
| Env vars | `PUBLIC_WEB3FORMS_ACCESS_KEY` goes in `.env`, which is git-ignored. Also add a committed `.env.example` and set the same variable in Cloudflare Pages. |
| Node | `>= 22` (see `package.json`). |
| Dev server | `astro dev --background`, plus `astro dev stop`, `astro dev status` and `astro dev logs` (see `AGENTS.md`). |

---

## 4. UI rules and design tokens (strict)

Only use the fonts, colours and border radius defined here. They come from the Figma file. **Never hard-code a colour, font or radius in a component.** Always reference a CSS custom property from `global.css`.

### 4.1 Colour palette: these 4 colours only

| Token | Hex | Role |
|---|---|---|
| `--color-primary` | `#EBEDF5` | Light surfaces (header background, light sections) and light text on dark backgrounds (hero heading, button text, banner text) |
| `--color-light` | `#9DB3FF` | Highlights: eyebrow labels, highlighted/underlined words in headings, icons on dark backgrounds |
| `--color-accent` | `#4F72EA` | Primary buttons, links, active states, icons on light backgrounds |
| `--color-dark` | `#0A1428` | Text on light backgrounds, the top contact banner, overlays, dark sections |

Rules:
- **No other base colours in the whole project**, including no pure white `#FFF`, no pure black and no WhatsApp green.
- Figma contains two off-palette values: `#F3F6FF` (header background) and `#EEF8FF` (some hero text). Both are **mapped to `--color-primary`**.
- **Derived variants are allowed for now**: opacity or tints of the 4 colours, for hover/focus/active states, overlays, borders, placeholders and muted text. They must be **defined once as tokens** in `global.css` (e.g. `--color-primary-80: rgb(235 237 245 / 0.8)`), never written inline. The user will revise hover colours later, so keeping them as tokens makes that a one-line change.
- Hero overlay (from Figma): `linear-gradient(90deg, rgb(10 20 40 / 0.84) 0%, rgb(10 20 40 / 0.78) 50%, rgb(10 20 40 / 0.55) 100%)` over the photo.

### 4.2 Typography

| Family | Weights | Use |
|---|---|---|
| **Poppins** | 500 Medium, 600 SemiBold, 700 Bold | All UI and body text |
| **Noticia Text** | 400 Regular | **Only** the "aja trans" logo wordmark |

Type styles measured from Figma at 1440px. Turn them into tokens/utility classes and reuse them. Do not invent new sizes without a reason.

| Style | Font / weight | Size / line height | Colour | Extra |
|---|---|---|---|---|
| H1 (hero heading) | Poppins 700 | 52px / 64px | primary | Highlighted words in `light`, underlined (`text-decoration: underline`, from-font offset) |
| Eyebrow / overline | Poppins 700 | 13px / normal | light | Uppercase, `letter-spacing: 0.04em` (0.52px) |
| Lead / hero paragraph | Poppins 500 | 18px / normal (~1.4) | primary at 80% | Max width ~500px |
| Nav link | Poppins 500 | 18px | dark | |
| Button label | Poppins 700 | 18px | primary | |
| Banner text | Poppins 600 | 16px | primary | |
| Logo wordmark | Noticia Text 400 | 40px | dark | |

For headings and sizes that aren't in Figma yet (H2, H3, body text in later sections), take them from the user's reference images and add them to the scale in `global.css`. Record them in your handoff file.

### 4.3 Border radius

- **`--radius: 4px`**. This is the only radius in the design (both buttons).
- Use it for every rounded element: buttons, inputs, cards, image placeholders, the map.
- No pill shapes and no large radii unless the user's reference shows them.

### 4.4 Layout and spacing

- Designed at **1440px** viewport width.
- **Content container: `max-width: 1140px`, centred.** At 1440 this gives 150px gutters, matching Figma. Use one shared `.container` class or component for every section.
- Measurements:

  | Element | Value |
  |---|---|
  | Banner height | 52px |
  | Header height | 101px |
  | Home hero height | 720px (banner + header + hero = 872px) |
  | Button height | 52px |
  | Button horizontal padding | ~20px |
  | Icon-to-label gap | ~8–10px |
  | Gap between hero buttons | ~20px |

- Use flexbox/grid layouts. **Never copy Figma's absolute positioning** (the Figma MCP output is absolute-positioned reference code only).
- Define spacing as tokens (e.g. `--space-*`). Record the scale you introduce in your handoff file.

### 4.5 Images and placeholders

- The hero photo ("White Cargo Van at Warehouse Docks", AI-generated) stays. Store it in `src/assets/` and render it with `astro:assets`, `object-fit: cover`.
- Any **other** section with images uses a **light grey placeholder** until real photos arrive. Placeholder rules:
  - a block with a light grey fill derived from the palette (e.g. a Dark-tinted token such as `--color-placeholder`, kept visible against Primary backgrounds)
  - `--radius` corners
  - a fixed aspect ratio that matches the reference image
  - a component (`ImagePlaceholder.astro`), so it is easy to swap for `<Image />` later
- Figma asset download URLs **expire after 7 days**. If you need an asset from Figma, fetch a fresh URL with the Figma MCP (`get_design_context`) and save the file into the project. Never reference Figma URLs at runtime.

### 4.6 Buttons

| Variant | Style |
|---|---|
| **Primary** | `--color-accent` fill, `--color-primary` label, 52px tall, `--radius`, optional arrow-right icon after the label (~16px). Used for "Kontaktiraj nas". |
| **Outline** | Transparent background, 2px `--color-primary` border, `--color-primary` label. Used on dark backgrounds, e.g. "Naše usluge". |

- Build them as one `Button.astro` with a `variant` prop. It renders `<a>` when given `href`, otherwise `<button>`.
- Hover and focus states use derived tokens (§4.1). The focus-visible outline must always be clearly visible.

### 4.7 Logo

- The logo is the image `gaja logo` (~41px square, the "G") followed by the text "aja trans" in Noticia Text 40px, Dark.
- Keep it this way until the user supplies a final logo file. The whole logo links to `/`.
- The favicon is generated from the "G" logo image.

---

## 5. Global components

The **first agent** (Početna) creates these. Later agents reuse and extend them, and never duplicate them.

| Component | Path | Purpose |
|---|---|---|
| `BaseLayout.astro` | `src/layouts/` | `<html lang="hr">`, head/meta/SEO props (`title`, `description`, `ogImage`), font imports, `global.css`, Banner, Header, `<main>`, Footer, WhatsApp button, reveal script |
| `Banner.astro` | `src/components/` | Dark top bar showing phone, email and address, each with an icon and a `tel:`, `mailto:` or Google Maps link. Phone and email sit on the left, address on the right, as in Figma. |
| `Header.astro` | `src/components/` | Primary background. Logo on the left. On the right, the nav (Početna, O nama, Usluge, Kontakt) followed by a Primary "Kontaktiraj nas" button → `/kontakt`. The current page's link is marked (e.g. accent colour plus `aria-current="page"`). |
| `Footer.astro` | `src/components/` | **Designed later** from the user's reference. It must contain: GAJA TRANS j.d.o.o., OIB 03762709970, phone, email, address, page links and the link to Politika privatnosti. |
| `Button.astro` | `src/components/` | See §4.6 |
| `Icon.astro` (or one file per icon) | `src/components/icons/` | Inline SVG icons using `currentColor` |
| `Container.astro` (or a `.container` class) | | 1140px centred wrapper |
| `ImagePlaceholder.astro` | `src/components/` | See §4.5 |
| `Reveal` | Script plus data attribute or a wrapper component | Section fade-up (§6.2) |
| `WhatsAppButton.astro` | `src/components/` | Floating button in the bottom-right corner on every page, linking to `https://wa.me/385992132638` with `target="_blank" rel="noopener"`. Uses palette colours only (Accent background, Primary icon). `aria-label="Pišite nam na WhatsApp"`. |

Site-wide constants live in **one** data file (e.g. `src/data/site.ts`), never repeated across components:
- company name and OIB
- phone (display and `tel:` formats)
- WhatsApp link
- email and address
- nav items
- the services list

---

## 6. Behaviour and motion

### 6.1 Header and banner scroll behaviour (all pages)

Every page has a **top section**. On Početna it is the hero image. Every other page also gets its own top section (a page title area, whose design comes from the user). The header behaves the same way on all pages relative to that top section:

1. **At the top (`scrollY = 0`):** the banner and the header sit in normal flow above the top section, exactly as in Figma.
2. **On the first scroll down:** the header **fades and moves up** smoothly and disappears. The banner scrolls away with the page.
3. **Once the top section has been scrolled past:** the **header alone** reappears, fixed to the top of the viewport and **fading and sliding down** from above. The **banner never comes back**; it is only visible at the top of the page.
4. **Scrolling back up into the top section:** the fixed header hides again. Back at the very top, the original banner and header layout returns.

Implementation guidance:
- Use IntersectionObserver on the top section (or a sentinel element) rather than heavy scroll listeners. If you need a scroll listener, keep it passive and throttled with `requestAnimationFrame`.
- Animate only `transform` and `opacity`, ~300–400ms ease.
- Reserve the header's 101px height so content doesn't jump when the header switches between in-flow and fixed.
- The fixed header has a high `z-index` and keeps the same styles as the in-flow one.

### 6.2 Content reveal on scroll

- Content **fades up smoothly** (opacity 0 → 1, `translateY` ~24–32px → 0, ~500–700ms ease-out) **once**, the first time it enters the viewport.
- **Think in components, not elements.** A whole section or a logical block (e.g. the hero content block, a card grid, a text-and-image block) reveals together. Never animate every heading, paragraph and button separately. A light stagger between sibling cards in a grid is acceptable.
- Use one shared mechanism (e.g. a `data-reveal` attribute with one IntersectionObserver in `BaseLayout`). Don't write a new script per section.
- The hero content on the home page reveals on page load.
- **`prefers-reduced-motion: reduce`:** no movement, and content is visible immediately.
- **No JS:** content must still be visible. Only apply hidden-until-revealed styles when JS has added a class, e.g. `.js` on `<html>`.

### 6.3 General interaction

- Every interactive element has hover and `:focus-visible` states.
- Phone, email and address are always real links: `tel:`, `mailto:`, and a Google Maps search URL.
- Smooth scrolling is allowed, except when `prefers-reduced-motion` is set.

---

## 7. Inquiry form (Web3Forms)

- **Location:** only on `/kontakt`.
- **Fields (all labels in Croatian):**

  | Field | Name | Type | Required |
  |---|---|---|---|
  | Ime i prezime | `name` | text | yes |
  | Email | `email` | email | yes |
  | Telefon | `phone` | tel | yes |
  | Poruka | `message` | textarea | yes |
  | Privacy consent | `consent` | checkbox | yes |

  The consent checkbox reads e.g. "Slažem se s obradom osobnih podataka u skladu s [Politikom privatnosti]", with the link going to `/politika-privatnosti`.
- **Hidden fields:**
  - `access_key` from `import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY`
  - `subject` (e.g. "Novi upit s web stranice – GAJA TRANS")
  - `from_name`
- **Spam protection:**
  - **Honeypot:** a hidden `botcheck` checkbox, visually hidden and `tabindex="-1"`.
  - **hCaptcha:** Web3Forms' free built-in hCaptcha, via `<div class="h-captcha" data-captcha="true"></div>` and the Web3Forms client script. Check the current Web3Forms docs when implementing.
  - We are **not** using reCAPTCHA. On Web3Forms it is a paid feature and it sets Google cookies.
- **Submission:**
  - Send a `fetch` POST (JSON or FormData) to `https://api.web3forms.com/submit`. No page reload and no redirect.
  - Show a loading state on the button (disabled, e.g. "Šaljem…").
  - **Inline messages in Croatian.** Success: e.g. "Hvala! Vaša poruka je poslana, javit ćemo vam se uskoro." Error: e.g. "Došlo je do greške. Pokušajte ponovno ili nas nazovite na 099 213 2638."
  - Reset the form on success.
  - Validate on the client side (HTML5 plus friendly Croatian error messages) and connect the messages to their fields with `aria-describedby`. Put the status region in `aria-live="polite"`.
- **Status:** the access key will be tied to gajatrans2025@gmail.com but **isn't created yet**. Build against the env var and write `.env.example` with a placeholder. The form must fail gracefully if the key is missing.

---

## 8. Responsiveness (later pass)

Mobile and tablet are **not designed yet** and will be done after all pages are finished. Until then:
- Build desktop-first to match Figma at 1440px, but keep it fluid: use the container, flex/grid, `max-width` and `min()`/`clamp()` where natural, and avoid fixed pixel widths on sections.
- Nothing should break or scroll horizontally between ~1024px and 1920px.
- Do not build the hamburger menu or the mobile banner behaviour yet. The user will decide those, including whether the banner shows on mobile.

---

## 9. Content and copy

- The user writes or approves copy. Where they haven't supplied text, write **natural, professional Croatian** that fits a transport, moving and logistics company. **Never ship Lorem ipsum.**
- Tone: trustworthy, direct, friendly. Use the polite plural ("vi" / "vaš").
- **Home hero (agreed):**
  - Eyebrow: `PRIJEVOZ • DOSTAVA • SELIDBE`
  - H1: `Od malih pošiljki do kompletnih selidbi`, with "kompletnih selidbi" highlighted (light colour, underlined)
  - Lead: `Pouzdan prijevoz, dostava i selidbe diljem Hrvatske – sigurno, na vrijeme i bez stresa.`
  - Buttons: `Kontaktiraj nas` (Primary, arrow icon) → `/kontakt`; `Naše usluge` (Outline) → `/usluge`
- Use the service names exactly as listed in §2.2.

---

## 10. SEO, legal and accessibility

### SEO (basics now, deeper pass later)
- A unique Croatian `<title>` and `<meta name="description">` per page, passed through `BaseLayout` props.
- Open Graph and Twitter tags (title, description, image) and a canonical URL.
- `@astrojs/sitemap` and `public/robots.txt`.
- **JSON-LD** structured data in `BaseLayout` using `MovingCompany` (a LocalBusiness subtype): name, address, telephone, email, `areaServed: "HR"`, url.
- Favicon from the logo "G".
- A logical heading hierarchy: one `<h1>` per page.

### Legal and privacy (GDPR)
- `/politika-privatnosti` explains in Croatian:
  - the controller (GAJA TRANS j.d.o.o., OIB, address, email)
  - what data the form collects and why
  - processors: Web3Forms (email delivery), hCaptcha (spam protection), Google Maps (only if the visitor loads the map), Cloudflare (hosting)
  - how long data is kept
  - the user's rights and the right to complain to AZOP
- **Google Maps on `/kontakt`** uses a **click-to-load facade**: a static placeholder with a button such as "Prikaži kartu". The iframe only loads after the click, so no third-party cookies are set without consent.
- No analytics and no cookie banner for now. If analytics is added later, a consent banner becomes mandatory.
- Footer shows company name and OIB (Croatian legal requirement for business websites).

### Accessibility
- Semantic landmarks: `header`, `nav`, `main`, `footer`.
- A skip link ("Preskoči na sadržaj").
- Croatian `alt` text on every image, and `alt=""` for decorative ones.
- Every interactive element is reachable and usable with the keyboard, with a visible focus style.
- Keep text contrast readable. Buttons keep 18px bold labels.
- Honour `prefers-reduced-motion`.

---

## 11. Code conventions

- **File structure:**
  ```
  src/
    assets/        images (processed by astro:assets)
    components/    reusable components (+ icons/)
    data/          site.ts (company info, nav, services)
    layouts/       BaseLayout.astro
    pages/         index, o-nama, usluge, kontakt, politika-privatnosti
    styles/        global.css (tokens, reset, base, utilities)
  public/          favicon, robots.txt, fonts if not from @fontsource
  tasks/           handoff files written by agents
  ```
- **CSS:**
  - BEM-style class names (`hero__title`, `button--outline`).
  - Tokens via custom properties.
  - Scoped component styles.
  - No `!important` unless unavoidable.
  - No inline `style=""` for design values.
- Page sections: one component per section (e.g. `src/components/home/Hero.astro`), composed in the page file.
- TypeScript types for component props (`interface Props`).
- Keep the code clean and commented where behaviour isn't obvious (e.g. the header scroll logic).
- Before you finish, `astro build` must succeed with no errors or warnings that you introduced.

---

## 12. Agent workflow and handoff

### 12.1 Build order

1. **pocetna** (`/`): also sets up the foundation: tokens, fonts, `global.css`, `BaseLayout`, Banner, Header, Button, icons, reveal and scroll scripts, `site.ts`, favicon, and setting `lang="hr"`.
2. **o-nama** (`/o-nama`)
3. **usluge** (`/usluge`)
4. **kontakt** (`/kontakt`): form plus map.
5. **politika-privatnosti** (`/politika-privatnosti`)
6. Responsive pass (mobile/tablet)
7. SEO pass

The footer is built when the user provides its reference, most likely during the first page.

### 12.2 Every agent, every task

1. Read **`PRD.md`** (this file), **`AGENTS.md`**, and **all files in `tasks/`**.
2. Look at the existing code. Reuse components and tokens; don't duplicate them.
3. Build section by section from the user's reference images and instructions, following §4 strictly.
4. Check your work:
   - `astro build` passes
   - run `astro dev --background` and check the page visually against the reference
   - stop the server afterwards
5. Write the handoff file **`tasks/<page>.md`** (names: `pocetna.md`, `o-nama.md`, `usluge.md`, `kontakt.md`, `politika-privatnosti.md`).
6. **Commit on `main`** once the page is finished. `main` is the only branch: no feature branches, and never create or push to `master`.

### 12.3 Handoff file contents (`tasks/<page>.md`)

Make it organised and detailed. The next agent has no other context. Use these sections:

1. **Summary**: what page was built and its state (done / partial).
2. **Sections built**: for each section, its purpose, the component file, its layout and any behaviour.
3. **Files created / modified**: full paths with a one-line description each.
4. **Shared components and tokens**: new ones added, and existing ones reused or extended (including props and variants).
5. **Design decisions and deviations**: anything that differs from the PRD or the reference, and why.
6. **Content**: the copy written, and which of it is placeholder or needs client approval.
7. **Open issues / TODOs**: known gaps, placeholders to replace, anything the user should decide.
8. **Notes for the next agent**: gotchas, how the scroll and reveal systems are used, and how to add a section.

---

## 13. Open items (decided later)

- [ ] Final domain (affects `site`, canonical URLs and the sitemap)
- [ ] Mobile and tablet design, including the hamburger menu and whether the banner shows on mobile
- [ ] Final logo file (SVG)
- [ ] Real photos from the client (replace placeholders)
- [ ] Final hover and derived colours (currently derived from the palette)
- [ ] Service area (currently all of Croatia)
- [ ] Working hours
- [ ] Web3Forms access key connected to gajatrans2025@gmail.com
- [ ] Deeper SEO pass
- [ ] Footer design
