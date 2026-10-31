/**
 * ==========================================================================
 * SAMARTHYA AI — CINEMATIC DIGITAL EXPERIENCE CONTROLLER
 * 17-Scene Continuous Narrative Film (Chaos → Intelligence → Clarity)
 * Powered by GSAP 3, ScrollTrigger & Dynamic SVG Path Morphing
 * ==========================================================================
 */

(function (window, document) {
  'use strict';

  const CinematicExperience = {
    isInitialized: false,
    pinnedScrollTrigger: null,

    init() {
      if (this.isInitialized) return;
      if (!document.getElementById('scene-chaos-clarity') && !document.getElementById('scene-hero')) {
        return;
      }

      this.initHeroEntrance();
      this.initChaosToClaritySequence();
      this.initDualWorldInteraction();
      this.initWelfareGenerativeEngine();
      this.initCreditSequentialEngine();
      this.initFinancialInteractiveCanvas();
      this.initCinematicMap();
      this.initVoiceWaveformCanvas();
      this.initAccessibilityLiveMatrix();
      this.initScaleCounters();
      this.initApplicationJourney();
      this.initFinalConvergence();
      this.bindGlobalShortcuts();

      this.isInitialized = true;
    },

    /* ==========================================================================
       SCENE 01: HERO ENTRANCE TIMELINE
       ========================================================================== */
    initHeroEntrance() {
      if (!window.gsap) return;
      const heroScene = document.getElementById('scene-hero');
      if (!heroScene) return;

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // Split headline words for cinematic staggered unmasking
      const innerLines = document.querySelectorAll('.hero-massive-headline .hl-line-inner, .hero-massive-headline .hl-line');
      if (innerLines.length > 0) {
        gsap.set(innerLines, { yPercent: 125, rotateX: 30, skewY: 4, opacity: 0 });
      }

      tl.to('#opportunity-field-canvas', { opacity: 0.85, duration: 1.5 })
        .fromTo('.hero-meta-strip .laser-mark', 
          { scale: 0, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)' }, '-=0.8')
        .fromTo('.hero-meta-strip .laser-line', 
          { scaleX: 0 }, 
          { scaleX: 1, duration: 0.8, transformOrigin: 'left' }, '-=0.4')
        .fromTo('.hero-meta-strip span', 
          { opacity: 0, x: -10 }, 
          { opacity: 1, x: 0, duration: 0.6 }, '-=0.5')
        .to(innerLines, {
          yPercent: 0,
          rotateX: 0,
          skewY: 0,
          opacity: 1,
          duration: 1.4,
          stagger: 0.12,
          ease: 'power4.out'
        }, '-=0.4')
        .fromTo('.hero-editorial-right', 
          { y: 35, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }, '-=0.8')
        .fromTo('.hero-bottom-telemetry', 
          { opacity: 0, y: 15 }, 
          { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');

      // 3D Perspective Mouse Parallax Tilt on Hero Scene
      const heroHeadline = document.getElementById('heroMassiveHeadline');
      const heroRight = document.querySelector('.hero-editorial-right');
      if (heroScene && heroHeadline && !('ontouchstart' in window)) {
        heroScene.addEventListener('mousemove', (e) => {
          const rect = heroScene.getBoundingClientRect();
          const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
          const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
          gsap.to(heroHeadline, {
            rotationY: normX * 9,
            rotationX: -normY * 6,
            duration: 0.5,
            ease: 'power2.out',
            transformPerspective: 1200
          });
          if (heroRight) {
            gsap.to(heroRight, {
              x: normX * 12,
              y: normY * 8,
              duration: 0.6,
              ease: 'power2.out'
            });
          }
        }, { passive: true });

        heroScene.addEventListener('mouseleave', () => {
          gsap.to(heroHeadline, {
            rotationY: 0,
            rotationX: 0,
            duration: 0.8,
            ease: 'power3.out'
          });
          if (heroRight) {
            gsap.to(heroRight, {
              x: 0,
              y: 0,
              duration: 0.8,
              ease: 'power3.out'
            });
          }
        });
      }
    },

    /* ==========================================================================
       SCENE 02 & 03: PINNED CHAOS → INTELLIGENCE SYNTHESIS → CLARITY
       ========================================================================== */
    initChaosToClaritySequence() {
      if (!window.gsap || !window.ScrollTrigger) return;

      const container = document.getElementById('scene-chaos-clarity');
      if (!container) return;

      const fragments = container.querySelectorAll('.chaos-node-fragment');
      const chaosTitle = container.querySelector('.chaos-title-wrap');
      const chaosWords = container.querySelectorAll('.chaos-word');
      const synthesisStage = document.getElementById('synthesisStage');
      const clarityStage = document.getElementById('clarityStage');
      const svgWeb = document.getElementById('claritySvgWeb');
      const beamGroup = document.getElementById('synthesisBeamGroup');
      const hudTerminal = document.getElementById('hudReadoutText');
      const hudProgress = document.getElementById('hudProgressFill');
      const shockwave = document.getElementById('synthesisShockwave');

      // SVG coordinates for fragment anchors (viewBox: 0 0 1000 1000, center at 500,500)
      const fragSvgPoints = [
        { x: 160, y: 200 }, // frag-1: top 16%, left 8%
        { x: 780, y: 220 }, // frag-2: top 18%, left 70%
        { x: 140, y: 440 }, // frag-3: top 40%, left 6%
        { x: 820, y: 460 }, // frag-4: top 42%, left 74%
        { x: 180, y: 700 }, // frag-5: top 66%, left 10%
        { x: 800, y: 720 }, // frag-6: top 68%, left 72%
        { x: 300, y: 890 }, // frag-7: top 85%, left 22%
        { x: 680, y: 890 }  // frag-8: top 85%, left 60%
      ];

      // Exact vector deltas from starting left/top coordinates to center (50vw, 50vh)
      const convergenceOffsets = [
        { x: '42vw', y: '34vh' },
        { x: '-20vw', y: '32vh' },
        { x: '44vw', y: '10vh' },
        { x: '-24vw', y: '8vh' },
        { x: '40vw', y: '-16vh' },
        { x: '-22vw', y: '-18vh' },
        { x: '28vw', y: '-35vh' },
        { x: '-10vw', y: '-35vh' }
      ];

      // Dynamically build SVG connecting laser lines
      if (beamGroup) {
        beamGroup.innerHTML = '';
        fragSvgPoints.forEach((pt, idx) => {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', '500');
          line.setAttribute('y1', '500');
          line.setAttribute('x2', pt.x.toString());
          line.setAttribute('y2', pt.y.toString());
          line.setAttribute('id', `beam-line-${idx}`);
          beamGroup.appendChild(line);
        });
      }

      // Reset initial values
      gsap.set(chaosTitle, { opacity: 1, scale: 1, y: 0 });
      if (chaosWords.length > 0) gsap.set(chaosWords, { opacity: 0.8, scale: 1, x: 0, y: 0, rotation: 0 });
      gsap.set(synthesisStage, { opacity: 0, scale: 0.88 });
      gsap.set(clarityStage, { opacity: 0, scale: 0.92 });
      gsap.set(fragments, { x: 0, y: 0, scale: 1, opacity: 1 });
      if (svgWeb) gsap.set(svgWeb, { opacity: 0 });
      if (hudProgress) hudProgress.style.width = '12%';

      // Kill any previous ScrollTrigger for this container
      if (this.pinnedScrollTrigger) {
        this.pinnedScrollTrigger.kill();
      }

      // Master scrub timeline pinned to container
      const scrubTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=1400',
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;

            // Dynamic HUD Terminal readouts as user scrolls through the synthesis
            if (hudTerminal && hudProgress) {
              if (p < 0.25) {
                hudTerminal.innerHTML = '&gt; SCANNING 50+ STATUTORY FRAMEWORKS...';
                hudProgress.style.width = `${Math.round(12 + p * 120)}%`;
              } else if (p < 0.50) {
                hudTerminal.innerHTML = '&gt; EXTRACTING ZERO-PII ELIGIBILITY PARAMETERS...';
                hudProgress.style.width = `${Math.round(42 + (p - 0.25) * 150)}%`;
              } else if (p < 0.75) {
                hudTerminal.innerHTML = '&gt; CROSS-REFERENCING ADIP, NSFDC &amp; DEPwD MATRICES...';
                hudProgress.style.width = `${Math.round(80 + (p - 0.50) * 60)}%`;
              } else {
                hudTerminal.innerHTML = '&gt; SYNTHESIS COMPLETE. RESOLUTION CONFIRMED (99.4%).';
                hudProgress.style.width = '100%';
              }
            }
          }
        }
      });

      this.pinnedScrollTrigger = scrubTl.scrollTrigger;

      // STEP 1: CHAOS EXIT & LASER NET IGNITION (0.0 to 1.0)
      scrubTl
        .to(chaosTitle, {
          opacity: 0,
          scale: 0.75,
          y: -40,
          duration: 1.0,
          ease: 'power2.inOut'
        });

      if (chaosWords.length > 0) {
        scrubTl.fromTo(chaosWords, {
          x: () => gsap.utils.random(-260, 260),
          y: () => gsap.utils.random(-120, 120),
          rotation: () => gsap.utils.random(-12, 12),
          scale: 1.3,
          opacity: 0
        }, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 0.85,
          stagger: 0.03,
          duration: 0.8,
          ease: 'power3.out'
        }, 0)
        .to(chaosWords, {
          x: () => gsap.utils.random(-900, 900),
          y: () => gsap.utils.random(-500, 500),
          rotation: () => gsap.utils.random(-40, 40),
          opacity: 0,
          scale: 0.3,
          stagger: 0.02,
          duration: 1.3,
          ease: 'power2.in'
        }, 'converge');
      }

      scrubTl
        .to(svgWeb, {
          opacity: 0.85,
          duration: 0.8,
          ease: 'power2.out'
        }, '-=0.5')

        // STEP 2: THE AMAZING MIDDLE — QUANTUM SYNTHESIS ENGINE AWAKENING (0.6 to 2.2)
        .to(synthesisStage, {
          opacity: 1,
          scale: 1,
          duration: 1.0,
          ease: 'power3.out',
          onStart: () => {
            if (window.SoundEngine) SoundEngine.playSynthesis();
          }
        }, '-=0.4');

      // STEP 3: CONVERGENCE TOWARD SINGULARITY CORE
      fragments.forEach((frag, idx) => {
        const off = convergenceOffsets[idx];
        scrubTl.to(frag, {
          x: off.x,
          y: off.y,
          scale: 0.2,
          opacity: 0,
          duration: 1.6,
          ease: 'power2.in'
        }, 'converge');

        const line = document.getElementById(`beam-line-${idx}`);
        if (line) {
          scrubTl.to(line, {
            attr: { x2: 500, y2: 500 },
            duration: 1.6,
            ease: 'power2.in'
          }, 'converge');
        }
      });

      // STEP 4: SHOCKWAVE EXPLOSION & SINGULARITY DETONATION
      scrubTl
        .to(svgWeb, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.in'
        }, '-=0.6')
        .fromTo(shockwave, 
          { scale: 0.5, opacity: 1, borderColor: '#00E5FF' },
          { 
            scale: 18, 
            opacity: 0, 
            duration: 1.0, 
            ease: 'power2.out',
            onStart: () => {
              if (window.SoundEngine) {
                SoundEngine.playCinematicImpact();
                setTimeout(() => SoundEngine.playSuccess(), 260);
              }
            }
          },
          '-=0.4'
        )

        // STEP 5: SYNTHESIS DISSOLVES & SAMARTHYA CLARITY RESOLUTION BLOOMS
        .to(synthesisStage, {
          opacity: 0,
          scale: 1.15,
          duration: 0.8,
          ease: 'power2.in'
        }, '-=0.7')
        .to(clarityStage, {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'power4.out',
          onStart: () => {
            if (window.SoundEngine) {
              if (SoundEngine.playTransition) SoundEngine.playTransition();
              if (SoundEngine.playConnect) SoundEngine.playConnect();
            }
          }
        }, '-=0.4')
        .fromTo('.clarity-core-emblem', 
          { scale: 0.2, rotation: -90, opacity: 0 }, 
          { scale: 1, rotation: 0, opacity: 1, duration: 1.0, ease: 'back.out(1.8)' }, 
          '-=1.0'
        )
        .fromTo('.clarity-badge',
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.7'
        )
        .fromTo('.clarity-brand-title', 
          { y: 25, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 
          '-=0.6'
        )
        .fromTo('.clarity-statement', 
          { y: 15, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6 }, 
          '-=0.5'
        )
        .fromTo('.clarity-formula-chain .formula-node, .clarity-formula-chain .formula-arrow',
          { y: 20, opacity: 0, scale: 0.8 },
          { 
            y: 0, 
            opacity: 1, 
            scale: 1, 
            stagger: 0.08, 
            duration: 0.5, 
            ease: 'back.out(1.5)',
            onStart: () => {
              if (window.SoundEngine) SoundEngine.playDataPing();
            }
          },
          '-=0.3'
        )
        .fromTo('.clarity-pill',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' },
          '-=0.2'
        );

      // Interactive skip / smooth advancement on click
      container.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        const st = this.pinnedScrollTrigger;
        if (st && st.progress < 0.8) {
          window.scrollTo({
            top: st.start + 1400,
            behavior: 'smooth'
          });
        }
      });
    },

    /* ==========================================================================
       SCENE 04: DUAL WORLD INTERACTIVE SPLIT SCREEN
       ========================================================================== */
    initDualWorldInteraction() {
      const paneWelfare = document.querySelector('.pane-welfare');
      const paneCredit = document.querySelector('.pane-credit');
      const divider = document.querySelector('.dual-world-divider');
      const container = document.querySelector('.dual-world-container');

      if (!paneWelfare || !paneCredit || !divider || !container) return;

      let isDragging = false;

      const setDividerPosition = (clientX) => {
        const rect = container.getBoundingClientRect();
        let percent = ((clientX - rect.left) / rect.width) * 100;
        percent = Math.min(Math.max(percent, 25), 75);

        paneWelfare.style.width = `${percent}%`;
        paneCredit.style.width = `${100 - percent}%`;
        divider.style.left = `${percent}%`;

        if (window.MotionEngine) {
          if (percent > 55) {
            MotionEngine.setOpportunityFieldTheme('welfare');
          } else if (percent < 45) {
            MotionEngine.setOpportunityFieldTheme('credit');
          }
        }
      };

      divider.addEventListener('mousedown', () => { isDragging = true; });
      window.addEventListener('mouseup', () => { isDragging = false; });
      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        setDividerPosition(e.clientX);
      });

      // Hover emphasis when cursor is over either pane
      paneWelfare.addEventListener('mouseenter', () => {
        if (!isDragging && window.innerWidth > 960) {
          paneWelfare.style.width = '56%';
          paneCredit.style.width = '44%';
          divider.style.left = '56%';
          if (window.MotionEngine) MotionEngine.setOpportunityFieldTheme('welfare');
        }
      });

      paneCredit.addEventListener('mouseenter', () => {
        if (!isDragging && window.innerWidth > 960) {
          paneWelfare.style.width = '44%';
          paneCredit.style.width = '56%';
          divider.style.left = '44%';
          if (window.MotionEngine) MotionEngine.setOpportunityFieldTheme('credit');
        }
      });

      // Awwwards ScrollTrigger Entrance Reveal
      if (window.ScrollTrigger) {
        gsap.fromTo('.dual-world-container',
          { y: 50, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#scene-dual-world',
              start: 'top 75%'
            }
          }
        );
      }
    },

    /* ==========================================================================
       SCENE 05: WELFARE GENERATIVE 7-NODE MATCHING ENGINE
       ========================================================================== */
    initWelfareGenerativeEngine() {
      const nodes = document.querySelectorAll('.matcher-orbit-node');
      const scoreNum = document.querySelector('.matcher-center-score .score-num');

      // 7 criteria nodes positioned radially
      const radius = 175;
      nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        node.style.left = `calc(50% + ${x}px)`;
        node.style.top = `calc(50% + ${y}px)`;
        node.style.transform = 'translate(-50%, -50%)';

        node.addEventListener('click', () => {
          node.classList.toggle('active');
          if (window.SoundEngine) SoundEngine.playClick();
          this.recomputeWelfareScore();
        });
      });

      // Awwwards Radial Bloom Entrance
      if (window.ScrollTrigger) {
        ScrollTrigger.create({
          trigger: '#scene-welfare-engine',
          start: 'top 70%',
          once: true,
          onEnter: () => {
            gsap.fromTo(nodes, 
              { scale: 0, opacity: 0 }, 
              { scale: 1, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'back.out(2)' }
            );
            if (scoreNum && window.MotionEngine) {
              MotionEngine.animateCounter(scoreNum, 85, 1.4, '%');
            }
          }
        });
      }
    },

    recomputeWelfareScore() {
      const activeNodes = document.querySelectorAll('.matcher-orbit-node.active');
      const scoreNum = document.querySelector('.matcher-center-score .score-num');
      if (!scoreNum) return;

      const baseScore = 65;
      const calculated = Math.min(100, baseScore + activeNodes.length * 5);

      if (window.MotionEngine) {
        MotionEngine.animateCounter(scoreNum, calculated, 0.8, '%');
      } else {
        scoreNum.textContent = calculated + '%';
      }
    },

    /* ==========================================================================
       SCENE 07: CREDIT CONCESSIONAL 5-CHECKPOINT EVALUATOR
       ========================================================================== */
    initCreditSequentialEngine() {
      if (!window.gsap || !window.ScrollTrigger) return;

      const scene = document.getElementById('scene-credit-engine');
      if (!scene) return;

      const nodes = scene.querySelectorAll('.credit-node-box');
      gsap.fromTo(nodes, 
        { opacity: 0, y: 25 }, 
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.18,
          scrollTrigger: {
            trigger: scene,
            start: 'top 75%'
          },
          onComplete: () => {
            nodes.forEach((n, idx) => {
              setTimeout(() => n.classList.add('active'), idx * 250);
            });
          }
        }
      );
    },

    /* ==========================================================================
       SCENE 08: FINANCIAL INTERACTIVE SIMULATOR (Huge Typography & Morphing SVG)
       ========================================================================== */
    initFinancialInteractiveCanvas() {
      const amountSlider = document.getElementById('financeAmountSlider');
      const tenureSlider = document.getElementById('financeTenureSlider');
      const rateSlider = document.getElementById('financeRateSlider');

      const amountVal = document.getElementById('financeAmountVal');
      const tenureVal = document.getElementById('financeTenureVal');
      const rateVal = document.getElementById('financeRateVal');
      const heroAmount = document.getElementById('financeHeroAmount');
      const emiVal = document.getElementById('financeEmiVal');
      const totalInterestVal = document.getElementById('financeInterestVal');

      const updateCalculation = () => {
        if (!amountSlider || !tenureSlider || !rateSlider) return;

        const P = Number(amountSlider.value);
        const N = Number(tenureSlider.value);
        const R = Number(rateSlider.value);

        if (amountVal) amountVal.textContent = `₹${P.toLocaleString('en-IN')}`;
        if (tenureVal) tenureVal.textContent = `${N} Months`;
        if (rateVal) rateVal.textContent = `${R}%`;
        if (heroAmount) heroAmount.textContent = `₹${P.toLocaleString('en-IN')}`;

        // Compute EMI via FinancialCalculator if loaded
        let emi = 0;
        let totalInterest = 0;

        if (window.FinancialCalculator) {
          const calc = FinancialCalculator.calculate(P, R, N, 6, 'waived_subsidized');
          emi = calc.emi;
          totalInterest = calc.totalInterestPaid;
        } else {
          // Standard EMI Formula fallback
          const r = R / (12 * 100);
          const pow = Math.pow(1 + r, N);
          emi = Math.round((P * r * pow) / (pow - 1));
          totalInterest = Math.round((emi * N) - P);
        }

        if (emiVal) emiVal.textContent = `₹${emi.toLocaleString('en-IN')} / mo`;
        if (totalInterestVal) totalInterestVal.textContent = `₹${Math.max(0, totalInterest).toLocaleString('en-IN')}`;

        this.drawAmortizationCurve(P, N, emi);
      };

      if (amountSlider) amountSlider.addEventListener('input', updateCalculation);
      if (tenureSlider) tenureSlider.addEventListener('input', updateCalculation);
      if (rateSlider) rateSlider.addEventListener('input', updateCalculation);

      // Parallax magnetic tilt on the huge financial amount
      const stage = document.querySelector('.finance-canvas-stage');
      if (stage && heroAmount) {
        stage.addEventListener('mousemove', (e) => {
          const rect = stage.getBoundingClientRect();
          const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
          const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
          heroAmount.style.transform = `perspective(800px) rotateY(${normX * 8}deg) rotateX(${-normY * 8}deg)`;
        });
        stage.addEventListener('mouseleave', () => {
          heroAmount.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
        });
      }

      if (window.ScrollTrigger) {
        gsap.fromTo('.finance-canvas-stage',
          { y: 50, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#scene-financial-simulator',
              start: 'top 75%'
            }
          }
        );
      }

      updateCalculation();
    },

    drawAmortizationCurve(principal, tenure, emi) {
      const svg = document.getElementById('financeGraphSvg');
      if (!svg) return;

      const width = svg.clientWidth || 800;
      const height = svg.clientHeight || 160;

      let pathD = `M 0 ${height * 0.15}`;
      const points = [];
      const steps = Math.min(tenure, 36);

      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * width;
        // Remaining balance decaying curve
        const progress = i / steps;
        const decay = Math.pow(1 - progress, 1.4);
        const y = height - (decay * (height * 0.75) + height * 0.1);
        pathD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        points.push({ x, y });
      }

      // Complete area fill
      const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

      let strokePath = document.getElementById('financeGraphStroke');
      let fillPath = document.getElementById('financeGraphFill');

      if (!strokePath) {
        svg.innerHTML = `
          <defs>
            <linearGradient id="financeAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#E6A84A" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#E6A84A" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <path id="financeGraphFill" fill="url(#financeAreaGrad)" d="${fillD}"/>
          <path id="financeGraphStroke" fill="none" stroke="#F5B74F" stroke-width="2.5" stroke-linecap="round" d="${pathD}"/>
        `;
      } else {
        if (window.gsap) {
          gsap.to(strokePath, { attr: { d: pathD }, duration: 0.35, ease: 'power2.out' });
          gsap.to(fillPath, { attr: { d: fillD }, duration: 0.35, ease: 'power2.out' });
        } else {
          strokePath.setAttribute('d', pathD);
          fillPath.setAttribute('d', fillD);
        }
      }
    },

    /* ==========================================================================
       SCENE 09: CINEMATIC PARTNER MAP
       ========================================================================== */
    initCinematicMap() {
      const container = document.getElementById('cinematicMapContainer');
      if (!container || typeof L === 'undefined') return;

      const initMap = () => {
        if (container.dataset.mapInit) return;
        container.dataset.mapInit = 'true';
        container.innerHTML = '<div id="cinematicLeaflet" style="width:100%;height:100%"></div>';

        try {
          const map = L.map('cinematicLeaflet', { zoomControl: false, attributionControl: false }).setView([28.6289, 77.2144], 13);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 18,
            subdomains: 'abcd'
          }).addTo(map);

          const markerIcon = L.divIcon({
            className: 'partner-spotlight-pin',
            html: `<div style="width:18px;height:18px;border-radius:50%;background:#00E5FF;border:2.5px solid #FFF;box-shadow:0 0 25px #00E5FF"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });

          L.marker([28.6289, 77.2144], { icon: markerIcon })
            .addTo(map)
            .bindPopup('<strong style="color:#000">Punjab National Bank</strong><br><span style="color:#333;font-size:11px">Accredited NSFDC Channel Partner</span><br><span style="color:#059669;font-weight:700">12.4 km away &bull; NPA Healthy</span>')
            .openPopup();
        } catch (err) {
          console.warn('Cinematic map error:', err);
        }
      };

      if (window.ScrollTrigger) {
        ScrollTrigger.create({
          trigger: '#scene-partner-locator',
          start: 'top 85%',
          once: true,
          onEnter: initMap
        });
      } else {
        setTimeout(initMap, 500);
      }
    },

    /* ==========================================================================
       SCENE 10: ACCESSIBILITY AS ART (LIVE TRANSFORMING WEBSITE)
       ========================================================================== */
    initAccessibilityLiveMatrix() {
      const tiles = document.querySelectorAll('.a11y-art-tile');
      tiles.forEach((tile) => {
        tile.addEventListener('click', () => {
          tile.classList.toggle('active');
          const feature = tile.dataset.a11y;

          if (window.AccessibilitySuite) {
            if (feature === 'contrast') AccessibilitySuite.toggleHighContrast();
            if (feature === 'dyslexia') AccessibilitySuite.toggleDyslexiaFont();
            if (feature === 'motion') AccessibilitySuite.toggleReducedMotion();
            if (feature === 'scale') {
              const nextLevel = (AccessibilitySuite.fontSizeLevel + 1) % 3;
              AccessibilitySuite.setFontSize(nextLevel);
            }
            if (feature === 'voice') AccessibilitySuite.readActiveSection();
          }
        });
      });
    },

    /* ==========================================================================
       SCENE 11: SOUNDLESS VOICE WAVEFORM CINEMA
       ========================================================================== */
    initVoiceWaveformCanvas() {
      const canvas = document.getElementById('voiceWaveformCanvas');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      let width, height;

      const resize = () => {
        width = canvas.width = canvas.clientWidth;
        height = canvas.height = canvas.clientHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      let time = 0;
      let mouseActivity = 0.5;

      canvas.addEventListener('mousemove', () => {
        mouseActivity = 1.4;
      });

      const drawWave = () => {
        if (document.hidden) {
          requestAnimationFrame(drawWave);
          return;
        }

        mouseActivity += (0.6 - mouseActivity) * 0.05;
        time += 0.04;

        ctx.clearRect(0, 0, width, height);

        const bars = 48;
        const barWidth = width / (bars * 1.6);
        const centerY = height / 2;

        for (let i = 0; i < bars; i++) {
          const x = i * (barWidth * 1.6) + barWidth / 2;
          const wave = Math.sin(time + i * 0.2) * Math.cos(time * 0.7 + i * 0.1);
          const barHeight = Math.max(6, Math.abs(wave) * (height * 0.45) * mouseActivity);

          ctx.fillStyle = i % 2 === 0 ? '#00E5FF' : '#00D9A6';
          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 3);
          ctx.fill();
        }

        requestAnimationFrame(drawWave);
      };

      drawWave();
    },

    /* ==========================================================================
       SCENE 13: SCALE TELEMETRY COUNTERS
       ========================================================================== */
    initScaleCounters() {
      if (!window.ScrollTrigger) return;

      const scene = document.getElementById('scene-scale-telemetry');
      if (!scene) return;

      ScrollTrigger.create({
        trigger: scene,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          const c1 = document.getElementById('counterBeneficiaries');
          const c2 = document.getElementById('counterMatches');
          const c3 = document.getElementById('counterOpportunities');

          if (window.MotionEngine) {
            MotionEngine.animateCounter(c1, 250, 1.8, '+');
            MotionEngine.animateCounter(c2, 187, 2.0, '+');
            MotionEngine.animateCounter(c3, 73, 2.2, '+');
          }
        }
      });
    },

    /* ==========================================================================
       SCENE 14: APPLICATION JOURNEY ACTIVATION
       ========================================================================== */
    initApplicationJourney() {
      if (!window.ScrollTrigger) return;

      const scene = document.getElementById('scene-application-journey');
      if (!scene) return;

      const steps = scene.querySelectorAll('.journey-step-node');

      ScrollTrigger.create({
        trigger: scene,
        start: 'top 65%',
        once: true,
        onEnter: () => {
          steps.forEach((step, idx) => {
            setTimeout(() => {
              step.classList.add('active');
            }, idx * 280);
          });
        }
      });
    },

    /* ==========================================================================
       SCENE 16: FINAL CONVERGENCE & MAGNETIC CTA
       ========================================================================== */
    initFinalConvergence() {
      if (!window.gsap || !window.ScrollTrigger) return;

      const scene = document.getElementById('scene-final-statement');
      if (!scene) return;

      gsap.fromTo('.final-massive-statement',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.4,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: scene,
            start: 'top 60%'
          }
        }
      );
    },

    /* ==========================================================================
       EASTER EGGS & KEYBOARD SHORTCUTS
       ========================================================================== */
    monogramClickCount: 0,
    monogramClickTimer: null,

    handleMonogramClick() {
      this.monogramClickCount++;
      clearTimeout(this.monogramClickTimer);
      this.monogramClickTimer = setTimeout(() => {
        this.monogramClickCount = 0;
      }, 1200);

      if (this.monogramClickCount >= 3) {
        this.monogramClickCount = 0;
        const modal = document.getElementById('telemetryTerminalOverlay');
        if (modal) {
          modal.style.display = 'flex';
          if (window.SoundEngine) SoundEngine.playSynthesis();
        }
      }
    },

    bindGlobalShortcuts() {
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'm' || e.key === 'M') {
          if (window.SoundEngine) SoundEngine.toggleSound();
        } else if (e.key === 'h' || e.key === 'H') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (e.key === 'Escape') {
          const modal = document.getElementById('telemetryTerminalOverlay');
          if (modal) modal.style.display = 'none';
        }
      });
    }
  };

  window.CinematicExperience = CinematicExperience;

  const startExperience = () => {
    CinematicExperience.init();
    setTimeout(() => {
      if (window.ScrollTrigger) {
        ScrollTrigger.refresh();
      }
    }, 250);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startExperience);
  } else {
    startExperience();
  }

  window.addEventListener('load', () => {
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  });
})(window, document);
