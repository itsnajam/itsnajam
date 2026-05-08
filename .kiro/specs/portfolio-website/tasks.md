# Implementation Plan: Portfolio Website — Muhammad Najam Ul Hassan

## Overview

Build a single-page portfolio website using plain HTML, CSS, and JavaScript. GSAP (loaded from CDN) drives all animations. The visual language is space-technology-inspired with a canvas star field, nebula gradient accents, and a "Liquid Glass" frosted-glass treatment on UI surfaces. The project is structured as three files (`index.html`, `styles.css`, `main.js`) plus an `assets/` directory, with a `tests/` directory for Vitest unit and fast-check property tests.

## Tasks

- [x] 1. Project scaffolding — file structure, HTML skeleton, CSS foundation
  - Create the directory structure: `assets/`, `assets/projects/`, `tests/unit/`, `tests/property/`
  - Create `index.html` with `<!DOCTYPE html>`, `<html lang="en">`, `<head>` (charset, viewport, title, stylesheet link), and empty `<body>` with GSAP CDN script tags followed by `<script src="main.js">`
  - Create `styles.css` with a CSS reset (`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }`) and all CSS custom properties (design tokens: colours, glass values, spacing, typography, animation durations) as defined in the design document
  - Add `body` base styles: `background: var(--color-bg)`, `color: var(--color-text-primary)`, `font-family: var(--font-sans)`, `scroll-behavior: smooth` on `<html>`
  - Create `main.js` with a top-level GSAP CDN failure guard: check `typeof gsap === 'undefined'`, set all `[data-animate]` elements to `opacity:1; transform:none`, and early-return if GSAP is absent
  - Create `package.json` with `vitest` and `fast-check` as dev dependencies, and a `"test"` script running `vitest --run`
  - _Requirements: 8.1, 8.6, 9.1_

- [x] 2. Custom SVG logo
  - Create `assets/logo.svg`: a modern, tech-forward SVG mark (e.g., stylised "N" or monogram) that reads clearly on both dark and light backgrounds; include a `title` element for accessibility
  - Ensure the SVG has `viewBox` set so it scales correctly between 32 px and 48 px height
  - _Requirements: 3.1, 3.2, 3.4, 8.2_

- [x] 3. Navigation bar — HTML, CSS, and NavController
  - Add `<nav id="navbar">` to `index.html` with: logo `<a href="#hero">` wrapping `<img src="assets/logo.svg" alt="Muhammad Najam Ul Hassan logo">`, a `<ul>` of four nav links (Home, About, Projects, Contact), and a `<button class="hamburger" aria-label="Toggle menu" aria-expanded="false">` hamburger icon (three `<span>` bars)
  - Style the navbar in `styles.css`: `position: fixed; top: 0; width: 100%; z-index: 100`, flex layout, logo height clamped to 32–48 px, nav links styled with visible focus indicators (`outline: 2px solid var(--color-accent)`)
  - Add `.navbar--scrolled` CSS class with `backdrop-filter: blur(14px)`, `background: rgba(10,10,20,0.55)`, `border-bottom`, and transition as specified in the design
  - Add hamburger CSS: hide `<ul>` on mobile (≤ 768 px), show hamburger button; `.nav--open` class expands a full-width dropdown panel
  - Implement `NavController` class in `main.js`:
    - `constructor(navEl)` stores reference
    - `init()` attaches `scroll` listener toggling `.navbar--scrolled` at `scrollY > 80`
    - `init()` attaches hamburger `click` listener toggling `.nav--open` and updating `aria-expanded`
    - `init()` attaches `click` listeners on all nav links for smooth scroll to target section; falls back to `element.scrollIntoView()` if `scrollTo` is unavailable
  - Logo click scrolls smoothly to `#hero`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.2, 3.3, 3.4, 8.3_

  - [x] 3.1 Write unit tests for NavController
    - Test `handleScroll(80)` adds `.navbar--scrolled`; `handleScroll(79)` removes it; `handleScroll(0)` removes it
    - Test hamburger toggle sets `aria-expanded="true"` on open and `"false"` on close
    - _Requirements: 2.4, 2.5, 2.6_

