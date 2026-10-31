/**
 * ==========================================================================
 * SAMARTHYA AI — PAGE & SCENE RELATIONAL JOURNEY NAVIGATOR
 * Visualizes the explicit relationship, data flow & context connection
 * between Previous Page/Scene and Next Page/Scene
 * ==========================================================================
 */

(function (window, document) {
  'use strict';

  const RelationalNavigator = {
    currentPage: 'home',
    currentStation: 0,
    isInitialized: false,

    // Relational Map for Page-Level Transitions
    pageGraph: {
      'home': {
        title: '01 // Continuous Experience Film',
        step: 1,
        totalSteps: 3,
        prev: {
          page: 'dashboard',
          label: '03 // Entitlements Vault',
          relation: 'Monitored Benefits ➔ Return to Intake Film'
        },
        next: {
          page: 'match',
          label: '02 // Scheme Eligibility Matcher',
          relation: 'Citizen Narrative ➔ 50+ Central Scheme Inference'
        }
      },
      'match': {
        title: '02 // Criteria-Based Scheme Finder',
        step: 2,
        totalSteps: 3,
        prev: {
          page: 'home',
          label: '01 // Experience Film & Hero',
          relation: 'Baseline Profile ➔ Multi-Clause Inference Engine'
        },
        next: {
          page: 'dashboard',
          label: '03 // Entitlements Vault & Tracker',
          relation: 'Matched Entitlements (87% Match) ➔ Zero-PII Application Vault'
        }
      },
      'dashboard': {
        title: '03 // Saved Entitlements & Tracker',
        step: 3,
        totalSteps: 3,
        prev: {
          page: 'match',
          label: '02 // Scheme Eligibility Matcher',
          relation: 'Evaluated Results ➔ Persistent Zero-PII Vault'
        },
        next: {
          page: 'home',
          label: '01 // Return to Portal Home',
          relation: 'Cycle Complete ➔ Explore More Opportunities'
        }
      }
    },

    // Relational Map for Continuous Film Stations within #page-home
    stationGraph: [
      {
        id: 'scene-hero',
        station: 0,
        title: '01 // HERO INTAKE',
        subtitle: 'Citizen Baseline Profile',
        prev: {
          station: 5,
          id: 'scene-final-statement',
          label: '06 // Future & Action',
          relation: 'Autonomous Entitlements ➔ Continuous Citizen Cycle'
        },
        next: {
          station: 1,
          id: 'scene-chaos-clarity',
          label: '02 // Friction & Synthesis',
          relation: 'Citizen Profile Intake ➔ Deconstructing 50+ Fragmented Statutes'
        }
      },
      {
        id: 'scene-chaos-clarity',
        station: 1,
        title: '02 // FRICTION & SYNTHESIS',
        subtitle: 'Deconstructing Bureaucratic Entropy',
        prev: {
          station: 0,
          id: 'scene-hero',
          label: '01 // Hero Intake',
          relation: 'Baseline Identity ➔ Confronting Conflicting Clauses'
        },
        next: {
          station: 2,
          id: 'scene-dual-world',
          label: '03 // Dual-Track Allocation',
          relation: 'Synthesized Policy Clues ➔ Bifurcating into Welfare vs Credit'
        }
      },
      {
        id: 'scene-dual-world',
        station: 2,
        title: '03 // DUAL-TRACK ALLOCATION',
        subtitle: 'Welfare Subsidies vs Concessional Capital',
        prev: {
          station: 1,
          id: 'scene-chaos-clarity',
          label: '02 // Friction & Synthesis',
          relation: 'Unified Statutory Scan ➔ Allocating into Targeted Streams'
        },
        next: {
          station: 3,
          id: 'scene-welfare-engine',
          label: '04 // AI Generative Matcher',
          relation: 'Citizen Track Selected ➔ Running Deterministic 7-Clause Evaluation'
        }
      },
      {
        id: 'scene-welfare-engine',
        station: 3,
        title: '04 // AI GENERATIVE MATCHER',
        subtitle: 'Deterministic 7-Node Eligibility',
        prev: {
          station: 2,
          id: 'scene-dual-world',
          label: '03 // Dual-Track Allocation',
          relation: 'Track Allocation ➔ Evaluating RPwD & Income Clauses'
        },
        next: {
          station: 4,
          id: 'scene-financial-simulator',
          label: '05 // Credit & EMI Simulator',
          relation: '87% Benefit Probability Verified ➔ Projecting Concessional Capital & Moratorium'
        }
      },
      {
        id: 'scene-financial-simulator',
        station: 4,
        title: '05 // CONCESSIONAL SIMULATOR',
        subtitle: 'NSFDC Term Finance & Moratorium',
        prev: {
          station: 3,
          id: 'scene-welfare-engine',
          label: '04 // AI Generative Matcher',
          relation: 'Welfare Entitlement Grounded ➔ Modeling Enterprise Loan Terms'
        },
        next: {
          station: 5,
          id: 'scene-final-statement',
          label: '06 // Future & Action',
          relation: 'Capital Strategy Modeled ➔ Direct Benefit Clearance & Bank Routing'
        }
      },
      {
        id: 'scene-final-statement',
        station: 5,
        title: '06 // RESOLUTION & ACTION',
        subtitle: 'Zero-PII Direct Benefit Realization',
        prev: {
          station: 4,
          id: 'scene-financial-simulator',
          label: '05 // Concessional Simulator',
          relation: 'Loan Model Finalized ➔ Direct Beneficiary Execution'
        },
        next: {
          station: 0,
          id: 'scene-hero',
          label: '01 // Hero Intake',
          relation: 'Statutory Pathway Clear ➔ New Citizen Inquiry'
        }
      }
    ],

    init() {
      if (this.isInitialized) return;

      this.injectBridgeUI();
      this.bindScrollObserver();
      this.bindNavigationInterceptor();

      this.updateBridge();
      this.isInitialized = true;
    },

    /* --------------------------------------------------------------------------
       1. INJECT BRIDGE UI INTO DOM
       -------------------------------------------------------------------------- */
    injectBridgeUI() {
      if (document.getElementById('pageRelationalBridge')) return;

      const bridge = document.createElement('aside');
      bridge.id = 'pageRelationalBridge';
      bridge.className = 'page-relational-bridge';
      bridge.setAttribute('role', 'navigation');
      bridge.setAttribute('aria-label', 'Page and Stage Relational Continuity Bridge');

      bridge.innerHTML = `
        <div class="rel-bridge-inner">
          <!-- Previous Page/Stage Trigger -->
          <button type="button" class="rel-btn rel-prev" id="relBtnPrev" title="Navigate to Previous Stage">
            <span class="rel-arrow">&larr;</span>
            <div class="rel-meta-wrap">
              <span class="rel-tag">PREVIOUS</span>
              <span class="rel-title" id="relPrevTitle">01 // HERO</span>
            </div>
          </button>

          <!-- Center Dynamic Relation Vector (Connecting Previous & Next) -->
          <div class="rel-flow-nexus" id="relFlowNexus" title="Active Relational Conduit">
            <div class="rel-flow-header">
              <span class="rel-beacon-dot"></span>
              <span class="rel-flow-badge">RELATIONAL DATA CONDUIT</span>
              <span class="rel-step-counter" id="relStepCounter">STEP 1 / 6</span>
            </div>
            
            <div class="rel-flow-track">
              <div class="rel-flow-pulse"></div>
              <span class="rel-track-node node-left"></span>
              <span class="rel-track-arrow">&rarr;</span>
              <span class="rel-track-node node-center"></span>
              <span class="rel-track-arrow">&rarr;</span>
              <span class="rel-track-node node-right"></span>
            </div>

            <div class="rel-flow-description" id="relFlowDesc">
              <span class="rel-flow-bold">RELATION:</span>
              <span class="rel-flow-text" id="relFlowRelationText">Citizen Profile Intake &rarr; Deconstructing 50+ Statutes</span>
            </div>
          </div>

          <!-- Next Page/Stage Trigger -->
          <button type="button" class="rel-btn rel-next" id="relBtnNext" title="Proceed to Next Stage">
            <div class="rel-meta-wrap">
              <span class="rel-tag">NEXT</span>
              <span class="rel-title" id="relNextTitle">02 // CHAOS</span>
            </div>
            <span class="rel-arrow">&rarr;</span>
          </button>
        </div>
      `;

      document.body.appendChild(bridge);

      // Event listeners for prev/next buttons
      document.getElementById('relBtnPrev')?.addEventListener('click', () => this.goPrev());
      document.getElementById('relBtnNext')?.addEventListener('click', () => this.goNext());
    },

    /* --------------------------------------------------------------------------
       2. SCROLL OBSERVER (TRACKS STATION ON HOME STAGE)
       -------------------------------------------------------------------------- */
    bindScrollObserver() {
      let scrollTimer;
      window.addEventListener('scroll', () => {
        if (this.currentPage !== 'home') return;

        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          const vh = window.innerHeight;
          this.stationGraph.forEach((sg, idx) => {
            const el = document.getElementById(sg.id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= vh * 0.45 && rect.bottom >= vh * 0.45) {
                if (this.currentStation !== idx) {
                  this.currentStation = idx;
                  this.updateBridge();
                }
              }
            }
          });
        }, 60);
      }, { passive: true });
    },

    /* --------------------------------------------------------------------------
       3. NAVIGATION INTERCEPTOR (TRACKS APP.NAVIGATE PAGE SWITCHES)
       -------------------------------------------------------------------------- */
    bindNavigationInterceptor() {
      if (window.App && window.App.navigate) {
        const originalNavigate = window.App.navigate.bind(window.App);
        window.App.navigate = (page, eventOrPushState = true) => {
          originalNavigate(page, eventOrPushState);
          this.setPage(page);
        };
      }

      // Hash change watcher
      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        if (this.pageGraph[hash]) {
          this.setPage(hash);
        }
      });
    },

    setPage(page) {
      if (!this.pageGraph[page]) page = 'home';
      this.currentPage = page;
      this.updateBridge();
    },

    /* --------------------------------------------------------------------------
       4. UPDATE BRIDGE UI DISPLAY
       -------------------------------------------------------------------------- */
    updateBridge() {
      const prevTitle = document.getElementById('relPrevTitle');
      const nextTitle = document.getElementById('relNextTitle');
      const relationText = document.getElementById('relFlowRelationText');
      const stepCounter = document.getElementById('relStepCounter');

      if (!prevTitle || !nextTitle || !relationText || !stepCounter) return;

      if (this.currentPage === 'home') {
        const cur = this.stationGraph[this.currentStation];
        if (cur) {
          prevTitle.textContent = cur.prev.label;
          nextTitle.textContent = cur.next.label;
          relationText.innerHTML = cur.next.relation.replace('➔', '<em>&rarr;</em>');
          stepCounter.textContent = `STATION ${cur.station + 1} / ${this.stationGraph.length}`;
        }
      } else {
        const cur = this.pageGraph[this.currentPage];
        if (cur) {
          prevTitle.textContent = cur.prev.label;
          nextTitle.textContent = cur.next.label;
          relationText.innerHTML = cur.next.relation.replace('➔', '<em>&rarr;</em>');
          stepCounter.textContent = `PAGE ${cur.step} / ${cur.totalSteps}`;
        }
      }

      // Animate subtle text flash
      relationText.classList.remove('rel-text-pulse');
      void relationText.offsetWidth;
      relationText.classList.add('rel-text-pulse');
    },

    /* --------------------------------------------------------------------------
       5. GO PREVIOUS / GO NEXT ACTIONS
       -------------------------------------------------------------------------- */
    goPrev() {
      if (window.SoundEngine) {
        if (window.SoundEngine.playTransition) window.SoundEngine.playTransition();
        else window.SoundEngine.playClick();
      }

      if (this.currentPage === 'home') {
        const cur = this.stationGraph[this.currentStation];
        const prevStation = cur.prev.station;
        const targetEl = document.getElementById(this.stationGraph[prevStation].id);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          this.currentStation = prevStation;
          this.updateBridge();
        }
      } else {
        const cur = this.pageGraph[this.currentPage];
        if (cur && window.App) {
          window.App.navigate(cur.prev.page);
        }
      }
    },

    goNext() {
      if (window.SoundEngine) {
        if (window.SoundEngine.playConnect) window.SoundEngine.playConnect();
        else window.SoundEngine.playClick();
      }

      if (this.currentPage === 'home') {
        const cur = this.stationGraph[this.currentStation];
        const nextStation = cur.next.station;
        const targetEl = document.getElementById(this.stationGraph[nextStation].id);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          this.currentStation = nextStation;
          this.updateBridge();
        }
      } else {
        const cur = this.pageGraph[this.currentPage];
        if (cur && window.App) {
          window.App.navigate(cur.next.page);
        }
      }
    }
  };

  window.RelationalNavigator = RelationalNavigator;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RelationalNavigator.init());
  } else {
    RelationalNavigator.init();
  }

})(window, document);
