// ============================================
// Samarthya — Main App Controller
// SPA Routing, Form Controller, Scheme Matcher & Dashboard
// ============================================

const App = {
  currentPage: 'home',
  currentPersona: 'welfare', // 'welfare' (PwD) | 'credit' (SC / NSFDC)
  matchResults: null,
  profile: null,
  creditMatchResults: null,
  creditProfile: null,

  init() {
    this.populateFormOptions();
    this.populateCreditFormOptions();
    this.setupNavScroll();
    this.setupKeyboardNav();
    this.setupModalClose();

    // Initialize core feature engines
    if (window.SamarthyaDB) SamarthyaDB.init();
    if (window.AccessibilitySuite) AccessibilitySuite.init();
    if (window.WisprFlow) WisprFlow.init();
    if (window.SamarthyaAI) SamarthyaAI.init();
    if (window.WhatsAppLead) WhatsAppLead.init();
    if (window.ApplicationTracker) ApplicationTracker.init();
    if (window.NGOMode) NGOMode.init();
    if (window.CursorEffect) CursorEffect.init();
    if (window.FinancialCalculator) FinancialCalculator.init();
    if (window.PartnerLocator) PartnerLocator.init();
    this.initHeroVideo();

    // Check URL hash for window routing
    const rawHash = window.location.hash.replace('#', '');
    const aliasMap = {
      'relief': 'relief',
      'section-03': 'relief',
      'why': 'why',
      'section-04': 'why',
      'features': 'features',
      'section-05': 'features',
      'portals': 'portals',
      'section-06': 'portals',
      'how': 'features',
      'about-section': 'why',
      'match': 'match',
      'dashboard': 'dashboard',
      'results': 'results',
      'home': 'home'
    };
    const initialPage = aliasMap[rawHash] || (rawHash && document.getElementById('page-' + rawHash) ? rawHash : 'home');
    this.navigate(initialPage, false);

    // Listen for browser back/forward and hash changes
    window.addEventListener('popstate', () => {
      const currentHash = window.location.hash.replace('#', '') || 'home';
      const mappedPage = aliasMap[currentHash] || currentHash;
      if (document.getElementById('page-' + mappedPage) && App.currentPage !== mappedPage) {
        App.navigate(mappedPage, false);
      }
    });
  },

  setPersona(persona) {
    this.currentPersona = persona;

    // Update switcher buttons
    const heroWelfare = document.getElementById('heroPersonaWelfare');
    const heroCredit = document.getElementById('heroPersonaCredit');
    const finderWelfare = document.getElementById('finderPersonaWelfare');
    const finderCredit = document.getElementById('finderPersonaCredit');

    if (heroWelfare) heroWelfare.classList.toggle('active', persona === 'welfare');
    if (heroCredit) heroCredit.classList.toggle('active', persona === 'credit');
    if (finderWelfare) finderWelfare.classList.toggle('active', persona === 'welfare');
    if (finderCredit) finderCredit.classList.toggle('active', persona === 'credit');

    const heroCardW = document.getElementById('heroCardWelfare');
    const heroCardC = document.getElementById('heroCardCredit');
    if (heroCardW) heroCardW.classList.toggle('active-card', persona === 'welfare');
    if (heroCardC) heroCardC.classList.toggle('active-card', persona === 'credit');

    // Update Hero Content dynamically if on Home
    const heroTitle = document.querySelector('.hero-headline');
    const heroTagline = document.querySelector('.hero-tagline');
    const heroBadge = document.querySelector('.hero-badge span:last-child');
    const heroCtaText = document.getElementById('heroCtaText');

    if (heroTitle && heroTagline && heroBadge) {
      const isHindi = typeof I18N !== 'undefined' && I18N.currentLang === 'hi';
      if (persona === 'credit') {
        heroBadge.textContent = isHindi
          ? 'SIH26093 • एनएसएफडीसी रियायती ऋण एवं उद्यम वित्तपोषण'
          : 'SIH26093 • NSFDC Concessional Credit & Enterprise Loans';
        heroTitle.innerHTML = isHindi
          ? 'अनुसूचित जाति उद्यमियों का सशक्तिकरण <span class="gradient-text">रियायती ऋण</span> के साथ'
          : 'Empowering SC Entrepreneurs with <span class="gradient-text">Concessional Credit</span>';
        heroTagline.textContent = isHindi
          ? 'कम ब्याज दर (6.5%–8%) पर ऋण खोजें, ऋण स्थगन (मोरेटोरियम) का आकलन करें, और प्रमाणित चैनल पार्टनर (SCA, PSB, RRB) खोजें।'
          : 'Discover low-interest credit (6.5%–8%), evaluate moratorium holidays, and locate accredited Channel Partners (SCAs, PSBs, RRBs) with healthy fund flow.';
        if (heroCtaText) heroCtaText.textContent = isHindi ? 'ऋण योजनाएं खोजें' : 'Find Credit Schemes';
      } else {
        heroBadge.textContent = isHindi
          ? 'एआई-संचालित सरकारी योजना मिलान'
          : 'AI-Powered Government Scheme Matching';
        heroTitle.innerHTML = isHindi
          ? 'प्रत्येक छात्र का सशक्तिकरण <span class="gradient-text">स्मार्ट कल्याण योजनाओं</span> के साथ'
          : 'Empowering Every Student with <span class="gradient-text">Smart Welfare</span>';
        heroTagline.textContent = isHindi
          ? '2 सेकंड से भी कम समय में सभी अधिकृत केंद्रीय और राज्य योजनाओं की खोज करें। बिना आधार या दस्तावेज़ अपलोड किए — पूरी तरह से निजी और त्वरित।'
          : 'Discover all entitled central and state welfare schemes in under 2 seconds. Zero Aadhaar or document uploads required — purely privacy-first and instant.';
        if (heroCtaText) heroCtaText.textContent = isHindi ? 'मेरी योजनाएं खोजें' : 'Find My Schemes';
      }
    }

    // Toggle Form & Result views on Match page
    const welfareForm = document.getElementById('welfareFormContainer');
    const creditForm = document.getElementById('creditFormContainer');
    const welfareResults = document.getElementById('resultsArea');
    const creditResults = document.getElementById('creditResultsArea');

    if (welfareForm && creditForm) {
      if (persona === 'credit') {
        welfareForm.style.display = 'none';
        creditForm.style.display = 'block';
        if (welfareResults) welfareResults.style.display = 'none';
        if (creditResults && this.creditMatchResults) {
          creditResults.style.display = 'block';
        }
      } else {
        welfareForm.style.display = 'block';
        creditForm.style.display = 'none';
        if (creditResults) creditResults.style.display = 'none';
        if (welfareResults && this.matchResults) {
          welfareResults.style.display = 'block';
        }
      }
    }

    this.populateCreditFormOptions();
    if (window.MotionEngine) {
      MotionEngine.setOpportunityFieldTheme(persona);
    }
    if (window.SoundEngine) {
      SoundEngine.playWhoosh();
    }
    if (window.AccessibilitySuite) {
      AccessibilitySuite.announce(`Switched to ${persona === 'credit' ? 'Credit and Enterprise Schemes' : 'Welfare and Education Schemes'} track`);
    }
  },

  navigate(page, eventOrPushState = true) {
    if (eventOrPushState && typeof eventOrPushState === 'object' && eventOrPushState.preventDefault) {
      eventOrPushState.preventDefault();
    }

    const aliasMap = {
      'relief': 'relief',
      'section-03': 'relief',
      'why': 'why',
      'section-04': 'why',
      'features': 'features',
      'section-05': 'features',
      'portals': 'portals',
      'section-06': 'portals',
      'how': 'features',
      'about-section': 'why',
      'about': 'why'
    };
    page = aliasMap[page] || page;

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show target page
    let target = document.getElementById('page-' + page);
    if (!target || page === 'ngo') {
      page = 'home';
      target = document.getElementById('page-home');
    }
    if (target) {
      target.classList.add('active');
      target.querySelectorAll('.animate-in').forEach(el => {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
      });

      if (page === 'dashboard' && window.ApplicationTracker) {
        ApplicationTracker.renderTracker();
      }
      if (page === 'ngo' && window.NGOMode) {
        NGOMode.renderNGODashboard();
      }
      if (page === 'features' && window.PartnerLocator && PartnerLocator.map) {
        setTimeout(() => PartnerLocator.map.invalidateSize(), 200);
      }
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll(`.nav-link[data-page="${page}"]`).forEach(l => l.classList.add('active'));

    // Also update primary header navSectionsMenu links
    const sectionNavLinks = document.querySelectorAll('#navSectionsMenu a');
    sectionNavLinks.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('data-page') === page) {
        l.classList.add('active');
      }
    });

    this.currentPage = page;
    const shouldPushState = typeof eventOrPushState === 'boolean' ? eventOrPushState : true;
    if (shouldPushState && window.location.hash !== '#' + page) {
      window.location.hash = page;
    }

    // Close mobile nav
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.remove('open');

    // Dismiss floating drawers when navigating to prevent obstruction
    if (window.AccessibilitySuite && typeof AccessibilitySuite.closePanel === 'function') {
      AccessibilitySuite.closePanel();
    }
    if (window.SamarthyaAI && typeof SamarthyaAI.close === 'function') {
      SamarthyaAI.close();
    }

    if (page === 'match') {
      const matchPage = document.getElementById('page-match');
      if (matchPage && !matchPage.dataset.drawerDismissBound) {
        matchPage.dataset.drawerDismissBound = 'true';
        matchPage.addEventListener('focusin', () => {
          if (window.AccessibilitySuite) AccessibilitySuite.closePanel();
          if (window.SamarthyaAI) SamarthyaAI.close();
        });
        matchPage.addEventListener('click', (e) => {
          if (e.target.closest('.btn') || e.target.closest('.form-input') || e.target.closest('.form-select') || e.target.closest('.checkbox-item')) {
            if (window.AccessibilitySuite) AccessibilitySuite.closePanel();
            if (window.SamarthyaAI) SamarthyaAI.close();
          }
        });
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  scrollToSection(sectionId, e) {
    if (e && e.preventDefault) e.preventDefault();
    const map = {
      'section-01': 'home',
      'section-02': 'home',
      'section-03': 'relief',
      'section-04': 'why',
      'section-05': 'features',
      'section-06': 'portals',
    };
    const targetPage = map[sectionId] || 'home';
    this.navigate(targetPage, e);
  },

  scrollToHow(e) {
    if (e && e.preventDefault) e.preventDefault();
    this.navigate('features', e);
  },

  scrollToAbout(e) {
    if (e && e.preventDefault) e.preventDefault();
    this.navigate('why', e);
  },

  initHeroVideo() {
    const video = document.getElementById('heroPromoVideo');
    if (!video) return;

    // Check Network Information API (2G, slow-2g, or saveData)
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowNetwork = conn && (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.saveData);

    const videoWrapper = document.getElementById('heroVideoStageWrapper');

    if (isSlowNetwork) {
      // 2G Lite Mode: Never download 7MB video automatically!
      if (videoWrapper && !document.getElementById('video2gNotice')) {
        const notice = document.createElement('div');
        notice.id = 'video2gNotice';
        notice.className = 'video-2g-notice';
        notice.innerHTML = `
          <div class="video-2g-badge">⚡ 2G Lite Mode Active</div>
          <div class="video-2g-text">Video deferred to save mobile data. Tap below if you want to stream.</div>
          <button type="button" class="btn-2g-play" onclick="App.loadHeroVideoExplicitly()">
            ▶ Load Video (7 MB)
          </button>
        `;
        videoWrapper.appendChild(notice);
      }
      return;
    }

    // Normal/Fast connection: Defer video loading until after initial page is fully interactive and idle
    const loadDeferredVideo = () => {
      const src = video.getAttribute('data-src');
      if (src && !video.src) {
        video.src = src;
      }
      video.playbackRate = 0.7;
      video.play().catch(() => {});
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => setTimeout(loadDeferredVideo, 600));
    } else {
      setTimeout(loadDeferredVideo, 1000);
    }
  },

  loadHeroVideoExplicitly() {
    const video = document.getElementById('heroPromoVideo');
    const notice = document.getElementById('video2gNotice');
    if (notice) notice.remove();
    if (!video) return;

    const src = video.getAttribute('data-src') || 'feature/promo_video.mp4';
    video.src = src;
    video.playbackRate = 0.7;
    video.play().catch(() => {});
  },

  toggleHeroVideoSound() {
    const video = document.getElementById('heroPromoVideo');
    const text = document.getElementById('heroVideoSoundText');
    const btn = document.getElementById('heroVideoSoundBtn');
    if (!video) return;
    video.muted = !video.muted;
    if (text) text.textContent = video.muted ? 'Muted' : 'Sound On';
    if (btn) btn.innerHTML = video.muted ? '🔇 <span id="heroVideoSoundText">Muted</span>' : '🔊 <span id="heroVideoSoundText">Sound On</span>';
  },

  toggleHeroVideoPlay() {
    const video = document.getElementById('heroPromoVideo');
    const btn = document.getElementById('heroVideoPlayBtn');
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      if (btn) btn.innerHTML = '⏸️ <span id="heroVideoPlayText">Pause</span>';
    } else {
      video.pause();
      if (btn) btn.innerHTML = '▶️ <span id="heroVideoPlayText">Play</span>';
    }
  },

  toggleMobileNav() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.toggle('open');
  },

  setupNavScroll() {
    const header = document.getElementById('mainHeader') || document.querySelector('.site-main-nav');
    const navMenu = document.getElementById('navSectionsMenu');
    const navLinks = navMenu ? navMenu.querySelectorAll('a') : document.querySelectorAll('.nav-section-item a');

    // 1. Navigation Link Handling: Each link changes the active window
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        const href = link.getAttribute('href');

        if (page) {
          App.navigate(page, e);
        } else if (href && href.startsWith('#page-')) {
          App.navigate(href.replace('#page-', ''), e);
        } else if (href && href.startsWith('#section-')) {
          App.scrollToSection(href.replace('#', ''), e);
        }
      });
    });

    // Brand logo click navigates to Home window
    const brandGroup = document.querySelector('.nav-brand-group');
    if (brandGroup) {
      brandGroup.addEventListener('click', (e) => {
        e.preventDefault();
        App.navigate('home', e);
      });
    }

    // Dynamic Scrolled Navbar Styling
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      if (header) {
        if (scrollY > 30) {
          header.classList.add('nav-scrolled', 'scrolled');
        } else {
          header.classList.remove('nav-scrolled', 'scrolled');
        }
      }
    }, { passive: true });
  },

  setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        if (window.AccessibilitySuite) AccessibilitySuite.closePanel();
        if (window.SamarthyaAI) SamarthyaAI.close();
        if (window.WisprFlow) WisprFlow.stop();
      }
    });
  },

  setupModalClose() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') this.closeModal();
      });
    }
  },

  populateFormOptions() {
    // Populate states
    const stateSelect = document.getElementById('inputState');
    if (stateSelect && stateSelect.options.length <= 1 && typeof INDIAN_STATES !== 'undefined') {
      INDIAN_STATES.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.label;
        stateSelect.appendChild(opt);
      });
    }

    // Populate education levels
    const eduSelect = document.getElementById('inputEducation');
    if (eduSelect && eduSelect.options.length <= 1 && typeof EDUCATION_LEVELS !== 'undefined') {
      EDUCATION_LEVELS.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = I18N.currentLang === 'hi' ? e.labelHi : e.label;
        eduSelect.appendChild(opt);
      });
    }

    // Populate disability checkboxes
    const checkboxContainer = document.getElementById('disabilityCheckboxes');
    if (checkboxContainer && checkboxContainer.children.length === 0 && typeof DISABILITY_TYPES !== 'undefined') {
      DISABILITY_TYPES.forEach(d => {
        const item = document.createElement('div');
        item.className = 'checkbox-item';
        item.setAttribute('data-value', d.id);
        item.innerHTML = `
          <input type="checkbox" value="${d.id}">
          <span class="checkbox-custom"></span>
          <span>${I18N.currentLang === 'hi' ? d.labelHi : d.label}</span>
        `;
        item.addEventListener('click', (e) => {
          const cb = item.querySelector('input[type="checkbox"]');
          if (e.target !== cb) {
            cb.checked = !cb.checked;
          }

          if (cb.value === 'none' && cb.checked) {
            checkboxContainer.querySelectorAll('input[type="checkbox"]').forEach(other => {
              if (other !== cb) {
                other.checked = false;
                other.closest('.checkbox-item').classList.remove('selected');
              }
            });
          } else if (cb.value !== 'none' && cb.checked) {
            const noneCheckbox = checkboxContainer.querySelector('input[value="none"]');
            if (noneCheckbox) {
              noneCheckbox.checked = false;
              noneCheckbox.closest('.checkbox-item').classList.remove('selected');
            }
          }

          item.classList.toggle('selected', cb.checked);
          FormController.toggleDisabilityPercentVisibility();
        });
        checkboxContainer.appendChild(item);
      });
      FormController.toggleDisabilityPercentVisibility();
    }
  },

  populateCreditFormOptions() {
    // Populate credit state dropdown
    const stateSelect = document.getElementById('creditInputState');
    if (stateSelect && stateSelect.options.length <= 1 && typeof INDIAN_STATES !== 'undefined') {
      INDIAN_STATES.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.label;
        stateSelect.appendChild(opt);
      });
    }

    // Populate sector dropdown
    const sectorSelect = document.getElementById('creditInputSector');
    if (sectorSelect && sectorSelect.options.length <= 1 && typeof PROJECT_SECTORS !== 'undefined') {
      PROJECT_SECTORS.forEach(sec => {
        const opt = document.createElement('option');
        opt.value = sec.id;
        opt.textContent = `${sec.icon} ${I18N.currentLang === 'hi' ? sec.labelHi : sec.label}`;
        sectorSelect.appendChild(opt);
      });
    }

    // Populate courses dropdown
    const courseSelect = document.getElementById('creditInputCourse');
    if (courseSelect && courseSelect.options.length <= 1 && typeof EDUCATION_COURSES !== 'undefined') {
      EDUCATION_COURSES.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = I18N.currentLang === 'hi' ? c.labelHi : c.label;
        courseSelect.appendChild(opt);
      });
    }
  },

  showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('active');
  },

  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('active');
  },

  openModal(html) {
    const content = document.getElementById('modalContent');
    const overlay = document.getElementById('modalOverlay');
    if (content && overlay) {
      content.innerHTML = html;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  },

  showSchemeDetails(schemeId) {
    let result = null;
    if (this.matchResults) {
      result = this.matchResults.find(r => r.scheme.id === schemeId);
    }
    const s = SCHEME_DATABASE.find(item => item.id === schemeId);
    if (!s) return;

    const lang = I18N.currentLang;
    const score = result ? result.score : 85;

    const checksHtml = result ? result.checks.map(c => `
      <div class="check-item ${c.passed ? 'passed' : 'failed'}">
        <div class="check-icon">${c.passed ? '✓' : '✗'}</div>
        <div>
          <strong>${c.name}</strong> (Weight: ${c.weight}%)
          ${c.detail ? `<div class="check-detail">${c.detail}</div>` : ''}
        </div>
      </div>
    `).join('') : '';

    const docsHtml = (s.documents || []).map(d => `
      <div class="doc-item">
        <span>📄</span>
        <span>${d}</span>
      </div>
    `).join('');

    const modalHtml = `
      <div class="modal" style="position:relative;background:rgba(7,35,34,0.98);backdrop-filter:blur(24px);border:1.5px solid var(--border);border-radius:var(--radius-xl);padding:32px;max-width:680px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:var(--shadow-lg)">
        <button class="modal-close" onclick="App.closeModal()" style="position:absolute;top:18px;right:18px;background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer">✕</button>

        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span class="section-tag" style="margin:0">${s.category.toUpperCase()}</span>
          <span style="font-size:12px;color:var(--accent-mint);font-weight:700">● ${score}% Match Fit</span>
        </div>

        <h2 style="font-family:var(--font-heading);font-size:24px;font-weight:800;color:#fff;margin-bottom:6px">${lang === 'hi' ? s.nameHi : s.name}</h2>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">${s.ministry}</p>

        <div class="scheme-benefit" style="margin-bottom:20px">
          <div class="scheme-benefit-amount">${s.benefits.amount}</div>
          <div class="scheme-benefit-desc">${s.benefits.description}</div>
        </div>

        <div style="margin-bottom:20px">
          <h4 style="font-size:14px;font-weight:700;color:#fff;margin-bottom:8px">📋 Eligibility Rules Evaluation</h4>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${checksHtml}
          </div>
        </div>

        <div style="margin-bottom:24px">
          <h4 style="font-size:14px;font-weight:700;color:#fff;margin-bottom:8px">📄 Required Documents</h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px">
            ${docsHtml}
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;border-top:1px solid var(--border);padding-top:20px">
          <button class="btn btn-secondary" onclick="ApplicationTracker.trackScheme('${s.id}');App.closeModal()">
            📂 Track in Pipeline
          </button>
          <a href="${s.applyUrl}" target="_blank" rel="noopener" class="btn btn-primary" style="text-decoration:none">
            Apply on Official Portal →
          </a>
        </div>
      </div>
    `;

    this.openModal(modalHtml);
  }
};

