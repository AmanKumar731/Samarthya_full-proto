// ============================================
// Samarthya — Credit & Enterprise Matching Engine
// Targeting SIH26093: Rule-Based Evaluation for SC Concessional Loans
// ============================================

const CreditMatcher = {
  /**
   * Main credit matching evaluation
   * Evaluates profile against NSFDC policy matrix and returns ranked recommendations
   */
  match(profile, creditSchemes = CREDIT_SCHEME_DATABASE) {
    const results = [];

    for (const scheme of creditSchemes) {
      const evaluation = this.evaluateScheme(profile, scheme);
      results.push(evaluation);
    }

    // Sort descending by score
    results.sort((a, b) => b.score - a.score);

    return results;
  },

  /**
   * Evaluate a single credit scheme against applicant profile
   * Returns an explainable score (0-100%) with trust factors and missing criteria
   */
  evaluateScheme(profile, scheme) {
    const checks = [];
    let totalWeight = 0;
    let passedWeight = 0;
    const matchedReasons = [];
    const missingReasons = [];

    const isSC = profile.casteCertificate === true || profile.casteCertificate === 'yes';
    const income = Number(profile.householdIncome) || 0;
    const projectCost = Number(profile.projectCost) || 0;
    const purpose = profile.purpose || 'business'; // 'business' or 'education'
    const isEducation = purpose === 'education';

    // =========== CHECK 1: SC Category Verification (Weight: 30) ===========
    {
      const weight = 30;
      totalWeight += weight;
      const passed = isSC;

      if (passed) {
        passedWeight += weight;
        matchedReasons.push('Verified Scheduled Caste (SC) category self-declaration');
      } else {
        missingReasons.push('NSFDC schemes require SC category certificate verification');
      }

      checks.push({
        name: 'SC Category Mandate',
        weight,
        passed,
        detail: passed
          ? 'SC category criteria satisfied'
          : 'Applicant must hold valid SC certificate for concessional credit'
      });
    }

    // =========== CHECK 2: Family Income Ceiling (Weight: 30) ===========
    {
      const weight = 30;
      totalWeight += weight;
      const maxAllowed = scheme.eligibility.maxFamilyIncome; // 5,00,000
      const passed = income > 0 && income <= maxAllowed;

      if (passed) {
        passedWeight += weight;
        matchedReasons.push(`Annual family income (₹${(income / 100000).toFixed(1)}L) is within ≤ ₹5.0L ceiling`);
      } else if (income > maxAllowed) {
        missingReasons.push(`Income ₹${(income / 100000).toFixed(1)}L exceeds statutory ₹5.0 Lakh NSFDC ceiling`);
      } else {
        missingReasons.push('Family income criteria must be declared');
      }

      checks.push({
        name: 'Income Ceiling (≤ ₹5.0 Lakh)',
        weight,
        passed,
        detail: passed
          ? `Income ₹${(income / 100000).toFixed(1)}L within eligible threshold (≤ ₹5L)`
          : `Family income exceeds maximum ₹5.0 Lakh limit for concessional rate`
      });
    }

    // =========== CHECK 3: Purpose & Scheme Compatibility (Weight: 25) ===========
    {
      const weight = 25;
      totalWeight += weight;
      let passed = false;
      let detail = '';

      if (scheme.id === 'nsfdc_education_loan') {
        if (isEducation) {
          passed = true;
          detail = 'Education loan purpose perfectly aligned with academic course';
          matchedReasons.push('Purpose is Education / Higher Studies');
        } else {
          passed = false;
          detail = 'Scheme is dedicated exclusively to higher education courses';
          missingReasons.push('Selected purpose is enterprise/business, not education');
        }
      } else if (scheme.id === 'nsfdc_micro_finance') {
        if (!isEducation && projectCost <= 140000) {
          passed = true;
          detail = `Project cost ₹${projectCost.toLocaleString('en-IN')} fits within Micro Finance cap (≤ ₹1.4L)`;
          matchedReasons.push('Project cost fits Micro Finance limit (≤ ₹1.40 Lakh)');
        } else if (!isEducation && projectCost > 140000) {
          passed = false;
          detail = `Project cost (₹${(projectCost / 100000).toFixed(1)}L) exceeds Micro Finance ₹1.4L cap`;
          missingReasons.push('Project budget exceeds Micro Credit ceiling of ₹1.40 Lakh');
        } else {
          passed = false;
          detail = 'Micro Finance is for business enterprises, not higher education';
          missingReasons.push('Scheme designed for business enterprises');
        }
      } else if (scheme.id === 'nsfdc_term_loan') {
        if (!isEducation && projectCost > 140000 && projectCost <= 5000000) {
          passed = true;
          detail = `Project cost ₹${(projectCost / 100000).toFixed(1)}L is well suited for Term Loan (up to ₹50L)`;
          matchedReasons.push('Project cost matches Term Loan bracket (> ₹1.4L up to ₹50L)');
        } else if (!isEducation && projectCost <= 140000) {
          // Term loan is applicable but micro credit is more optimal
          passed = true;
          passedWeight += Math.round(weight * 0.7); // partial
          detail = 'Eligible for Term Loan, but Micro Finance offers lower processing overhead';
          matchedReasons.push('Eligible for Term Loan (Micro Finance is recommended alternative)');
        } else if (!isEducation && projectCost > 5000000) {
          passed = false;
          detail = `Project cost ₹${(projectCost / 100000).toFixed(1)}L exceeds ₹50L maximum NSFDC term loan`;
          missingReasons.push('Budget exceeds ₹50 Lakh maximum NSFDC term loan ceiling');
        } else {
          passed = false;
          detail = 'Term loan is tailored for business/trade, not higher education';
          missingReasons.push('Scheme designed for enterprise investment');
        }
      }

      if (passed && scheme.id !== 'nsfdc_term_loan' || (passed && projectCost > 140000 && projectCost <= 5000000)) {
        passedWeight += weight;
      }

      checks.push({
        name: 'Purpose & Project Cost Alignment',
        weight,
        passed,
        detail
      });
    }

    // =========== CHECK 4: Project Sector Viability (Weight: 10) ===========
    {
      const weight = 10;
      totalWeight += weight;
      const sector = profile.projectType || 'trade';
      let passed = false;

      if (isEducation) {
        passed = scheme.eligibility.allowedSectors.includes(sector) || sector === 'other' || !sector;
      } else {
        passed = scheme.eligibility.allowedSectors.includes(sector) || sector === 'other' || !sector;
      }

      if (passed) {
        passedWeight += weight;
        matchedReasons.push(`Viable sector: ${this.formatSectorName(sector)}`);
      } else {
        missingReasons.push('Selected sector requires special licensing');
      }

      checks.push({
        name: 'Sector Viability & Activity',
        weight,
        passed,
        detail: passed
          ? `Sector "${this.formatSectorName(sector)}" is supported by Channel Partners`
          : 'Selected sector requires special approval'
      });
    }

    // =========== CHECK 5: State / UT Channel Partner Coverage (Weight: 5) ===========
    {
      const weight = 5;
      totalWeight += weight;
      const state = profile.state || 'all';
      const passed = true; // All states have SCA / PSB channel partners

      passedWeight += weight;
      matchedReasons.push('State covered by accredited Channelizing Partners (SCAs & PSBs)');

      checks.push({
        name: 'Channel Partner Network Availability',
        weight,
        passed,
        detail: 'Active Channel Partners operational in your state'
      });
    }

    // =========== Compute Overall Trust Score ===========
    let score = Math.round((passedWeight / totalWeight) * 100);

    // Hard gating rules:
    // If not SC or Income > 5 Lakh, score drops below threshold
    if (!isSC) {
      score = 0;
    } else if (income > 500000) {
      score = 0;
    } else if (isEducation && scheme.id !== 'nsfdc_education_loan') {
      score = Math.min(score, 20);
    } else if (!isEducation && scheme.id === 'nsfdc_education_loan') {
      score = Math.min(score, 15);
    }

    // Status classification
    let status;
    if (score >= 85) status = 'highly-eligible';
    else if (score >= 60) status = 'likely-eligible';
    else if (score >= 40) status = 'partially-eligible';
    else status = 'not-eligible';

    const isEligible = score >= 60;
    const isAlmostEligible = score >= 40 && score < 60;

    // Recommended Loan Amount Calculation
    let recommendedLoanAmount = projectCost;
    if (scheme.id === 'nsfdc_micro_finance') {
      recommendedLoanAmount = Math.min(projectCost || 100000, scheme.maxAmount);
    } else if (scheme.id === 'nsfdc_term_loan') {
      recommendedLoanAmount = Math.min(projectCost || 1500000, scheme.maxAmount);
    } else if (scheme.id === 'nsfdc_education_loan') {
      recommendedLoanAmount = Math.min(projectCost || 800000, scheme.maxAmount);
    }

    return {
      scheme,
      score,
      status,
      checks,
      matchedReasons,
      missingReasons,
      isEligible,
      isAlmostEligible,
      recommendedLoanAmount,
      profile
    };
  },

  /**
   * Helper: Format sector name for display
   */
  formatSectorName(sectorId) {
    const s = (PROJECT_SECTORS || []).find(p => p.id === sectorId) ||
              (EDUCATION_COURSES || []).find(c => c.id === sectorId);
    return s ? s.label : (sectorId ? sectorId.replace(/_/g, ' ').toUpperCase() : 'General Enterprise');
  },

  /**
   * Find nearest channel partners for a scheme
   */
  getPartnersForScheme(schemeId, userState, includeHighNpa = false) {
    let partners = CHANNEL_PARTNERS_DATABASE.filter(p => {
      const handles = p.schemesHandled.includes(schemeId.replace('nsfdc_', ''));
      const stateMatch = !userState || p.state === userState;
      return handles && stateMatch;
    });

    if (partners.length === 0) {
      // Fallback to all state partners or national partners
      partners = CHANNEL_PARTNERS_DATABASE.filter(p => p.schemesHandled.includes(schemeId.replace('nsfdc_', '')));
    }

    if (!includeHighNpa) {
      // Filter out high-NPA and paused partners by default (Nearest Capable filter)
      partners = partners.filter(p => p.fundHealthStatus === 'healthy');
    }

    return partners;
  }
};

window.CreditMatcher = CreditMatcher;
