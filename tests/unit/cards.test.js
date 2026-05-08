/**
 * Unit tests for project card rendering.
 * Tests: card count, URL guard, tag rendering, image alt, onerror fallback.
 * Requirements: 5.1, 5.2, 5.3, 5.6, 8.2, 8.3
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

// ---------------------------------------------------------------------------
// renderCards helper — mirrors the window.renderCards logic for isolated tests
// ---------------------------------------------------------------------------

function buildGrid(doc) {
  const section = doc.createElement('section');
  section.id = 'projects';
  const grid = doc.createElement('div');
  grid.className = 'projects__grid';
  section.appendChild(grid);
  doc.body.appendChild(section);
  return grid;
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
    img.onerror = function () {
      img.style.display = 'none';
      img.parentElement.classList.add('card__image--fallback');
    };
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

const PROJECTS = [
  {
    id: 'mobile-monster',
    name: 'Mobile Monster Australia',
    description: 'A full-featured e-commerce platform for buying and selling mobile phones.',
    tags: ['React Native', 'Node.js', 'AWS'],
    url: 'https://mobilemonster.com.au',
    image: 'assets/projects/mobile-monster.png',
  },
  {
    id: 'nest-egg',
    name: 'My First Nest Egg',
    description: 'A personal finance and investment tracking application.',
    tags: ['React', 'Firebase', 'Stripe'],
    url: null,
    image: 'assets/projects/nest-egg.png',
  },
  {
    id: 'bountisphere',
    name: 'Bountisphere AI',
    description: 'An AI-powered bounty and task management platform.',
    tags: ['Python', 'OpenAI', 'FastAPI'],
    url: null,
    image: 'assets/projects/bountisphere.png',
  },
  {
    id: 'clicked',
    name: 'Clicked',
    description: 'A professional development platform.',
    tags: ['Vue.js', 'Node.js', 'PostgreSQL'],
    url: null,
    image: 'assets/projects/clicked.png',
  },
  {
    id: 'fronthouz',
    name: 'Fronthouz',
    description: 'A modern real estate platform.',
    tags: ['Next.js', 'Tailwind CSS', 'Supabase'],
    url: null,
    image: 'assets/projects/fronthouz.png',
  },
  {
    id: 'sentre',
    name: 'Sentre',
    description: 'An enterprise communication and workflow automation tool.',
    tags: ['React', 'GraphQL', 'AWS Lambda'],
    url: null,
    image: 'assets/projects/sentre.png',
  },
];

// ---------------------------------------------------------------------------
// Tests against pre-rendered HTML
// ---------------------------------------------------------------------------

describe('Projects section — pre-rendered HTML', () => {
  it('has a #projects section in the DOM', () => {
    const section = document.querySelector('#projects');
    expect(section).not.toBeNull();
  });

  it('has a .projects__grid inside #projects', () => {
    const grid = document.querySelector('#projects .projects__grid');
    expect(grid).not.toBeNull();
  });

  it('renders exactly six .project-card elements', () => {
    const cards = document.querySelectorAll('#projects .project-card');
    expect(cards.length).toBe(6);
  });

  it('every .project-card also has .glass-card class', () => {
    const cards = document.querySelectorAll('#projects .project-card');
    cards.forEach((card) => {
      expect(card.classList.contains('glass-card')).toBe(true);
    });
  });

  it('every card has an <h3> with non-empty text', () => {
    const cards = document.querySelectorAll('#projects .project-card');
    cards.forEach((card) => {
      const h3 = card.querySelector('h3');
      expect(h3).not.toBeNull();
      expect(h3.textContent.trim().length).toBeGreaterThan(0);
    });
  });

  it('every card has a <p> description with non-empty text', () => {
    const cards = document.querySelectorAll('#projects .project-card');
    cards.forEach((card) => {
      const p = card.querySelector('p');
      expect(p).not.toBeNull();
      expect(p.textContent.trim().length).toBeGreaterThan(0);
    });
  });

  it('every card has a <ul class="tags"> with at least one <li>', () => {
    const cards = document.querySelectorAll('#projects .project-card');
    cards.forEach((card) => {
      const ul = card.querySelector('ul.tags');
      expect(ul).not.toBeNull();
      const items = ul.querySelectorAll('li');
      expect(items.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('every card image has a non-empty alt attribute', () => {
    const imgs = document.querySelectorAll('#projects .project-card img');
    imgs.forEach((img) => {
      expect(img.getAttribute('alt')).toBeTruthy();
      expect(img.getAttribute('alt').trim().length).toBeGreaterThan(0);
    });
  });

  it('every card image has an onerror attribute', () => {
    const imgs = document.querySelectorAll('#projects .project-card img');
    imgs.forEach((img) => {
      expect(img.hasAttribute('onerror')).toBe(true);
    });
  });
});

describe('Projects section — URL guard', () => {
  it('Mobile Monster card has a "View Project" link with correct href', () => {
    const card = document.querySelector('#card-mobile-monster');
    expect(card).not.toBeNull();
    const link = card.querySelector('a.btn--ghost');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('https://mobilemonster.com.au');
  });

  it('Mobile Monster "View Project" link has target="_blank"', () => {
    const link = document.querySelector('#card-mobile-monster a.btn--ghost');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('Mobile Monster "View Project" link has rel="noopener noreferrer"', () => {
    const link = document.querySelector('#card-mobile-monster a.btn--ghost');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('Nest Egg card (url: null) has NO "View Project" link', () => {
    const card = document.querySelector('#card-nest-egg');
    expect(card).not.toBeNull();
    const link = card.querySelector('a.btn--ghost');
    expect(link).toBeNull();
  });

  it('Bountisphere card (url: null) has NO "View Project" link', () => {
    const card = document.querySelector('#card-bountisphere');
    const link = card.querySelector('a.btn--ghost');
    expect(link).toBeNull();
  });

  it('Clicked card (url: null) has NO "View Project" link', () => {
    const card = document.querySelector('#card-clicked');
    const link = card.querySelector('a.btn--ghost');
    expect(link).toBeNull();
  });

  it('Fronthouz card (url: null) has NO "View Project" link', () => {
    const card = document.querySelector('#card-fronthouz');
    const link = card.querySelector('a.btn--ghost');
    expect(link).toBeNull();
  });

  it('Sentre card (url: null) has NO "View Project" link', () => {
    const card = document.querySelector('#card-sentre');
    const link = card.querySelector('a.btn--ghost');
    expect(link).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests against renderCards() function (dynamic rendering)
// ---------------------------------------------------------------------------

describe('renderCards() — dynamic rendering', () => {
  let dom;
  let doc;

  beforeAll(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    doc = dom.window.document;
    buildGrid(doc);
  });

  it('returns exactly 6 cards for the full PROJECTS array', () => {
    const cards = renderCards(PROJECTS, doc);
    expect(cards.length).toBe(6);
  });

  it('omits "View Project" link for projects with url: null', () => {
    renderCards(PROJECTS, doc);
    const nullUrlProjects = PROJECTS.filter((p) => p.url === null);
    nullUrlProjects.forEach((project) => {
      const card = doc.querySelector('#projects .project-card:nth-child(' + (PROJECTS.indexOf(project) + 1) + ')');
      const link = card ? card.querySelector('a.btn--ghost') : null;
      expect(link).toBeNull();
    });
  });

  it('includes "View Project" link only for projects with a non-null url', () => {
    renderCards(PROJECTS, doc);
    const urlProjects = PROJECTS.filter((p) => p.url !== null);
    // There should be exactly as many .btn--ghost links as projects with urls
    const links = doc.querySelectorAll('#projects .btn--ghost');
    expect(links.length).toBe(urlProjects.length);
  });

  it('renders correct project names as <h3> text', () => {
    renderCards(PROJECTS, doc);
    const h3s = Array.from(doc.querySelectorAll('#projects .project-card h3'));
    const names = h3s.map((h) => h.textContent.trim());
    PROJECTS.forEach((project) => {
      expect(names).toContain(project.name);
    });
  });

  it('renders correct tags for each project', () => {
    renderCards(PROJECTS, doc);
    const cards = doc.querySelectorAll('#projects .project-card');
    cards.forEach((card, i) => {
      const project = PROJECTS[i];
      const tagTexts = Array.from(card.querySelectorAll('.tags li')).map((li) => li.textContent.trim());
      project.tags.forEach((tag) => {
        expect(tagTexts).toContain(tag);
      });
    });
  });

  it('returns empty array when #projects grid is absent', () => {
    const emptyDom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const result = renderCards(PROJECTS, emptyDom.window.document);
    expect(Array.from(result).length).toBe(0);
  });
});
