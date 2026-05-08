# Design Document

## Portfolio Website — Muhammad Najam Ul Hassan

---

## Overview

This document describes the technical design for a single-page portfolio website built with pure HTML, CSS, and JavaScript. No frontend framework is used. GSAP (GreenSock Animation Platform) with its ScrollTrigger plugin drives all animations. The visual language is space-technology-inspired: a deep-space dark background, an animated star-field rendered on an HTML5 `<canvas>`, nebula-gradient accents, and a "Liquid Glass" frosted-glass treatment on UI surfaces via CSS `backdrop-filter: blur()`.

The page is a single `index.html` file that loads a stylesheet (`styles.css`) and a main script (`main.js`). Assets (SVG logo, project images/icons) live in an `assets/` directory. GSAP and ScrollTrigger are loaded from the official CDN.

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Single HTML file | No build step required; simplest deployment |
| Canvas star field (not CSS-only) | Enables interactive parallax and smooth 60 fps animation without layout impact |
| GSAP CDN (not bundled) | Zero build tooling; GSAP CDN is fast and widely cached |
| CSS custom properties for theming | Centralises colours, blur values, and spacing for easy maintenance |
| `ScrollTrigger.batch()` for cards | Recommended GSAP pattern for staggered viewport-entry animations on a collection |
| `prefers-reduced-motion` guard | Wraps all GSAP registrations; disables motion for accessibility |

---

## Architecture

The site is a static single-page application (SPA-like scroll experience) with no server-side logic.

```
portfolio-website/
├── index.html          # Single HTML document; all sections inline
├── styles.css          # All CSS: reset, custom properties, layout, effects
├── main.js             # All JS: star field, GSAP timelines, scroll triggers, nav logic
└── assets/
    ├── logo.svg        # Custom SVG logo
    ├── avatar.jpg      # Professional photo / placeholder
    └── projects/       # Optional project thumbnail images
        ├── mobile-monster.png
        ├── nest-egg.png
        ├── bountisphere.png
        ├── clicked.png
        ├── fronthouz.png
        └── sentre.png
```

### Module Responsibilities

```
main.js
├── StarField            — Canvas animation loop (stars + parallax)
├── NavController        — Scroll-spy, hamburger toggle, glass effect threshold
├── HeroAnimations       — Page-load entrance timeline (Navbar → headline → CTA)
├── SectionAnimations    — ScrollTrigger fade-in for About, Footer
├── CardAnimations       — ScrollTrigger.batch() stagger for project cards
└── ReducedMotionGuard   — matchMedia check; disables all GSAP if preference set
```

### Loading Order

```
<head>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- HTML sections -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="main.js"></script>
</body>
```

GSAP and ScrollTrigger are loaded before `main.js` so the plugin can be registered synchronously with `gsap.registerPlugin(ScrollTrigger)`.

---

## Components and Interfaces

### 1. `<canvas id="starfield">` — Star Field

- Positioned `fixed`, `z-index: 0`, full viewport, `pointer-events: none`
- Rendered by the `StarField` class in `main.js`
- Responds to `mousemove` on the Hero section for parallax offset (≤ 20 px)
- On devices without pointer support (`matchMedia('(pointer: coarse)')`), parallax is disabled

**StarField public interface:**
```js
class StarField {
  constructor(canvasEl, options)  // options: { count, speed, parallaxStrength }
  start()                         // begins requestAnimationFrame loop
  stop()                          // cancels loop
  setParallaxOffset(dx, dy)       // called by mousemove handler; clamped to ±20px
}
```

### 2. `<nav id="navbar">` — Navigation Bar

- `position: fixed; top: 0; width: 100%; z-index: 100`
- Logo (`<a>` wrapping `<img src="assets/logo.svg">`) on the left
- Nav links (`<ul>`) on the right
- Hamburger button (`<button aria-label="Toggle menu">`) hidden on desktop, visible on mobile
- Glass effect applied via `.navbar--scrolled` class toggled at scroll > 80 px