// ============ Anti-Bot Security Controller ============
const CaptchaController = {
  a: 0,
  b: 0,
  ans: 0,

  init() {
    this.refreshChallenge();
  },

  refreshChallenge() {
    this.a = Math.floor(Math.random() * 9) + 2;
    this.b = Math.floor(Math.random() * 8) + 1;
    this.ans = this.a + this.b;

    const q = document.getElementById('captchaQuestion');
    if (q) q.textContent = `${this.a} + ${this.b} = ?`;

    const input = document.getElementById('captchaInput');
    if (input) input.value = '';
    const err = document.getElementById('captchaError');
    if (err) err.style.display = 'none';
  },

  validate() {
    const hp = document.getElementById('hpField');
    if (hp && hp.value !== '') return false;

    const input = document.getElementById('captchaInput');
    if (!input || parseInt(input.value) !== this.ans) {
      const err = document.getElementById('captchaError');
      if (err) {
        err.textContent = 'Incorrect security answer. Please solve again.';
        err.style.display = 'block';
      }
      this.refreshChallenge();
      return false;
    }
    return true;
  }
};

// ============ Form Stepper Controller ============
const FormController = {
  currentStep: 1,

  goToStep(step) {
    if (step > this.currentStep && !this.validateCurrentStep()) return;

    document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.step-dot').forEach((d, idx) => {
      d.classList.remove('active');
      if (idx + 1 < step) d.classList.add('completed');
      else d.classList.remove('completed');
    });
    document.querySelectorAll('.step-label').forEach(l => l.classList.remove('active'));

    const targetPanel = document.getElementById('formStep' + step);
    if (targetPanel) targetPanel.classList.add('active');

    const targetDot = document.getElementById('stepDot' + step);
    if (targetDot) targetDot.classList.add('active');

    const labels = document.querySelectorAll('.step-label');
    if (labels[step - 1]) labels[step - 1].classList.add('active');

    for (let i = 1; i <= 2; i++) {
      const line = document.getElementById('stepLine' + i);
      if (line) {
        if (i < step) line.classList.add('completed');
        else line.classList.remove('completed');
      }
    }

    this.currentStep = step;
    if (step === 2) {
      this.toggleDisabilityPercentVisibility();
    }
  },

  nextStep() {
    if (this.validateCurrentStep()) {
      this.goToStep(this.currentStep + 1);
    }
  },

  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  },

  showFieldValidation(stepPanelId, invalidFields, message) {
    const panel = document.getElementById(stepPanelId);
    if (!panel) return;

    // Shake the form card
    const card = panel.querySelector('.form-card');
    if (card) {
      card.classList.remove('form-shake');
      void card.offsetWidth;
      card.classList.add('form-shake');
      setTimeout(() => card.classList.remove('form-shake'), 450);
    }

    // Highlight fields and show error text
    invalidFields.forEach(({ el, errEl }) => {
      if (el) {
        el.classList.add('has-error');
        const clearHandler = () => {
          el.classList.remove('has-error');
          if (errEl) errEl.classList.remove('show');
          el.removeEventListener('input', clearHandler);
          el.removeEventListener('change', clearHandler);
        };
        el.addEventListener('input', clearHandler);
        el.addEventListener('change', clearHandler);
      }
      if (errEl) {
        errEl.classList.add('show');
      }
    });

    // Show/Update inline validation toast inside card
    if (card) {
      let toast = card.querySelector('.form-validation-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'form-validation-toast';
        card.insertBefore(toast, card.firstChild);
      }
      toast.innerHTML = `<span>⚠️</span> <span>${message || 'Please complete all required fields highlighted in red.'}</span>`;
    }

    // Scroll first invalid field into view smoothly
    if (invalidFields[0] && invalidFields[0].el) {
      invalidFields[0].el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof invalidFields[0].el.focus === 'function') {
        setTimeout(() => invalidFields[0].el.focus(), 150);
      }
    }
  },

  clearFieldValidation(stepPanelId) {
    const panel = document.getElementById(stepPanelId);
    if (!panel) return;
    panel.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
    panel.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
    const toast = panel.querySelector('.form-validation-toast');
    if (toast) toast.remove();
  },

  validateCurrentStep() {
    this.clearFieldValidation('formStep' + this.currentStep);

    if (this.currentStep === 1) {
      const dobInput = document.getElementById('inputDob');
      const genderSelect = document.getElementById('inputGender');
      const stateSelect = document.getElementById('inputState');
      const invalidFields = [];

      if (!dobInput || !dobInput.value) {
        invalidFields.push({ el: dobInput, errEl: dobInput?.parentElement?.querySelector('.form-error') });
      }
      if (!genderSelect || !genderSelect.value) {
        invalidFields.push({ el: genderSelect, errEl: genderSelect?.parentElement?.querySelector('.form-error') });
      }
      if (!stateSelect || !stateSelect.value) {
        invalidFields.push({ el: stateSelect, errEl: stateSelect?.parentElement?.querySelector('.form-error') });
      }

      if (invalidFields.length > 0) {
        this.showFieldValidation('formStep1', invalidFields, 'Please complete Date of Birth, Gender, and State Domicile to proceed.');
        return false;
      }
      return true;
    }

    if (this.currentStep === 2) {
      const checked = document.querySelectorAll('#disabilityCheckboxes input:checked');
      if (checked.length === 0) {
        const boxGrid = document.getElementById('disabilityCheckboxes');
        const err = document.getElementById('disabilityError');
        this.showFieldValidation('formStep2', [{ el: boxGrid, errEl: err }], 'Please select at least one condition or "No Disability".');
        return false;
      }
      return true;
    }

    if (this.currentStep === 3) {
      const eduSelect = document.getElementById('inputEducation');
      const incSelect = document.getElementById('inputIncome');
      const invalidFields = [];

      if (!eduSelect || !eduSelect.value) {
        invalidFields.push({ el: eduSelect, errEl: eduSelect?.parentElement?.querySelector('.form-error') });
      }
      if (!incSelect || !incSelect.value) {
        invalidFields.push({ el: incSelect, errEl: incSelect?.parentElement?.querySelector('.form-error') });
      }

      if (invalidFields.length > 0) {
        this.showFieldValidation('formStep3', invalidFields, 'Please select your current education level and annual income.');
        return false;
      }
      return true;
    }
    return true;
  },

  updatePercent(val) {
    const disp = document.getElementById('percentDisplay');
    if (disp) disp.textContent = val + '%';
  },

  toggleDisabilityPercentVisibility() {
    const percentGroup = document.getElementById('disabilityPercentGroup');
    if (!percentGroup) return;

    const checkedCbs = Array.from(document.querySelectorAll('#disabilityCheckboxes input:checked'));
    const isNoneChecked = checkedCbs.some(cb => cb.value === 'none');
    const hasDisabilityChecked = checkedCbs.some(cb => cb.value !== 'none');

    if (isNoneChecked || !hasDisabilityChecked) {
      percentGroup.style.display = 'none';
      const percentInput = document.getElementById('inputPercent');
      if (percentInput) percentInput.value = 0;
      const disp = document.getElementById('percentDisplay');
      if (disp) disp.textContent = '0%';
    } else {
      percentGroup.style.display = 'block';
      const percentInput = document.getElementById('inputPercent');
      if (percentInput && parseInt(percentInput.value) === 0) {
        percentInput.value = 40;
        const disp = document.getElementById('percentDisplay');
        if (disp) disp.textContent = '40%';
      }
    }
  },

  submit() {
    if (!this.validateCurrentStep()) return;

    const disabilityTypes = [];
    document.querySelectorAll('#disabilityCheckboxes input:checked').forEach(cb => {
      disabilityTypes.push(cb.value);
    });

    const isNone = disabilityTypes.includes('none') || disabilityTypes.length === 0;
    const disabilityPercent = isNone ? 0 : parseInt(document.getElementById('inputPercent').value || '0');

    const dob = document.getElementById('inputDob').value;
    const age = SamarthyaMatcher.calculateAge(dob);

    const profile = {
      name: document.getElementById('inputName').value || 'Student Beneficiary',
      dob: dob,
      age: age,
      gender: document.getElementById('inputGender').value,
      state: document.getElementById('inputState').value,
      disabilityTypes: disabilityTypes,
      disabilityPercent: disabilityPercent,
      educationLevel: document.getElementById('inputEducation').value,
      householdIncome: parseInt(document.getElementById('inputIncome').value)
    };

    App.profile = profile;
    App.showLoading();

    setTimeout(() => {
      const results = SamarthyaMatcher.match(profile, SCHEME_DATABASE);
      App.matchResults = results;

      ResultsRenderer.render(results, profile);
      DashboardRenderer.render(results, profile);

      App.hideLoading();
    }, 900);
  }
};

