/**
 * Unit tests for the About section rendering.
 * Tests: badge count, avatar alt attribute.
 * Requirements: 4.2, 8.2
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

let document;

beforeAll(() => {
  const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf-8');
  const dom = new JSDOM(html);
  document = dom.window.document;
});

describe('About section — badge elements', () => {
  it('renders at least three .badge elements', () => {
    const badges = document.querySelectorAll('#about .badge');
    expect(badges.length).toBeGreaterThanOrEqual(3);
  });

  it('includes "Workflow Automation" badge', () => {
    const badges = Array.from(document.querySelectorAll('#about .badge'));
    const texts = badges.map((b) => b.textContent.trim());
    expect(texts).toContain('Workflow Automation');
  });

  it('includes "Scalable Systems" badge', () => {
    const badges = Array.from(document.querySelectorAll('#about .badge'));
    const texts = badges.map((b) => b.textContent.trim());
    expect(texts).toContain('Scalable Systems');
  });

  it('includes "No-Code / Low-Code" badge', () => {
    const badges = Array.from(document.querySelectorAll('#about .badge'));
    const texts = badges.map((b) => b.textContent.trim());
    expect(texts).toContain('No-Code / Low-Code');
  });
});

describe('About section — avatar image', () => {
  it('avatar <img> has a non-empty alt attribute', () => {
    const avatar = document.querySelector('#about .about__avatar');
    expect(avatar).not.toBeNull();
    expect(avatar.getAttribute('alt')).toBeTruthy();
    expect(avatar.getAttribute('alt').trim().length).toBeGreaterThan(0);
  });

  it('avatar <img> src points to assets/avatar.jpg', () => {
    const avatar = document.querySelector('#about .about__avatar');
    expect(avatar.getAttribute('src')).toBe('assets/avatar.jpg');
  });
});

describe('About section — glass card', () => {
  it('.glass-card is present inside #about', () => {
    const card = document.querySelector('#about .glass-card');
    expect(card).not.toBeNull();
  });

  it('.glass-card has data-animate attribute', () => {
    const card = document.querySelector('#about .glass-card');
    expect(card.hasAttribute('data-animate')).toBe(true);
  });
});

describe('About section — biography content', () => {
  it('contains an <h2> with "Who Am I"', () => {
    const h2 = document.querySelector('#about h2');
    expect(h2).not.toBeNull();
    expect(h2.textContent.trim()).toBe('Who Am I');
  });

  it('biography paragraph mentions 5+ years of experience', () => {
    const p = document.querySelector('#about .about__text p');
    expect(p).not.toBeNull();
    expect(p.textContent).toMatch(/5\+\s*years/i);
  });
});
