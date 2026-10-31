// ============================================
// Samarthya — 3D Spatial Tilt & Interactive Scroll Parallax Engine
// Ultra-smooth 60FPS perspective transforms, mouse tilt & depth scroll
// ============================================

const Spatial3DEngine = {
  cards: [],
  heroStage: null,
  isTouch: false,
  rafId: null,

  init() {
    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Select 3D target elements
    this.heroStage = document.getElementById('heroVideoStageWrapper');
    this.cards = Array.from(document.querySelectorAll('#page-home .form-card, .hero-video-stage-wrapper'));

    if (this.isTouch) return; // Keep clean performance on mobile touch

    this.bindEvents();
    this.updateScroll3D();
  },

  bindEvents() {
    // 3D Card Interactive Mouse Tilt
    this.cards.forEach(card => {
      if (!card) return;

      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform 0.15s ease-out, box-shadow 0.3s ease';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);

        // Max tilt angles (degrees)
        const tiltX = -deltaY * 8; // Tilt along X
        const tiltY = deltaX * 8;   // Tilt along Y
        const depthZ = 18;         // Lift in 3D Z-space

        card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(${depthZ}px)`;
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
      }, { passive: true });
    });

    // 3D Scroll Parallax Listener
    window.addEventListener('scroll', () => {
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(() => {
          this.updateScroll3D();
          this.rafId = null;
        });
      }
    }, { passive: true });
  },

  updateScroll3D() {
    const viewportHeight = window.innerHeight;
    const centerY = viewportHeight / 2;

    this.cards.forEach(card => {
      if (!card) return;
      
      const rect = card.getBoundingClientRect();
      // Skip if offscreen
      if (rect.bottom < -100 || rect.top > viewportHeight + 100) return;

      const cardCenter = rect.top + rect.height / 2;
      const distanceFromCenter = (cardCenter - centerY) / centerY; // -1 to +1

      // Subtle 3D tilt based on scroll position
      const scrollTiltX = Math.max(-6, Math.min(6, distanceFromCenter * 6)); // max 6 deg
      const scrollTranslateZ = Math.max(-20, Math.min(10, (1 - Math.abs(distanceFromCenter)) * 12));

      // Apply 3D perspective effect smoothly if not mouse-hovered
      if (!card.matches(':hover')) {
        card.style.transform = `perspective(1200px) rotateX(${scrollTiltX.toFixed(2)}deg) translateZ(${scrollTranslateZ.toFixed(1)}px)`;
      }
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Spatial3DEngine.init());
} else {
  Spatial3DEngine.init();
}

window.Spatial3DEngine = Spatial3DEngine;
