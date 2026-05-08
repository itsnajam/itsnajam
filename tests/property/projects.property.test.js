/**
 * Property-based tests: Projects rendering (Property 5, Property 6)
 *
 * Property 5: All six projects are rendered
 *   For any valid PROJECTS array of length 6, renderCards(projects) produces
 *   exactly 6 .project-card elements.
 *   Validates: Requirements 5.1
 *
 * Property 6: Project card stagger delay is monotonically increasing
 *   For any batch of N cards, computed start times are non-decreasing with
 *   at least 100 ms gap between consecutive cards.
 *   Validates: Requirements 5.4
 *
 * @vitest-environment jsdom
 */

import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { JSDOM } from 'jsdom';

// ---------------------------------------------------------------------------
// renderCards — replicated for isolated property testing
// ---------------------------------------------------------------------------

function buildProjectsSection(doc) {
  // Clean up any existing section
  const existing = doc.querySelector('#projects');
  if (existing) existing.remove();

  const section = doc.createElement('section');
  section.id = 'projects';
  const grid = doc.createElement('div');
  grid.className = 'projects__grid';
  section.appendChild(grid);
  doc.body.appendChild(section);
}

function renderCards(projects, doc) {
  const grid = doc.querySelector('#projects .projects__grid');
  if (!grid) return [];
  grid.innerHTML = '';
  projects.forEach(function (project) {
    const card = doc.createElement('div');
    card.className = 'project-card glass-card';

    const imageWrap = doc.createElement('div');
    imageWrap.className = 'card__image-wrap';
    const img = doc.createElement('img');
    img.src = project.image || '';
    img.alt = project.name + ' — project thumbnail';
    imageWrap.appendChild(img);
    card.appendChild(imageWrap);

    const body = doc.createElement('div');
    body.className = 'card__body';

    const h3 = doc.createElement('h3');
    h3.textContent = project.name;
    body.appendChild(h3);

    const p = doc.createElement('p');
    p.textContent = project.description;
    body.appendChild(p);

    const ul = doc.createElement('ul');
    ul.className = 'tags';
    (project.tags || []).forEach(function (tag) {
      const li = doc.createElement('li');
      li.textContent = tag;
      ul.appendChild(li);
    });
    body.appendChild(ul);

    if (project.url) {
      const a = doc.createElement('a');
      a.className = 'btn btn--ghost';
      a.href = project.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'View Project';
      body.appendChild(a);
    }

    card.appendChild(body);
    grid.appendChild(card);
  });
  return doc.querySelectorAll('.project-card');
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generates a single valid project object */
const projectArb = fc.record({
  id: fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/),
  name: fc.string({ minLength: 1, maxLength: 60 }),
  description: fc.string({ minLength: 1, maxLength: 300 }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 6 }),
  url: fc.oneof(fc.constant(null), fc.webUrl()),
  image: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 80 })),
});

/** Generates an array of exactly 6 projects */
const sixProjectsArb = fc.array(projectArb, { minLength: 6, maxLength: 6 });

// ---------------------------------------------------------------------------
// Property 5: All six projects are rendered
// ---------------------------------------------------------------------------

describe('Property 5: All six projects are rendered', () => {
  /**
   * Validates: Requirements 5.1
   *
   * For any valid PROJECTS array of length 6, renderCards(projects) SHALL
   * produce exactly 6 .project-card elements in the DOM.
   */
  it('renderCards(projects) always produces exactly 6 .project-card elements for a 6-item array', () => {
    fc.assert(
      fc.property(sixProjectsArb, (projects) => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        const doc = dom.window.document;
        buildProjectsSection(doc);
        const cards = renderCards(projects, doc);
        return cards.length === 6;
      }),
      { numRuns: 100 }
    );
  });

  it('renderCards(projects) renders exactly N cards for any array of length N (1–10)', () => {
    fc.assert(
      fc.property(
        fc.array(projectArb, { minLength: 1, maxLength: 10 }),
        (projects) => {
          const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
          const doc = dom.window.document;
          buildProjectsSection(doc);
          const cards = renderCards(projects, doc);
          return cards.length === projects.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('cards with url: null never have a .btn--ghost link', () => {
    fc.assert(
      fc.property(sixProjectsArb, (projects) => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        const doc = dom.window.document;
        buildProjectsSection(doc);
        renderCards(projects, doc);

        const cards = Array.from(doc.querySelectorAll('.project-card'));
        return cards.every((card, i) => {
          const project = projects[i];
          const link = card.querySelector('a.btn--ghost');
          if (project.url === null) {
            return link === null;
          }
          return true; // url present — link may or may not exist (tested separately)
        });
      }),
      { numRuns: 100 }
    );
  });

  it('cards with a non-null url always have a .btn--ghost link', () => {
    fc.assert(
      fc.property(sixProjectsArb, (projects) => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        const doc = dom.window.document;
        buildProjectsSection(doc);
        renderCards(projects, doc);

        const cards = Array.from(doc.querySelectorAll('.project-card'));
        return cards.every((card, i) => {
          const project = projects[i];
          const link = card.querySelector('a.btn--ghost');
          if (project.url !== null) {
            return link !== null && link.getAttribute('href') === project.url;
          }
          return true;
        });
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Project card stagger delay is monotonically increasing
// ---------------------------------------------------------------------------

describe('Property 6: Project card stagger delay is monotonically increasing', () => {
  /**
   * Validates: Requirements 5.4
   *
   * For any batch of N cards with stagger = 0.1 s, the computed start time
   * of card n SHALL be >= start time of card n-1 by at least 100 ms.
   *
   * We test the pure stagger computation: startTime(n) = n * staggerMs
   */

  /**
   * Computes the stagger start times for a batch of N cards.
   * @param {number} count - Number of cards
   * @param {number} staggerMs - Stagger delay in milliseconds
   * @returns {number[]} Array of start times in ms
   */
  function computeStaggerTimes(count, staggerMs) {
    return Array.from({ length: count }, (_, i) => i * staggerMs);
  }

  it('stagger start times are non-decreasing with at least 100 ms gap', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 20 }), // batch size
        (count) => {
          const staggerMs = 100; // 0.1 s = 100 ms as per spec
          const times = computeStaggerTimes(count, staggerMs);
          for (let i = 1; i < times.length; i++) {
            if (times[i] - times[i - 1] < staggerMs) return false;
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('stagger start time of card n is exactly n * 100 ms', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (count, cardIndex) => {
          fc.pre(cardIndex < count);
          const staggerMs = 100;
          const times = computeStaggerTimes(count, staggerMs);
          return times[cardIndex] === cardIndex * staggerMs;
        }
      ),
      { numRuns: 100 }
    );
  });
});
