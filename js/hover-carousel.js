/**
 * Hover Carousel Controller for Section 02 Mission Pillars
 */

(function () {
  'use strict';

  class HoverCarousel {
    constructor(container) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) return;

      this.cards = Array.from(this.container.querySelectorAll('.rb-hover-card'));
      this.nav = document.getElementById('missionCarouselNav');
      this.navButtons = this.nav ? Array.from(this.nav.querySelectorAll('.rb-nav-dot')) : [];
      this.currentIndex = 0;
      this.autoTimer = null;
      this.isHovered = false;

      this.init();
    }

    init() {
      if (!this.cards.length) return;

      this.cards.forEach((card, index) => {
        // Pointer enter: activate card & pause auto rotation
        card.addEventListener('pointerenter', () => {
          this.isHovered = true;
          this.setActive(index);
          this.pauseAuto();
        });

        // Pointer leave: resume
        card.addEventListener('pointerleave', () => {
          this.isHovered = false;
          this.resumeAuto();
        });

        // Click / touch to select
        card.addEventListener('click', () => {
          this.setActive(index);
        });
      });

      // Nav buttons
      this.navButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
          this.setActive(index);
          this.pauseAuto();
          setTimeout(() => this.resumeAuto(), 3000);
        });
      });

      // Container mouse enter/leave
      this.container.addEventListener('mouseenter', () => this.pauseAuto());
      this.container.addEventListener('mouseleave', () => this.resumeAuto());

      // Start gentle auto cycle
      this.resumeAuto();
    }

    setActive(index) {
      if (index < 0 || index >= this.cards.length) return;
      this.currentIndex = index;

      this.cards.forEach((card, i) => {
        if (i === index) {
          card.classList.add('is-active');
        } else {
          card.classList.remove('is-active');
        }
      });

      this.navButtons.forEach((btn, i) => {
        if (i === index) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
    }

    resumeAuto() {
      this.pauseAuto();
      this.autoTimer = setInterval(() => {
        if (!this.isHovered) {
          const nextIndex = (this.currentIndex + 1) % this.cards.length;
          this.setActive(nextIndex);
        }
      }, 4800);
    }

    pauseAuto() {
      if (this.autoTimer) {
        clearInterval(this.autoTimer);
        this.autoTimer = null;
      }
    }
  }

  function initAll() {
    const el = document.getElementById('missionHoverCarousel');
    if (el && !el.hasAttribute('data-hover-carousel-init')) {
      el.setAttribute('data-hover-carousel-init', 'true');
      window.missionHoverCarouselInstance = new HoverCarousel(el);
    }
  }

  window.HoverCarousel = HoverCarousel;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
