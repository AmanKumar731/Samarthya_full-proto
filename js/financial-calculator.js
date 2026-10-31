// ============================================
// Samarthya — Financial EMI & Moratorium Calculator
// Targeting SIH26093: Client-side Concessional Credit Projection
// ============================================

const FinancialCalculator = {
  activeScheme: null,
  currentCalculation: null,

  init() {
    this.setupListeners();
  },

  setupListeners() {
    // Will attach dynamically when rendered
  },

  /**
   * Calculate EMI & Loan Schedule
   *
   * @param {number} principal - Loan amount in ₹
   * @param {number} annualRate - Annual interest rate in % (e.g. 7.5)
   * @param {number} tenureMonths - Total loan tenure in months
   * @param {number} moratoriumMonths - Moratorium period in months
   * @param {string} moratoriumMode - 'waived_subsidized' | 'capitalized'
   */
  calculate(principal, annualRate, tenureMonths, moratoriumMonths = 0, moratoriumMode = 'waived_subsidized') {
    const P = Math.max(1000, Number(principal) || 100000);
    const annualR = Math.max(0.1, Number(annualRate) || 7.0);
    const r = annualR / (12 * 100); // monthly interest rate
    const totalTenure = Math.max(6, Number(tenureMonths) || 36);
    const morMonths = Math.min(Math.max(0, Number(moratoriumMonths) || 0), totalTenure - 1);

    // Active repayment tenure (months in which EMI is paid)
    const repaymentMonths = totalTenure - morMonths;

    let effectivePrincipal = P;
    let moratoriumInterestAccrued = 0;

    if (morMonths > 0) {
      // Simple interest during moratorium
      moratoriumInterestAccrued = Math.round(P * r * morMonths);

      if (moratoriumMode === 'capitalized') {
        // Accrued interest is added to principal for subsequent EMI calculation
        effectivePrincipal = P + moratoriumInterestAccrued;
      }
    }

    // Standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    let emi = 0;
    if (repaymentMonths > 0) {
      const pow = Math.pow(1 + r, repaymentMonths);
      emi = Math.round((effectivePrincipal * r * pow) / (pow - 1));
    }

    // Generate month-by-month amortization schedule
    const schedule = [];
    let balance = effectivePrincipal;
    let totalInterestPaid = moratoriumMode === 'capitalized' ? moratoriumInterestAccrued : 0;
    let totalPrincipalPaid = 0;

    // Month-by-month moratorium rows
    for (let m = 1; m <= morMonths; m++) {
      const monthInterest = Math.round(P * r);
      if (moratoriumMode === 'waived_subsidized') {
        // Govt subsidy or interest serviced
        schedule.push({
          month: m,
          isMoratorium: true,
          openingBalance: P,
          emi: 0,
          principalPaid: 0,
          interestPaid: monthInterest,
          closingBalance: P,
          note: 'Moratorium (Zero EMI)'
        });
      } else {
        // Capitalized
        schedule.push({
          month: m,
          isMoratorium: true,
          openingBalance: P,
          emi: 0,
          principalPaid: 0,
          interestPaid: monthInterest,
          closingBalance: P + (monthInterest * m),
          note: 'Moratorium (Interest Capitalized)'
        });
      }
    }

    // Active repayment rows
    for (let m = 1; m <= repaymentMonths; m++) {
      const monthNumber = morMonths + m;
      const opening = balance;
      let interest = Math.round(balance * r);
      let principalPaid = emi - interest;

      // Handle final month balance rounding
      if (m === repaymentMonths || principalPaid > balance) {
        principalPaid = balance;
        emi = principalPaid + interest;
        balance = 0;
      } else {
        balance -= principalPaid;
      }

      totalInterestPaid += interest;
      totalPrincipalPaid += principalPaid;

      schedule.push({
        month: monthNumber,
        isMoratorium: false,
        openingBalance: opening,
        emi: emi,
        principalPaid: principalPaid,
        interestPaid: interest,
        closingBalance: balance,
        note: 'Regular EMI'
      });
    }

    const totalRepayment = effectivePrincipal + (totalInterestPaid - (moratoriumMode === 'capitalized' ? moratoriumInterestAccrued : 0));

    // Commercial market comparison (what private bank / NBFC at 14% would cost)
    const marketRate = 14.0;
    const marketR = marketRate / (12 * 100);
    const marketPow = Math.pow(1 + marketR, totalTenure);
    const marketEmi = Math.round((P * marketR * marketPow) / (marketPow - 1));
    const marketTotalRepayment = marketEmi * totalTenure;
    const concessionSavings = Math.max(0, marketTotalRepayment - totalRepayment);

    this.currentCalculation = {
      principal: P,
      annualRate: annualR,
      totalTenure,
      moratoriumMonths: morMonths,
      moratoriumMode,
      repaymentMonths,
      effectivePrincipal,
      moratoriumInterestAccrued,
      emi,
      totalInterest: totalInterestPaid,
      totalRepayment,
      concessionSavings,
      schedule
    };

    return this.currentCalculation;
  },

  /**
   * Render the interactive Financial Calculator card
   */
  renderCalculatorComponent(scheme, defaultAmount = null) {
    this.activeScheme = scheme || CREDIT_SCHEME_DATABASE[0];
    const s = this.activeScheme;

    const initialAmount = defaultAmount
      ? Math.min(defaultAmount, s.maxAmount)
      : Math.min(s.maxAmount, s.category === 'micro_finance' ? 100000 : s.category === 'term_loan' ? 1500000 : 800000);

    const initialRate = s.indicativeRateMin;
    const initialTenure = s.defaultTenureMonths;
    const initialMoratorium = s.defaultMoratoriumMonths;

    // Run initial calculation
    const calc = this.calculate(initialAmount, initialRate, initialTenure, initialMoratorium, 'waived_subsidized');

    return `
      <div class="calculator-card" id="creditCalculatorWidget">
        <div class="calc-header">
          <div class="calc-badge">
            <span class="pulse-dot"></span>
            <span>NSFDC Concessional Loan Calculator</span>
          </div>
          <h3 class="calc-title">Financial EMI &amp; Moratorium Projection</h3>
          <p class="calc-subtitle">Compute monthly installments, repayment breakdown, and interest subsidy for <strong>${s.name}</strong>.</p>
        </div>

        <div class="calc-grid">
          <!-- Left Column: Sliders & Controls -->
          <div class="calc-controls">
            
            <!-- Scheme Selection -->
            <div class="form-group" style="margin-bottom:18px">
              <label class="form-label" style="font-size:13px">Selected NSFDC Scheme</label>
              <select class="form-select" id="calcSchemeSelect" onchange="FinancialCalculator.handleSchemeChange(this.value)">
                ${CREDIT_SCHEME_DATABASE.map(sc => `
                  <option value="${sc.id}" ${sc.id === s.id ? 'selected' : ''}>
                    ${sc.categoryLabel}: ${sc.name} (Max: ${sc.maxAmountDisplay})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Loan Amount Slider -->
            <div class="form-group" style="margin-bottom:18px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <label class="form-label" style="margin:0;font-size:13px">Loan Amount (Principal)</label>
                <div class="calc-display-val" id="calcAmountDisplay">₹${initialAmount.toLocaleString('en-IN')}</div>
              </div>
              <input type="range" class="form-range" id="calcAmountRange"
                min="20000" max="${s.maxAmount}" step="${s.maxAmount > 500000 ? '25000' : '5000'}"
                value="${initialAmount}" oninput="FinancialCalculator.updateFromControls()">
              <div class="range-labels" style="font-size:11px">
                <span>₹20,000</span>
                <span>Max: ${s.maxAmountDisplay}</span>
              </div>
            </div>

            <!-- Interest Rate Slider -->
            <div class="form-group" style="margin-bottom:18px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <label class="form-label" style="margin:0;font-size:13px">Concessional Interest Rate (% p.a.)</label>
                <div class="calc-display-val" id="calcRateDisplay">${initialRate}%</div>
              </div>
              <input type="range" class="form-range" id="calcRateRange"
                min="${s.indicativeRateMin}" max="${s.indicativeRateMax + 2}" step="0.25"
                value="${initialRate}" oninput="FinancialCalculator.updateFromControls()">
              <div class="range-labels" style="font-size:11px">
                <span>${s.indicativeRateMin}% (Special Concession)</span>
                <span>${s.indicativeRateMax + 2}%</span>
              </div>
            </div>

            <!-- Tenure Slider -->
            <div class="form-group" style="margin-bottom:18px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <label class="form-label" style="margin:0;font-size:13px">Repayment Tenure</label>
                <div class="calc-display-val" id="calcTenureDisplay">${initialTenure} Months (${(initialTenure / 12).toFixed(1)} Yrs)</div>
              </div>
              <input type="range" class="form-range" id="calcTenureRange"
                min="${s.tenureMonthsMin}" max="${s.tenureMonthsMax}" step="6"
                value="${initialTenure}" oninput="FinancialCalculator.updateFromControls()">
              <div class="range-labels" style="font-size:11px">
                <span>${s.tenureMonthsMin} Mo</span>
                <span>${s.tenureMonthsMax} Mo (${s.tenureMonthsMax / 12} Yrs)</span>
              </div>
            </div>

            <!-- Moratorium Period Slider -->
            <div class="form-group" style="margin-bottom:18px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <label class="form-label" style="margin:0;font-size:13px">
                  Moratorium Holiday Period
                  <span style="color:var(--accent-mint);font-size:11px">● Zero EMI</span>
                </label>
                <div class="calc-display-val" id="calcMoratoriumDisplay">${initialMoratorium} Months</div>
              </div>
              <input type="range" class="form-range" id="calcMoratoriumRange"
                min="0" max="${s.moratoriumMonthsMax}" step="1"
                value="${initialMoratorium}" oninput="FinancialCalculator.updateFromControls()">
              <div class="range-labels" style="font-size:11px">
                <span>0 Months</span>
                <span>Max ${s.moratoriumMonthsMax} Months</span>
              </div>
            </div>

            <!-- Moratorium Interest Mode Toggle (Addressing Open Question 2) -->
            <div class="form-group" style="margin-bottom:0;background:rgba(255,255,255,0.03);padding:12px;border-radius:10px;border:1px solid var(--border)">
              <label class="form-label" style="font-size:12px;margin-bottom:6px">Moratorium Interest Policy</label>
              <div style="display:flex;gap:12px">
                <label style="font-size:12px;color:#cbd5e1;cursor:pointer;display:flex;align-items:center;gap:6px">
                  <input type="radio" name="moratoriumPolicy" value="waived_subsidized" checked onchange="FinancialCalculator.updateFromControls()">
                  <span>Interest Waived / Subsidized</span>
                </label>
                <label style="font-size:12px;color:#cbd5e1;cursor:pointer;display:flex;align-items:center;gap:6px">
                  <input type="radio" name="moratoriumPolicy" value="capitalized" onchange="FinancialCalculator.updateFromControls()">
                  <span>Capitalized to Loan</span>
                </label>
              </div>
            </div>

          </div>

          <!-- Right Column: Outputs & Visual Chart -->
          <div class="calc-results-pane">
            <div class="calc-emi-hero">
              <div class="calc-emi-label">Estimated Monthly Installment (EMI)</div>
              <div class="calc-emi-amount" id="calcResultEmi">₹${calc.emi.toLocaleString('en-IN')}</div>
              <div class="calc-emi-note" id="calcResultEmiNote">Payable after ${calc.moratoriumMonths} months moratorium holiday</div>
            </div>

            <div class="calc-stats-grid">
              <div class="calc-stat-item">
                <div class="calc-stat-val" id="calcResultPrincipal">₹${calc.principal.toLocaleString('en-IN')}</div>
                <div class="calc-stat-lbl">Principal Borrowed</div>
              </div>
              <div class="calc-stat-item">
                <div class="calc-stat-val" style="color:#38bdf8" id="calcResultInterest">₹${calc.totalInterest.toLocaleString('en-IN')}</div>
                <div class="calc-stat-lbl">Total Interest (${calc.annualRate}%)</div>
              </div>
              <div class="calc-stat-item">
                <div class="calc-stat-val" style="color:#fbbf24" id="calcResultTotal">₹${calc.totalRepayment.toLocaleString('en-IN')}</div>
                <div class="calc-stat-lbl">Total Repayment Amount</div>
              </div>
              <div class="calc-stat-item">
                <div class="calc-stat-val" style="color:#34d399" id="calcResultSavings">₹${calc.concessionSavings.toLocaleString('en-IN')}</div>
                <div class="calc-stat-lbl">Savings vs Commercial Banks</div>
              </div>
            </div>

            <!-- Visual Proportion Bar -->
            <div style="margin-top:20px">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:4px">
                <span>Principal: <strong style="color:#fff" id="barPrincipalRatio">78%</strong></span>
                <span>Interest: <strong style="color:#38bdf8" id="barInterestRatio">22%</strong></span>
              </div>
              <div class="calc-ratio-bar">
                <div class="calc-bar-fill-principal" id="barFillPrincipal" style="width:78%"></div>
                <div class="calc-bar-fill-interest" id="barFillInterest" style="width:22%"></div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap">
              <button class="btn-sm btn-secondary" onclick="FinancialCalculator.toggleSchedule()" id="btnToggleSchedule">
                📋 View Repayment Schedule
              </button>
              <button class="btn-sm btn-secondary" onclick="FinancialCalculator.downloadScheduleCSV()">
                📥 Export CSV
              </button>
              <button class="btn-sm btn-primary" onclick="ApplicationTracker.trackCreditScheme('${s.id}', ${calc.principal}, ${calc.emi})">
                📂 Track in My Pipeline
              </button>
            </div>
          </div>
        </div>

        <!-- Collapsible Amortization Schedule Table -->
        <div class="calc-schedule-wrap" id="calcScheduleWrap" style="display:none;margin-top:24px;border-top:1px solid var(--border);padding-top:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h4 style="font-size:15px;font-weight:700;color:#fff;margin:0">Month-by-Month Amortization Schedule</h4>
            <span style="font-size:12px;color:var(--accent-mint)">● Showing ${calc.schedule.length} Months Projection</span>
          </div>
          <div class="calc-table-responsive">
            <table class="calc-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Stage</th>
                  <th>Opening (₹)</th>
                  <th>EMI Paid (₹)</th>
                  <th>Principal (₹)</th>
                  <th>Interest (₹)</th>
                  <th>Closing (₹)</th>
                </tr>
              </thead>
              <tbody id="calcScheduleTableBody">
                ${this.renderScheduleRows(calc.schedule)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  renderScheduleRows(schedule) {
    return schedule.map(row => `
      <tr class="${row.isMoratorium ? 'moratorium-row' : ''}">
        <td><strong>#${row.month}</strong></td>
        <td>
          <span class="status-badge ${row.isMoratorium ? 'status-partial' : 'status-likely'}" style="font-size:10px">
            ${row.note}
          </span>
        </td>
        <td>₹${row.openingBalance.toLocaleString('en-IN')}</td>
        <td style="color:${row.emi > 0 ? '#34d399' : '#94a3b8'};font-weight:700">₹${row.emi.toLocaleString('en-IN')}</td>
        <td>₹${row.principalPaid.toLocaleString('en-IN')}</td>
        <td style="color:#38bdf8">₹${row.interestPaid.toLocaleString('en-IN')}</td>
        <td>₹${row.closingBalance.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');
  },

  handleSchemeChange(schemeId) {
    const scheme = CREDIT_SCHEME_DATABASE.find(s => s.id === schemeId);
    if (!scheme) return;
    this.activeScheme = scheme;

    // Adjust amount slider bounds
    const amountRange = document.getElementById('calcAmountRange');
    const rateRange = document.getElementById('calcRateRange');
    const tenureRange = document.getElementById('calcTenureRange');
    const morRange = document.getElementById('calcMoratoriumRange');

    if (amountRange) {
      amountRange.max = scheme.maxAmount;
      amountRange.value = Math.min(amountRange.value, scheme.maxAmount);
    }
    if (rateRange) {
      rateRange.min = scheme.indicativeRateMin;
      rateRange.max = scheme.indicativeRateMax + 2;
      rateRange.value = scheme.indicativeRateMin;
    }
    if (tenureRange) {
      tenureRange.min = scheme.tenureMonthsMin;
      tenureRange.max = scheme.tenureMonthsMax;
      tenureRange.value = scheme.defaultTenureMonths;
    }
    if (morRange) {
      morRange.max = scheme.moratoriumMonthsMax;
      morRange.value = scheme.defaultMoratoriumMonths;
    }

    this.updateFromControls();
  },

  updateFromControls() {
    const amount = Number(document.getElementById('calcAmountRange')?.value || 100000);
    const rate = Number(document.getElementById('calcRateRange')?.value || 7.0);
    const tenure = Number(document.getElementById('calcTenureRange')?.value || 36);
    const moratorium = Number(document.getElementById('calcMoratoriumRange')?.value || 3);
    const policy = document.querySelector('input[name="moratoriumPolicy"]:checked')?.value || 'waived_subsidized';

    // Update labels
    const amountDisp = document.getElementById('calcAmountDisplay');
    if (amountDisp) amountDisp.textContent = `₹${amount.toLocaleString('en-IN')}`;

    const rateDisp = document.getElementById('calcRateDisplay');
    if (rateDisp) rateDisp.textContent = `${rate}%`;

    const tenureDisp = document.getElementById('calcTenureDisplay');
    if (tenureDisp) tenureDisp.textContent = `${tenure} Months (${(tenure / 12).toFixed(1)} Yrs)`;

    const morDisp = document.getElementById('calcMoratoriumDisplay');
    if (morDisp) morDisp.textContent = `${moratorium} Months`;

    // Recalculate
    const calc = this.calculate(amount, rate, tenure, moratorium, policy);

    // Update result cards
    const emiEl = document.getElementById('calcResultEmi');
    if (emiEl) emiEl.textContent = `₹${calc.emi.toLocaleString('en-IN')}`;

    const emiNoteEl = document.getElementById('calcResultEmiNote');
    if (emiNoteEl) {
      emiNoteEl.textContent = calc.moratoriumMonths > 0
        ? `Payable for ${calc.repaymentMonths} months after ${calc.moratoriumMonths} months holiday`
        : `Payable across all ${calc.totalTenure} months`;
    }

    const principalEl = document.getElementById('calcResultPrincipal');
    if (principalEl) principalEl.textContent = `₹${calc.principal.toLocaleString('en-IN')}`;

    const interestEl = document.getElementById('calcResultInterest');
    if (interestEl) interestEl.textContent = `₹${calc.totalInterest.toLocaleString('en-IN')}`;

    const totalEl = document.getElementById('calcResultTotal');
    if (totalEl) totalEl.textContent = `₹${calc.totalRepayment.toLocaleString('en-IN')}`;

    const savingsEl = document.getElementById('calcResultSavings');
    if (savingsEl) savingsEl.textContent = `₹${calc.concessionSavings.toLocaleString('en-IN')}`;

    // Ratio bar
    const total = calc.totalRepayment;
    const pRatio = Math.round((calc.principal / total) * 100) || 75;
    const iRatio = 100 - pRatio;

    const pRatioEl = document.getElementById('barPrincipalRatio');
    if (pRatioEl) pRatioEl.textContent = `${pRatio}%`;

    const iRatioEl = document.getElementById('barInterestRatio');
    if (iRatioEl) iRatioEl.textContent = `${iRatio}%`;

    const pBar = document.getElementById('barFillPrincipal');
    if (pBar) pBar.style.width = `${pRatio}%`;

    const iBar = document.getElementById('barFillInterest');
    if (iBar) iBar.style.width = `${iRatio}%`;

    // Update schedule table
    const tableBody = document.getElementById('calcScheduleTableBody');
    if (tableBody) {
      tableBody.innerHTML = this.renderScheduleRows(calc.schedule);
    }
  },

  toggleSchedule() {
    const wrap = document.getElementById('calcScheduleWrap');
    const btn = document.getElementById('btnToggleSchedule');
    if (!wrap) return;

    const isHidden = wrap.style.display === 'none';
    wrap.style.display = isHidden ? 'block' : 'none';
    if (btn) {
      btn.textContent = isHidden ? '✕ Hide Schedule' : '📋 View Repayment Schedule';
    }
  },

  downloadScheduleCSV() {
    if (!this.currentCalculation) return;
    const c = this.currentCalculation;

    let csv = "Month,Stage,Opening Balance,EMI Paid,Principal Paid,Interest Paid,Closing Balance\n";
    c.schedule.forEach(row => {
      csv += `${row.month},"${row.note}",${row.openingBalance},${row.emi},${row.principalPaid},${row.interestPaid},${row.closingBalance}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `nsfdc_repayment_schedule_${c.principal}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

window.FinancialCalculator = FinancialCalculator;
