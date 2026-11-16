# Handoff: Početna (`/`)

## 1. Summary

**State: PARTIAL.** The site foundation is done, and so are four sections of the home page: banner, header and hero (built from Figma node `61:88`, `Desktop`), the "O nama" teaser, the partner logo strip "Tvrtke koje nam vjeruju" and the "Naše usluge" section (the last three built from user reference images). Further home sections will come from the user's reference images. The footer is **not** built yet (it waits for the user's reference).

Not committed yet. The user asked to wait with the commit until the whole Početna page is finished.

## 2. Sections built

### Banner (global, every page): `src/components/Banner.astro`
- Dark bar, 52px tall (`--banner-height`), content in `.container`.
- Left: phone (`tel:`) and email (`mailto:`). Right: address, linking to a Google Maps search in a new tab, with a visually hidden "(otvara Google karte u novoj kartici)" note.
- 24px Lucide icons (stroke 1.5) in `--color-light`. Text is Poppins 600, 16px, `--color-primary`. Icon gap 12px, item gap 40px.
- Hover: link text turns `--color-light`. Focus ring is `--color-light` (set via `--focus-color`).
- All items share one vertical centre line. In Figma the email sat ~3px higher; the user approved aligning it.
- **Scroll (user decision):** the banner hides and returns **together with the header** as one block. The header script toggles `data-hidden` on `[data-banner]` whenever the header state isn't `flow`.
  - Hidden: fade out and `translateY(-153px)` (the same distance as the in-flow header), with `visibility: hidden` after the fade.
  - The banner comes back only at `scrollY = 0`, never with the fixed header.
  - `position: relative; z-index: var(--z-header)` keeps it above the hero photo, which now extends up behind it.

### Header (global, every page): `src/components/Header.astro`
- 101px tall (`--header-height`), `--color-primary` background.
- Logo: `src/assets/gaja-logo.png` (41px "G") plus "aja trans" in Noticia Text 40px. The whole logo links to `/` with `aria-label="GAJA TRANS – početna stranica"`.
- Nav (from `navItems` in `site.ts`) with a 32px gap: Početna, O nama, Usluge, **Galerija** (`/galerija`, user decision), Kontakt. After the nav comes the primary `Button` "Kontaktiraj nas →" (`.header__cta`) linking to `/kontakt`.
- **Kontakt link ↔ button swap (user decision):**
  - In-flow header (states `flow` / `flow-hidden`, shown with the banner over the hero): the "Kontakt" nav link shows and the button is hidden.
  - Fixed header (states `fixed` / `fixed-hidden`, after the top section): the button replaces the "Kontakt" link (its `li.nav__item--contact` is hidden).
  - Pure CSS on `data-state` (`display: none`, so the hidden one is also out of the tab order). The flow ↔ fixed switch always happens while the header is invisible, so the swap is never seen.
  - Without JS the state stays `flow`, so the Kontakt link shows.
  - Verified with puppeteer at 1440×900: scrollY 0 / 300 → link and no button; 1500 → button and no link; back to 300 / 0 → link again.
