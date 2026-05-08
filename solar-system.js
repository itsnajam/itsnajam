// ============================================================================
// INTERACTIVE SOLAR SYSTEM - Tech Stack Visualization
// ============================================================================

class SolarSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    
    // Mouse interaction
    this.mouse = { x: 0, y: 0, down: false, dragging: null };
    this.setupMouseEvents();
    
    // Center of the solar system
    this.center = { x: 0, y: 0 };
    
    // Planets (tech logos)
    this.planets = this.createPlanets();
    
    // Code particles for connections
    this.codeParticles = [];
    
    // Animation state
    this.time = 0;
    this.paused = false;
    
    // Resize handler
    window.addEventListener('resize', () => this.resize(), { passive: true });
    
    // Start animation
    this.animate();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.center.x = this.canvas.width / 2;
    this.center.y = this.canvas.height / 2;
  }
  
  createPlanets() {
    const techStack = [
      { name: 'Kiro', color: '#7c83fd', size: 35, orbit: 180, speed: 0.3, icon: 'K' },
      { name: 'Claude', color: '#a78bfa', size: 32, orbit: 250, speed: 0.22, icon: 'C' },
      { name: 'GPT', color: '#34d399', size: 30, orbit: 320, speed: 0.18, icon: 'G' },
      { name: 'React', color: '#38bdf8', size: 28, orbit: 140, speed: 0.35, icon: 'R' },
      { name: 'Node', color: '#4ade80', size: 26, orbit: 390, speed: 0.15, icon: 'N' },
      { name: 'Supabase', color: '#f472b6', size: 24, orbit: 210, speed: 0.25, icon: 'S' },
      { name: 'Vercel', color: '#e879f9', size: 22, orbit: 280, speed: 0.2, icon: 'V' },
      { name: 'AWS', color: '#fb923c', size: 26, orbit: 350, speed: 0.16, icon: 'A' },
    ];
    
    return techStack.map((tech, i) => ({
      ...tech,
      angle: (Math.PI * 2 / techStack.length) * i,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      dragging: false,
      pulse: 0,
      codeChars: this.generateCodeChars(tech.name),
    }));
  }
  
  generateCodeChars(name) {
    const chars = 'const{}=></>function()[];import{from}';
    const result = [];
    for (let i = 0; i < 20; i++) {
      result.push({
        char: chars[Math.floor(Math.random() * chars.length)],
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * 15 + 5,
        speed: Math.random() * 0.02 + 0.01,
      });
    }
    return result;
  }
  
  setupMouseEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      
      if (this.mouse.dragging) {
        const planet = this.mouse.dragging;
        planet.x = this.mouse.x;
        planet.y = this.mouse.y;
      }
    }, { passive: true });
    
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      // Check if clicking on a planet
      for (const planet of this.planets) {
        const dx = planet.x - mx;
        const dy = planet.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < planet.size) {
          this.mouse.dragging = planet;
          planet.dragging = true;
          this.paused = true;
          break;
        }
      }
    });
    
    this.canvas.addEventListener('mouseup', () => {
      if (this.mouse.dragging) {
        this.mouse.dragging.dragging = false;
        this.mouse.dragging = null;
        this.paused = false;
      }
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      if (this.mouse.dragging) {
        this.mouse.dragging.dragging = false;
        this.mouse.dragging = null;
        this.paused = false;
      }
    });
    
    // Click to spawn code particles
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      this.spawnCodeBurst(mx, my);
    });
  }
  
  spawnCodeBurst(x, y) {
    const chars = 'const{}=></>function()[];import{from}01';
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 / 30) * i;
      const speed = Math.random() * 3 + 2;
      this.codeParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        char: chars[Math.floor(Math.random() * chars.length)],
        life: 1,
        size: Math.random() * 12 + 8,
        color: ['#7c83fd', '#a78bfa', '#38bdf8', '#34d399'][Math.floor(Math.random() * 4)],
      });
    }
  }
  
  updatePlanets() {
    if (!this.paused) {
      this.time += 0.016;
    }
    
    for (const planet of this.planets) {
      if (!planet.dragging) {
        // Orbital motion
        planet.angle += planet.speed * 0.01;
        planet.x = this.center.x + Math.cos(planet.angle) * planet.orbit;
        planet.y = this.center.y + Math.sin(planet.angle) * planet.orbit;
      }
      
      // Pulse animation
      planet.pulse = Math.sin(this.time * 2 + planet.angle) * 0.2 + 1;
      
      // Update code chars around planet
      for (const code of planet.codeChars) {
        code.angle += code.speed;
      }
    }
  }
  
  drawConnections() {
    const maxDist = 400;
    
    for (let i = 0; i < this.planets.length; i++) {
      for (let j = i + 1; j < this.planets.length; j++) {
        const p1 = this.planets[i];
        const p2 = this.planets[j];
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < maxDist) {
          const strength = 1 - dist / maxDist;
          
          // Draw code line
          this.drawCodeLine(p1, p2, strength);
          
          // Draw energy pulse
          const t = (Math.sin(this.time * 2 + i + j) + 1) / 2;
          const px = p1.x + dx * t;
          const py = p1.y + dy * t;
          
          this.ctx.beginPath();
          this.ctx.arc(px, py, strength * 3, 0, Math.PI * 2);
          const grad = this.ctx.createRadialGradient(px, py, 0, px, py, strength * 6);
          grad.addColorStop(0, `rgba(255, 255, 255, ${strength * 0.8})`);
          grad.addColorStop(1, `rgba(124, 131, 253, 0)`);
          this.ctx.fillStyle = grad;
          this.ctx.fill();
        }
      }
    }
  }
  
  drawCodeLine(p1, p2, strength) {
    const chars = 'const{}=></>function()[];';
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(dist / 20);
    
    this.ctx.save();
    this.ctx.globalAlpha = strength * 0.4;
    this.ctx.font = '10px "JetBrains Mono", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = p1.x + dx * t;
      const y = p1.y + dy * t;
      const char = chars[Math.floor((this.time * 10 + i) % chars.length)];
      
      // Gradient color between planets
      const r1 = parseInt(p1.color.slice(1, 3), 16);
      const g1 = parseInt(p1.color.slice(3, 5), 16);
      const b1 = parseInt(p1.color.slice(5, 7), 16);
      const r2 = parseInt(p2.color.slice(1, 3), 16);
      const g2 = parseInt(p2.color.slice(3, 5), 16);
      const b2 = parseInt(p2.color.slice(5, 7), 16);
      
      const r = Math.floor(r1 + (r2 - r1) * t);
      const g = Math.floor(g1 + (g2 - g1) * t);
      const b = Math.floor(b1 + (b2 - b1) * t);
      
      this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      this.ctx.fillText(char, x, y);
    }
    
    this.ctx.restore();
  }
  
  drawPlanet(planet) {
    const size = planet.size * planet.pulse;
    
    // Outer glow
    const glowGrad = this.ctx.createRadialGradient(
      planet.x, planet.y, 0,
      planet.x, planet.y, size * 3
    );
    glowGrad.addColorStop(0, planet.color + '40');
    glowGrad.addColorStop(0.5, planet.color + '20');
    glowGrad.addColorStop(1, planet.color + '00');
    
    this.ctx.beginPath();
    this.ctx.arc(planet.x, planet.y, size * 3, 0, Math.PI * 2);
    this.ctx.fillStyle = glowGrad;
    this.ctx.fill();
    
    // Planet body
    const planetGrad = this.ctx.createRadialGradient(
      planet.x - size * 0.3, planet.y - size * 0.3, 0,
      planet.x, planet.y, size
    );
    planetGrad.addColorStop(0, planet.color + 'ff');
    planetGrad.addColorStop(0.7, planet.color + 'cc');
    planetGrad.addColorStop(1, planet.color + '88');
    
    this.ctx.beginPath();
    this.ctx.arc(planet.x, planet.y, size, 0, Math.PI * 2);
    this.ctx.fillStyle = planetGrad;
    this.ctx.fill();
    
    // Icon/Letter
    this.ctx.save();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold ${size * 0.8}px "Inter", sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(planet.icon, planet.x, planet.y);
    this.ctx.restore();
    
    // Orbiting code characters
    this.ctx.save();
    this.ctx.globalAlpha = 0.6;
    this.ctx.font = '9px "JetBrains Mono", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = planet.color;
    
    for (const code of planet.codeChars) {
      const x = planet.x + Math.cos(code.angle) * (size + code.distance);
      const y = planet.y + Math.sin(code.angle) * (size + code.distance);
      this.ctx.fillText(code.char, x, y);
    }
    
    this.ctx.restore();
    
    // Planet name on hover
    const dx = this.mouse.x - planet.x;
    const dy = this.mouse.y - planet.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < size * 2) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(5, 5, 16, 0.9)';
      this.ctx.strokeStyle = planet.color;
      this.ctx.lineWidth = 2;
      
      const padding = 8;
      const textWidth = this.ctx.measureText(planet.name).width;
      const boxWidth = textWidth + padding * 2;
      const boxHeight = 24;
      const boxX = planet.x - boxWidth / 2;
      const boxY = planet.y - size - 35;
      
      this.ctx.beginPath();
      this.ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.fillStyle = planet.color;
      this.ctx.font = '12px "Inter", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(planet.name, planet.x, boxY + boxHeight / 2);
      this.ctx.restore();
    }
    
    // Orbit path (faint)
    if (!planet.dragging) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.1;
      this.ctx.strokeStyle = planet.color;
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.arc(this.center.x, this.center.y, planet.orbit, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }
  
  updateCodeParticles() {
    for (let i = this.codeParticles.length - 1; i >= 0; i--) {
      const p = this.codeParticles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.life -= 0.02;
      
      if (p.life <= 0) {
        this.codeParticles.splice(i, 1);
      }
    }
  }
  
  drawCodeParticles() {
    this.ctx.save();
    this.ctx.font = '12px "JetBrains Mono", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    for (const p of this.codeParticles) {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.fillText(p.char, p.x, p.y);
    }
    
    this.ctx.restore();
  }
  
  drawCenter() {
    // Central sun/core
    const coreSize = 50;
    const pulse = Math.sin(this.time * 2) * 0.2 + 1;
    
    // Outer glow
    const glowGrad = this.ctx.createRadialGradient(
      this.center.x, this.center.y, 0,
      this.center.x, this.center.y, coreSize * 4 * pulse
    );
    glowGrad.addColorStop(0, 'rgba(124, 131, 253, 0.3)');
    glowGrad.addColorStop(0.5, 'rgba(167, 139, 250, 0.15)');
    glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    
    this.ctx.beginPath();
    this.ctx.arc(this.center.x, this.center.y, coreSize * 4 * pulse, 0, Math.PI * 2);
    this.ctx.fillStyle = glowGrad;
    this.ctx.fill();
    
    // Core
    const coreGrad = this.ctx.createRadialGradient(
      this.center.x, this.center.y, 0,
      this.center.x, this.center.y, coreSize * pulse
    );
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, '#7c83fd');
    coreGrad.addColorStop(1, '#a78bfa');
    
    this.ctx.beginPath();
    this.ctx.arc(this.center.x, this.center.y, coreSize * pulse, 0, Math.PI * 2);
    this.ctx.fillStyle = coreGrad;
    this.ctx.fill();
    
    // Rotating rings
    for (let i = 0; i < 3; i++) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.3;
      this.ctx.strokeStyle = '#7c83fd';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([10, 10]);
      this.ctx.translate(this.center.x, this.center.y);
      this.ctx.rotate(this.time * (i % 2 === 0 ? 1 : -1) * 0.5);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, coreSize + i * 15, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update
    this.updatePlanets();
    this.updateCodeParticles();
    
    // Draw
    this.drawCenter();
    this.drawConnections();
    
    for (const planet of this.planets) {
      this.drawPlanet(planet);
    }
    
    this.drawCodeParticles();
    
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SolarSystem('solar-system');
  });
} else {
  new SolarSystem('solar-system');
}
