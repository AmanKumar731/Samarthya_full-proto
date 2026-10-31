// ============================================
// Samarthya — NSFDC Credit & Enterprise Schemes Database
// Targeting SIH26093: SC Beneficiaries & Concessional Channel Finance
// ============================================

const CREDIT_SCHEME_DATABASE = [
  {
    id: 'nsfdc_micro_finance',
    name: 'NSFDC Micro Finance Scheme (Mahila Samriddhi & Micro Credit)',
    nameHi: 'एनएसएफडीसी माइक्रो फाइनेंस योजना (महिला समृद्धि एवं सूक्ष्म ऋण)',
    category: 'micro_finance',
    categoryLabel: 'Micro Credit',
    categoryLabelHi: 'सूक्ष्म ऋण',
    ministry: 'National Scheduled Castes Finance & Development Corporation (MoSJE)',
    maxAmount: 140000,
    maxAmountDisplay: '₹1.40 Lakh',
    indicativeRateMin: 6.5,
    indicativeRateMax: 8.0,
    indicativeRateDisplay: '6.5% – 8.0% p.a.',
    tenureMonthsMin: 12,
    tenureMonthsMax: 60,
    defaultTenureMonths: 36,
    moratoriumMonthsMin: 3,
    moratoriumMonthsMax: 6,
    defaultMoratoriumMonths: 3,
    nsfdcSharePercent: 90,
    promoterContributionPercent: 10,
    description: 'Concessional credit designed for small trade, service, artisan activities, and tiny rural/urban ventures for SC entrepreneurs.',
    descriptionHi: 'अनुसूचित जाति के उद्यमियों के लिए छोटे व्यापार, सेवा, कारीगर गतिविधियों और लघु उद्यमों हेतु रियायती ऋण।',
    benefits: {
      amount: 'Up to ₹1.40 Lakh',
      amountHi: '₹1.40 लाख तक',
      description: 'Quick sanction via Channel Partners with zero collateral for loans up to ₹1.4L at only 6.5–8% interest rate.',
      descriptionHi: '6.5–8% ब्याज दर पर ₹1.4 लाख तक के ऋण हेतु बिना किसी बंधक (Zero Collateral) के त्वरित स्वीकृति।'
    },
    eligibility: {
      caste: ['SC'],
      maxFamilyIncome: 500000, // ₹5 Lakh per annum
      minAge: 18,
      maxAge: 55,
      allowedPurposes: ['business'],
      allowedSectors: ['trade', 'service', 'manufacturing', 'agri_allied', 'other']
    },
    documents: [
      'Caste Certificate (SC)',
      'Family Income Certificate (≤ ₹5L/year)',
      'Aadhaar Card (at Partner Branch)',
      'Basic Project Proposal / Quotation',
      'Bank Account Passbook'
    ],
    applyUrl: 'https://nsfdc.nic.in/en/micro-credit-scheme',
    channelTypes: ['SCA', 'PSB', 'RRB', 'NBFC-MFI']
  },
  {
    id: 'nsfdc_term_loan',
    name: 'NSFDC Term Loan Scheme (Enterprise & Business Expansion)',
    nameHi: 'एनएसएफडीसी मियादी ऋण योजना (उद्यम एवं व्यवसाय विस्तार)',
    category: 'term_loan',
    categoryLabel: 'Term Loan',
    categoryLabelHi: 'मियादी ऋण',
    ministry: 'National Scheduled Castes Finance & Development Corporation (MoSJE)',
    maxAmount: 5000000,
    maxAmountDisplay: '₹50.00 Lakh',
    indicativeRateMin: 8.0,
    indicativeRateMax: 12.0,
    indicativeRateDisplay: '8.0% – 12.0% (Capped at 15%)',
    tenureMonthsMin: 24,
    tenureMonthsMax: 120,
    defaultTenureMonths: 60,
    moratoriumMonthsMin: 6,
    moratoriumMonthsMax: 12,
    defaultMoratoriumMonths: 6,
    nsfdcSharePercent: 90,
    promoterContributionPercent: 10,
    description: 'Medium and long-term project finance for viable income-generating manufacturing, trading, transport, and commercial ventures.',
    descriptionHi: 'व्यवहार्य आय-सृजन विनिर्माण, व्यापार, परिवहन और वाणिज्यिक उद्यमों के लिए मध्यम व दीर्घकालिक परियोजना वित्त।',
    benefits: {
      amount: 'Up to ₹50.00 Lakh',
      amountHi: '₹50.00 लाख तक',
      description: 'Up to 90% project cost financed by NSFDC at concessional rates with up to 12 months moratorium.',
      descriptionHi: '12 महीने तक के अधिस्थगन (Moratorium) के साथ रियायती दरों पर एनएसएफडीसी द्वारा 90% तक परियोजना वित्तपोषित।'
    },
    eligibility: {
      caste: ['SC'],
      maxFamilyIncome: 500000, // ₹5 Lakh per annum
      minAge: 18,
      maxAge: 55,
      allowedPurposes: ['business'],
      allowedSectors: ['trade', 'service', 'manufacturing', 'agri_allied', 'other']
    },
    documents: [
      'Caste Certificate (SC)',
      'Income Certificate (≤ ₹5L/year)',
      'Detailed Project Report (DPR) / Quotations',
      'Bank Account Statement (6 Months)',
      'Valid KYC & Address Proof'
    ],
    applyUrl: 'https://nsfdc.nic.in/en/term-loan-scheme',
    channelTypes: ['SCA', 'PSB', 'RRB']
  },
  {
    id: 'nsfdc_education_loan',
    name: 'NSFDC Concessional Education Loan Scheme (Inland & Overseas)',
    nameHi: 'एनएसएफडीसी रियायती शिक्षा ऋण योजना (स्वदेशी एवं विदेश अध्ययन)',
    category: 'education_loan',
    categoryLabel: 'Education Loan',
    categoryLabelHi: 'शिक्षा ऋण',
    ministry: 'National Scheduled Castes Finance & Development Corporation (MoSJE)',
    maxAmount: 2000000, // ₹20L inland, up to ₹40L overseas
    maxAmountDisplay: '₹20.00 Lakh (India) / ₹40.00 Lakh (Abroad)',
    indicativeRateMin: 6.5, // 6.5% for women, 7.5-8% for men
    indicativeRateMax: 8.0,
    indicativeRateDisplay: '6.5% (Women) / 7.5% – 8.0% (Men)',
    tenureMonthsMin: 36,
    tenureMonthsMax: 120,
    defaultTenureMonths: 84,
    moratoriumMonthsMin: 6, // Course duration + 6 months
    moratoriumMonthsMax: 24,
    defaultMoratoriumMonths: 12,
    nsfdcSharePercent: 90,
    promoterContributionPercent: 10,
    description: 'Highly concessional educational finance for pursuing professional, technical, or doctoral degrees in premier Indian institutions or abroad.',
    descriptionHi: 'शीर्ष भारतीय संस्थानों या विदेशों में व्यावसायिक, तकनीकी या डॉक्टरेट डिग्री प्राप्त करने हेतु अत्यंत रियायती शिक्षा ऋण।',
    benefits: {
      amount: 'Up to ₹20L (India) / ₹40L (Abroad)',
      amountHi: '₹20L (भारत) / ₹40L (विदेश) तक',
      description: 'Zero repayment during course tenure + 6 months post-study moratorium. Extra 1.0% interest concession for female students.',
      descriptionHi: 'कोर्स अवधि + 6 महीने तक शून्य ईएमआई। महिला विद्यार्थियों के लिए ब्याज दर में 1.0% की अतिरिक्त विशेष छूट।'
    },
    eligibility: {
      caste: ['SC'],
      maxFamilyIncome: 500000, // ₹5 Lakh per annum
      minAge: 16,
      maxAge: 40,
      allowedPurposes: ['education'],
      allowedSectors: ['engineering', 'medical', 'management', 'law', 'polytechnic', 'other']
    },
    documents: [
      'Caste Certificate (SC)',
      'Family Income Certificate (≤ ₹5L/year)',
      'Admission Letter / Fee Structure from Recognized College',
      'Previous Academic Marksheets (10th/12th/Degree)',
      'Guarantor / Student KYC'
    ],
    applyUrl: 'https://nsfdc.nic.in/en/education-loan-scheme',
    channelTypes: ['SCA', 'PSB', 'RRB']
  }
];

