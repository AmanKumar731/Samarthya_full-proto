/**
 * React Bits BounceCards Engine (Vanilla JS implementation)
 * High-performance spring physics simulation without external dependencies.
 */

(function () {
  'use strict';

  const PATTERN = [1, 0.5, -0.3, -1, 0.2, 0.75, -0.6, 0.35, -0.85, 0.1];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function toCard(item) {
    if (typeof item === 'string') {
      return { src: item, alt: '', label: '' };
    }
    return {
      src: item?.src || '',
      alt: item?.alt || '',
      label: item?.label || ''
    };
  }

  class BounceCards {
    constructor(container, options = {}) {
      this.root = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.root) return;

      const defaultOptions = {
        images: [],
        containerWidth: 460,
        containerHeight: 300,
        cardSize: 180,
        spread: 75,
        rotation: 8,
        arc: -20,
        animationDelay: 0.3,
        animationStagger: 0.05,
        bounciness: 0.5,
        enableHover: true,
        pushDistance: 140,
        hoverScale: 1.05,
        borderWidth: 4,
        borderColor: '#1e293b',
        radius: 20,
        shadow: true,
        onCardClick: null
      };

      this.options = Object.assign({}, defaultOptions, options);
      this.cards = (this.options.images || []).map(toCard);
      this.count = this.cards.length;

      this.cardEls = [];
      this.bodies = [];
      this.state = { hovered: -1, time: 0, layer: -1 };
      this.raf = 0;
      this.last = performance.now();
      this.alive = true;
      this.isIntersecting = false;

      this.calcSlots();
      this.buildDOM();
      this.bindEvents();

      if (typeof IntersectionObserver !== 'undefined') {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isIntersecting = entry.isIntersecting;
            if (this.isIntersecting) {
              this.wake();
            } else if (this.raf) {
              cancelAnimationFrame(this.raf);
              this.raf = 0;
            }
          });
        }, { rootMargin: '100px 0px' });
        this.observer.observe(this.root);
      } else {
        this.isIntersecting = true;
        this.wake();
      }
    }

    calcSlots() {
      const count = this.count;
      const middle = (count - 1) / 2;
      const reach = Math.max(1, middle);
      const spread = this.options.spread;
      const arc = this.options.arc;
      const rotation = this.options.rotation;

      this.slots = this.cards.map((_, i) => {
        const offset = i - middle;
        return {
          x: offset * spread,
          y: arc * Math.pow(offset / reach, 2),
          rotate: rotation * PATTERN[i % PATTERN.length]
        };
      });
    }

    buildDOM() {
      this.root.innerHTML = '';
      this.root.classList.add('bounce-cards');

      const opt = this.options;
      const shadowNormal = opt.shadow
        ? '0 1px 2px rgba(0, 0, 0, 0.12), 0 10px 28px -6px rgba(0, 0, 0, 0.32)'
        : 'none';
      const shadowActive = opt.shadow
        ? '0 2px 4px rgba(0, 0, 0, 0.14), 0 22px 44px -10px rgba(0, 0, 0, 0.42)'
        : 'none';

      this.root.style.width = typeof opt.containerWidth === 'number' ? `${opt.containerWidth}px` : opt.containerWidth;
      this.root.style.height = typeof opt.containerHeight === 'number' ? `${opt.containerHeight}px` : opt.containerHeight;
      this.root.style.minHeight = '320px';
      this.root.style.overflow = 'visible';
      this.root.style.display = 'flex';
      this.root.style.alignItems = 'center';
      this.root.style.justifyContent = 'center';
      this.root.style.setProperty('--bounce-cards-size', `${Math.max(10, opt.cardSize)}px`);
      this.root.style.setProperty('--bounce-cards-border', `${Math.max(0, opt.borderWidth)}px`);
      this.root.style.setProperty('--bounce-cards-border-color', opt.borderColor);
      this.root.style.setProperty('--bounce-cards-radius', `${Math.max(0, opt.radius)}px`);
      this.root.style.setProperty('--bounce-cards-shadow', shadowNormal);
      this.root.style.setProperty('--bounce-cards-shadow-active', shadowActive);

      this.cardEls = [];
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.cards.forEach((card, i) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'bounce-cards__card bounce-cards__card--clickable';
        cardEl.style.zIndex = String(i + 1);
        cardEl.setAttribute('role', 'button');
        cardEl.setAttribute('tabindex', '0');
        cardEl.setAttribute('aria-label', card.alt || card.label || `Card ${i + 1}`);

        if (card.src) {
          const img = document.createElement('img');
          img.src = card.src;
          img.alt = card.alt || '';
          img.draggable = false;
          img.loading = 'lazy';
          cardEl.appendChild(img);
        }

        if (card.label) {
          const labelEl = document.createElement('div');
          labelEl.className = 'bounce-cards__card-label';
          labelEl.textContent = card.label;
          cardEl.appendChild(labelEl);
        }

        this.root.appendChild(cardEl);
        this.cardEls.push(cardEl);

        const slot = this.slots[i] || { x: 0, y: 0, rotate: 0 };
        this.bodies[i] = {
          x: slot.x,
          y: slot.y,
          rotate: slot.rotate,
          scale: reduce ? 1 : 0,
          vx: 0,
          vy: 0,
          vr: 0,
          vs: 0,
          born: 0
        };
      });
    }

    step(value, velocity, target, stiffness, damping, dt) {
      const next = velocity + ((target - value) * stiffness - velocity * damping) * dt;
      return [value + next * dt, next];
    }

    frame(now) {
      this.raf = 0;
      if (!this.alive) return;

      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const opt = this.options;
      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - this.last) / 1000));
      this.last = now;
      this.state.time += dt;

      const hovered = opt.enableHover ? this.state.hovered : -1;
      const popStiffness = 170;
      const bounciness = clamp(opt.bounciness, 0, 1);
      const popDamping = 2 * (1 - 0.85 * bounciness) * Math.sqrt(popStiffness);
      const moveStiffness = 210;
      const moveDamping = 2 * (reduce ? 1 : 0.72) * Math.sqrt(moveStiffness);
      const substeps = Math.ceil(dt / (1 / 240));
      const h = dt / substeps;
      let moving = 0;

      for (let i = 0; i < this.slots.length; i++) {
        const el = this.cardEls[i];
        if (!el) continue;
        const card = this.bodies[i];
        const slot = this.slots[i];
        const appeared = reduce || (this.state.time - card.born >= opt.animationDelay + i * opt.animationStagger);

        let targetX = slot.x;
        let targetY = slot.y;
        let targetRotate = slot.rotate;
        let targetScale = appeared ? 1 : 0;

        if (hovered >= 0 && appeared) {
          if (i === hovered) {
            targetY = slot.y - opt.cardSize * 0.04;
            targetRotate = 0;
            targetScale = clamp(opt.hoverScale, 0.5, 2);
          } else {
            targetX = slot.x + Math.sign(i - hovered) * opt.pushDistance;
          }
        }

        for (let k = 0; k < substeps; k++) {
          [card.x, card.vx] = this.step(card.x, card.vx, targetX, moveStiffness, moveDamping, h);
          [card.y, card.vy] = this.step(card.y, card.vy, targetY, moveStiffness, moveDamping, h);
          [card.rotate, card.vr] = this.step(card.rotate, card.vr, targetRotate, moveStiffness, moveDamping, h);
          if (reduce) {
            card.scale = targetScale;
            card.vs = 0;
          } else {
            [card.scale, card.vs] = this.step(card.scale, card.vs, targetScale, popStiffness, popDamping, h);
          }
        }

        moving +=
          Math.abs(card.vx) +
          Math.abs(card.vy) +
          Math.abs(card.vr) +
          Math.abs(card.vs) * 100 +
          Math.abs(targetX - card.x) +
          Math.abs(targetY - card.y) +
          Math.abs(targetRotate - card.rotate) +
          Math.abs(targetScale - card.scale) * 100 +
          (appeared ? 0 : 1);

        el.style.transform = `translate(-50%, -50%) translate3d(${card.x.toFixed(2)}px, ${card.y.toFixed(2)}px, 0) rotate(${card.rotate.toFixed(3)}deg) scale(${Math.max(0, card.scale).toFixed(4)})`;
      }

      if (this.state.layer !== hovered) {
        this.state.layer = hovered;
        this.cardEls.forEach((el, i) => {
          if (!el) return;
          el.style.zIndex = i === hovered ? String(this.slots.length + 1) : String(i + 1);
          if (i === hovered) {
            el.setAttribute('data-active', 'true');
          } else {
            el.removeAttribute('data-active');
          }
        });
      }

      if (moving > 0.02 && this.isIntersecting) {
        this.raf = requestAnimationFrame(t => this.frame(t));
      } else {
        this.raf = 0;
      }
    }

    wake() {
      if (this.raf || !this.alive || !this.isIntersecting) return;
      this.last = performance.now();
      this.raf = requestAnimationFrame(t => this.frame(t));
    }

    pick(event) {
      const rect = this.root.getBoundingClientRect();
      const px = event.clientX - rect.left - rect.width / 2;
      const py = event.clientY - rect.top - rect.height / 2;
      let best = -1;
      let distance = Infinity;

      this.slots.forEach((slot, i) => {
        const gap = Math.abs(px - slot.x);
        if (gap < distance) {
          distance = gap;
          best = i;
        }
      });

      if (best < 0) return -1;
      const slot = this.slots[best];
      const half = this.options.cardSize / 2;
      if (Math.abs(py - slot.y) > half + 16 || distance > half + 16) return -1;

      if (this.state.hovered >= 0 && this.state.hovered !== best) {
        const current = this.slots[this.state.hovered];
        if (current && Math.abs(px - current.x) - distance < 6) return this.state.hovered;
      }
      return best;
    }

    bindEvents() {
      const onMove = event => {
        const next = this.pick(event);
        if (next !== this.state.hovered) {
          this.state.hovered = next;
          this.wake();
        }
      };

      const onLeave = () => {
        if (this.state.hovered !== -1) {
          this.state.hovered = -1;
          this.wake();
        }
      };

      const onClick = event => {
        const index = this.pick(event);
        if (index < 0) return;
        const card = this.bodies[index];
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (card && !reduce) card.vs -= 2.2;
        this.wake();
        if (typeof this.options.onCardClick === 'function') {
          this.options.onCardClick(index, this.cards[index]);
        }
      };

      const onFocus = event => {
        const index = this.cardEls.indexOf(event.target);
        if (index >= 0) {
          this.state.hovered = index;
          this.wake();
        }
      };

      const onKey = event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const index = this.cardEls.indexOf(event.target);
        if (index < 0) return;
        event.preventDefault();
        const card = this.bodies[index];
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (card && !reduce) card.vs -= 2.2;
        this.wake();
        if (typeof this.options.onCardClick === 'function') {
          this.options.onCardClick(index, this.cards[index]);
        }
      };

      this.root.addEventListener('pointermove', onMove, { passive: true });
      this.root.addEventListener('pointerdown', onMove, { passive: true });
      this.root.addEventListener('pointerleave', onLeave, { passive: true });
      this.root.addEventListener('click', onClick);
      this.root.addEventListener('focusin', onFocus);
      this.root.addEventListener('focusout', onLeave);
      this.root.addEventListener('keydown', onKey);

      this.cleanup = () => {
        this.alive = false;
        cancelAnimationFrame(this.raf);
        this.root.removeEventListener('pointermove', onMove);
        this.root.removeEventListener('pointerdown', onMove);
        this.root.removeEventListener('pointerleave', onLeave);
        this.root.removeEventListener('click', onClick);
        this.root.removeEventListener('focusin', onFocus);
        this.root.removeEventListener('focusout', onLeave);
        this.root.removeEventListener('keydown', onKey);
      };
    }

    destroy() {
      if (this.cleanup) this.cleanup();
    }
  }

  window.BounceCards = BounceCards;
})();
