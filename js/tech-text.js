/**
 * TechText — React Bits Interactive Canvas Wordmark
 * Vanilla JavaScript Port for Samarthya Portal
 * 
 * Features:
 * - Dynamic dashed/solid vector outline tracing on hover/sweep
 * - Letter-by-letter & area-based reveals
 * - Interactive physics: draggable glyphs with spring restitution (SPRING = 320)
 * - Click-kick wave impulse spreading across neighbouring letters
 * - HUD selection box with real-time dimensions & drag offset coordinates
 * - Animated digital particle specks & orbiting radar markers
 * - Viewport-aware via IntersectionObserver (0% CPU when off-screen)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TechText = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const LABEL_FONT = '10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  const FALLOFF_STEPS = 8;
  const SPRING = 320;
  const INHERIT = /^(currentcolor|inherit)$/i;
  const INTRO_DELAY = 0.15;
  const KICK_DECAY = 0.62;

  const approach = (current, target, dt, seconds) =>
    current + (target - current) * (1 - Math.exp(-dt / seconds));

  const clamp01 = value => Math.min(1, Math.max(0, Number(value) || 0));

  const smoothstep = (edge0, edge1, value) => {
    const t = clamp01((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  };

  const noise = (...values) => {
    let h = 2166136261;
    for (const value of values) {
      h = Math.imul(h ^ (value | 0), 16777619);
      h ^= h >>> 13;
      h = Math.imul(h, 0x5bd1e995);
      h ^= h >>> 15;
    }
    return (h >>> 0) / 4294967296;
  };

  const signed = value => (value > 0 ? `+${value}` : value < 0 ? `−${-value}` : '0');

  class TechText {
    constructor(container, options = {}) {
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      if (!container) {
        console.warn('[TechText] Container element not found.');
        return;
      }

      this.container = container;
      this.container.classList.add('tech-text');

      this.settings = Object.assign(
        {
          text: 'SAMARTHYA',
          fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 140,
          letterSpacing: -0.04,
          color: '#F8FAFC',
          accentColor: '#6366F1',
          align: 'center',
          reach: 180,
          softness: 0.7,
          dashLength: 4,
          dashGap: 2,
          strokeWidth: 1.5,
          lineStyle: 'dashed',
          reveal: 'letter',
          specks: 16,
          selection: true,
          labels: true,
          draggable: true,
          bounce: 0.45,
          sweep: true,
          speed: 0.85,
          clickKick: true,
          intro: 'none',
          introDuration: 2,
          guides: false
        },
        options
      );

      // Create or reuse canvas
      let canvas = this.container.querySelector('canvas.tech-text-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'tech-text-canvas';
        this.container.appendChild(canvas);
      }
      this.canvas = canvas;

      this.ctx = this.canvas.getContext('2d');
      this.scratch = document.createElement('canvas');
      this.scratchCtx = this.scratch.getContext('2d');

      if (!this.ctx || !this.scratchCtx) {
        console.error('[TechText] Canvas 2D context not available.');
        return;
      }

      this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      this.width = 1;
      this.height = 1;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.raf = 0;
      this.last = performance.now();
      this.visible = false;
      this.alive = true;
      this.layoutKey = '';
      this.requestedFont = '';
      this.word = null;
      this.glyphs = [];
      this.presence = 0;
      this.clock = 0;
      this.pulse = 0;
      this.placed = false;
      this.dragging = -1;
      this.cursor = '';
      this.introClock = 0;
      this.introKind = '';
      this.introducing = false;
      this.fontsReady = !document.fonts;
      this.guideAlpha = 0;
      this.kicks = [];
      this.press = { x: 0, y: 0, time: 0, index: -1 };
      this.pointer = { x: 0, y: 0, inside: false };
      this.grab = { x: 0, y: 0 };
      this.lens = { x: 0, y: 0 };
      this.frame = { x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0, index: -1 };

      this._bindHandlers();
      this._initObservers();
      this.resize();
    }

    _bindHandlers() {
      this.wake = () => {
        if (this.raf || !this.visible || !this.alive) return;
        this.last = performance.now();
        this.raf = requestAnimationFrame(this.tick.bind(this));
      };

      this.refreshFonts = () => {
        this.layoutKey = '';
        this.wake();
      };

      this.fontsLoaded = () => {
        this.fontsReady = true;
        this.refreshFonts();
      };

      this.onMove = e => {
        this.locate(e);
        this.pointer.inside = true;
        this.wake();
      };

      this.onLeave = () => {
        if (this.dragging >= 0) return;
        this.pointer.inside = false;
        this.wake();
      };

      this.onDown = e => {
        this.locate(e);
        this.pointer.inside = true;
        const s = this.settings;
        const primary = e.pointerType !== 'mouse' || e.button === 0;
        const index = this.introducing || !primary ? -1 : this.glyphAt(this.pointer.x, this.pointer.y);
        this.press.x = this.pointer.x;
        this.press.y = this.pointer.y;
        this.press.time = performance.now();
        this.press.index = index;
        if (s?.draggable && index >= 0) {
          this.dragging = index;
          this.grab.x = this.pointer.x - this.glyphs[index].offset.x;
          this.grab.y = this.pointer.y - this.glyphs[index].offset.y;
          this.container.setPointerCapture?.(e.pointerId);
        }
        this.wake();
      };

      this.onUp = e => {
        if (this.dragging >= 0) {
          this.dragging = -1;
          this.container.releasePointerCapture?.(e.pointerId);
          const rect = this.container.getBoundingClientRect();
          this.pointer.inside =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;
        }
        if (
          e.type === 'pointerup' &&
          this.press.index >= 0 &&
          this.settings.clickKick &&
          !this.reducedMotion &&
          performance.now() - this.press.time < 450
        ) {
          const rect = this.container.getBoundingClientRect();
          if (Math.hypot(e.clientX - rect.left - this.press.x, e.clientY - rect.top - this.press.y) < 6) {
            this.kick(this.press.index);
          }
        }
        this.press.index = -1;
        this.wake();
      };

      this.container.addEventListener('pointermove', this.onMove, { passive: true });
      this.container.addEventListener('pointerenter', this.onMove, { passive: true });
      this.container.addEventListener('pointerdown', this.onDown, { passive: true });
      this.container.addEventListener('pointerup', this.onUp, { passive: true });
      this.container.addEventListener('pointercancel', this.onUp, { passive: true });
      this.container.addEventListener('pointerleave', this.onLeave, { passive: true });
    }

    _initObservers() {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.container);

      this.intersectionObserver = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        this.wake();
      });
      this.intersectionObserver.observe(this.container);

      this.themeObserver = new MutationObserver(() => this.wake());
      for (const node of [document.documentElement, document.body]) {
        if (node) {
          this.themeObserver.observe(node, {
            attributes: true,
            attributeFilter: ['class', 'style', 'data-theme']
          });
        }
      }

      this.schemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
      this.onSchemeChange = () => this.wake();
      this.schemeQuery?.addEventListener?.('change', this.onSchemeChange);

      if (document.fonts) {
        document.fonts.ready.then(this.fontsLoaded, this.fontsLoaded);
      }
    }

    locate(e) {
      const rect = this.container.getBoundingClientRect();
      this.pointer.x = e.clientX - rect.left;
      this.pointer.y = e.clientY - rect.top;
    }

    family(s) {
      return s.fontFamily || getComputedStyle(this.container).fontFamily || 'sans-serif';
    }

    fontFor(s, size) {
      return `${s.fontWeight} ${size}px ${this.family(s)}`;
    }

    palette(s) {
      const current = getComputedStyle(this.container).color || '#000000';
      const pick = value => (!value || INHERIT.test(String(value).trim()) ? current : value);
      return { ink: pick(s.color), accent: pick(s.accentColor) };
    }

    setFont(target, s, size) {
      target.font = this.fontFor(s, size);
      if ('letterSpacing' in target) target.letterSpacing = `${s.letterSpacing * size}px`;
      target.textAlign = 'left';
      target.textBaseline = 'alphabetic';
    }

    sprite(s, view, glyph, stroke, ink) {
      const pad = Math.ceil(s.strokeWidth * 2 + 4);
      const left = glyph.box.x1 - pad;
      const top = glyph.box.y1 - pad;
      const w = glyph.box.x2 - glyph.box.x1 + pad * 2;
      const h = glyph.box.y2 - glyph.box.y1 + pad * 2;
      const image = document.createElement('canvas');
      image.width = Math.max(1, Math.ceil(w * this.dpr));
      image.height = Math.max(1, Math.ceil(h * this.dpr));
      const c = image.getContext('2d');
      if (!c) return { image, left, top };
      c.setTransform(this.dpr, 0, 0, this.dpr, -left * this.dpr, -top * this.dpr);
      this.setFont(c, s, view.size);
      if (stroke) {
        c.lineJoin = 'round';
        c.lineWidth = s.strokeWidth * 2;
        c.lineCap = 'butt';
        c.strokeStyle = ink;
        if (s.lineStyle !== 'solid') {
          c.setLineDash([Math.max(1, s.dashLength), Math.max(1, s.dashGap)]);
        }
        c.strokeText(glyph.char, glyph.x, view.baseline);
        c.setLineDash([]);
        c.globalCompositeOperation = 'destination-out';
        c.fillStyle = '#000000';
        c.fillText(glyph.char, glyph.x, view.baseline);
        c.globalCompositeOperation = 'source-over';
      } else {
        c.fillStyle = ink;
        c.fillText(glyph.char, glyph.x, view.baseline);
      }
      return { image, left, top };
    }

    ensureLayout(s, ink) {
      const key = [
        s.text,
        this.family(s),
        s.fontWeight,
        s.fontSize,
        s.letterSpacing,
        s.align,
        ink,
        s.dashLength,
        s.dashGap,
        s.strokeWidth,
        s.lineStyle,
        this.width,
        this.height,
        this.dpr
      ].join('|');

      if (key === this.layoutKey && this.word) return this.word;
      this.layoutKey = key;
      const wanted = this.fontFor(s, 64);
      if (document.fonts && wanted !== this.requestedFont) {
        this.requestedFont = wanted;
        document.fonts.load(wanted, s.text).then(this.refreshFonts, this.refreshFonts);
      }

      const probe = this.scratchCtx;
      this.setFont(probe, s, s.fontSize);
      let m = probe.measureText(s.text);
      const fit = Math.min(
        1,
        (this.width * 0.9) / Math.max(m.actualBoundingBoxLeft + m.actualBoundingBoxRight, 1),
        (this.height * 0.66) / Math.max(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, 1)
      );
      const size = s.fontSize * fit;
      this.setFont(probe, s, size);
      m = probe.measureText(s.text);
      const inkWidth = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const inkHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const margin = this.width * 0.05;
      const start =
        s.align === 'left' ? margin : s.align === 'right' ? this.width - margin - inkWidth : (this.width - inkWidth) / 2;
      const x = start + m.actualBoundingBoxLeft;
      const baseline = (this.height - inkHeight) / 2 + m.actualBoundingBoxAscent;
      const xHeight = baseline - probe.measureText('x').actualBoundingBoxAscent;
      const capHeight = baseline - probe.measureText('H').actualBoundingBoxAscent;
      const ascender = baseline - probe.measureText('d').actualBoundingBoxAscent;
      const descender = baseline + probe.measureText('p').actualBoundingBoxDescent;
      const top = baseline - m.actualBoundingBoxAscent;
      const bottom = baseline + m.actualBoundingBoxDescent;
      const inkTop = Math.min(top, capHeight) - 2;
      const inkBottom = Math.max(bottom, baseline) + 2;
      const next = {
        size,
        baseline,
        left: x - m.actualBoundingBoxLeft,
        right: x + m.actualBoundingBoxRight,
        top,
        bottom,
        lines: [
          { y: baseline, label: 'baseline' },
          { y: xHeight, label: 'x-height' },
          { y: capHeight, label: 'cap height' },
          ...(capHeight - ascender > Math.max(11, size * 0.06) ? [{ y: ascender, label: 'ascender' }] : []),
          { y: descender, label: 'descender' }
        ],
        bands: [
          { y0: xHeight, y1: baseline, up: true, order: 0 },
          { y0: capHeight, y1: xHeight, up: true, order: 1 },
          { y0: inkTop, y1: capHeight, up: true, order: 2 },
          { y0: baseline, y1: inkBottom, up: false, order: 1 }
        ].filter(band => band.y1 - band.y0 > 0.5)
      };
      this.word = next;

      const chars = Array.from(s.text);
      const previous = this.glyphs;
      this.glyphs = [];
      let prefix = '';
      chars.forEach((char, i) => {
        prefix += char;
        const own = probe.measureText(char);
        const gx = x + probe.measureText(prefix).width - own.width;
        if (!char.trim()) return;
        const base = {
          char,
          x: gx,
          box: {
            x1: gx - own.actualBoundingBoxLeft,
            y1: baseline - own.actualBoundingBoxAscent,
            x2: gx + own.actualBoundingBoxRight,
            y2: baseline + own.actualBoundingBoxDescent
          }
        };
        const kept = previous[this.glyphs.length];
        this.glyphs.push({
          ...base,
          offset: kept?.char === char ? kept.offset : { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
          outline: 0,
          shown: 1,
          cells: null,
          assembled: 0,
          index: i,
          fill: this.sprite(s, next, base, false, ink),
          dashes: this.sprite(s, next, base, true, ink)
        });
      });
      this.dragging = -1;
      this.frame.index = -1;
      return next;
    }

    glyphAt(x, y) {
      if (!this.word || y < this.word.top - 24 || y > this.word.bottom + 24) return -1;
      let best = -1;
      let bestDistance = Infinity;
      this.glyphs.forEach((glyph, i) => {
        const x1 = glyph.box.x1 + glyph.offset.x;
        const x2 = glyph.box.x2 + glyph.offset.x;
        const d = x < x1 ? x1 - x : x > x2 ? x - x2 : 0;
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      return bestDistance < 28 ? best : -1;
    }

    falloff(target, cx, cy, radius, strength, softness) {
      const inner = Math.min(1, Math.max(0, 1 - softness));
      const gradient = target.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${strength})`);
      if (inner > 0.995) {
        gradient.addColorStop(0.995, `rgba(0, 0, 0, ${strength})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        return gradient;
      }
      for (let i = 0; i <= FALLOFF_STEPS; i++) {
        const t = i / FALLOFF_STEPS;
        const eased = t * t * (3 - 2 * t);
        gradient.addColorStop(inner + (1 - inner) * t, `rgba(0, 0, 0, ${strength * (1 - eased)})`);
      }
      return gradient;
    }

    blit(target, art, dx, dy, originX, originY) {
      target.drawImage(
        art.image,
        Math.round((art.left + dx) * this.dpr - originX),
        Math.round((art.top + dy) * this.dpr - originY)
      );
    }

    drawReveal(s) {
      const radius = s.reach * this.dpr;
      const cx = this.lens.x * this.dpr;
      const cy = this.lens.y * this.dpr;
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillStyle = this.falloff(this.ctx, cx, cy, radius, this.presence, s.softness);
      this.ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      this.ctx.globalCompositeOperation = 'source-over';

      const x0 = Math.max(0, Math.floor(cx - radius));
      const y0 = Math.max(0, Math.floor(cy - radius));
      const x1 = Math.min(this.canvas.width, Math.ceil(cx + radius));
      const y1 = Math.min(this.canvas.height, Math.ceil(cy + radius));
      if (x1 <= x0 || y1 <= y0) return;
      const w = x1 - x0;
      const h = y1 - y0;
      if (this.scratch.width < w || this.scratch.height < h) {
        this.scratch.width = Math.max(this.scratch.width, w);
        this.scratch.height = Math.max(this.scratch.height, h);
      }
      this.scratchCtx.setTransform(1, 0, 0, 1, 0, 0);
      this.scratchCtx.globalCompositeOperation = 'source-over';
      this.scratchCtx.clearRect(0, 0, w, h);
      for (const glyph of this.glyphs) {
        this.blit(this.scratchCtx, glyph.dashes, glyph.offset.x, glyph.offset.y, x0, y0);
      }
      this.scratchCtx.globalCompositeOperation = 'destination-in';
      this.scratchCtx.fillStyle = this.falloff(this.scratchCtx, cx - x0, cy - y0, radius, 1, s.softness);
      this.scratchCtx.fillRect(0, 0, w, h);
      this.scratchCtx.globalCompositeOperation = 'source-over';
      this.ctx.globalAlpha = this.presence;
      this.ctx.drawImage(this.scratch, 0, 0, w, h, x0, y0, w, h);
      this.ctx.globalAlpha = 1;
    }

    crisp(value) {
      return (Math.round(value * this.dpr) + 0.5) / this.dpr;
    }

    perimeterPoint(distance, w, h) {
      let d = ((distance % (2 * (w + h))) + 2 * (w + h)) % (2 * (w + h));
      if (d < w) return [this.frame.x1 + d, this.frame.y1, 0, -1];
      d -= w;
      if (d < h) return [this.frame.x2, this.frame.y1 + d, 1, 0];
      d -= h;
      if (d < w) return [this.frame.x2 - d, this.frame.y2, 0, 1];
      d -= w;
      return [this.frame.x1, this.frame.y2 - d, -1, 0];
    }

    drawSpecks(s, a, accent) {
      const w = this.frame.x2 - this.frame.x1;
      const h = this.frame.y2 - this.frame.y1;
      if (w < 2 || h < 2) return;
      const perimeter = 2 * (w + h);
      const seed = this.frame.index + 1;
      const grid = 3;
      this.ctx.fillStyle = accent;
      this.ctx.strokeStyle = accent;

      for (let k = 0; k < s.specks; k++) {
        const period = 0.5 + noise(seed, k, 11) * 1.2;
        const t = this.pulse / period + noise(seed, k, 17);
        const cycle = Math.floor(t);
        const life = t - cycle;
        if (life > 0.7) continue;
        const [px, py, nx, ny] = this.perimeterPoint(noise(seed, k, cycle) * perimeter, w, h);
        const pick = noise(seed, k, cycle, 2);
        const size = pick < 0.46 ? 2 : pick < 0.7 ? 3 : pick < 0.84 ? 5 : pick < 0.94 ? 8 : 11;
        const large = size >= 8;
        const out = (large ? 9 : 4) + Math.floor(noise(seed, k, cycle, 1) * 5) * grid;
        const x = this.frame.x1 + Math.round((px + nx * out - this.frame.x1) / grid) * grid;
        const y = this.frame.y1 + Math.round((py + ny * out - this.frame.y1) / grid) * grid;
        const tone = noise(seed, k, cycle, 3);
        const blink = life < 0.06 || (life > 0.32 && life < 0.36) ? 0.35 : 1;
        const alpha = a * (large ? 0.3 + 0.4 * tone : 0.3 + 0.6 * tone) * blink;
        const left = Math.round(x - size / 2);
        const top = Math.round(y - size / 2);
        this.ctx.globalAlpha = alpha;
        if (tone < 0.26 || (large && tone < 0.78)) {
          this.ctx.strokeRect(left + 0.5, top + 0.5, size, size);
          if (large && tone > 0.5) this.ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
        } else {
          this.ctx.fillRect(left, top, size, size);
        }
      }

      for (let j = 0; j < 2; j++) {
        const head = (this.pulse * 0.42 * s.speed + j * 0.5) * perimeter;
        for (let i = 0; i < 4; i++) {
          const [x, y] = this.perimeterPoint(head - i * 6, w, h);
          const size = i === 0 ? 3 : 2;
          this.ctx.globalAlpha = a * [0.95, 0.55, 0.32, 0.16][i];
          this.ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
        }
      }
      this.ctx.globalAlpha = 1;
    }

    drawFrame(s, accent) {
      const glyph = this.glyphs[this.frame.index];
      if (!glyph || this.frame.alpha < 0.01) return;
      const a = this.frame.alpha;
      const x1 = this.crisp(this.frame.x1);
      const y1 = this.crisp(this.frame.y1);
      const x2 = this.crisp(this.frame.x2);
      const y2 = this.crisp(this.frame.y2);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.ctx.fillStyle = accent;
      this.ctx.strokeStyle = accent;
      this.ctx.lineWidth = 1;

      const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
      if (moved > 1) {
        const hx = (glyph.box.x1 + glyph.box.x2) / 2;
        const hy = (glyph.box.y1 + glyph.box.y2) / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(hx, hy);
        this.ctx.lineTo(hx + glyph.offset.x, hy + glyph.offset.y);
        this.ctx.setLineDash([3, 4]);
        this.ctx.globalAlpha = 0.45 * a;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.rect(Math.round(hx) - 2, Math.round(hy) - 2, 4, 4);
        this.ctx.globalAlpha = 0.7 * a;
        this.ctx.fill();
      }

      this.ctx.beginPath();
      this.ctx.rect(x1, y1, x2 - x1, y2 - y1);
      this.ctx.globalAlpha = 0.5 * a;
      this.ctx.stroke();

      this.ctx.beginPath();
      for (const [cx, cy] of [
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2]
      ]) {
        this.ctx.rect(Math.round(cx) - 2, Math.round(cy) - 2, 5, 5);
      }
      this.ctx.globalAlpha = 0.95 * a;
      this.ctx.fill();
      this.ctx.globalAlpha = 1;

      if (s.specks > 0) this.drawSpecks(s, a, accent);

      if (!s.labels) return;
      this.ctx.font = LABEL_FONT;
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'bottom';
      this.ctx.fillStyle = accent;
      this.ctx.globalAlpha = 0.62 * a;
      const label =
        moved > 1
          ? `${signed(Math.round(glyph.offset.x))}, ${signed(Math.round(-glyph.offset.y))}`
          : `${glyph.char}  ${Math.round(glyph.box.x2 - glyph.box.x1)} × ${Math.round(glyph.box.y2 - glyph.box.y1)}`;
      this.ctx.fillText(label, Math.round(this.frame.x1), Math.round(this.frame.y1) - 7);
      this.ctx.globalAlpha = 1;
    }

    drawLines(s, view, accent, alpha, growth) {
      const pad = Math.max(12, view.size * 0.12);
      const x1 = Math.round(view.left - pad);
      const x2 = Math.round(view.right + pad);
      const room = this.width - x2 > x1;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.ctx.strokeStyle = accent;
      this.ctx.fillStyle = accent;
      this.ctx.lineWidth = 1;
      this.ctx.font = LABEL_FONT;
      this.ctx.textBaseline = 'middle';
      this.ctx.textAlign = room ? 'left' : 'right';
      view.lines.forEach((line, k) => {
        const grow = growth(k);
        if (grow <= 0.001) return;
        const y = this.crisp(line.y);
        const end = x1 + (x2 - x1) * grow;
        this.ctx.globalAlpha = alpha * 0.4;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y);
        this.ctx.lineTo(end, y);
        this.ctx.stroke();
        this.ctx.globalAlpha = alpha * 0.9;
        this.ctx.fillRect(x1 - 1, Math.round(line.y) - 1, 3, 3);
        this.ctx.fillRect(Math.round(end) - 1, Math.round(line.y) - 1, 3, 3);
        if (s.labels) {
          this.ctx.globalAlpha = alpha * 0.62 * smoothstep(0.7, 1, grow);
          this.ctx.fillText(line.label, room ? x2 + 8 : x1 - 8, Math.round(line.y));
        }
      });
      this.ctx.textAlign = 'left';
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.globalAlpha = 1;
    }

    ensureCells(glyph, view) {
      if (glyph.cells) return glyph.cells;
      const art = glyph.fill;
      const size = Math.max(3, Math.round(view.size / 26));
      const w = art.image.width;
      const h = art.image.height;
      const source = art.image.getContext('2d');
      const cells = [];
      glyph.cells = cells;
      glyph.assembled = 0;
      if (!source || w < 2 || h < 2) return cells;
      const data = source.getImageData(0, 0, w, h).data;
      const gx = Math.floor(art.left / size) * size;
      const gy = Math.floor(art.top / size) * size;
      const cols = Math.ceil((art.left + w / this.dpr - gx) / size) + 1;
      const rows = Math.ceil((art.top + h / this.dpr - gy) / size) + 1;
      const hit = new Uint8Array(cols * rows);
      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          if (data[(py * w + px) * 4 + 3] < 24) continue;
          const cx = Math.floor((art.left + px / this.dpr - gx) / size);
          const cy = Math.floor((art.top + py / this.dpr - gy) / size);
          hit[cy * cols + cx] = 1;
        }
      }
      const center = (glyph.box.x1 + glyph.box.x2) / 2;
      const along = clamp01((center - view.left) / Math.max(1, view.right - view.left));
      for (let k = 0; k < hit.length; k++) {
        if (!hit[k]) continue;
        const angle = noise(glyph.index, k, 1) * Math.PI * 2;
        const distance = view.size * (0.25 + 0.6 * noise(glyph.index, k, 2));
        const start = 0.03 + 0.36 * along + 0.12 * noise(glyph.index, k, 3);
        const land = start + 0.3 + 0.14 * noise(glyph.index, k, 4);
        cells.push({
          x: gx + (k % cols) * size,
          y: gy + Math.floor(k / cols) * size,
          size,
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance * 0.7,
          start,
          land
        });
        glyph.assembled = Math.max(glyph.assembled, land);
      }
      return cells;
    }

    cellRect(x, y, size) {
      const left = Math.round(x * this.dpr);
      const top = Math.round(y * this.dpr);
      return [left, top, Math.round((x + size) * this.dpr) - left, Math.round((y + size) * this.dpr) - top];
    }

    drawAssembling(glyph, progress, accent) {
      const cells = glyph.cells || [];
      this.ctx.save();
      this.ctx.beginPath();
      let landed = 0;
      for (const cell of cells) {
        if (progress < cell.land) continue;
        const [x, y, w, h] = this.cellRect(cell.x, cell.y, cell.size);
        this.ctx.rect(x, y, w, h);
        landed++;
      }
      if (landed) {
        this.ctx.clip();
        this.blit(this.ctx, glyph.fill, 0, 0, 0, 0);
      }
      this.ctx.restore();
      this.ctx.fillStyle = accent;
      for (const cell of cells) {
        if (progress < cell.start || progress >= cell.land) continue;
        const u = (progress - cell.start) / (cell.land - cell.start);
        const eased = 1 - Math.pow(1 - u, 4);
        const size = cell.size * (0.4 + 0.6 * eased);
        const x = cell.x + (cell.size - size) / 2 + cell.dx * (1 - eased);
        const y = cell.y + (cell.size - size) / 2 + cell.dy * (1 - eased);
        const [left, top, w, h] = this.cellRect(x, y, size);
        this.ctx.globalAlpha = Math.min(1, u * 4) * (0.55 + 0.45 * eased);
        this.ctx.fillRect(left, top, Math.max(1, w), Math.max(1, h));
      }
      this.ctx.globalAlpha = 1;
    }

    drawFilling(glyph, lead, progress, view) {
      const art = glyph.fill;
      const left = Math.floor(art.left * this.dpr);
      const top = Math.floor(art.top * this.dpr);
      const w = art.image.width + 2;
      const h = art.image.height + 2;
      const fill = clamp01((progress - 0.24 - 0.28 * lead) / 0.48);
      const rects = [];
      for (const band of view.bands) {
        const amount = smoothstep(0.3 * band.order, 0.3 * band.order + 0.4, fill);
        if (amount <= 0) continue;
        const span = (band.y1 - band.y0) * amount;
        const y0 = Math.round((band.up ? band.y1 - span : band.y0) * this.dpr);
        const y1 = Math.round((band.up ? band.y1 : band.y0 + span) * this.dpr);
        if (y1 > y0) rects.push([y0, y1 - y0]);
      }
      const outline = smoothstep(0.08 + 0.2 * lead, 0.22 + 0.2 * lead, progress);
      if (outline > 0.001) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(left - 2, top - 2, w + 2, h + 2);
        for (const [y, span] of rects) this.ctx.rect(left - 2, y, w + 2, span);
        this.ctx.clip('evenodd');
        this.ctx.globalAlpha = outline;
        this.blit(this.ctx, glyph.dashes, 0, 0, 0, 0);
        this.ctx.restore();
      }
      if (rects.length) {
        this.ctx.save();
        this.ctx.beginPath();
        for (const [y, span] of rects) this.ctx.rect(left - 2, y, w + 2, span);
        this.ctx.clip();
        this.blit(this.ctx, glyph.fill, 0, 0, 0, 0);
        this.ctx.restore();
      }
      this.ctx.globalAlpha = 1;
    }

    kick(index) {
      const strength = (this.word ? this.word.size : 120) * 11;
      this.kicks.push({ index, at: this.pulse, velocity: strength });
      for (let d = 1; d < this.glyphs.length; d++) {
        const velocity = strength * Math.pow(KICK_DECAY, d);
        if (velocity < 30) break;
        for (const j of [index - d, index + d]) {
          if (j >= 0 && j < this.glyphs.length) {
            this.kicks.push({ index: j, at: this.pulse + d * 0.055, velocity });
          }
        }
      }
      this.wake();
    }

    tick(now) {
      this.raf = 0;
      const s = this.settings;
      if (!s) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000));
      this.last = now;
      const { ink, accent } = this.palette(s);
      const view = this.ensureLayout(s, ink);
      const damping = 2 * Math.sqrt(SPRING) * (1 - clamp01(s.bounce) * 0.96);

      if (s.intro !== this.introKind) {
        this.introKind = s.intro;
        this.introClock = 0;
      }
      const introOn = this.introKind !== 'none' && !this.reducedMotion && this.glyphs.length > 0;
      if (introOn && this.fontsReady) this.introClock += dt;
      const progress = introOn ? clamp01((this.introClock - INTRO_DELAY) / Math.max(0.3, s.introDuration)) : 1;
      this.introducing = introOn && progress < 1;

      const sweeping = !this.introducing && s.sweep && !this.reducedMotion && !this.pointer.inside && this.dragging < 0;
      if (sweeping) this.clock += dt * s.speed;
      this.pulse += dt;
      let targetX = this.pointer.x;
      let targetY = this.pointer.y;
      if (sweeping) {
        targetX = view.left + (view.right - view.left) * (0.5 - 0.5 * Math.cos(this.clock * 0.45));
        targetY = view.top + (view.bottom - view.top) * (0.45 + 0.1 * Math.sin(this.clock * 0.8));
      }
      const active = !this.introducing && (this.pointer.inside || sweeping || this.dragging >= 0);
      if (active && !this.placed) {
        this.lens.x = targetX;
        this.lens.y = targetY;
      }
      if (active) {
        const lag = this.pointer.inside ? 0.05 : 0.22;
        this.lens.x = approach(this.lens.x, targetX, dt, lag);
        this.lens.y = approach(this.lens.y, targetY, dt, lag);
      }
      this.placed = active;
      this.presence = approach(this.presence, s.reveal === 'area' && active && this.dragging < 0 ? 1 : 0, dt, 0.16);

      for (let k = this.kicks.length - 1; k >= 0; k--) {
        if (this.kicks[k].at > this.pulse) continue;
        const glyph = this.glyphs[this.kicks[k].index];
        if (glyph) glyph.velocity.y -= this.kicks[k].velocity;
        this.kicks.splice(k, 1);
      }

      let moving = false;
      this.glyphs.forEach((glyph, i) => {
        if (i === this.dragging) {
          glyph.offset.x = approach(glyph.offset.x, this.pointer.x - this.grab.x, dt, 0.03);
          glyph.offset.y = approach(glyph.offset.y, this.pointer.y - this.grab.y, dt, 0.03);
          glyph.velocity.x = 0;
          glyph.velocity.y = 0;
          moving = true;
          return;
        }
        const { offset, velocity } = glyph;
        if (Math.abs(offset.x) < 0.05 && Math.abs(offset.y) < 0.05 && Math.hypot(velocity.x, velocity.y) < 0.5) {
          offset.x = 0;
          offset.y = 0;
          velocity.x = 0;
          velocity.y = 0;
          return;
        }
        velocity.x += (-SPRING * offset.x - damping * velocity.x) * dt;
        velocity.y += (-SPRING * offset.y - damping * velocity.y) * dt;
        offset.x += velocity.x * dt;
        offset.y += velocity.y * dt;
        moving = true;
      });

      let typing = -1;
      if (this.introducing && this.introKind === 'type') {
        const step = 0.86 / this.glyphs.length;
        const cursorAt = Math.min(this.glyphs.length - 1, Math.floor(progress / step));
        typing = progress < 0.93 ? cursorAt : -1;
        this.glyphs.forEach((glyph, i) => {
          glyph.shown = i < cursorAt ? 1 : i === cursorAt ? smoothstep(0, step * 0.3, progress - i * step) : 0;
        });
      } else {
        this.glyphs.forEach(glyph => {
          glyph.shown = 1;
        });
      }

      const focus = this.introducing ? typing : this.dragging >= 0 ? this.dragging : active ? this.glyphAt(this.lens.x, this.lens.y) : -1;
      if (focus >= 0 && s.selection) {
        const glyph = this.glyphs[focus];
        const bx1 = glyph.box.x1 + glyph.offset.x - 6;
        const by1 = glyph.box.y1 + glyph.offset.y - 6;
        const bx2 = glyph.box.x2 + glyph.offset.x + 6;
        const by2 = glyph.box.y2 + glyph.offset.y + 6;
        if (this.frame.index < 0 || this.frame.alpha < 0.02) {
          this.frame.x1 = bx1;
          this.frame.y1 = by1;
          this.frame.x2 = bx2;
          this.frame.y2 = by2;
        }
        const glide = focus === this.dragging ? 0.02 : 0.08;
        this.frame.x1 = approach(this.frame.x1, bx1, dt, glide);
        this.frame.y1 = approach(this.frame.y1, by1, dt, glide);
        this.frame.x2 = approach(this.frame.x2, bx2, dt, glide);
        this.frame.y2 = approach(this.frame.y2, by2, dt, glide);
        this.frame.index = focus;
      }
      this.frame.alpha = approach(this.frame.alpha, focus >= 0 && s.selection ? 1 : 0, dt, 0.1);

      this.glyphs.forEach((glyph, i) => {
        const target = this.introducing
          ? this.introKind === 'type' && (i === typing || (typing >= 0 && i > typing))
            ? 1
            : 0
          : s.reveal === 'letter' && i === focus && i !== this.dragging
            ? 1
            : 0;
        if (this.introducing && glyph.shown === 0) glyph.outline = target;
        glyph.outline = approach(glyph.outline, target, dt, 0.09);
        if (Math.abs(glyph.outline - target) > 0.002) moving = true;
        else glyph.outline = target;
      });

      this.guideAlpha = approach(this.guideAlpha, s.guides && !this.introducing && (focus >= 0 || this.presence > 0.4) ? 1 : 0, dt, 0.14);

      const hovering = !this.introducing && focus >= 0 && this.pointer.inside;
      const nextCursor =
        this.dragging >= 0 ? 'grabbing' : hovering && s.draggable ? 'grab' : hovering && s.clickKick ? 'pointer' : '';
      if (nextCursor !== this.cursor) {
        this.cursor = nextCursor;
        this.container.style.cursor = nextCursor;
      }

      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.globalAlpha = 1;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (const glyph of this.glyphs) {
        const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
        if (moved > 1) {
          this.ctx.globalAlpha = Math.min(1, moved / 24) * 0.55;
          this.blit(this.ctx, glyph.dashes, 0, 0, 0, 0);
          this.ctx.globalAlpha = 1;
        }
      }
      if (this.introducing && this.introKind === 'metrics') {
        this.drawLines(s, view, accent, 1 - smoothstep(0.84, 1, progress), k =>
          smoothstep(0.02 + 0.04 * k, 0.2 + 0.04 * k, progress)
        );
      } else if (this.guideAlpha > 0.005) {
        this.drawLines(s, view, accent, this.guideAlpha * 0.6, () => 1);
      }
      this.glyphs.forEach((glyph, i) => {
        if (this.introducing && this.introKind === 'assemble') {
          this.ensureCells(glyph, view);
          if (progress < glyph.assembled) {
            this.drawAssembling(glyph, progress, accent);
            return;
          }
        }
        if (this.introducing && this.introKind === 'metrics') {
          const lead = this.glyphs.length > 1 ? i / (this.glyphs.length - 1) : 0;
          if (progress < 0.72 + 0.28 * lead) {
            this.drawFilling(glyph, lead, progress, view);
            return;
          }
        }
        if (glyph.shown < 0.001) return;
        if (glyph.outline < 0.999) {
          this.ctx.globalAlpha = (1 - glyph.outline) * glyph.shown;
          this.blit(this.ctx, glyph.fill, glyph.offset.x, glyph.offset.y, 0, 0);
        }
        if (glyph.outline > 0.001) {
          this.ctx.globalAlpha = glyph.outline * glyph.shown;
          this.blit(this.ctx, glyph.dashes, glyph.offset.x, glyph.offset.y, 0, 0);
        }
        this.ctx.globalAlpha = 1;
      });
      if (this.presence > 0.001) this.drawReveal(s);
      this.drawFrame(s, accent);

      const settling =
        moving ||
        this.introducing ||
        this.kicks.length > 0 ||
        (this.guideAlpha > 0.005 && this.guideAlpha < 0.995) ||
        Math.abs(this.presence - (s.reveal === 'area' && active && this.dragging < 0 ? 1 : 0)) > 0.002 ||
        (this.frame.alpha > 0.01 && this.frame.alpha < 0.99);
      if ((active || settling) && this.visible && this.alive) {
        this.raf = requestAnimationFrame(this.tick.bind(this));
      }
    }

    resize() {
      this.width = Math.max(1, this.container.clientWidth);
      this.height = Math.max(1, this.container.clientHeight);
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.layoutKey = '';
      this.wake();
    }

    update(newOptions) {
      Object.assign(this.settings, newOptions);
      this.layoutKey = '';
      this.wake();
    }

    destroy() {
      this.alive = false;
      cancelAnimationFrame(this.raf);
      this.resizeObserver?.disconnect();
      this.intersectionObserver?.disconnect();
      this.themeObserver?.disconnect();
      this.schemeQuery?.removeEventListener?.('change', this.onSchemeChange);
      if (this.container) {
        this.container.style.cursor = '';
        this.container.removeEventListener('pointermove', this.onMove);
        this.container.removeEventListener('pointerenter', this.onMove);
        this.container.removeEventListener('pointerdown', this.onDown);
        this.container.removeEventListener('pointerup', this.onUp);
        this.container.removeEventListener('pointercancel', this.onUp);
        this.container.removeEventListener('pointerleave', this.onLeave);
      }
    }
  }

  return TechText;
});
