/**
 * React Bits Showcase Engine (Sections 02 to 06)
 * Implements:
 * - SpotlightCard pointer following & edge mask highlights
 * - CountUp on-scroll integer/decimal animations
 * - Smooth interactive tactile responses
 */

(function () {
  'use strict';

  function initSpotlightCards() {
    const cards = document.querySelectorAll('.spotlight-card');
    if (!cards.length) return;

    cards.forEach(card => {
      let light = card.querySelector('.spotlight-card__light');
      let edge = card.querySelector('.spotlight-card__edge');

      if (!light) {
        light = document.createElement('span');
        light.className = 'spotlight-card__light';
        card.prepend(light);
      }
      if (!edge) {
        edge = document.createElement('span');
        edge.className = 'spotlight-card__edge';
        card.appendChild(edge);
      }

      let rect = null;
      let frameId = 0;
      let lastX = 0;
      let lastY = 0;

      const updateLight = () => {
        frameId = 0;
        if (!rect) return;
        const color = card.dataset.spotlightColor || 'rgba(99, 102, 241, 0.16)';
        const edgeColor = card.dataset.edgeColor || 'rgba(147, 197, 253, 0.45)';
        const size = parseInt(card.dataset.spotlightSize || '280', 10);

        light.style.background = `radial-gradient(circle ${size}px at ${lastX}px ${lastY}px, ${color}, transparent 70%)`;
        light.style.opacity = '1';

        edge.style.background = `radial-gradient(circle ${size * 0.8}px at ${lastX}px ${lastY}px, ${edgeColor}, transparent 65%)`;
        edge.style.opacity = '1';
      };

      const onPointerEnter = () => {
        rect = card.getBoundingClientRect();
      };

      const onPointerMove = e => {
        if (!rect) rect = card.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        if (!frameId) {
          frameId = requestAnimationFrame(updateLight);
        }
      };

      const onPointerLeave = () => {
        if (frameId) {
          cancelAnimationFrame(frameId);
          frameId = 0;
        }
        rect = null;
        light.style.opacity = '0';
        edge.style.opacity = '0';
      };

      card.addEventListener('pointerenter', onPointerEnter, { passive: true });
      card.addEventListener('pointermove', onPointerMove, { passive: true });
      card.addEventListener('pointerleave', onPointerLeave, { passive: true });
    });
  }

  function initCountUp() {
    const elements = document.querySelectorAll('[data-countup]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        obs.unobserve(el);

        const target = parseFloat(el.getAttribute('data-countup'));
        const suffix = el.getAttribute('data-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const duration = 1600; // ms
        const start = performance.now();

        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          // Ease-out cubic
          const ease = 1 - Math.pow(1 - progress, 3);
          const current = (target * ease).toFixed(decimals);
          el.textContent = current + suffix;

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = (decimals ? target.toFixed(decimals) : target) + suffix;
          }
        }

        requestAnimationFrame(step);
      });
    }, { threshold: 0.25 });

    elements.forEach(el => observer.observe(el));
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSpotlightCards();
      initCountUp();
    });
  } else {
    initSpotlightCards();
    initCountUp();
  }

  window.ReactBitsShowcase = {
    initSpotlightCards,
    initCountUp
  };
})();
