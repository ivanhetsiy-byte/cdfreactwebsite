---
name: Childrens Dance Factory
description: Swiss Stage — black/white editorial discipline with brand-red signal and occasional color photography.
colors:
  paper: "#ffffff"
  ink: "#000000"
  swiss-grey: "#666666"
  stage-red: "#c31716"
  stage-red-error: "#b42318"
  body-ink: "#1a1a1a"
  body-ink-dark: "#f2f2f2"
typography:
  display:
    fontFamily: "Helvetica, Arial, sans-serif"
    fontSize: "clamp(3rem, 12vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Helvetica, Arial, sans-serif"
    fontSize: "clamp(2.75rem, 8vw, 16rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Helvetica, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.02em"
  body:
    fontFamily: "Montserrat, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.22em"
  compressed-display:
    fontFamily: "Helvetica Compressed, Helvetica, Arial, sans-serif"
    fontSize: "clamp(4.5rem, 17.6vw, 28rem)"
    fontWeight: 900
    lineHeight: 0.85
    letterSpacing: "-0.03em"
rounded:
  none: "0px"
  sm: "2px"
  full: "9999px"
spacing:
  gutter-sm: "1.25rem"
  gutter-md: "1.5rem"
  gutter-lg: "2.5rem"
  section-y-sm: "4rem"
  section-y-md: "6rem"
  section-y-lg: "8rem"
  container: "80rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "1rem 2.5rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.stage-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
  button-footer-cta:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "110px"
  button-footer-cta-hover:
    backgroundColor: "{colors.stage-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
  input-underline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.75rem 0"
    typography: "{typography.body}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    typography: "{typography.label}"
---

# Design System: Childrens Dance Factory

## Overview

**Creative North Star: "The Swiss Stage"**

CDF’s visual system is a high-contrast Swiss stage: black and white as the default architecture, hard edges, and disciplined uppercase Helvetica. Editorial scale is reserved for important moments — oversized type stacks, vast negative space, and photography treated as plates — while everyday chrome stays restrained and athletic. Color is scarce on purpose: brand red is a signal (CTA, focus, error), and photography may carry full color when the image earns it.

The system rejects soft “kids activity” pastels, purple SaaS gradients, rounded card grids, and decorative glow. Depth comes from planes, rules, and type scale — not shadows. Hero and programs surfaces may be redesigned later; they are not the token source of truth for this document. Documented authority is chrome, mission, about, classes, contact, gallery treatment, and shared utilities.

**Key Characteristics:**
- Black / white foundation with Stage Red `#c31716` as the only brand accent
- Zero-radius geometry; hairline and 3px rules instead of cards
- Helvetica (Swiss) for display/chrome; Montserrat for reading body and forms
- Editorial scale for key statements; tracked uppercase eyebrows for metadata
- Flat surfaces; motion via Lenis/GSAP transforms, not decorative elevation
- Occasional color photography; UI stays monochrome except red signal moments

## Colors

A monochrome Swiss palette with one signal red and optional full-color photo plates.

### Primary
- **Stage Red** (`#c31716`): Brand signal for CTA hover (footer bar), focus rings, bag badge, and dark-mode selection. Rarity is the point — not a wash.

### Secondary
- **Stage Red Error** (`#b42318`): Form validation / destructive emphasis only.

### Neutral
- **Paper** (`#ffffff`): Light canvas / inverted text on ink.
- **Ink** (`#000000`): Primary type, borders, filled primary buttons.
- **Swiss Grey** (`#666666`): Muted labels, idle social icons, secondary chrome.
- **Body Ink** (`#1a1a1a` light / `#f2f2f2` dark): Softer reading text on home/supporting paras when pure black is too hard.

### Named Rules
**The Signal Red Rule.** Stage Red appears for action, focus, or error — not as large decorative fields. UI chrome stays black/white.

**The Photo Plate Rule.** Photography may be full color (or start grayscale and resolve to color). UI chrome does not borrow photo hues.

## Typography

**Display Font:** Helvetica (local) with Arial/sans fallback — weights 300 / 400 / 700 / 900 (900 maps to Bold). Compressed Helvetica 900 for extreme editorial stacks.
**Body Font:** Montserrat 400 / 700 for forms and supporting paragraphs; Helvetica remains default document face.
**Label Font:** Helvetica uppercase with wide tracking (eyebrow utility).

**Character:** Restrained/bold Swiss — athletic uppercase chrome, editorial display when the statement matters, quieter Montserrat for reading.

### Hierarchy
- **Display** (700, `clamp(3rem, 12vw, 4.5rem)` → large vw on desktop, line-height ~0.92): Page titles and major statements.
- **Headline** (700, section clamps up to ~8–11vw / classes up to ~16rem): Section titles, often with a 3px underline rule.
- **Compressed display** (900, `clamp(4.5rem, 17.6vw, 28rem)`): Mission / motto-scale editorial stacks only.
- **Title** (700, ~1.25rem): Subheads and dense chrome labels.
- **Body** (400, ~1rem, line-height 1.4–1.54): Contact copy, form fields, supporting paras in Montserrat.
- **Label / eyebrow** (500–700, ~0.7–0.75rem, `letter-spacing: 0.22em`, uppercase): Metadata, nav closed state, captions, form labels (`.type-eyebrow`).

