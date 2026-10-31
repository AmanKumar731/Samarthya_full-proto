// ============================================
// Samarthya — NGO & DIC / SC-ST Hub Camp Mode
// Feature 6: Bulk Beneficiary & Entrepreneur Credit Evaluation
// ============================================

const NGOMode = {
  currentMode: 'disability', // 'disability' | 'entrepreneur'
  campStudents: [],
  batchResults: [],
  campEntrepreneurs: [],
  entrepreneurBatchResults: [],

  demoDataset: [
    { name: 'Aarav Gupta', dob: '2005-04-12', gender: 'male', state: 'uttar_pradesh', disabilityType: 'locomotor_disability', percent: 60, education: 'higher_secondary', income: 120000 },
    { name: 'Meera Sharma', dob: '2003-08-20', gender: 'female', state: 'delhi', disabilityType: 'blindness', percent: 80, education: 'graduate', income: 80000 },
    { name: 'Kavita Patel', dob: '2007-02-15', gender: 'female', state: 'gujarat', disabilityType: 'deaf', percent: 50, education: 'secondary', income: 150000 },
    { name: 'Rohan Deshmukh', dob: '2004-11-09', gender: 'male', state: 'maharashtra', disabilityType: 'intellectual_disability', percent: 45, education: 'vocational', income: 60000 },
    { name: 'Pooja Reddy', dob: '2002-06-30', gender: 'female', state: 'telangana', disabilityType: 'cerebral_palsy', percent: 70, education: 'post_graduate', income: 200000 },
    { name: 'Vikram Singh', dob: '2006-09-18', gender: 'male', state: 'rajasthan', disabilityType: 'autism_spectrum_disorder', percent: 55, education: 'secondary', income: 90000 },
    { name: 'Ananya Roy', dob: '2004-03-22', gender: 'female', state: 'west_bengal', disabilityType: 'low_vision', percent: 40, education: 'graduate', income: 110000 },
    { name: 'Deepak Kumar', dob: '2001-12-05', gender: 'male', state: 'bihar', disabilityType: 'locomotor_disability', percent: 65, education: 'professional', income: 140000 },
    { name: 'Sneha Nair', dob: '2005-07-14', gender: 'female', state: 'kerala', disabilityType: 'hard_of_hearing', percent: 45, education: 'higher_secondary', income: 180000 },
    { name: 'Manish Verma', dob: '2008-01-28', gender: 'male', state: 'madhya_pradesh', disabilityType: 'mental_illness', percent: 50, education: 'upper_primary', income: 75000 },
    { name: 'Farhan Ali', dob: '2003-10-10', gender: 'male', state: 'karnataka', disabilityType: 'muscular_dystrophy', percent: 75, education: 'graduate', income: 160000 },
    { name: 'Divya Joshi', dob: '2006-05-19', gender: 'female', state: 'uttarakhand', disabilityType: 'multiple_disabilities', percent: 85, education: 'higher_secondary', income: 95000 }
  ],

  demoEntrepreneurDataset: [
    { name: 'Rameshwar Paswan', state: 'bihar', gender: 'male', scCertificate: true, purpose: 'business', sector: 'trade', cost: 120000, income: 150000, projectDesc: 'Grain & Grocery Mart' },
    { name: 'Sunita Gautam', state: 'uttar_pradesh', gender: 'female', scCertificate: true, purpose: 'business', sector: 'service', cost: 95000, income: 110000, projectDesc: 'Ladies Beauty & Tailoring' },
    { name: 'Amit Kumar Valmiki', state: 'delhi', gender: 'male', scCertificate: true, purpose: 'business', sector: 'service', cost: 450000, income: 240000, projectDesc: 'EV Delivery Fleet & Logistics' },
    { name: 'Priya Vankar', state: 'gujarat', gender: 'female', scCertificate: true, purpose: 'business', sector: 'manufacturing', cost: 1800000, income: 320000, projectDesc: 'Textile Weaving & Garments' },
    { name: 'Sanjay Meghwal', state: 'rajasthan', gender: 'male', scCertificate: true, purpose: 'business', sector: 'agri_allied', cost: 650000, income: 180000, projectDesc: 'Dairy Farming & Chilling Unit' },
    { name: 'Dr. Anand Kamble', state: 'maharashtra', gender: 'male', scCertificate: true, purpose: 'business', sector: 'service', cost: 2800000, income: 420000, projectDesc: 'Diagnostic Pathology Lab' },
    { name: 'Kavita Adidravidar', state: 'tamil_nadu', gender: 'female', scCertificate: true, purpose: 'education', sector: 'medical', cost: 1500000, income: 280000, projectDesc: 'MD General Medicine' },
    { name: 'Rahul Jatav', state: 'madhya_pradesh', gender: 'male', scCertificate: true, purpose: 'business', sector: 'manufacturing', cost: 850000, income: 210000, projectDesc: 'Bio-Fertilizer Packaging' },
    { name: 'Meenakshi Koli', state: 'karnataka', gender: 'female', scCertificate: true, purpose: 'education', sector: 'engineering', cost: 750000, income: 190000, projectDesc: 'B.Tech Computer Science' },
    { name: 'Rajesh Biswas', state: 'west_bengal', gender: 'male', scCertificate: true, purpose: 'business', sector: 'trade', cost: 140000, income: 130000, projectDesc: 'Hardware & Solar Accessories' },
    { name: 'Sunil Rao Madiga', state: 'telangana', gender: 'male', scCertificate: true, purpose: 'business', sector: 'service', cost: 1250000, income: 360000, projectDesc: 'Automobile Repair & Spares' },
    { name: 'Pooja Sonkar', state: 'uttar_pradesh', gender: 'female', scCertificate: true, purpose: 'business', sector: 'agri_allied', cost: 110000, income: 95000, projectDesc: 'Poultry Farm & Feed Unit' }
  ],

  init() {
    this.loadDemoBatch();
  },

  setMode(mode) {
    this.currentMode = mode;
    this.renderNGODashboard();
  },

  loadDemoBatch() {
    this.campStudents = [...this.demoDataset];
    this.campEntrepreneurs = [...this.demoEntrepreneurDataset];
    this.processBatch();
    this.processEntrepreneurBatch();
  },

  processBatch() {
    this.batchResults = this.campStudents.map(student => {
      const profile = {
        name: student.name,
        dob: student.dob,
        age: SamarthyaMatcher.calculateAge(student.dob),
        gender: student.gender,
        state: student.state,
        disabilityTypes: [student.disabilityType],
        disabilityPercent: student.percent,
        educationLevel: student.education,
        householdIncome: student.income
      };
      const matches = SamarthyaMatcher.match(profile, SCHEME_DATABASE);
      const topMatches = matches.slice(0, 4);

      let totalEstCash = 0;
      topMatches.forEach(m => {
        const amtStr = m.scheme.benefits.amount || '';
        const matchNum = amtStr.match(/₹([\d,]+)/);
        if (matchNum) {
          totalEstCash += parseInt(matchNum[1].replace(/,/g, ''));
        }
      });
      if (totalEstCash === 0) totalEstCash = 35000;

      return {
        student,
        profile,
        matches,
        topMatches,
        estimatedCash: totalEstCash
      };
    });

    if (this.currentMode === 'disability') {
      this.renderNGODashboard();
    }
  },

  processEntrepreneurBatch() {
    if (!window.CreditMatcher) return;

    this.entrepreneurBatchResults = this.campEntrepreneurs.map(ent => {
      const profile = {
        name: ent.name,
        casteCertificate: ent.scCertificate,
        state: ent.state,
        gender: ent.gender,
        purpose: ent.purpose,
        projectType: ent.sector,
        projectCost: ent.cost,
        householdIncome: ent.income
      };

      const results = CreditMatcher.match(profile, CREDIT_SCHEME_DATABASE);
      const bestMatch = results[0] || null;

      return {
        entrepreneur: ent,
        profile,
        results,
        bestMatch,
        loanAmount: bestMatch ? bestMatch.recommendedLoanAmount : ent.cost
      };
    });

    if (this.currentMode === 'entrepreneur') {
      this.renderNGODashboard();
    }
  },

  handleCSVUpload(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('CSV appears empty or has only header.');
        return;
      }

      if (this.currentMode === 'entrepreneur') {
        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 6) {
            parsed.push({
              name: cols[0] || `Entrepreneur ${i}`,
              state: cols[1] || 'uttar_pradesh',
              gender: cols[2] || 'male',
              scCertificate: cols[3]?.toLowerCase() === 'yes' || cols[3] === 'true',
              purpose: cols[4]?.toLowerCase() === 'education' ? 'education' : 'business',
              sector: cols[5] || 'trade',
              cost: parseInt(cols[6]) || 150000,
              income: parseInt(cols[7]) || 180000,
              projectDesc: cols[8] || 'Self-Employment Venture'
            });
          }
        }
        if (parsed.length > 0) {
          this.campEntrepreneurs = parsed;
          this.processEntrepreneurBatch();
          alert(`✓ Loaded ${parsed.length} SC entrepreneur records from CSV successfully!`);
        }
      } else {
        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 7) {
            parsed.push({
              name: cols[0] || `Student ${i}`,
              dob: cols[1] || '2004-01-01',
              gender: cols[2] || 'male',
              state: cols[3] || 'uttar_pradesh',
              disabilityType: cols[4] || 'locomotor_disability',
              percent: parseInt(cols[5]) || 40,
              education: cols[6] || 'graduate',
              income: parseInt(cols[7]) || 150000
            });
          }
        }
        if (parsed.length > 0) {
          this.campStudents = parsed;
          this.processBatch();
          alert(`✓ Loaded ${parsed.length} student records from CSV successfully!`);
        }
      }
    };
    reader.readAsText(file);
  },

  downloadTemplate() {
    if (this.currentMode === 'entrepreneur') {
      const header = "Name,State,Gender,SCCertificate(Yes/No),Purpose(business/education),Sector,ProjectCost,AnnualIncome,ProjectDescription\n";
      const sample = "Sunil Kumar,delhi,male,Yes,business,trade,120000,180000,Grocery Store\n" +
                     "Rekha Kumari,uttar_pradesh,female,Yes,business,service,80000,120000,Beauty Salon\n" +
                     "Amit Gautam,maharashtra,male,Yes,education,engineering,800000,240000,B.Tech Degree\n";
      const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "dic_sc_hub_camp_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const header = "Name,DOB,Gender,State,DisabilityType,Percent,Education,AnnualIncome\n";
      const sample = "Sunita Sharma,2003-05-14,female,uttar_pradesh,locomotor_disability,55,graduate,150000\n" +
                     "Rahul Verma,2005-09-20,male,delhi,blindness,75,higher_secondary,100000\n";
      const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "samarthya_ngo_camp_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  exportBatchCSV() {
    if (this.currentMode === 'entrepreneur') {
      let csv = "Entrepreneur Name,State,Gender,Purpose,Sector,Project Cost,Matched NSFDC Scheme,Eligible Loan,Rate,Match Score,Status\n";
      this.entrepreneurBatchResults.forEach(r => {
        const sName = r.bestMatch ? r.bestMatch.scheme.name.replace(/,/g, ' ') : 'None';
        const rate = r.bestMatch ? r.bestMatch.scheme.indicativeRateDisplay : 'N/A';
        const score = r.bestMatch ? r.bestMatch.score : 0;
        const status = r.bestMatch ? r.bestMatch.status : 'not-eligible';
        csv += `"${r.entrepreneur.name}","${r.entrepreneur.state}","${r.entrepreneur.gender}","${r.entrepreneur.purpose}","${r.entrepreneur.sector}",₹${r.entrepreneur.cost},"${sName}",₹${r.loanAmount},"${rate}",${score}%,${status}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `dic_sc_hub_credit_batch_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      let csv = "Student Name,Age,Gender,State,Disability,Percent,Matched Schemes Count,Top Scheme,Est Benefit Value\n";
      this.batchResults.forEach(r => {
        const topScheme = r.topMatches[0] ? r.topMatches[0].scheme.name.replace(/,/g, ' ') : 'None';
        csv += `"${r.student.name}",${r.profile.age},"${r.student.gender}","${r.student.state}","${r.student.disabilityType}",${r.student.percent}%,${r.matches.length},"${topScheme}","₹${r.estimatedCash.toLocaleString('en-IN')}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `ngo_camp_batch_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  renderNGODashboard() {
    const statsContainer = document.getElementById('ngoStatsContainer');
    const tableBody = document.getElementById('ngoStudentTableBody');
    const tableHead = document.querySelector('.ngo-table thead tr');
    const campBannerText = document.getElementById('campBannerActiveBatch');
    const campEngineText = document.getElementById('campBannerEngine');
    const tabDisabilityBtn = document.getElementById('campTabDisability');
    const tabEntrepreneurBtn = document.getElementById('campTabEntrepreneur');

    if (!statsContainer || !tableBody) return;

    if (tabDisabilityBtn && tabEntrepreneurBtn) {
      tabDisabilityBtn.classList.toggle('active', this.currentMode === 'disability');
      tabEntrepreneurBtn.classList.toggle('active', this.currentMode === 'entrepreneur');
    }

    if (this.currentMode === 'entrepreneur') {
      if (campBannerText) campBannerText.textContent = 'Active Drive: National SC-ST Hub & DIC Special Credit Camp 2026';
      if (campEngineText) campEngineText.textContent = 'Evaluation Engine: NSFDC Concessional Channel Finance Matrix';

      if (tableHead) {
        tableHead.innerHTML = `
          <th>#</th>
          <th>Entrepreneur &amp; Domicile</th>
          <th>Venture / Course Details</th>
          <th>Recommended NSFDC Scheme</th>
          <th>Project Cost</th>
          <th>Eligible Concessional Loan</th>
          <th>Action</th>
        `;
      }

      const totalEnt = this.entrepreneurBatchResults.length;
      const totalCreditMobilization = this.entrepreneurBatchResults.reduce((sum, r) => sum + (r.loanAmount || 0), 0);
      const eligibleCount = this.entrepreneurBatchResults.filter(r => r.bestMatch && r.bestMatch.isEligible).length;

      statsContainer.innerHTML = `
        <div class="ngo-stat-box">
          <div class="ngo-stat-num" style="color:#818cf8">${totalEnt}</div>
          <div class="ngo-stat-desc">💼 SC Entrepreneurs Evaluated</div>
        </div>
        <div class="ngo-stat-box">
          <div class="ngo-stat-num" style="color:#34d399">₹${(totalCreditMobilization / 100000).toFixed(1)} Lakhs</div>
          <div class="ngo-stat-desc">💰 Total Concessional Credit Potential</div>
        </div>
        <div class="ngo-stat-box">
          <div class="ngo-stat-num" style="color:#38bdf8">${eligibleCount} / ${totalEnt}</div>
          <div class="ngo-stat-desc">🎯 100% Policy-Eligible Applications</div>
        </div>
        <div class="ngo-stat-box">
          <div class="ngo-stat-num" style="color:#fbbf24">6.5% – 8.0%</div>
          <div class="ngo-stat-desc">⚡ Avg Concessional Interest Rate</div>
        </div>
      `;

      tableBody.innerHTML = this.entrepreneurBatchResults.map((r, i) => {
        const m = r.bestMatch;
        const schemeName = m ? m.scheme.name : 'Not Eligible (Income > ₹5L or Non-SC)';
        const score = m ? m.score : 0;
        const rateDisplay = m ? m.scheme.indicativeRateDisplay : 'N/A';

        return `
          <tr>
            <td><strong>#${i + 1}</strong></td>
            <td>
              <div style="font-weight:700;color:#fff">${r.entrepreneur.name}</div>
              <div style="font-size:11px;color:#94a3b8">${r.entrepreneur.gender}, SC Verified • ${r.entrepreneur.state.replace(/_/g, ' ')}</div>
            </td>
            <td>
              <span style="font-weight:600;color:#818cf8">${r.entrepreneur.projectDesc || r.entrepreneur.sector}</span>
              <div style="font-size:11px;color:#cbd5e1">Income: ₹${(r.entrepreneur.income / 100000).toFixed(1)}L/yr</div>
            </td>
            <td>
              <div style="font-weight:700;color:#fff;font-size:13px">${m ? m.scheme.categoryLabel : 'N/A'}</div>
              <div style="font-size:11px;color:#34d399">● ${score}% Match Fit • ${rateDisplay}</div>
            </td>
            <td>
              <span style="font-size:13px;color:#cbd5e1">₹${r.entrepreneur.cost.toLocaleString('en-IN')}</span>
            </td>
            <td>
              <strong style="color:#34d399;font-size:14px">₹${r.loanAmount.toLocaleString('en-IN')}</strong>
            </td>
            <td>
              <button class="btn-sm btn-secondary" onclick="NGOMode.showEntrepreneurDetail(${i})">View Slip</button>
            </td>
          </tr>
        `;
      }).join('');

    } else {
      // Disability Mode (Standard)
      if (campBannerText) campBannerText.textContent = 'Active Camp Batch: National Inclusive Drive 2026';
      if (campEngineText) campEngineText.textContent = 'Evaluation Engine: Samarthya 50+ Policy Matrix';

      if (tableHead) {
        tableHead.innerHTML = `
          <th>#</th>
          <th>Student &amp; Domicile</th>
          <th>Disability &amp; Severity</th>
          <th>Matched Schemes</th>
          <th>Top Matched Entitlements</th>
          <th>Est. Benefit</th>
          <th>Action</th>
        `;
      }

      const totalStudents = this.batchResults.length;
      const totalPotentialGrants = this.batchResults.reduce((sum, r) => sum + r.estimatedCash, 0);
      const avgSchemesPerStudent = totalStudents > 0
        ? (this.batchResults.reduce((sum, r) => sum + r.matches.length, 0) / totalStudents).toFixed(1)
        : 0;

      statsContainer.innerHTML = `
        <div class="ngo-stat-box">
          <div class="ngo-stat-num" style="color:#38bdf8">${totalStudents}</div>
          <div class="ngo-stat-desc">👥 Students in Current Camp Batch</div>
        </div>
        <div class="ngo-stat-box">
          <div class="ngo-stat-num" style="color:#34d399">₹${(totalPotentialGrants / 100000).toFixed(1)} Lakhs</div>
          <div class="ngo-stat-desc">💰 Cumulative Potential Welfare Entitlements</div>
        </div>
        <div class="ngo-stat-box">
          <div class="ngo-stat-num" style="color:#a855f7">${avgSchemesPerStudent}</div>
          <div class="ngo-stat-desc">🎯 Average Schemes Matched per Student</div>
        </div>
        <div class="ngo-stat-box">
          <div class="ngo-stat-num" style="color:#fbbf24">100%</div>
          <div class="ngo-stat-desc">⚡ Direct Benefit Transfer (DBT) Readiness</div>
        </div>
      `;

      tableBody.innerHTML = this.batchResults.map((r, i) => {
        const topPills = r.topMatches.slice(0, 2).map(m => `
          <span class="status-badge status-likely" style="font-size:11px;margin-right:4px;margin-bottom:2px;display:inline-block">
            ${m.scheme.name.slice(0, 26)}... (${m.score}%)
          </span>
        `).join('');

        return `
          <tr>
            <td><strong>#${i + 1}</strong></td>
            <td>
              <div style="font-weight:700;color:#fff">${r.student.name}</div>
              <div style="font-size:11px;color:#94a3b8">${r.student.gender}, ${r.profile.age} yrs • ${r.student.state.replace(/_/g, ' ')}</div>
            </td>
            <td>
              <span style="font-weight:600;color:#38bdf8">${r.student.disabilityType.replace(/_/g, ' ')}</span>
              <div style="font-size:11px;color:#cbd5e1">${r.student.percent}% certified</div>
            </td>
            <td>
              <span style="font-size:14px;font-weight:800;color:#34d399">${r.matches.length} schemes</span>
            </td>
            <td>
              <div style="display:flex;flex-direction:column;gap:4px">${topPills}</div>
            </td>
            <td>
              <strong style="color:#fcd34d">₹${r.estimatedCash.toLocaleString('en-IN')}</strong>
            </td>
            <td>
              <button class="btn-sm btn-secondary" onclick="NGOMode.showStudentDetail(${i})">View Match Slip</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  },

  showStudentDetail(index) {
    const item = this.batchResults[index];
    if (!item) return;

    const schemesList = item.topMatches.map(m => `
      <div style="padding:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong style="color:#fff">${m.scheme.name}</strong>
          <span style="color:#34d399;font-weight:800">${m.score}% Match</span>
        </div>
        <div style="font-size:12px;color:#38bdf8;margin:2px 0">Benefit: ${m.scheme.benefits.amount}</div>
        <div style="font-size:11px;color:#94a3b8">${m.scheme.benefits.description}</div>
      </div>
    `).join('');

    App.openModal(`
      <div style="padding:10px">
        <div class="modal-header">
          <div>
            <span class="ngo-badge-tag">Camp Beneficiary Match Slip</span>
            <h3 style="font-size:18px;font-weight:700;color:#fff;margin:6px 0 2px">${item.student.name}</h3>
            <p style="font-size:12px;color:#94a3b8;margin:0">${item.student.state} • ${item.student.disabilityType} (${item.student.percent}%)</p>
          </div>
          <button class="modal-close" onclick="App.closeModal()">✕</button>
        </div>

        <div style="margin:16px 0">
          <h4 style="font-size:14px;color:#fff;margin-bottom:10px">Top Eligible Schemes (${item.matches.length} total matched):</h4>
          ${schemesList}
        </div>

        <div style="display:flex;gap:10px;margin-top:16px">
          <button class="btn btn-secondary" onclick="window.print()" style="flex:1;justify-content:center">
            🖨️ Print Beneficiary Slip
          </button>
          <button class="btn btn-primary" onclick="App.closeModal()" style="flex:1;justify-content:center">
            Done
          </button>
        </div>
      </div>
    `);
  },

  showEntrepreneurDetail(index) {
    const item = this.entrepreneurBatchResults[index];
    if (!item) return;
    const m = item.bestMatch;

    App.openModal(`
      <div style="padding:10px">
        <div class="modal-header">
          <div>
            <span class="ngo-badge-tag" style="background:rgba(99,102,241,0.2);color:#818cf8;border-color:rgba(99,102,241,0.4)">
              DIC / SC-ST Hub Credit Recommendation Slip
            </span>
            <h3 style="font-size:18px;font-weight:700;color:#fff;margin:6px 0 2px">${item.entrepreneur.name}</h3>
            <p style="font-size:12px;color:#94a3b8;margin:0">${item.entrepreneur.state} • ${item.entrepreneur.projectDesc} (Cost: ₹${item.entrepreneur.cost.toLocaleString('en-IN')})</p>
          </div>
          <button class="modal-close" onclick="App.closeModal()">✕</button>
        </div>

        <div style="margin:16px 0">
          <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:10px;border:1px solid var(--border);margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <strong style="color:#fff;font-size:15px">${m ? m.scheme.name : 'Evaluation Complete'}</strong>
              <span style="color:#34d399;font-weight:800">${m ? m.score : 0}% Match Score</span>
            </div>
            <div style="font-size:13px;color:#38bdf8;margin-bottom:4px">
              Recommended Loan: <strong>₹${item.loanAmount.toLocaleString('en-IN')}</strong> (${m ? m.scheme.indicativeRateDisplay : ''})
            </div>
            <div style="font-size:12px;color:#94a3b8">
              Income Slab: ₹${(item.entrepreneur.income / 100000).toFixed(1)}L/yr (≤ ₹5L Ceiling Met)
            </div>
          </div>

          <h4 style="font-size:13px;font-weight:700;color:#fff;margin-bottom:8px">Evaluation Checkpoints:</h4>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${(m ? m.checks : []).map(c => `
              <div style="font-size:12px;display:flex;align-items:center;gap:8px;color:${c.passed ? '#34d399' : '#f87171'}">
                <span>${c.passed ? '✓' : '✗'}</span>
                <span><strong>${c.name}:</strong> ${c.detail}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display:flex;gap:10px;margin-top:16px">
          <button class="btn btn-secondary" onclick="window.print()" style="flex:1;justify-content:center">
            🖨️ Print Sanction Recommendation Slip
          </button>
          <button class="btn btn-primary" onclick="App.closeModal()" style="flex:1;justify-content:center">
            Done
          </button>
        </div>
      </div>
    `);
  }
};

window.NGOMode = NGOMode;