// ============ Credit Form Stepper Controller (SIH26093) ============
const CreditFormController = {
  currentStep: 1,

  goToStep(step) {
    if (step > this.currentStep && !this.validateCurrentStep()) return;

    document.querySelectorAll('.credit-form-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.credit-step-dot').forEach((d, idx) => {
      d.classList.remove('active');
      if (idx + 1 < step) d.classList.add('completed');
      else d.classList.remove('completed');
    });
    document.querySelectorAll('.credit-step-label').forEach(l => l.classList.remove('active'));

    const targetPanel = document.getElementById('creditFormStep' + step);
    if (targetPanel) targetPanel.classList.add('active');

    const targetDot = document.getElementById('creditStepDot' + step);
    if (targetDot) targetDot.classList.add('active');

    const labels = document.querySelectorAll('.credit-step-label');
    if (labels[step - 1]) labels[step - 1].classList.add('active');

    for (let i = 1; i <= 2; i++) {
      const line = document.getElementById('creditStepLine' + i);
      if (line) {
        if (i < step) line.classList.add('completed');
        else line.classList.remove('completed');
      }
    }

    this.currentStep = step;
  },

  nextStep() {
    if (this.validateCurrentStep()) {
      this.goToStep(this.currentStep + 1);
    }
  },

  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  },

  validateCurrentStep() {
    const panel = document.getElementById('creditFormStep' + this.currentStep);
    if (panel) {
      panel.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
      panel.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
      const toast = panel.querySelector('.form-validation-toast');
      if (toast) toast.remove();
    }

    if (this.currentStep === 1) {
      const state = document.getElementById('creditInputState');
      const gender = document.getElementById('creditInputGender');
      const invalidFields = [];
      if (!state?.value) invalidFields.push({ el: state, errEl: state?.parentElement?.querySelector('.form-error') });
      if (!gender?.value) invalidFields.push({ el: gender, errEl: gender?.parentElement?.querySelector('.form-error') });
      if (invalidFields.length > 0) {
        FormController.showFieldValidation('creditFormStep1', invalidFields, 'Please select your state domicile and gender.');
        return false;
      }
      return true;
    }

    if (this.currentStep === 2) {
      const cost = document.getElementById('creditInputCost');
      const costVal = parseInt(cost?.value || 0);
      if (costVal <= 0) {
        FormController.showFieldValidation('creditFormStep2', [{ el: cost, errEl: cost?.parentElement?.querySelector('.form-error') }], 'Please enter a valid estimated project or course cost.');
        return false;
      }
      return true;
    }

    if (this.currentStep === 3) {
      const income = document.getElementById('creditInputIncome');
      if (!income?.value) {
        FormController.showFieldValidation('creditFormStep3', [{ el: income, errEl: income?.parentElement?.querySelector('.form-error') }], 'Please select your annual household income range.');
        return false;
      }
      return true;
    }

    return true;
  },

  setPurpose(purpose) {
    const isEdu = purpose === 'education';
    const bizRow = document.getElementById('creditBizSectorRow');
    const eduRow = document.getElementById('creditEduCourseRow');
    if (bizRow) bizRow.style.display = isEdu ? 'none' : 'block';
    if (eduRow) eduRow.style.display = isEdu ? 'block' : 'none';
  },

  setCost(val) {
    const costInput = document.getElementById('creditInputCost');
    if (costInput) {
      costInput.value = val;
    }
  },

  submit() {
    if (!this.validateCurrentStep()) return;

    const isSC = document.getElementById('creditInputCasteCert')?.checked;
    const purpose = document.querySelector('input[name="creditPurpose"]:checked')?.value || 'business';
    const sector = purpose === 'education'
      ? document.getElementById('creditInputCourse')?.value || 'engineering'
      : document.getElementById('creditInputSector')?.value || 'trade';

    const profile = {
      name: document.getElementById('creditInputName')?.value || 'SC Entrepreneur Beneficiary',
      casteCertificate: isSC,
      gender: document.getElementById('creditInputGender')?.value || 'male',
      state: document.getElementById('creditInputState')?.value || 'delhi',
      purpose: purpose,
      projectType: sector,
      projectCost: parseInt(document.getElementById('creditInputCost')?.value || 100000),
      householdIncome: parseInt(document.getElementById('creditInputIncome')?.value || 150000)
    };

    App.creditProfile = profile;
    App.showLoading();

    setTimeout(() => {
      const results = CreditMatcher.match(profile, CREDIT_SCHEME_DATABASE);
      App.creditMatchResults = results;

      CreditResultsRenderer.render(results, profile);

      App.hideLoading();
    }, 800);
  }
};

