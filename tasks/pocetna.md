# Handoff: Početna (`/`)

## 1. Summary

**State: content complete, awaiting the user's review.** The site foundation is done, and so are four sections of the home page: banner, header and hero (built from Figma node `61:88`, `Desktop`), the "O nama" teaser, the partner logo strip "Tvrtke koje nam vjeruju", the "Naše usluge" section, the "Galerija" carousel, the "Česta pitanja" FAQ, the "Javite nam se" contact section with the shared inquiry form, and the global **footer** (the last seven built from user reference images). Further home sections will come from the user's reference images. The form's sending (Web3Forms) is **not connected yet** (user decision).

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

### About + logos = one screen (home only): `.intro-screen` in `src/pages/index.astro`
- **User decision:** when About is in view, the "Tvrtke koje nam vjeruju" strip below it must be fully visible too, as if they were one section.
- `index.astro` wraps `<About />` and `<Partners />` in `<div class="intro-screen">` (scoped style in the page):
  - grid with `grid-template-columns: minmax(0, 1fr)` (otherwise the marquee's long track widens the block to ~2600px) and `grid-template-rows: 1fr auto`
  - `min-height: 100svh` (100vh fallback), `padding-top: var(--header-height)`
- **Why the 101px top padding:** the fixed header slides in exactly when this block reaches the top of the viewport (the hero is then fully covered) and lies over the block's top 101px. So that strip is left empty, and the content fits into `100svh − header` (user picked "window minus header").
- **About** takes all the free height (row `1fr`); **Partners** sits at the bottom (`auto`).
  - On tall screens the photo grows up to the old 4:5 size, then the content stays centred.
  - If the content can't fit (viewports shorter than ~768px), the block grows instead of overflowing.
- **Spacing that scales with height** (tokens in `global.css`):
  - `--screen-space` = `clamp(16px, 20px + (100svh − 790px) / 5, 64px)` → 16px at ~770px tall, ~42px at 900, 64px at ≥ 1010. It's used for About's top/bottom padding and Partners' padding above (after the divider) and below.
  - `--screen-gap` = `clamp(24px, --screen-space × 1.1, 48px)`: the gap between the logo title and the logos.
  - The ~521px About text column is the part that can't shrink, so the minimum fitting viewport is ~768px tall.
- **Verified in Chrome with puppeteer** (scrolled so the block's top is at the top of the viewport, header `fixed`):

  | Viewport | Block height | Logos fully visible | Photo |
  |---|---|---|---|
  | 1920×1080 | 1080 | yes | 522×618 |
  | 1440×900 | 900 | yes | 522×528 |
  | 1440×790 | 790 | yes | 522×528 |
  | 1366×768 | 768 | yes | 522×522 |
  | 1280×720 | 767 (+47px) | partly below the fold | 522×521 |

  No horizontal scroll at any of these sizes.
- **Reveal:** About and Partners keep their own `data-reveal`. Partners has `--reveal-delay: 120ms`, so it follows About (light stagger, user decision). No scroll snapping (user decision).

### O nama teaser (home only): `src/components/home/About.astro`
- Built from the user's reference screenshot (a two-column "We're built for your business" block). The layout follows the reference; the decorations were adapted to the PRD.
- `<section class="about">`, `--color-primary` background, `padding-block: var(--screen-space)` (it shares one screen with the logos, see above).
- `.container` grid: two equal columns (`minmax(0, 1fr)` ×2), 96px gap (`--space-24`), `align-items: center`, `height: 100%` (it fills the height `.intro-screen` gives About), `container-type: inline-size` (for the photo cap). Each column is 522px at 1440.
- **Left column:** eyebrow "O nama" (`.eyebrow .eyebrow--accent`) → 16px → `h2` "Pouzdan partner za svaki prijevoz" (global h2 scale, Dark) → 32px → three points → 32px → `TextLink` "Više o nama →" to `/o-nama`. The 32px gaps were 40px before the one-screen change.
  - The points are a `<dl>`. Each point is a `<div>` holding a `dt` title (`--text-lg` 1.25rem, SemiBold) and a `dd` text (1rem, `--color-dark-80`, 4px below the title). There are 16px between points (was 24px), and the list is at most 460px wide.
  - A `dl` rather than `h3`s, because the h3 size (2.441rem) is far too big for these titles (AGENTS.md rule 7).
- **Right column:** the hero van photo (`hero-van.png`) as a **placeholder**, `<Image>` WebP with the same widths as the hero (960/1280/1667), so the browser reuses the same files. Lazy loaded.
  - **The photo scales with the screen height (user decision):**
    - It's wrapped in `.about__media` with `height: 100%` (the row height), `min-height: var(--about-media-min)` (320px) and `max-height: calc((100cqi − 96px) / 2 × 5/4)` (never taller than the old 4:5 portrait).
    - The `<img>` is absolutely positioned (`inset: 0`, `object-fit: cover`, `object-position: 90% center`), so it never adds its own height to the row.
    - At 1440×900 it is 522 × 528px (almost square); at 1920×1080 it is 522 × 618px.
  - Plain `--radius` corners, no shadow or offset block (user decision; the reference's big radius and shadow card were dropped).
- The whole `.about__inner` block has `data-reveal`, so text and image fade up together.
- Copy is in a `points` array in the component frontmatter.

### Partner logos "Tvrtke koje nam vjeruju" (home only): `src/components/home/Partners.astro`
- Built from the user's reference ("Brands We Work With": a small centred title over one row of grey logos). Sits right after About.
- `<section class="partners" aria-labelledby="partners-title">`, `--color-primary` background (it continues About). It's the bottom part of the one-screen block (see "About + logos = one screen"). `padding-bottom: var(--screen-space)`.
- `.partners__inner` (the container) has a 1px `--color-border` hairline on top (user decision) and `padding-top: var(--screen-space)`.
- Title: `<p>` (not a heading; an h2 would be far too big, AGENTS.md rule 7), `--text-lg` SemiBold, centred. `--screen-gap` (24–48px, 46px at 900px tall) above the logos.
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
- At 1440×900 the section measures 187px tall; one logo list is ~1306px wide (more than the 1140 container, so the loop never shows a gap).

### Naše usluge (home only): `src/components/home/Services.astro`
- Built from the user's reference ("Construction Services": a heading and a list card on the left, two photos plus the active service's text on the right).
- **Heading (user decision, same pattern as O nama and Galerija):** `.eyebrow .eyebrow--accent` "Usluge" (`#services-eyebrow`) → 16px → h2 "Sve na jednom mjestu" (`.services__title`, wraps to 2 lines). The h2 used to be "Naše usluge". The tab list is labelled by the eyebrow (`aria-labelledby="services-eyebrow"`), so screen readers announce it as "Usluge"; the section is still labelled by the h2.
- `<section class="services" aria-labelledby="services-title">`, background `--color-primary-shade` (Primary mixed with 6% Dark). The list card is plain `--color-primary`, which replaces the reference's white card on grey (no white in the palette, user decision). `padding-block: var(--section-padding-y)`.
- `.container` grid: `minmax(0, 5fr) minmax(0, 7fr)`, 64px gap (`--space-16`), `align-items: start`. At 1440: left 448px, right 628px. The section is ~864px tall (~772px before the eyebrow and the 2-line h2).
- **Left:**
  - eyebrow "Usluge" + `h2` "Sve na jednom mjestu" in one colour (user decision; the reference's two-tone heading was dropped).
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

### Galerija carousel (home only): `src/components/home/Gallery.astro`
- Built from the user's reference ("Naši projekti": heading + "Vidi sve projekte" link, a strip of portrait cards with the 4th cut off by the screen edge, dots bottom-left, ← → bottom-right). Sits after Services, inside `.cover`.
- **Restyled from a second reference** (dark "Naš rad / Od utovara do isporuke" section). User decisions:
  - Dark background; layout unchanged (head row, strip, dots left, arrows right)
  - photos stay **clean until hover** (the reference shows tags/titles at rest; we don't), and the hover cover effect is **exactly as before**
  - head: `.eyebrow` "Galerija" (Light) → 16px → h2 "Od utovara do isporuke" → 16px → lead (max 600px, `--color-primary-80`). "Vidi više" stays on the right, bottom-aligned with the lead (`align-items: flex-end`), in the new `light` TextLink variant.
  - arrows: 52px circles (`--carousel-arrow-size` = `--button-height`), 12px apart, 1px `--color-primary-60` border, Primary icon (20px). Hover: Primary fill + Dark icon (the icon colour switches in one step at the midpoint, like `Button`/footer, so it never blinks; measured worst frame 3.8:1). Disabled (at an end): `--color-primary-20` fill, no border, `--color-primary-60` icon, as the reference's grey arrow.
  - dots: active Primary, inactive `--color-primary-30` (same sizes)
  - photo corners stay 4px
- **User decisions:**
  - heading `h2` "Galerija", link "Vidi više" → `/galerija` (the h2 later became "Od utovara do isporuke", see the restyle above)
  - 8 images, so there are 6 stop positions = 6 dots, as in the reference
  - hover shows tag + title + one sentence; cards are **not** clickable
  - section background: Accent was tried first, then Primary, now **Dark** (restyle)
  - arrows move one card and dim at the ends (no wrap, no autoplay)
  - mouse drag; trackpad/touch swipe allowed; dots are indicators only
- `<section class="gallery">`, `--color-dark` background, Primary text, `--focus-color: var(--color-light)`. `padding-block: var(--section-padding-y)`. ~946px tall at 1440. Sections now go Services (tint) → Galerija (dark) → FAQ (tint).
- **Geometry** (the section is `container-type: inline-size`, so `100cqi` = viewport width):
  - `--gallery-content` = the `.container` width, `--gallery-bleed` = the side gutter, `--gallery-card` = (content − 2 × 24px gap) / 3.
  - At 1440: cards 364 × 455 (4:5), gap 24. Cards 1–3 exactly fill 150–1290px; the 4th starts at 1314 and is cut by the screen edge.
  - The strip `<ul class="gallery__track">` is full width, with `padding-inline` and `scroll-padding-inline` = bleed. At rest it looks exactly like the reference. When scrolled, earlier cards stay visible in the left gutter instead of being cut at the container edge.
  - At the end the last card stops at the container's right edge (max scroll = 5 cards → 6 positions).
  - Head row: flex, h2 left, link right, vertically centred. 48px (`--space-12`) to the strip, 40px (`--space-10`) from the strip to the controls.
- **Scrolling:** native `overflow-x: auto` + `scroll-snap-type: x mandatory`, each card `scroll-snap-align: start`, scrollbar hidden.
- **Script (in the component):**
  - `step` = distance between two cards; `positions` = reachable stops (`round(maxScroll / step) + 1`). Extra dots get `hidden`, so if the responsive pass changes how many cards are visible, the dots stay right automatically.
  - Arrows: `scrollTo` ±1 step (smooth; instant with reduced motion). `disabled` at the ends (opacity `--opacity-disabled`).
  - Dots and arrow state update on `scroll` (rAF-throttled) and `resize`.
  - **Mouse drag:** pointer events, mouse only (touch and trackpad use native scroll).
    - After 4px of movement it captures the pointer and adds `.is-dragging` (snap off, `grabbing` cursor, no text selection, captions hidden).
    - On release, a drag of more than 15% of a card moves on in that direction; a shorter one returns to the nearest card.
    - Snap switches back on at `scrollend`, with a 700ms timeout fallback for Safari.
    - Images have `draggable="false"`.
  - Verified with puppeteer at 1440×900 (no horizontal page scroll):
    - rest: prev disabled, dot 1
    - next ×2: 776px, dot 3
    - 150px drag: 1164px, dot 4
    - next to the end: 1940px, dot 6, next disabled
    - prev: 1552px
- **Card:** `<figure tabindex="0">` with the `<Image>` and a `<figcaption>` overlay.
  - Hover **or keyboard focus** fades in `--color-overlay-card` (Dark 70%) over `--duration-overlay` (300ms), and the caption block slides up 16px.
  - Caption, bottom-left with 24px padding: `.eyebrow` service tag (Light), title (`--text-lg` SemiBold), sentence (1rem, `--color-primary-80`).
  - The focus ring is inset, because the scroller clips anything outside the card. It's Primary (`--focus-color` set on the focused card), because it sits on the dark overlay.
  - The caption sets its own `color: var(--color-primary)` (the section text is Dark).
  - Reduced motion: no transitions.
- **Controls:**
  - Dots: `aria-hidden`, 8px; the active one is 12px Primary, inactive ones `--color-primary-30`. Round, as in the reference.
  - Arrows: round 52px `<button>`s ("Prethodna fotografija" / "Sljedeća fotografija") with 20px `arrow-left` / `arrow-right` icons; the right circle's edge lines up with the container edge. Hover fills them and nudges the glyph 3px. See the restyle notes above for colours.
  - Without JS the controls are hidden (`html:not(.js)`) and the strip still scrolls.
- **Images are placeholders:** the hero van photo with 4 CSS crops, cycled so neighbours differ:
  - `object-position` 70% (the van), 0% (docks), 100% (van side), 40% (dock + van front)
  - same `widths` as the other sections, so no new image files
  - `sizes="(min-width: 1188px) 805px, 70vw"`: a 4:5 crop of the landscape photo needs ~805px of source width per 364px card
- The whole section content (head + strip + controls) has one `data-reveal`.

### Česta pitanja / FAQ (home only): `src/components/home/Faq.astro`
- Built from the user's reference (centred "FAQ" heading, a narrow list of questions with dotted dividers and a chevron on the right, "Can't find your answer here? Get in touch." below). Sits after Galerija, inside `.cover`.
- **User decisions:**
  - h2 "Česta pitanja", 7 questions, price/quote questions first, then other topics
  - bottom line "Niste pronašli odgovor? Javite nam se." with the link to `/kontakt`
  - narrow centred column, dotted dividers, `--color-primary-shade` background (sections alternate: Services shade → Galerija primary → FAQ shade)
  - a chevron that flips when open; one question open at a time; all closed on load
  - open question + chevron in Accent (also on hover); the answer slides open smoothly
- Layout: centred h2 → 48px → list (`max-width: var(--faq-width)`, 760px, centred) → 48px → the centred bottom line (`--color-dark-80`, default Accent `TextLink`). `padding-block: var(--section-padding-y)`. ~854px tall at 1440 with everything closed.
- **Markup:** native `<details class="faq__item" name="cesta-pitanja">` + `<summary class="faq__question">` (question text + 20px `chevron-down`) + `<div class="faq__answer"><p>`.
  - Question: `--text-lg` Medium, 20px top/bottom padding, grid `1fr auto`. The native marker is hidden.
  - Answer: 1rem, `--color-dark-80`, 24px bottom padding and 48px right padding (keeps it clear of the chevron).
  - Dividers: `1px dotted var(--color-dark-30)` between items (none above the first or below the last, as in the reference).
- **Without JS:** plain `<details>`. The shared `name` makes them exclusive natively (one open at a time), instant.
- **Script (in the component):**
  - removes `name` (otherwise the browser snaps the other item shut without animation) and handles exclusivity itself
  - on a summary click: closes the open item and opens the clicked one, animating the `.faq__answer` height with WAAPI over `--duration-accordion` (300ms, `--ease-out` curve)
  - while closing, `.is-closing` flips the question colour and chevron back right away; `open` is removed when the animation ends
  - clicking again mid-animation reverses from the current height
  - reduced motion: no animation, instant exclusive toggle
  - **Gotcha:** the build's CSS minifier rewrites `300ms` as `.3s`, so the script parses the token's unit (`ms` or `s`). Any future script that reads a duration token must do the same.
  - Verified with puppeteer at 1440×900: open 1 → open 3 (1 animates shut: 101 → 41 → 12 → 3px, while 3 grows 45 → 66 → 75px) → close 3 → Enter on 2 opens it → Space closes it. No horizontal scroll.
- **JSON-LD:** the component outputs a `FAQPage` script with the same questions and answers. Keep it in sync automatically by editing only the `questions` array. (Google currently shows FAQ rich results mainly for authoritative sites; the markup is still valid and harmless.)
- The whole `.faq__inner` (heading + list + bottom line) has one `data-reveal`.

### Javite nam se (home only): `src/components/home/Contact.astro`
- Built from the user's reference ("Get in Touch": blue left half with heading, lead and a 2×2 info block; light right half with a "Contact Details" form card). Last section inside `.cover`.
- **User decisions:** full-bleed halves; left half `--color-accent`; heading "Javite nam se"; cards Telefon / Email / WhatsApp / Adresa (WhatsApp replaces the reference's business hours, which aren't decided yet).
- Background: `linear-gradient(to right, accent 50%, primary-shade 50%)`, so the colour split is at the screen centre.
- **Each block is centred in its own colour half** (user decision; this deliberately breaks the 1140px container alignment, and `.contact__inner` doesn't use `.container`):
  - grid `repeat(2, minmax(0, var(--contact-half-max)))` + `justify-content: center`: two columns that meet at the split, each at most 720px (half the 1440 design)
  - each block has `justify-self: center` and `width: min(<block width>, 100% − 2 × 48px)`: the intro is 480px (`--contact-intro-width`), the form card 522px (`--contact-card-width`)
  - **wide screens (user decision, "cap the distance"):** the halves stop growing at 720px, so above 1440 the blocks stay as far from the split as at 1440 instead of drifting apart
  - **narrow screens:** at least 48px between each block and the split / screen edge; the blocks narrow instead
  - vertically both are centred (`align-items: center`); the section keeps its 96px padding (~820px tall)
  - text inside the intro stays left-aligned; the submit button stays right-aligned in the card
  - verified with puppeteer:

    | Viewport | Intro (left / width / gap to split) | Card (gap to split / width / gap to edge) |
    |---|---|---|
    | 1100 | 48 / 454 / 48 | 48 / 454 / 48 |
    | 1440 | 120 / 480 / 120 (exact centre) | 99 / 522 / 99 (exact centre) |
    | 1920 | 360 / 480 / 120 (capped) | 99 / 522 / 339 (capped) |

    No horizontal scroll; both blocks' vertical centres at the same height.
- **Left** (Primary text, `--focus-color: var(--color-primary)`): h2 → 16px → lead (max 440px) → 40px → the info block.
  - The info block is a `<ul>` 2×2 grid on `--color-primary-12`, `--radius`, hairlines (`--color-primary-20`) between the cells.
  - Each cell is a whole-cell link (tel / mailto / WhatsApp / Google Maps, the last two in a new tab with a hidden note): 20px icon → label (SemiBold) → value (`--text-small`). Hover: a lighter tint.
- **Right:** a Primary card (32px padding, `--radius`), title "Pošaljite upit" (`<p>`, `--text-lg` SemiBold), then `<ContactForm idPrefix="upit" />`.
- The whole `.contact__inner` has one `data-reveal`.

### Inquiry form (shared): `src/components/ContactForm.astro`
- **User decision:** one shared form, used on the home page now and on `/kontakt` later. This deviates from PRD §7 ("only on /kontakt").
- **Fields** (2-column grid, 20px row gap / 16px column gap):
  - Ime i prezime* (`name`)
  - Email* (`email`)
  - Telefon (`phone`, **optional**, user decision; labelled "(neobavezno)"; loose pattern `[0-9+()/ -]{6,20}`)
  - Naslov* (`naslov`, user decision; it becomes the email subject "Novi upit: <naslov>")
  - Poruka* (`message`, full width, textarea)
  - consent checkbox* with a link to `/politika-privatnosti`
- Hidden: `subject`, `from_name`, and the honeypot `botcheck` (visually hidden, `tabindex="-1"`). The names already follow Web3Forms.
- Inputs: 48px (`--input-height`), 1px `--color-input-border`, Primary fill, `--radius`, placeholders in `--color-dark-60`. Hover: darker border. Focus: Accent border + focus ring.
- **Validation** (`novalidate` + the script, so the messages are Croatian):
  - on submit every field is checked; errors show under the field (`circle-alert` icon + text), linked with `aria-describedby`, `aria-invalid="true"` on the control, focus on the first invalid field
  - after the first submit, fields re-check while typing
  - messages: "Upišite ime i prezime." / "Upišite email adresu." / "Upišite ispravnu email adresu, npr. ivan@email.com." / "Upišite ispravan broj telefona." / "Upišite naslov upita." / "Napišite poruku." / "Za slanje upita potrebna je vaša privola."
  - **no red in the palette**, so errors use `--color-error` (= Dark) with a 2px border and the icon. Change that one token if a red is approved.
- **Sending is NOT connected** (user: "ignore it for now, just create the form"). A valid submit sets the subject and shows the fallback in the `role="status"` region: "Slanje upita trenutno nije moguće. Nazovite nas na 099 213 2638 ili nam pišite na gajatrans2025@gmail.com." (with links). So no visitor is told their message was sent. The TODO in the script lists the Web3Forms steps (access key input, hCaptcha, fetch POST, "Šaljem…" state, success message, reset).
- `idPrefix` prop keeps the ids unique if the form ever appears twice on one page.
- Verified with puppeteer: empty submit → 5 errors, focus on "Ime i prezime"; "ivan@" → the invalid-email message; valid → no errors, subject "Novi upit: Selidba stana", fallback shown.

### Footer (global, every page): `src/components/Footer.astro`
- Built from the user's reference ("RoofPro Services" footer). Rendered by `BaseLayout` after `<main>`. Dark background, Primary text, `--focus-color: var(--color-light)`. The footer is an inline-size container (for the wordmark size).
- **Top**, a 3-column grid `5fr 3fr 4fr` (the reference is ≈ 6/3/3; the contact column is wider so the email fits on one line):
  - tagline "Vaš pouzdan partner za prijevoz, dostavu i selidbe diljem Hrvatske." (`--color-primary-60`, max 340px) + **Facebook and Instagram** round icons (40px circles on `--color-primary-12`; hover Primary fill). Their URLs are **placeholders** (`site.social` in `site.ts`, `'#'`).
  - "Brzi linkovi" (`.eyebrow`) + the `navItems` as uppercase `--text-small` links (`--color-primary-60`, hover Primary + underline), in a `<nav aria-labelledby>`
  - "Kontakt" (`.eyebrow`) + Email / Telefon / Adresa: 40px icon circle, small label, value (the address on two lines). Whole items are links; hover fills the circle.
  - **Icon circle hover fix (user-reported blink):** the circle fill fades (`ease-in-out`), but the icon colour switches in one step at the midpoint (`color 0s linear calc(var(--duration-fast) / 2)`), like the outline `Button`.
    - Before, fill and icon faded together and met in the same grey halfway (measured 1:1 contrast with animations slowed 20×), so the icon vanished and reappeared on hover out.
    - The worst frame is now 3:1. Don't put a normal colour fade back on `.footer__circle`, and use the same pattern for any future "fill + inverted icon" hover.
- **Wordmark** "GAJA TRANS" (user decision: Poppins Bold, "TRANS" muted; it's Medium weight in `--color-primary-60` for the reference's two-tone look). `aria-hidden` (decorative).
  - Size `--text-wordmark` = container width × 0.1655, so it spans exactly the container. Verified at 1100 / 1440 / 1920: text edges = container edges, no horizontal scroll.
  - If the text, font or weight changes, re-tune the 0.1655 factor in `global.css`.
- **Bottom bar:** hairline on top, "© <build year> GAJA TRANS j.d.o.o. · OIB 03762709970. Sva prava pridržana." left, "Politika privatnosti" right.

### Text links (all sections): `src/components/TextLink.astro`
- **User decision:** links look like the gallery reference: plain underlined text, **no arrow**. The arrow was also removed from "Više o nama" and "Saznaj više".
- Medium 500 (was SemiBold), 1px underline with a 6px offset, 2px underline on hover. The colours stay as they were (Accent, darker on hover).
- `variant` prop: `accent` (default, light sections), `inverse` (Primary text, unused for now) or `light` (Light #9DB3FF text that turns Primary on hover, for Dark sections; used by the Galerija "Vidi više").

### Other global pieces
- `WhatsAppButton.astro`: **removed (user decision). The component file is deleted and it no longer renders on any page.** It can be restored from git history. The `--color-whatsapp*` tokens are still in `global.css` but nothing uses them now. Was: fixed bottom-right, 56px **green circle with a white WhatsApp glyph** (the real WhatsApp look, user decision), `aria-label="Pišite nam na WhatsApp"`. Hover darkens the green and lifts the button 2px.
- Skip link "Preskoči na sadržaj" → `#sadrzaj` (`<main>`). Visible on focus only.

## 3. Files created / modified

| Path | Description |
|---|---|
| `astro.config.mjs` | `site` (placeholder `https://example.com`, TODO), `@astrojs/sitemap`, Astro Fonts API with local Poppins 500/600/700 and Noticia Text 400 (latin + latin-ext, each with its unicode-range) |
| `package.json` / `package-lock.json` | Added `@astrojs/sitemap` |
| `src/styles/global.css` | All tokens, reset, base, `.container`, `.visually-hidden`, `.eyebrow`, `.highlight`, reveal CSS |
| `src/data/site.ts` | Company info, phone/WhatsApp/email/address (+ Maps URL), `social` (placeholder URLs), `navItems`, `services` (now `{ name, slug }` objects, plus `Service`/`ServiceSlug` types) |
| `src/layouts/BaseLayout.astro` | `<html lang="hr">`, SEO/OG/Twitter/canonical, JSON-LD `MovingCompany`, fonts, skip link, Banner, Header, `<main id="sadrzaj">`, Footer, WhatsApp button, reveal script |
| `src/components/Banner.astro` | Top contact bar |
| `src/components/Header.astro` | Header, nav and scroll behaviour |
| `src/components/Button.astro` | Primary/outline button |
| ~~`src/components/WhatsAppButton.astro`~~ | Floating WhatsApp link (deleted, user decision) |
| `src/components/icons/Icon.astro` | Inline SVG icons: `phone`, `mail`, `map-pin`, `arrow-right` (Lucide), `whatsapp` (Simple Icons) |
| `src/components/home/Hero.astro` | Home hero (H1 now takes its size from the global scale) |
| `src/components/home/About.astro` | Home "O nama" teaser: text + points + link, portrait image |
| `src/components/TextLink.astro` | Underlined text link (no arrow), `accent` / `inverse` / `light` variants |
| `src/components/home/Partners.astro` | Home partner logo marquee "Tvrtke koje nam vjeruju" |
| `src/components/home/Services.astro` | Home "Naše usluge": vertical service tabs + crossfading panels |
| `src/components/home/Gallery.astro` | Home "Galerija": scroll-snap carousel with hover captions, dots, arrows, mouse drag |
| `src/components/home/Faq.astro` | Home "Česta pitanja": animated `<details>` accordion + FAQPage JSON-LD |
| `src/components/home/Contact.astro` | Home "Javite nam se": Accent info half + form card |
| `src/components/ContactForm.astro` | Shared inquiry form with Croatian validation (sending not connected yet) |
| `src/components/Footer.astro` | Global footer: tagline + socials, quick links, contact, wordmark, legal bar |
| `src/assets/logos/*.svg` | 8 placeholder partner logos (fictional brands), to be replaced |
| `src/pages/index.astro` | Home page: BaseLayout + Hero + `<div class="cover">` holding `.intro-screen` (About + Partners as one screen), Services, Gallery, Faq, Contact |
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
- **Added for the one-screen About + logos block:**
  - `--screen-space`: spacing that scales with viewport height, 16–64px
  - `--screen-gap`: 24–48px
  - `--about-media-min` (320px)
  - See "About + logos = one screen".
- **Icons added (Lucide v1.73):** `arrow-up-right`, `truck`, `sofa`, `warehouse`, `trees`, `sparkles`, `circle-plus`, `arrow-left` (same 16px crop as `arrow-right`), `chevron-down`.
- **Added for the contact section, form and footer:**
  - colours: `--color-dark-60` (placeholders, optional label), `--color-input-border` (Dark 20%), `--color-primary-12` / `--color-primary-20` / `--color-primary-60` (tints of Primary on Accent/Dark), `--color-error` (= Dark, no red in the palette)
  - sizes: `--input-height` (48px), `--social-size` (40px circles), `--text-wordmark` (footer wordmark, scales with the container)
  - contact layout: `--contact-half-max` (720px), `--contact-intro-width` (480px), `--contact-card-width` (522px)
  - icons: `circle-alert` (Lucide), `facebook` and `instagram` (Lucide v0.460; brand icons were dropped in later Lucide versions)
  - `--radius-round` is also used for the footer icon circles (round in the reference)
- **Added for the FAQ:** `--faq-width` (760px), `--duration-accordion` (300ms). `--color-dark-30` is also used for the dotted dividers.
- **Added for the Galerija carousel:**
  - `--color-primary-30` (inactive dots on Dark), `--color-overlay-card` (Dark 70%, hover overlay on images)
  - `--carousel-arrow-size` (52px round arrows), `--dot-size` (8px), `--dot-size-active` (12px)
  - removed in the dark restyle: `--control-size` and `--opacity-disabled` (unused now)
  - `--link-underline` (1px), `--link-underline-hover` (2px), `--link-underline-offset` (6px), used by `TextLink`
  - `--duration-overlay` (300ms)
  - `--radius-round` is now also used for the carousel dots (they're round in the reference).
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
  - props: `href`, `variant?: 'accent' | 'inverse' | 'light'` (default `accent`), `class`
  - 1rem Medium, underlined (1px, 6px offset), **no arrow** (user decision)
  - hover: the underline grows to 2px; `accent` also darkens to `--color-accent-hover`
  - `accent` for light backgrounds, `inverse` (Primary) for Accent/Dark backgrounds
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
- **Floating WhatsApp button removed** (user decision). This deviates from PRD §5, which lists it on every page. WhatsApp is still reachable through the contact card on the home page.
- **WhatsApp button (now deleted) was a green circle with a white glyph** (user decision). This deliberately breaks PRD §4.1 (no WhatsApp green, no pure white) and §4.3 (no round shapes), and PRD §5 still describes the old accent/primary version. The exception is limited to this one component through dedicated tokens.
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
  - eyebrow "Usluge" + a single-colour h2 "Sve na jednom mjestu" (user decision)
  - all 6 services instead of 4 (user decision)
  - tinted section + Primary card instead of a white card on grey (palette)
  - the panel title is a `<p>` with `--text-lg`, not an h3 (AGENTS.md rule 7)
  - the link reads "Saznaj više →" (existing `TextLink`) instead of the reference's small uppercase "VIEW SERVICE"
  - both images are the van photo (user decision)
- **Galerija vs reference:**
  - heading "Galerija" and link "Vidi više" instead of "Naši projekti" / "Vidi sve projekte" (user decision)
  - 8 cards to get the reference's 6 dots (user decision)
  - the strip is full width: at rest it's identical to the reference, but scrolled-past cards stay visible in the left gutter
  - **second reference (dark):** clean photos at rest instead of always-visible tags/titles; the hover overlay kept; dots kept instead of the reference's "06 —— 06" progress bar; arrows stay below the strip (the reference has them in the head row); "Vidi više" without an arrow (user kept the text); 4px corners instead of ~12px; the lead has no "[BROJ]" number
- **FAQ vs reference:**
  - heading "Česta pitanja" instead of "FAQ" (user decision)
  - Accent open/hover state (user decision); the reference shows no open state
  - the questions use `--text-lg` (the reference ratio of heading to question text)
- **Inquiry form on the home page** (shared with `/kontakt`): deviates from PRD §7 ("only on /kontakt"), user decision. The fields deviate too: Telefon is optional and "Naslov" was added (user decision).
- **Contact vs reference:** WhatsApp replaces "Business hours"; the 4 info cells are links; the form card is Primary on the tinted half instead of white on grey (palette).
- **Contact section ignores the container** (user decision): both blocks are centred in their colour halves, not aligned to the 1140px container like every other section.
- **Footer vs reference:**
  - "GAJA TRANS" wordmark with "TRANS" in Medium + 60% Primary (the reference's lighter second word)
  - "Brzi linkovi" are the nav pages (no FAQ link)
  - the bottom bar has the OIB (legal requirement) and only "Politika privatnosti" (no Terms/Cookies pages exist)
  - columns 5/3/4 instead of ≈ 6/3/3 so the email fits on one line
- **Text links lost their arrow** and are now Medium weight everywhere (user decision, following the gallery reference). The colours didn't change.
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
| Services eyebrow / H2 | Usluge / Sve na jednom mjestu | eyebrow agreed; H2 written by agent at the user's request (replaces "Naše usluge") |
| Services lead | Od jedne pošiljke do kompletne selidbe – jedan tim za sve što vam treba. | placeholder (reworded so it doesn't repeat the H2) |
| Prijevoz i dostava | Prevozimo i dostavljamo pošiljke svih veličina – od jednog paketa do punog kombija robe. Dogovorimo termin koji vam odgovara i robu sigurno dovezemo na adresu, bilo gdje u Hrvatskoj. | placeholder |
| Selidbe | Selimo stanove, kuće i urede od pakiranja do posljednje kutije. Namještaj pažljivo rastavljamo, štitimo i ponovno slažemo, a vi se brinete samo o tome gdje će što stajati. | placeholder |
| Skladištenje | Trebate privremeno spremiti namještaj, robu ili opremu? Vaše stvari čuvamo u sigurnom i suhom prostoru – na kraće ili dulje vrijeme – i dostavljamo ih kad vam zatrebaju. | placeholder |
| Uređenje okoliša | Uređujemo dvorišta, vrtove i okućnice: košnja, orezivanje, čišćenje zelenih površina i odvoz otpada. Vaš okoliš ostaje uredan bez vašeg truda. | placeholder |
| Čišćenje prostora | Čistimo stanove, kuće, urede i poslovne prostore – nakon selidbe, renovacije ili redovito. Prostor vam predajemo čist i spreman za korištenje. | placeholder |
| Dodatne usluge | Odvoz glomaznog otpada, pražnjenje podruma i tavana, montaža namještaja i druge sitne usluge. Recite nam što vam treba, a mi ćemo pronaći rješenje. | placeholder (the client must confirm which extra services they really offer) |
| Services link | Saznaj više → `/usluge#<slug>` | agreed (the page doesn't exist yet) |
| Services image alts | Utovarne rampe skladišta / Bijeli dostavni kombi ispred skladišta | placeholder (describe the stock photo) |
| Galerija eyebrow / H2 / link | Galerija / Od utovara do isporuke / Vidi više → `/galerija` | agreed (the page doesn't exist yet) |
| Galerija lead | Selidbe, dostave i skladištenje za privatne i poslovne klijente. Pogledajte kako radimo na terenu. | agreed (adapted from the reference, without the number) |
| Galerija card 1 | **Selidbe** – Selidba stana u Osijeku – Pakiranje, rastavljanje i ponovno slaganje namještaja – sve u jednom danu. | placeholder (invented example project) |
| Galerija card 2 | **Skladištenje** – Privremeno skladištenje opreme – Uredska oprema na sigurnom tijekom renovacije, dostavljena čim je zatrebala. | placeholder |
| Galerija card 3 | **Prijevoz i dostava** – Dostava namještaja kupcima – Preuzimanje iz trgovine i dostava na kućnu adresu, uz unos u stan. | placeholder |
| Galerija card 4 | **Uređenje okoliša** – Uređenje dvorišta obiteljske kuće – Košnja, orezivanje živice i odvoz zelenog otpada u jednom dolasku. | placeholder |
| Galerija card 5 | **Čišćenje prostora** – Čišćenje stana nakon selidbe – Temeljito čišćenje praznog stana prije predaje novim stanarima. | placeholder |
| Galerija card 6 | **Dodatne usluge** – Pražnjenje podruma i tavana – Razvrstavanje, iznošenje i odvoz glomaznog otpada na zbrinjavanje. | placeholder |
| Galerija card 7 | **Selidbe** – Selidba ureda preko vikenda – Preseljenje cijelog ureda bez prekida u radu tvrtke. | placeholder |
| Galerija card 8 | **Prijevoz i dostava** – Redovita dostava za trgovine – Tjedna dostava robe iz skladišta na prodajna mjesta diljem Slavonije. | placeholder |
| Galerija image alts | Bijeli dostavni kombi ispred skladišta / Utovarne rampe skladišta / Bočna strana bijelog dostavnog kombija / Utovarna rampa i prednji dio dostavnog kombija | placeholder (they describe the stock photo crops) |
| Galerija arrows (aria-label) | Prethodna fotografija / Sljedeća fotografija | written by agent |
| FAQ H2 | Česta pitanja | agreed |
| FAQ 1 | Kako se formira cijena usluge? – Cijena ovisi o vrsti usluge, udaljenosti, količini stvari i broju ljudi koji su potrebni za posao. Nakon kratkog razgovora ili nekoliko fotografija pošaljemo vam točnu ponudu, bez skrivenih troškova. | placeholder |
| FAQ 2 | Je li procjena troškova besplatna? – Da. Ponuda je besplatna i ni na što vas ne obvezuje. Javite nam se telefonom, putem WhatsAppa ili kontakt obrasca i odgovorit ćemo vam u najkraćem roku. | placeholder (client must confirm quotes are free) |
| FAQ 3 | Kako mogu platiti uslugu? – Uslugu možete platiti gotovinom ili uplatom na račun. Tvrtkama izdajemo račun s njihovim podacima, a način plaćanja dogovaramo unaprijed, zajedno s ponudom. | placeholder (client must confirm payment methods) |
| FAQ 4 | Radite li i izvan Osijeka i okolice? – Da. Prijevoz, dostavu i selidbe obavljamo diljem Hrvatske. Za duže relacije termin i cijenu dogovaramo unaprijed kako bi sve proteklo bez iznenađenja. | placeholder (service area still to be confirmed, PRD §13) |
| FAQ 5 | Koliko unaprijed trebam rezervirati termin? – Za selidbe preporučujemo da nam se javite barem tjedan dana ranije, osobito krajem mjeseca. Manje prijevoze i dostave često možemo odraditi već za dan ili dva. | placeholder (client must confirm lead times) |
| FAQ 6 | Pakirate li stvari i rastavljate namještaj? – Da, na vaš zahtjev. Stvari pažljivo pakiramo, namještaj rastavljamo i na novoj adresi ponovno slažemo, a osjetljive predmete štitimo dekama i folijom. | placeholder |
| FAQ 7 | Mogu li uz selidbu dogovoriti i čišćenje ili skladištenje? – Možete. Nakon selidbe očistit ćemo stari ili novi prostor, a stvari koje vam trenutno ne trebaju čuvamo u skladištu. Sve dogovarate s jednim timom i jednim kontaktom. | placeholder |
| FAQ bottom line | Niste pronašli odgovor? Javite nam se. → `/kontakt` | agreed |
| Contact H2 | Javite nam se | agreed |
| Contact lead | Trebate prijevoz, selidbu ili neku drugu uslugu? Pošaljite nam upit i javit ćemo vam se s besplatnom ponudom. | agreed (the client must confirm quotes are free) |
| Contact cards | Telefon 099 213 2638 / Email gajatrans2025@gmail.com / WhatsApp "Pošaljite nam poruku" / Adresa Nikole Šubića Zrinskog 32, 31220 Višnjevac | agreed |
| Form card title / button | Pošaljite upit / Pošalji upit → | written by agent |
| Form placeholders | npr. Ivan Horvat / npr. ivan@email.com / npr. 091 234 5678 / npr. Selidba stana / Opišite što vam treba: usluga, adresa, okvirni termin… | written by agent |
| Consent | Slažem se s obradom osobnih podataka u skladu s Politikom privatnosti. | PRD §7 |
| Form fallback | Slanje upita trenutno nije moguće. Nazovite nas na 099 213 2638 ili nam pišite na gajatrans2025@gmail.com. | written by agent (temporary, until Web3Forms) |
| Footer tagline | Vaš pouzdan partner za prijevoz, dostavu i selidbe diljem Hrvatske. | agreed |
| Footer headings | Brzi linkovi / Kontakt | written by agent |
| Footer legal line | © <year> GAJA TRANS j.d.o.o. · OIB 03762709970. Sva prava pridržana. | agreed |
| Social labels | GAJA TRANS na Facebooku / GAJA TRANS na Instagramu (visually hidden) | written by agent |

## 7. Open issues / TODOs

- [ ] **Hero photo resolution:** the user will send a larger version (≥ 2880px wide) for sharp retina rendering. Replace `src/assets/hero-van.png` (same file name) and keep the same framing.
- [ ] **Hero on narrow/tall screens:** at ~1280×1024 the hero text overlaps the front of the van (the photo is cropped from the left). Look at this in the responsive pass.
- [ ] **Domain:** `site` in `astro.config.mjs` and `public/robots.txt` use `https://example.com`.
- [ ] **Final logo:** an SVG would replace `gaja-logo.png` (41px raster) and allow a proper apple-touch-icon.
- [ ] **Hover colours** are provisional (`--color-accent-hover`, banner link hover, outline fill).
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
- [ ] **Galerija section:**
  - replace the 8 placeholder projects (photos and copy) with real ones (the `projects` array in `Gallery.astro`). With 3 visible cards, `n` cards give `n − 2` dots automatically.
  - touch screens have no hover, so captions show there only on keyboard focus. Decide this in the responsive pass (e.g. always show a caption strip under `(hover: none)`), and set the cards per row there too (the `/ 3` in `--gallery-card`).
  - `/galerija` 404s until the page exists
- [ ] **FAQ:** the client must approve or replace all 7 questions and answers (especially free quotes, payment methods, service area and booking lead times). Edit only the `questions` array in `Faq.astro`; the JSON-LD follows it.
- [ ] **Form sending (Web3Forms):** not connected, user decision. Follow the TODO in `ContactForm.astro` once the key exists (PRD §7: `.env` with `PUBLIC_WEB3FORMS_ACCESS_KEY`, a committed `.env.example`, hCaptcha, loading state, success message, reset).
- [ ] **Error colour:** errors use Dark, because the palette has no red. Ask the user whether to approve a red (`--color-error`).
- [ ] **Social links:** `site.social.facebook` / `instagram` are `'#'` placeholders. Replace them, or remove the icons if the client has no profiles.
- [ ] **Contrast on Accent:** Primary on Accent is ~3.6:1. That's fine for the h2 but below WCAG AA (4.5:1) for the contact lead and card text. Mention it to the user if accessibility matters.
- [ ] **Base path:** `astro.config.mjs` has `base: '/gaja-web'` (GitHub Pages), but internal links (`/kontakt`, `/galerija`, …) don't include it. Fix this site-wide, or drop it once the site moves to its own domain.
- [ ] The remaining Početna sections, from the user's references.
- [ ] **Commit:** not committed yet. The user wants to review first and will say when to commit to `main`.

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
- **Carousel:** `Gallery.astro` has the only carousel script. If another page needs one (e.g. `/galerija`), move it into a shared component instead of copying it.
- **Form:** reuse `<ContactForm idPrefix="kontakt" />` on `/kontakt`; don't copy it. It brings its own styles and script.
- **Footer** is global (BaseLayout); pages need nothing extra.
- **Accordion:** `Faq.astro` has the only accordion script. If `/usluge` or another page needs one, move it into a shared component.
- **Duration tokens in JS:** the minifier turns `300ms` into `.3s`. Parse the unit (see `duration()` in `Faq.astro`).
- **Tabs:** `Services.astro` has the only tab script. If another page needs tabs, move it into a shared component instead of copying it.
- **Testing scroll behaviour (outdated note, kept for context):** with only Hero + About, a 1440×900 viewport can't scroll far enough for the cover to reach the top (max scrollY ≈ 845, so a 55px strip of the hero photo stays visible above About at the very bottom of the page). The header correctly stays `flow-hidden`. This goes away once more sections or the footer exist. At 1440×700 the full cycle was verified with puppeteer-core + Edge: flow (0) → flow-hidden (200) → fixed (max) → flow-hidden (400) → flow (0).
- **Headings:** don't set `font-size` on `h1`/`h2`/`h3` in components; the global scale does it. For a small title inside a card or list, use a non-heading element with `--text-lg`.
- **Light sections:** use `.eyebrow--accent`, `--color-dark-80` for body text, and `TextLink` for inline "more" links.
- **Dev server:** a dev server the user started themselves may already be running on :4321 (`astro dev status` shows it, but `astro dev logs` can't read it). Don't stop it. To check a build, run `npx astro preview --port 4400` and open `http://localhost:4400/gaja-web/` (base path).
- **Dev toolbar:** the floating pill at the bottom centre in dev screenshots is the Astro dev toolbar, not part of the site.
- **Hex colours:** never write hex values in components. A grep for `#[0-9a-f]{3,6}` in `src/**/*.astro` currently returns nothing; keep it that way.
