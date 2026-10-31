// ============================================
// Samarthya — Wispr Flow AI Voice Engine
// Next-Gen Voice Dictation, Smart Field Autofill & Audio Wave Visualizer
// ============================================

const WisprFlow = {
  isRecording: false,
  recognition: null,
  audioContext: null,
  analyser: null,
  dataArray: null,
  animationId: null,
  activeTargetInput: null,
  lastTranscript: '',

  init() {
    this.setupSpeechRecognition();
    this.setupVisualizerBar();
  },

  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    const langMap = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN', mr: 'mr-IN', ta: 'ta-IN', gu: 'gu-IN' };
    this.recognition.lang = langMap[I18N.currentLang] || 'en-IN';

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = (finalTranscript || interimTranscript).trim();
      this.updateTranscriptDisplay(currentText);

      if (finalTranscript) {
        this.lastTranscript = finalTranscript.trim();
        this.processWisprInput(this.lastTranscript);
      }
    };

    this.recognition.onerror = (e) => {
      console.warn('Wispr recognition error:', e.error);
      this.stop();
    };

    this.recognition.onend = () => {
      if (this.isRecording) {
        this.stop();
      }
    };
  },

  toggle(targetInputId = null) {
    if (this.isRecording) {
      this.stop();
    } else {
      this.start(targetInputId);
    }
  },

  start(targetInputId = null) {
    if (!this.recognition) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    this.activeTargetInput = targetInputId ? document.getElementById(targetInputId) : null;
    this.isRecording = true;

    // Update UI elements
    const bar = document.getElementById('wisprFlowBar');
    if (bar) bar.classList.add('active');

    const pills = document.querySelectorAll('.wispr-btn, .voice-input-btn');
    pills.forEach(p => p.classList.add('recording'));

    this.updateTranscriptDisplay('Listening... Speak naturally in Hindi or English');
    this.startAudioVisualization();

    try {
      const langMap = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN', mr: 'mr-IN', ta: 'ta-IN', gu: 'gu-IN' };
      this.recognition.lang = langMap[I18N.currentLang] || 'en-IN';
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start exception:', e);
    }
  },

  stop() {
    this.isRecording = false;

    const bar = document.getElementById('wisprFlowBar');
    if (bar) bar.classList.remove('active');

    const pills = document.querySelectorAll('.wispr-btn, .voice-input-btn');
    pills.forEach(p => p.classList.remove('recording'));

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    try {
      if (this.recognition) this.recognition.stop();
    } catch (e) {}

    // If there is an active text in AI chat drawer, transfer it
    if (this.lastTranscript && !this.activeTargetInput) {
      const aiInput = document.getElementById('aiChatInput');
      const aiDrawer = document.getElementById('aiDrawer');
      if (aiDrawer && aiDrawer.classList.contains('open') && aiInput) {
        aiInput.value = this.lastTranscript;
        SamarthyaAI.handleSend();
      }
    }
  },

  updateTranscriptDisplay(text) {
    const textEl = document.getElementById('wisprLiveTranscript');
    if (textEl) {
      textEl.textContent = text || 'Listening...';
    }

    // Direct input auto-fill if specific input targeted
    if (this.activeTargetInput && text) {
      this.activeTargetInput.value = text;
    }
  },

  processWisprInput(transcript) {
    const text = transcript.toLowerCase();

    // Smart Form Auto-fill Engine from Natural Speech
    if (App.currentPage === 'match' || text.includes('percent') || text.includes('disability') || text.includes('scholarship')) {
      let updatedSomething = false;

      // Extract disability percentage: e.g. "60 percent", "40%", "75 percentage"
      const percentMatch = text.match(/(\d{1,3})\s*(%|percent|pratishat)/i);
      if (percentMatch) {
        const val = parseInt(percentMatch[1]);
        if (val >= 0 && val <= 100) {
          const range = document.getElementById('inputPercent');
          if (range) {
            range.value = val;
            FormController.updatePercent(val);
            updatedSomething = true;
          }
        }
      }

      // Extract State
      INDIAN_STATES.forEach(s => {
        if (text.includes(s.label.toLowerCase()) || text.includes(s.id.replace(/_/g, ' '))) {
          const stateSelect = document.getElementById('inputState');
          if (stateSelect) {
            stateSelect.value = s.id;
            updatedSomething = true;
          }
        }
      });

      // Extract Gender
      if (text.includes('female') || text.includes('girl') || text.includes('woman') || text.includes('mahila')) {
        const g = document.getElementById('inputGender');
        if (g) { g.value = 'female'; updatedSomething = true; }
      } else if (text.includes('male') || text.includes('boy') || text.includes('man') || text.includes('purush')) {
        const g = document.getElementById('inputGender');
        if (g) { g.value = 'male'; updatedSomething = true; }
      }

      // Extract Disability Type
      if (text.includes('blind') || text.includes('visual') || text.includes('drishti')) {
        this.selectDisabilityCheckbox('blindness');
        updatedSomething = true;
      } else if (text.includes('locomotor') || text.includes('ortho') || text.includes('handicap') || text.includes('chalne')) {
        this.selectDisabilityCheckbox('locomotor_disability');
        updatedSomething = true;
      } else if (text.includes('deaf') || text.includes('hearing') || text.includes('sunne')) {
        this.selectDisabilityCheckbox('deaf');
        updatedSomething = true;
      } else if (text.includes('intellectual') || text.includes('autism') || text.includes('manasik')) {
        this.selectDisabilityCheckbox('intellectual_disability');
        updatedSomething = true;
      }

      if (updatedSomething) {
        this.showWisprNotification(`✨ Wispr Flow auto-filled your criteria from voice!`);
      }
    }

    // Voice commands to navigate or ask AI
    if (text.includes('find schemes') || text.includes('match scheme') || text.includes('yojana dhundho')) {
      App.navigate('match');
      this.stop();
    } else if (text.includes('open ai') || text.includes('ask ai') || text.includes('chatbot')) {
      SamarthyaAI.toggle();
      this.stop();
    }
  },

  selectDisabilityCheckbox(id) {
    const cb = document.querySelector(`#disabilityCheckboxes input[value="${id}"]`);
    if (cb) {
      cb.checked = true;
      const item = cb.closest('.checkbox-item');
      if (item) item.classList.add('selected');
    }
  },

  showWisprNotification(msg) {
    const toast = document.createElement('div');
    toast.className = 'wispr-toast animate-in';
    toast.innerHTML = `<span>🎙️</span> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  },

  setupVisualizerBar() {
    // Waveform canvas rendering
    const canvas = document.getElementById('wisprCanvas');
    if (!canvas) return;
  },

  startAudioVisualization() {
    const canvas = document.getElementById('wisprCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 120;
    canvas.height = 36;

    let step = 0;
    const draw = () => {
      if (!this.isRecording) return;
      this.animationId = requestAnimationFrame(draw);
      step += 0.08;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 18;
      const barWidth = 3;
      const gap = 3;

      for (let i = 0; i < bars; i++) {
        const height = Math.sin(step + i * 0.4) * 12 + 14 + Math.random() * 6;
        const x = i * (barWidth + gap) + 6;
        const y = (canvas.height - height) / 2;

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#6EE7B7');
        gradient.addColorStop(1, '#10B981');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, [3]);
        ctx.fill();
      }
    };
    draw();
  }
};

window.WisprFlow = WisprFlow;
