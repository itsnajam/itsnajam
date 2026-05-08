// ---------------------------------------------------------------------------
// getCopyrightYear — pure helper, exported via window for unit / property tests
// ---------------------------------------------------------------------------
function getCopyrightYear(date) { return date.getFullYear(); }
window.getCopyrightYear = getCopyrightYear;

var yearEl = document.getElementById('year');
if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

// ---------------------------------------------------------------------------
// parseBlurRadius — pure helper
// ---------------------------------------------------------------------------
function parseBlurRadius(v) {
  var m = v.match(/blur\((\d+(?:\.\d+)?)px\)/);
  return m ? parseFloat(m[1]) : null;
}
window.parseBlurRadius = parseBlurRadius;

// GSAP CDN failure guard — must run before any GSAP calls
// (full animation suite below)
if (typeof gsap === 'undefined') {
  document.querySelectorAll('[data-animate]').forEach(function (el) {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  // Stop execution — GSAP is unavailable; page content is already fully visible
} else {
  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // ---------------------------------------------------------------------------
  // ReducedMotionGuard — respect prefers-reduced-motion: reduce
  // Must be checked before any GSAP call.
  // ---------------------------------------------------------------------------

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // Disable all animations — set elements to final visible state immediately
    document.querySelectorAll('[data-animate]').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  // ---------------------------------------------------------------------------
  // clampParallax — pure helper, exported via window for unit / property tests
  // ---------------------------------------------------------------------------

  /**
   * Clamps a value to the range [-max, max].
   * Pure function — exported for unit testing.
   * @param {number} value
   * @param {number} max
   * @returns {number}
   */
  function clampParallax(value, max) {
    return Math.min(Math.max(value, -max), max);
  }
  window.clampParallax = clampParallax;

  // ---------------------------------------------------------------------------
  // StarField — interactive: stars flow toward cursor, click = shockwave
  // ---------------------------------------------------------------------------

  class StarField {
    constructor(canvasEl, options = {}) {
      this.canvas = canvasEl;
      this.ctx = canvasEl.getContext('2d');

      const { count = 280, speed = 0.25 } = options;
      this.count = count;
      this.baseSpeed = speed;

      this.mouseX = window.innerWidth / 2;
      this.mouseY = window.innerHeight / 2;
      this.mouseActive = false;
      this.shockwaves = [];

      this._rafId = null;
      this._resize = this._resize.bind(this);
      window.addEventListener('resize', this._resize, { passive: true });
      this._resize();

      // Track mouse globally
      window.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.mouseActive = true;
      }, { passive: true });

      // Click = shockwave
      window.addEventListener('click', (e) => {
        this.shockwaves.push({ x: e.clientX, y: e.clientY, r: 0, life: 1 });
      });
    }

    _resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this._initStars();
    }

    _initStars() {
      this.stars = [];
      for (let i = 0; i < this.count; i++) {
        this.stars.push(this._createStar());
      }
    }

    _createStar(x, y) {
      const rnd = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.4 + 0.1) * this.baseSpeed;
      return {
        x: x !== undefined ? x : Math.random() * this.canvas.width,
        y: y !== undefined ? y : Math.random() * this.canvas.height,
        ox: x !== undefined ? x : Math.random() * this.canvas.width,
        oy: y !== undefined ? y : Math.random() * this.canvas.height,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: Math.random() * 1.6 + 0.3,
        opacity: Math.random() * 0.7 + 0.3,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        color: rnd > 0.88 ? [167, 139, 250] : rnd > 0.75 ? [56, 189, 248] : [232, 234, 246],
      };
    }

    _draw() {
      const { ctx, canvas, stars, mouseX, mouseY, mouseActive, shockwaves } = this;
      const W = canvas.width, H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      const ATTRACT_RADIUS = 220;
      const ATTRACT_FORCE  = 0.18;
      const DAMPING        = 0.92;
      const HOME_FORCE     = 0.004;

      for (const s of stars) {
        // Cursor attraction
        if (mouseActive) {
          const dx = mouseX - s.x;
          const dy = mouseY - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < ATTRACT_RADIUS && dist > 0) {
            const force = (1 - dist / ATTRACT_RADIUS) * ATTRACT_FORCE;
            s.vx += (dx / dist) * force;
            s.vy += (dy / dist) * force;
          }
        }

        // Shockwave push
        for (const sw of shockwaves) {
          const dx = s.x - sw.x;
          const dy = s.y - sw.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const waveFront = sw.r;
          const band = 60;
          if (dist > waveFront - band && dist < waveFront + band && dist > 0) {
            const intensity = (1 - Math.abs(dist - waveFront) / band) * sw.life * 5;
            s.vx += (dx / dist) * intensity;
            s.vy += (dy / dist) * intensity;
          }
        }

        // Drift back home
        s.vx += (s.ox - s.x) * HOME_FORCE;
        s.vy += (s.oy - s.y) * HOME_FORCE;

        // Damping + move
        s.vx *= DAMPING;
        s.vy *= DAMPING;
        s.x += s.vx;
        s.y += s.vy;

        // Wrap
        if (s.x < 0) { s.x += W; s.ox = s.x; }
        if (s.x > W) { s.x -= W; s.ox = s.x; }
        if (s.y < 0) { s.y += H; s.oy = s.y; }
        if (s.y > H) { s.y -= H; s.oy = s.y; }

        // Twinkle
        s.twinklePhase += s.twinkleSpeed;
        const tw = 0.4 + 0.6 * Math.sin(s.twinklePhase);
        const op = s.opacity * tw;

        // Speed-based brightness boost
        const spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        const boost = Math.min(spd * 0.8, 1);
        const finalOp = Math.min(op + boost * 0.5, 1);

        const [r, g, b] = s.color;

        // Draw star
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius + boost * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${finalOp})`;
        ctx.fill();

        // Glow halo
        if (s.radius > 0.9 || boost > 0.3) {
          const glowR = (s.radius + boost * 2) * 3.5;
          const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
          grd.addColorStop(0, `rgba(${r},${g},${b},${finalOp * 0.25})`);
          grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Speed trail — draw a line in the direction of travel
        if (spd > 0.8) {
          const trailLen = spd * 6;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * trailLen / spd, s.y - s.vy * trailLen / spd);
          ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(spd * 0.15, 0.5)})`;
          ctx.lineWidth = s.radius * 0.8;
          ctx.stroke();
        }
      }

      // Draw + update shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.r += 18 + sw.r * 0.04;
        sw.life -= 0.025;
        if (sw.life <= 0) { shockwaves.splice(i, 1); continue; }

        // Three expanding rings
        for (let ring = 0; ring < 3; ring++) {
          const ringR = sw.r * (1 - ring * 0.1);
          const alpha = sw.life * (0.35 - ring * 0.1);
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(124,131,253,${alpha})`;
          ctx.lineWidth = 1.5 - ring * 0.4;
          ctx.stroke();
        }
      }

      this._rafId = requestAnimationFrame(() => this._draw());
    }

    start() {
      if (this._rafId !== null) return;
      this._draw();
    }

    stop() {
      if (this._rafId !== null) {
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
      }
    }

    // Keep for compatibility with existing parallax calls (now a no-op)
    setParallaxOffset() {}
  }

  // ---------------------------------------------------------------------------
  // Initialise StarField
  // ---------------------------------------------------------------------------

  const canvas = document.getElementById('starfield');
  let starField = null;
  if (canvas && canvas.getContext) {
    starField = new StarField(canvas, { count: 220, speed: 0.22, parallaxStrength: 20 });
    starField.start();
  }

  // ---------------------------------------------------------------------------
  // Cursor glow + dot — smooth lerp follow with hover state
  // ---------------------------------------------------------------------------
  const cursorGlow = document.querySelector('.cursor-glow');
  const cursorDot = document.querySelector('.cursor-dot');
  if (!window.matchMedia('(pointer: coarse)').matches) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let gx = mx, gy = my, dx = mx, dy = my;

    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    // Hover detection for interactive elements
    document.querySelectorAll('a, button, .project-card, .badge, .tech-item').forEach((el) => {
      el.addEventListener('mouseenter', () => cursorDot && cursorDot.classList.add('cursor-dot--hover'));
      el.addEventListener('mouseleave', () => cursorDot && cursorDot.classList.remove('cursor-dot--hover'));
    });

    (function animCursor() {
      // Glow: very slow lerp
      gx += (mx - gx) * 0.06;
      gy += (my - gy) * 0.06;
      if (cursorGlow) { cursorGlow.style.left = gx + 'px'; cursorGlow.style.top = gy + 'px'; }

      // Dot: fast lerp
      dx += (mx - dx) * 0.18;
      dy += (my - dy) * 0.18;
      if (cursorDot) { cursorDot.style.left = dx + 'px'; cursorDot.style.top = dy + 'px'; }

      requestAnimationFrame(animCursor);
    })();
  }

  // ---------------------------------------------------------------------------
  // Card glow — track mouse position per card
  // ---------------------------------------------------------------------------
  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--mouse-y', ((e.clientY - r.top) / r.height * 100) + '%');
    }, { passive: true });
  });

  // ---------------------------------------------------------------------------
  // Typing effect
  // ---------------------------------------------------------------------------
  const typingEl = document.getElementById('hero-typing');
  if (typingEl) {
    const phrases = [
      'Senior Software Engineer',
      'Full-Stack Developer',
      'AI Systems Builder',
      'Workflow Automation Expert',
      'Cloud Architecture Specialist',
    ];
    let phraseIdx = 0, charIdx = 0, deleting = false;

    function typeLoop() {
      const current = phrases[phraseIdx];
      if (!deleting) {
        typingEl.textContent = current.slice(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(typeLoop, 2200);
          return;
        }
        setTimeout(typeLoop, 65);
      } else {
        typingEl.textContent = current.slice(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(typeLoop, 400);
          return;
        }
        setTimeout(typeLoop, 35);
      }
    }
    setTimeout(typeLoop, 2000); // start after hero entrance
  }

  /**
   * NavController
   * Manages the fixed navigation bar:
   *  - Applies .navbar--scrolled glass effect when scrollY > 80 px
   *  - Toggles the hamburger / mobile menu
   *  - Smooth-scrolls to target sections on nav-link click
   */
  class NavController {
    /**
     * @param {HTMLElement} navEl - The <nav> element
     */
    constructor(navEl) {
      this.navEl = navEl;
    }

    /**
     * Apply or remove .navbar--scrolled based on the given scrollY value.
     * Exposed as a public method so it can be unit-tested without triggering
     * real scroll events.
     *
     * @param {number} scrollY - Current vertical scroll position in pixels
     */
    handleScroll(scrollY) {
      if (scrollY > 80) {
        this.navEl.classList.add('navbar--scrolled');
      } else {
        this.navEl.classList.remove('navbar--scrolled');
      }
    }

    updateActiveLink() {
      const sections = ['hero', 'about', 'projects', 'contact'];
      const scrollY = window.scrollY + 120;
      let current = 'hero';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) current = id;
      }
      this.navEl.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.toggle('nav-link--active', link.getAttribute('data-section') === current);
      });
    }

    /**
     * Attach all event listeners.
     * Call once after the DOM is ready.
     */
    init() {
      // --- Scroll listener: toggle glass effect ---
      window.addEventListener('scroll', () => {
        this.handleScroll(window.scrollY);
        this.updateActiveLink();
      }, { passive: true });

      // Run once on init in case the page is already scrolled
      this.handleScroll(window.scrollY);
      this.updateActiveLink();

      // --- Hamburger toggle ---
      const hamburger = this.navEl.querySelector('.hamburger');
      if (hamburger) {
        hamburger.addEventListener('click', () => {
          const isOpen = this.navEl.classList.toggle('nav--open');
          hamburger.setAttribute('aria-expanded', String(isOpen));
        });
      }

      // --- Smooth scroll for nav links and logo ---
      const scrollToTarget = (targetId) => {
        const target = document.getElementById(targetId);
        if (!target) return;

        try {
          const top = target.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top, behavior: 'smooth' });
        } catch (_) {
          // Fallback for browsers that don't support scrollTo options
          target.scrollIntoView({ behavior: 'smooth' });
        }
      };

      // Nav links
      const links = this.navEl.querySelectorAll('.navbar__links a');
      links.forEach((link) => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.slice(1);
            scrollToTarget(targetId);

            // Close mobile menu after navigation
            this.navEl.classList.remove('nav--open');
            if (hamburger) {
              hamburger.setAttribute('aria-expanded', 'false');
            }
          }
        });
      });

      // Logo click → scroll to #hero
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

  // Instantiate and initialise NavController (always runs — non-animation functionality)
  const navEl = document.getElementById('navbar');
  if (navEl) {
    const navController = new NavController(navEl);
    navController.init();
  }

  // ---------------------------------------------------------------------------
  // renderCards — builds project cards from a PROJECTS array into the DOM.
  // Exported via window for property-based tests.
  // ---------------------------------------------------------------------------

  /**
   * Renders project cards into #projects .projects__grid.
   * @param {Array<{id:string, name:string, description:string, tags:string[], url:string|null, image:string|null}>} projects
   * @returns {NodeList} The rendered .project-card elements
   */
  function renderCards(projects) {
    const grid = document.querySelector('#projects .projects__grid');
    if (!grid) return [];
    grid.innerHTML = '';
    projects.forEach(function (project) {
      const card = document.createElement('div');
      card.className = 'project-card glass-card';
      if (project.id) {
        card.id = 'card-' + project.id;
      }

      // Image wrapper
      const imageWrap = document.createElement('div');
      imageWrap.className = 'card__image-wrap';
      const img = document.createElement('img');
      img.src = project.image || '';
      img.alt = project.name + ' — project thumbnail';
      img.onerror = function () {
        img.style.display = 'none';
        img.parentElement.classList.add('card__image--fallback');
      };
      imageWrap.appendChild(img);
      card.appendChild(imageWrap);

      // Card body
      const body = document.createElement('div');
      body.className = 'card__body';

      const h3 = document.createElement('h3');
      h3.textContent = project.name;
      body.appendChild(h3);

      const p = document.createElement('p');
      p.textContent = project.description;
      body.appendChild(p);

      const ul = document.createElement('ul');
      ul.className = 'tags';
      (project.tags || []).forEach(function (tag) {
        const li = document.createElement('li');
        li.textContent = tag;
        ul.appendChild(li);
      });
      body.appendChild(ul);

      // Only render the link when url is non-null
      if (project.url) {
        const a = document.createElement('a');
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
    return document.querySelectorAll('.project-card');
  }
  window.renderCards = renderCards;

  // ---------------------------------------------------------------------------
  // getColumnCount — pure function returning grid column count for a viewport width.
  // Exported via window for property-based tests.
  // ---------------------------------------------------------------------------

  /**
   * Returns the number of grid columns for a given viewport width.
   * @param {number} width - Viewport width in pixels
   * @returns {1|2|3}
   */
  function getColumnCount(width) {
    if (width > 1024) return 3;
    if (width >= 769) return 2;
    return 1;
  }
  window.getColumnCount = getColumnCount;

  // ---------------------------------------------------------------------------
  // GSAP animations — skipped entirely when prefers-reduced-motion: reduce
  // ---------------------------------------------------------------------------

  if (!prefersReduced) {
    // If page is loaded scrolled past the hero, skip the entrance animation
    // to avoid leaving hero elements invisible
    const heroHeight = (document.getElementById('hero') || {}).offsetHeight || window.innerHeight;
    const skipHeroEntrance = window.scrollY > heroHeight * 0.5;

    if (skipHeroEntrance) {
      // Make sure everything is visible immediately
      document.querySelectorAll('#hero .hero__content, #navbar, .hero__eyebrow, .hero__name-line, .hero__subtitle, .hero__desc, .hero__actions, .hero__scroll').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }

    // ---- Hero entrance — dramatic per-character reveal ----
    // Only split the FIRST name line (Muhammad) into chars — the accent line
    // uses -webkit-text-fill-color: transparent for gradient, which breaks on child spans.
    const glitchLine = document.querySelector('.hero__name-line--glitch');
    if (glitchLine) {
      const text = (glitchLine.dataset.original || glitchLine.getAttribute('data-glitch') || glitchLine.textContent).trim();
      glitchLine.dataset.original = text;
      glitchLine.innerHTML = text.split('').map((ch) =>
        ch === ' '
          ? '<span class="char" style="display:inline-block">&nbsp;</span>'
          : `<span class="char" style="display:inline-block">${ch}</span>`
      ).join('');
    }

    // Store original for accent line too (for scramble), but don't split into chars
    const accentLine = document.querySelector('.hero__name-line--accent');
    if (accentLine) {
      accentLine.dataset.original = accentLine.textContent.trim();
    }

    if (!skipHeroEntrance) {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('#navbar', { opacity: 0, y: -24, duration: 0.7 })
        .from('.navbar__logo', { opacity: 0, x: -20, duration: 0.5, ease: 'power2.out' }, '-=0.3')
        .from('.hero__eyebrow', { opacity: 0, scale: 0.8, duration: 0.6, ease: 'back.out(2)' }, '-=0.2')
        .from('#hero h1 .char', {
          opacity: 0,
          y: () => gsap.utils.random(-80, 80),
          x: () => gsap.utils.random(-40, 40),
          rotation: () => gsap.utils.random(-25, 25),
          scale: 0,
          stagger: { each: 0.028, from: 'random' },
          duration: 0.75,
          ease: 'back.out(1.8)',
        }, '-=0.1')
        .from('.hero__name-line--accent', { opacity: 0, y: 40, scale: 0.85, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.4')
        .from('.hero__subtitle', { opacity: 0, y: 20, duration: 0.6 }, '-=0.2')
        .from('.hero__desc', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
        .from('.hero__actions .btn', { opacity: 0, y: 20, scale: 0.9, stagger: 0.12, duration: 0.5, ease: 'back.out(1.5)' }, '-=0.35')
        .from('.hero__scroll', { opacity: 0, y: 10, duration: 0.5 }, '-=0.2');
    }

    // ---- Section labels ----
    gsap.utils.toArray('.section__label').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%' },
        opacity: 0, y: 18, duration: 0.6, ease: 'power2.out',
      });
    });

    // ---- About section ----
    gsap.timeline({ scrollTrigger: { trigger: '#about', start: 'top 78%' } })
      .from('.about__avatar-col', { opacity: 0, x: -80, scale: 0.85, duration: 1.1, ease: 'power3.out' })
      .from('.about__avatar', { scale: 0.6, opacity: 0, duration: 0.9, ease: 'back.out(2)' }, '-=0.7')
      .from('.avatar__ring', { opacity: 0, scale: 0.2, stagger: 0.18, duration: 1, ease: 'back.out(1.5)' }, '-=0.6')
      .from('.about__stats .stat-item', { opacity: 0, y: 28, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, '-=0.5')
      .from('.about__heading', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' }, '-=0.75')
      .from('.about__bio', { opacity: 0, y: 24, stagger: 0.14, duration: 0.7, ease: 'power2.out' }, '-=0.55')
      .from('.badge', { opacity: 0, scale: 0.75, stagger: 0.045, duration: 0.4, ease: 'back.out(1.5)' }, '-=0.4')
      .from('.tech-item', { opacity: 0, y: 10, stagger: 0.04, duration: 0.35, ease: 'power2.out' }, '-=0.3')
      .from('.about__socials .about__social-link', { opacity: 0, y: 15, scale: 0.85, stagger: 0.08, duration: 0.4, ease: 'back.out(1.5)' }, '-=0.2');

    // ---- Counter animation ----
    document.querySelectorAll('.stat-number').forEach((el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target, duration: 1.8, ease: 'power2.out',
            onUpdate: function () { el.textContent = Math.round(this.targets()[0].val); },
          });
        },
      });
    });

    // ---- Hero parallax — orbs drift with mouse ----
    const heroSection = document.getElementById('hero');
    if (heroSection && starField && !window.matchMedia('(pointer: coarse)').matches) {
      heroSection.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        const dx = ((e.clientX - cx) / cx) * 20;
        const dy = ((e.clientY - cy) / cy) * 20;
        starField.setParallaxOffset(dx, dy);
        gsap.to('.hero__content', { x: dx * 0.05, y: dy * 0.05, duration: 1.6, ease: 'power2.out' });
        gsap.to('.orb--1', { x: dx * 0.4, y: dy * 0.4, duration: 2.5, ease: 'power2.out' });
        gsap.to('.orb--2', { x: -dx * 0.25, y: -dy * 0.25, duration: 3, ease: 'power2.out' });
        gsap.to('.orb--3', { x: dx * 0.2, y: -dy * 0.2, duration: 3.5, ease: 'power2.out' });
      }, { passive: true });
    }

    // ---- Projects header ----
    gsap.from('.projects__header', {
      scrollTrigger: { trigger: '.projects__header', start: 'top 87%' },
      opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
    });
    // ---- Project cards stagger + hover + 3D tilt ----
    // ---- Project cards — 3D tilt + lift (merged into single tween) ----
    const cards = document.querySelectorAll('.project-card');
    if (cards.length) {
      gsap.set(cards, { opacity: 0, y: 55, scale: 0.95 });
      ScrollTrigger.batch('.project-card', {
        onEnter: (batch) => {
          gsap.to(batch, { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.75, ease: 'power3.out' });
        },
        start: 'top 90%',
      });

      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      cards.forEach((card) => {
        // Set perspective on the card itself so tilt looks right
        gsap.set(card, { transformPerspective: 800 });

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -8,
            scale: 1.02,
            boxShadow: '0 24px 60px rgba(0,0,0,0.65), 0 0 40px rgba(124,131,253,0.18)',
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            duration: 0.55,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'rotateX,rotateY',
          });
        });

        if (!isCoarse) {
          card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -2;
            const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 2;
            gsap.to(card, {
              rotateX: rx,
              rotateY: ry,
              duration: 0.3,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }, { passive: true });
        }
      });
    }

    // ---- Footer ----
    gsap.set('.footer__cta, .footer__link, .footer__copy, .footer__subtext, .footer__heading, #contact .footer__card', { clearProps: 'all' });
    gsap.timeline({ scrollTrigger: { trigger: '#contact .footer__card', start: 'top 87%', once: true } })
      .from('#contact .footer__card', { opacity: 0, y: 55, scale: 0.96, duration: 0.9, ease: 'power3.out' })
      .from('.footer__heading', { opacity: 0, y: 30, duration: 0.7, ease: 'power2.out' }, '-=0.55')
      .from('.footer__subtext', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .from('.footer__cta', { opacity: 0, y: 20, scale: 0.88, duration: 0.5, ease: 'back.out(1.5)' }, '-=0.3')
      .from('.footer__link', { opacity: 0, y: 14, stagger: 0.08, duration: 0.4, ease: 'power2.out' }, '-=0.2')
      .from('.footer__copy', { opacity: 0, duration: 0.4 }, '-=0.1');

    // ---- Magnetic buttons ----
    if (!window.matchMedia('(pointer: coarse)').matches) {
      document.querySelectorAll('.btn--primary, .btn--outline').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const r = btn.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width / 2) * 0.28;
          const dy = (e.clientY - r.top - r.height / 2) * 0.28;
          gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out', overwrite: true });
        }, { passive: true });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'power3.out', overwrite: true, clearProps: 'x,y' });
        });
      });
    }

    // ---- Nav links — stagger hover shimmer ----
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('mouseenter', () => {
        gsap.to(link, { scale: 1.06, duration: 0.2, ease: 'back.out(2)' });
      });
      link.addEventListener('mouseleave', () => {
        gsap.to(link, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' });
      });
    });

    // ---- Logo — subtle glow pulse on idle ----
    const logoEl = document.querySelector('.logo-svg');
    if (logoEl) {
      gsap.to(logoEl, {
        filter: 'drop-shadow(0 0 10px rgba(124,131,253,0.7))',
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
      const logoLink = document.querySelector('.navbar__logo');
      if (logoLink) {
        logoLink.addEventListener('mouseenter', () => {
          gsap.to(logoEl, { scale: 1.06, duration: 0.25, ease: 'power2.out', overwrite: true });
        });
        logoLink.addEventListener('mouseleave', () => {
          gsap.to(logoEl, { scale: 1, duration: 0.4, ease: 'power2.out', overwrite: true, clearProps: 'scale' });
        });
      }
    }

    // ---- Badges — scroll reveal + hover ripple ----
    gsap.utils.toArray('.badge').forEach((badge, i) => {
      ScrollTrigger.create({
        trigger: badge,
        start: 'top 92%',
        once: true,
        onEnter: () => {
          gsap.from(badge, {
            opacity: 0,
            scale: 0.5,
            rotation: (Math.random() - 0.5) * 20,
            duration: 0.5,
            ease: 'back.out(2)',
            delay: i * 0.04,
          });
        },
      });
    });

    // ---- Tech items — scroll reveal wave ----
    gsap.utils.toArray('.tech-item').forEach((item, i) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 93%',
        once: true,
        onEnter: () => {
          gsap.from(item, {
            opacity: 0,
            x: -20,
            duration: 0.4,
            ease: 'power2.out',
            delay: i * 0.06,
          });
        },
      });
    });

    // ---- Tags on project cards — stagger reveal ----
    document.querySelectorAll('.project-card').forEach((card) => {
      const tags = card.querySelectorAll('.tags li');
      ScrollTrigger.create({
        trigger: card,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.from(tags, {
            opacity: 0,
            y: 10,
            scale: 0.8,
            stagger: 0.05,
            duration: 0.35,
            ease: 'back.out(1.5)',
            delay: 0.3,
          });
        },
      });
    });

    // ---- Footer links — magnetic hover ----
    if (!window.matchMedia('(pointer: coarse)').matches) {
      document.querySelectorAll('.footer__link').forEach((link) => {
        link.addEventListener('mousemove', (e) => {
          const r = link.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width / 2) * 0.2;
          const dy = (e.clientY - r.top - r.height / 2) * 0.2;
          gsap.to(link, { x: dx, y: dy, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        }, { passive: true });
        link.addEventListener('mouseleave', () => {
          gsap.to(link, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: 'auto', clearProps: 'x,y' });
        });
      });
    }

    // ---- About social links — glow handled by CSS, no transform ----

    // ---- Stat items — glow handled by CSS, no transform ----

    // ---- Avatar frame — 3D tilt on mouse ----
    const avatarFrame = document.querySelector('.avatar__frame');
    if (avatarFrame && !window.matchMedia('(pointer: coarse)').matches) {
      avatarFrame.addEventListener('mousemove', (e) => {
        const r = avatarFrame.getBoundingClientRect();
        const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -12;
        const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 12;
        gsap.to(avatarFrame, {
          rotateX: rx, rotateY: ry,
          transformPerspective: 600,
          duration: 0.4, ease: 'power2.out',
        });
      }, { passive: true });
      avatarFrame.addEventListener('mouseleave', () => {
        gsap.to(avatarFrame, {
          rotateX: 0, rotateY: 0,
          duration: 0.8, ease: 'elastic.out(1, 0.4)',
        });
      });
    }

    // ---- Marquee items — individual hover glow ----
    document.querySelectorAll('.marquee__track span').forEach((span) => {
      span.addEventListener('mouseenter', () => {
        gsap.to(span, { scale: 1.15, duration: 0.2, ease: 'back.out(2)' });
      });
      span.addEventListener('mouseleave', () => {
        gsap.to(span, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' });
      });
    });

    // ---- Scroll indicator — click to scroll ----
    const scrollIndicator = document.querySelector('.hero__scroll');
    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', () => {
        const aboutEl = document.getElementById('about');
        if (aboutEl) {
          gsap.to(window, {
            scrollTo: aboutEl.offsetTop,
            duration: 1.2,
            ease: 'power3.inOut',
          });
        }
      });
    }

    // ---- Projects heading — word split reveal ----
    const projectsH2 = document.querySelector('.projects__header h2');
    if (projectsH2) {
      ScrollTrigger.create({
        trigger: projectsH2,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.from(projectsH2, {
            opacity: 0,
            y: 50,
            skewY: 3,
            duration: 0.9,
            ease: 'power3.out',
          });
        },
      });
    }

    // ---- Glass card corner accents — scroll reveal ----
    gsap.utils.toArray('.glass-card').forEach((card) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.from(card, {
            borderColor: 'rgba(255,255,255,0)',
            duration: 1,
            ease: 'power2.out',
          });
        },
      });
    });

    // ---- Eyebrow dot — continuous pulse via GSAP ----
    const eyebrowDot = document.querySelector('.eyebrow__dot');
    if (eyebrowDot) {
      gsap.to(eyebrowDot, {
        scale: 1.5,
        opacity: 0.4,
        duration: 1,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    }

    // ---- Status dot — pulse ----
    const statusDot = document.querySelector('.status__dot');
    if (statusDot) {
      gsap.to(statusDot, {
        scale: 1.6,
        opacity: 0.3,
        duration: 0.9,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    }

    // ---- Card image — parallax on scroll ----
    document.querySelectorAll('.card__image-wrap img').forEach((img) => {
      gsap.to(img, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: img,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });

    // ---- Orbs — scroll-driven drift ----
    gsap.to('.orb--1', {
      y: -80, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.5, invalidateOnRefresh: true },
    });
    gsap.to('.orb--2', {
      y: -50, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2, invalidateOnRefresh: true },
    });
    gsap.to('.orb--3', {
      y: -30, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2.5, invalidateOnRefresh: true },
    });

  } // end if (!prefersReduced)
}