**NavController public interface:**
```js
class NavController {
  constructor(navEl)
  init()   // attaches scroll listener, hamburger click, smooth-scroll on links
}
```

**CSS glass class:**
```css
.navbar--scrolled {
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  background: rgba(10, 10, 20, 0.55);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.3s ease, backdrop-filter 0.3s ease;
}
```

### 3. `<section id="hero">` — Hero Section

- `height: 100vh; position: relative; overflow: hidden`
- Layering (bottom to top): canvas (fixed) → nebula gradient overlay → text content
- Headline: `<h1>Muhammad Najam Ul Hassan</h1>` + `<p class="hero__subtitle">Senior Software Engineer</p>`
- CTA: `<a href="#projects" class="btn btn--primary">View My Work</a>`
- Smooth scroll handled via `scroll-behavior: smooth` on `<html>` + JS fallback for Safari

### 4. `<section id="about">` — Who Am I

- Two-column layout on desktop (avatar left, text right); single column on mobile
- Content card wrapped in `.glass-card` (Liquid Glass surface)
- Skill badges: `<span class="badge">` elements inside a flex-wrap container
- Avatar: `<img>` with `width: 120px; height: 120px; border-radius: 50%`

### 5. `<section id="projects">` — Portfolio Projects

- CSS Grid: `grid-template-columns: repeat(3, 1fr)` on desktop, `repeat(2, 1fr)` on tablet, `1fr` on mobile
- Each `.project-card` is a `.glass-card` with: project name `<h3>`, description `<p>`, tech tags `<ul class="tags">`, optional "View Project" `<a target="_blank" rel="noopener noreferrer">`
- Hover lift effect driven by GSAP (not CSS `:hover`) for consistent easing

### 6. `<footer id="contact">` — Footer / Contact

- `.glass-card` background surface
- Email link, LinkedIn link, GitHub link, "Get In Touch" `<a href="mailto:...">` CTA button
- Copyright: `<p>© <span id="year"></span> Muhammad Najam Ul Hassan. All rights reserved.</p>`
- Year populated at runtime: `document.getElementById('year').textContent = new Date().getFullYear()`

### 7. `.glass-card` — Shared Liquid Glass Component

Applied as a CSS utility class to: About content card, each Project Card, Footer surface.

```css
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

---

## Data Models

The site has no backend or database. All data is static and embedded directly in the HTML or defined as a JavaScript constant for the project cards.

### Project Data Model

Each project is represented as a plain JS object. The array is iterated at page load to render project cards (or cards are pre-rendered in HTML — both approaches are valid; the design uses pre-rendered HTML for SEO and no-JS fallback).

```js
/**
 * @typedef {Object} Project
 * @property {string} id          - kebab-case identifier
 * @property {string} name        - Display name
 * @property {string} description - ≤60 word description
 * @property {string[]} tags      - Technology stack labels
 * @property {string|null} url    - External project URL or null
 * @property {string|null} image  - Path to thumbnail image or null
 */

