/**
 * ==========================================================================
 * SAMARTHYA AI — IMMERSIVE ANIMATION & INTERACTION ENGINE
 * GSAP 3 + ScrollTrigger Choreography (Atmospheric Orbs, Chaos Scrub, Sound)
 * ==========================================================================
 */

(function (window, document) {
  'use strict';

  const ImmersiveEngine = {
    isInitialized: false,
    audio: null,
    cursor: null,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    currentX: window.innerWidth / 2,
    currentY: window.innerHeight / 2,
    isTouch: false,
    reduced: false,

    init(containerSelector = '#samarthya-experience') {
      if (this.isInitialized) return;

      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;

      if (!gsap) {
        console.error('[ImmersiveEngine] GSAP not loaded');
        return;
      }

      if (ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }

      this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Audio Engine instantiation
      const AudioClass = window.SamarthyaAudio;
      if (AudioClass && !this.audio) {
        this.audio = new AudioClass();
      }

      const root = document.querySelector(containerSelector);

      if (root) {
        this.setupSoundToggle(root);
        this.setupOrbParallax(root);
        if (ScrollTrigger) {
          this.setupScrollChoreography(root);
        }
        this.isInitialized = true;
        if (ScrollTrigger) ScrollTrigger.refresh();
      } else {
        // Fallback for pages like index.html that include .world .orb atmospheric elements
        if (document.querySelector('.world .orb')) {
          this.setupOrbParallax(document.body);
        }
      }
    },

    /* --------------------------------------------------------------------------
       1. SOUND TOGGLE BUTTON
       -------------------------------------------------------------------------- */
    setupSoundToggle(root) {
      const toggleBtn = root.querySelector('[data-sound-toggle]') || document.querySelector('[data-sound-toggle]');
      if (!toggleBtn || !this.audio) return;

      const dot = toggleBtn.querySelector('.sound-dot');

      const updateUI = () => {
        const on = this.audio.enabled;
        toggleBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (toggleBtn.lastChild && toggleBtn.lastChild.nodeType === Node.TEXT_NODE) {
          toggleBtn.lastChild.textContent = on ? ' SOUND ON' : ' SOUND OFF';
        } else {
          toggleBtn.innerHTML = `<span class="sound-dot"></span> ${on ? 'SOUND ON' : 'SOUND OFF'}`;
        }
      };

      // Check saved preference
      const saved = localStorage.getItem('samarthya-sound') || localStorage.getItem('samarthya_sound_enabled');
      if (saved === 'on' || saved === 'true') {
        this.audio.enable().then(() => updateUI()).catch(() => {});
      } else {
        updateUI();
      }

      toggleBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!this.audio.enabled) {
          const success = await this.audio.enable();
          if (success) {
            updateUI();
            this.audio.click();
            localStorage.setItem('samarthya-sound', 'on');
            localStorage.setItem('samarthya_sound_enabled', 'true');
          }
        } else {
          this.audio.disable();
          updateUI();
          localStorage.setItem('samarthya-sound', 'off');
          localStorage.setItem('samarthya_sound_enabled', 'false');
        }
      });
    },

    /* --------------------------------------------------------------------------
       2. INERTIAL DIFFERENCE CURSOR
       -------------------------------------------------------------------------- */
    setupInertialCursor(root) {
      // Disabled completely per ultra-minimal UI design (uses native cursor)
    },

    /* --------------------------------------------------------------------------
       3. ATMOSPHERIC PARALLAX ORBS
       -------------------------------------------------------------------------- */
    setupOrbParallax(root) {
      window.addEventListener('pointermove', (e) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;

        gsap.to('.orb-a', {
          x: x * 90,
          y: y * 70,
          duration: 1.5,
          ease: 'power3.out',
          overwrite: 'auto'
        });
        gsap.to('.orb-b', {
          x: x * -65,
          y: y * -50,
          duration: 1.8,
          ease: 'power3.out',
          overwrite: 'auto'
        });
        gsap.to('.orb-c', {
          x: x * 45,
          y: y * 35,
          duration: 2.0,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }, { passive: true });
    },

    /* --------------------------------------------------------------------------
       4. SCROLL CHOREOGRAPHY (GSAP + SCROLLTRIGGER)
       -------------------------------------------------------------------------- */
    setupScrollChoreography(root) {
      if (this.reduced) return;

      // 1. Hero Stage Entrance
      const heroTitleSpans = root.querySelectorAll('.hero-title span');
      if (heroTitleSpans.length > 0) {
        gsap.from(heroTitleSpans, {
          yPercent: 130,
          rotate: 5,
          opacity: 0,
          stagger: 0.09,
          duration: 1.25,
          ease: 'power4.out',
          delay: 0.15
        });
      }

      const heroMetaElements = root.querySelectorAll('.hero-copy, .hero-stage .eyebrow, .imm-nav-bar');
      if (heroMetaElements.length > 0) {
        gsap.from(heroMetaElements, {
          y: 25,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.7
        });
      }

      // 2. Chaos Stage Timeline Scrub (Scattered → Converge → Explode Outward)
      const chaosStage = root.querySelector('.chaos-stage');
      const chaosWords = root.querySelectorAll('.chaos-word');

      if (chaosStage && chaosWords.length > 0) {
        const chaosTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: chaosStage,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
            pin: true
          }
        });

        // Scatter in from random offsets
        chaosTimeline.fromTo(chaosWords, {
          x: () => gsap.utils.random(-320, 320),
          y: () => gsap.utils.random(-130, 130),
          rotation: () => gsap.utils.random(-14, 14),
          scale: 1.4,
          opacity: 0
        }, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 0.85,
          stagger: 0.04,
          duration: 1,
          ease: 'power3.out'
        })
        // Blast outward in high velocity
        .to(chaosWords, {
          x: () => gsap.utils.random(-950, 950),
          y: () => gsap.utils.random(-550, 550),
          rotation: () => gsap.utils.random(-45, 45),
          opacity: 0,
          stagger: 0.02,
          duration: 1.4,
          ease: 'power2.in'
        })
        // Reveal Clarity Headline
        .to('.clarity-stage h2', {
          scale: 1.05,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out'
        }, '-=0.3');
      }

      // 3. Clarity Stage Trigger & Sound
      const clarityStage = root.querySelector('.clarity-stage');
      if (clarityStage) {
        ScrollTrigger.create({
          trigger: clarityStage,
          start: 'top 65%',
          onEnter: () => {
            if (this.audio) {
              this.audio.transition();
              this.audio.connect();
            }
          }
        });
      }

      // 4. Welfare World 01: Match Value Scrub & Meter Expansion
      const welfareSection = root.querySelector('.welfare-section');
      const matchValue = root.querySelector('.match-value');
      const meterBar = root.querySelector('.meter i');

      if (welfareSection && matchValue) {
        gsap.fromTo(matchValue, 
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: welfareSection,
              start: 'top 65%',
              end: 'top 30%',
              scrub: 1
            }
          }
        );
      }

      if (meterBar) {
        gsap.to(meterBar, {
          width: '87%',
          scrollTrigger: {
            trigger: root.querySelector('.match-meter') || welfareSection,
            start: 'top 70%',
            end: 'top 35%',
            scrub: 1,
            onLeave: () => {
              if (this.audio) this.audio.success();
            }
          }
        });
      }

      // 5. Credit World 02: 3D Perspective Rotation of Chips
      const creditSection = root.querySelector('.credit-section');
      const creditChips = root.querySelectorAll('.credit-checks span');

      if (creditSection && creditChips.length > 0) {
        gsap.from(creditChips, {
          y: 80,
          opacity: 0,
          rotateX: -55,
          stagger: 0.12,
          scrollTrigger: {
            trigger: creditSection,
            start: 'top 65%',
            end: 'top 30%',
            scrub: 1
          },
          ease: 'power3.out'
        });
      }

      // 6. Real-time Scroll Velocity Audio Ticking
      let lastScrollY = window.scrollY;
      ScrollTrigger.addEventListener('update', () => {
        const delta = window.scrollY - lastScrollY;
        lastScrollY = window.scrollY;
        if (this.audio) {
          this.audio.scroll(delta);
        }
      });
    }
  };

  // Universal export
  window.ImmersiveEngine = ImmersiveEngine;

  // Auto-boot
  const boot = () => {
    if (document.querySelector('#samarthya-experience')) {
      ImmersiveEngine.init('#samarthya-experience');
    } else if (document.querySelector('.world .orb')) {
      ImmersiveEngine.init(null);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window, document);
