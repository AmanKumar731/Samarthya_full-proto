/**
 * ASCII Ripple Engine - React Bits Pro Port (Vanilla JS + Canvas 2D)
 * Simulates real-time fluid wave physics across monospace ASCII character grids.
 */

(function () {
  'use strict';

  const DEFAULT_TEXT =
    'SAMARTHYA AI • STATUTORY WELFARE & CONCESSIONAL CREDIT INTELLIGENCE • ZERO MIDDLEMEN • DPDP ACT 2023 COMPLIANT • 100% DIRECT BENEFICIARY DELIVERY • PRIVACY PRESERVING CLIENT EVALUATION • EMPOWERING CITIZENS ACROSS ALL 28 STATES & 8 UNION TERRITORIES • SUB-SECOND MATCHING ENGINE • DISABILITY CERTIFICATION • SCHOLARSHIPS • MICRO-ENTERPRISE LOANS • ALIMCO ASSISTIVE GEAR • OFFICIAL NATIONAL APIS';

  const DEFAULT_CHARS = '·.,:;-~=+*%#@';
  const STEP_DT = 1 / 90;

  const hash = (x, y, seed) => {
    const val = 43758.5453 * Math.sin(127.1 * x + 311.7 * y + 74.7 * seed);
    return val - Math.floor(val);
  };

  const clamp01 = val => (val < 0 ? 0 : val > 1 ? 1 : val);

  const parseColor = color => {
    if (typeof document === 'undefined') return [255, 255, 255, 1];
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [255, 255, 255, 1];
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return [data[0], data[1], data[2], data[3] / 255];
  };

  const lerpColor = (c1, c2, t) => {
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    const a = (c1[3] + (c2[3] - c1[3]) * t).toFixed(3);
    return `rgba(${r},${g},${b},${a})`;
  };

  const stepWave = (sim, speed, viscosity, damping, edges) => {
    const { w, h, prev, cur, next, mask } = sim;
    const c = 1 - damping;
    const h_coeff = speed + viscosity;
    let maxEnergy = 0;

    for (let y = 1; y < h - 1; y++) {
      const rowOffset = y * w;
      for (let x = 1; x < w - 1; x++) {
        const idx = rowOffset + x;
        const current = cur[idx];
        const laplacian = cur[idx - 1] + cur[idx + 1] + cur[idx - w] + cur[idx + w] - 4 * current;
        const val = 0.996 * current + (current - prev[idx]) * c * mask[idx] + h_coeff * laplacian;
        next[idx] = val;
        const absVal = val < 0 ? -val : val;
        if (absVal > maxEnergy) maxEnergy = absVal;
      }
    }

    if (edges === 'reflect') {
      for (let x = 0; x < w; x++) {
        next[x] = next[x + w];
        next[(h - 1) * w + x] = next[(h - 2) * w + x];
      }
      for (let y = 0; y < h; y++) {
        next[y * w] = next[y * w + 1];
        next[y * w + w - 1] = next[y * w + w - 2];
      }
    }

    sim.prev = cur;
    sim.cur = next;
    sim.next = prev;
    sim.energy = maxEnergy;
  };

  const calmWave = sim => {
    sim.cur.fill(0);
    sim.prev.fill(0);
    sim.next.fill(0);
    sim.energy = 0;
  };

  const addImpulse = (sim, x, y, radius, strength) => {
    const cellX = x / sim.cell + 1;
    const cellY = y / sim.cell + 1;
    const radCells = Math.max(1, radius / sim.cell);
    const minX = Math.max(1, Math.floor(cellX - radCells));
    const maxX = Math.min(sim.w - 2, Math.ceil(cellX + radCells));
    const minY = Math.max(1, Math.floor(cellY - radCells));
    const maxY = Math.min(sim.h - 2, Math.ceil(cellY + radCells));
    const invRadSq = 1 / (radCells * radCells);

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const dx = cx - cellX;
        const dy = cy - cellY;
        const distSq = 1 - (dx * dx + dy * dy) * invRadSq;
        if (distSq > 0) {
          sim.cur[cy * sim.w + cx] -= strength * distSq * distSq * (3 - 2 * distSq);
        }
      }
    }
    if (sim.energy < strength) sim.energy = strength;
  };

  const sampleField = (sim, x, y, out) => {
    const cellX = x / sim.cell + 1;
    const cellY = y / sim.cell + 1;
    const ix = Math.min(sim.w - 3, Math.max(1, Math.floor(cellX)));
    const iy = Math.min(sim.h - 3, Math.max(1, Math.floor(cellY)));
    const fx = clamp01(cellX - ix);
    const fy = clamp01(cellY - iy);

    const { w, cur } = sim;
    const idx = iy * w + ix;

    const top = cur[idx] + (cur[idx + 1] - cur[idx]) * fx;
    const bottom = cur[idx + w] + (cur[idx + w + 1] - cur[idx + w]) * fx;
    out[0] = top + (bottom - top) * fy;

    const gx1 = cur[idx + 1] - cur[idx - 1];
    const gx2 = cur[idx + w + 1] - cur[idx + w - 1];
    out[1] = (gx1 + (gx2 - gx1) * fy) * 0.5;

    const gy1 = cur[idx + w] - cur[idx - w];
    const gy2 = cur[idx + w + 1] - cur[idx - w + 1];
    out[2] = (gy1 + (gy2 - gy1) * fx) * 0.5;
  };

  class AsciiRipple {
    constructor(element, options = {}) {
      this.container = typeof element === 'string' ? document.querySelector(element) : element;
      if (!this.container) return;

      const ds = this.container.dataset;
      this.options = Object.assign(
        {
          text: ds.text || this.container.getAttribute('data-text') || DEFAULT_TEXT,
          chars: ds.chars || DEFAULT_CHARS,
          fontSize: parseFloat(ds.fontSize || '15'),
          lineHeight: parseFloat(ds.lineHeight || '1.25'),
          fontFamily: ds.fontFamily || 'ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace',
          fontWeight: ds.fontWeight || '400',
          textColor: ds.textColor || '#94a3b8',
          rippleColor: ds.rippleColor || '#38bdf8',
          troughColor: ds.troughColor || '#818cf8',
          backgroundColor: ds.backgroundColor || 'transparent',
          textOpacity: parseFloat(ds.textOpacity || '0.22'),
          resolution: parseFloat(ds.resolution || '3'),
          speed: parseFloat(ds.speed || '0.55'),
          damping: parseFloat(ds.damping || '0.045'),
          viscosity: parseFloat(ds.viscosity || '0.4'),
          edges: ds.edges || 'absorb',
          dropStrength: parseFloat(ds.dropStrength || '1.2'),
          dropRadius: parseFloat(ds.dropRadius || '26'),
          dragStrength: parseFloat(ds.dragStrength || '0.3'),
          dragRadius: parseFloat(ds.dragRadius || '16'),
          rain: parseFloat(ds.rain || '0.6'),
          rainStrength: parseFloat(ds.rainStrength || '0.6'),
          sensitivity: parseFloat(ds.sensitivity || '2.2'),
          slopeGain: parseFloat(ds.slopeGain || '1'),
          refraction: parseFloat(ds.refraction || '4'),
          scramble: parseFloat(ds.scramble || '1'),
          scrambleSpeed: parseFloat(ds.scrambleSpeed || '90'),
          dither: parseFloat(ds.dither || '0.5'),
          vignette: parseFloat(ds.vignette || '0.6'),
          interactive: ds.interactive !== 'false'
        },
        options
      );

      this.isRunning = false;
      this.animFrame = 0;
      this.lastTime = 0;
      this.simAcc = 0;
      this.rainAcc = 0;
      this.sampleVec = new Float32Array(3);
      this.reducedMotion = false;
      this.pointer = { x: 0, y: 0, lastX: 0, lastY: 0, inside: false, pending: false };

      this.init();
    }

    init() {
      this.container.classList.add('ascii-ripple');

      // Create internal canvas
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'ascii-ripple-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      this.container.innerHTML = '';
      this.container.appendChild(this.canvas);

      // Build color ramps
      this.buildRamps();

      // Listen for reduced motion
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = media.matches;
      media.addEventListener('change', e => {
        this.reducedMotion = e.matches;
        if (e.matches) {
          this.stopLoop();
          if (this.sim) calmWave(this.sim);
          this.renderFrame(performance.now());
        }
      });

      // Pointer interactions
      this.bindEvents();

      // Resize observer
      this.resize();
      this.observer = new ResizeObserver(() => this.resize());
      this.observer.observe(this.container);

      // IntersectionObserver: 0% CPU consumption when off-screen
      this.isIntersecting = false;
      if (typeof IntersectionObserver !== 'undefined') {
        this.io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isIntersecting = entry.isIntersecting;
            if (this.isIntersecting) {
              if (this.options.rain > 0 || (this.sim && this.sim.energy > 0.001)) {
                this.startLoop();
              }
            } else {
              this.stopLoop();
            }
          });
        }, { rootMargin: '100px 0px' });
        this.io.observe(this.container);
      } else {
        this.isIntersecting = true;
        if (this.options.rain > 0) {
          this.startLoop();
        }
      }
    }

    buildRamps() {
      const baseC = parseColor(this.options.textColor);
      const ripC = parseColor(this.options.rippleColor);
      const trgC = parseColor(this.options.troughColor);
      const up = [];
      const down = [];
      for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        up.push(lerpColor(baseC, ripC, t));
        down.push(lerpColor(baseC, trgC, t));
      }
      this.ramps = { up, down };
    }

    bindEvents() {
      const getPos = e => {
        const rect = this.container.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      };

      this.container.addEventListener('pointermove', e => {
        if (!this.options.interactive || this.reducedMotion) return;
        const pos = getPos(e);
        if (!pos) return;
        const ptr = this.pointer;
        if (!ptr.inside) {
          ptr.lastX = pos.x;
          ptr.lastY = pos.y;
          ptr.inside = true;
        }
        ptr.x = pos.x;
        ptr.y = pos.y;
        ptr.pending = true;
        this.startLoop();
      });

      this.container.addEventListener('pointerleave', () => {
        this.pointer.inside = false;
        this.pointer.pending = false;
        if (this.options.rain > 0) this.startLoop();
      });

      this.container.addEventListener('pointerdown', e => {
        if (!this.options.interactive || this.reducedMotion) return;
        const pos = getPos(e);
        if (!pos || !this.sim) return;
        addImpulse(this.sim, pos.x, pos.y, this.options.dropRadius, this.options.dropStrength);
        const ptr = this.pointer;
        ptr.x = ptr.lastX = pos.x;
        ptr.y = ptr.lastY = pos.y;
        ptr.inside = true;
        this.startLoop();
      });
    }

    resize() {
      const rect = this.container.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);

      const ctx = this.canvas.getContext('2d');
      if (!ctx) return;
      const font = `${this.options.fontWeight} ${this.options.fontSize}px ${this.options.fontFamily}`;
      ctx.font = font;
      const charWidth = ctx.measureText('M').width || 0.6 * this.options.fontSize;
      const rowHeight = this.options.fontSize * this.options.lineHeight;

      // Build grid matrix
      const cols = Math.max(1, Math.ceil(w / charWidth));
      const rows = Math.max(1, Math.ceil(h / rowHeight));
      const words = this.options.text.split(/\s+/).filter(Boolean);
      const base = [];
      let wordIdx = 0;

      for (let r = 0; r < rows; r++) {
        let line = '';
        while (line.length < cols && words.length) {
          if (line.length > 0) line += ' ';
          line += words[wordIdx % words.length];
          wordIdx++;
        }
        base.push(line.padEnd(cols, ' ').slice(0, cols).split(''));
      }

      this.grid = { cols, rows, charW: charWidth, lineH: rowHeight, base };

      // Simulation cell setup
      const cell = rowHeight / Math.max(1, Math.min(4, this.options.resolution));
      const simW = Math.max(4, Math.ceil(w / cell) + 2);
      const simH = Math.max(4, Math.ceil(h / cell) + 2);
      const len = simW * simH;
      const mask = new Float32Array(len);
      const absorbMargin =
        this.options.edges === 'absorb' ? Math.max(3, Math.round(0.08 * Math.min(simW, simH))) : 0;

      for (let y = 0; y < simH; y++) {
        for (let x = 0; x < simW; x++) {
          let m = 1;
          if (absorbMargin > 0) {
            const d = Math.min(x, y, simW - 1 - x, simH - 1 - y);
            if (d < absorbMargin) {
              const f = d / absorbMargin;
              m = 1 - (1 - f) * (1 - f) * 0.22;
            }
          }
          mask[y * simW + x] = m;
        }
      }

      this.sim = {
        w: simW,
        h: simH,
        cell,
        prev: new Float32Array(len),
        cur: new Float32Array(len),
        next: new Float32Array(len),
        mask,
        energy: 0
      };

      this.renderFrame(performance.now());
      if (this.options.rain > 0) this.startLoop();
    }

    startLoop() {
      if (this.isRunning || this.reducedMotion || !this.isIntersecting) return;
      this.isRunning = true;
      this.lastTime = performance.now();
      this.simAcc = 0;
      this.animFrame = requestAnimationFrame(t => this.tick(t));
    }

    stopLoop() {
      this.isRunning = false;
      if (this.animFrame) cancelAnimationFrame(this.animFrame);
      this.animFrame = 0;
    }

    tick(time) {
      if (!this.sim || !this.grid) {
        this.isRunning = false;
        return;
      }

      const opt = this.options;
      const dt = Math.min(0.1, (time - this.lastTime) / 1000 || 0);
      this.lastTime = time;

      const ptr = this.pointer;
      if (ptr.pending && opt.interactive && opt.dragStrength > 0) {
        const dx = ptr.x - ptr.lastX;
        const dy = ptr.y - ptr.lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.5) {
          const steps = Math.min(6, Math.max(1, Math.ceil(dist / opt.dragRadius)));
          const str = (opt.dragStrength * Math.min(1, dist / (1.5 * opt.dragRadius))) / steps;
          for (let s = 1; s <= steps; s++) {
            const f = s / steps;
            addImpulse(this.sim, ptr.lastX + dx * f, ptr.lastY + dy * f, opt.dragRadius, str);
          }
        }
        ptr.lastX = ptr.x;
        ptr.lastY = ptr.y;
        ptr.pending = false;
      }

      const isRaining = opt.rain > 0 && !(ptr.inside && opt.interactive);
      if (isRaining) {
        this.rainAcc += dt * opt.rain;
        while (this.rainAcc >= 1) {
          this.rainAcc -= 1;
          addImpulse(
            this.sim,
            Math.random() * this.grid.cols * this.grid.charW,
            Math.random() * this.grid.rows * this.grid.lineH,
            opt.dropRadius * (0.6 + 0.6 * Math.random()),
            opt.rainStrength * (0.6 + 0.8 * Math.random())
          );
        }
      } else {
        this.rainAcc = 0;
      }

      const sSpeed = 0.02 + 0.4 * clamp01(opt.speed);
      const sVisc = Math.min(0.49 - sSpeed, 0.12 * clamp01(opt.viscosity));
      const sDamp = Math.min(0.5, Math.max(0, opt.damping));

      this.simAcc += dt;
      let subSteps = 0;
      while (this.simAcc >= STEP_DT && subSteps < 4) {
        stepWave(this.sim, sSpeed, sVisc, sDamp, opt.edges);
        this.simAcc -= STEP_DT;
        subSteps++;
      }
      if (subSteps === 4) this.simAcc = 0;

      if (this.sim.energy < 0.0015 && !isRaining) {
        calmWave(this.sim);
        this.renderFrame(time);
        this.isRunning = false;
        this.animFrame = 0;
        return;
      }

      this.renderFrame(time);
      this.animFrame = requestAnimationFrame(t => this.tick(t));
    }

    renderFrame(time) {
      if (!this.canvas || !this.grid || !this.sim) return;

      const ctx = this.canvas.getContext('2d');
      if (!ctx) return;

      const opt = this.options;
      const { cols, rows, charW, lineH, base } = this.grid;
      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;
      const dpr = this.canvas.width / Math.max(1, width);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${opt.fontWeight} ${opt.fontSize}px ${opt.fontFamily}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      const glyphs = opt.chars.length ? opt.chars : DEFAULT_CHARS;
      const glyphLen = glyphs.length;
      const hasEnergy = this.sim.energy > 0.0015;
      const scrambleSeed = Math.floor(time / Math.max(16, opt.scrambleSpeed));
      const sampleOut = this.sampleVec;
      const res = opt.resolution;
      const displaced = [];

      ctx.globalAlpha = opt.textOpacity;
      ctx.fillStyle = this.ramps.up[0];

      for (let row = 0; row < rows; row++) {
        const rowChars = base[row];
        const centerY = row * lineH + lineH / 2;
        let staticStr = '';

        if (hasEnergy) {
          for (let col = 0; col < cols; col++) {
            sampleField(this.sim, col * charW + charW / 2, centerY, sampleOut);
            const heightVal = sampleOut[0];
            const slopeX = sampleOut[1] * res;
            const slopeY = sampleOut[2] * res;
            const slopeMag = Math.sqrt(slopeX * slopeX + slopeY * slopeY);
            const intensity = clamp01(
              (Math.abs(heightVal) * opt.sensitivity + slopeMag * opt.slopeGain - 0.12) * 1.14
            );

            if (intensity < 0.02) {
              staticStr += rowChars[col];
              continue;
            }

            const targetCol = Math.min(
              cols - 1,
              Math.max(0, Math.round(col + slopeX * opt.refraction * 2))
            );
            const targetRow = Math.min(
              rows - 1,
              Math.max(0, Math.round(row + slopeY * opt.refraction))
            );
            let ch = base[targetRow][targetCol];

            const threshold = 0.5 + (hash(col, row, 0) - 0.5) * opt.dither;
            if (intensity * opt.scramble >= threshold) {
              const jitter = (hash(col, row, scrambleSeed) - 0.5) * glyphLen * 0.3;
              const glyphIdx = Math.max(
                0,
                Math.min(glyphLen - 1, Math.round(intensity * (glyphLen - 1) + jitter))
              );
              ch = glyphs[glyphIdx];
            }

            if (ch === ' ') {
              staticStr += ' ';
              continue;
            }

            const ramp = heightVal >= 0 ? this.ramps.up : this.ramps.down;
            displaced.push({
              x: col * charW,
              y: centerY,
              ch,
              color: ramp[Math.round(24 * intensity)]
            });
            staticStr += ' ';
          }
        } else {
          staticStr = rowChars.join('');
        }

        ctx.fillText(staticStr, 0, centerY);
      }

      if (displaced.length) {
        ctx.globalAlpha = 1;
        let activeColor = '';
        for (let i = 0; i < displaced.length; i++) {
          const item = displaced[i];
          if (item.color !== activeColor) {
            ctx.fillStyle = item.color;
            activeColor = item.color;
          }
          ctx.fillText(item.ch, item.x, item.y);
        }
      }

      // Vignette fade
      if (opt.vignette > 0) {
        ctx.globalAlpha = 1;
        const vSize = clamp01(opt.vignette) * (Math.min(width, height) / 2);
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';

        const drawGrad = (x0, y0, x1, y1) => {
          const grad = ctx.createLinearGradient(x0, y0, x1, y1);
          grad.addColorStop(0, 'rgba(0,0,0,1)');
          grad.addColorStop(0.3, 'rgba(0,0,0,0.6)');
          grad.addColorStop(0.7, 'rgba(0,0,0,0.15)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        };

        drawGrad(0, 0, vSize, 0);
        drawGrad(width, 0, width - vSize, 0);
        drawGrad(0, 0, 0, vSize);
        drawGrad(0, height, 0, height - vSize);
        ctx.restore();
      }

      if (opt.backgroundColor && opt.backgroundColor !== 'transparent') {
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = opt.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    drop(x, y, strength = this.options.dropStrength, radius = this.options.dropRadius) {
      if (this.sim && !this.reducedMotion) {
        addImpulse(this.sim, x, y, radius, strength);
        this.startLoop();
      }
    }

    calm() {
      if (this.sim) {
        calmWave(this.sim);
        this.renderFrame(performance.now());
      }
    }
  }

  function initAll() {
    const els = document.querySelectorAll('[data-ascii-ripple], .ascii-ripple-container');
    els.forEach(el => {
      if (!el.hasAttribute('data-ascii-ripple-initialized')) {
        el.setAttribute('data-ascii-ripple-initialized', 'true');
        new AsciiRipple(el);
      }
    });
  }

  window.AsciiRipple = AsciiRipple;
  window.AsciiRipple.initAll = initAll;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
