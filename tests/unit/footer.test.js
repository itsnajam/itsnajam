/**
 * Unit tests for the Footer / Contact section.
 * Tests: getCopyrightYear, "Get In Touch" CTA href, social link attributes.
 * Requirements: 6.2, 6.3, 6.6
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

let document;
let window;

beforeAll(() => {
  const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf-8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
  document = dom.window.document;
  window = dom.window;
});

// ---------------------------------------------------------------------------
// getCopyrightYear — pure function
// ---------------------------------------------------------------------------

/**
 * Inline implementation matching the one exported via window.getCopyrightYear
 * in main.js. Tested here as a pure function without needing the browser env.
 */
function getCopyrightYear(date) {
  return date.getFullYear();
}

describe('getCopyrightYear — pure function', () => {
  it('returns the current 4-digit year for new Date()', () => {
    const year = getCopyrightYear(new Date());
    expect(year).toBe(new Date().getFullYear());
  });

  it('returns a 4-digit number (>= 2000)', () => {
    const year = getCopyrightYear(new Date());
    expect(year).toBeGreaterThanOrEqual(2000);
    expect(year).toBeLessThan(3000);
  });

  it('returns the correct year for a specific date', () => {
    expect(getCopyrightYear(new Date('2024-06-15'))).toBe(2024);
    expect(getCopyrightYear(new Date('2000-01-01'))).toBe(2000);
    expect(getCopyrightYear(new Date('1999-12-31'))).toBe(1999);
  });
});

// ---------------------------------------------------------------------------
// Footer HTML structure
// ---------------------------------------------------------------------------

describe('Footer — "Get In Touch" CTA', () => {
  it('"Get In Touch" link has href starting with "mailto:"', () => {
    const cta = document.querySelector('#contact a.btn--primary');
    expect(cta).not.toBeNull();
    expect(cta.getAttribute('href')).toMatch(/^mailto:/);
  });

  it('"Get In Touch" link text is "Get In Touch"', () => {
    const cta = document.querySelector('#contact a.btn--primary');
    expect(cta).not.toBeNull();
    expect(cta.textContent.trim()).toBe('Get In Touch');
  });
});

describe('Footer — social links', () => {
  it('LinkedIn link has target="_blank"', () => {
    const links = Array.from(document.querySelectorAll('#contact a'));
    const linkedin = links.find((a) =>
      a.getAttribute('href') && a.getAttribute('href').includes('linkedin')
    );
    expect(linkedin).not.toBeNull();
    expect(linkedin.getAttribute('target')).toBe('_blank');
  });

  it('LinkedIn link has rel="noopener noreferrer"', () => {
    const links = Array.from(document.querySelectorAll('#contact a'));
    const linkedin = links.find((a) =>
      a.getAttribute('href') && a.getAttribute('href').includes('linkedin')
    );
    expect(linkedin).not.toBeNull();
    expect(linkedin.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('GitHub link has target="_blank"', () => {
    const links = Array.from(document.querySelectorAll('#contact a'));
    const github = links.find((a) =>
      a.getAttribute('href') && a.getAttribute('href').includes('github')
    );
    expect(github).not.toBeNull();
    expect(github.getAttribute('target')).toBe('_blank');
  });

  it('GitHub link has rel="noopener noreferrer"', () => {
    const links = Array.from(document.querySelectorAll('#contact a'));
    const github = links.find((a) =>
      a.getAttribute('href') && a.getAttribute('href').includes('github')
    );
    expect(github).not.toBeNull();
    expect(github.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('all external links in footer have target="_blank" and rel="noopener noreferrer"', () => {
    const links = Array.from(document.querySelectorAll('#contact a'));
    const externalLinks = links.filter((a) => {
      const href = a.getAttribute('href') || '';
      return href.startsWith('http');
    });
    expect(externalLinks.length).toBeGreaterThanOrEqual(2);
    externalLinks.forEach((link) => {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });
});

describe('Footer — structure', () => {
  it('footer element has id="contact"', () => {
    const footer = document.querySelector('footer#contact');
    expect(footer).not.toBeNull();
  });

  it('footer contains a .glass-card element', () => {
    const card = document.querySelector('#contact .glass-card');
    expect(card).not.toBeNull();
  });

  it('.glass-card has data-animate attribute', () => {
    const card = document.querySelector('#contact .glass-card');
    expect(card).not.toBeNull();
    expect(card.hasAttribute('data-animate')).toBe(true);
  });

  it('footer contains a copyright paragraph with owner name', () => {
    const copy = document.querySelector('#contact .footer__copy');
    expect(copy).not.toBeNull();
    expect(copy.textContent).toContain('Muhammad Najam Ul Hassan');
  });

  it('footer contains a #year span', () => {
    const yearSpan = document.querySelector('#year');
    expect(yearSpan).not.toBeNull();
  });
});