const PROJECTS = [
  {
    id: "mobile-monster",
    name: "Mobile Monster Australia",
    description: "...",
    tags: ["React Native", "Node.js", "AWS"],
    url: "https://mobilemonster.com.au",
    image: "assets/projects/mobile-monster.png"
  },
  {
    id: "nest-egg",
    name: "My First Nest Egg",
    description: "...",
    tags: ["React", "Firebase", "Stripe"],
    url: null,
    image: "assets/projects/nest-egg.png"
  },
  {
    id: "bountisphere",
    name: "Bountisphere AI",
    description: "...",
    tags: ["Python", "OpenAI", "FastAPI"],
    url: null,
    image: "assets/projects/bountisphere.png"
  },
  {
    id: "clicked",
    name: "Clicked",
    description: "...",
    tags: ["Vue.js", "Node.js", "PostgreSQL"],
    url: null,
    image: "assets/projects/clicked.png"
  },
  {
    id: "fronthouz",
    name: "Fronthouz",
    description: "...",
    tags: ["Next.js", "Tailwind CSS", "Supabase"],
    url: null,
    image: "assets/projects/fronthouz.png"
  },
  {
    id: "sentre",
    name: "Sentre",
    description: "...",
    tags: ["React", "GraphQL", "AWS Lambda"],
    url: null,
    image: "assets/projects/sentre.png"
  }
];
```

### CSS Custom Properties (Design Tokens)

```css
:root {
  /* Colours */
  --color-bg:           #050510;
  --color-surface:      rgba(255, 255, 255, 0.06);
  --color-border:       rgba(255, 255, 255, 0.12);
  --color-text-primary: #e8eaf6;
  --color-text-muted:   #8892b0;
  --color-accent:       #7c83fd;
  --color-accent-glow:  rgba(124, 131, 253, 0.35);

  /* Glass */
  --glass-blur:         16px;
  --glass-bg:           rgba(255, 255, 255, 0.06);
  --glass-border:       rgba(255, 255, 255, 0.12);

  /* Spacing */
  --section-padding:    clamp(4rem, 8vw, 8rem);

  /* Typography */
  --font-sans:          'Inter', system-ui, sans-serif;
  --font-mono:          'JetBrains Mono', monospace;
  --hero-font-size:     clamp(2.2rem, 6vw, 5rem);

  /* Animation */
  --ease-out:           power2.out;   /* GSAP easing reference */
  --duration-fast:      0.3s;
  --duration-medium:    0.6s;
  --duration-slow:      0.8s;
}
```

### Animation State Model

GSAP manages animation state internally. The following describes the logical states each animated element passes through:

```
Element states:
  PRE_ANIMATE  →  ANIMATING  →  VISIBLE
  (opacity:0,      (tween)      (opacity:1,
   y: +30px)                     y: 0)

ScrollTrigger trigger points:
  Navbar:         page load (no scroll trigger)
  Hero headline:  page load (timeline, 0.2s delay)
  Hero CTA:       page load (timeline, 0.8s delay)
  About card:     "top 80%"  → fade-in 0.8s
  Project cards:  batch, "top 85%" → stagger 0.1s per card
  Footer:         "top 90%"  → fade-up 0.6s
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Hero section occupies full viewport height

*For any* viewport height, the Hero section's rendered height SHALL equal `window.innerHeight` (100vh) on initial page load.

**Validates: Requirements 1.1**

---

### Property 2: Headline entrance animation completes within time budget

*For any* page load, the GSAP entrance timeline for the headline and subtitle SHALL complete within 1.2 seconds of the `DOMContentLoaded` event.

**Validates: Requirements 1.3**

---

### Property 3: Parallax offset is bounded

*For any* mouse position within the Hero section, the parallax offset applied to the star-field background layer SHALL be clamped to the range [−20 px, +20 px] in both the X and Y axes.

**Validates: Requirements 1.6**

---

### Property 4: Navbar glass effect threshold

*For any* scroll position greater than 80 px from the top, the Navbar SHALL have the `.navbar--scrolled` class applied, and for any scroll position ≤ 80 px, the class SHALL be absent.

**Validates: Requirements 2.4**

---

### Property 5: All six projects are rendered

*For any* rendering of the Portfolio section, exactly six Project Cards SHALL be present in the DOM, one for each project in the `PROJECTS` data array.

**Validates: Requirements 5.1**

---

### Property 6: Project card stagger delay is monotonically increasing

*For any* batch of project cards entering the viewport, the GSAP start time of card `n` SHALL be greater than or equal to the start time of card `n−1` by at least 100 ms.

**Validates: Requirements 5.4**

---

### Property 7: Responsive grid column count matches breakpoint

*For any* viewport width, the project grid SHALL render three columns when width > 1024 px, two columns when 769 px ≤ width ≤ 1024 px, and one column when width ≤ 768 px.

**Validates: Requirements 5.5, 7.3**

---

