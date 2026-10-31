/**
 * ==========================================================================
 * SAMARTHYA AI — PROCEDURAL WEB AUDIO ENGINE
 * Real-time Sound Synthesis (Hover, Click, Connect, Success, Transition, Scroll Velocity)
 * 100% Native Web Audio API • Zero External MP3s
 * ==========================================================================
 */

class SamarthyaAudio {
  constructor() {
    this.enabled = false;
    this.ctx = null;
    this.master = null;
    this.lastScrollSound = 0;
  }

  async enable() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;
      this.ctx = new AudioContextClass();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.055;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.enabled = true;
    return true;
  }

  disable() {
    this.enabled = false;
  }

  tone({ freq = 440, duration = 0.06, type = 'sine', volume = 0.25, sweep = 0 } = {}) {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      if (sweep) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + sweep), now + duration);
      }

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.master);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (err) {
      // Audio node scheduling safe guard
    }
  }

  hover() {
    this.tone({ freq: 620, duration: 0.045, type: 'triangle', volume: 0.16, sweep: 70 });
  }

  click() {
    this.tone({ freq: 180, duration: 0.09, type: 'sine', volume: 0.25, sweep: 110 });
  }

  connect() {
    this.tone({ freq: 420, duration: 0.08, type: 'sine', volume: 0.18, sweep: 260 });
    setTimeout(() => {
      this.tone({ freq: 840, duration: 0.11, type: 'sine', volume: 0.12, sweep: -120 });
    }, 35);
  }

  success() {
    [440, 554, 659].forEach((f, i) => {
      setTimeout(() => {
        this.tone({ freq: f, duration: 0.16, type: 'triangle', volume: 0.18 });
      }, i * 55);
    });
  }

  transition() {
    this.tone({ freq: 95, duration: 0.4, type: 'sine', volume: 0.16, sweep: 220 });
  }

  scroll(v) {
    const now = performance.now();
    if (now - this.lastScrollSound < 90 || Math.abs(v) < 0.5) return;
    this.lastScrollSound = now;
    this.tone({
      freq: Math.min(900, 120 + Math.abs(v) * 8),
      duration: 0.025,
      type: 'sine',
      volume: 0.025
    });
  }
}

// Universal export
if (typeof window !== 'undefined') {
  window.SamarthyaAudio = SamarthyaAudio;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SamarthyaAudio };
}
