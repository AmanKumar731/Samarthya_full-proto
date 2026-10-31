// ============================================
// Samarthya — Accessibility Suite
// Feature 1: Voice Filling, TTS, High Contrast, Dyslexia Font, ISL Assistant
// ============================================

const AccessibilitySuite = {
  isListening: false,
  recognition: null,
  isHighContrast: false,
  isDyslexiaFont: false,
  fontSizeLevel: 0, // 0: Normal, 1: Large, 2: XL
  isReducedMotion: false,
  isTTSPlaying: false,

  init() {
    this.setupSpeechRecognition();
    this.setupFloatingToolbar();
  },

  togglePanel() {
    const panel = document.getElementById('a11yPanel');
    if (panel) panel.classList.toggle('open');
  },

  closePanel() {
    const panel = document.getElementById('a11yPanel');
    if (panel) panel.classList.remove('open');
  },

  // ============ 1. HIGH CONTRAST MODE ============
  toggleHighContrast() {
    this.isHighContrast = !this.isHighContrast;
    document.body.classList.toggle('high-contrast', this.isHighContrast);
    const btn = document.getElementById('a11yBtnContrast');
    if (btn) btn.classList.toggle('active', this.isHighContrast);
    this.announce(`High contrast mode ${this.isHighContrast ? 'activated' : 'deactivated'}`);
  },

  // ============ 2. DYSLEXIA FONT ============
  toggleDyslexiaFont() {
    this.isDyslexiaFont = !this.isDyslexiaFont;
    document.body.classList.toggle('dyslexia-font', this.isDyslexiaFont);
    const btn = document.getElementById('a11yBtnDyslexia');
    if (btn) btn.classList.toggle('active', this.isDyslexiaFont);
    this.announce(`Dyslexia friendly typography ${this.isDyslexiaFont ? 'enabled' : 'disabled'}`);
  },

  // ============ 3. FONT RESIZER ============
  setFontSize(level) {
    this.fontSizeLevel = level;
    document.body.classList.remove('font-size-lg', 'font-size-xl');
    if (level === 1) document.body.classList.add('font-size-lg');
    if (level === 2) document.body.classList.add('font-size-xl');

    document.querySelectorAll('.font-size-btn').forEach((b, idx) => {
      b.classList.toggle('active', idx === level);
    });
    this.announce(`Font size adjusted to ${level === 0 ? 'standard' : level === 1 ? 'large' : 'extra large'}`);
  },

  // ============ 4. REDUCED MOTION ============
  toggleReducedMotion() {
    this.isReducedMotion = !this.isReducedMotion;
    document.body.classList.toggle('reduce-motion', this.isReducedMotion);
    const btn = document.getElementById('a11yBtnMotion');
    if (btn) btn.classList.toggle('active', this.isReducedMotion);
    this.announce(`Reduced motion mode ${this.isReducedMotion ? 'enabled' : 'disabled'}`);
  },

  // ============ 5. VOICE-BASED FORM FILLING (Web Speech API) ============
  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = I18N.currentLang === 'hi' ? 'hi-IN' : 'en-IN';

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        this.processVoiceCommand(transcript);
        this.stopVoice();
      };

      this.recognition.onerror = (e) => {
        console.warn('Voice input error:', e);
        this.stopVoice();
      };

      this.recognition.onend = () => {
        this.stopVoice();
      };
    }
  },

  toggleVoiceInput() {
    if (this.isListening) {
      this.stopVoice();
    } else {
      this.startVoice();
    }
  },

  startVoice() {
    if (this.recognition) {
      try {
        this.recognition.lang = I18N.currentLang === 'hi' ? 'hi-IN' : 'en-IN';
        this.recognition.start();
        this.isListening = true;
        this.updateVoiceUI(true);
        this.speak(I18N.currentLang === 'hi' ? 'बोलिए, मैं सुन रहा हूँ...' : 'Listening, please speak your details...');
      } catch (err) {
        console.warn(err);
        this.simulateVoicePrompt();
      }
    } else {
      this.simulateVoicePrompt();
    }
  },

  stopVoice() {
    this.isListening = false;
    this.updateVoiceUI(false);
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
  },

  updateVoiceUI(listening) {
    const btn = document.getElementById('voiceFillBtn');
    if (btn) {
      btn.classList.toggle('listening', listening);
      btn.innerHTML = listening
        ? '<span>🔴 Listening... Speak now</span>'
        : '<span>🎙️ Voice Form Filling</span>';
    }
  },

  simulateVoicePrompt() {
    const promptText = prompt(
      I18N.currentLang === 'hi'
        ? 'वॉयस इनपुट सिमुलेशन: अपना नाम, राज्य, या दिव्यांगता प्रकार टाइप करें (उदा: "नाम राहुल", "उत्तर प्रदेश", "लोकोमोटर"):'
        : 'Voice Input Simulation: Enter phrase (e.g. "Name Rahul", "State Maharashtra", "Locomotor 50%", "Income 150000"):'
    );
    if (promptText) {
      this.processVoiceCommand(promptText.toLowerCase());
    }
  },

  processVoiceCommand(text) {
    this.announce(`Heard: ${text}`);

    // Check for Name
    if (text.includes('name') || text.includes('naam') || text.includes('mera naam')) {
      const parts = text.split(/name|naam|mera naam/);
      if (parts[1]) {
        const nameVal = parts[1].trim().replace(/is|hai|hu/g, '').trim();
        const inputName = document.getElementById('inputName');
        if (inputName) inputName.value = nameVal.charAt(0).toUpperCase() + nameVal.slice(1);
      }
    }

    // Check for State
    INDIAN_STATES.forEach(s => {
      if (text.includes(s.id.toLowerCase()) || text.includes(s.label.toLowerCase())) {
        const stateSelect = document.getElementById('inputState');
        if (stateSelect) stateSelect.value = s.id;
      }
    });

    // Check for Gender
    if (text.includes('female') || text.includes('mahila') || text.includes('aurat') || text.includes('girl')) {
      const g = document.getElementById('inputGender');
      if (g) g.value = 'female';
    } else if (text.includes('male') || text.includes('purush') || text.includes('boy')) {
      const g = document.getElementById('inputGender');
      if (g) g.value = 'male';
    }

    // Check for Disability
    DISABILITY_TYPES.forEach(d => {
      if (text.includes(d.id.toLowerCase()) || text.includes(d.label.toLowerCase())) {
        const cb = document.querySelector(`#disabilityCheckboxes input[value="${d.id}"]`);
        if (cb) {
          cb.checked = true;
          cb.closest('.checkbox-item').classList.add('selected');
        }
      }
    });

    // Check for percentage
    const percentMatch = text.match(/(\d+)\s*(%|percent|pratishat)/);
    if (percentMatch) {
      const p = parseInt(percentMatch[1]);
      const inputPercent = document.getElementById('inputPercent');
      if (inputPercent) {
        inputPercent.value = p;
        FormController.updatePercent(p);
      }
    }

    // Check for Income
    if (text.includes('lakh') || text.includes('thousand') || text.includes('hazar') || text.includes('income') || text.includes('aay')) {
      const incSelect = document.getElementById('inputIncome');
      if (incSelect) {
        if (text.includes('1') || text.includes('one') || text.includes('ek')) incSelect.value = '150000';
        else if (text.includes('2') || text.includes('two') || text.includes('do')) incSelect.value = '250000';
        else if (text.includes('3') || text.includes('three') || text.includes('teen')) incSelect.value = '300000';
        else incSelect.value = '250000';
      }
    }

    // Direct trigger find
    if (text.includes('find') || text.includes('search') || text.includes('match') || text.includes('dhoondo')) {
      FormController.submit();
    }
  },

  // ============ 6. TEXT-TO-SPEECH (TTS) NARRATOR ============
  speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = I18N.currentLang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.onstart = () => { this.isTTSPlaying = true; };
    utterance.onend = () => { this.isTTSPlaying = false; };
    window.speechSynthesis.speak(utterance);
  },

  readActiveSection() {
    const currentPage = App.currentPage;
    let textToRead = '';
    if (currentPage === 'home') {
      textToRead = 'Welcome to Samarthya. Intelligent Government Scheme Matching Portal bridging the gap between special student needs and over 50 welfare schemes.';
    } else if (currentPage === 'match') {
      textToRead = 'Student Profile Form. Please enter personal info, disability category, education level, and household income to discover eligible schemes.';
    } else if (currentPage === 'dashboard') {
      textToRead = 'Dashboard Overview. Showing your total matched schemes, urgency alerts, and potential benefits.';
    }
    this.speak(textToRead);
  },

  // ============ 7. ARIA LIVE ANNOUNCER ============
  announce(message) {
    let announcer = document.getElementById('ariaAnnouncer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'ariaAnnouncer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-9999px';
      document.body.appendChild(announcer);
    }
    announcer.textContent = message;
  },

  // ============ 8. ISL (INDIAN SIGN LANGUAGE) ASSISTANT MODAL ============
  openISLAssistant() {
    App.openModal(`
      <div class="isl-modal-card">
        <div class="modal-header" style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1)">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:24px">🤟</span>
            <div>
              <h3 style="font-size:18px;font-weight:700;color:#fff;margin:0">Indian Sign Language (ISL) Guide</h3>
              <p style="font-size:12px;color:#94a3b8;margin:0">Deaf / Hard-of-Hearing Assistive Assistant</p>
            </div>
          </div>
          <button class="modal-close" onclick="App.closeModal()">✕</button>
        </div>

        <div class="isl-video-stage">
          <div class="isl-avatar-anim">🧏‍♂️</div>
          <div style="position:absolute;top:14px;right:16px;background:rgba(239,68,68,0.2);border:1px solid #ef4444;color:#fca5a5;padding:3px 8px;border-radius:12px;font-size:10px;font-weight:800">
            ● LIVE ISL STREAM
          </div>
          <div class="isl-subtitle-box" id="islSubtitleText">
            "Welcome to Samarthya! Use Voice or Form to enter disability details and find government scholarships."
          </div>
        </div>

        <div style="padding:20px;background:rgba(15,23,42,0.95)">
          <h4 style="font-size:14px;font-weight:700;color:#fff;margin-bottom:10px">Quick ISL Modules:</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button class="btn-sm btn-secondary" onclick="AccessibilitySuite.setISLTopic('welcome')">👋 1. Welcome & Intro</button>
            <button class="btn-sm btn-secondary" onclick="AccessibilitySuite.setISLTopic('howToApply')">📄 2. How to Fill Form</button>
            <button class="btn-sm btn-secondary" onclick="AccessibilitySuite.setISLTopic('udid')">💳 3. UDID Verification</button>
            <button class="btn-sm btn-secondary" onclick="AccessibilitySuite.setISLTopic('scholarship')">🎓 4. Post-Matric Benefits</button>
          </div>
          <button class="btn btn-primary" onclick="App.closeModal();App.navigate('match')" style="width:100%;margin-top:16px;justify-content:center">
            Continue to Scheme Finder →
          </button>
        </div>
      </div>
    `);
  },

  setISLTopic(topic) {
    const sub = document.getElementById('islSubtitleText');
    if (!sub) return;
    const subtitles = {
      welcome: '"Welcome to Samarthya! We help PwD students discover 50+ government welfare schemes automatically."',
      howToApply: '"Step 1: Fill basic info or upload UDID. Step 2: Select disability category. Step 3: View matched schemes."',
      udid: '"Upload your UDID card to auto-extract disability type and percentage in 3 seconds."',
      scholarship: '"Scholarships include maintenance allowance, book grant, and tuition fee waivers via NSP."'
    };
    sub.textContent = subtitles[topic] || subtitles.welcome;
  },

  setupFloatingToolbar() {
    // Toolbar HTML injection is done in index.html
  }
};
