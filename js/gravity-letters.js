/**
 * Gravity Letters — High-Performance HTML5 Canvas Particle-Sand Headline
 * React Bits Pro Architecture (Self-Contained & 100% Reliable)
 *
 * Features:
 * - Line 1: "Empowering Beneficiaries" in pure bright white (#FFFFFF)
 * - Line 2: "with Intelligent Access" in Electric Indigo to Cyan gradient (#818CF8 -> #38BDF8)
 * - Interactive slice & sand scatter on mouse swipe/drag
 * - Click-to-collapse / explode & smooth spring rebuild
 * - Guaranteed visible CSS fallback while loading and if particles count is 0
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GravityLetters = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function hexToRgb(hex) {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function interpolateColor(hex1, hex2, factor) {
    const t = Math.max(0, Math.min(1, factor));
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  class GravityLetters {
    constructor(container, options = {}) {
      if (!container) return;
      this.container = container;
      this.options = Object.assign(
        {
          line1: "Empowering Beneficiaries",
          line2: "with Intelligent Access",
          fontSize: 84,
          fontWeight: 800,
          fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          lineHeight: 1.15,
          color1: "#FFFFFF",
          color2Start: "#1E1B4B",
          color2End: "#3730A3",
          grainStep: 2.6, // fine high-resolution LED matrix sand
          cutRadius: 52,
          healDelay: 1300,
          holdTime: 700,
        },
        options
      );

      this.particles = [];
      this.animId = null;
      this.destroyed = false;
      this.isSleeping = false;
      this.isIntersecting = true;
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      this.mouse = {
        x: -9999,
        y: -9999,
        vx: 0,
        vy: 0,
        lastX: -9999,
        lastY: -9999,
        isDown: false,
        lastMove: 0
      };

      this.init();
    }

    init() {
      // Find fallback heading element
      this.fallback = this.container.querySelector('.hero-headline-canvas-fallback, #heroFallbackHeadline');

      // Create primary interactive HTML5 canvas
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'gravity-letters-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      this.canvas.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:auto;z-index:5;cursor:crosshair;';
      this.ctx = this.canvas.getContext('2d');

      this.container.style.position = 'relative';
      this.container.appendChild(this.canvas);

      // Event listeners for slicing and click interactions
      this.bindEvents();

      // IntersectionObserver for pausing particle loop when hero scrolls away
      if (typeof IntersectionObserver !== 'undefined') {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isIntersecting = entry.isIntersecting;
            if (this.isIntersecting) {
              this.wakeUp();
            } else if (this.animId) {
              cancelAnimationFrame(this.animId);
              this.animId = null;
            }
          });
        }, { rootMargin: '100px' });
        this.observer.observe(this.container);
      }

      // Ensure fonts are loaded before sampling text pixels
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (!this.destroyed) this.setupScene();
        });
      } else {
        setTimeout(() => {
          if (!this.destroyed) this.setupScene();
        }, 150);
      }

      // Resize observer
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          if (!this.destroyed) this.handleResize();
        });
        this.resizeObserver.observe(this.container);
      } else {
        window.addEventListener('resize', () => this.handleResize());
      }
    }

    bindEvents() {
      const getPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      };

      const onPointerMove = (e) => {
        const pos = getPos(e);
        const now = performance.now();
        const dt = Math.max(1, now - (this.mouse.lastMove || now));

        this.mouse.vx = (pos.x - (this.mouse.lastX === -9999 ? pos.x : this.mouse.lastX)) / (dt / 16.6);
        this.mouse.vy = (pos.y - (this.mouse.lastY === -9999 ? pos.y : this.mouse.lastY)) / (dt / 16.6);

        this.mouse.x = pos.x;
        this.mouse.y = pos.y;
        this.mouse.lastX = pos.x;
        this.mouse.lastY = pos.y;
        this.mouse.lastMove = now;

        this.wakeUp();
        this.sliceParticles(pos.x, pos.y, this.mouse.vx, this.mouse.vy);
      };

      const onPointerDown = (e) => {
        this.mouse.isDown = true;
        this.wakeUp();
        const pos = getPos(e);
        this.explodeParticles(pos.x, pos.y);
      };

      const onPointerUp = () => {
        this.mouse.isDown = false;
        this.wakeUp();
      };

      const onPointerLeave = () => {
        this.mouse.x = -9999;
        this.mouse.y = -9999;
        this.mouse.lastX = -9999;
        this.mouse.lastY = -9999;
        this.mouse.isDown = false;
      };

      this.canvas.addEventListener('mousemove', onPointerMove, { passive: true });
      this.canvas.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mouseup', onPointerUp);
      this.canvas.addEventListener('mouseleave', onPointerLeave);

      this.canvas.addEventListener('touchmove', onPointerMove, { passive: true });
      this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchend', onPointerUp);
    }

    wakeUp() {
      if (this.destroyed || !this.isIntersecting) return;
      if (this.isSleeping || !this.animId) {
        this.isSleeping = false;
        this.animId = requestAnimationFrame(this.tick);
      }
    }

    sliceParticles(mx, my, vx, vy) {
      if (!this.particles.length) return;
      this.wakeUp();
      const radius = this.options.cutRadius;
      const radiusSq = radius * radius;
      const speed = Math.hypot(vx, vy);
      const forceMag = Math.min(speed * 0.45 + 3.5, 14);
      const now = performance.now();

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const dx = p.x - mx;
        const dy = p.y - my;
        const distSq = dx * dx + dy * dy;

        if (distSq < radiusSq) {
          const dist = Math.sqrt(distSq) || 1;
          const normalX = dx / dist;
          const normalY = dy / dist;
          const factor = (1 - dist / radius);

          p.vx += (normalX * forceMag + vx * 0.25) * factor;
          p.vy += (normalY * forceMag + vy * 0.25 + 1.2) * factor; // push away + slight downward drift
          p.state = 'loose';
          p.rebuildTimer = now + this.options.healDelay + Math.random() * 400;
        }
      }
    }

    explodeParticles(originX, originY) {
      if (!this.particles.length) return;
      this.wakeUp();
      const now = performance.now();

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const dx = p.x - originX;
        const dy = p.y - originY;
        const dist = Math.hypot(dx, dy) || 1;
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.4;
        const force = Math.max(4, 18 - dist * 0.025) + Math.random() * 8;

        p.vx = Math.cos(angle) * force;
        p.vy = Math.sin(angle) * force + (Math.random() * 5 + 2); // gravity drop
        p.state = 'loose';
        p.rebuildTimer = now + this.options.holdTime + Math.random() * 600;
      }
    }

    handleResize() {
      const rect = this.container.getBoundingClientRect();
      if (rect.width !== this.width || rect.height !== this.height) {
        this.setupScene();
      }
    }

    setupScene() {
      const rect = this.container.getBoundingClientRect();
      const w = Math.max(rect.width, 320);
      const h = Math.max(rect.height, 180);

      this.width = w;
      this.height = h;

      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.floor(w * this.dpr);
      this.canvas.height = Math.floor(h * this.dpr);
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';

      this.ctx.scale(this.dpr, this.dpr);

      this.sampleTextAndBuildParticles();
    }

    sampleTextAndBuildParticles() {
      const w = this.width;
      const h = this.height;
      if (w <= 0 || h <= 0) return;

      // Offscreen canvas for crisp pixel sampling
      const offCanvas = document.createElement('canvas');
      offCanvas.width = Math.floor(w);
      offCanvas.height = Math.floor(h);
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;

      // Responsive font size calculation (up to 86px for prominent bold hero display)
      const maxRequestedSize = this.options.fontSize || 84;
      let fontSize = Math.min(maxRequestedSize, Math.max(38, Math.floor(w / 14)));
      const lineHeight = fontSize * this.options.lineHeight;
      const fontFamily = this.options.fontFamily;
      const fontWeight = this.options.fontWeight;

      offCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';

      const line1 = this.options.line1;
      const line2 = this.options.line2;

      // Verify bounds fit within container
      const m1 = offCtx.measureText(line1).width;
      const m2 = offCtx.measureText(line2).width;
      const maxTextWidth = Math.max(m1, m2);
      if (maxTextWidth > w * 0.95) {
        fontSize = Math.floor(fontSize * ((w * 0.95) / maxTextWidth));
        offCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      }

      const centerY = h / 2;
      const y1 = Math.round(centerY - (lineHeight * 0.52));
      const y2 = Math.round(centerY + (lineHeight * 0.52));
      const centerX = Math.round(w / 2);

      // Render Line 1 in pure white
      offCtx.fillStyle = '#FFFFFF';
      offCtx.fillText(line1, centerX, y1);

      // Render Line 2 in pure white for high-contrast pixel detection
      offCtx.fillText(line2, centerX, y2);

      const imgData = offCtx.getImageData(0, 0, w, h).data;
      const step = this.options.grainStep;
      const newParticles = [];

      // Calculate Line 2 horizontal bounds for gradient interpolation
      const line2Left = centerX - (m2 / 2);
      const line2Right = centerX + (m2 / 2);
      const line2Span = Math.max(line2Right - line2Left, 10);

      for (let y = 2; y < h - 2; y += step) {
        for (let x = 2; x < w - 2; x += step) {
          const px = Math.floor(x);
          const py = Math.floor(y);
          const idx = (py * w + px) * 4;
          const alpha = imgData[idx + 3];

          // Sample threshold
          if (alpha > 48) {
            const isLine1 = py < centerY;
            let color, glowColor;

            if (isLine1) {
              color = this.options.color1 || '#FFFFFF';
              glowColor = 'rgba(255, 255, 255, 0.45)';
            } else {
              const factor = (px - line2Left) / line2Span;
              color = interpolateColor(this.options.color2Start || '#1E1B4B', this.options.color2End || '#3730A3', factor);
              glowColor = 'rgba(79, 70, 229, 0.5)';
            }

            newParticles.push({
              homeX: px,
              homeY: py,
              x: px,
              y: py,
              vx: 0,
              vy: 0,
              color: color,
              glowColor: glowColor,
              size: (step * 0.52) + (Math.random() * 0.3),
              alpha: 0.92 + Math.random() * 0.08,
              isLine1: isLine1,
              state: 'resting',
              rebuildTimer: 0
            });
          }
        }
      }

      // CRITICAL FALLBACK CHECK:
      // If sampling returned 0 particles, KEEP the fallback headline visible.
      // If sampling succeeded, hide the fallback smoothly so only the interactive sand renders!
      if (newParticles.length === 0) {
        console.warn('[GravityLetters] 0 particles sampled; maintaining visible fallback headline.');
        if (this.fallback) {
          this.fallback.style.opacity = '1';
          this.fallback.style.display = 'flex';
          this.fallback.style.visibility = 'visible';
        }
        if (this.canvas) {
          this.canvas.style.display = 'none';
        }
        return;
      }

      this.particles = newParticles;

      // Particles ready: cleanly hide the fallback so only the crisp particle sand renders
      if (this.fallback) {
        this.fallback.style.display = 'none';
        this.fallback.style.opacity = '0';
        this.fallback.style.visibility = 'hidden';
        this.fallback.style.pointerEvents = 'none';
      }
      if (this.canvas) {
        this.canvas.style.display = 'block';
      }

      // Start animation loop
      if (!this.animId) {
        this.tick = this.tick.bind(this);
        this.animId = requestAnimationFrame(this.tick);
      }
    }

    tick() {
      if (this.destroyed || !this.isIntersecting) return;

      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const now = performance.now();
      const gravity = 0.26;
      const friction = 0.94;

      ctx.clearRect(0, 0, w, h);

      let hasActive = false;

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        if (p.state === 'loose') {
          hasActive = true;
          p.vy += gravity;
          p.vx *= friction;
          p.vy *= friction;
          p.x += p.vx;
          p.y += p.vy;

          // Floor bounce
          if (p.y > h - 8) {
            p.y = h - 8;
            p.vy = -p.vy * 0.28;
            p.vx *= 0.88;
          }

          // Screen horizontal bounds
          if (p.x < 4) { p.x = 4; p.vx = -p.vx * 0.3; }
          if (p.x > w - 4) { p.x = w - 4; p.vx = -p.vx * 0.3; }

          if (now > p.rebuildTimer) {
            p.state = 'rebuilding';
          }
        } else if (p.state === 'rebuilding') {
          hasActive = true;
          const dx = p.homeX - p.x;
          const dy = p.homeY - p.y;
          const dist = Math.hypot(dx, dy);

          p.vx += dx * 0.12;
          p.vy += dy * 0.12;
          p.vx *= 0.78;
          p.vy *= 0.78;

          p.x += p.vx;
          p.y += p.vy;

          if (dist < 0.65 && Math.hypot(p.vx, p.vy) < 0.25) {
            p.x = p.homeX;
            p.y = p.homeY;
            p.vx = 0;
            p.vy = 0;
            p.state = 'resting';
          }
        }

        // Draw particle sand grain with glowing energy trails for sliced/loose particles
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;

        if (p.state === 'loose' || p.state === 'rebuilding') {
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }

        // Draw fine round sand grain
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      // When all particles settle and no user interaction, sleep loop to save 100% CPU
      if (!hasActive && !this.mouse.isDown) {
        this.isSleeping = true;
        this.animId = null;
        return;
      }

      this.animId = requestAnimationFrame(this.tick);
    }

    destroy() {
      this.destroyed = true;
      if (this.animId) cancelAnimationFrame(this.animId);
      if (this.observer) this.observer.disconnect();
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  // Global exposure
  if (typeof window !== 'undefined') {
    window.GravityLettersEngine = GravityLetters;
    window.GravityLetters = GravityLetters;
  }

  return GravityLetters;
});
