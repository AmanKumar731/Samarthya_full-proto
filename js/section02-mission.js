/**
 * Section 02: Website Detail & Mission Interactive Controller
 * Handles:
 * - 3-Card interactive state & hover synchronization
 * - Bottom pillar navigation tab switching
 * - Smooth auto-cycle rotation with pause-on-hover
 * - Accessible ARIA attributes updates
 */

(function () {
  'use strict';

  class Section02MissionController {
    constructor() {
      this.section = document.getElementById('section-02');
      if (!this.section) return;

      this.cards = Array.from(this.section.querySelectorAll('.sec02-feature-card'));
      this.navItems = Array.from(this.section.querySelectorAll('.sec02-nav-item'));
      this.currentIndex = 0;
      this.autoTimer = null;
      this.isHovered = false;

      // Check for prefers-reduced-motion
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.init();
    }

    init() {
      if (!this.cards.length) return;

      // Card hover and click interactions
      this.cards.forEach((card, index) => {
        card.addEventListener('pointerenter', () => {
          this.isHovered = true;
          this.setActive(index);
          this.pauseAuto();
        });

        card.addEventListener('pointerleave', () => {
          this.isHovered = false;
          this.resumeAuto();
        });

        card.addEventListener('click', (e) => {
          // If clicked directly on the link, allow normal navigation
          if (e.target.closest('.sec02-card-link')) return;
          this.setActive(index);
        });
      });

      // Bottom Pillar Navigation Tab Clicks
      this.navItems.forEach((btn, index) => {
        btn.addEventListener('click', () => {
          this.setActive(index);
          this.pauseAuto();
          // Resume auto rotation after 4 seconds of idle
          setTimeout(() => {
            if (!this.isHovered) this.resumeAuto();
          }, 4000);
        });
      });

      // Pause when interacting with section container
      const cardsRow = document.getElementById('sec02CardsRow');
      if (cardsRow) {
        cardsRow.addEventListener('mouseenter', () => this.pauseAuto());
        cardsRow.addEventListener('mouseleave', () => this.resumeAuto());
      }

      // Start gentle auto-cycle if reduced motion is false
      if (!this.prefersReducedMotion) {
        this.resumeAuto();
      }
    }

    setActive(index) {
      if (index < 0 || index >= this.cards.length) return;
      this.currentIndex = index;

      // Update Cards
      this.cards.forEach((card, i) => {
        if (i === index) {
          card.classList.add('is-active');
          card.setAttribute('aria-current', 'true');
        } else {
          card.classList.remove('is-active');
          card.removeAttribute('aria-current');
        }
      });

      // Update Navigation Indicator
      this.navItems.forEach((btn, i) => {
        if (i === index) {
          btn.classList.add('is-active');
          btn.setAttribute('aria-selected', 'true');
        } else {
          btn.classList.remove('is-active');
          btn.setAttribute('aria-selected', 'false');
        }
      });
    }

    resumeAuto() {
      this.pauseAuto();
      if (this.prefersReducedMotion) return;

      this.autoTimer = setInterval(() => {
        if (!this.isHovered) {
          const nextIndex = (this.currentIndex + 1) % this.cards.length;
          this.setActive(nextIndex);
        }
      }, 5000);
    }

    pauseAuto() {
      if (this.autoTimer) {
        clearInterval(this.autoTimer);
        this.autoTimer = null;
      }
    }
  }

  function initSection02() {
    if (window.section02MissionInstance) return;
    window.section02MissionInstance = new Section02MissionController();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSection02);
  } else {
    initSection02();
  }
})();
