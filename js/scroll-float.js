/**
 * React Bits ScrollFloat Engine (Vanilla JS implementation using GSAP + ScrollTrigger)
 * Faithfully ported from the React Bits ScrollFloat component specification.
 */

(function () {
  'use strict';

  const clampToScroll = position =>
    typeof position === 'string' && !position.startsWith('clamp(') ? `clamp(${position})` : position;

  const clamp01 = value => Math.min(Math.max(value, 0), 1);

  const smoothstep = (from, to, value) => {
    const k = clamp01((value - from) / (to - from));
    return k * k * (3 - 2 * k);
  };

  const random = (index, salt) => {
    const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
    return value - Math.floor(value);
  };

  const getDelays = (count, order, stagger) => {
    const middle = (count - 1) / 2;
    const ranks = Array.from({ length: count }, (_, index) => {
      if (order === 'end') return count - 1 - index;
      if (order === 'center') return Math.abs(index - middle);
      if (order === 'edges') return middle - Math.abs(index - middle);
      return index;
    });
    if (order === 'random') {
      const shuffled = ranks.map((_, index) => index).sort((a, b) => random(a, 9) - random(b, 9));
      shuffled.forEach((target, rank) => {
        ranks[target] = rank;
      });
    }
    const first = Math.min(...ranks);
    return ranks.map(rank => (rank - first) * Math.max(0, stagger));
  };

  class ScrollFloat {
    constructor(element, options = {}) {
      this.el = typeof element === 'string' ? document.querySelector(element) : element;
      if (!this.el) return;

      const ds = this.el.dataset;
      const defaults = {
        effect: ds.effect || 'float',
        splitBy: ds.splitBy || 'words',
        direction: ds.direction || 'up',
        order: ds.order || 'start',
        fromColor: ds.fromColor || 'currentColor',
        animationDuration: parseFloat(ds.duration || ds.animationDuration || '1'),
        ease: ds.ease || 'back.inOut(2)',
        scrollStart: ds.scrollStart || 'center bottom+=50%',
        scrollEnd: ds.scrollEnd || 'bottom bottom-=40%',
        stagger: parseFloat(ds.stagger || '0.03'),
        distance: parseFloat(ds.distance || '120'),
        stretch: parseFloat(ds.stretch || '2.3'),
        smoothing: parseFloat(ds.smoothing || '0')
      };

      this.options = Object.assign({}, defaults, options);
      this.init();
    }

    init() {
      if (!window.gsap || !window.ScrollTrigger) {
        console.warn('ScrollFloat requires GSAP and ScrollTrigger');
        return;
      }

      window.gsap.registerPlugin(window.ScrollTrigger);

      const rawText = this.el.textContent.trim();
      if (!rawText) return;

      this.el.classList.add('scroll-float');
      if (this.options.effect !== 'float') {
        this.el.classList.add('scroll-float--open');
      }

      // Accessible screen reader label
      const srEl = document.createElement('span');
      srEl.className = 'scroll-float-sr';
      srEl.textContent = rawText;

      const textWrap = document.createElement('span');
      textWrap.className = 'scroll-float-text';
      textWrap.setAttribute('aria-hidden', 'true');

      // Shift color inline styling if requested
      const shiftColor = this.options.fromColor && this.options.fromColor !== 'currentColor' ? this.options.fromColor : null;
      const shiftStyle = shiftColor
        ? `color-mix(in oklab, ${shiftColor} calc(var(--scroll-float-mix, 0) * 100%), currentColor)`
        : null;

      // Split text into words and chars for natural text flow
      const words = rawText.split(/(\s+)/);
      words.forEach(word => {
        if (word.trim() === '') {
          textWrap.appendChild(document.createTextNode(word));
        } else {
          const wordEl = document.createElement('span');
          wordEl.className = 'scroll-float-word';
          Array.from(word).forEach(ch => {
            const charEl = document.createElement('span');
            charEl.className = 'scroll-float-char';
            charEl.textContent = ch;
            if (shiftStyle) {
              charEl.style.color = shiftStyle;
            }
            wordEl.appendChild(charEl);
          });
          textWrap.appendChild(wordEl);
        }
      });

      this.el.innerHTML = '';
      this.el.appendChild(srEl);
      this.el.appendChild(textWrap);

      this.setupAnimation(textWrap, shiftColor);
    }

    setupAnimation(textWrap, shiftColor) {
      const opt = this.options;
      const pieces = this.el.querySelectorAll(opt.splitBy === 'words' ? '.scroll-float-word' : '.scroll-float-char');
      const targets = pieces.length ? Array.from(pieces) : [textWrap];
      const indexOf = new Map(targets.map((target, index) => [target, index]));
      const at = fn => (_, target) => fn(indexOf.get(target) ?? 0);
      const middle = (targets.length - 1) / 2;
      const edge = index => (middle > 0 ? (index - middle) / middle : 0);
      const delays = getDelays(targets.length, opt.order, opt.stagger);
      const sign = opt.direction === 'down' ? -1 : 1;
      const reach = Math.max(0, Number(opt.distance) || 0) / 120;
      const squeeze = opt.stretch > 0 ? opt.stretch ** -0.43 : 1;
      const baseEase = window.gsap.parseEase(opt.ease) || (p => p);
      const timing = p => clamp01(baseEase(p));
      const size = () => parseFloat(getComputedStyle(textWrap).fontSize) || 16;

      const swell = p => {
        const t = timing(p);
        return 1 - Math.cos(t * Math.PI * 2.5) * Math.pow(1 - t, 2.6);
      };
      const sway = p => {
        const t = timing(p);
        return Math.sin(t * Math.PI * 2.5) * Math.pow(1 - t, 2.6);
      };

      const mm = window.gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = window.gsap.timeline({
          scrollTrigger: {
            trigger: this.el,
            scroller: window,
            start: opt.scrollStart,
            end: clampToScroll(opt.scrollEnd),
            scrub: opt.smoothing > 0 ? opt.smoothing : true,
            invalidateOnRefresh: true
          }
        });

        const add = (fromVars, toVars) => {
          return timeline.fromTo(
            targets,
            { ...fromVars },
            { duration: opt.animationDuration, stagger: index => delays[index] || 0, clearProps: 'willChange', ...toVars },
            0
          );
        };

        if (opt.effect === 'flip') {
          add(
            {
              rotationX: -90 * sign,
              transformPerspective: () => size() * 4,
              transformOrigin: () => `50% 50% ${(-size() * 0.55 * reach).toFixed(2)}`,
              backfaceVisibility: 'hidden'
            },
            { ease: opt.ease, rotationX: 0 }
          );
          add({ opacity: 0 }, { ease: p => smoothstep(0.05, 0.55, timing(p)), opacity: 1 });
        } else if (opt.effect === 'scatter') {
          add(
            {
              x: at(index => ((random(index, 1) * 2 - 1) * 1.3 - edge(index) * 0.9) * size() * reach),
              y: at(index => sign * (0.35 + random(index, 2)) * size() * 1.1 * reach),
              rotation: at(index => (random(index, 3) < 0.5 ? -1 : 1) * (40 + random(index, 4) * 120)),
              scale: at(index => 0.35 + random(index, 5) * 0.9),
              transformOrigin: '50% 50%'
            },
            { ease: opt.ease, x: 0, y: 0, rotation: 0, scale: 1 }
          );
          add({ opacity: 0 }, { ease: p => smoothstep(0, 0.4, timing(p)), opacity: 1 });
        } else if (opt.effect === 'blur') {
          add(
            {
              willChange: 'opacity, transform, filter',
              opacity: 0,
              y: () => sign * size() * 0.3 * reach,
              scale: 1.45,
              filter: () => `blur(${(size() * 0.2).toFixed(2)}px)`,
              transformOrigin: '50% 50%'
            },
            { ease: opt.ease, opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
          );
        } else if (opt.effect === 'wave') {
          add(
            {
              yPercent: 120 * reach * sign,
              scaleY: opt.stretch,
              scaleX: squeeze,
              transformOrigin: sign > 0 ? '50% 100%' : '50% 0%'
            },
            { ease: swell, yPercent: 0, scaleY: 1, scaleX: 1 }
          );
          add({ rotation: 0 }, { ease: sway, rotation: -16 * sign });
          add({ opacity: 0 }, { ease: p => clamp01(timing(p) * 2.5), opacity: 1 });
        } else {
          // Default: float
          add(
            {
              opacity: 0,
              yPercent: 120 * reach * sign,
              scaleY: opt.stretch,
              scaleX: squeeze,
              transformOrigin: sign > 0 ? '50% 0%' : '50% 100%'
            },
            { ease: opt.ease, opacity: 1, yPercent: 0, scaleY: 1, scaleX: 1 }
          );
        }

        if (shiftColor) {
          add({ '--scroll-float-mix': 1 }, { ease: p => smoothstep(0.5, 1, timing(p)), '--scroll-float-mix': 0 });
        }
      });
    }
  }

  function initAll() {
    const els = document.querySelectorAll('[data-scroll-float], .scroll-float');
    els.forEach(el => {
      if (!el.hasAttribute('data-scroll-float-initialized')) {
        el.setAttribute('data-scroll-float-initialized', 'true');
        new ScrollFloat(el);
      }
    });
  }

  window.ScrollFloat = ScrollFloat;
  window.ScrollFloat.initAll = initAll;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
