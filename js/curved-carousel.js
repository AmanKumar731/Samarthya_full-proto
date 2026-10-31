/**
 * CurvedBackgroundCarousel.js
 * Framer-inspired 3D Curved / Panoramic Cylinder Card Carousel
 * 100% Autonomous, Constant-Speed CSS Animation — Completely Decoupled from Mouse Cursor
 */

(function (window) {
  'use strict';

  var DEFAULT_CARDS = [
    {
      id: 'adip-grant',
      indexTag: '#01 // ADIP GRANT',
      title: 'Assistive Tech Aid',
      subtitle: 'Smart Canes, Cochlear Implants & Tricycles',
      badge: '100% Subsidy',
      stat: '₹50,000',
      statLabel: 'Direct Aid',
      icon: '🦽',
      wireframe: 'waveform'
    },
    {
      id: 'nsfdc-credit',
      indexTag: '#02 // NSFDC 6.5%',
      title: 'Concessional Credit',
      subtitle: 'Collateral-Free Term Capital for SC/PwD',
      badge: 'Statutory Rate',
      stat: '6.5%',
      statLabel: 'Annual APR',
      icon: '🏦',
      wireframe: 'chart'
    },
    {
      id: 'post-matric',
      indexTag: '#03 // POST-MATRIC',
      title: 'Higher Education Grant',
      subtitle: 'Full Tuition Fee + Tech Device Allowance',
      badge: 'Auto-Sanction',
      stat: '₹1.25L',
      statLabel: 'Annual Pool',
      icon: '🎓',
      wireframe: 'radar'
    },
    {
      id: 'udid-instant',
      indexTag: '#04 // UDID INSTANT',
      title: 'Zero-Doc Disability ID',
      subtitle: 'Swavlamban Core API Instant Verification',
      badge: 'Zero Docs',
      stat: 'Instant',
      statLabel: 'API Check',
      icon: '🪪',
      wireframe: 'matrix'
    },
    {
      id: 'wispr-voice',
      indexTag: '#05 // WISPR VOICE',
      title: 'Multilingual Neural Flow',
      subtitle: '12 Indic Languages Hands-Free Intake',
      badge: 'Voice First',
      stat: '< 1.5s',
      statLabel: 'Latency',
      icon: '🎙️',
      wireframe: 'waveform'
    },
    {
      id: 'dpdp-vault',
      indexTag: '#06 // DPDP VAULT',
      title: 'Privacy Cryptographic Vault',
      subtitle: 'Zero-Knowledge Proof Local Verification',
      badge: '100% Private',
      stat: '0 Byte',
      statLabel: 'Server PII',
      icon: '🔒',
      wireframe: 'matrix'
    },
    {
      id: 'nhfdc-trust',
      indexTag: '#07 // NHFDC TRUST',
      title: 'Divyangjan Micro-Capital',
      subtitle: 'Self-Reliance Startup Fund & Mentorship',
      badge: 'Micro-Credit',
      stat: '₹50.0L',
      statLabel: 'Cap Limit',
      icon: '💼',
      wireframe: 'chart'
    },
    {
      id: 'scholarship-top',
      indexTag: '#08 // SCHOLARSHIP+',
      title: 'Tier-1 Top-Class Matrix',
      subtitle: 'Full Ride across IITs, IIMs, NITs & AIIMS',
      badge: 'National Pool',
      stat: '100%',
      statLabel: 'Fee Covered',
      icon: '🏛️',
      wireframe: 'radar'
    },
    {
      id: 'alimco-matrix',
      indexTag: '#09 // ALIMCO MATRIX',
      title: 'Robotic Prosthetics',
      subtitle: 'Bionic Limbs & Smart Sensor Fitting Camps',
      badge: 'Camp Live',
      stat: 'GPS Live',
      statLabel: 'District Camp',
      icon: '🦾',
      wireframe: 'waveform'
    },
    {
      id: 'statutory-ai',
      indexTag: '#10 // STATUTORY AI',
      title: 'SIH26093 Rule Engine',
      subtitle: 'Deterministic Gazette Act Validation',
      badge: 'Statutory SLA',
      stat: '< 2.0s',
      statLabel: 'Rule Match',
      icon: '⚡',
      wireframe: 'matrix'
    },
    {
      id: 'dbt-express',
      indexTag: '#11 // DBT EXPRESS',
      title: 'Direct Benefit Transfer',
      subtitle: 'Aadhaar Bridge Direct PFMS Payouts',
      badge: 'PFMS Active',
      stat: 'Direct',
      statLabel: 'Bank Credit',
      icon: '💳',
      wireframe: 'chart'
    },
    {
      id: 'grievance-bot',
      indexTag: '#12 // ESCALATION BOT',
      title: 'District Grievance SLA',
      subtitle: 'Automated 48h Magistrate Auto-Escalation',
      badge: '24/7 AI Bot',
      stat: '48h SLA',
      statLabel: 'Strict SLA',
      icon: '🚨',
      wireframe: 'radar'
    }
  ];

  function CurvedBackgroundCarousel(container, options) {
    if (!container) return;
    this.container = container;
    this.opts = Object.assign({
      cards: DEFAULT_CARDS,
      radius: 720,
      cardWidth: 250,
      cardHeight: 330,
      perspective: 1400,
      duration: 45 // Pure CSS animation duration in seconds
    }, options || {});

    this.init();
  }

  CurvedBackgroundCarousel.prototype.init = function () {
    // Clear container
    this.container.innerHTML = '';
    this.buildDOM();
    // No mouse, drag, or wheel listeners are attached.
    // The cylinder rotates purely via GPU-accelerated CSS @keyframes revolveCylinder
  };

  CurvedBackgroundCarousel.prototype.buildDOM = function () {
    var self = this;
    var cards = this.opts.cards;
    var total = cards.length;
    var angleStep = 360 / total;

    // Outer stage (pointer-events: none, z-index: 1)
    this.stage = document.createElement('div');
    this.stage.className = 'curved-carousel-stage';
    this.stage.style.perspective = this.opts.perspective + 'px';
    this.stage.setAttribute('aria-hidden', 'true');

    // 3D Cylinder Ring with constant CSS keyframe rotation
    this.cylinder = document.createElement('div');
    this.cylinder.className = 'curved-carousel-cylinder';
    this.cylinder.style.animationDuration = this.opts.duration + 's';

    cards.forEach(function (card, index) {
      var angle = index * angleStep;
      var cardWrap = document.createElement('div');
      cardWrap.className = 'carousel-card-wrap';
      cardWrap.style.width = self.opts.cardWidth + 'px';
      cardWrap.style.height = self.opts.cardHeight + 'px';
      cardWrap.style.marginLeft = -(self.opts.cardWidth / 2) + 'px';
      cardWrap.style.marginTop = -(self.opts.cardHeight / 2) + 'px';

      // Position evenly around 360° ring: rotateY(angle) translateZ(720px)
      cardWrap.style.transform = 'rotateY(' + angle + 'deg) translateZ(' + self.opts.radius + 'px)';

      // 1. Front Face (Facing Outward)
      var cardFront = document.createElement('div');
      cardFront.className = 'carousel-3d-card card-face-front';
      cardFront.innerHTML = self.getCardInnerHTML(card);
      cardWrap.appendChild(cardFront);

      // 2. Back Face (Facing Inward at Center-Depth, Upright & Non-Mirrored)
      var cardBack = document.createElement('div');
      cardBack.className = 'carousel-3d-card card-face-back';
      cardBack.innerHTML = self.getCardInnerHTML(card);
      cardWrap.appendChild(cardBack);

      // 3. Minimalist Monospace Index Underneath in 3D Space (Front)
      var tagFront = document.createElement('div');
      tagFront.className = 'carousel-card-tag tag-face-front';
      tagFront.textContent = card.indexTag;
      cardWrap.appendChild(tagFront);

      // 4. Minimalist Monospace Index Underneath in 3D Space (Back)
      var tagBack = document.createElement('div');
      tagBack.className = 'carousel-card-tag tag-face-back';
      tagBack.textContent = card.indexTag;
      cardWrap.appendChild(tagBack);

      self.cylinder.appendChild(cardWrap);
    });

    this.stage.appendChild(this.cylinder);

    // Subtle Radial Vignette & Center Depth Mask
    this.depthMask = document.createElement('div');
    this.depthMask.className = 'carousel-depth-mask';
    this.stage.appendChild(this.depthMask);

    this.container.appendChild(this.stage);
  };

  CurvedBackgroundCarousel.prototype.getCardInnerHTML = function (card) {
    return [
      '<div class="carousel-card-scanlines"></div>',
      '<div class="carousel-card-header">',
      '  <div class="carousel-card-icon-tag">',
      '    <span class="carousel-card-icon">' + card.icon + '</span>',
      '    <span class="carousel-card-badge">' + card.badge + '</span>',
      '  </div>',
      '  <div class="carousel-card-pulse-dot"></div>',
      '</div>',
      '<div class="carousel-card-visual">',
      this.getVisualHTML(card),
      '</div>',
      '<div class="carousel-card-footer">',
      '  <h3 class="carousel-card-title">' + card.title + '</h3>',
      '  <p class="carousel-card-sub">' + card.subtitle + '</p>',
      '  <div class="carousel-card-stat-strip">',
      '    <span class="carousel-card-stat-label">' + card.statLabel + '</span>',
      '    <span class="carousel-card-stat-val">' + card.stat + '</span>',
      '  </div>',
      '</div>'
    ].join('');
  };

  CurvedBackgroundCarousel.prototype.getVisualHTML = function (card) {
    switch (card.wireframe) {
      case 'chart':
        return [
          '<div class="visual-chart">',
          '  <div class="chart-col" style="height: 38%;"></div>',
          '  <div class="chart-col" style="height: 58%;"></div>',
          '  <div class="chart-col" style="height: 48%;"></div>',
          '  <div class="chart-col" style="height: 74%;"></div>',
          '  <div class="chart-col active" style="height: 94%;"></div>',
          '  <div class="chart-col" style="height: 64%;"></div>',
          '</div>'
        ].join('');

      case 'matrix':
        return [
          '<div class="visual-matrix">',
          '  <div class="matrix-header">',
          '    <span>UDID: 8829-X01</span>',
          '    <span style="display:inline-block;width:6px;height:6px;background:#c084fc;border-radius:50%;box-shadow:0 0 6px #c084fc;"></span>',
          '  </div>',
          '  <div class="matrix-grid">',
          '    <div class="matrix-chip">ACT 2016</div>',
          '    <div class="matrix-chip">SEC 24-A</div>',
          '    <div class="matrix-chip">99% MATCH</div>',
          '  </div>',
          '  <div class="matrix-progress-track">',
          '    <div class="matrix-progress-fill"></div>',
          '  </div>',
          '</div>'
        ].join('');

      case 'waveform':
        var bars = [35, 70, 95, 55, 85, 100, 65, 90, 50, 80, 60, 30];
        var barsHtml = bars.map(function (h) {
          return '<div class="wave-bar" style="height:' + h + '%;"></div>';
        }).join('');
        return '<div class="visual-waveform">' + barsHtml + '</div>';

      case 'radar':
      default:
        return [
          '<div class="visual-radar">',
          '  <div class="radar-ring">',
          '    <div class="radar-sweep"></div>',
          '    <span class="radar-icon">' + card.icon + '</span>',
          '  </div>',
          '  <div class="radar-stats">',
          '    <span class="radar-label">STATUS</span>',
          '    <span class="radar-val">' + card.badge + '</span>',
          '    <span class="radar-sub">SIH-26093</span>',
          '  </div>',
          '</div>'
        ].join('');
    }
  };

  CurvedBackgroundCarousel.prototype.destroy = function () {
    if (this.stage && this.stage.parentNode) {
      this.stage.parentNode.removeChild(this.stage);
    }
  };

  window.CurvedBackgroundCarousel = CurvedBackgroundCarousel;

})(window);