- [x] 4. Canvas star field — StarField class
  - Add `<canvas id="starfield">` as the first child of `<body>` in `index.html`; style it `position: fixed; inset: 0; z-index: 0; pointer-events: none` in `styles.css`
  - Implement `StarField` class in `main.js`:
    - `constructor(canvasEl, options)` initialises star array (`count`, `speed`, `parallaxStrength`); each star has `x`, `y`, `radius`, `opacity`, `vx`, `vy`
    - `start()` begins `requestAnimationFrame` loop; each frame clears canvas, applies parallax offset, draws stars
    - `stop()` cancels the animation frame
    - `setParallaxOffset(dx, dy)` clamps both values to `[−20, 20]` using a pure `clampParallax(value, max)` helper exported from `main.js`
  - Add canvas-not-supported guard: `if (!canvas.getContext) return;`
  - Attach `mousemove` listener on `#hero` calling `starField.setParallaxOffset()`; skip on `matchMedia('(pointer: coarse)')` devices
  - _Requirements: 1.5, 1.6, 1.7_

  - [x] 4.1 Write unit tests for StarField
    - Test `setParallaxOffset(25, -30)` clamps to `(20, -20)`
    - Test `setParallaxOffset(0, 0)` returns `(0, 0)`
    - Test `setParallaxOffset(-20, 20)` returns `(-20, 20)` (boundary values unchanged)
    - _Requirements: 1.6_

  - [x] 4.2 Write property test for parallax offset clamping (P3)
    - **Property 3: Parallax offset is bounded**
    - For any float `rawDx` and `rawDy`, `clampParallax(rawDx, 20)` and `clampParallax(rawDy, 20)` SHALL each return a value in `[−20, 20]`
    - Use `fc.float({ min: -10000, max: 10000 })` for both axes; `numRuns: 100`
    - **Validates: Requirements 1.6**

- [x] 5. Hero section — layout, content, GSAP entrance animations, parallax
  - Add `<section id="hero">` to `index.html` with layering: nebula gradient `<div class="hero__bg">`, `<div class="hero__content">` containing `<h1>Muhammad Najam Ul Hassan</h1>`, `<p class="hero__subtitle">Senior Software Engineer</p>`, and `<a href="#projects" class="btn btn--primary" data-animate>View My Work</a>`
  - Add `data-animate` attributes to headline, subtitle, and CTA for the GSAP CDN failure fallback
  - Style `#hero` in `styles.css`: `height: 100vh; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center`; hero font size uses `var(--hero-font-size)` (`clamp(2.2rem, 6vw, 5rem)`)
  - Style `.btn--primary` with accent colour, padding, border-radius, and a visible `:focus-visible` outline
  - Implement `HeroAnimations` in `main.js`: build a GSAP timeline that animates navbar (fade-in), then `<h1>` (fade + slide from `y:30`), then `.hero__subtitle`, then CTA button — all completing within 2 seconds; use `power2.out` easing throughout
  - Implement `mousemove` parallax handler on `#hero` calling `starField.setParallaxOffset()`; skip when `matchMedia('(pointer: coarse)')` matches
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 9.2, 9.3_