### Property 8: Copyright year is always current

*For any* page load, the copyright year displayed in the Footer SHALL equal `new Date().getFullYear()`.

**Validates: Requirements 6.3**

---

### Property 9: Reduced-motion guard disables all GSAP animations

*For any* user agent with `prefers-reduced-motion: reduce` set, no GSAP tween or ScrollTrigger SHALL be registered, and all animated elements SHALL be in their final visible state from the start.

**Validates: Requirements 8.5, 9.1**

---

### Property 10: Glass blur radius is within specification

*For any* `.glass-card` or `.navbar--scrolled` element, the computed `backdrop-filter` blur radius SHALL be between 10 px and 20 px inclusive.

**Validates: Requirements 2.4, 4.4, 5.6, 6.5, 9.4**

---

## Error Handling

### Missing Project URL

If a project's `url` is `null` or `undefined`, the "View Project" link SHALL be omitted from the card entirely. No broken `href="#"` links are rendered.

```js
// In card rendering logic
if (project.url) {
  card.insertAdjacentHTML('beforeend',
    `<a href="${project.url}" target="_blank" rel="noopener noreferrer" class="btn btn--ghost">
       View Project
     </a>`
  );
}
```

### Missing Project Image

If a project thumbnail image fails to load (`onerror`), the card SHALL display a CSS gradient placeholder instead. The `alt` attribute is always set.

```js
img.onerror = () => {
  img.style.display = 'none';
  img.parentElement.classList.add('card__image--fallback');
};
```

### Canvas Not Supported

If `<canvas>` is not supported (extremely rare), the star field is silently skipped. The nebula gradient CSS background on the `<body>` provides a static fallback.

```js
const canvas = document.getElementById('starfield');
if (!canvas.getContext) return; // graceful no-op
```

### `backdrop-filter` Not Supported

The glass effect degrades gracefully: the `background` colour on `.glass-card` is set to `rgba(10, 10, 20, 0.85)` as a fallback, providing sufficient contrast without blur.

```css
/* Fallback for browsers without backdrop-filter */
.glass-card {
  background: rgba(10, 10, 20, 0.85);
}
/* Progressive enhancement */
@supports (backdrop-filter: blur(1px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
  }
}
```

### Smooth Scroll Fallback

`scroll-behavior: smooth` is set on `<html>`. For browsers that do not support it, a JS polyfill using `window.scrollTo({ behavior: 'smooth' })` is used, with a final fallback to `element.scrollIntoView()`.

### GSAP Load Failure

If the GSAP CDN script fails to load, `main.js` checks for `window.gsap` before calling any GSAP APIs. All elements are set to their final visible state via CSS (`opacity: 1; transform: none`) so the page remains fully usable without animations.

```js
if (typeof gsap === 'undefined') {
  document.querySelectorAll('[data-animate]').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  return;
}
```

---

## Testing Strategy

### Overview

This feature is a static website with visual, interactive, and animation behaviour. The primary testing approaches are:

1. **Unit tests** — Pure logic functions (parallax clamp, year calculation, URL guard)
2. **Property-based tests** — Universal properties about layout, animation state, and data rendering
3. **Visual / snapshot tests** — Screenshot comparisons at each breakpoint
4. **Accessibility audit** — Automated WCAG checks via axe-core
5. **Performance audit** — Lighthouse CI for score thresholds

### Property-Based Testing

