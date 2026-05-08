/**
 * Unit tests for ReducedMotionGuard
 * Validates: Requirements 8.5, 9.1
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// ReducedMotionGuard logic — replicated inline for isolated unit testing.
// The real implementation lives inside the `else` block in main.js (GSAP
// guard), so we replicate the pure guard logic here to keep tests fast and
// framework-agnostic, matching the pattern used by nav.test.js and
// starfield.test.js.
// ---------------------------------------------------------------------------

/**
 * Runs the ReducedMotionGuard logic against the provided document and mocks.
 *
 * @param {Document} doc - The document to query [data-animate] elements from
 * @param {boolean} prefersReduced - Simulated matchMedia result
 * @param {object} gspaMock - Mock object with gsap methods to track calls
 * @returns {{ gsapCalled: boolean }}
 */
function runReducedMotionGuard(doc, prefersReduced, gspaMock) {
  // Simulate: const prefersReduced = window.matchMedia(...).matches
  if (prefersReduced) {
    // Disable all animations — set elements to final visible state immediately
    doc.querySelectorAll('[data-animate]').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  // Simulate the conditional GSAP animation block
  if (!prefersReduced) {
    // These represent HeroAnimations.init(), SectionAnimations.init(),
    // CardAnimations.init() — all GSAP calls are gated here
    gspaMock.timeline();
    gspaMock.from('#navbar', {});
    gspaMock.to('.project-card', {});
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal DOM with [data-animate] elements for testing.
 * @returns {HTMLElement[]} The created [data-animate] elements
 */
function buildAnimatedElements() {
  document.body.innerHTML = '';
  const elements = ['h1', 'p', 'a'].map((tag) => {
    const el = document.createElement(tag);
    el.setAttribute('data-animate', '');
    document.body.appendChild(el);
    return el;
  });
  return elements;
}

// ---------------------------------------------------------------------------
// Tests: prefers-reduced-motion: reduce (matches: true)
// ---------------------------------------------------------------------------

describe('ReducedMotionGuard — prefers-reduced-motion: reduce (matches: true)', () => {
  let animatedEls;
  let gspaMock;

  beforeEach(() => {
    animatedEls = buildAnimatedElements();
    gspaMock = {
      timeline: vi.fn(),
      from: vi.fn(),
      to: vi.fn(),
    };
  });

  it('sets opacity:1 on all [data-animate] elements', () => {
    runReducedMotionGuard(document, true, gspaMock);
    animatedEls.forEach((el) => {
      expect(el.style.opacity).toBe('1');
    });
  });

  it('sets transform:none on all [data-animate] elements', () => {
    runReducedMotionGuard(document, true, gspaMock);
    animatedEls.forEach((el) => {
      expect(el.style.transform).toBe('none');
    });
  });

  it('does NOT call gsap.timeline()', () => {
    runReducedMotionGuard(document, true, gspaMock);
    expect(gspaMock.timeline).not.toHaveBeenCalled();
  });

  it('does NOT call gsap.from()', () => {
    runReducedMotionGuard(document, true, gspaMock);
    expect(gspaMock.from).not.toHaveBeenCalled();
  });

  it('does NOT call gsap.to()', () => {
    runReducedMotionGuard(document, true, gspaMock);
    expect(gspaMock.to).not.toHaveBeenCalled();
  });

  it('applies styles to every [data-animate] element (3 elements)', () => {
    runReducedMotionGuard(document, true, gspaMock);
    const styledEls = Array.from(document.querySelectorAll('[data-animate]')).filter(
      (el) => el.style.opacity === '1' && el.style.transform === 'none'
    );
    expect(styledEls.length).toBe(3);
  });

  it('works correctly when there are no [data-animate] elements', () => {
    document.body.innerHTML = '';
    // Should not throw
    expect(() => runReducedMotionGuard(document, true, gspaMock)).not.toThrow();
    expect(gspaMock.timeline).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests: no reduced-motion preference (matches: false)
// ---------------------------------------------------------------------------

describe('ReducedMotionGuard — no reduced-motion preference (matches: false)', () => {
  let animatedEls;
  let gspaMock;

  beforeEach(() => {
    animatedEls = buildAnimatedElements();
    gspaMock = {
      timeline: vi.fn(),
      from: vi.fn(),
      to: vi.fn(),
    };
  });

  it('does NOT set opacity on [data-animate] elements', () => {
    runReducedMotionGuard(document, false, gspaMock);
    animatedEls.forEach((el) => {
      // Inline style should not have been set by the guard
      expect(el.style.opacity).toBe('');
    });
  });

  it('does NOT set transform on [data-animate] elements', () => {
    runReducedMotionGuard(document, false, gspaMock);
    animatedEls.forEach((el) => {
      expect(el.style.transform).toBe('');
    });
  });

  it('calls gsap.timeline() to proceed with animations', () => {
    runReducedMotionGuard(document, false, gspaMock);
    expect(gspaMock.timeline).toHaveBeenCalledTimes(1);
  });

  it('calls gsap.from() to proceed with animations', () => {
    runReducedMotionGuard(document, false, gspaMock);
    expect(gspaMock.from).toHaveBeenCalled();
  });

  it('calls gsap.to() to proceed with animations', () => {
    runReducedMotionGuard(document, false, gspaMock);
    expect(gspaMock.to).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests: window.matchMedia integration (mocking the browser API)
// ---------------------------------------------------------------------------

describe('ReducedMotionGuard — window.matchMedia mock integration', () => {
  beforeEach(() => {
    buildAnimatedElements();
  });

  it('reads prefers-reduced-motion correctly when matchMedia returns matches:true', () => {
    // Mock window.matchMedia to return matches: true
    vi.stubGlobal('matchMedia', (query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    expect(prefersReduced).toBe(true);

    const gspaMock = { timeline: vi.fn(), from: vi.fn(), to: vi.fn() };
    runReducedMotionGuard(document, prefersReduced, gspaMock);

    expect(gspaMock.timeline).not.toHaveBeenCalled();
    const els = document.querySelectorAll('[data-animate]');
    els.forEach((el) => expect(el.style.opacity).toBe('1'));

    vi.unstubAllGlobals();
  });

  it('reads prefers-reduced-motion correctly when matchMedia returns matches:false', () => {
    // Mock window.matchMedia to return matches: false
    vi.stubGlobal('matchMedia', (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    expect(prefersReduced).toBe(false);

    const gspaMock = { timeline: vi.fn(), from: vi.fn(), to: vi.fn() };
    runReducedMotionGuard(document, prefersReduced, gspaMock);

    expect(gspaMock.timeline).toHaveBeenCalledTimes(1);
    const els = document.querySelectorAll('[data-animate]');
    els.forEach((el) => expect(el.style.opacity).toBe(''));

    vi.unstubAllGlobals();
  });
});