- [x] 6. Who Am I / About section — layout, glass card, skill badges, scroll animation
  - Add `<section id="about">` to `index.html` with a `.glass-card` wrapper containing: `<img src="assets/avatar.jpg" alt="Muhammad Najam Ul Hassan" class="about__avatar">`, `<h2>`, biography `<p>`, and a `<div class="badges">` with at least three `<span class="badge">` elements ("Workflow Automation", "Scalable Systems", "No-Code / Low-Code")
  - Add `data-animate` to the `.glass-card` element
  - Style `#about` in `styles.css`: two-column grid on desktop (avatar left, text right), single column on mobile; avatar `width: 120px; height: 120px; border-radius: 50%`; badges as flex-wrap with accent-coloured pill styling
  - Add `.glass-card` utility class CSS as specified in the design (with `@supports` progressive enhancement for `backdrop-filter`)
  - Implement `SectionAnimations` in `main.js`: register a `ScrollTrigger` on `#about .glass-card` with `start: "top 80%"`, fade-in from `opacity:0, y:30` over 0.8 s using `power2.out`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.4, 9.5_

  - [x] 6.1 Write unit tests for About section rendering
    - Test that the DOM contains exactly three or more `.badge` elements
    - Test that the avatar `<img>` has a non-empty `alt` attribute
    - _Requirements: 4.2, 8.2_

- [x] 7. Portfolio Projects section — six project cards, responsive grid, hover animations, stagger entrance
  - Add `<section id="projects">` to `index.html` with a `<div class="projects__grid">` containing six `.project-card.glass-card` elements; each card has: `<h3>` project name, `<p>` description (≤ 60 words), `<ul class="tags">` with tech stack `<li>` items, optional `<a class="btn btn--ghost" target="_blank" rel="noopener noreferrer">View Project</a>` (only when `url` is non-null), and an `<img>` with `alt` text and `onerror` fallback
  - Pre-render all six projects (Mobile Monster Australia, My First Nest Egg, Bountisphere AI, Clicked, Fronthouz, Sentre) with their tags as defined in the design's `PROJECTS` data model
  - For cards with `url: null`, omit the "View Project" link entirely (no `href="#"`)
  - Add `onerror` handler on each card image: hide the `<img>` and add `.card__image--fallback` class to parent for CSS gradient placeholder
  - Style `#projects` in `styles.css`: CSS Grid `repeat(3, 1fr)` on desktop, `repeat(2, 1fr)` on tablet (769–1024 px), `1fr` on mobile (≤ 768 px); card padding, gap, and `.btn--ghost` styles
  - Implement `CardAnimations` in `main.js`: set all `.project-card` elements to `opacity:0, y:30` initially; use `ScrollTrigger.batch('.project-card', { onEnter: batch => gsap.to(batch, { opacity:1, y:0, stagger:0.1, duration:0.6, ease:'power2.out' }), start:'top 85%' })`
  - Implement GSAP hover lift: on `mouseenter` tween `translateY: -8px` and increase `box-shadow`; on `mouseleave` tween back; duration 0.3 s, `power2.out`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 8.2, 8.3_

  - [x] 7.1 Write unit tests for project card rendering
    - Test that a card with `url: null` does NOT contain a "View Project" `<a>` element
    - Test that a card with a valid `url` contains `<a target="_blank" rel="noopener noreferrer">`
    - Test that every card `<img>` has a non-empty `alt` attribute
    - _Requirements: 5.2, 5.7, 8.2_

  - [x] 7.2 Write property test for all six projects rendered (P5)
    - **Property 5: All six projects are rendered**
    - For any valid `PROJECTS` array of length 6, `renderCards(projects)` produces exactly 6 `.project-card` elements in the DOM
    - Use `fc.array(fc.record({ id: fc.string(), name: fc.string(), description: fc.string(), tags: fc.array(fc.string()), url: fc.option(fc.webUrl()), image: fc.option(fc.string()) }), { minLength: 6, maxLength: 6 })` as the arbitrary; `numRuns: 100`
    - **Validates: Requirements 5.1**

  - [x] 7.3 Write property test for stagger delay monotonically increasing (P6)
    - **Property 6: Project card stagger delay is monotonically increasing**
    - For any batch of N cards (1 ≤ N ≤ 6), the computed GSAP start time of card `n` SHALL be ≥ start time of card `n−1` plus 100 ms
    - Use `fc.integer({ min: 1, max: 6 })` for batch size; derive start times as `index * 0.1`; assert each gap ≥ 0.1 s; `numRuns: 100`
    - **Validates: Requirements 5.4**

