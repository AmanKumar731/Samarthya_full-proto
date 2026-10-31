/**
 * ==========================================================================
 * SAMARTHYA AI — REUSABLE MOTION & INTERACTION ENGINE
 * GSAP 3 + ScrollTrigger Architecture, Opportunity Field, Velocity Tracking,
 * Text Splitting, Magnetic Physics & Custom Cursor
 * ==========================================================================
 */

(function (window, document) {
  'use strict';

  const MotionEngine = {
    isReady: false,
    scrollVelocity: 0,
    lastScrollY: 0,
    lastScrollTime: Date.now(),
    isTouch: false,
    reducedMotion: false,
    setOpportunityFieldTheme(theme) {},

    init() {
      if (this.isReady) return;

      this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Register GSAP ScrollTrigger if present
      if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }

      this.setupVelocityTracker();
      this.initOpportunityField();
      this.initMagneticButtons();

      this.isReady = true;
    },

    /* ==========================================================================
       1. VELOCITY TRACKER
       ========================================================================== */
    setupVelocityTracker() {
      let timeout;
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const now = Date.now();
            const currentY = window.pageYOffset || document.documentElement.scrollTop;
            const dt = Math.max(10, now - this.lastScrollTime);
            const dy = currentY - this.lastScrollY;

            // Instant velocity in px/ms
            this.scrollVelocity = Math.min(Math.abs(dy / dt) * 15, 60);

            this.lastScrollY = currentY;
            this.lastScrollTime = now;
            ticking = false;
          });
          ticking = true;
        }

        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.scrollVelocity = 0;
        }, 120);
      }, { passive: true });
    },

    /* ==========================================================================
       2. REUSABLE TEXT SPLITTER (Pure Vanilla Vanilla DOM, Zero Dependencies)
       ========================================================================== */
    splitText(element, mode = 'words') {
      if (!element || element.dataset.split) return;
      const text = element.textContent.trim();
      element.innerHTML = '';
      element.dataset.split = 'true';

      if (mode === 'words') {
        const words = text.split(/\s+/);
        words.forEach((w, idx) => {
          const span = document.createElement('span');
          span.className = 'split-word';
          span.style.display = 'inline-block';
          span.style.overflow = 'hidden';
          span.style.verticalAlign = 'top';
          span.innerHTML = `<span class="split-word-inner" style="display:inline-block">${w}</span>`;
          element.appendChild(span);
          if (idx < words.length - 1) {
            element.appendChild(document.createTextNode(' '));
          }
        });
      } else if (mode === 'chars') {
        const chars = text.split('');
        chars.forEach((c) => {
          const span = document.createElement('span');
          span.className = 'split-char';
          span.style.display = 'inline-block';
          span.innerHTML = c === ' ' ? '&nbsp;' : c;
          element.appendChild(span);
        });
      }
    },

    /* ==========================================================================
       3. OPPORTUNITY FIELD (3D Depth Canvas, Connecting Lines, Reactive Velocity)
       ========================================================================== */
    initOpportunityField() {
      const canvas = document.getElementById('opportunity-field-canvas');
      if (!canvas) return;

      const style = window.getComputedStyle(canvas);
      if (style.display === 'none' || canvas.offsetParent === null) {
        // Canvas is hidden via CSS - avoid wasting CPU/GPU running 3D projection loop
        return;
      }

      const ctx = canvas.getContext('2d', { alpha: true });
      let width, height;
      let mouseX = 0, mouseY = 0;
      let targetMouseX = 0, targetMouseY = 0;

      const NODE_COUNT = this.isTouch ? 28 : 55;
      const NODES = [];
      const FOV = 360;

      // Color palette signals
      const COLORS = {
        welfare: { r: 0, g: 217, b: 166 },   // #00D9A6
        cyan: { r: 0, g: 229, b: 255 },   // #00E5FF
        credit: { r: 230, g: 168, b: 74 },  // #E6A84A
        neutral: { r: 245, g: 247, b: 250 }  // #F5F7FA
      };

      let currentColor = COLORS.welfare;
      let targetColor = COLORS.welfare;

      const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize, { passive: true });

      // Initialize 3D points
      for (let i = 0; i < NODE_COUNT; i++) {
        NODES.push({
          x: (Math.random() - 0.5) * 1400,
          y: (Math.random() - 0.5) * 1100,
          z: (Math.random() - 0.5) * 800,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          vz: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 2.2 + 1.2,
          pulse: Math.random() * Math.PI * 2
        });
      }

      window.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX - width / 2) * 0.0004;
        targetMouseY = (e.clientY - height / 2) * 0.0004;
      }, { passive: true });

      // Method to update theme tint based on active section
      this.setOpportunityFieldTheme = (theme) => {
        if (theme === 'credit') targetColor = COLORS.credit;
        else if (theme === 'cyan') targetColor = COLORS.cyan;
        else if (theme === 'neutral') targetColor = COLORS.neutral;
        else targetColor = COLORS.welfare;
      };

      let angleX = 0;
      let angleY = 0;

      const render = () => {
        if (document.hidden) {
          requestAnimationFrame(render);
          return;
        }

        // Interpolate mouse and theme color
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        currentColor.r += (targetColor.r - currentColor.r) * 0.03;
        currentColor.g += (targetColor.g - currentColor.g) * 0.03;
        currentColor.b += (targetColor.b - currentColor.b) * 0.03;

        // Scroll velocity adds momentum to orbital rotation
        const velocityBoost = (this.scrollVelocity * 0.0002);
        angleX += 0.0008 + mouseY * 0.04 + velocityBoost;
        angleY += 0.0012 + mouseX * 0.04 + velocityBoost;

        ctx.clearRect(0, 0, width, height);

        const projected = [];
        const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
        const cosY = Math.cos(angleY), sinY = Math.sin(angleY);

        // 1. Move & Project 3D Nodes
        for (let i = 0; i < NODES.length; i++) {
          const n = NODES[i];
          n.x += n.vx * (1 + this.scrollVelocity * 0.05);
          n.y += n.vy * (1 + this.scrollVelocity * 0.05);
          n.z += n.vz;
          n.pulse += 0.02;

          // Wrap boundaries
          if (n.x < -700) n.x = 700;
          if (n.x > 700) n.x = -700;
          if (n.y < -550) n.y = 550;
          if (n.y > 550) n.y = -550;
          if (n.z < -400) n.z = 400;
          if (n.z > 400) n.z = -400;

          // Rotate Y
          let x1 = n.x * cosY - n.z * sinY;
          let z1 = n.x * sinY + n.z * cosY;
          // Rotate X
          let y1 = n.y * cosX - z1 * sinX;
          let z2 = n.y * sinX + z1 * cosX;

          const depth = z2 + 650;
          if (depth <= 20) continue;

          const scale = FOV / depth;
          const px = width / 2 + x1 * scale;
          const py = height / 2 + y1 * scale;

          projected.push({
            x: px,
            y: py,
            z: depth,
            scale,
            radius: n.radius * scale,
            pulse: n.pulse
          });
        }

        // 2. Draw 3D Connecting Lines in one batched path
        const maxDistSq = 22000;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        let hasLines = false;

        for (let i = 0; i < projected.length; i++) {
          const p1 = projected[i];
          for (let j = i + 1; j < projected.length; j++) {
            const p2 = projected[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < maxDistSq) {
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              hasLines = true;
            }
          }
        }
        if (hasLines) {
          ctx.strokeStyle = `rgba(${Math.round(currentColor.r)}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)}, 0.14)`;
          ctx.stroke();
        }

        // 3. Draw Nodes with soft aura
        for (let i = 0; i < projected.length; i++) {
          const p = projected[i];
          const alpha = Math.min(0.7, Math.max(0.12, (950 - p.z) / 750));
          const glow = Math.sin(p.pulse) * 0.4 + 0.8;

          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1.2, p.radius * glow), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${Math.round(currentColor.r)}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)}, ${alpha.toFixed(3)})`;
          ctx.fill();
        }

        requestAnimationFrame(render);
      };

      render();
    },

    /* ==========================================================================
       4. AWWWARDS CUSTOM CURSOR
       ========================================================================== */
    initCursor() {
      // Disabled completely per ultra-minimal UI design (uses native cursor)
    },

    /* ==========================================================================
       5. MAGNETIC BUTTON INTERACTIONS
       ========================================================================== */
    initMagneticButtons() {
      if (this.isTouch || this.reducedMotion) return;

      const magnets = document.querySelectorAll('.magnetic-cta, .cinema-pill-btn.primary');
      magnets.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = (e.clientX - cx) * 0.35;
          const dy = (e.clientY - cy) * 0.35;

          if (window.gsap) {
            gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
          } else {
            btn.style.transform = `translate(${dx}px, ${dy}px)`;
          }
        });

        btn.addEventListener('mouseleave', () => {
          if (window.gsap) {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
          } else {
            btn.style.transform = '';
          }
        });
      });
    },

    /* ==========================================================================
       6. TELEMETRY COUNTER INTERPOLATION
       ========================================================================== */
    animateCounter(element, targetNumber, duration = 2, suffix = '') {
      if (!element) return;
      if (!window.gsap) {
        element.textContent = targetNumber + suffix;
        return;
      }

      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetNumber,
        duration: duration,
        ease: 'power3.out',
        onUpdate: () => {
          element.textContent = Math.round(obj.val) + suffix;
        }
      });
    }
  };

  window.MotionEngine = MotionEngine;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MotionEngine.init());
  } else {
    MotionEngine.init();
  }
})(window, document);
