// ============================================
// Samarthya — Application Tracker & Deadline Alerts
// Feature 5: Lifecycle Stepper, Reminders & Benefit Calculator
// ============================================

const ApplicationTracker = {
  trackedApplications: [],

  init() {
    this.loadFromStorage();
  },

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('samarthya_tracked_apps');
      if (stored) {
        this.trackedApplications = JSON.parse(stored);
      } else {
        // Default to empty array so user experiences the redesigned illustrated empty state
        this.trackedApplications = [];
        this.saveToStorage();
      }
    } catch (e) {
      console.warn('Storage error:', e);
      this.trackedApplications = [];
    }
  },

  saveToStorage() {
    try {
      localStorage.setItem('samarthya_tracked_apps', JSON.stringify(this.trackedApplications));
    } catch (e) {}
  },

  trackScheme(schemeId) {
    const scheme = SCHEME_DATABASE.find(s => s.id === schemeId);
    if (!scheme) return;

    // Check if already tracked
    const existing = this.trackedApplications.find(a => a.schemeId === schemeId);
    if (existing) {
      alert(`"${scheme.name}" is already in your Application Tracker!`);
      App.navigate('dashboard');
      return;
    }

    const newApp = {
      id: 'app_' + Date.now(),
      type: 'welfare',
      schemeId: scheme.id,
      schemeName: scheme.name,
      ministry: scheme.ministry,
      appliedDate: new Date().toISOString().split('T')[0],
      deadline: scheme.deadline || '2026-05-30',
      status: 'applied',
      benefitAmount: scheme.benefits ? scheme.benefits.amount : 'Financial Grant',
      refNo: 'SAM-' + Math.floor(100000 + Math.random() * 900000)
    };

    this.trackedApplications.unshift(newApp);
    this.saveToStorage();
    this.renderTracker();

    alert(`✓ Added "${scheme.name}" to your Application Tracker!`);
    App.navigate('dashboard');
  },

  trackCreditScheme(schemeId, amount, emi, assignedPartner = null) {
    const scheme = (window.CREDIT_SCHEME_DATABASE || []).find(s => s.id === schemeId);
    if (!scheme) return;

    const existing = this.trackedApplications.find(a => a.schemeId === schemeId);
    if (existing) {
      alert(`"${scheme.name}" is already in your Credit Tracker!`);
      App.navigate('dashboard');
      return;
    }

    const partnerName = assignedPartner ? assignedPartner.name : 'Channel Partner (SCA / Lead PSB)';

    const newApp = {
      id: 'credit_app_' + Date.now(),
      type: 'credit',
      schemeId: scheme.id,
      schemeName: scheme.name,
      ministry: 'NSFDC / ' + partnerName,
      appliedDate: new Date().toISOString().split('T')[0],
      deadline: 'Rolling Window 2026',
      status: 'submitted_to_partner',
      loanAmount: amount ? `₹${Number(amount).toLocaleString('en-IN')}` : scheme.maxAmountDisplay,
      emi: emi ? `₹${Number(emi).toLocaleString('en-IN')}/mo` : '₹3,088/mo',
      benefitAmount: `Loan: ${amount ? '₹' + Number(amount).toLocaleString('en-IN') : scheme.maxAmountDisplay} (EMI: ${emi ? '₹' + Number(emi).toLocaleString('en-IN') : '₹3,088'}/mo)`,
      refNo: 'NSFDC-' + Math.floor(100000 + Math.random() * 900000),
      partner: partnerName
    };

    this.trackedApplications.unshift(newApp);
    this.saveToStorage();
    this.renderTracker();

    alert(`✓ Added "${scheme.name}" (${newApp.loanAmount}) to your Credit Application Tracker!`);
    App.navigate('dashboard');
  },

  updateStatus(appId, newStatus) {
    const app = this.trackedApplications.find(a => a.id === appId);
    if (app) {
      app.status = newStatus;
      this.saveToStorage();
      this.renderTracker();
    }
  },

  removeApplication(appId) {
    if (confirm('Are you sure you want to remove this tracked application?')) {
      this.trackedApplications = this.trackedApplications.filter(a => a.id !== appId);
      this.saveToStorage();
      this.renderTracker();
    }
  },

  renderTracker() {
    const dashContent = document.getElementById('dashboardContent');
    if (!dashContent) return;

    if (!this.trackedApplications || this.trackedApplications.length === 0) {
      dashContent.innerHTML = this.getEmptyStateHTML();
      return;
    }

    const totalApps = this.trackedApplications.length;
    const creditCount = this.trackedApplications.filter(a => a.type === 'credit').length;
    const welfareCount = this.trackedApplications.filter(a => a.type !== 'credit').length;
    const approvedCount = this.trackedApplications.filter(a => a.status === 'disbursed' || a.status === 'sanctioned').length;

    dashContent.innerHTML = `
      <div class="dash-active-wrapper">
        <div class="dash-stats-grid">
          <div class="dash-stat-card">
            <div class="dash-stat-icon">📋</div>
            <div class="dash-stat-number blue">${totalApps}</div>
            <div class="dash-stat-label">Total Applications Tracked</div>
          </div>
          <div class="dash-stat-card">
            <div class="dash-stat-icon">⏳</div>
            <div class="dash-stat-number">${totalApps - approvedCount}</div>
            <div class="dash-stat-label">In Active Processing</div>
          </div>
          <div class="dash-stat-card">
            <div class="dash-stat-icon">💼</div>
            <div class="dash-stat-number purple">${creditCount} <span style="font-size:15px;color:#71809F">Credit</span> / ${welfareCount} <span style="font-size:15px;color:#71809F">Welfare</span></div>
            <div class="dash-stat-label">Channel Track Split</div>
          </div>
          <div class="dash-stat-card">
            <div class="dash-stat-icon">🎉</div>
            <div class="dash-stat-number mint">${approvedCount}</div>
            <div class="dash-stat-label">Sanctioned / Disbursed</div>
          </div>
        </div>

        <div class="dash-tracker-header">
          <div>
            <h3 class="dash-tracker-title">📂 My Applications Tracker</h3>
            <p class="dash-tracker-subtitle">Live 5-stage DBT / Channel Credit statutory verification pipeline</p>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <button class="dash-add-more-btn" onclick="App.navigate('match', event)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span>+ Find More Schemes</span>
            </button>
            <button class="dash-action-btn-secondary" onclick="ApplicationTracker.clearAll()" style="font-size:12px;padding:6px 14px">
              View Empty State
            </button>
          </div>
        </div>

        <div id="trackerApplicationsList" class="dash-tracker-list">
          ${this.renderApplicationCards()}
        </div>
      </div>
    `;
  },

  getEmptyStateHTML() {
    return `
      <div class="dash-empty-container">
        <div class="dash-illustration-wrap">
          <svg class="dash-vector-svg" viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Analytics Dashboard Illustration">
            <defs>
              <radialGradient id="dashBgDiscDyn" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#E8F1FF" stop-opacity="0.9" />
                <stop offset="65%" stop-color="#EFF6FF" stop-opacity="0.6" />
                <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
              </radialGradient>
              <linearGradient id="dashBar1Dyn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#3B82F6" />
                <stop offset="100%" stop-color="#155EEF" />
              </linearGradient>
              <linearGradient id="dashBar2Dyn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10B981" />
                <stop offset="100%" stop-color="#059669" />
              </linearGradient>
              <linearGradient id="dashBar3Dyn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#245BFF" />
                <stop offset="100%" stop-color="#0E46D7" />
              </linearGradient>
              <linearGradient id="glassRimDyn" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#245BFF" />
                <stop offset="50%" stop-color="#60A5FA" />
                <stop offset="100%" stop-color="#155EEF" />
              </linearGradient>
              <filter id="docShadowDyn" x="20" y="10" width="160" height="150" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#155EEF" flood-opacity="0.09" />
              </filter>
              <filter id="glassShadowDyn" x="110" y="70" width="100" height="100" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#155EEF" flood-opacity="0.18" />
              </filter>
            </defs>

            <circle cx="110" cy="85" r="76" fill="url(#dashBgDiscDyn)" />
            <ellipse cx="110" cy="144" rx="72" ry="8" fill="#155EEF" fill-opacity="0.06" />

            <g filter="url(#docShadowDyn)">
              <rect x="42" y="22" width="120" height="114" rx="14" fill="#FFFFFF" stroke="#CFE0FF" stroke-width="1.5" />
              <rect x="56" y="34" width="44" height="6" rx="3" fill="#E0ECFF" />
              <circle cx="146" cy="37" r="3" fill="#D7E6FF" />

              <line x1="56" y1="48" x2="148" y2="48" stroke="#F1F5FF" stroke-width="1.5" stroke-linecap="round" />
              <line x1="56" y1="62" x2="148" y2="62" stroke="#F1F5FF" stroke-width="1.5" stroke-linecap="round" />
              <line x1="56" y1="76" x2="148" y2="76" stroke="#F1F5FF" stroke-width="1.5" stroke-linecap="round" />
              <line x1="56" y1="90" x2="148" y2="90" stroke="#F1F5FF" stroke-width="1.5" stroke-linecap="round" />
              <line x1="56" y1="104" x2="148" y2="104" stroke="#F1F5FF" stroke-width="1.5" stroke-linecap="round" />

              <line x1="56" y1="116" x2="134" y2="116" stroke="#E1EDFF" stroke-width="2" stroke-linecap="round" />

              <rect x="65" y="74" width="16" height="42" rx="4" fill="url(#dashBar1Dyn)" />
              <rect x="88" y="52" width="16" height="64" rx="4" fill="url(#dashBar2Dyn)" />
              <rect x="111" y="64" width="16" height="52" rx="4" fill="url(#dashBar3Dyn)" />
            </g>

            <g filter="url(#glassShadowDyn)">
              <line x1="162" y1="126" x2="186" y2="150" stroke="#101A3A" stroke-width="6.5" stroke-linecap="round" />
              <line x1="164" y1="128" x2="184" y2="148" stroke="#245BFF" stroke-width="2.5" stroke-linecap="round" />
              
              <circle cx="145" cy="109" r="23" fill="#FFFFFF" fill-opacity="0.88" stroke="url(#glassRimDyn)" stroke-width="3.5" />
              
              <path d="M 132 101 A 15 15 0 0 1 151 93" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.9" />
              
              <rect x="140" y="103" width="5" height="11" rx="2" fill="#245BFF" opacity="0.9" />
              <rect x="147" y="107" width="5" height="7" rx="2" fill="#10B981" opacity="0.8" />
            </g>

            <path d="M 182 38 Q 182 46 190 46 Q 182 46 182 54 Q 182 46 174 46 Q 182 46 182 38 Z" fill="#245BFF" opacity="0.85" />
            <circle cx="38" cy="78" r="3" fill="#3B82F6" opacity="0.6" />
            <circle cx="180" cy="88" r="2.5" fill="#10B981" opacity="0.7" />
          </svg>
        </div>

        <h3 class="dash-empty-title" data-i18n="dashEmptyTitle">No Application Tracked Yet</h3>
        <p class="dash-empty-description" data-i18n="dashEmptyDesc">Complete the scheme search to see matched entitlements and track applications.</p>
        
        <button class="dash-cta-btn" onclick="App.navigate('match', event)" aria-label="Find Schemes Now">
          <span class="dash-cta-icon-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <span data-i18n="dashFindBtn">Find Schemes Now</span>
          <span class="dash-cta-arrow">→</span>
        </button>

        <div style="margin-top:20px">
          <button onclick="ApplicationTracker.loadSampleApplications()" style="background:none;border:none;color:#71809F;font-size:12.5px;cursor:pointer;text-decoration:underline;">
            (Demo: Preview Active Applications State)
          </button>
        </div>
      </div>
    `;
  },

  renderApplicationCards() {
    const welfareStages = [
      { key: 'draft', label: '1. Draft' },
      { key: 'applied', label: '2. Applied' },
      { key: 'verification', label: '3. Doc Verification' },
      { key: 'review', label: '4. State Review' },
      { key: 'disbursed', label: '5. Approved & DBT' }
    ];

    const creditStages = [
      { key: 'draft', label: '1. Proposal Draft' },
      { key: 'submitted_to_partner', label: '2. Partner Inward' },
      { key: 'field_appraisal', label: '3. Field Appraisal' },
      { key: 'sanctioned', label: '4. Sanction Letter' },
      { key: 'disbursed', label: '5. Loan Disbursed' }
    ];

    return this.trackedApplications.map(app => {
      const isCredit = app.type === 'credit';
      const stages = isCredit ? creditStages : welfareStages;
      const currentStageIndex = Math.max(0, stages.findIndex(s => s.key === app.status));

      const stepperHtml = stages.map((s, idx) => {
        let nodeClass = 'dash-step-node';
        if (idx < currentStageIndex) nodeClass += ' done';
        else if (idx === currentStageIndex) nodeClass += ' current';

        return `
          <div class="${nodeClass}" onclick="ApplicationTracker.updateStatus('${app.id}', '${s.key}')" title="Click to update status to ${s.label}">
            <div class="dash-step-dot">${idx < currentStageIndex ? '✓' : idx + 1}</div>
            <div class="dash-step-text">${s.label}</div>
          </div>
        `;
      }).join('');

      const trackBadge = isCredit
        ? `<span class="dash-badge-credit">💼 NSFDC Credit</span>`
        : `<span class="dash-badge-welfare">♿ Welfare</span>`;

      const safeName = (app.schemeName || '').replace(/'/g, "\\'");

      return `
        <div class="dash-card-item">
          <div class="dash-card-top-row">
            <div>
              <div class="dash-card-badges">
                ${trackBadge}
                <span class="dash-badge-ref">Ref: ${app.refNo}</span>
              </div>
              <h3 class="dash-card-title">${app.schemeName}</h3>
              <p class="dash-card-ministry">${app.ministry}</p>
            </div>
            <div>
              <div class="dash-card-benefit">${app.benefitAmount}</div>
              <div class="dash-card-deadline">${isCredit ? 'Processing: Partner Window' : 'Deadline: ' + app.deadline}</div>
            </div>
          </div>

          <!-- Stepper -->
          <div class="dash-stepper-track">${stepperHtml}</div>

          <!-- Bottom Action Row -->
          <div class="dash-card-bottom-row">
            <div class="dash-card-applied-date">
              Applied on: <strong>${app.appliedDate}</strong>
            </div>
            <div class="dash-action-group">
              <button class="dash-action-btn-secondary" onclick="ApplicationTracker.openReminderModal('${safeName}', '${app.deadline}')">
                🔔 Set Alert
              </button>
              <button class="dash-action-btn-secondary" onclick="ApplicationTracker.downloadCalendar('${safeName}', '${app.deadline}')">
                📅 Add to Calendar
              </button>
              <button class="dash-action-btn-remove" onclick="ApplicationTracker.removeApplication('${app.id}')" title="Remove Application">
                ✕
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  loadSampleApplications() {
    this.trackedApplications = [
      {
        id: 'app_1',
        type: 'welfare',
        schemeId: 'post_matric_pwd',
        schemeName: 'Post-Matric Scholarship for Students with Disabilities',
        ministry: 'Department of Empowerment of Persons with Disabilities',
        appliedDate: '2026-02-10',
        deadline: '2026-03-31',
        status: 'verification',
        benefitAmount: '₹48,000 / year',
        refNo: 'NSP-2026-PWD-849201'
      },
      {
        id: 'app_2',
        type: 'credit',
        schemeId: 'adip_scheme',
        schemeName: 'ADIP Scheme (Free Assistive Devices)',
        ministry: 'Ministry of Social Justice and Empowerment',
        appliedDate: '2026-01-20',
        deadline: '2026-04-15',
        status: 'review',
        benefitAmount: 'Motorized Tricycle / Braille Kit',
        refNo: 'ALIMCO-CAMP-2026-5531'
      }
    ];
    this.saveToStorage();
    this.renderTracker();
  },

  clearAll() {
    if (confirm('Clear all tracked applications to view the empty state?')) {
      this.trackedApplications = [];
      this.saveToStorage();
      this.renderTracker();
    }
  },

  openReminderModal(schemeName, deadline) {
    App.openModal(`
      <div style="padding:10px">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:24px">🔔</span>
            <div>
              <h3 style="font-size:18px;font-weight:700;color:#fff;margin:0">Set Application Deadline Alert</h3>
              <p style="font-size:12px;color:#94a3b8;margin:0">Receive SMS & Email notifications before scheme closes</p>
            </div>
          </div>
          <button class="modal-close" onclick="App.closeModal()">✕</button>
        </div>

        <div style="margin:16px 0">
          <div style="font-size:13px;color:#fff;margin-bottom:12px">
            Scheme: <strong>${schemeName}</strong><br>
            Closing Date: <strong style="color:#f87171">${deadline}</strong>
          </div>

          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Mobile Number for SMS Reminders</label>
            <input type="tel" class="form-input" id="alertPhone" placeholder="+91 98765 43210" value="+91 9876543210">
          </div>

          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Email Address for Notifications</label>
            <input type="email" class="form-input" id="alertEmail" placeholder="student@example.com" value="student@sanjeevanigrid.in">
          </div>

          <div class="form-group">
            <label class="form-label">Alert Frequency</label>
            <select class="form-select" id="alertFreq">
              <option value="7">7 Days Before Deadline</option>
              <option value="15">15 Days Before Deadline</option>
              <option value="30">30 Days Before Deadline</option>
            </select>
          </div>
        </div>

        <button class="btn btn-primary" onclick="ApplicationTracker.confirmReminder('${schemeName}')" style="width:100%;justify-content:center">
          ✓ Schedule Automated Alerts
        </button>
      </div>
    `);
  },

  confirmReminder(schemeName) {
    App.closeModal();
    alert(`✓ Reminder Scheduled! You will receive SMS & Email alerts for "${schemeName}".`);
  },

  downloadCalendar(schemeName, deadline) {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sanjeevani Grid Portal//Govt Scheme Deadlines//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Deadline: ${schemeName}`,
      `DESCRIPTION:Sanjeevani Grid Welfare Portal Application Deadline for ${schemeName}. Apply at NSP / Govt Portal.`,
      `DTSTART:${deadline.replace(/-/g, '')}T090000Z`,
      `DTEND:${deadline.replace(/-/g, '')}T180000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${schemeName.slice(0, 20)}_deadline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