- [x] 8. Footer / Contact section — email, social links, CTA, copyright year, scroll animation
  - Add `<footer id="contact">` to `index.html` with a `.glass-card` wrapper containing: email `<a href="mailto:...">`, LinkedIn `<a href="..." target="_blank" rel="noopener noreferrer">`, GitHub `<a href="..." target="_blank" rel="noopener noreferrer">`, `<a href="mailto:..." class="btn btn--primary">Get In Touch</a>` CTA, and `<p>© <span id="year"></span> Muhammad Najam Ul Hassan. All rights reserved.</p>`
  - Add `data-animate` to the footer `.glass-card`
  - Populate `#year` at runtime in `main.js`: `document.getElementById('year').textContent = new Date().getFullYear()`
  - Style `<footer>` in `styles.css`: `.glass-card` background, flex layout for links, social icon sizing, CTA button styles, and visible focus indicators on all links
  - Implement `SectionAnimations` ScrollTrigger for `#contact .glass-card`: `start: "top 90%"`, fade-up from `opacity:0, y:20` over 0.6 s, `power2.out`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 8.3_

  - [x] 8.1 Write unit tests for footer
    - Test `getCopyrightYear(new Date())` returns the current 4-digit year as a number
    - Test that the "Get In Touch" `<a>` has `href` starting with `mailto:`
    - Test that social links have `target="_blank"` and `rel="noopener noreferrer"`
    - _Requirements: 6.2, 6.3, 6.6_

  - [x] 8.2 Write property test for copyright year (P8)
    - **Property 8: Copyright year is always current**
    - For any `Date` object, `getCopyrightYear(date)` SHALL return `date.getFullYear()`
    - Use `fc.date()` as the arbitrary; `numRuns: 100`
    - **Validates: Requirements 6.3**

- [x] 9. Checkpoint — wire all sections together and verify page structure
  - Ensure all six sections (`#navbar`, `#hero`, `#about`, `#projects`, `#contact`) are present and in correct DOM order in `index.html`
  - Verify GSAP CDN scripts load before `main.js` in `<body>`
  - Verify `gsap.registerPlugin(ScrollTrigger)` is called at the top of `main.js` (after the CDN failure guard)
  - Verify `NavController`, `StarField`, `HeroAnimations`, `SectionAnimations`, `CardAnimations` are all instantiated and `init()`/`start()` called in `main.js`
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Responsive design — all breakpoints
  - Add media queries in `styles.css` for mobile (≤ 768 px): single-column project grid, single-column about layout, hamburger nav visible, hero headline uses `clamp` to stay within viewport width, minimum body font size 14 px
  - Add media queries for tablet (769–1024 px): two-column project grid, two-column about layout, full nav links visible
  - Verify no horizontal scrollbar at 320 px, 768 px, and 1440 px by setting `overflow-x: hidden` on `<html>` and `<body>` and testing with browser DevTools
  - Ensure all touch targets (buttons, links) are at least 44 × 44 px on mobile
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 10.1 Write property test for responsive grid column count (P7)
    - **Property 7: Responsive grid column count matches breakpoint**
    - For any viewport width, `getColumnCount(width)` SHALL return 3 when `width > 1024`, 2 when `769 ≤ width ≤ 1024`, and 1 when `width ≤ 768`
    - Use `fc.integer({ min: 1, max: 3000 })` as the arbitrary; assert the return value matches the spec; `numRuns: 100`
    - **Validates: Requirements 5.5, 7.3**

