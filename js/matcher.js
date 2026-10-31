// ============================================
// Samarthya — Matching Engine
// Rule-based eligibility computation + Explainable Matching Trust Layer
// ============================================

const SamarthyaMatcher = {
  /**
   * Calculate age from a date-of-birth string
   */
  calculateAge(dobString) {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  },

  /**
   * Map education level to a tier for Pre/Post matric filtering
   */
  getEducationTier(level) {
    const preMatric = ['pre_primary', 'primary', 'upper_primary', 'secondary'];
    const postMatric = ['higher_secondary', 'graduate', 'post_graduate', 'professional', 'vocational'];
    if (preMatric.includes(level)) return 'pre_matric';
    if (postMatric.includes(level)) return 'post_matric';
    return 'none';
  },

  /**
   * Calculate days remaining until a deadline
   */
  daysToDeadline(deadlineStr) {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Main matching function — runs profile against every scheme
   * Returns sorted array of results with scores, trust explanations and almost-eligible breakdown
   */
  match(profile, schemes) {
    const results = [];

    for (const scheme of schemes) {
      const result = this.evaluateScheme(profile, scheme);
      if (result.score > 0) {
        results.push(result);
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results;
  },

  /**
   * Evaluate a single scheme against the profile
   * Returns a detailed result object with explainable trust layer
   */
  evaluateScheme(profile, scheme) {
    const e = scheme.eligibility;
    const checks = [];
    let totalWeight = 0;
    let passedWeight = 0;
    const matchedReasons = [];
    const missingReasons = [];

    // =========== CHECK 1: Disability Type (weight: 30) ===========
    {
      const weight = 30;
      totalWeight += weight;
      const schemeDTypes = e.disabilityTypes;
      const profileDTypes = profile.disabilityTypes || ['none'];
      const hasNoDisability = profileDTypes.includes('none');
      let passed;
      let detail;

      if (hasNoDisability) {
        passed = e.disabilityPercentMin === 0;
        detail = passed
          ? 'No disability required for this scheme'
          : 'This scheme requires a disability certificate';
      } else {
        const intersection = profileDTypes.filter(d => schemeDTypes.includes(d));
        passed = intersection.length > 0;
        detail = passed
          ? `Matched: ${intersection.map(d => this.getDisabilityLabel(d)).join(', ')}`
          : `Requires covered category (${schemeDTypes.slice(0, 3).map(d => this.getDisabilityLabel(d)).join(', ')})`;
      }

      if (passed) {
        passedWeight += weight;
        matchedReasons.push(`Disability Type matches scheme criteria`);
      } else {
        missingReasons.push(`Disability Type not covered`);
      }

      checks.push({
        name: 'Disability Type Match',
        weight,
        passed,
        detail,
      });
    }

    // =========== CHECK 2: Disability Percentage (weight: 20) ===========
    {
      const weight = 20;
      totalWeight += weight;
      const required = e.disabilityPercentMin;
      const passed = (profile.disabilityPercent || 0) >= required;

      if (passed) {
        passedWeight += weight;
        matchedReasons.push(`Disability ${profile.disabilityPercent}% ≥ min required ${required}%`);
      } else {
        missingReasons.push(`Requires min ${required}% disability (you have ${profile.disabilityPercent}%)`);
      }

      checks.push({
        name: 'Disability Percentage',
        weight,
        passed,
        detail: passed
          ? `Your ${profile.disabilityPercent}% ≥ required ${required}%`
          : `Your ${profile.disabilityPercent}% < required minimum ${required}%`
      });
    }

    // =========== CHECK 3: Education Level (weight: 15) ===========
    {
      const weight = 15;
      totalWeight += weight;
      const allowedLevels = e.educationLevels;
      let passed;

      if (allowedLevels === 'all') {
        passed = true;
      } else {
        passed = allowedLevels.includes(profile.educationLevel);
      }

      if (passed) {
        passedWeight += weight;
        matchedReasons.push(`Education tier "${this.getEducationLabel(profile.educationLevel)}" eligible`);
      } else {
        missingReasons.push(`Education level not eligible for this tier`);
      }

      checks.push({
        name: 'Education Level',
        weight,
        passed,
        detail: passed
          ? `Current level "${this.getEducationLabel(profile.educationLevel)}" is eligible`
          : `Level "${this.getEducationLabel(profile.educationLevel)}" not eligible.`
      });
    }

    // =========== CHECK 4: Income Ceiling (weight: 15) ===========
    {
      const weight = 15;
      totalWeight += weight;
      const maxIncome = e.maxIncome;
      const passed = (profile.householdIncome || 0) <= maxIncome;

      if (passed) {
        passedWeight += weight;
        matchedReasons.push(maxIncome >= 9999999 ? 'No income ceiling constraint' : `Income < ₹${(maxIncome / 100000).toFixed(1)}L limit`);
      } else {
        missingReasons.push(`Income ₹${((profile.householdIncome || 0) / 100000).toFixed(1)}L exceeds ₹${(maxIncome / 100000).toFixed(1)}L ceiling`);
      }

      const incomeStr = maxIncome >= 9999999 ? 'No limit' : `₹${(maxIncome / 100000).toFixed(1)} lakh`;

      checks.push({
        name: 'Income Eligibility',
        weight,
        passed,
        detail: passed
          ? `Income within limit (Max: ${incomeStr})`
          : `Income exceeds maximum ${incomeStr}`
      });
    }

    // =========== CHECK 5: Age Range (weight: 10) ===========
    {
      const weight = 10;
      totalWeight += weight;
      const [minAge, maxAge] = e.ageRange;
      const userAge = profile.age || 20;
      const passed = userAge >= minAge && userAge <= maxAge;

      if (passed) {
        passedWeight += weight;
        matchedReasons.push(`Age ${userAge} is within ${minAge}-${maxAge} yrs`);
      } else {
        missingReasons.push(`Age ${userAge} outside allowed range (${minAge}-${maxAge} yrs)`);
      }

      checks.push({
        name: 'Age Range',
        weight,
        passed,
        detail: passed
          ? `Age ${userAge} is within ${minAge}-${maxAge} years`
          : `Age ${userAge} is outside required range (${minAge}-${maxAge})`
      });
    }

    // =========== CHECK 6: Gender (weight: 5) ===========
    {
      const weight = 5;
      totalWeight += weight;
      const passed = e.gender === 'all' || e.gender === profile.gender;

      if (passed) {
        passedWeight += weight;
      } else {
        missingReasons.push(`Scheme is for ${e.gender} beneficiaries only`);
      }

      checks.push({
        name: 'Gender Eligibility',
        weight,
        passed,
        detail: passed ? 'Gender criteria met' : `Scheme is for ${e.gender} only`
      });
    }

    // =========== CHECK 7: State (weight: 5) ===========
    {
      const weight = 5;
      totalWeight += weight;
      let passed;

      if (e.states === 'all') {
        passed = true;
      } else {
        passed = e.states.includes(profile.state);
      }

      if (passed) {
        passedWeight += weight;
        matchedReasons.push(e.states === 'all' ? 'All-India Central Coverage' : 'State coverage verified');
      } else {
        missingReasons.push(`State-specific scheme (not available in ${profile.state})`);
      }

      checks.push({
        name: 'State/UT Coverage',
        weight,
        passed,
        detail: passed ? 'Your state is covered' : `Scheme not available in your state`
      });
    }

    // =========== Compute Score ===========
    const score = Math.round((passedWeight / totalWeight) * 100);

    // Status classification
    let status;
    if (score >= 85) status = 'highly-eligible';
    else if (score >= 65) status = 'likely-eligible';
    else if (score >= 40) status = 'partially-eligible';
    else status = 'low-match';

    // Almost eligible flag
    const isAlmostEligible = score >= 45 && score < 85 && missingReasons.length <= 2;

    // Deadline urgency
    const daysLeft = this.daysToDeadline(scheme.deadline);
    const isUrgent = daysLeft > 0 && daysLeft <= 60;

    // Required documents
    const requiredDocuments = scheme.requiredDocuments || [];

    return {
      scheme,
      score,
      status,
      checks,
      matchedReasons,
      missingReasons,
      isAlmostEligible,
      daysToDeadline: daysLeft,
      isUrgent,
      requiredDocuments,
    };
  },

  /**
   * Get stats summary from results
   */
  getStats(results) {
    const total = results.length;
    const highlyEligible = results.filter(r => r.status === 'highly-eligible').length;
    const almostEligible = results.filter(r => r.isAlmostEligible).length;
    const urgent = results.filter(r => r.isUrgent).length;
    const avgScore = total > 0
      ? (results.reduce((sum, r) => sum + r.score, 0) / total).toFixed(1)
      : '0.0';

    // Category breakdown
    const categories = {};
    results.forEach(r => {
      const cat = r.scheme.category;
      categories[cat] = (categories[cat] || 0) + 1;
    });

    return { total, highlyEligible, almostEligible, urgent, avgScore, categories };
  },

  /**
   * Helper: Get disability label
   */
  getDisabilityLabel(id) {
    const found = DISABILITY_TYPES.find(d => d.id === id);
    return found ? found.label : id;
  },

  /**
   * Helper: Get education level label
   */
  getEducationLabel(id) {
    const found = EDUCATION_LEVELS.find(e => e.id === id);
    return found ? found.label : id;
  },

  /**
   * Open Rule Engine AST Inspector Modal
   */
  openRuleInspector(schemeId) {
    const scheme = SCHEME_DATABASE.find(s => s.id === schemeId);
    if (!scheme) return;
    const profile = App.profile || {
      name: 'Sample Student',
      age: 21,
      gender: 'male',
      state: 'uttar_pradesh',
      disabilityTypes: ['locomotor_disability'],
      disabilityPercent: 50,
      educationLevel: 'graduate',
      householdIncome: 150000
    };

    const evaluation = this.evaluateScheme(profile, scheme);

    App.openModal(`
      <div style="padding:10px">
        <div class="modal-header">
          <div>
            <span class="status-badge status-likely">Rule AST Inspector</span>
            <h3 style="font-size:18px;font-weight:700;color:#fff;margin:4px 0 0">${scheme.name}</h3>
            <p style="font-size:12px;color:#94a3b8;margin:0">Deterministic Boolean Rule Evaluation Tree</p>
          </div>
          <button class="modal-close" onclick="App.closeModal()">✕</button>
        </div>

        <div style="margin:16px 0">
          <div class="rule-tree-container">
            <div><strong>ROOT_NODE: EVALUATE_SCHEME [Score: ${evaluation.score}%]</strong></div>
            <div class="rule-node">
              <div>├─ <strong>DISABILITY_MATCH (Weight: 30%)</strong> -> [${evaluation.checks[0].passed ? 'TRUE' : 'FALSE'}]</div>
              <div style="color:#94a3b8;font-size:11px">│  └─ Types: [${scheme.eligibility.disabilityTypes.slice(0, 3).join(', ')}]</div>
            </div>
            <div class="rule-node">
              <div>├─ <strong>PERCENT_THRESHOLD (Weight: 20%)</strong> -> [${evaluation.checks[1].passed ? 'TRUE' : 'FALSE'}]</div>
              <div style="color:#94a3b8;font-size:11px">│  └─ Required: ≥ ${scheme.eligibility.disabilityPercentMin}%, Evaluated: ${profile.disabilityPercent}%</div>
            </div>
            <div class="rule-node">
              <div>├─ <strong>EDUCATION_TIER (Weight: 15%)</strong> -> [${evaluation.checks[2].passed ? 'TRUE' : 'FALSE'}]</div>
              <div style="color:#94a3b8;font-size:11px">│  └─ Allowed: ${scheme.eligibility.educationLevels === 'all' ? 'ALL' : scheme.eligibility.educationLevels.join(', ')}</div>
            </div>
            <div class="rule-node">
              <div>├─ <strong>INCOME_CEILING (Weight: 15%)</strong> -> [${evaluation.checks[3].passed ? 'TRUE' : 'FALSE'}]</div>
              <div style="color:#94a3b8;font-size:11px">│  └─ Max: ₹${scheme.eligibility.maxIncome}, User: ₹${profile.householdIncome}</div>
            </div>
            <div class="rule-node">
              <div>├─ <strong>AGE_INTERVAL (Weight: 10%)</strong> -> [${evaluation.checks[4].passed ? 'TRUE' : 'FALSE'}]</div>
              <div style="color:#94a3b8;font-size:11px">│  └─ Range: [${scheme.eligibility.ageRange[0]} - ${scheme.eligibility.ageRange[1]} yrs]</div>
            </div>
            <div class="rule-node">
              <div>└─ <strong>STATE_DOMICILE (Weight: 5%)</strong> -> [${evaluation.checks[6].passed ? 'TRUE' : 'FALSE'}]</div>
            </div>
          </div>
        </div>

        <button class="btn btn-primary" onclick="App.closeModal()" style="width:100%;justify-content:center">
          Close Inspector
        </button>
      </div>
    `);
  }
};