- **Active link:** `aria-current="page"` and a 1px underline in the link colour (dark), 2px below the text. No colour change. (User decision; it replaces the PRD's "accent colour" example.)
- **Hover:** the same 1px underline grows in from the left (`scaleX` 0→1, 200ms).
- **Scroll behaviour (PRD §6.1)**: script in the component, two IntersectionObservers, no scroll listener:
  - a 1px sentinel prepended to `<body>` detects `scrollY = 0`
  - the page's `[data-top-section]` element detects "scrolled past the top section". If a page has no `[data-top-section]`, the header slot is used instead.
  - The state is held in `data-state` on `<header>`:
    - `flow`: at the top, in flow, visible
    - `flow`: the banner is visible too
    - `flow-hidden`: inside the top section, faded and slid up by `--site-top-height` (153px), the same distance as the banner, so they move as one block
    - `fixed`: past the top section, fixed, slid down, with a soft shadow. The banner stays hidden.
    - `fixed-hidden`: slid up by its own height (`-100%`) on scroll back up. After `transitionend` it switches to `flow-hidden` invisibly.
  - Always change state through `setState()`, which also syncs the banner's `data-hidden`.
  - `data-instant` turns off transitions for the invisible flow ↔ fixed switches.
  - `.header-slot` keeps the 101px reserved so nothing jumps.
  - Hidden states use `visibility: hidden` (delayed until the fade ends), so a hidden header can't receive keyboard focus.
  - Reduced motion: no transitions. The script handles the missing `transitionend`.
  - Verified with puppeteer: flow → flow-hidden (scrollY 200) → fixed (1100) → flow-hidden (500) → flow (0).
  - Re-verified after the banner change (1440×700, Edge), including the banner's `data-hidden` at each step and slowed-down mid-transition frames.
  - **"Past the top section" uses an end marker:** a 1px div (`height: 1px; margin-bottom: -1px`) inserted right after `[data-top-section]`. `pastTop` turns true when that marker's bottom is above the viewport. The observer doesn't watch the section itself, because the pinned (sticky) hero never leaves the viewport. The marker sits where the covering content starts, so the fixed header appears exactly when the hero is fully covered. For a normal, non-pinned top section this behaves the same as before.

### Hero (home only): `src/components/home/Hero.astro`
- `<section data-top-section>`, full-bleed. **Banner + header + hero fill exactly one viewport:** `--hero-height: calc(100svh - var(--site-top-height))` (with a `100vh` fallback), where `--site-top-height` = 153px. `--hero-min-height: 600px` keeps the content from being clipped on short screens. This is a user decision that replaces Figma's 720px.
- Photo: `src/assets/hero-van.png` (the user's original, 1667×943), rendered with `<Image>` as WebP at widths 960/1280/1667, eager, `fetchpriority="high"`.
  - **Positioning (user-approved, don't change without asking):** the `<img>` is laid out as a full-viewport background. It starts 153px above the hero (`top: -var(--site-top-height)`, height = hero + 153px), so the banner and header cover its top part. It uses `object-fit: cover` and **`object-position: right center`**, so the excess is cropped evenly from top and bottom, the van stays fully visible, and the photo keeps the same screen position as when the hero alone filled the viewport.
  - Checked pixel-for-pixel against the user's reference screenshot at 1903×917.
  - **Visible behind the banner and header (user decision):** the hero uses `clip-path: inset(-153px 0 0 0)` instead of `overflow: hidden`. The photo's top 153px therefore paints behind the banner and header, and when they slide away the photo fills their space instead of a blank Primary strip. Sides and bottom are still clipped.
- Overlay: the PRD gradient built from the `--color-overlay-*` tokens. It also starts 153px above the hero (`inset: -site-top-height 0 0`), so the strip behind the banner and header is darkened like the rest.
- **Pinned "curtain" hero (user decision):** the hero is `position: sticky` and never moves while the page scrolls. Everything after it is wrapped in `<div class="cover">` in `index.astro`, which slides up over the hero and covers it.
  - `top: min(var(--site-top-height), 100svh - var(--hero-min-height))` (with a `100vh` fallback line). On normal screens it pins at 153px, exactly where it sits at scrollY 0, so it doesn't move from the first scroll tick. On screens shorter than 153 + 600px it first scrolls up just enough to show its bottom edge, then pins (at 1440×700 it pins at 100px).
  - Its sticky containing block is `<main>`, so it stays pinned under the **whole page**. Every later section, and the end of `<main>`, slides over it, so it never peeks out again.
  - The hero itself stays perfectly still: no fade, zoom or parallax (user decision). It also keeps working with `prefers-reduced-motion`, because it only moves as fast as the user scrolls (user decision).
  - **Keyboard:** a small script scrolls to the top when focus enters the hero while it's covered (e.g. Shift+Tab back from the About link). Verified: focus lands on "Naše usluge" and scrollY goes to 0.
  - Verified at 1440×900: the hero's top stays at 153px from scrollY 0 to the end while the cover rises over it.
- Content block (`data-reveal`, fades up on load), **centred vertically** in the hero. This is a user decision; Figma has it ~20px higher.
  - Eyebrow (`.eyebrow` utility), H1 (52/64, max-width 560px, so it breaks after "do" as in Figma), lead (18px, 80% primary, max-width 500px), buttons.
  - Gaps: eyebrow → H1 0 (eyebrow line height 17px), H1 → lead 8px, lead → buttons 36px, between buttons 20px.
  - H1 now uses the global type scale (3.815rem ≈ 61px, line height 1.2). `max-width: 10.8em` (the old 560px at 52px) keeps the break after "do"; checked at 1440px.

### O nama teaser (home only): `src/components/home/About.astro`
- Built from the user's reference screenshot (a two-column "We're built for your business" block). The layout follows the reference; the decorations were adapted to the PRD.
- `<section class="about">`, `--color-primary` background, `padding-block: var(--section-padding-y)` (96px). Measured 1440 × 845px at a 1440 viewport.
- `.container` grid: two equal columns (`minmax(0, 1fr)` ×2), 96px gap (`--space-24`), `align-items: center`. Each column is 522px at 1440.
- **Left column:** eyebrow "O nama" (`.eyebrow .eyebrow--accent`) → 16px → `h2` "Pouzdan partner za svaki prijevoz" (global h2 scale, Dark) → 40px → three points → 40px → `TextLink` "Više o nama →" to `/o-nama`.
  - The points are a `<dl>`. Each point is a `<div>` holding a `dt` title (`--text-lg` 1.25rem, SemiBold) and a `dd` text (1rem, `--color-dark-80`, 4px below the title). There are 24px between points, and the list is at most 460px wide.
  - A `dl` rather than `h3`s, because the h3 size (2.441rem) is far too big for these titles (AGENTS.md rule 7).
- **Right column:** the hero van photo (`hero-van.png`) as a **placeholder**, `<Image>` WebP with the same widths as the hero (960/1280/1667), so the browser reuses the same files. Lazy loaded.
  - CSS crop: `aspect-ratio: 4 / 5`, `object-fit: cover`, `object-position: 90% center` (frames the van; it sits at x ≈ 830–1580 of 1667). The image is 522 × 653px at 1440.
  - Plain `--radius` corners, no shadow or offset block (user decision; the reference's big radius and shadow card were dropped).
- The whole `.about__inner` block has `data-reveal`, so text and image fade up together.
- Copy is in a `points` array in the component frontmatter.

### Partner logos "Tvrtke koje nam vjeruju" (home only): `src/components/home/Partners.astro`
- Built from the user's reference ("Brands We Work With": a small centred title over one row of grey logos). Sits right after About.
- `<section class="partners" aria-labelledby="partners-title">`, `--color-primary` background (it continues About), `padding-bottom: var(--section-padding-y)` and no top padding, because About's bottom padding already gives 96px above it.
- Title: `<p>` (not a heading; an h2 would be far too big, AGENTS.md rule 7), `--text-lg` SemiBold, centred. 48px (`--space-12`) above the logos.
- **Infinite marquee (user decision):**
  - The logo `<ul>` is rendered twice inside `.partners__track`. The second copy is `aria-hidden="true"` with `alt=""`.
  - The track animates `translateX(0 → -50%)` over `--duration-marquee` (40s), linear and infinite. Each list has `padding-right` equal to its gap, so the seam is spaced like every other logo.
  - It pauses on hover. Both edges fade out with a `mask-image` gradient (12% each side).
  - **Reduced motion:** no animation, no mask, the copy is hidden, and the 8 logos sit in one still, centred row (40px gap; it wraps if needed).
- **Logos:** 28px tall (`--logo-strip-height`), `filter: grayscale(1)` plus `opacity: var(--opacity-logo)` (0.45). Full opacity on hover (user decision). Not links (user decision).
  - Grayscale + opacity means real coloured logos will also match the palette without editing the files.
- **Placeholder logos (user asked for random ones, will be replaced):** 8 fictional brands (Kvadra, Sjever, Dravia, Lumio, Orbis, Brodmar, Ventis, Panora) as SVG files in `src/assets/logos/`.
  - Each is a simple geometric mark plus an Arial/Helvetica wordmark. `textLength` fixes the text width, so it never clips whichever system font draws it.
  - They're rendered as plain `<img>` (imported for their URL, width and height), lazy loaded.
- The whole container (title + strip) has `data-reveal`.
- At 1440 the section measures 200px tall; one logo list is ~1306px wide (more than the 1140 container, so the loop never shows a gap).

### Naše usluge (home only): `src/components/home/Services.astro`
- Built from the user's reference ("Construction Services": a heading and a list card on the left, two photos plus the active service's text on the right).
- `<section class="services" aria-labelledby="services-title">`, background `--color-primary-shade` (Primary mixed with 6% Dark). The list card is plain `--color-primary`, which replaces the reference's white card on grey (no white in the palette, user decision). `padding-block: var(--section-padding-y)`.
- `.container` grid: `minmax(0, 5fr) minmax(0, 7fr)`, 64px gap (`--space-16`), `align-items: start`. At 1440: left 448px, right 628px. The section is ~772px tall.
- **Left:**
  - `h2` "Naše usluge": one line, one colour (user decision; the reference's two-tone two-line heading was dropped).
  - Lead below it, 16px gap, 1rem, `--color-dark-80`, max 360px.
  - Then the list card: 40px gap, `--radius`, padding 8px / 24px.
- **Service list = vertical tabs (WAI-ARIA tabs pattern):**
  - `role="tablist"` with `aria-orientation="vertical"`. Each service is a `<button role="tab">` with `aria-selected`, `aria-controls` and roving `tabindex`.
  - Ids: `usluga-tab-<slug>` and `usluga-panel-<slug>`.
  - Row layout: Lucide icon (22px, stroke 1.5) → name (1rem Medium) → `arrow-up-right` (20px). Rows are 20px top/bottom with 1px `--color-border` dividers between them.
  - Active and hover: label, icon and arrow turn `--color-accent`, and the arrow nudges 2px up-right.
  - Icons: `truck` Prijevoz i dostava, `sofa` Selidbe, `warehouse` Skladištenje, `trees` Uređenje okoliša, `sparkles` Čišćenje prostora, `circle-plus` Dodatne usluge.
  - **Behaviour:** click switches the panel (user decision). Keyboard uses automatic activation: ↑/↓ (wrapping), Home and End move focus and switch the panel. The first service is active by default.
  - The small script is in the component. Verified with puppeteer: ↓↓ → Skladištenje, End → Dodatne usluge, ↓ wraps to Prijevoz i dostava, click → Selidbe.
- **Right, the panels:** all 6 `role="tabpanel"` (`tabindex="0"`) share one grid cell (`grid-area: 1 / 1`), so the column is as tall as the tallest panel and switching never shifts the layout.
  - Inactive panels: `opacity: 0` + `visibility: hidden`, which also hides them from assistive tech and the keyboard. `.is-active` fades in over `--duration-panel` (400ms), a true crossfade.
  - Without JS the first panel stays visible (it's rendered with `.is-active`).
  - Reduced motion: no transitions.
- **Panel content:**
  - two images side by side: 16px gap, `aspect-ratio: 4 / 5`, `object-fit: cover`, `--radius`; about 306 × 383px at 1440
  - 24px gap, then the service name (`<p>`, `--text-lg` SemiBold, not a heading)
  - 8px gap, then the description (`--color-dark-80`, max 560px)
  - 16px gap, then `TextLink` "Saznaj više →" to `/usluge#<slug>`, with a visually hidden " o usluzi <naziv>" so every link has a unique accessible name
- **Images are placeholders (user decision: reuse the van photo):** every service uses the same pair from `hero-van.png`, cropped with CSS:
  - loading docks (`object-position: 8% center`, alt "Utovarne rampe skladišta")
  - the van (`88% center`, alt "Bijeli dostavni kombi ispred skladišta")
  - The crop is passed per image as a `--image-position` custom property in `style` (data, not a design token).
  - `widths` are the same as the hero/About (960/1280/1667), so no new image files are generated.
  - `sizes="(min-width: 1188px) 680px, 60vw"`: the 4:5 crop of a landscape photo needs ~680px of source width per 306px slot.
- The whole `.services__inner` has `data-reveal`.

### Other global pieces
- `WhatsAppButton.astro`: fixed bottom-right, 56px **green circle with a white WhatsApp glyph** (the real WhatsApp look, user decision), `aria-label="Pišite nam na WhatsApp"`. Hover darkens the green and lifts the button 2px.
- Skip link "Preskoči na sadržaj" → `#sadrzaj` (`<main>`). Visible on focus only.

## 3. Files created / modified

| Path | Description |
|---|---|
| `astro.config.mjs` | `site` (placeholder `https://example.com`, TODO), `@astrojs/sitemap`, Astro Fonts API with local Poppins 500/600/700 and Noticia Text 400 (latin + latin-ext, each with its unicode-range) |
| `package.json` / `package-lock.json` | Added `@astrojs/sitemap` |
| `src/styles/global.css` | All tokens, reset, base, `.container`, `.visually-hidden`, `.eyebrow`, `.highlight`, reveal CSS |
| `src/data/site.ts` | Company info, phone/WhatsApp/email/address (+ Maps URL), `navItems`, `services` (now `{ name, slug }` objects, plus `Service`/`ServiceSlug` types) |
| `src/layouts/BaseLayout.astro` | `<html lang="hr">`, SEO/OG/Twitter/canonical, JSON-LD `MovingCompany`, fonts, skip link, Banner, Header, `<main id="sadrzaj">`, WhatsApp button, reveal script |
| `src/components/Banner.astro` | Top contact bar |
| `src/components/Header.astro` | Header, nav and scroll behaviour |
| `src/components/Button.astro` | Primary/outline button |
| `src/components/WhatsAppButton.astro` | Floating WhatsApp link |
| `src/components/icons/Icon.astro` | Inline SVG icons: `phone`, `mail`, `map-pin`, `arrow-right` (Lucide), `whatsapp` (Simple Icons) |
| `src/components/home/Hero.astro` | Home hero (H1 now takes its size from the global scale) |
| `src/components/home/About.astro` | Home "O nama" teaser: text + points + link, portrait image |
| `src/components/TextLink.astro` | Accent text link with an underlined label and a trailing arrow |
| `src/components/home/Partners.astro` | Home partner logo marquee "Tvrtke koje nam vjeruju" |
| `src/components/home/Services.astro` | Home "Naše usluge": vertical service tabs + crossfading panels |
| `src/assets/logos/*.svg` | 8 placeholder partner logos (fictional brands), to be replaced |
| `src/pages/index.astro` | Home page: BaseLayout + Hero + `<div class="cover">` holding About, Partners, Services (and all future sections) |
| `AGENTS.md` | Added rule 7: the typography scale (user decision) |
| `src/assets/hero-van.png` | Hero photo (the user's original, renamed from "White Cargo Van at Warehouse Docks.png") |
| `src/assets/gaja-logo.png` | "G" logo mark from Figma (41×41) |
| `src/assets/fonts/*.woff2` | Self-hosted fonts (from Fontsource 5.3.0) + `LICENSE-OFL.txt` |
| `public/favicon.ico`, `public/favicon.png` | Favicons generated from the G logo (32px ICO, 48px PNG). The default Astro `favicon.svg` was deleted. |
| `public/robots.txt` | Allow all, sitemap URL (placeholder domain, TODO) |

## 4. Shared components and tokens

### Tokens (`global.css`)
- **Colours:**
  - palette: `--color-primary`, `--color-light`, `--color-accent`, `--color-dark`
  - derived: `--color-primary-80`, `--color-accent-hover` (accent 85% + dark), `--color-overlay-start|mid|end`, `--color-shadow` (dark at 18%)
  - **WhatsApp brand exception (use ONLY in `WhatsAppButton.astro`):** `--color-whatsapp` (#25D366), `--color-whatsapp-hover`, `--color-whatsapp-icon` (#FFF)
  - `--focus-color`: defaults to accent. Override it to `--color-light` on any dark section, as Banner and Hero do.
- **Fonts:** `--font-body` (→ `--font-poppins`), `--font-logo` (→ `--font-noticia-text`), `--weight-medium|semibold|bold`.
- **Type scale (user decision, AGENTS.md rule 7, ratio 1.25 on 1rem):**
  - `--text-h1` 3.815rem / `--leading-h1` 1.2
  - `--text-h2` 3.052rem / 1.2
  - `--text-h3` 2.441rem / 1.25
  - `--text-lg` 1.25rem / 1.4: in-component titles that aren't headings
  - `--text-body` 1rem / `--leading-body` 1.6: set on `body`
  - `--text-small` 0.8rem, with a `.text-small` utility
  - `h1`/`h2`/`h3` get size, line height and weight (700/600/600) **globally** in `global.css`. Components only set colour and spacing.
- **UI text:** `--text-eyebrow` (now `var(--text-small)` = 12.8px, was 13px) / `--leading-eyebrow` / `--tracking-eyebrow`, `--text-lead`/`--leading-lead` (18px, unchanged), `--text-nav`, `--text-button`, `--text-banner`, `--text-logo`.
- **Colour added:**
  - `--color-dark-80` (dark at 80%) for body text on light sections
  - `--color-shadow-cover` (dark at 50%) for the cover's shadow on the dark hero
- **`.cover` utility (global.css):** `position: relative; z-index: 1`, `--color-primary` background, and `box-shadow: 0 -12px 32px var(--color-shadow-cover)` (a soft shadow cast up onto the hero, user decision). It wraps all content after a pinned hero.
- **Added for Partners / Services:**
  - `--color-primary-shade`: Primary mixed with 6% Dark, for tinted sections that hold Primary cards
  - `--color-border`: Dark at 10%, for hairline dividers on light surfaces
  - `--opacity-logo` (0.45): muted partner logos
  - `--logo-strip-height` (28px)
  - `--duration-panel` (400ms): tab panel crossfade
  - `--duration-marquee` (40s): one loop of the logo strip
- **Icons added (Lucide v1.73):** `arrow-up-right`, `truck`, `sofa`, `warehouse`, `trees`, `sparkles`, `circle-plus`.
- **`services` in `site.ts`** is now a list of `{ name, slug }`. The slug is the anchor id of each service on `/usluge`; **the Usluge page must use these ids** (`prijevoz-i-dostava`, `selidbe`, `skladistenje`, `uredenje-okolisa`, `ciscenje-prostora`, `dodatne-usluge`), because the home "Saznaj više" links point to them.
- **Utilities added:** `.eyebrow--accent` (Accent eyebrow for light sections, where Light is too faint), `.text-small`.
- **Spacing added:** `--space-24` 96, `--space-30` 120, and `--section-padding-y` (= `--space-24`), the vertical padding of a standard content section.
- **Radius:** `--radius: 4px` for everything; `--radius-round: 50%` is for the WhatsApp button only.
- **Spacing:** `--space-1` 4, `-2` 8, `-3` 12, `-4` 16, `-5` 20, `-6` 24, `-8` 32, `-9` 36, `-10` 40, `-12` 48, `-16` 64.
- **Layout:** `--container-max` 1140, `--container-gutter` 24, `--banner-height` 52, `--header-height` 101, `--site-top-height` (banner + header = 153), `--hero-height` (100svh − 153px), `--hero-min-height` 600.
- **Components:** `--button-height` 52, `--button-padding-x` 20 (with icon), `--button-padding-x-text` 35 (text-only, as in Figma's "Naše usluge"), `--button-gap` 8, `--button-border` 2, `--icon-sm`, `--icon-md`, `--logo-mark-size`, `--fab-size`.
- **Motion:** `--duration-fast` 200ms, `--duration-header` 350ms, `--duration-reveal` 600ms, `--ease-out`, `--reveal-distance` 28px.
- **Layers:** `--z-header`, `--z-fab`, `--z-skip-link`.

### Components
- `Button.astro`:
  - props: `variant: 'primary' | 'outline'`, `href?` (renders `<a>`, otherwise `<button>`), `icon?: IconName` (shown after the label), `type`, `class`, `attrs` (extra attributes)
  - a button without an icon gets the wider text-only padding automatically
  - the padding tokens are measured to the outer edge; the 2px border is subtracted in CSS
  - hover: primary darkens and the icon nudges 3px right; outline fills with primary and the label turns dark
  - **Outline hover fix (user-reported blink in Chrome):**
    - The fill still fades over `--duration-fast` (ease-in-out), but the label colour now **switches in one step at the midpoint** (`color 0s linear calc(var(--duration-fast) / 2)`).
    - Before, both faded together and crossed the same grey halfway. Measured in Chrome with animations slowed 20×, label contrast dropped to ~1.9:1, so the text blinked on hover in and out and when the cursor crossed the edge. Now the worst frame is ~3.7:1.
    - The photo around the button doesn't repaint (0 pixel change measured), so the hero didn't need changes.
    - Don't put a normal colour fade back on this variant.
- `Icon.astro`:
  - props: `name`, `size` (px, default 24), `strokeWidth` (default 2), `class`
  - icon entries can set their own `viewBox` (`arrow-right` is cropped to `4 4 16 16` so it fills its box like the Figma arrow)
  - to add an icon, copy the SVG inner markup from `lucide-static`
- `TextLink.astro`:
  - props: `href`, `class`
  - Accent, 1rem SemiBold, underlined label (1px, 4px offset), 16px arrow after the label with an 8px gap
  - hover: `--color-accent-hover` and a 3px arrow nudge, like `Button`
  - for light backgrounds only
- `BaseLayout.astro` props: `title`, `description`, `ogImage?` (defaults to a 1200px JPG of the hero photo).

## 5. Design decisions and deviations

- **Hero content is centred vertically** instead of using the Figma offset (user decision).
- **Banner items are aligned** on one centre line (Figma had the email 3px higher; user decision).
- **New "Galerija" page in the nav** (`/galerija`, between Usluge and Kontakt). It isn't in PRD §2.1 (user decision). The page isn't built yet.
- **Header button only in the fixed header:** the in-flow header shows a "Kontakt" link instead (user decision). PRD §5 describes the button as always present next to the full nav.
- **Active nav = 1px underline in the link colour**, not accent colour (user decision). Hover uses the same underline, sliding in.
- **Phone is shown as `099 213 2638`** (PRD format, not Figma's `099-213-2638`).
- **Address uses correct diacritics** (Figma typo fixed, PRD §1).
- **Icons:** Lucide SVGs (stroke 1.5) replace the Flaticon PNGs. The WhatsApp glyph comes from Simple Icons (CC0).
- **Fonts:** Astro Fonts API with local woff2 files (user's choice over @fontsource packages). Only Poppins 500 and 700 are preloaded.
- **Header button** renders ~2px wider than Figma (8px icon gap vs ~6px in Figma; the PRD says 8–10px).
- **Fixed header** gets a soft shadow (`--color-shadow`) so it separates from the content. Figma doesn't show this state.
- **WhatsApp button is a green circle with a white glyph** (user decision). This deliberately breaks PRD §4.1 (no WhatsApp green, no pure white) and §4.3 (no round shapes), and PRD §5 still describes the old accent/primary version. The exception is limited to this one component through dedicated tokens.
- **Banner + header + hero = 100% of the viewport height**, with the photo positioned as a full-viewport background behind them (user decision, see §2). Figma uses a fixed 720px hero with a bottom-anchored crop.
- **Favicon:** only 32/48px versions, because the source logo is 41px. No apple-touch-icon yet.
- **Typography scale** (user decision, recorded in AGENTS.md rule 7) replaces the PRD §4.2 heading sizes. The hero H1 went from 52px to 3.815rem (~61px), and the eyebrow from 13px to 0.8rem (12.8px).
- **O nama teaser vs reference:**
  - 4px radius and no shadow card (PRD §4.3, user decision)
  - H2 is SemiBold 600 (the reference is lighter, but Poppins 400 isn't loaded)
  - no highlighted word in the H2 (user decision)
  - points are text-only, as in the reference
  - the eyebrow is Accent instead of the reference's grey, because Light is too faint on Primary and grey isn't in the palette
- **Partner logos vs reference:**
  - an infinite marquee instead of a static row (user decision)
  - muted with grayscale + opacity, full on hover (user decision)
  - the placeholder SVGs use Arial/Helvetica for their wordmarks, because they stand in for third-party logos, which have their own typefaces, not site typography
- **Services vs reference:**
  - a single-colour, one-line h2 "Naše usluge" (user decision)
  - all 6 services instead of 4 (user decision)
  - tinted section + Primary card instead of a white card on grey (palette)
  - the panel title is a `<p>` with `--text-lg`, not an h3 (AGENTS.md rule 7)
  - the link reads "Saznaj više →" (existing `TextLink`) instead of the reference's small uppercase "VIEW SERVICE"
  - both images are the van photo (user decision)
- **About image** is the hero photo cropped to 4:5 with CSS (`object-position`), not with Sharp. Astro's `position` prop only supports keywords, and `right` would cut off the front of the van.

## 6. Content

| Element | Text | Status |
|---|---|---|
| Eyebrow | PRIJEVOZ • DOSTAVA • SELIDBE (written in sentence case, uppercased with CSS) | agreed (PRD §9) |
| H1 | Od malih pošiljki do **kompletnih selidbi** | agreed |
| Lead | Pouzdan prijevoz, dostava i selidbe diljem Hrvatske – sigurno, na vrijeme i bez stresa. | agreed |
| Buttons | Kontaktiraj nas → `/kontakt`, Naše usluge → `/usluge` | agreed |
| `<title>` | GAJA TRANS – prijevoz, dostava i selidbe diljem Hrvatske | written by agent, needs approval |
| Meta description | GAJA TRANS iz Višnjevca nudi pouzdan prijevoz, dostavu i selidbe diljem Hrvatske – od malih pošiljki do kompletnih selidbi. Sigurno, na vrijeme i bez stresa. | written by agent, needs approval |
| Hero alt | Bijeli dostavni kombi parkiran ispred utovarnih rampi skladišta | written by agent |
| O nama eyebrow | O nama | placeholder |
| O nama H2 | Pouzdan partner za svaki prijevoz | placeholder, the user will replace it |
| Point 1 | **Jedan poziv, sve usluge**: Prijevoz, selidbe, skladištenje, uređenje okoliša i čišćenje – sve rješavate s jednim timom i jednim kontaktom. | placeholder |
| Point 2 | **Pouzdano i na vrijeme**: Dogovoreni termin za nas je obećanje. Dolazimo kad smo rekli i javljamo vam se u svakom koraku. | placeholder |
| Point 3 | **Pažljivo s vašim stvarima**: Vaše stvari pakiramo, osiguravamo i prevozimo kao da su naše – bez oštećenja i bez stresa. | placeholder |
| O nama link | Više o nama → `/o-nama` | placeholder (the page doesn't exist yet) |
| O nama image alt | Bijeli dostavni kombi ispred skladišta | placeholder (it describes the stock photo; don't claim it's the client's van) |
| Partners title | Tvrtke koje nam vjeruju | agreed (user picked it) |
| Partner logos | Kvadra, Sjever, Dravia, Lumio, Orbis, Brodmar, Ventis, Panora | placeholder, fictional brands; the user will supply real logos |
| Services H2 | Naše usluge | agreed |
| Services lead | Od jedne pošiljke do kompletne selidbe – sve što vam treba, na jednom mjestu. | placeholder |
| Prijevoz i dostava | Prevozimo i dostavljamo pošiljke svih veličina – od jednog paketa do punog kombija robe. Dogovorimo termin koji vam odgovara i robu sigurno dovezemo na adresu, bilo gdje u Hrvatskoj. | placeholder |
| Selidbe | Selimo stanove, kuće i urede od pakiranja do posljednje kutije. Namještaj pažljivo rastavljamo, štitimo i ponovno slažemo, a vi se brinete samo o tome gdje će što stajati. | placeholder |
| Skladištenje | Trebate privremeno spremiti namještaj, robu ili opremu? Vaše stvari čuvamo u sigurnom i suhom prostoru – na kraće ili dulje vrijeme – i dostavljamo ih kad vam zatrebaju. | placeholder |
| Uređenje okoliša | Uređujemo dvorišta, vrtove i okućnice: košnja, orezivanje, čišćenje zelenih površina i odvoz otpada. Vaš okoliš ostaje uredan bez vašeg truda. | placeholder |
| Čišćenje prostora | Čistimo stanove, kuće, urede i poslovne prostore – nakon selidbe, renovacije ili redovito. Prostor vam predajemo čist i spreman za korištenje. | placeholder |
| Dodatne usluge | Odvoz glomaznog otpada, pražnjenje podruma i tavana, montaža namještaja i druge sitne usluge. Recite nam što vam treba, a mi ćemo pronaći rješenje. | placeholder (the client must confirm which extra services they really offer) |
| Services link | Saznaj više → `/usluge#<slug>` | agreed (the page doesn't exist yet) |
| Services image alts | Utovarne rampe skladišta / Bijeli dostavni kombi ispred skladišta | placeholder (describe the stock photo) |

## 7. Open issues / TODOs

- [ ] **Hero photo resolution:** the user will send a larger version (≥ 2880px wide) for sharp retina rendering. Replace `src/assets/hero-van.png` (same file name) and keep the same framing.
- [ ] **Hero on narrow/tall screens:** at ~1280×1024 the hero text overlaps the front of the van (the photo is cropped from the left). Look at this in the responsive pass.
- [ ] **Domain:** `site` in `astro.config.mjs` and `public/robots.txt` use `https://example.com`.
- [ ] **Final logo:** an SVG would replace `gaja-logo.png` (41px raster) and allow a proper apple-touch-icon.
- [ ] **Hover colours** are provisional (`--color-accent-hover`, banner link hover, outline fill).
- [ ] **Footer** is not built (a placeholder comment sits in `BaseLayout.astro`).
- [ ] **O nama teaser:**
  - replace the placeholder copy with the user's text
  - replace the van photo with a real client photo (change the import in `About.astro` and re-tune `object-position`)
  - the `/o-nama` link 404s until that page exists
- [ ] **Hero lead** is still 18px (`--text-lead`). The new scale only defines 1rem/0.8rem paragraphs; ask the user whether the lead should move to 1rem or stay as a lead size.
- [ ] **Partner logos:**
  - replace the 8 placeholder SVGs with the client's real partner logos (`src/assets/logos/` + the `logos` array in `Partners.astro`)
  - keep at least ~8 logos, or the loop shows a gap
  - transparent SVG/PNG files work best with the grayscale + opacity treatment
- [ ] **Marquee pause control:** the strip pauses on hover and stops for reduced motion, but has no pause button. WCAG 2.2.2 asks for a way to pause moving content that lasts longer than 5s. Ask the user whether to add a small pause button.
- [ ] **Services:**
  - replace the placeholder copy, and confirm what "Dodatne usluge" covers
  - give each service its own photos (the `images` field per service in `Services.astro`)
  - the `/usluge#<slug>` links 404 until the Usluge page exists, and it must use the slugs from `site.ts` as section ids
- [ ] **Galerija page:** `/galerija` is linked in the nav but doesn't exist yet (404). It's missing from PRD §2.1 and the §12.1 build order; ask the user where it fits and what it shows.
- [ ] The remaining Početna sections, from the user's references.
- [ ] **Commit:** not committed yet, per the user's request. Commit to `main` once Početna is finished.

## 8. Notes for the next agent

- **Adding a home section:** create `src/components/home/<Name>.astro`, wrap its content in `.container`, put `data-reveal` on the logical block (not on each element), and add it **inside `<div class="cover">`** in `src/pages/index.astro`, after `<About />`.
  - Anything placed outside the cover would sit under the pinned hero.
  - Sections inside the cover can have any background; the cover itself is Primary. For a stagger in a grid, set `--reveal-delay` on the children in CSS (e.g. `:nth-child(2) { --reveal-delay: 80ms }`).
- **Other pages:** mark the page's top section (the page title area) with `data-top-section` so the header scroll behaviour works. Everything else is automatic in `BaseLayout`.
  - On the first scroll the banner and header slide away and leave their 153px slot empty. To avoid a blank strip, extend the top section's background up behind them, as `Hero.astro` does: background layers start at `top: calc(-1 * var(--site-top-height))`, and the section uses `clip-path: inset(calc(-1 * var(--site-top-height)) 0 0 0)` instead of `overflow: hidden`.
- **Dark sections:** set `--focus-color: var(--color-light)` on the section so focus rings stay visible.
- **Fonts:** to add a weight, copy the latin and latin-ext woff2 files from the `@fontsource/<font>` npm tarball into `src/assets/fonts/` and add `...variants('<file>', <weight>)` in `astro.config.mjs`.
- **Reveal:** hidden styles only apply under `html.js` with `prefers-reduced-motion: no-preference`, so without JS or with reduced motion everything stays visible.
- **Tinted sections:** for a section that holds Primary cards (like Services), use `--color-primary-shade` as the section background, and `--color-border` for dividers.
- **Tabs:** `Services.astro` has the only tab script. If another page needs tabs, move it into a shared component instead of copying it.
- **Testing scroll behaviour (outdated note, kept for context):** with only Hero + About, a 1440×900 viewport can't scroll far enough for the cover to reach the top (max scrollY ≈ 845, so a 55px strip of the hero photo stays visible above About at the very bottom of the page). The header correctly stays `flow-hidden`. This goes away once more sections or the footer exist. At 1440×700 the full cycle was verified with puppeteer-core + Edge: flow (0) → flow-hidden (200) → fixed (max) → flow-hidden (400) → flow (0).
- **Headings:** don't set `font-size` on `h1`/`h2`/`h3` in components; the global scale does it. For a small title inside a card or list, use a non-heading element with `--text-lg`.
- **Light sections:** use `.eyebrow--accent`, `--color-dark-80` for body text, and `TextLink` for inline "more" links.
- **Dev toolbar:** the floating pill at the bottom centre in dev screenshots is the Astro dev toolbar, not part of the site.
- **Hex colours:** never write hex values in components. A grep for `#[0-9a-f]{3,6}` in `src/**/*.astro` currently returns nothing; keep it that way.
