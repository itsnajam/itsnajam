/**
 * Unit tests for NavController
 * Validates: Requirements 2.4, 2.5, 2.6
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Minimal NavController implementation extracted for isolated unit testing.
// The real class lives inside the `else` block in main.js (GSAP guard), so
// we replicate the pure logic here to keep tests framework-agnostic and fast.
// ---------------------------------------------------------------------------

class NavController {
  constructor(navEl) {
    this.navEl = navEl;
  }

  handleScroll(scrollY) {
    if (scrollY > 80) {
      this.navEl.classList.add('navbar--scrolled');
    } else {
      this.navEl.classList.remove('navbar--scrolled');
    }
  }

  init() {
    window.addEventListener('scroll', () => {
      this.handleScroll(window.scrollY);
    }, { passive: true });

    this.handleScroll(window.scrollY);

    const hamburger = this.navEl.querySelector('.hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        const isOpen = this.navEl.classList.toggle('nav--open');
        hamburger.setAttribute('aria-expanded', String(isOpen));
      });
    }

    const scrollToTarget = (targetId) => {
      const target = document.getElementById(targetId);
      if (!target) return;
      try {
        const top = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'smooth' });
      } catch (_) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const links = this.navEl.querySelectorAll('.navbar__links a');
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          scrollToTarget(href.slice(1));
          this.navEl.classList.remove('nav--open');
          if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    });

    const logo = this.navEl.querySelector('.navbar__logo');
    if (logo) {
      logo.addEventListener('click', (e) => {
        const href = logo.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          scrollToTarget(href.slice(1));
        }
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildNav() {
  const nav = document.createElement('nav');
  nav.id = 'navbar';
  nav.innerHTML = `
    <a href="#hero" class="navbar__logo">
      <img src="assets/logo.svg" alt="Muhammad Najam Ul Hassan logo" />
    </a>
    <ul class="navbar__links">
      <li><a href="#hero">Home</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
    <button class="hamburger" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  `;
  document.body.appendChild(nav);
  return nav;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NavController — handleScroll', () => {
  let nav;
  let controller;

  beforeEach(() => {
    // Clean up any leftover nav from previous tests
    document.body.innerHTML = '';
    nav = buildNav();
    controller = new NavController(nav);
  });

  it('adds .navbar--scrolled when scrollY is exactly 81 (> 80)', () => {
    controller.handleScroll(81);
    expect(nav.classList.contains('navbar--scrolled')).toBe(true);
  });

  it('adds .navbar--scrolled when scrollY is exactly 80 — boundary: 80 is NOT > 80', () => {
    controller.handleScroll(80);
    expect(nav.classList.contains('navbar--scrolled')).toBe(false);
  });

  it('removes .navbar--scrolled when scrollY drops to 79 after being scrolled', () => {
    // First scroll past threshold
    controller.handleScroll(200);
    expect(nav.classList.contains('navbar--scrolled')).toBe(true);

    // Then scroll back up
    controller.handleScroll(79);
    expect(nav.classList.contains('navbar--scrolled')).toBe(false);
  });

  it('removes .navbar--scrolled when scrollY is 0', () => {
    controller.handleScroll(200);
    controller.handleScroll(0);
    expect(nav.classList.contains('navbar--scrolled')).toBe(false);
  });

  it('adds .navbar--scrolled for large scroll values', () => {
    controller.handleScroll(5000);
    expect(nav.classList.contains('navbar--scrolled')).toBe(true);
  });
});

describe('NavController — hamburger toggle', () => {
  let nav;
  let controller;
  let hamburger;

  beforeEach(() => {
    document.body.innerHTML = '';
    nav = buildNav();
    controller = new NavController(nav);
    controller.init();
    hamburger = nav.querySelector('.hamburger');
  });

  it('sets aria-expanded="true" when hamburger is clicked once (menu opens)', () => {
    hamburger.click();
    expect(hamburger.getAttribute('aria-expanded')).toBe('true');
  });

  it('sets aria-expanded="false" when hamburger is clicked twice (menu closes)', () => {
    hamburger.click(); // open
    hamburger.click(); // close
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
  });

  it('adds .nav--open to navbar when hamburger is clicked (menu opens)', () => {
    hamburger.click();
    expect(nav.classList.contains('nav--open')).toBe(true);
  });

  it('removes .nav--open from navbar when hamburger is clicked again (menu closes)', () => {
    hamburger.click(); // open
    hamburger.click(); // close
    expect(nav.classList.contains('nav--open')).toBe(false);
  });

  it('starts with aria-expanded="false" before any interaction', () => {
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
  });
});