// Curated Channel Partners Database (SCAs, PSBs, RRBs, NBFC-MFIs)
// Featuring the SIH26093 core differentiator: 'fundHealthStatus' (healthy vs high-npa vs unavailable)
const CHANNEL_PARTNERS_DATABASE = [
  {
    id: 'sca_dsfddc_delhi',
    name: 'Delhi SC/ST/OBC/Minorities Financial & Development Corp (DSFDC)',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency',
    address: 'Ambedkar Bhawan, Sector 16, Rohini',
    district: 'North West Delhi',
    state: 'delhi',
    pincode: '110089',
    lat: 28.7186,
    lng: 77.1089,
    contact: {
      phone: '011-27882481',
      email: 'contact@dsfdc.delhi.gov.in',
      web: 'http://dsfdc.delhi.gov.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 4.8,
    avgDisbursalDays: 18,
    portalUrl: 'http://dsfdc.delhi.gov.in'
  },
  {
    id: 'psb_pnb_parliament_delhi',
    name: 'Punjab National Bank — Specialised MSME Credit Branch',
    type: 'PSB',
    typeLabel: 'Public Sector Bank',
    address: '7, Bhikaji Cama Place, RK Puram',
    district: 'New Delhi',
    state: 'delhi',
    pincode: '110066',
    lat: 28.5683,
    lng: 77.1868,
    contact: {
      phone: '011-26102303',
      email: 'bo0153@pnb.co.in',
      web: 'https://www.pnbindia.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 5.2,
    avgDisbursalDays: 14,
    portalUrl: 'https://www.pnbindia.in/micro-finance.html'
  },
  {
    id: 'psb_sbi_connaught_delhi',
    name: 'State Bank of India — SME Centre & Channel Finance',
    type: 'PSB',
    typeLabel: 'Public Sector Bank',
    address: '11, Parliament Street, Connaught Place',
    district: 'Central Delhi',
    state: 'delhi',
    pincode: '110001',
    lat: 28.6289,
    lng: 77.2144,
    contact: {
      phone: '011-23374201',
      email: 'sbi.00691@sbi.co.in',
      web: 'https://sbi.co.in'
    },
    schemesHandled: ['term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 3.9,
    avgDisbursalDays: 16,
    portalUrl: 'https://sbi.co.in/web/business/sme/credit'
  },
  {
    id: 'sca_upscfdc_lucknow',
    name: 'UP Scheduled Castes Finance & Development Corp (UPSCFDC)',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency',
    address: 'B-2, Pragati Deep, Picup Bhawan Marg, Gomti Nagar',
    district: 'Lucknow',
    state: 'uttar_pradesh',
    pincode: '226010',
    lat: 26.8536,
    lng: 80.9984,
    contact: {
      phone: '0522-2720815',
      email: 'md.upscfdc@gmail.com',
      web: 'http://upscfdc.up.nic.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 6.1,
    avgDisbursalDays: 21,
    portalUrl: 'http://upscfdc.up.nic.in'
  },
  {
    id: 'rrb_aryavart_lucknow',
    name: 'Aryavart Bank — Head Office Micro Credit & Priority Lending',
    type: 'RRB',
    typeLabel: 'Regional Rural Bank',
    address: 'A-2/46, Vijay Khand, Gomti Nagar',
    district: 'Lucknow',
    state: 'uttar_pradesh',
    pincode: '226010',
    lat: 26.8589,
    lng: 81.0021,
    contact: {
      phone: '0522-2392900',
      email: 'priority@aryavartbank-rrb.com',
      web: 'https://aryavart-rrb.com'
    },
    schemesHandled: ['micro_finance', 'term_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 5.7,
    avgDisbursalDays: 15,
    portalUrl: 'https://aryavart-rrb.com/schemes.html'
  },
  {
    id: 'psb_bob_hazratganj',
    name: 'Bank of Baroda — Priority Sector & Financial Inclusion Hub',
    type: 'PSB',
    typeLabel: 'Public Sector Bank',
    address: 'V-4, Hazratganj Main Road',
    district: 'Lucknow',
    state: 'uttar_pradesh',
    pincode: '226001',
    lat: 26.8488,
    lng: 80.9458,
    contact: {
      phone: '0522-2287411',
      email: 'hzrluc@bankofbaroda.com',
      web: 'https://www.bankofbaroda.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 4.4,
    avgDisbursalDays: 12,
    portalUrl: 'https://www.bankofbaroda.in/personal-banking/loans'
  },
  {
    id: 'rrb_baroda_up_kanpur',
    name: 'Baroda UP Bank — Regional Office Kanpur Dehat',
    type: 'RRB',
    typeLabel: 'Regional Rural Bank',
    address: '123/456, Kalpi Road, Fazalganj',
    district: 'Kanpur',
    state: 'uttar_pradesh',
    pincode: '208012',
    lat: 26.4673,
    lng: 80.3129,
    contact: {
      phone: '0512-2216500',
      email: 'kanpur@barodauprrb.co.in',
      web: 'https://barodaupbank.in'
    },
    schemesHandled: ['micro_finance', 'term_loan'],
    fundHealthStatus: 'high-npa', // High NPA Demo Node
    npaPercentage: 17.4,
    avgDisbursalDays: 45,
    portalUrl: 'https://barodaupbank.in'
  },
  {
    id: 'sca_mpbcdc_mumbai',
    name: 'Mahatama Phule Backward Class Development Corp (MPBCDC)',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency',
    address: 'Supreme Headquarters, 6th Floor, Bandra East',
    district: 'Mumbai Suburban',
    state: 'maharashtra',
    pincode: '400051',
    lat: 19.0607,
    lng: 72.8535,
    contact: {
      phone: '022-26591240',
      email: 'contact@mpbcdc.gov.in',
      web: 'https://mpbcdc.maharashtra.gov.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 5.9,
    avgDisbursalDays: 20,
    portalUrl: 'https://mpbcdc.maharashtra.gov.in'
  },
  {
    id: 'psb_canara_nariman_mumbai',
    name: 'Canara Bank — MSME Sulabh & Concessional Credit Desk',
    type: 'PSB',
    typeLabel: 'Public Sector Bank',
    address: 'Maker Chambers III, Nariman Point',
    district: 'Mumbai City',
    state: 'maharashtra',
    pincode: '400021',
    lat: 18.9269,
    lng: 72.8223,
    contact: {
      phone: '022-22851120',
      email: 'cb0134@canarabank.com',
      web: 'https://canarabank.com'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 4.1,
    avgDisbursalDays: 14,
    portalUrl: 'https://canarabank.com/pages/msme-schemes'
  },
  {
    id: 'mfi_nabfins_pune',
    name: 'NABFINS Limited (NABARD Subsidiary Microfinance)',
    type: 'NBFC-MFI',
    typeLabel: 'NBFC Micro Finance Institution',
    address: 'Shivajinagar Agriculture College Road',
    district: 'Pune',
    state: 'maharashtra',
    pincode: '411005',
    lat: 18.5314,
    lng: 73.8446,
    contact: {
      phone: '020-25531980',
      email: 'pune.branch@nabfins.org',
      web: 'https://nabfins.org'
    },
    schemesHandled: ['micro_finance'],
    fundHealthStatus: 'healthy',
    npaPercentage: 2.3,
    avgDisbursalDays: 8,
    portalUrl: 'https://nabfins.org/microcredit'
  },
  {
    id: 'sca_ksfdc_bangalore',
    name: 'Karnataka Dr. B.R. Ambedkar Development Corp Ltd',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency',
    address: '9th Floor, Vishveshwaraiah Mini Tower, Dr. Ambedkar Veedhi',
    district: 'Bengaluru Urban',
    state: 'karnataka',
    pincode: '560001',
    lat: 12.9791,
    lng: 77.5913,
    contact: {
      phone: '080-22864262',
      email: 'mdambedkarcorp@gmail.com',
      web: 'https://adcl.karnataka.gov.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 5.1,
    avgDisbursalDays: 19,
    portalUrl: 'https://adcl.karnataka.gov.in'
  },
  {
    id: 'psb_union_bank_bangalore',
    name: 'Union Bank of India — Gandhi Nagar Financial Inclusion Branch',
    type: 'PSB',
    typeLabel: 'Public Sector Bank',
    address: 'K.G. Road, Gandhi Nagar',
    district: 'Bengaluru Urban',
    state: 'karnataka',
    pincode: '560009',
    lat: 12.9767,
    lng: 77.5753,
    contact: {
      phone: '080-22261911',
      email: 'ubkgroad@unionbankofindia.bank',
      web: 'https://www.unionbankofindia.co.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 4.6,
    avgDisbursalDays: 13,
    portalUrl: 'https://www.unionbankofindia.co.in'
  },
  {
    id: 'rrb_karnataka_gramin_bellary',
    name: 'Karnataka Gramin Bank — Head Office Rural Finance Cell',
    type: 'RRB',
    typeLabel: 'Regional Rural Bank',
    address: 'Near Railway Station Road',
    district: 'Bellary',
    state: 'karnataka',
    pincode: '583101',
    lat: 15.1394,
    lng: 76.9214,
    contact: {
      phone: '08392-236400',
      email: 'fi@karnatakagraminbank.com',
      web: 'https://karnatakagraminbank.com'
    },
    schemesHandled: ['micro_finance', 'term_loan'],
    fundHealthStatus: 'unavailable', // Paused Disbursal Demo Node
    npaPercentage: 19.8,
    avgDisbursalDays: 60,
    portalUrl: 'https://karnatakagraminbank.com'
  },
  {
    id: 'sca_tgsc_hyderabad',
    name: 'Telangana Scheduled Castes Co-operative Development Corp (TSSCCDC)',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency',
    address: 'Damodaram Sanjeevaiah Sankshema Bhavan, Masab Tank',
    district: 'Hyderabad',
    state: 'telangana',
    pincode: '500028',
    lat: 17.4042,
    lng: 78.4485,
    contact: {
      phone: '040-23395992',
      email: 'vcmd.tssccdc@gmail.com',
      web: 'https://tssccdc.telangana.gov.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 6.3,
    avgDisbursalDays: 17,
    portalUrl: 'https://tssccdc.telangana.gov.in'
  },
  {
    id: 'psb_indian_bank_chennai',
    name: 'Indian Bank — Corporate MSME & Government Lending Desk',
    type: 'PSB',
    typeLabel: 'Public Sector Bank',
    address: '254-260, Avvai Shanmugam Salai, Royapettah',
    district: 'Chennai',
    state: 'tamil_nadu',
    pincode: '600014',
    lat: 13.0489,
    lng: 80.2589,
    contact: {
      phone: '044-28134300',
      email: 'priority@indianbank.co.in',
      web: 'https://www.indianbank.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 3.8,
    avgDisbursalDays: 11,
    portalUrl: 'https://www.indianbank.in'
  },
  {
    id: 'sca_tahdco_chennai',
    name: 'Tamil Nadu Adi Dravidar Housing and Development Corp (TAHDCO)',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency',
    address: 'No. 31, Cenotaph Road, Teynampet',
    district: 'Chennai',
    state: 'tamil_nadu',
    pincode: '600018',
    lat: 13.0336,
    lng: 80.2447,
    contact: {
      phone: '044-24310242',
      email: 'tahdcoho@gmail.com',
      web: 'https://tahdco.tn.gov.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 5.4,
    avgDisbursalDays: 16,
    portalUrl: 'https://tahdco.tn.gov.in'
  },
  {
    id: 'sca_bmsfdc_patna',
    name: 'Bihar State SC Co-operative Development Corp (BMSFDC)',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency',
    address: 'Vikas Bhawan, Bailey Road',
    district: 'Patna',
    state: 'bihar',
    pincode: '800015',
    lat: 25.6093,
    lng: 85.1235,
    contact: {
      phone: '0612-2217641',
      email: 'contact@bmsfdc.bihar.gov.in',
      web: 'http://scst.bihar.gov.in'
    },
    schemesHandled: ['micro_finance', 'term_loan'],
    fundHealthStatus: 'high-npa', // High NPA Demo Node
    npaPercentage: 18.2,
    avgDisbursalDays: 50,
    portalUrl: 'http://scst.bihar.gov.in'
  },
  {
    id: 'psb_pnb_patna_kankerbagh',
    name: 'Punjab National Bank — Patna South Lead Bank Office',
    type: 'PSB',
    typeLabel: 'Public Sector Bank',
    address: 'Kankerbagh Main Road, Near Old Bypass',
    district: 'Patna',
    state: 'bihar',
    pincode: '800020',
    lat: 25.5941,
    lng: 85.1504,
    contact: {
      phone: '0612-2354110',
      email: 'bo2451@pnb.co.in',
      web: 'https://www.pnbindia.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 6.8,
    avgDisbursalDays: 19,
    portalUrl: 'https://www.pnbindia.in'
  },
  {
    id: 'sca_wbscstdfc_kolkata',
    name: 'West Bengal SC & ST Development & Finance Corp',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency',
    address: 'CF-217/A1, Sector-I, Salt Lake City',
    district: 'Kolkata',
    state: 'west_bengal',
    pincode: '700064',
    lat: 22.5855,
    lng: 88.4116,
    contact: {
      phone: '033-23348043',
      email: 'wbscstdfc@gmail.com',
      web: 'http://wbbmdc.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 5.7,
    avgDisbursalDays: 18,
    portalUrl: 'http://wbscstdfc.gov.in'
  },
  {
    id: 'psb_uco_kolkata_dalhousie',
    name: 'UCO Bank — Head Office Financial Inclusion Department',
    type: 'PSB',
    typeLabel: 'Public Sector Bank',
    address: '10, BTM Sarani, Brabourne Road',
    district: 'Kolkata',
    state: 'west_bengal',
    pincode: '700001',
    lat: 22.5726,
    lng: 88.3512,
    contact: {
      phone: '033-44557990',
      email: 'hofi@ucobank.co.in',
      web: 'https://www.ucobank.com'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 4.9,
    avgDisbursalDays: 15,
    portalUrl: 'https://www.ucobank.com'
  },
  {
    id: 'sca_gscedc_gandhinagar',
    name: 'Gujarat Scheduled Castes Economic Development Corp (GSCEDC)',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency',
    address: 'Block No. 4, 3rd Floor, Dr. Jivraj Mehta Bhavan',
    district: 'Gandhinagar',
    state: 'gujarat',
    pincode: '382010',
    lat: 23.2156,
    lng: 72.6369,
    contact: {
      phone: '079-23253247',
      email: 'gscedc@gujarat.gov.in',
      web: 'https://sje.gujarat.gov.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 4.2,
    avgDisbursalDays: 14,
    portalUrl: 'https://sje.gujarat.gov.in'
  },
  {
    id: 'sca_rscdfc_jaipur',
    name: 'Rajasthan Scheduled Castes & Scheduled Tribes Finance Corp (Anuja Nigam)',
    type: 'SCA',
    typeLabel: 'State Channelizing Agency',
    address: 'Nehru Sahkar Bhawan, 4th Floor, 22 Godam',
    district: 'Jaipur',
    state: 'rajasthan',
    pincode: '302005',
    lat: 26.8978,
    lng: 75.7942,
    contact: {
      phone: '0141-2740263',
      email: 'anujanigam@gmail.com',
      web: 'https://anujanigam.rajasthan.gov.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 5.6,
    avgDisbursalDays: 16,
    portalUrl: 'https://anujanigam.rajasthan.gov.in'
  },
  {
    id: 'psb_pnb_jaipur_mi_road',
    name: 'Punjab National Bank — Jaipur SME Hub',
    type: 'PSB',
    typeLabel: 'Public Sector Bank',
    address: 'Mirza Ismail Road, Jayanti Market',
    district: 'Jaipur',
    state: 'rajasthan',
    pincode: '302001',
    lat: 26.9174,
    lng: 75.8115,
    contact: {
      phone: '0141-2364022',
      email: 'bo0210@pnb.co.in',
      web: 'https://www.pnbindia.in'
    },
    schemesHandled: ['micro_finance', 'term_loan', 'education_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 4.8,
    avgDisbursalDays: 13,
    portalUrl: 'https://www.pnbindia.in'
  },
  {
    id: 'mfi_satin_agra',
    name: 'Satin Creditcare Network — Priority Financial Services',
    type: 'NBFC-MFI',
    typeLabel: 'NBFC Micro Finance Institution',
    address: 'Sanjay Place Commercial Complex',
    district: 'Agra',
    state: 'uttar_pradesh',
    pincode: '282002',
    lat: 27.1983,
    lng: 78.0056,
    contact: {
      phone: '0562-4001920',
      email: 'agra.mfi@satincreditcare.com',
      web: 'https://satincreditcare.com'
    },
    schemesHandled: ['micro_finance'],
    fundHealthStatus: 'healthy',
    npaPercentage: 3.1,
    avgDisbursalDays: 7,
    portalUrl: 'https://satincreditcare.com'
  },
  {
    id: 'rrb_prathama_moradabad',
    name: 'Prathama UP Gramin Bank — Head Office Financial Inclusion',
    type: 'RRB',
    typeLabel: 'Regional Rural Bank',
    address: 'Ram Ganga Vihar, Phase-II',
    district: 'Moradabad',
    state: 'uttar_pradesh',
    pincode: '244001',
    lat: 28.8512,
    lng: 78.7618,
    contact: {
      phone: '0591-2455172',
      email: 'priority@prathamaupbank.com',
      web: 'https://prathamaupbank.com'
    },
    schemesHandled: ['micro_finance', 'term_loan'],
    fundHealthStatus: 'healthy',
    npaPercentage: 5.3,
    avgDisbursalDays: 16,
    portalUrl: 'https://prathamaupbank.com'
  }
];

// Reference project sector categories
const PROJECT_SECTORS = [
  { id: 'trade', label: 'Retail & Wholesale Trade', labelHi: 'खुदरा एवं थोक व्यापार', icon: '🏪' },
  { id: 'service', label: 'Services (Repairs, Transport, Tech, Salon)', labelHi: 'सेवाएं (मरम्मत, परिवहन, तकनीक, सैलून)', icon: '🛠️' },
  { id: 'manufacturing', label: 'Manufacturing / Small Industrial Unit', labelHi: 'विनिर्माण / लघु उद्योग इकाई', icon: '⚙️' },
  { id: 'agri_allied', label: 'Agri-Allied (Dairy, Poultry, Fishery, Food)', labelHi: 'कृषि संबद्ध (डेयरी, मुर्गी पालन, मत्स्य, खाद्य)', icon: '🌾' },
  { id: 'other', label: 'Other Enterprise / Innovative Venture', labelHi: 'अन्य उद्यम / नवाचारी व्यवसाय', icon: '💡' }
];

const EDUCATION_COURSES = [
  { id: 'engineering', label: 'Engineering & Technology (B.Tech / M.Tech)', labelHi: 'इंजीनियरिंग एवं प्रौद्योगिकी' },
  { id: 'medical', label: 'Medical & Dental (MBBS / BDS / MD / MS)', labelHi: 'चिकित्सा एवं दंत चिकित्सा' },
  { id: 'management', label: 'Management & Business Studies (MBA / PGDM)', labelHi: 'प्रबंधन एवं व्यवसाय अध्ययन' },
  { id: 'law', label: 'Law & Legal Studies (LLB / LLM)', labelHi: 'विधि एवं कानूनी अध्ययन' },
  { id: 'polytechnic', label: 'Diploma / Polytechnic / Vocational Skills', labelHi: 'डिप्लोमा / पॉलिटेक्निक / व्यावसायिक कौशल' },
  { id: 'other', label: 'Other Premier University Degree', labelHi: 'अन्य प्रमुख विश्वविद्यालय डिग्री' }
];

window.CREDIT_SCHEME_DATABASE = CREDIT_SCHEME_DATABASE;
window.CHANNEL_PARTNERS_DATABASE = CHANNEL_PARTNERS_DATABASE;
window.PROJECT_SECTORS = PROJECT_SECTORS;
window.EDUCATION_COURSES = EDUCATION_COURSES;
