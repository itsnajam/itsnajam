// ============================================================================
// HERO HOLOGRAPHIC GRID + FLOATING CHIPS — GSAP-powered futuristic animation
// ============================================================================

(function () {
  'use strict';

  // ── Holographic Grid Canvas ──────────────────────────────────────────────
  const holoCanvas = document.getElementById('hero-holo-grid');
  if (!holoCanvas || !holoCanvas.getContext) return;

  const ctx = holoCanvas.getContext('2d');
  let W, H, mouseX = 0, mouseY = 0, targetTiltX = 0, targetTiltY = 0;
  let tiltX = 0, tiltY = 0;
  let time = 0;
  let ripples = [];

  function resize() {
    W = holoCanvas.width = window.innerWidth;
    H = holoCanvas.height = window.innerHeight;
    mouseX = W / 2;
    mouseY = H / 2;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Mouse tracking on hero section
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    heroEl.addEventListener('mousemove', (e) => {
      const r = heroEl.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
      targetTiltX = ((mouseY / H) - 0.5) * 18;
      targetTiltY = ((mouseX / W) - 0.5) * -18;
    }, { passive: true });

    heroEl.addEventListener('mouseleave', () => {
      targetTiltX = 0;
      targetTiltY = 0;
    }, { passive: true });

    // Click: spawn ripple
    heroEl.addEventListener('click', (e) => {
      const r = heroEl.getBoundingClientRect();
      ripples.push({
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        radius: 0,
        maxRadius: Math.max(W, H) * 0.6,
        life: 1,
      });
    });
  }

  // ── Grid drawing ─────────────────────────────────────────────────────────
  function drawHoloGrid() {
    ctx.clearRect(0, 0, W, H);

    // Smooth tilt lerp
    tiltX += (targetTiltX - tiltX) * 0.06;
    tiltY += (targetTiltY - tiltY) * 0.06;

    const COLS = 24;
    const ROWS = 14;
    const cellW = W / COLS;
    const cellH = H / ROWS;

    // Perspective vanishing point follows mouse
    const vpX = mouseX;
    const vpY = mouseY;

    ctx.save();

    // Draw grid lines with perspective warp
    for (let col = 0; col <= COLS; col++) {
      const x = col * cellW;
      const distFromMouse = Math.abs(x - vpX) / W;
      const warpY = Math.sin(time * 0.8 + col * 0.4) * 12 * (1 - distFromMouse);

      const alpha = 0.06 + 0.04 * Math.sin(time * 0.5 + col * 0.3);
      const grad = ctx.createLinearGradient(x, 0, x, H);
      grad.addColorStop(0, `rgba(124,131,253,0)`);
      grad.addColorStop(0.3, `rgba(124,131,253,${alpha})`);
      grad.addColorStop(0.7, `rgba(167,139,250,${alpha * 1.3})`);
      grad.addColorStop(1, `rgba(56,189,248,0)`);

      ctx.beginPath();
      ctx.moveTo(x + tiltY * (0 - vpY) / H * 0.5, warpY);
      ctx.lineTo(x + tiltY * (H - vpY) / H * 0.5, H + warpY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = col % 4 === 0 ? 1.5 : 0.5;
      ctx.stroke();
    }

    for (let row = 0; row <= ROWS; row++) {
      const y = row * cellH;
      const distFromMouse = Math.abs(y - vpY) / H;
      const warpX = Math.sin(time * 0.6 + row * 0.5) * 8 * (1 - distFromMouse);

      const alpha = 0.06 + 0.04 * Math.sin(time * 0.4 + row * 0.4);
      const grad = ctx.createLinearGradient(0, y, W, y);
      grad.addColorStop(0, `rgba(56,189,248,0)`);
      grad.addColorStop(0.3, `rgba(124,131,253,${alpha})`);
      grad.addColorStop(0.7, `rgba(167,139,250,${alpha * 1.3})`);
      grad.addColorStop(1, `rgba(56,189,248,0)`);

      ctx.beginPath();
      ctx.moveTo(warpX, y + tiltX * (0 - vpX) / W * 0.5);
      ctx.lineTo(W + warpX, y + tiltX * (W - vpX) / W * 0.5);
      ctx.strokeStyle = grad;
      ctx.lineWidth = row % 3 === 0 ? 1.5 : 0.5;
      ctx.stroke();
    }

    // Intersection node dots
    for (let col = 0; col <= COLS; col += 4) {
      for (let row = 0; row <= ROWS; row += 3) {
        const x = col * cellW;
        const y = row * cellH;
        const dx = x - mouseX;
        const dy = y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / 300);
        const pulse = 0.3 + 0.7 * Math.sin(time * 2 + col * 0.7 + row * 0.5);
        const r = (1.5 + proximity * 4) * pulse;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,131,253,${0.15 + proximity * 0.6})`;
        ctx.fill();

        if (proximity > 0.3) {
          ctx.beginPath();
          ctx.arc(x, y, r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(124,131,253,${proximity * 0.12})`;
          ctx.fill();
        }
      }
    }

    // Ripple waves on click
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.radius += (rip.maxRadius - rip.radius) * 0.04 + 4;
      rip.life -= 0.018;
      if (rip.life <= 0) { ripples.splice(i, 1); continue; }

      for (let ring = 0; ring < 3; ring++) {
        const ringR = rip.radius * (1 - ring * 0.12);
        const ringAlpha = rip.life * (0.4 - ring * 0.12);
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(124,131,253,${ringAlpha})`;
        ctx.lineWidth = 2 - ring * 0.5;
        ctx.stroke();
      }

      // Radial lines burst
      const lineCount = 12;
      for (let l = 0; l < lineCount; l++) {
        const angle = (Math.PI * 2 / lineCount) * l;
        const innerR = rip.radius * 0.3;
        const outerR = rip.radius * 0.85;
        ctx.beginPath();
        ctx.moveTo(rip.x + Math.cos(angle) * innerR, rip.y + Math.sin(angle) * innerR);
        ctx.lineTo(rip.x + Math.cos(angle) * outerR, rip.y + Math.sin(angle) * outerR);
        ctx.strokeStyle = `rgba(167,139,250,${rip.life * 0.25})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Scanning beam
    const scanX = ((Math.sin(time * 0.3) + 1) / 2) * W;
    const scanGrad = ctx.createLinearGradient(scanX - 60, 0, scanX + 60, 0);
    scanGrad.addColorStop(0, 'rgba(124,131,253,0)');
    scanGrad.addColorStop(0.5, 'rgba(124,131,253,0.08)');
    scanGrad.addColorStop(1, 'rgba(124,131,253,0)');
    ctx.fillRect(scanX - 60, 0, 120, H);
    ctx.fillStyle = scanGrad;
    ctx.fillRect(scanX - 60, 0, 120, H);

    ctx.restore();

    time += 0.016;
    requestAnimationFrame(drawHoloGrid);
  }

  drawHoloGrid();

  // ── Floating Tech Chips — GSAP ────────────────────────────────────────────
  if (typeof gsap === 'undefined') return;

  const chips = document.querySelectorAll('.hero__chip');
  if (!chips.length) return;

  // Position chips in a scattered ring around the hero content
  const positions = [
    { x: '-42vw', y: '-28vh' },
    { x: '38vw',  y: '-32vh' },
    { x: '-46vw', y: '5vh'   },
    { x: '44vw',  y: '8vh'   },
    { x: '-35vw', y: '30vh'  },
    { x: '36vw',  y: '28vh'  },
    { x: '-18vw', y: '-38vh' },
    { x: '20vw',  y: '-36vh' },
    { x: '-50vw', y: '-12vh' },
    { x: '48vw',  y: '-15vh' },
  ];

  chips.forEach((chip, i) => {
    const pos = positions[i % positions.length];
    gsap.set(chip, {
      x: pos.x,
      y: pos.y,
      opacity: 0,
      scale: 0,
    });
  });

  // Entrance animation — staggered pop-in after hero text
  gsap.to(chips, {
    opacity: 1,
    scale: 1,
    duration: 0.6,
    stagger: { each: 0.08, from: 'random' },
    ease: 'back.out(2)',
    delay: 2.0,
  });

  // Continuous float animation per chip
  chips.forEach((chip, i) => {
    const depth = parseFloat(chip.dataset.depth) || 0.5;
    const duration = 3.5 + depth * 3;
    const yAmt = 12 + depth * 18;

    gsap.to(chip, {
      y: `+=${yAmt}`,
      duration,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * 0.3,
    });

    gsap.to(chip, {
      rotation: (Math.random() - 0.5) * 12,
      duration: duration * 1.3,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * 0.2,
    });
  });

  // Mouse parallax on chips
  if (!window.matchMedia('(pointer: coarse)').matches && heroEl) {
    heroEl.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      chips.forEach((chip) => {
        const depth = parseFloat(chip.dataset.depth) || 0.5;
        const strength = depth * 35;
        gsap.to(chip, {
          xPercent: dx * strength,
          yPercent: dy * strength,
          duration: 1.2,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    }, { passive: true });

    heroEl.addEventListener('mouseleave', () => {
      chips.forEach((chip) => {
        gsap.to(chip, {
          xPercent: 0,
          yPercent: 0,
          duration: 1.8,
          ease: 'elastic.out(1, 0.5)',
          overwrite: 'auto',
        });
      });
    });
  }

  // Chip hover — magnetic snap + glow
  chips.forEach((chip) => {
    chip.addEventListener('mouseenter', () => {
      gsap.to(chip, {
        scale: 1.25,
        duration: 0.3,
        ease: 'back.out(2)',
        overwrite: 'auto',
      });
    });
    chip.addEventListener('mouseleave', () => {
      gsap.to(chip, {
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)',
        overwrite: 'auto',
      });
    });
  });

  // ── Hero name scramble on load ────────────────────────────────────────────
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';

  function scrambleText(el, finalText, duration, delay) {
    duration = duration || 1200;
    delay = delay || 0;
    const chars = finalText.split('');
    let frame = 0;
    const totalFrames = Math.floor(duration / 16);

    setTimeout(function () {
      const interval = setInterval(function () {
        frame++;
        const progress = frame / totalFrames;
        const revealedCount = Math.floor(progress * chars.length);

        // Update each .char span if they exist, otherwise set textContent
        const charSpans = el.querySelectorAll('.char');
        if (charSpans.length) {
          charSpans.forEach(function (span, i) {
            const ch = chars[i];
            if (ch === undefined || ch === ' ') {
              span.innerHTML = '&nbsp;';
            } else if (i < revealedCount) {
              span.textContent = ch;
            } else {
              span.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            }
          });
        } else {
          el.textContent = chars.map(function (ch, i) {
            if (ch === ' ') return ' ';
            if (i < revealedCount) return ch;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }).join('');
        }

        if (frame >= totalFrames) {
          clearInterval(interval);
          // Restore final text cleanly
          if (el.querySelectorAll('.char').length) {
            el.querySelectorAll('.char').forEach(function (span, i) {
              const ch = chars[i];
              if (ch === ' ') span.innerHTML = '&nbsp;';
              else span.textContent = ch || '';
            });
          } else {
            el.textContent = finalText;
          }
        }
      }, 16);
    }, delay);
  }

  // Capture original text BEFORE GSAP splits the lines into .char spans
  // We read from the DOM immediately (hero-animation.js runs before main.js GSAP timeline)
  const nameLines = document.querySelectorAll('.hero__name-line');
  nameLines.forEach(function (line, i) {
    // Store the clean text right now, before any manipulation
    const original = line.textContent.trim();
    line.dataset.original = original;
    // Only scramble the first line (glitch) — accent line uses gradient clip which breaks on char spans
    if (line.classList.contains('hero__name-line--glitch')) {
      scrambleText(line, original, 1000, 600 + i * 350);
    }
  });

  // Re-scramble first line only on hover
  nameLines.forEach(function (line) {
    if (!line.classList.contains('hero__name-line--glitch')) return;
    line.addEventListener('mouseenter', function () {
      const original = line.dataset.original || line.textContent.trim();
      scrambleText(line, original, 600, 0);
    });
  });

})();