### Named Rules
**The Case Discipline Rule.** Chrome and page titles default to uppercase Swiss. Body reading copy does not shout in all-caps.

**The Editorial Reserve Rule.** Extreme compressed / multi-rem display is for important brand statements — not every section heading.

## Layout

Page content uses `.container-page` (`max-w-7xl` / 80rem) with responsive horizontal padding. Section vertical rhythm uses `.section-padding` (`py-16` → `md:py-24` → `lg:py-32`). Site chrome (nav, footer, status) uses a wider gutter language: `px-5` → `md:px-8` → `lg:px-10`.

Composition favors full-bleed planes, hairline dividers, and asymmetric editorial blocks over card grids. Contact uses a 12-column split (form ~7 cols). Gallery strips may bleed past gutters. Breakpoints: sm 40 / md 48 / lg 64 / xl 80 / 2xl 96 rem.

### Named Rules
**The Chrome Gutter Rule.** Nav, footer, and status share the `px-5 → lg:px-10` pad language so the stage frame stays consistent.

## Elevation & Depth

Flat by default. No systemic box-shadow vocabulary on surfaces. Depth is conveyed with black/white planes, 1px–3px rules, progressive nav blur, and occasional caption gradients over photography. Do not introduce multi-layer card shadows to “add polish.”

### Named Rules
**The Flat-By-Default Rule.** Surfaces rest flat. Motion and contrast carry hierarchy; shadows are not a design layer.

## Shapes

Corner radius is **0** system-wide (`--radius: 0`). Forms, buttons, and section frames are square. Rare exceptions only: small icon hit-areas (`rounded-sm`) and status/bag circular dots (`rounded-full`) — never as a card language. Borders are hard black/white (or opacity variants). Section titles often sit on a **3px** full-bleed underline rule.

### Named Rules
**The Zero-Radius Rule.** If removing a radius does not hurt the control, keep it square.

## Components

### Buttons
- **Shape:** Square (0 radius)
- **Primary (page):** Filled ink on paper (or outline ink), Swiss bold uppercase, `tracking-widest`, padding ~`px-10 py-4`
- **Footer CTA (site-wide signal):** Full-width bar (~110px / md 150px); idle transparent with border; hover fills **Stage Red** with paper text and arrow nudge
- **SwissButton utility:** `bg-foreground` / `text-background`, `px-6 py-3`, uppercase tracked
- **Hover / Focus:** Color/bg shift; focus-visible outline Stage Red 2px / offset 3px

### Cards / Containers
Not a card system. Prefer bordered planes, full-bleed media figures, and rule-separated stacks. Internal padding follows section/gutter scales above.

### Inputs / Fields
- **Style:** Underline-only fields (`border-b` ink at ~30% opacity), transparent background, Montserrat type
- **Focus:** Border resolves to ink, then Stage Red
- **Labels:** Eyebrow Swiss Grey
- **Error:** Stage Red Error text/border

### Navigation
- Closed chrome: `mix-blend-difference` white type over content; uppercase tracked links; Contact/Menu at large Swiss sizes with underline wipe
- Open: inverted bookmark / curtain treatments; mobile white curtain with mega type
- Staff public header shares pad/logo footprint with site nav (CDF mark, not lab LML)

### Gallery (signature)
- Horizontal media strip; portrait aspect (~3/4); may open grayscale and resolve to color in view
- Captions: Swiss uppercase, wide tracking, over a dark gradient plate — editorial metadata, not stickers

### Out of scope for this system file
- Current production hero implementation (`hero.tsx`) — redesign may be editorial; do not copy its layout as tokens
- Home programs section / programs guide path — excluded from authority
- `/admin` local-only store catalog editor and `/admin/media` local-only media drop (not public surfaces)

## Do's and Don'ts

### Do:
- **Do** keep UI black/white and spend Stage Red on CTA, focus, and error.
- **Do** use Helvetica uppercase + tracked eyebrows for chrome; Montserrat for reading/forms.
- **Do** allow full-color photography as plates against the monochrome stage.
- **Do** use square geometry, hairline/3px rules, and flat planes.
- **Do** reserve extreme editorial type scale for important brand statements (including future hero work).
- **Do** honor `prefers-reduced-motion` alongside Lenis/GSAP motion.

### Don't:
- **Don't** invent pastel kids palettes, purple gradients, glassmorphism, or glow stacks.
- **Don't** default to rounded card grids or soft multi-shadow elevation.
- **Don't** flood screens with Stage Red or treat it as a background wash.
- **Don't** treat the current hero or home programs section as token authority.
- **Don't** rewrite locked brand language from PRODUCT.md for visual flair.
- **Don't** fabricate competition claims, pricing, or testimonials in UI chrome.