**Library**: [fast-check](https://github.com/dubzzz/fast-check) (JavaScript, zero dependencies, runs in Node.js)

**Configuration**: Minimum 100 runs per property (`numRuns: 100` in `fc.assert`)

Each property test is tagged with a comment referencing the design property:

```js
// Feature: portfolio-website, Property 3: parallax offset is bounded
fc.assert(
  fc.property(
    fc.float({ min: -10000, max: 10000 }),
    fc.float({ min: -10000, max: 10000 }),
    (rawDx, rawDy) => {
      const { dx, dy } = clampParallax(rawDx, rawDy, 20);
      return dx >= -20 && dx <= 20 && dy >= -20 && dy <= 20;
    }
  ),
  { numRuns: 100 }
);
```

**Properties to implement as PBT tests:**

| Property | Test description |
|---|---|
| P3: Parallax bounded | `clampParallax(dx, dy, 20)` always returns values in [−20, 20] |
| P5: All six projects rendered | For any valid `PROJECTS` array of length 6, `renderCards(projects)` produces exactly 6 `.project-card` elements |
| P6: Stagger delay monotonic | For any batch of N cards, computed start times are non-decreasing with ≥100 ms gap |
| P7: Grid columns match breakpoint | For any width value, `getColumnCount(width)` returns 3, 2, or 1 per spec |
| P8: Copyright year current | For any `Date` object, `getCopyrightYear(date)` returns `date.getFullYear()` |
| P10: Glass blur in range | For any `.glass-card` element, parsed blur radius is in [10, 20] |

### Unit Tests

**Framework**: [Vitest](https://vitest.dev/) (runs in Node.js, no browser required for pure logic)

Key unit test scenarios:

- `NavController.handleScroll(scrollY)`: adds/removes `.navbar--scrolled` at exactly 80 px threshold
- `StarField.setParallaxOffset(dx, dy)`: clamps correctly at boundary values (±20 px)
- Project card rendering: cards without `url` omit the "View Project" link
- Project card rendering: cards with `url` include `target="_blank"` and `rel="noopener noreferrer"`
- `getCopyrightYear()`: returns current year as a 4-digit string
- Reduced-motion guard: when `matchMedia` returns `reduce`, GSAP is not called

### Visual / Snapshot Tests

**Tool**: Playwright with screenshot comparison

- Capture screenshots at 320 px, 768 px, 1024 px, and 1440 px viewport widths
- Verify no horizontal scrollbar at any breakpoint (Property 7.1)
- Verify project grid column count visually at each breakpoint

### Accessibility Tests

**Tool**: axe-core (automated) + manual keyboard walkthrough

- All images have non-empty `alt` attributes
- All interactive elements are reachable via Tab key
- Focus indicators are visible (outline ≥ 2 px)
- Color contrast ≥ 4.5:1 for body text (verified with axe-core)
- Hamburger button has `aria-label` and `aria-expanded` attributes

### Performance Tests

**Tool**: Lighthouse CI

- Desktop score ≥ 90 (Requirement 8.1)
- Mobile score ≥ 80 (Requirement 7.5)
- Above-the-fold load ≤ 3 s on simulated 4G (Requirement 8.6)
- GSAP loaded from CDN (cached); canvas star field uses `requestAnimationFrame` with `will-change: transform` hint

### Animation Testing Notes

GSAP animations are tested indirectly:

- The `ReducedMotionGuard` is unit-tested to confirm it prevents GSAP registration
- Entrance timeline duration is verified by checking `gsap.globalTimeline.duration()` after setup
- ScrollTrigger state is not unit-tested (GSAP's own test suite covers the plugin); integration is verified via Playwright end-to-end tests that scroll the page and assert element visibility

### Test File Structure

```
tests/
├── unit/
│   ├── starfield.test.js       # clampParallax, StarField logic
│   ├── nav.test.js             # NavController scroll threshold
│   ├── cards.test.js           # Project card rendering, URL guard
│   ├── footer.test.js          # Copyright year
│   └── reducedMotion.test.js   # Motion guard
├── property/
│   ├── parallax.property.js    # P3
│   ├── projects.property.js    # P5, P6
│   ├── layout.property.js      # P7
│   ├── footer.property.js      # P8
│   └── glass.property.js       # P10
├── e2e/
│   ├── navigation.spec.js      # Smooth scroll, hamburger menu
│   ├── animations.spec.js      # Scroll-triggered visibility
│   └── responsive.spec.js      # Breakpoint screenshots
└── a11y/
    └── accessibility.spec.js   # axe-core audit
```