// ============ Credit Results Renderer (SIH26093) ============
const CreditResultsRenderer = {
  render(results, profile) {
    const area = document.getElementById('creditResultsArea');
    if (!area) return;
    area.style.display = 'block';

    setTimeout(() => {
      area.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);

    const bestMatch = results[0];
    const isEligible = bestMatch && bestMatch.isEligible;
    const s = bestMatch ? bestMatch.scheme : CREDIT_SCHEME_DATABASE[0];

    const score = bestMatch ? bestMatch.score : 0;
    const scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#38BDF8' : score >= 40 ? '#FBBF24' : '#F43F5E';
    const circumference = 2 * Math.PI * 22;
    const dashoffset = circumference - (score / 100) * circumference;

    const checksHtml = (bestMatch ? bestMatch.checks : []).map(c => `
      <div class="check-item ${c.passed ? 'passed' : 'failed'}">
        <div class="check-icon">${c.passed ? '✓' : '✗'}</div>
        <div>
          <strong>${c.name}</strong> (Weight: ${c.weight}%)
          <div class="check-detail">${c.detail}</div>
        </div>
      </div>
    `).join('');

    const matchedPills = (bestMatch ? bestMatch.matchedReasons : []).map(r => `
      <span style="font-size:11px;color:#e2e8f0;background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:4px">✓ ${r}</span>
    `).join(' ');

    const missingBoxHtml = bestMatch && bestMatch.missingReasons && bestMatch.missingReasons.length > 0 ? `
      <div class="missing-criteria-box">
        <strong>⚠️ Evaluation Notes:</strong> ${bestMatch.missingReasons.join(' • ')}
      </div>
    ` : '';

    const headerHtml = `
      <div style="margin-bottom:24px">
        <div class="section-tag" style="margin-bottom:8px">NSFDC CONCESSIONAL CREDIT EVALUATION</div>
        <h2 class="section-title" style="font-size:30px;margin-bottom:4px">
          ${profile.name}'s Recommended Scheme
        </h2>
        <p class="section-subtitle" style="margin:0;text-align:left">
          ${isEligible
            ? `Matched to <strong>${s.name}</strong> with concessional interest rates (${s.indicativeRateDisplay}).`
            : `Application flagged per statutory NSFDC guidelines. Review missing criteria below.`
          }
        </p>
      </div>
    `;

    const cardHtml = `
      <div class="scheme-card" style="margin-bottom:28px">
        <div class="scheme-card-header">
          <div>
            <span class="scheme-category-badge" style="background:rgba(99,102,241,0.2);color:#818cf8;border:1px solid rgba(99,102,241,0.4)">
              💼 ${s.categoryLabel}
            </span>
            <span class="status-badge ${bestMatch.status === 'highly-eligible' ? 'status-highly' : bestMatch.status === 'likely-eligible' ? 'status-likely' : 'status-low'}" style="margin-left:6px">
              ${bestMatch.status.toUpperCase()}
            </span>
          </div>
          <div class="scheme-score-ring">
            <svg viewBox="0 0 48 48">
              <circle class="ring-bg" cx="24" cy="24" r="22"/>
              <circle class="ring-fill" cx="24" cy="24" r="22"
                stroke="${scoreColor}"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${dashoffset}"/>
            </svg>
            <div class="scheme-score-text" style="color:${scoreColor}">${score}%</div>
          </div>
        </div>

        <h3 class="scheme-name">${I18N.currentLang === 'hi' ? s.nameHi : s.name}</h3>
        <p class="scheme-ministry">${s.ministry}</p>

        <div class="trust-layer-card">
          <div class="trust-header">
            <span class="trust-title">🛡️ Trust Layer: Match Factors</span>
            <span class="trust-confidence-pill">${score}% Explainable Fit</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">
            ${matchedPills}
          </div>
          ${missingBoxHtml}
        </div>

        <div class="scheme-benefit">
          <div class="scheme-benefit-amount">Concessional Rate: ${s.indicativeRateDisplay} • Cap: ${s.maxAmountDisplay}</div>
          <div class="scheme-benefit-desc">${I18N.currentLang === 'hi' ? s.benefits.descriptionHi : s.benefits.description}</div>
        </div>

        <div style="margin-top:16px">
          <h4 style="font-size:13px;font-weight:700;color:#fff;margin-bottom:8px">📋 Statutory NSFDC Eligibility Checkpoints</h4>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${checksHtml}
          </div>
        </div>

        <div class="scheme-card-footer">
          <div class="scheme-deadline">
            ⏱️ Moratorium Holiday: <strong>${s.defaultMoratoriumMonths} Months Zero EMI</strong>
          </div>
          <div class="scheme-actions">
            <button class="btn-sm btn-secondary" onclick="ApplicationTracker.trackCreditScheme('${s.id}', ${bestMatch.recommendedLoanAmount}, null)">
              📂 Track Application
            </button>
            <a href="${s.applyUrl}" target="_blank" rel="noopener" class="btn-sm btn-sm-primary" style="text-decoration:none">
              Official Guidelines →
            </a>
          </div>
        </div>
      </div>
    `;

    // Render Calculator
    const calcHtml = FinancialCalculator.renderCalculatorComponent(s, profile.projectCost);

    // Render Partner Locator
    const locatorHtml = PartnerLocator.renderLocatorComponent();

    area.innerHTML = `
      ${headerHtml}
      ${cardHtml}
      ${calcHtml}
      ${locatorHtml}
    `;

    // Initialize Leaflet Map
    PartnerLocator.init(s.category, profile.state);
    PartnerLocator.mountMap();
  }
};

// ============ Results Renderer ============
const ResultsRenderer = {
  currentFilter: 'all',

  render(results, profile) {
    const area = document.getElementById('resultsArea');
    area.style.display = 'block';

    setTimeout(() => {
      area.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);

    this.renderResults(results);

    // Trigger WhatsApp notification lead modal
    if (window.WhatsAppLead) {
      WhatsAppLead.triggerPostMatchModal(results.length);
    }
  },

  renderResults(results) {
    const area = document.getElementById('resultsArea');
    let filtered = results;

    if (this.currentFilter === 'almost') {
      filtered = results.filter(r => r.isAlmostEligible);
    } else if (this.currentFilter !== 'all') {
      filtered = results.filter(r => r.scheme.category === this.currentFilter);
    }

    const almostCount = results.filter(r => r.isAlmostEligible).length;
    const categories = [...new Set(results.map(r => r.scheme.category))];

    const filterPillsHtml = `
      <div class="filter-pill ${this.currentFilter === 'all' ? 'active' : ''}" onclick="ResultsRenderer.filter('all')">
        All Schemes (${results.length})
      </div>
      <div class="filter-pill ${this.currentFilter === 'almost' ? 'active' : ''}" onclick="ResultsRenderer.filter('almost')" style="border-color:#f59e0b;color:#fbbf24">
        ⚡ Near Match (${almostCount})
      </div>
      ${categories.map(cat => {
        const catInfo = SCHEME_CATEGORIES[cat] || { icon: '📋', label: cat };
        const count = results.filter(r => r.scheme.category === cat).length;
        return `<div class="filter-pill ${this.currentFilter === cat ? 'active' : ''}" onclick="ResultsRenderer.filter('${cat}')">
          ${catInfo.icon} ${catInfo.label} (${count})
        </div>`;
      }).join('')}
    `;

    if (filtered.length === 0) {
      area.innerHTML = `
        <div class="section-header" style="margin-bottom:20px">
          <h2 class="section-title">0 Matched Schemes Found</h2>
        </div>
        <div class="filter-pills" style="margin-bottom:24px">${filterPillsHtml}</div>
        <div class="form-card" style="text-align:center;padding:40px">
          <p>No schemes matched for this specific category filter.</p>
        </div>
      `;
      return;
    }

    const cardsHtml = filtered.map((r, i) => this.renderSchemeCard(r, i)).join('');

    // WhatsApp VIP banner
    const waBannerHtml = `
      <div style="margin-bottom:28px;background:linear-gradient(135deg,rgba(37,211,102,0.15) 0%,rgba(18,140,126,0.15) 100%);border:1.5px solid rgba(37,211,102,0.4);border-radius:var(--radius-lg);padding:20px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:48px;height:48px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;box-shadow:0 0 20px rgba(37,211,102,0.5)">💬</div>
          <div>
            <div style="font-weight:800;font-size:16px;color:#fff">Never Miss a Government Scheme Update!</div>
            <div style="font-size:13px;color:var(--text-secondary)">Join 15,000+ students receiving direct WhatsApp notifications for scholarships &amp; camps.</div>
          </div>
        </div>
        <button class="btn btn-wa-submit" onclick="WhatsAppLead.openModal(${results.length})" style="padding:10px 20px;font-size:13px">
          <span>Get WhatsApp Alerts</span> <span>→</span>
        </button>
      </div>
    `;

    area.innerHTML = `
      ${waBannerHtml}
      <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:14px;margin-bottom:24px">
        <div>
          <div class="section-tag" style="margin-bottom:8px">EVALUATION RESULTS</div>
          <h2 class="section-title" style="font-size:30px;margin-bottom:4px">${App.profile.name}'s Matched Entitlements</h2>
          <p class="section-subtitle" style="margin:0;text-align:left">${filtered.length} government schemes matched based on your verified criteria.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-sm btn-primary" onclick="BeneficiaryReport.downloadReport()" title="Print / Download PDF Report">
            📄 Download Summary (PDF)
          </button>
          <button class="btn-sm btn-secondary" onclick="BeneficiaryReport.shareOnWhatsApp()" style="color:#25D366" title="Share with friends">
            📲 Share on WhatsApp
          </button>
          <button class="btn-sm btn-secondary" onclick="BeneficiaryReport.openCampLocator()" title="Nearest assistive aid camp">
            📍 Nearest Camps &amp; DDRC
          </button>
        </div>
      </div>
      <div class="filter-pills" style="margin-bottom:24px">${filterPillsHtml}</div>
      <div class="scheme-cards">${cardsHtml}</div>
    `;
  },

  renderSchemeCard(result, index) {
    const s = result.scheme;
    const lang = I18N.currentLang;
    const catInfo = SCHEME_CATEGORIES[s.category] || { icon: '📋', label: s.category, color: '#10B981' };

    const statusLabels = {
      'highly-eligible': 'Highly Eligible',
      'likely-eligible': 'Likely Eligible',
      'partially-eligible': 'Partial Match',
      'low-match': 'Low Match'
    };

    const statusClass = {
      'highly-eligible': 'status-highly',
      'likely-eligible': 'status-likely',
      'partially-eligible': 'status-partial',
      'low-match': 'status-low'
    };

    const circumference = 2 * Math.PI * 22;
    const dashoffset = circumference - (result.score / 100) * circumference;
    const scoreColor = result.score >= 80 ? '#10B981' : result.score >= 60 ? '#38BDF8' : result.score >= 40 ? '#FBBF24' : '#F43F5E';

    const matchedPills = (result.matchedReasons || []).slice(0, 3).map(r => `
      <span style="font-size:11px;color:#e2e8f0;background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:4px">✓ ${r}</span>
    `).join(' ');

    const missingBoxHtml = result.missingReasons && result.missingReasons.length > 0 ? `
      <div class="missing-criteria-box">
        <strong>⚠️ Notes:</strong> ${result.missingReasons.join(' • ')}
      </div>
    ` : '';

    return `
      <div class="scheme-card">
        <div class="scheme-card-header">
          <div>
            <span class="scheme-category-badge" style="background:${catInfo.color}20;color:${catInfo.color};border:1px solid ${catInfo.color}40">
              ${catInfo.icon} ${catInfo.label}
            </span>
            <span class="status-badge ${statusClass[result.status]}" style="margin-left:6px">${statusLabels[result.status]}</span>
          </div>
          <div class="scheme-score-ring">
            <svg viewBox="0 0 48 48">
              <circle class="ring-bg" cx="24" cy="24" r="22"/>
              <circle class="ring-fill" cx="24" cy="24" r="22"
                stroke="${scoreColor}"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${dashoffset}"/>
            </svg>
            <div class="scheme-score-text" style="color:${scoreColor}">${result.score}%</div>
          </div>
        </div>

        <h3 class="scheme-name">${lang === 'hi' ? s.nameHi : s.name}</h3>
        <p class="scheme-ministry">${s.ministry}</p>

        <div class="trust-layer-card">
          <div class="trust-header">
            <span class="trust-title">🛡️ Trust Layer: Match Factors</span>
            <span class="trust-confidence-pill">${result.score}% Score</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">
            ${matchedPills}
          </div>
          ${missingBoxHtml}
        </div>

        <div class="scheme-benefit">
          <div class="scheme-benefit-amount">${s.benefits.amount}</div>
          <div class="scheme-benefit-desc">${s.benefits.description}</div>
        </div>

        <div class="scheme-card-footer">
          <div class="scheme-deadline">
            📅 Deadline: ${result.daysToDeadline > 0 ? result.daysToDeadline + ' days remaining' : 'Active Scheme'}
          </div>
          <div class="scheme-actions">
            <button class="btn-sm btn-sm-outline" onclick="App.showSchemeDetails('${s.id}')">
              View Details
            </button>
            <button class="btn-sm btn-secondary" onclick="ApplicationTracker.trackScheme('${s.id}')">
              📂 Track
            </button>
            <a href="${s.applyUrl}" target="_blank" rel="noopener" class="btn-sm btn-sm-primary" style="text-decoration:none">
              Apply →
            </a>
          </div>
        </div>
      </div>
    `;
  },

  filter(category) {
    this.currentFilter = category;
    this.renderResults(App.matchResults);
  }
};

// ============ Dashboard Renderer ============
const DashboardRenderer = {
  render(results, profile) {
    const container = document.getElementById('dashboardContent');
    const stats = SamarthyaMatcher.getStats(results);

    let totalCashValue = 0;
    results.slice(0, 8).forEach(r => {
      const amtStr = r.scheme.benefits ? r.scheme.benefits.amount : '';
      const matchNum = amtStr.match(/₹([\d,]+)/);
      if (matchNum) {
        totalCashValue += parseInt(matchNum[1].replace(/,/g, ''));
      }
    });
    if (totalCashValue === 0) totalCashValue = 145000;

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:28px">
        <div class="form-card" style="text-align:center;padding:20px">
          <div style="font-size:24px;margin-bottom:6px">🎯</div>
          <div style="font-family:var(--font-heading);font-size:28px;font-weight:800;color:var(--accent-mint)">${results.length}</div>
          <div style="font-size:12px;color:var(--text-muted)">Matched Schemes</div>
        </div>
        <div class="form-card" style="text-align:center;padding:20px">
          <div style="font-size:24px;margin-bottom:6px">✅</div>
          <div style="font-family:var(--font-heading);font-size:28px;font-weight:800;color:#38BDF8">${stats.highlyEligible}</div>
          <div style="font-size:12px;color:var(--text-muted)">High Priority Fits</div>
        </div>
        <div class="form-card" style="text-align:center;padding:20px">
          <div style="font-size:24px;margin-bottom:6px">💰</div>
          <div style="font-family:var(--font-heading);font-size:28px;font-weight:800;color:var(--accent-gold)">₹${totalCashValue.toLocaleString('en-IN')}</div>
          <div style="font-size:12px;color:var(--text-muted)">Est. Annual Entitlements</div>
        </div>
      </div>

      <div style="margin-top:36px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div>
            <h3 style="font-size:20px;font-weight:800;color:#fff;margin:0">📂 My Applications Tracker</h3>
            <p style="font-size:13px;color:var(--text-muted);margin:2px 0 0">Live 5-stage DBT verification pipeline</p>
          </div>
          <button class="btn-sm btn-primary" onclick="App.navigate('match')">+ Find More Schemes</button>
        </div>
        <div id="trackerApplicationsList" class="tracker-container"></div>
      </div>
    `;

    setTimeout(() => {
      if (window.ApplicationTracker) ApplicationTracker.renderTracker();
    }, 100);
  }
};

// ============ Hero Morphing Concentric Rings Visualizer ============
const HeroVisualizer = {
  init() {
    const canvas = document.getElementById('morphing-rings-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let angle = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width * (window.devicePixelRatio || 1);
      height = canvas.height = rect.height * (window.devicePixelRatio || 1);
    }
    resize();
    window.addEventListener('resize', resize);

    const rings = 4;
    const particleCount = 20;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        radius: Math.random() * 140 + 40,
        speed: (Math.random() - 0.5) * 0.02,
        angle: Math.random() * Math.PI * 2,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.5 ? '#10B981' : '#38BDF8'
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      angle += 0.008;

      const cx = width / 2;
      const cy = height / 2;

      // Draw rotating concentric rings
      for (let i = 1; i <= rings; i++) {
        const r = (i * 38) * (width / 500);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(110, 231, 183, ${0.08 + (i * 0.03)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Orbital nodes
        const nodeAngle = angle * (i % 2 === 0 ? 1 : -1) + (i * 1.2);
        const nx = cx + Math.cos(nodeAngle) * r;
        const ny = cy + Math.sin(nodeAngle) * r;

        ctx.beginPath();
        ctx.arc(nx, ny, 4, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#10B981' : '#38BDF8';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw floating orbital particles
      particles.forEach(p => {
        p.angle += p.speed;
        const px = cx + Math.cos(p.angle) * (p.radius * (width / 500));
        const py = cy + Math.sin(p.angle) * (p.radius * (width / 500));

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
};

// ============ Initialize ============
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  HeroVisualizer.init();
});

