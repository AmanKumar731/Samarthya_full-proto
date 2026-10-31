// ============================================
// Samarthya — WhatsApp Lead Capture & Scheme Updates Modal
// Triggered seamlessly when user matches schemes
// ============================================

const WhatsAppLead = {
  hasPromptedThisSession: false,
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029Vb90zigATRShQNhLtm2j',

  init() {
    // Check if user already joined
    const saved = localStorage.getItem('samarthya_wa_joined');
    if (saved) {
      this.hasPromptedThisSession = true;
    }
  },

  triggerPostMatchModal(schemesCount = 8) {
    if (this.hasPromptedThisSession) return;
    this.hasPromptedThisSession = true;

    setTimeout(() => {
      this.openModal(schemesCount);
    }, 1200);
  },

  openModal(schemesCount = 8) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    if (!overlay || !content) return;

    content.innerHTML = `
      <div class="wa-lead-card animate-in">
        <button class="wa-lead-close" onclick="App.closeModal()">✕</button>

        <div class="wa-lead-badge">
          <span class="wa-pulse-dot"></span>
          <span>Official WhatsApp Channel</span>
        </div>

        <div class="wa-lead-icon-ring">
          <div class="wa-icon-glow"></div>
          <div class="wa-logo-icon">💬</div>
        </div>

        <h3 class="wa-lead-title">
          Join Official <span class="gradient-text">WhatsApp Channel</span>
        </h3>

        <p class="wa-lead-subtitle">
          Government ke latest updated schemes, scholarship deadline extensions aur free assistive aid camps ka direct WhatsApp channel updates paane ke liye abhi join karein.
        </p>

        <div style="margin:24px 0">
          <a href="${this.whatsappChannelUrl}" target="_blank" rel="noopener" onclick="WhatsAppLead.handleJoinClick()" class="btn btn-wa-submit" style="text-decoration:none;display:inline-flex;width:100%;justify-content:center">
            <span style="font-size:20px">💬</span>
            <span>Join Official WhatsApp Channel</span>
            <span style="font-size:18px">→</span>
          </a>
        </div>

        <div class="wa-lead-perks">
          <div class="wa-perk-item">
            <span class="wa-perk-icon">⚡</span>
            <span>Instant NSP deadline alerts</span>
          </div>
          <div class="wa-perk-item">
            <span class="wa-perk-icon">🛡️</span>
            <span>100% Free &amp; Zero Spam</span>
          </div>
          <div class="wa-perk-item">
            <span class="wa-perk-icon">🦽</span>
            <span>District ALIMCO camp updates</span>
          </div>
        </div>

        <div class="wa-lead-footer">
          <button class="wa-skip-btn" onclick="App.closeModal()">I will check manually later</button>
        </div>
      </div>
    `;

    overlay.classList.add('active');
  },

  handleJoinClick() {
    localStorage.setItem('samarthya_wa_joined', 'true');
    setTimeout(() => {
      App.closeModal();
    }, 1200);
  }
};

window.WhatsAppLead = WhatsAppLead;
