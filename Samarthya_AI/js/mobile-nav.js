// ============================================
// Sanjeevani Grid — Mobile Responsive Navigation
// Handles Mobile Hamburger Menu, Backdrop, Keyboard & Accessibility
// ============================================

const MobileNav = {
  isOpen: false,

  init() {
    // 1. Listen for Escape key to close menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // 2. Synchronize initial language on mobile select if available
    if (window.I18N && I18N.currentLang) {
      this.syncLang(I18N.currentLang);
    }

    // 3. Close mobile nav when clicking outside if not intercepted by backdrop
    document.addEventListener('click', (e) => {
      if (!this.isOpen) return;
      const toggle = document.getElementById('mobileNavToggle');
      const panel = document.getElementById('mobileNavPanel');
      if (toggle && !toggle.contains(e.target) && panel && !panel.contains(e.target)) {
        this.close();
      }
    });
  },

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  open() {
    this.isOpen = true;
    const toggle = document.getElementById('mobileNavToggle');
    const panel = document.getElementById('mobileNavPanel');
    const backdrop = document.getElementById('mobileNavBackdrop');

    if (toggle) {
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }
    if (panel) {
      panel.classList.add('open');
    }
    if (backdrop) {
      backdrop.classList.add('open');
    }

    // Dismiss floating drawers if open to avoid collision
    if (window.AccessibilitySuite && typeof AccessibilitySuite.closePanel === 'function') {
      AccessibilitySuite.closePanel();
    }
    if (window.SamarthyaAI && typeof SamarthyaAI.close === 'function') {
      SamarthyaAI.close();
    }
  },

  close() {
    this.isOpen = false;
    const toggle = document.getElementById('mobileNavToggle');
    const panel = document.getElementById('mobileNavPanel');
    const backdrop = document.getElementById('mobileNavBackdrop');

    if (toggle) {
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    if (panel) {
      panel.classList.remove('open');
    }
    if (backdrop) {
      backdrop.classList.remove('open');
    }
  },

  syncActive(page) {
    const links = document.querySelectorAll('#mobileNavLinks .mobile-nav-link');
    links.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('data-page') === page) {
        l.classList.add('active');
      }
    });
  },

  syncLang(lang) {
    const desktopSelect = document.getElementById('langSelect');
    const mobileSelect = document.getElementById('mobileLangSelect');
    if (desktopSelect && desktopSelect.value !== lang) {
      desktopSelect.value = lang;
    }
    if (mobileSelect && mobileSelect.value !== lang) {
      mobileSelect.value = lang;
    }
  }
};

window.MobileNav = MobileNav;

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MobileNav.init());
} else {
  MobileNav.init();
}
