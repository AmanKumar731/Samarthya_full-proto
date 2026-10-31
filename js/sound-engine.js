/**
 * ==========================================================================
 * SAMARTHYA AI — PROCEDURAL WEB AUDIO SOUND ENGINE
 * Real-time Native Web Audio Synthesizer & Dynamic Soundscape
 * 100% Native Web Audio API • Zero External MP3 Files • Instant Response
 * ==========================================================================
 */

(function (window, document) {
  'use strict';

  const SoundEngine = {
    ctx: null,
    masterGain: null,
    droneGain: null,
    droneOsc1: null,
    droneOsc2: null,
    droneFilter: null,
    droneLfo: null,
    isDronePlaying: false,
    isEnabled: false,
    hasInteracted: false,
    lastScrollSound: 0,

    init() {
      // Check saved preference
      const saved = localStorage.getItem('samarthya_sound_enabled');
      this.isEnabled = saved === 'true';

      // Setup user gesture unlock
      const unlockAudio = () => {
        if (!this.hasInteracted) {
          this.hasInteracted = true;
          this.ensureContext();
          if (this.isEnabled) {
            this.startAmbientDrone();
          }
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });

      this.bindUI();
      this.bindDelegatedEvents();
      this.updateButtonUI();
    },

    ensureContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isEnabled ? 1 : 0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      return this.ctx;
    },

    toggleSound() {
      const ctx = this.ensureContext();
      this.isEnabled = !this.isEnabled;
      localStorage.setItem('samarthya_sound_enabled', this.isEnabled ? 'true' : 'false');

      if (this.masterGain && ctx) {
        const now = ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(this.isEnabled ? 1 : 0, now + 0.15);
      }

      if (this.isEnabled) {
        this.playSuccess();
        this.startAmbientDrone();
      } else {
        this.stopAmbientDrone();
      }

      this.updateButtonUI();
      return this.isEnabled;
    },

    updateButtonUI() {
      const btns = document.querySelectorAll('.sound-toggle-btn, .hud-sound-btn');
      btns.forEach(btn => {
        if (this.isEnabled) {
          btn.classList.add('active');
          const lbl = btn.querySelector('.sound-label');
          if (lbl) lbl.textContent = 'SOUND: ON';
        } else {
          btn.classList.remove('active');
          const lbl = btn.querySelector('.sound-label');
          if (lbl) lbl.textContent = 'SOUND: OFF';
        }
      });
    },

    /* ==========================================================================
       TACTILE SOUND EFFECTS (Synthesized Procedurally)
       ========================================================================== */

    // 1. High-frequency crystalline hover micro-chime
    playHover() {
      if (!this.isEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(2200, now + 0.045);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.05);
      } catch (e) {
        // Safe fallback
      }
    },

    // 2. Holographic snappy digital tap on click
    playClick() {
      if (!this.isEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.065);
      } catch (e) {
        // Safe fallback
      }
    },

    // 3. Cinematic sub-bass whoosh during 3D camera travel & station transitions
    playWhoosh() {
      if (!this.isEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.35);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(260, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.35);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.36);
      } catch (e) {
        // Safe fallback
      }
    },

    // 4. Sci-fi computational synthesis arpeggio (Quantum Reactor)
    playSynthesis() {
      if (!this.isEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66]; // C5, E5, G5, B5, D6
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + i * 0.055;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, noteStart);

          gain.gain.setValueAtTime(0.06, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.12);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(noteStart);
          osc.stop(noteStart + 0.13);
        });
      } catch (e) {
        // Safe fallback
      }
    },

    // 5. Shimmering harmonic chord bloom on clarity resolution
    playSuccess() {
      if (!this.isEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const freqs = [440, 554.37, 659.25, 880]; // A-major ethereal triad
        freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now);

          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 0.66);
        });
      } catch (e) {
        // Safe fallback
      }
    },

    // 6. High-tech crystalline data connection ping
    playDataPing() {
      if (!this.isEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const oscHarmonic = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, now); // A6
        osc.frequency.exponentialRampToValueAtTime(2640, now + 0.08);

        oscHarmonic.type = 'sine';
        oscHarmonic.frequency.setValueAtTime(3520, now);

        gain.gain.setValueAtTime(0.065, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.18);

        osc.connect(gain);
        oscHarmonic.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        oscHarmonic.start(now);
        osc.stop(now + 0.19);
        oscHarmonic.stop(now + 0.19);
      } catch (e) {
        // Safe fallback
      }
    },

    // 7. Monumental cinematic sub-bass impact (Deep transformation & clarity drops)
    playCinematicImpact() {
      if (!this.isEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const subOsc = ctx.createOscillator();
        const punchOsc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const subGain = ctx.createGain();

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(75, now);
        subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.85);

        punchOsc.type = 'triangle';
        punchOsc.frequency.setValueAtTime(120, now);
        punchOsc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(160, now);
        filter.frequency.linearRampToValueAtTime(50, now + 0.85);

        subGain.gain.setValueAtTime(0.22, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        subOsc.connect(filter);
        punchOsc.connect(filter);
        filter.connect(subGain);
        subGain.connect(this.masterGain);

        subOsc.start(now);
        punchOsc.start(now);
        subOsc.stop(now + 0.95);
        punchOsc.stop(now + 0.3);
      } catch (e) {
        // Safe fallback
      }
    },

    // 8. Soft negative warning tick
    playErrorTick() {
      if (!this.isEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.08);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.09);
      } catch (e) {
        // Safe fallback
      }
    },

    // 9. Procedural Deep Sub-Bass Transition Sweep (From Immersive Animation Pack)
    playTransition() {
      if (!this.isEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.exponentialRampToValueAtTime(315, now + 0.4);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.42);
      } catch (e) {
        // Safe fallback
      }
    },

    // 10. Dual-Tone Synthesis Neural Connect Chirp (From Immersive Animation Pack)
    playConnect() {
      if (!this.isEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(420, now);
        osc1.frequency.exponentialRampToValueAtTime(680, now + 0.08);

        gain1.gain.setValueAtTime(0.0001, now);
        gain1.gain.linearRampToValueAtTime(0.18, now + 0.008);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc1.connect(gain1);
        gain1.connect(this.masterGain);

        osc1.start(now);
        osc1.stop(now + 0.09);

        setTimeout(() => {
          if (!this.isEnabled || !this.ctx) return;
          const t2 = this.ctx.currentTime;
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(840, t2);
          osc2.frequency.exponentialRampToValueAtTime(720, t2 + 0.11);

          gain2.gain.setValueAtTime(0.0001, t2);
          gain2.gain.linearRampToValueAtTime(0.12, t2 + 0.008);
          gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.11);

          osc2.connect(gain2);
          gain2.connect(this.masterGain);

          osc2.start(t2);
          osc2.stop(t2 + 0.12);
        }, 35);
      } catch (e) {
        // Safe fallback
      }
    },

    // 11. Dynamic Real-time Scroll Velocity Audio Ticking (From Immersive Animation Pack)
    playScroll(velocity) {
      if (!this.isEnabled) return;
      const now = performance.now();
      if (now - this.lastScrollSound < 85 || Math.abs(velocity) < 0.5) return;
      this.lastScrollSound = now;

      const ctx = this.ensureContext();
      if (!ctx) return;

      try {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const freq = Math.min(920, 120 + Math.abs(velocity) * 8.5);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.028, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.026);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.03);
      } catch (e) {
        // Safe fallback
      }
    },

    /* ==========================================================================
       AMBIENT CINEMATIC GENERATIVE DRONE PAD (Living Atmosphere)
       ========================================================================== */
    startAmbientDrone() {
      if (this.isDronePlaying) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;

        // Dual detuned oscillators creating subtle binaural beating (55Hz & 55.35Hz)
        this.droneOsc1 = ctx.createOscillator();
        this.droneOsc2 = ctx.createOscillator();
        this.droneOsc1.type = 'triangle';
        this.droneOsc2.type = 'triangle';
        this.droneOsc1.frequency.setValueAtTime(55, now);
        this.droneOsc2.frequency.setValueAtTime(55.35, now);

        // Low-pass filter for smooth warmth
        this.droneFilter = ctx.createBiquadFilter();
        this.droneFilter.type = 'lowpass';
        this.droneFilter.frequency.setValueAtTime(180, now);

        // Slow breathing LFO modulating the filter cutoff
        this.droneLfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        this.droneLfo.type = 'sine';
        this.droneLfo.frequency.setValueAtTime(0.12, now); // ~8-second gentle breath
        lfoGain.gain.setValueAtTime(60, now);
        this.droneLfo.connect(lfoGain);
        lfoGain.connect(this.droneFilter.frequency);

        // Drone master volume (subtle atmospheric bed)
        this.droneGain = ctx.createGain();
        this.droneGain.gain.setValueAtTime(0.001, now);
        this.droneGain.gain.linearRampToValueAtTime(0.038, now + 1.5);

        this.droneOsc1.connect(this.droneFilter);
        this.droneOsc2.connect(this.droneFilter);
        this.droneFilter.connect(this.droneGain);
        this.droneGain.connect(this.masterGain);

        this.droneOsc1.start(now);
        this.droneOsc2.start(now);
        this.droneLfo.start(now);

        this.isDronePlaying = true;
      } catch (e) {
        // Safe fallback
      }
    },

    stopAmbientDrone() {
      if (!this.isDronePlaying || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        if (this.droneGain) {
          this.droneGain.gain.cancelScheduledValues(now);
          this.droneGain.gain.linearRampToValueAtTime(0.001, now + 0.6);
        }

        setTimeout(() => {
          if (this.droneOsc1) { this.droneOsc1.stop(); this.droneOsc1.disconnect(); this.droneOsc1 = null; }
          if (this.droneOsc2) { this.droneOsc2.stop(); this.droneOsc2.disconnect(); this.droneOsc2 = null; }
          if (this.droneLfo) { this.droneLfo.stop(); this.droneLfo.disconnect(); this.droneLfo = null; }
          this.isDronePlaying = false;
        }, 700);
      } catch (e) {
        this.isDronePlaying = false;
      }
    },

    bindUI() {
      document.querySelectorAll('.sound-toggle-btn, .hud-sound-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleSound();
        });
      });
    },

    bindDelegatedEvents() {
      // Delegated mouseover for hover chimes
      document.addEventListener('mouseover', (e) => {
        if (!this.isEnabled) return;
        const target = e.target.closest('button, a, .nav-link, .chaos-node-fragment, .dual-world-pane, .matcher-orbit-node, .a11y-art-tile, [data-sound="hover"]');
        if (target) {
          this.playHover();
        }
      }, { passive: true });

      // Delegated pointerdown for click taps
      document.addEventListener('pointerdown', (e) => {
        if (!this.isEnabled) return;
        const target = e.target.closest('button, a, .nav-link, .chaos-node-fragment, .dual-world-pane, .cinema-pill-btn, .magnetic-cta, .matcher-orbit-node, .a11y-art-tile, [data-sound="click"]');
        if (target) {
          this.playClick();
        }
      }, { passive: true });

      // Delegated input for sliders (Financial musical instrument feel)
      let lastSliderSound = 0;
      document.addEventListener('input', (e) => {
        if (!this.isEnabled) return;
        if (e.target && e.target.type === 'range') {
          const now = performance.now();
          if (now - lastSliderSound > 50) {
            this.playHover();
            lastSliderSound = now;
          }
        }
      }, { passive: true });

      // Real-time scroll velocity audio feedback (Tactile Audio from Immersive Pack)
      let lastScrollY = window.scrollY;
      let soundScrollTicking = false;
      window.addEventListener('scroll', () => {
        if (!this.isEnabled) return;
        if (!soundScrollTicking) {
          window.requestAnimationFrame(() => {
            const currentY = window.scrollY;
            const delta = currentY - lastScrollY;
            lastScrollY = currentY;
            if (Math.abs(delta) > 1) {
              this.playScroll(delta);
            }
            soundScrollTicking = false;
          });
          soundScrollTicking = true;
        }
      }, { passive: true });
    }
  };

  window.SoundEngine = SoundEngine;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SoundEngine.init());
  } else {
    SoundEngine.init();
  }
})(window, document);
