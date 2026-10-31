/**
 * React Bits ScrollExpand Engine (Vanilla JS implementation)
 * High-Performance, Silky-Smooth GPU-accelerated frame expander.
 * Uses IntersectionObserver to consume 0% CPU when off-screen.
 */

(function () {
  'use strict';

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
    return t * t * (3 - 2 * t);
  };

  class ScrollExpand {
    constructor(container, options = {}) {
      this.root = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.root) return;

      const defaults = {
        src: '',
        mediaType: 'image',
        poster: '',
        alt: '',
        title: '',
        scrollHint: '',
        startWidth: 44,
        startHeight: 56,
        startRadius: 24,
        endRadius: 0,
        mediaZoom: 1.32,
        scrollDistance: 1.2,
        holdDistance: 0.45,
        smoothing: 0.08,
        overlayScrim: 0.65,
        useWindowScroll: true,
        enabled: true
      };

      this.options = Object.assign({}, defaults, options);
      this.current = 0;
      this.target = 0;
      this.stageH = 0;
      this.running = false;
      this.raf = 0;
      this.isIntersecting = false;
      this.lastAppliedProgress = -1;

      this.buildDOM();
      this.bindEvents();
    }

    buildDOM() {
      const opt = this.options;
      this.root.classList.add('scroll-expand');

      let track = this.root.querySelector('.scroll-expand__track');
      let stage = this.root.querySelector('.scroll-expand__stage');
      let frame = this.root.querySelector('.scroll-expand__frame');
      let media = this.root.querySelector('.scroll-expand__media');
      let scrim = this.root.querySelector('.scroll-expand__scrim');
      let title = this.root.querySelector('.scroll-expand__title');
      let hint = this.root.querySelector('.scroll-expand__hint');
      let overlay = this.root.querySelector('.scroll-expand__overlay');

      if (!track) {
        track = document.createElement('div');
        track.className = 'scroll-expand__track';

        stage = document.createElement('div');
        stage.className = 'scroll-expand__stage';

        frame = document.createElement('div');
        frame.className = 'scroll-expand__frame';

        if (opt.mediaType === 'video') {
          media = document.createElement('video');
          media.className = 'scroll-expand__media';
          media.src = opt.src;
          if (opt.poster) media.poster = opt.poster;
          media.autoplay = true;
          media.muted = true;
          media.loop = true;
          media.playsInline = true;
        } else {
          media = document.createElement('img');
          media.className = 'scroll-expand__media';
          media.src = opt.src;
          media.alt = opt.alt || '';
          media.draggable = false;
        }

        scrim = document.createElement('div');
        scrim.className = 'scroll-expand__scrim';

        frame.appendChild(media);
        frame.appendChild(scrim);

        overlay = document.createElement('div');
        overlay.className = 'scroll-expand__overlay';
        while (this.root.firstChild) {
          overlay.appendChild(this.root.firstChild);
        }
        frame.appendChild(overlay);

        if (opt.title) {
          title = document.createElement('div');
          title.className = 'scroll-expand__title';
          title.textContent = opt.title;
          stage.appendChild(title);
        }

        if (opt.scrollHint) {
          hint = document.createElement('div');
          hint.className = 'scroll-expand__hint';
          hint.textContent = opt.scrollHint;
          stage.appendChild(hint);
        }

        stage.appendChild(frame);
        track.appendChild(stage);
        this.root.appendChild(track);
      }

      this.track = track;
      this.stage = stage;
      this.frame = frame;
      this.media = media;
      this.scrim = scrim;
      this.title = title;
      this.hint = hint;
      this.overlay = overlay;
    }

    applyProgress(p) {
      if (!this.frame || !this.media) return;
      if (Math.abs(p - this.lastAppliedProgress) < 0.001) return;
      this.lastAppliedProgress = p;

      const c = this.options;
      const e = smoothstep(0, 1, p);

      const w = c.startWidth + (100 - c.startWidth) * e;
      const h = c.startHeight + (100 - c.startHeight) * e;
      const ix = Math.max(0, (100 - w) / 2);
      const iy = Math.max(0, (100 - h) / 2);
      const r = c.startRadius + (c.endRadius - c.startRadius) * e;

      this.frame.style.clipPath = `inset(${iy.toFixed(2)}% ${ix.toFixed(2)}% ${iy.toFixed(2)}% ${ix.toFixed(2)}% round ${r.toFixed(1)}px)`;
      this.media.style.transform = `scale(${(c.mediaZoom + (1 - c.mediaZoom) * e).toFixed(3)}) translateZ(0)`;

      if (this.scrim) {
        this.scrim.style.opacity = `${(c.overlayScrim * e).toFixed(3)}`;
      }

      if (this.title) {
        const out = smoothstep(0.35, 0.85, p);
        this.title.style.opacity = `${(1 - out).toFixed(3)}`;
        this.title.style.transform = `translate3d(0, ${(-30 * out).toFixed(2)}px, 0) scale(${(1 + 0.06 * out).toFixed(3)})`;
      }

      if (this.hint) {
        const gone = smoothstep(0, 0.15, p);
        this.hint.style.opacity = `${(1 - gone).toFixed(3)}`;
        this.hint.style.transform = `translate3d(0, ${(10 * gone).toFixed(2)}px, 0)`;
      }

      if (this.overlay) {
        const inn = smoothstep(0.65, 1, p);
        this.overlay.style.opacity = `${inn.toFixed(3)}`;
        this.overlay.style.transform = `translate3d(0, ${(20 * (1 - inn)).toFixed(2)}px, 0)`;
        this.overlay.style.pointerEvents = inn > 0.8 ? 'auto' : 'none';
      }
    }

    measure() {
      const c = this.options;
      this.stageH = c.useWindowScroll ? window.innerHeight : this.root.clientHeight;
      if (this.stageH <= 0) return;

      this.stage.style.height = `${this.stageH}px`;
      const totalH = this.stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance));
      this.track.style.height = `${totalH}px`;
      this.track.style.position = 'relative';

      const w = window.innerWidth || this.root.clientWidth || this.stageH;
      this.stage.style.setProperty('--se-title-size', `${clamp(w * 0.055, 24, 76)}px`);
    }

    readProgress() {
      const c = this.options;
      if (!c.enabled || !this.track) return 1;
      const span = this.stageH * Math.max(0.01, c.scrollDistance);
      if (c.useWindowScroll) {
        const top = this.track.getBoundingClientRect().top;
        return clamp(-top / span, 0, 1);
      }
      return clamp(this.root.scrollTop / span, 0, 1);
    }

    tick() {
      if (!this.isIntersecting) {
        this.running = false;
        this.raf = 0;
        return;
      }

      const c = this.options;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
      this.current += (this.target - this.current) * k;

      if (Math.abs(this.target - this.current) < 0.0008) {
        this.current = this.target;
        this.running = false;
      }

      this.applyProgress(this.current);

      if (this.running) {
        this.raf = requestAnimationFrame(() => this.tick());
      } else {
        this.raf = 0;
      }
    }

    kick() {
      if (this.running || !this.isIntersecting) return;
      this.running = true;
      if (!this.raf) {
        this.raf = requestAnimationFrame(() => this.tick());
      }
    }

    bindEvents() {
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let scrollTicking = false;

      const handleScroll = () => {
        if (!this.isIntersecting) return;
        if (!scrollTicking) {
          scrollTicking = true;
          requestAnimationFrame(() => {
            scrollTicking = false;
            this.target = this.readProgress();
            if (this.options.smoothing <= 0 || reduceMotion) {
              this.current = this.target;
              this.applyProgress(this.current);
            } else {
              this.kick();
            }
          });
        }
      };

      const onResize = () => {
        this.measure();
        if (this.isIntersecting) {
          this.target = this.readProgress();
          this.current = this.target;
          this.applyProgress(this.current);
        }
      };

      this.measure();
      this.target = this.readProgress();
      this.current = this.target;
      this.applyProgress(this.current);

      // IntersectionObserver for 0% CPU consumption when off-screen
      if (typeof IntersectionObserver !== 'undefined') {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isIntersecting = entry.isIntersecting;
            if (this.isIntersecting) {
              this.target = this.readProgress();
              this.kick();
            } else if (this.raf) {
              cancelAnimationFrame(this.raf);
              this.raf = 0;
              this.running = false;
            }
          });
        }, { rootMargin: '150px 0px' });
        this.observer.observe(this.track || this.root);
      } else {
        this.isIntersecting = true;
      }

      const scroller = this.options.useWindowScroll ? window : this.root;
      scroller.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', onResize, { passive: true });

      if (window.ResizeObserver) {
        this.ro = new ResizeObserver(onResize);
        this.ro.observe(this.root);
      }

      this.cleanup = () => {
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = 0;
        this.running = false;
        scroller.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', onResize);
        if (this.ro) this.ro.disconnect();
        if (this.observer) this.observer.disconnect();
      };
    }

    destroy() {
      if (this.cleanup) this.cleanup();
    }
  }

  window.ScrollExpand = ScrollExpand;
})();
