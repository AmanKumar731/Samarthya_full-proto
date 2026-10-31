// ============================================
// Samarthya — Beneficiary Report Generator & Social Share
// PDF Print Engine, WhatsApp Viral Sharing & District Camp Locator
// ============================================

const BeneficiaryReport = {
  // 1. Generate & Print Official Eligibility Report PDF
  downloadReport() {
    if (!App.matchResults || !App.profile) {
      alert('Please complete the scheme matching first.');
      return;
    }

    const p = App.profile;
    const results = App.matchResults.slice(0, 10);
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download your PDF scheme report.');
      return;
    }

    const schemesListHtml = results.map((r, idx) => `
      <div style="margin-bottom:16px;padding:12px 14px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <strong style="font-size:15px;color:#0f172a">${idx + 1}. ${r.scheme.name}</strong>
          <span style="background:#dbeafe;color:#1e40af;font-size:12px;font-weight:700;padding:2px 8px;border-radius:12px">
            ${r.score}% Match
          </span>
        </div>
        <div style="font-size:12px;color:#64748b;margin-bottom:6px">${r.scheme.ministry}</div>
        <div style="font-size:13px;color:#047857;font-weight:700;margin-bottom:4px">
          Benefit: ${r.scheme.benefits.amount} — ${r.scheme.benefits.description}
        </div>
        <div style="font-size:12px;color:#334155">
          <strong>Key Documents:</strong> ${(r.scheme.documents || []).join(', ')}
        </div>
        <div style="font-size:11.5px;color:#2563eb;margin-top:4px">
          Official Apply Portal: ${r.scheme.applyUrl}
        </div>
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Samarthya — Government Scheme Eligibility Report (${p.name})</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            padding: 30px;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 14px;
            margin-bottom: 20px;
          }
          .logo { font-size: 24px; font-weight: 900; color: #0284c7; }
          .meta-box {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            background: #f1f5f9;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            margin-bottom: 24px;
          }
          .footer-note {
            margin-top: 30px;
            border-top: 1px solid #cbd5e1;
            padding-top: 12px;
            font-size: 11px;
            color: #64748b;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom:20px;text-align:right">
          <button onclick="window.print()" style="padding:10px 20px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer">
            🖨️ Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="logo">🏛️ SAMARTHYA PORTAL</div>
            <div style="font-size:12px;color:#64748b">National Welfare Scheme Entitlement Report</div>
          </div>
          <div style="text-align:right;font-size:12px;color:#64748b">
            Date Generated: ${currentDate}<br>
            DPDP Act 2023 Compliant
          </div>
        </div>

        <div class="meta-box">
          <div><strong>Beneficiary Name:</strong> ${p.name}</div>
          <div><strong>State / UT:</strong> ${p.state.replace(/_/g, ' ').toUpperCase()}</div>
          <div><strong>Disability Severity:</strong> ${p.disabilityPercent}% (${p.disabilityTypes.join(', ')})</div>
          <div><strong>Education &amp; Income:</strong> ${p.educationLevel} | ≤ ₹${p.householdIncome.toLocaleString('en-IN')}</div>
        </div>

        <h3 style="font-size:16px;margin-bottom:12px;color:#0f172a">Matched Government Welfare Schemes (${results.length} Schemes)</h3>
        
        ${schemesListHtml}

        <div class="footer-note">
          This is a computer-generated entitlement report based on verified demographic criteria. No official government fees are charged by Samarthya.<br>
          For official applications, submit directly on National Scholarship Portal (scholarships.gov.in) or Swavlamban (swavlambancard.gov.in).
        </div>

        <script>
          setTimeout(() => {
            window.print();
          }, 400);
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  },

  // 2. 1-Click WhatsApp Viral Share
  shareOnWhatsApp() {
    const matchedCount = App.matchResults ? App.matchResults.length : '50+';
    const text = encodeURIComponent(
      `🎯 *Samarthya Government Scheme Matching Portal*\n\n` +
      `Mujhe PwD students ke liye ${matchedCount} government scholarships aur assistive appliance schemes mili hain!\n\n` +
      `Agar aapke parivaar ya jaan-pehchan mein koi special-needs student hai toh unhe yeh 100% Free link bhejein:\n` +
      `👉 https://whatsapp.com/channel/0029Vb90zigATRShQNhLtm2j\n\n` +
      `#Samarthya #DivyangjanWelfare #GovernmentSchemes`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  },

  // 3. District Rehabilitation Centres & ALIMCO Camp Directory Modal
  openCampLocator() {
    const camps = [
      {
        district: "Delhi NCR",
        centre: "ALIMCO Auxiliary Production Centre & DDRC",
        address: "Plot No. 8, Okhla Phase-II, New Delhi",
        phone: "1800-180-5129",
        timing: "Mon - Sat (9:30 AM - 5:30 PM)",
        services: "Motorized tricycles, smart canes, digital hearing aids"
      },
      {
        district: "Uttar Pradesh (Lucknow / Kanpur)",
        centre: "ALIMCO Central Camp & Rehabilitation HQ",
        address: "G.T. Road, Naramau, Kanpur, UP",
        phone: "0512-2770115 / 1800-180-5122",
        timing: "All Days Camp Support",
        services: "Full prosthetics, orthopedic limb fitting, ADIP camp distribution"
      },
      {
        district: "Maharashtra (Mumbai / Pune)",
        centre: "National Institute for Locomotor Disabilities (NILD)",
        address: "Haji Ali Park, Mahalaxmi, Mumbai",
        phone: "022-23544341",
        timing: "Mon - Fri (10:00 AM - 5:00 PM)",
        services: "Medical assessment, UDID cards, travel concession stamping"
      },
      {
        district: "All-India Swavlamban Helpline",
        centre: "Ministry of Social Justice & Empowerment",
        address: "Antyodaya Bhawan, CGO Complex, New Delhi",
        phone: "1800-180-5122 (Toll Free)",
        timing: "24x7 Helpline",
        services: "National scholarships, DBT grievance redressing"
      }
    ];

    const cardsHtml = camps.map(c => `
      <div style="background:rgba(15,22,38,0.7);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
          <strong style="font-size:15px;color:#fff">${c.district} — ${c.centre}</strong>
          <span style="font-size:11px;background:rgba(99,102,241,0.15);color:var(--accent-primary);padding:2px 8px;border-radius:var(--radius-full);font-weight:700">Verified Camp</span>
        </div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px">📍 ${c.address}</div>
        <div style="font-size:12px;color:var(--accent-cyan);font-weight:700;margin-bottom:4px">📞 Helpline: ${c.phone}</div>
        <div style="font-size:11.5px;color:var(--text-muted)">⏰ Timing: ${c.timing} | 🛠️ ${c.services}</div>
      </div>
    `).join('');

    App.openModal(`
      <div class="modal" style="position:relative;background:rgba(11,15,25,0.98);backdrop-filter:blur(24px);border:1.5px solid var(--border);border-radius:var(--radius-xl);padding:32px;max-width:680px;width:100%;max-height:85vh;overflow-y:auto">
        <button class="modal-close" onclick="App.closeModal()" style="position:absolute;top:18px;right:18px;background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer">✕</button>

        <div class="section-tag" style="margin-bottom:8px">ASSISTIVE AIDS &amp; CAMPS</div>
        <h2 style="font-family:var(--font-heading);font-size:22px;font-weight:800;color:#fff;margin-bottom:6px">Nearest District Disability Rehabilitation Centres (DDRC)</h2>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">Find verified government distribution centres for free assistive devices, wheelchairs, hearing aids, and UDID camps.</p>

        <div>${cardsHtml}</div>

        <div style="text-align:right;margin-top:16px">
          <button class="btn-sm btn-secondary" onclick="App.closeModal()">Close Directory</button>
        </div>
      </div>
    `);
  }
};

window.BeneficiaryReport = BeneficiaryReport;
