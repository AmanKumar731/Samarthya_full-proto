/**
 * CircularCarousel — React Bits 3D Interactive Carousel
 * Vanilla JavaScript Port for Samarthya AI Portal
 * 
 * Features:
 * - 3D Ring presets: cylinder, orbit, wheel, panorama
 * - Smooth physics: spring snapping (SPRING = 118), momentum flick/throw
 * - Real-time perspective fitting and camera tracking
 * - Depth fading, card curvature tiling, and pointer parallax tilt
 * - Touch swipe, trackpad wheel, and keyboard navigation
 * - Autoplay drift or step modes with pauseOnHover
 * - IntersectionObserver viewport pausing (0% CPU when off-screen)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CircularCarousel = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PRESETS = {
    cylinder: {
      axis: 'y',
      tilt: -5,
      perspective: 2500,
      curve: 1,
      spread: 1,
      inward: false,
      billboard: false,
      backfaces: true,
      window: 0
    },
    orbit: {
      axis: 'y',
      tilt: -16,
      perspective: 1500,
      curve: 0,
      spread: 1.45,
      inward: false,
      billboard: true,
      backfaces: false,
      window: 0
    },
    wheel: {
      axis: 'x',
      tilt: 0,
      perspective: 1800,
      curve: 0,
      spread: 1,
      inward: false,
      billboard: false,
      backfaces: true,
      window: 1.7
    },
    panorama: {
      axis: 'y',
      tilt: 0,
      perspective: 0,
      curve: 1,
      spread: 1,
      inward: true,
      billboard: false,
      backfaces: false,
      window: 0
    }
  };

  const INTRO_LENGTH = { assemble: 1500, rise: 1400, spin: 1800, none: 0 };
  const TILES = 8;
  const OVERLAP = 2.5;
  const DRAG_THRESHOLD = 5;
  const SPRING = 118;
  const SETTLE_SPEED = 9;
  const CAPTION_SPACE = 76;
  const TO_RAD = Math.PI / 180;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const wrap = degrees => ((((degrees + 180) % 360) + 360) % 360) - 180;
  const easeOut = t => 1 - Math.pow(1 - t, 4);
  const easeOutQuint = t => 1 - Math.pow(1 - t, 5);

  const rotateX = (p, degrees) => {
    const r = degrees * TO_RAD;
    const c = Math.cos(r);
    const s = Math.sin(r);
    return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
  };

  const rotateY = (p, degrees) => {
    const r = degrees * TO_RAD;
    const c = Math.cos(r);
    const s = Math.sin(r);
    return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
  };

  class CircularCarousel {
    constructor(container, options = {}) {
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      if (!container) {
        console.warn('[CircularCarousel] Container not found.');
        return;
      }

      this.root = container;
      this.root.classList.add('circular-carousel');

      this.options = Object.assign(
        {
          items: [],
          preset: 'cylinder',
          intro: 'rise',
          cardWidth: 260,
          aspectRatio: 1.25,
          gap: 28,
          curve: undefined,
          tilt: undefined,
          perspective: undefined,
          autoplay: 'drift',
          speed: 12,
          interval: 3,
          direction: 'left',
          draggable: true,
          momentum: 0.65,
          snap: true,
          pauseOnHover: true,
          focusOnClick: true,
          parallax: 0.35,
          stretch: 0.45,
          depthFade: 0.6,
          fadeColor: '#090A0F',
          innerShade: 0.6,
          cornerRadius: 14,
          captions: true,
          onChange: null,
          onItemClick: null
        },
        options
      );

      this.list = this.options.items && this.options.items.length ? this.options.items : [];
      this.count = this.list.length;
      if (!this.count) {
        console.warn('[CircularCarousel] No items provided.');
        return;
      }

      const presetKey = PRESETS[this.options.preset] ? this.options.preset : 'cylinder';
      this.layout = PRESETS[presetKey];
      this.axis = this.layout.axis;
      this.tiltValue = this.options.tilt !== undefined ? this.options.tilt : this.layout.tilt;
      this.curveValue = this.layout.billboard
        ? 0
        : clamp(this.options.curve !== undefined ? this.options.curve : this.layout.curve, 0, 1);

      this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

      this.cardW = Math.max(40, this.options.cardWidth);
      this.cardH = this.cardW / clamp(this.options.aspectRatio, 0.2, 5);
      this.along = this.axis === 'x' ? this.cardH : this.cardW;
      this.step = 360 / this.count;

      this.dragSign = this.layout.inward ? -1 : 1;
      this.directionSign = (this.options.direction === 'right' ? 1 : -1) * this.dragSign;

      this._calcRadius();
      this._calcTiles();

      this.active = 0;
      this.ready = false;
      this.dragging = false;
      this.raf = 0;
      this.visible = false;
      this.alive = true;

      this.state = {
        angle: 0,
        velocity: 0,
        target: null,
        dir: this.directionSign,
        press: null,
        drag: false,
        hover: false,
        pointer: { inside: false, x: 0, y: 0 },
        yaw: 0,
        pitch: 0,
        intro: null,
        introDone: false,
        holdUntil: 0,
        stepAt: 0,
        suppressClick: false,
        wheelTimer: 0,
        fit: 1,
        shift: 0,
        drop: 0,
        last: 0
      };

      this._buildDOM();
      this._bindEvents();
      this._preloadImages();
    }

    _calcRadius() {
      const n = Math.max(this.count, 3);
      const pitch = (this.along + this.options.gap) * this.layout.spread;
      const chord = pitch / (2 * Math.sin(Math.PI / n));
      const arc = (n * pitch) / (2 * Math.PI);
      this.radius = Math.max(chord + (arc - chord) * this.curveValue, this.along * 0.6);
    }

    _calcTiles() {
      const total = this.curveValue > 0.001 ? TILES : 1;
      const length = this.along / total;
      const bend = this.curveValue > 0.001 ? this.radius / this.curveValue : 0;
      this.tiles = Array.from({ length: total }, (_, index) => {
        const start = index * length - (index > 0 ? OVERLAP / 2 : 0);
        const end = (index + 1) * length + (index < total - 1 ? OVERLAP / 2 : 0);
        const center = (start + end) / 2 - this.along / 2;
        const alpha = bend ? center / bend : 0;
        const shift = bend ? bend * Math.sin(alpha) : center;
        const sink = bend ? bend * (1 - Math.cos(alpha)) : 0;
        const depth = this.layout.inward ? sink : -sink;
        const turn = ((this.layout.inward ? -alpha : alpha) * 180) / Math.PI;
        const move =
          this.axis === 'x'
            ? `translate3d(0px, ${shift}px, ${depth}px) rotateX(${-turn}deg)`
            : `translate3d(${shift}px, 0px, ${depth}px) rotateY(${turn}deg)`;
        return { index, total, start, end, size: end - start, move };
      });
    }

    _buildDOM() {
      this.root.style.setProperty('--cc-fade', this.options.fadeColor);
      this.root.style.setProperty('--cc-radius', `${Math.max(0, this.options.cornerRadius)}px`);
      this.root.style.setProperty('--cc-inner', (1 - clamp(this.options.innerShade, 0, 1)).toFixed(3));
      this.root.setAttribute('data-axis', this.axis);
      this.root.setAttribute('data-shape', this.options.preset);
      if (this.options.draggable) this.root.setAttribute('data-draggable', '');
      this.root.tabIndex = 0;

      this.root.innerHTML = `
        <div class="circular-carousel__view">
          <div class="circular-carousel__stage">
            <div class="circular-carousel__camera">
              <div class="circular-carousel__ring"></div>
            </div>
          </div>
        </div>
        ${this.options.captions ? `
        <div class="circular-carousel__caption" aria-hidden="true">
          <span class="circular-carousel__title">
            <span class="cc-caption-main"></span>
            <span class="circular-carousel__subtitle"></span>
          </span>
          <span class="circular-carousel__count">
            <span class="circular-carousel__digits">
              <span class="circular-carousel__digit">
                <span class="circular-carousel__reel cc-reel-tens">
                  ${'0123456789'.split('').map(n => `<span>${n}</span>`).join('')}
                </span>
              </span>
              <span class="circular-carousel__digit">
                <span class="circular-carousel__reel cc-reel-ones">
                  ${'0123456789'.split('').map(n => `<span>${n}</span>`).join('')}
                </span>
              </span>
            </span>
            <span class="circular-carousel__slash">/</span>
            <span>${String(this.count).padStart(2, '0')}</span>
          </span>
        </div>` : ''}
        <div class="circular-carousel__live" aria-live="polite" aria-atomic="true"></div>
      `;

      this.stage = this.root.querySelector('.circular-carousel__stage');
      this.camera = this.root.querySelector('.circular-carousel__camera');
      this.ring = this.root.querySelector('.circular-carousel__ring');
      this.liveEl = this.root.querySelector('.circular-carousel__live');

      if (this.options.captions) {
        this.captionMain = this.root.querySelector('.cc-caption-main');
        this.captionSub = this.root.querySelector('.circular-carousel__subtitle');
        this.reelTens = this.root.querySelector('.cc-reel-tens');
        this.reelOnes = this.root.querySelector('.cc-reel-ones');
      }

      this.cardEls = [];
      for (let i = 0; i < this.count; i++) {
        const item = this.list[i];
        const card = document.createElement('div');
        card.className = 'circular-carousel__card';
        card.setAttribute('data-cc-index', i);
        card.setAttribute('role', 'group');
        card.setAttribute('aria-roledescription', 'slide');
        card.setAttribute('aria-label', `${item.title || item.alt || `Item ${i + 1}`}, ${i + 1} of ${this.count}`);

        const frontTiles = this.tiles.map(tile => this._renderTileHTML(item, tile, false, i)).join('');
        const backTiles = this.layout.backfaces
          ? this.tiles.map(tile => this._renderTileHTML(item, tile, true, i)).join('')
          : '';

        card.innerHTML = frontTiles + backTiles;
        this.ring.appendChild(card);
        this.cardEls.push(card);
      }

      this._updateCaption(0);
    }

    _renderTileHTML(item, tile, back, index) {
      const strip = back ? tile.total - 1 - tile.index : tile.index;
      const first = strip === 0;
      const last = strip === tile.total - 1;
      const r = 'var(--cc-radius)';
      const frameRadius =
        this.axis === 'x'
          ? `${first ? r : 0} ${first ? r : 0} ${last ? r : 0} ${last ? r : 0}`
          : `${first ? r : 0} ${last ? r : 0} ${last ? r : 0} ${first ? r : 0}`;
      const offset = back ? this.along - tile.end : tile.start;
      const size = tile.size;
      const box =
        this.axis === 'x'
          ? `left:${-this.cardW / 2}px; top:${-size / 2}px; width:${this.cardW}px; height:${size}px;`
          : `left:${-size / 2}px; top:${-this.cardH / 2}px; width:${size}px; height:${this.cardH}px;`;
      const photoStyle =
        this.axis === 'x'
          ? `left:0px; top:${-offset}px; width:${this.cardW}px; height:${this.cardH}px;`
          : `left:${-offset}px; top:0px; width:${this.cardW}px; height:${this.cardH}px;`;
      const flip = this.axis === 'x' ? ' rotateX(180deg)' : ' rotateY(180deg)';

      return `
        <div class="circular-carousel__tile" style="${box} transform:${tile.move}${back ? flip : ''};" aria-hidden="true">
          <div class="circular-carousel__frame" style="height:${this.axis === 'x' ? size : this.cardH}px; border-radius:${frameRadius};">
            <img class="circular-carousel__photo" src="${item.src}" alt="" draggable="false" decoding="async" style="${photoStyle}" />
            ${back ? '<div class="circular-carousel__inner"></div>' : ''}
            <div class="circular-carousel__shade"></div>
            ${!back && item.badge ? `<div class="circular-carousel__badge">${item.badge}</div>` : ''}
          </div>
        </div>
      `;
    }

    _preloadImages() {
      const sources = this.list.slice(0, 16).map(item => item.src);
      const load = src =>
        new Promise(resolve => {
          const image = new Image();
          image.decoding = 'async';
          image.onload = () => (image.decode ? image.decode().then(resolve, resolve) : resolve());
          image.onerror = resolve;
          image.src = src;
        });

      const timeout = new Promise(resolve => setTimeout(resolve, 2000));
      Promise.race([Promise.all(sources.map(load)), timeout]).then(() => {
        if (!this.alive) return;
        this.ready = true;
        this.root.setAttribute('data-ready', '');
        this.measure();
        this.wake();
      });
    }

    _bindEvents() {
      this.wake = () => {
        if (!this.raf && this.visible && !document.hidden && this.alive) {
          this.raf = requestAnimationFrame(this.frame.bind(this));
        }
      };

      this.onResize = () => {
        this.measure();
        this.wake();
      };
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(this.root);

      this.intersectionObserver = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        if (this.visible) this.wake();
        else {
          cancelAnimationFrame(this.raf);
          this.raf = 0;
          this.state.last = 0;
        }
      });
      this.intersectionObserver.observe(this.root);

      this.onVisibilityChange = () => {
        if (document.hidden) {
          cancelAnimationFrame(this.raf);
          this.raf = 0;
          this.state.last = 0;
        } else {
          this.wake();
        }
      };
      document.addEventListener('visibilitychange', this.onVisibilityChange);

      // Pointer events
      this.onPointerDown = e => {
        this.state.suppressClick = false;
        if (!this.options.draggable || e.button !== 0) return;
        this.state.press = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          angle: this.state.angle,
          moved: false,
          origin: 0,
          samples: [{ time: performance.now(), angle: this.state.angle }]
        };
      };

      this.onPointerMove = e => {
        if (e.pointerType === 'mouse') {
          this.state.pointer.inside = true;
          this.updatePointer(e);
        }
        const press = this.state.press;
        if (!press || press.id !== e.pointerId) {
          this.wake();
          return;
        }
        const delta = this.axis === 'x' ? e.clientY - press.y : e.clientX - press.x;
        const cross = this.axis === 'x' ? e.clientX - press.x : e.clientY - press.y;
        if (!press.moved) {
          if (Math.abs(delta) < DRAG_THRESHOLD) return;
          if (Math.abs(cross) > Math.abs(delta) * 1.2 && e.pointerType !== 'mouse') {
            this.state.press = null;
            return;
          }
          press.moved = true;
          press.origin = delta;
          this.state.drag = true;
          this.state.target = null;
          this.state.velocity = 0;
          this.dragging = true;
          this.root.setAttribute('data-dragging', '');
          try {
            this.root.setPointerCapture(e.pointerId);
          } catch {}
        }
        const perPixel = 180 / (Math.PI * this.radius * this.state.fit);
        this.state.angle = press.angle + (delta - press.origin) * perPixel * (this.layout.inward ? -1 : 1);
        const now = performance.now();
        press.samples.push({ time: now, angle: this.state.angle });
        while (press.samples.length > 2 && now - press.samples[0].time > 110) press.samples.shift();
        this.wake();
      };

      this.releasePointer = e => {
        const press = this.state.press;
        if (!press || press.id !== e.pointerId) return;
        this.state.press = null;
        if (!press.moved) return;
        this.state.drag = false;
        this.dragging = false;
        this.root.removeAttribute('data-dragging');
        this.state.suppressClick = true;

        const first = press.samples[0];
        const last = press.samples[press.samples.length - 1];
        const span = (last.time - first.time) / 1000;
        const velocity = span > 0.008 ? clamp((last.angle - first.angle) / span, -1400, 1400) : 0;
        this.state.velocity = velocity;
        if (Math.abs(velocity) > 60) this.state.dir = Math.sign(velocity);
        const coasting =
          this.options.autoplay === 'drift' &&
          !(this.options.pauseOnHover && this.state.hover && e.pointerType === 'mouse');
        if (this.options.snap && !coasting) {
          const tau = 0.18 + this.options.momentum * 1.5;
          this.state.target = Math.round((this.state.angle + velocity * tau * 0.55) / this.step) * this.step;
        }
        this.wake();
      };

      this.onPointerEnter = e => {
        if (e.pointerType !== 'mouse') return;
        this.state.hover = true;
        this.wake();
      };

      this.onPointerLeave = e => {
        if (e.pointerType === 'mouse') {
          this.state.hover = false;
          this.state.pointer.inside = false;
        }
        this.wake();
      };

      this.onClick = e => {
        if (this.state.suppressClick) {
          this.state.suppressClick = false;
          return;
        }
        const card = e.target.closest?.('[data-cc-index]');
        if (!card) return;
        const index = Number(card.getAttribute('data-cc-index'));
        if (this.options.focusOnClick) this.focusIndex(index);
        if (typeof this.options.onItemClick === 'function') {
          this.options.onItemClick(this.list[index], index);
        }
      };

      this.onKeyDown = e => {
        const forward = this.axis === 'x' ? 'ArrowDown' : 'ArrowRight';
        const backward = this.axis === 'x' ? 'ArrowUp' : 'ArrowLeft';
        if (e.key === forward) this.stepBy(1);
        else if (e.key === backward) this.stepBy(-1);
        else if (e.key === 'Home') this.focusIndex(0);
        else if (e.key === 'End') this.focusIndex(this.count - 1);
        else if (e.key === 'Enter' || e.key === ' ') {
          if (typeof this.options.onItemClick === 'function') {
            this.options.onItemClick(this.list[this.active], this.active);
          }
        } else return;
        e.preventDefault();
      };

      this.onWheel = e => {
        if (!this.options.draggable) return;
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
        if (!delta) return;
        e.preventDefault();
        const perPixel = 180 / (Math.PI * this.radius * this.state.fit);
        this.state.target = null;
        this.state.angle -= delta * perPixel * (this.layout.inward ? -1 : 1);
        this.state.velocity = -delta * perPixel * (this.layout.inward ? -1 : 1) * 30;
        this.state.holdUntil = performance.now() + 1600;
        clearTimeout(this.state.wheelTimer);
        this.state.wheelTimer = setTimeout(() => {
          if (this.options.snap) {
            this.state.target = this.nearest(this.state.angle + this.state.velocity * 0.12);
          }
          this.wake();
        }, 140);
        this.wake();
      };

      this.root.addEventListener('pointerdown', this.onPointerDown);
      this.root.addEventListener('pointermove', this.onPointerMove);
      this.root.addEventListener('pointerup', this.releasePointer);
      this.root.addEventListener('pointercancel', this.releasePointer);
      this.root.addEventListener('pointerenter', this.onPointerEnter);
      this.root.addEventListener('pointerleave', this.onPointerLeave);
      this.root.addEventListener('click', this.onClick);
      this.root.addEventListener('keydown', this.onKeyDown);
      this.root.addEventListener('wheel', this.onWheel, { passive: false });
    }

    updatePointer(e) {
      const rect = this.root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      this.state.pointer.x = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      this.state.pointer.y = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    }

    nearest(angle) {
      return Math.round(angle / this.step) * this.step;
    }

    measure() {
      const rect = this.root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const room = this.options.captions ? CAPTION_SPACE : 0;
      const width = rect.width * 0.94;
      const height = (rect.height - room) * 0.92;
      const P = this.layout.inward
        ? this.radius
        : this.options.perspective !== undefined
        ? this.options.perspective
        : this.layout.perspective;

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      if (this.layout.inward) {
        minX = -width / 2;
        maxX = width / 2;
        minY = -this.cardH / 2;
        maxY = this.cardH / 2;
      } else {
        const corners = [
          [-this.cardW / 2, -this.cardH / 2],
          [this.cardW / 2, -this.cardH / 2],
          [-this.cardW / 2, this.cardH / 2],
          [this.cardW / 2, this.cardH / 2]
        ];
        const limit = this.layout.window ? this.layout.window * this.step : 180;
        for (let a = -limit; a <= limit; a += limit / 24) {
          for (const [cx, cy] of corners) {
            let p;
            if (this.axis === 'x') {
              p = rotateY(rotateX([cx, cy, this.radius], -a), this.tiltValue);
            } else if (this.layout.billboard) {
              const c = rotateY([0, 0, this.radius], a);
              p = rotateX([c[0] + cx, cy, c[2]], this.tiltValue);
            } else {
              p = rotateX(rotateY([cx, cy, this.radius], a), this.tiltValue);
            }
            p = [p[0], p[1], p[2] - this.radius];
            if (p[2] >= P * 0.95) continue;
            const k = P / (P - p[2]);
            minX = Math.min(minX, p[0] * k);
            maxX = Math.max(maxX, p[0] * k);
            minY = Math.min(minY, p[1] * k);
            maxY = Math.max(maxY, p[1] * k);
          }
        }
      }

      const spanX = Math.max(maxX - minX, 1);
      const spanY = Math.max(maxY - minY, 1);
      const fit = Math.min(1, width / spanX, height / spanY);
      this.state.fit = fit;
      this.state.shift = -((minY + maxY) / 2) * fit - room / 2;
      this.state.drop =
        this.axis === 'x'
          ? (rect.width / fit) * 0.55 + this.cardW
          : (rect.height / fit) * 0.55 + this.cardH;

      this.stage.style.perspective = `${P}px`;
      this.stage.style.transform = `translate3d(0, ${this.state.shift}px, 0) scale(${fit})`;
    }

    introCard(elapsed, landing) {
      if (!this.state.intro) return { radius: 1, lift: 0 };
      const type = this.state.intro.type;
      const reach = Math.abs(wrap(landing + this.state.angle));
      if (type === 'assemble') {
        const delay = (reach / 180) * 420;
        const p = easeOut(clamp((elapsed - delay) / 1080, 0, 1));
        return { radius: 1 + 0.6 * (1 - p), lift: 0 };
      }
      if (type === 'rise') {
        const delay = (reach / 180) * 480;
        const p = easeOutQuint(clamp((elapsed - delay) / 900, 0, 1));
        return { radius: 1, lift: (1 - p) * this.state.drop };
      }
      if (type === 'spin') {
        const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1));
        return { radius: 1 + 0.28 * (1 - p), lift: 0 };
      }
      return { radius: 1, lift: 0 };
    }

    advance(dt, now) {
      if (!this.state.introDone && this.ready) {
        if (!this.state.intro) {
          if (this.options.intro === 'none' || this.reducedMotion) {
            this.state.introDone = true;
          } else {
            this.state.intro = { type: this.options.intro, start: now };
          }
        }
        if (this.state.intro && now - this.state.intro.start >= (INTRO_LENGTH[this.state.intro.type] || 0)) {
          this.state.intro = null;
          this.state.introDone = true;
        }
      }

      const paused =
        (this.options.pauseOnHover && this.state.hover) || this.state.drag || now < this.state.holdUntil;
      const cruise =
        this.options.autoplay === 'drift' && !paused && !this.state.intro && !this.reducedMotion
          ? this.options.speed * this.state.dir
          : 0;
      let busy = Boolean(this.state.intro) || this.state.drag;

      if (this.state.drag || this.state.intro) {
        this.state.velocity = this.state.drag ? this.state.velocity : 0;
      } else if (this.state.target !== null) {
        let remaining = dt;
        const damping = 2 * Math.sqrt(SPRING);
        while (remaining > 0) {
          const h = Math.min(remaining, 1 / 240);
          const accel = SPRING * (this.state.target - this.state.angle) - damping * this.state.velocity;
          this.state.velocity += accel * h;
          this.state.angle += this.state.velocity * h;
          remaining -= h;
        }
        if (Math.abs(this.state.target - this.state.angle) < 0.004 && Math.abs(this.state.velocity) < 0.03) {
          this.state.angle = this.state.target;
          this.state.velocity = 0;
          this.state.target = null;
        }
        busy = true;
      } else {
        const tau = 0.18 + this.options.momentum * 1.5;
        this.state.velocity += (cruise - this.state.velocity) * (1 - Math.exp(-dt / tau));
        this.state.angle += this.state.velocity * dt;
        if (cruise === 0 && this.options.snap && Math.abs(this.state.velocity) < SETTLE_SPEED) {
          this.state.target = this.nearest(this.state.angle);
        }
        busy = busy || cruise !== 0 || Math.abs(this.state.velocity) > 0.01 || this.state.target !== null;
      }

      if (
        this.options.autoplay === 'step' &&
        !paused &&
        !this.state.intro &&
        this.state.introDone &&
        !this.reducedMotion
      ) {
        if (!this.state.stepAt) this.state.stepAt = now + this.options.interval * 1000;
        if (now >= this.state.stepAt) {
          this.state.target = (this.state.target ?? this.nearest(this.state.angle)) + this.step * this.state.dir;
          this.state.stepAt = now + this.options.interval * 1000;
        }
        busy = true;
      } else {
        this.state.stepAt = 0;
      }

      if (now < this.state.holdUntil) busy = true;

      const ease = 1 - Math.exp(-dt / 0.35);
      const parallaxVal = this.reducedMotion ? 0 : clamp(this.options.parallax, 0, 1);
      const aimYaw = this.state.pointer.inside ? this.state.pointer.x * parallaxVal * 9 : 0;
      const aimPitch = this.state.pointer.inside ? -this.state.pointer.y * parallaxVal * 6 : 0;
      this.state.yaw += (aimYaw - this.state.yaw) * ease;
      this.state.pitch += (aimPitch - this.state.pitch) * ease;
      if (Math.abs(aimYaw - this.state.yaw) > 0.01 || Math.abs(aimPitch - this.state.pitch) > 0.01) busy = true;

      return busy;
    }

    render(now) {
      const elapsed = this.state.intro ? now - this.state.intro.start : 0;
      const stretchVal = this.reducedMotion ? 0 : clamp(this.options.stretch, 0, 1);
      const swell = 1 + stretchVal * 0.12 * Math.min(1, Math.abs(this.state.velocity) / 420);
      let spinOffset = 0;
      if (this.state.intro?.type === 'spin') {
        const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1));
        spinOffset = -300 * this.state.dir * (1 - p);
      } else if (this.state.intro?.type === 'assemble') {
        const p = easeOut(clamp(elapsed / INTRO_LENGTH.assemble, 0, 1));
        spinOffset = -32 * this.state.dir * (1 - p);
      }
      const angle = this.state.angle + spinOffset;
      const R = this.radius * swell;

      if (this.axis === 'x') {
        this.camera.style.transform = `translate3d(0, 0, ${-R}px) rotateY(${this.tiltValue + this.state.yaw}deg) rotateX(${this.state.pitch}deg)`;
        this.ring.style.transform = `rotateX(${-angle}deg)`;
      } else if (this.layout.inward) {
        const P = this.options.perspective !== undefined ? this.options.perspective : this.radius;
        this.camera.style.transform = `translate3d(0, 0, ${P - 1}px) rotateX(${this.tiltValue + this.state.pitch}deg) rotateY(${this.state.yaw}deg)`;
        this.ring.style.transform = `rotateY(${angle}deg)`;
      } else {
        this.camera.style.transform = `translate3d(0, 0, ${-R}px) rotateX(${this.tiltValue + this.state.pitch}deg) rotateY(${this.state.yaw}deg)`;
        this.ring.style.transform = `rotateY(${angle}deg)`;
      }

      for (let index = 0; index < this.count; index++) {
        const card = this.cardEls[index];
        if (!card) continue;
        const base = index * this.step;
        const mod = this.introCard(elapsed, base);
        const r = R * mod.radius;
        let transform;
        if (this.axis === 'x') {
          transform = `rotateX(${-base}deg) translateZ(${r}px)`;
        } else if (this.layout.inward) {
          transform = `rotateY(${base}deg) translateZ(${-r}px)`;
        } else {
          transform = `rotateY(${base}deg) translateZ(${r}px)`;
          if (this.layout.billboard) transform += ` rotateY(${-(base + angle)}deg)`;
        }
        if (mod.lift) {
          transform += this.axis === 'x' ? ` translateX(${mod.lift}px)` : ` translateY(${mod.lift}px)`;
        }
        card.style.transform = transform;

        const world = wrap(base + angle);
        const facing = Math.cos(world * TO_RAD);
        if (this.layout.inward) card.style.visibility = Math.abs(world) > 86 ? 'hidden' : '';
        const fade = this.options.depthFade * Math.pow((1 - facing) / 2, 1.25);
        card.style.setProperty('--cc-depth', fade.toFixed(3));
      }

      const activeIndex =
        ((Math.round(-this.state.angle / this.step) % this.count) + this.count) % this.count || 0;
      if (activeIndex !== this.active) {
        this.active = activeIndex;
        this._updateCaption(activeIndex);
        if (typeof this.options.onChange === 'function') {
          this.options.onChange(activeIndex);
        }
      }
    }

    _updateCaption(index) {
      const item = this.list[index] || this.list[0];
      if (!item) return;
      if (this.captionMain) this.captionMain.textContent = item.title || item.alt || '';
      if (this.captionSub) this.captionSub.textContent = item.subtitle ? ` — ${item.subtitle}` : '';

      const numStr = String(index + 1).padStart(2, '0');
      if (this.reelTens) {
        this.reelTens.style.transform = `translateY(${-Number(numStr[0]) * 10}%)`;
      }
      if (this.reelOnes) {
        this.reelOnes.style.transform = `translateY(${-Number(numStr[1]) * 10}%)`;
      }
      if (this.liveEl) {
        this.liveEl.textContent = `${item.title || item.alt || `Item ${index + 1}`}, ${index + 1} of ${this.count}`;
      }
    }

    frame(now) {
      this.raf = 0;
      const dt = this.state.last ? Math.min((now - this.state.last) / 1000, 0.05) : 1 / 60;
      this.state.last = now;
      const busy = this.advance(dt, now);
      this.render(now);
      if (busy && this.visible && !document.hidden && this.alive) {
        this.raf = requestAnimationFrame(this.frame.bind(this));
      } else {
        this.state.last = 0;
      }
    }

    focusIndex(index) {
      let target = -index * this.step;
      target += 360 * Math.round((this.state.angle - target) / 360);
      this.state.target = target;
      this.state.holdUntil = performance.now() + 2800;
      this.wake();
    }

    stepBy(delta) {
      const base = this.state.target ?? Math.round(this.state.angle / this.step) * this.step;
      this.state.target = base - delta * this.step * (this.layout.inward ? -1 : 1);
      this.state.holdUntil = performance.now() + 2800;
      this.wake();
    }

    destroy() {
      this.alive = false;
      cancelAnimationFrame(this.raf);
      this.resizeObserver?.disconnect();
      this.intersectionObserver?.disconnect();
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      clearTimeout(this.state.wheelTimer);
      if (this.root) {
        this.root.removeEventListener('pointerdown', this.onPointerDown);
        this.root.removeEventListener('pointermove', this.onPointerMove);
        this.root.removeEventListener('pointerup', this.releasePointer);
        this.root.removeEventListener('pointercancel', this.releasePointer);
        this.root.removeEventListener('pointerenter', this.onPointerEnter);
        this.root.removeEventListener('pointerleave', this.onPointerLeave);
        this.root.removeEventListener('click', this.onClick);
        this.root.removeEventListener('keydown', this.onKeyDown);
        this.root.removeEventListener('wheel', this.onWheel);
      }
    }
  }

  return CircularCarousel;
});