- [x] 11. Accessibility — alt text, keyboard nav, focus indicators, WCAG contrast, reduced-motion guard
  - Audit every `<img>` and inline SVG in `index.html` to confirm non-empty `alt` or `aria-label` attributes
  - Verify all interactive elements (`<a>`, `<button>`) have visible `:focus-visible` outlines (≥ 2 px solid `var(--color-accent)`) in `styles.css`
  - Verify hamburger `<button>` has `aria-label="Toggle menu"` and `aria-expanded` toggled correctly by `NavController`
  - Verify color contrast: `--color-text-primary` (`#e8eaf6`) on `--color-bg` (`#050510`) must meet WCAG 2.1 AA (≥ 4.5:1); confirm in `styles.css` comments
  - Implement `ReducedMotionGuard` in `main.js`: `const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches`; if true, skip all `gsap.to/from/timeline` calls and set all `[data-animate]` elements to `opacity:1; transform:none` immediately
  - _Requirements: 8.2, 8.3, 8.4, 8.5, 9.1_

  - [x] 11.1 Write unit tests for reduced-motion guard
    - Test that when `matchMedia` mock returns `{ matches: true }`, no GSAP methods are called and all `[data-animate]` elements have `opacity:1`
    - Test that when `matchMedia` mock returns `{ matches: false }`, GSAP setup proceeds normally
    - _Requirements: 8.5, 9.1_

- [x] 12. Error handling — missing URL/image fallbacks, no-canvas, no-backdrop-filter, GSAP CDN failure
  - Verify the GSAP CDN failure guard in `main.js` (task 1) sets all `[data-animate]` elements visible and returns early
  - Verify the canvas-not-supported guard in `main.js` (task 4) silently skips `StarField` initialisation
  - Verify the `@supports (backdrop-filter: blur(1px))` progressive enhancement block in `styles.css` (task 6) provides the opaque fallback background for `.glass-card`
  - Verify each project card `<img>` has an `onerror` handler (task 7) that hides the image and adds `.card__image--fallback`
  - Add `.card__image--fallback` CSS rule: a nebula-gradient placeholder background on the image container
  - Verify cards with `url: null` have no "View Project" link in the rendered HTML
  - Add smooth-scroll JS fallback in `NavController.init()`: try `window.scrollTo({ behavior: 'smooth' })`, catch and fall back to `element.scrollIntoView()`
  - _Requirements: 5.7, 8.1, 8.3, 8.5, 9.1_

- [x] 13. Property-based tests — glass blur radius (P10)
  - Export a pure `parseBlurRadius(backdropFilterValue)` helper from `main.js` (or a shared `utils.js`) that parses a `backdrop-filter` CSS string like `"blur(16px)"` and returns the numeric pixel value
  - Write property test in `tests/property/glass.property.js`:
    - **Property 10: Glass blur radius is within specification**
    - For any blur radius `r` in `[10, 20]`, `parseBlurRadius('blur(' + r + 'px)')` SHALL return a value in `[10, 20]`
    - Use `fc.integer({ min: 10, max: 20 })` as the arbitrary; `numRuns: 100`
    - **Validates: Requirements 2.4, 4.4, 5.6, 6.5, 9.4**

- [x] 14. Final checkpoint — run full test suite and verify all requirements
  - Run `npm test` (Vitest `--run`) and confirm all unit and property tests pass
  - Manually verify in a browser: hero occupies full viewport, navbar glass effect triggers at 80 px scroll, hamburger menu works on mobile viewport, all six project cards render, copyright year is correct, "Get In Touch" opens mail client, "View My Work" scrolls to projects
  - Verify GSAP entrance animations play on load and scroll-triggered animations fire correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 9 and 14) ensure incremental validation
- Property tests (P3, P5, P6, P7, P8, P10) validate universal correctness properties using fast-check
- Unit tests validate specific examples, boundary values, and error conditions using Vitest
- The `ReducedMotionGuard` must be checked before any GSAP call throughout `main.js`
- All `<a>` elements opening external URLs must have `target="_blank" rel="noopener noreferrer"`
- The `clampParallax`, `getColumnCount`, `getCopyrightYear`, and `parseBlurRadius` helpers should be pure functions exported from their respective modules to enable isolated unit and property testing
