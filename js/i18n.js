// ============================================
// Samarthya — Internationalization (i18n)
// Supports: English, Hindi, Punjabi, Marathi, Tamil, Gujarati
// ============================================

const I18N = {
  currentLang: 'en',

  translations: {
    en: {
      navHome: 'Home',
      navMatch: 'Find Schemes',
      navDashboard: 'Dashboard',
      navHow: 'How It Works',
      navAbout: 'About',

      personaWelfare: 'Welfare & Education Schemes',
      personaCredit: 'Credit & Enterprise Schemes',
      personaWelfareShort: 'PwD Welfare Schemes',
      personaCreditShort: 'SC Enterprise Loans',

      heroBadge: 'AI-Powered Government Scheme Matching',
      heroHeadline: 'Empowering Every Student with Smart Welfare',
      heroTagline: 'Discover all entitled central and state welfare schemes in under 2 seconds. Zero Aadhaar or document uploads required — purely privacy-first and instant.',
      heroCta: 'Find My Schemes',
      heroAskAi: '✨ Ask Samarthya AI',
      heroVoiceMatch: '🎙️ Voice Match',
      heroStats1: '50+',
      heroStats1Label: 'Govt Schemes',
      heroInstantMatch: 'Instant Match',
      heroFreePrivate: 'Free & Private',

      chipIntel: 'Samarthya Intelligence',
      chipEngine: 'Rule Engine Active',
      chipSchemes: '50+ State & Central Schemes',
      chipScoring: 'Probability Scoring',
      chipZeroUpload: 'Zero Document Upload',
      chipDpdp: 'DPDP Act 2023 Safe',

      howTitle: 'How Samarthya Operates',
      howSubtitle: 'Four straightforward steps to discover your entitled welfare schemes.',
      howStep1Title: 'Demographic Input',
      howStep1Desc: 'Provide your basic criteria: DOB, disability type, percentage, state, and income slab.',
      howStep2Title: '50+ Policy Matrix Scan',
      howStep2Desc: 'The local rule engine cross-checks all central and state welfare notifications.',
      howStep3Title: 'Probability Scoring',
      howStep3Desc: 'Calculates an explainable trust score (0–100%) explaining exactly why you match.',
      howStep4Title: 'Direct Official Links',
      howStep4Desc: 'Get direct application links to NSP, Swavlamban, and ALIMCO with zero middlemen.',
      startFinding: 'Start Finding Schemes Now',

      aboutTag: 'ABOUT SAMARTHYA',
      aboutTitle: 'Built for Real Impact',
      aboutSub: 'Bridging the critical gap between students with disabilities and government welfare subsidies across India.',
      aboutCard1Title: 'Rule-Based Inference',
      aboutCard1Desc: 'We evaluate age brackets, disability percentages, annual income ceilings, education levels, and state domicile to compute exact eligibility probability scores.',
      aboutCard2Title: 'Privacy-First Architecture',
      aboutCard2Desc: 'No Aadhaar cards or personal ID documents are requested. Your sensitive health data never leaves your browser session, complying with the DPDP Act 2023.',
      aboutCard3Title: 'Wispr Flow AI & Voice',
      aboutCard3Desc: 'Speak naturally to auto-fill search criteria or chat directly with Samarthya AI to clear doubts about scholarship eligibility.',

      formTitle: 'Eligibility Criteria Intake',
      formSubtitle: 'Select your target category to evaluate welfare schemes or concessional enterprise credit.',
      formStep1: 'Personal Info',
      formStep2: 'Disability Details',
      formStep3: 'Education & Income',
      formName: 'Student Name (optional)',
      formDob: 'Date of Birth',
      formGender: 'Gender',
      formGenderM: 'Male',
      formGenderF: 'Female',
      formGenderO: 'Other',
      formState: 'State / UT Domicile',
      formDisabilityType: 'Disability Type(s)',
      formDisabilityPercent: 'Disability Percentage',
      formEducation: 'Current Education Level',
      formIncome: 'Annual Household Income (₹)',
      formNext: 'Next Step',
      formPrev: 'Back',
      formSubmit: 'Find Matching Schemes',
      formRequired: 'Required field',

      resultsTitle: 'Matched Schemes',
      resultsSubtitle: 'schemes matched for your profile',
      dashTitle: 'Dashboard Overview',
      dashTotal: 'Total Matched',
      dashHighly: 'Highly Eligible',
      dashUrgent: 'Urgent Deadlines',
      dashAvgScore: 'Avg. Match Score',
      dashTotalBenefits: 'Estimated Entitlements',

      poweredBy: 'Powered by Samarthya AI Engine • DPDP Act 2023 Compliant',
      close: 'Close',
    },

    hi: {
      navHome: 'होम',
      navMatch: 'योजनाएं खोजें',
      navDashboard: 'डैशबोर्ड',
      navHow: 'कैसे काम करता है',
      navAbout: 'हमारे बारे में',

      personaWelfare: 'कल्याण एवं शिक्षा योजनाएं',
      personaCredit: 'ऋण एवं उद्यम योजनाएं',
      personaWelfareShort: 'दिव्यांग कल्याण योजनाएं',
      personaCreditShort: 'अ.जा. उद्यम ऋण',

      heroBadge: 'एआई-संचालित सरकारी योजना मिलान',
      heroHeadline: 'स्मार्ट कल्याण के साथ हर छात्र को सशक्त बनाना',
      heroTagline: '2 सेकंड में सभी पात्र केंद्रीय और राज्य कल्याणकारी योजनाओं की खोज करें। शून्य आधार या दस्तावेज़ अपलोड की आवश्यकता।',
      heroCta: 'मेरी योजनाएं खोजें',
      heroAskAi: '✨ समर्थ्य एआई से पूछें',
      heroVoiceMatch: '🎙️ वॉयस मैच',
      heroStats1: '50+',
      heroStats1Label: 'सरकारी योजनाएं',
      heroInstantMatch: 'तुरंत मिलान',
      heroFreePrivate: 'मुफ्त और निजी',

      chipIntel: 'समर्थ्य इंटेलिजेंस',
      chipEngine: 'नियम इंजन सक्रिय',
      chipSchemes: '50+ राज्य और केंद्रीय योजनाएं',
      chipScoring: 'संभाव्यता स्कोरिंग',
      chipZeroUpload: 'शून्य दस्तावेज़ अपलोड',
      chipDpdp: 'DPDP अधिनियम 2023 सुरक्षित',

      howTitle: 'समर्थ्य कैसे काम करता है',
      howSubtitle: 'अपनी हकदार कल्याणकारी योजनाओं की खोज के लिए चार सरल कदम।',
      howStep1Title: 'जनसांख्यिकीय इनपुट',
      howStep1Desc: 'अपने मूल मानदंड प्रदान करें: जन्म तिथि, दिव्यांगता प्रकार, प्रतिशत, राज्य और आय।',
      howStep2Title: '50+ नीति स्कैन',
      howStep2Desc: 'स्थानीय नियम इंजन सभी केंद्रीय और राज्य कल्याणकारी सूचनाओं की जांच करता है।',
      howStep3Title: 'संभाव्यता स्कोरिंग',
      howStep3Desc: 'एक स्पष्ट विश्वास स्कोर (0-100%) की गणना करता है कि आप क्यों मेल खाते हैं।',
      howStep4Title: 'सीधे आधिकारिक लिंक',
      howStep4Desc: 'बिना किसी बिचौलिए के NSP, स्वावलंबन और ALIMCO के लिए सीधे आवेदन लिंक प्राप्त करें।',
      startFinding: 'अभी योजनाएं खोजना शुरू करें',

      aboutTag: 'समर्थ्य के बारे में',
      aboutTitle: 'वास्तविक प्रभाव के लिए निर्मित',
      aboutSub: 'दिव्यांग छात्रों और भारत भर की सरकारी कल्याणकारी सब्सिडी के बीच अंतर को पाटना।',
      aboutCard1Title: 'नियम-आधारित अनुमान',
      aboutCard1Desc: 'हम सटीक पात्रता स्कोर की गणना के लिए आयु, दिव्यांगता प्रतिशत, आय सीमा और शिक्षा स्तर का मूल्यांकन करते हैं।',
      aboutCard2Title: 'गोपनीयता-प्रथम आर्किटेक्चर',
      aboutCard2Desc: 'कोई आधार कार्ड या व्यक्तिगत आईडी की आवश्यकता नहीं है। आपका स्वास्थ्य डेटा ब्राउज़र सत्र के बाहर कभी नहीं जाता।',
      aboutCard3Title: 'विस्पर फ्लो एआई और वॉयस',
      aboutCard3Desc: 'खोज मानदंडों को स्वतः भरने के लिए स्वाभाविक रूप से बोलें या छात्रवृत्ति पात्रता के बारे में समर्थ्य एआई से सीधे चैट करें।',

      formTitle: 'पात्रता मानदंड फॉर्म',
      formSubtitle: 'कल्याणकारी योजनाओं या रियायती ऋण का मूल्यांकन करने के लिए श्रेणी चुनें।',
      formStep1: 'व्यक्तिगत जानकारी',
      formStep2: 'दिव्यांगता विवरण',
      formStep3: 'शिक्षा और आय',
      formName: 'विद्यार्थी का नाम (वैकल्पिक)',
      formDob: 'जन्म तिथि',
      formGender: 'लिंग',
      formGenderM: 'पुरुष',
      formGenderF: 'महिला',
      formGenderO: 'अन्य',
      formState: 'राज्य / केंद्र शासित प्रदेश',
      formDisabilityType: 'दिव्यांगता के प्रकार',
      formDisabilityPercent: 'दिव्यांगता का प्रतिशत',
      formEducation: 'वर्तमान शिक्षा का स्तर',
      formIncome: 'वार्षिक पारिवारिक आय (₹)',
      formNext: 'अगला चरण',
      formPrev: 'पीछे',
      formSubmit: 'मैचिंग योजनाएं खोजें',
      formRequired: 'आवश्यक फ़ील्ड',

      resultsTitle: 'मिलती-जुलती योजनाएं',
      resultsSubtitle: 'योजनाएं आपकी प्रोफ़ाइल से मेल खाती हैं',
      dashTitle: 'डैशबोर्ड अवलोकन',
      dashTotal: 'कुल मिलान',
      dashHighly: 'अत्यधिक पात्र',
      dashUrgent: 'तत्काल अंतिम तिथियां',
      dashAvgScore: 'औसत मिलान स्कोर',
      dashTotalBenefits: 'अनुमानित कुल लाभ',

      poweredBy: 'समर्थ्य AI इंजन द्वारा संचालित • DPDP अधिनियम 2023 अनुपालन',
      close: 'बंद करें',
    },

    pa: {
      navHome: 'ਹੋਮ',
      navMatch: 'ਯੋਜਨਾਵਾਂ ਲੱਭੋ',
      navDashboard: 'ਡੈਸ਼ਬੋਰਡ',
      navHow: 'ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
      navAbout: 'ਸਾਡੇ ਬਾਰੇ',

      personaWelfare: 'ਭਲਾਈ ਅਤੇ ਸਿੱਖਿਆ ਯੋਜਨਾਵਾਂ',
      personaCredit: 'ਕਰਜ਼ਾ ਅਤੇ ਉੱਦਮ ਯੋਜਨਾਵਾਂ',
      personaWelfareShort: 'ਦਿਵਿਆਂਗ ਭਲਾਈ ਯੋਜਨਾਵਾਂ',
      personaCreditShort: 'ਅ.ਜਾ. ਉੱਦਮ ਕਰਜ਼ੇ',

      heroBadge: 'ਏਆਈ-ਸੰਚਾਲਿਤ ਸਰਕਾਰੀ ਯੋਜਨਾ ਮੇਲ',
      heroHeadline: 'ਸਮਾਰਟ ਭਲਾਈ ਨਾਲ ਹਰ ਵਿਦਿਆਰਥੀ ਨੂੰ ਸ਼ਕਤੀਸ਼ਾਲੀ ਬਣਾਉਣਾ',
      heroTagline: '2 ਸੈਕਿੰਡ ਤੋਂ ਵੀ ਘੱਟ ਸਮੇਂ ਵਿੱਚ ਸਰਕਾਰੀ ਭਲਾਈ ਯੋਜਨਾਵਾਂ ਦੀ ਖੋਜ ਕਰੋ। ਜ਼ੀਰੋ ਦਸਤਾਵੇਜ਼ ਅਪਲੋਡ ਦੀ ਲੋੜ।',
      heroCta: 'ਮੇਰੀਆਂ ਯੋਜਨਾਵਾਂ ਲੱਭੋ',
      heroAskAi: '✨ ਸਮਰਥਿਆ AI ਤੋਂ ਪੁੱਛੋ',
      heroVoiceMatch: '🎙️ ਆਵਾਜ਼ ਮੈਚ',
      heroStats1: '50+',
      heroStats1Label: 'ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ',
      heroInstantMatch: 'ਤੁਰੰਤ ਮੈਚ',
      heroFreePrivate: 'ਮੁਫ਼ਤ ਅਤੇ ਨਿੱਜੀ',

      chipIntel: 'ਸਮਰਥਿਆ ਇੰਟੈਲੀਜੈਂਸ',
      chipEngine: 'ਨਿਯਮ ਇੰਜਣ ਸਰਗਰਮ',
      chipSchemes: '50+ ਰਾਜ ਅਤੇ ਕੇਂਦਰੀ ਯੋਜਨਾਵਾਂ',
      chipScoring: 'ਸੰਭਾਵਨਾ ਸਕੋਰਿੰਗ',
      chipZeroUpload: 'ਜ਼ੀਰੋ ਦਸਤਾਵੇਜ਼ ਅਪਲੋਡ',
      chipDpdp: 'DPDP ਐਕਟ 2023 ਸੁਰੱਖਿਅਤ',

      howTitle: 'ਸਮਰਥਿਆ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
      howSubtitle: 'ਆਪਣੀਆਂ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਦੀ ਖੋਜ ਲਈ ਚਾਰ ਸਰਲ ਕਦਮ।',
      howStep1Title: 'ਜਨਸੰਖਿਆ ਇਨਪੁਟ',
      howStep1Desc: 'ਆਪਣੇ ਮੂਲ ਮਾਪਦੰਡ ਪ੍ਰਦਾਨ ਕਰੋ: ਜਨਮ ਮਿਤੀ, ਦਿਵਿਆਂਗਤਾ ਕਿਸਮ, ਆਮਦਨ।',
      howStep2Title: '50+ ਨੀਤੀ ਸਕੈਨ',
      howStep2Desc: 'ਸਥਾਨਕ ਨਿਯਮ ਇੰਜਣ ਸਾਰੀਆਂ ਸਰਕਾਰੀ ਨੋਟੀਫਿਕੇਸ਼ਨਾਂ ਦੀ ਜਾਂਚ ਕਰਦਾ ਹੈ।',
      howStep3Title: 'ਸੰਭਾਵਨਾ ਸਕੋਰਿੰਗ',
      howStep3Desc: 'ਤੁਹਾਡੀ ਯੋਗਤਾ ਦਾ ਸਹੀ ਸਕੋਰ (0-100%) ਗਣਨਾ ਕਰਦਾ ਹੈ।',
      howStep4Title: 'ਸਿੱਧੇ ਸਰਕਾਰੀ ਲਿੰਕ',
      howStep4Desc: 'NSP, Swavlamban, ਅਤੇ ALIMCO ਲਈ ਸਿੱਧੇ ਲਿੰਕ ਪ੍ਰਾਪਤ ਕਰੋ।',
      startFinding: 'ਹੁਣੇ ਯੋਜਨਾਵਾਂ ਲੱਭਣਾ ਸ਼ੁਰੂ ਕਰੋ',

      aboutTag: 'ਸਮਰਥਿਆ ਬਾਰੇ',
      aboutTitle: 'ਅਸਲ ਪ੍ਰਭਾਵ ਲਈ ਬਣਾਇਆ ਗਿਆ',
      aboutSub: 'ਦਿਵਿਆਂਗ ਵਿਦਿਆਰਥੀਆਂ ਅਤੇ ਸਰਕਾਰੀ ਭਲਾਈ ਯੋਜਨਾਵਾਂ ਵਿਚਕਾਰ ਦੂਰੀ ਨੂੰ ਮਿਟਾਉਣਾ।',
      aboutCard1Title: 'ਨਿਯਮ-ਆਧਾਰਿਤ ਅਨੁਮਾਨ',
      aboutCard1Desc: 'ਅਸੀਂ ਉਮਰ, ਦਿਵਿਆਂਗਤਾ ਪ੍ਰਤੀਸ਼ਤਤਾ, ਅਤੇ ਆਮਦਨ ਸੀਮਾ ਦਾ ਮੁਲਾਂਕਣ ਕਰਦੇ ਹਾਂ।',
      aboutCard2Title: 'ਨਿੱਜਤਾ-ਪਹਿਲ ਆਰਕੀਟੈਕਚਰ',
      aboutCard2Desc: 'ਕੋਈ ਆਧਾਰ ਕਾਰਡ ਜਾਂ ਨਿੱਜੀ ਦਸਤਾਵੇਜ਼ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ।',
      aboutCard3Title: 'ਵਿਸਪਰ ਫਲੋ AI ਅਤੇ ਆਵਾਜ਼',
      aboutCard3Desc: 'ਸਿੱਧੇ ਬੋਲ ਕੇ ਜਾਂ ਸਮਰਥਿਆ AI ਨਾਲ ਗੱਲਬਾਤ ਕਰਕੇ ਯੋਜਨਾਵਾਂ ਖੋਜੋ।',

      formTitle: 'ਯੋਗਤਾ ਮਾਪਦੰਡ ਫਾਰਮ',
      formSubtitle: 'ਭਲਾਈ ਯੋਜਨਾਵਾਂ ਜਾਂ ਕਰਜ਼ੇ ਦੀ ਯੋਗਤਾ ਦੀ ਜਾਂਚ ਲਈ ਸ਼੍ਰੇਣੀ ਚੁਣੋ।',
      formStep1: 'ਨਿੱਜੀ ਜਾਣਕਾਰੀ',
      formStep2: 'ਦਿਵਿਆਂਗਤਾ ਵੇਰਵੇ',
      formStep3: 'ਸਿੱਖਿਆ ਅਤੇ ਆਮਦਨ',
      formName: 'ਵਿਦਿਆਰਥੀ ਦਾ ਨਾਂ (ਵਿਕਲਪਿਕ)',
      formDob: 'ਜਨਮ ਮਿਤੀ',
      formGender: 'ਲਿੰਗ',
      formGenderM: 'ਪੁਰਸ਼',
      formGenderF: 'ਔਰਤ',
      formGenderO: 'ਹੋਰ',
      formState: 'ਰਾਜ / ਕੇਂਦਰ ਸ਼ਾਸਿਤ ਪ੍ਰਦੇਸ਼',
      formDisabilityType: 'ਦਿਵਿਆਂਗਤਾ ਦੀਆਂ ਕਿਸਮਾਂ',
      formDisabilityPercent: 'ਦਿਵਿਆਂਗਤਾ ਦਾ ਪ੍ਰਤੀਸ਼ਤ',
      formEducation: 'ਮੌਜੂਦਾ ਸਿੱਖਿਆ ਪੱਧਰ',
      formIncome: 'ਸਾਲਾਨਾ ਪਰਿਵਾਰਕ ਆਮਦਨ (₹)',
      formNext: 'ਅਗਲਾ ਕਦਮ',
      formPrev: 'ਪਿੱਛੇ',
      formSubmit: 'ਯੋਜਨਾਵਾਂ ਲੱਭੋ',
      formRequired: 'ਲੋੜੀਂਦਾ ਖੇਤਰ',

      resultsTitle: 'ਮਿਲਦੀਆਂ ਯੋਜਨਾਵਾਂ',
      resultsSubtitle: 'ਯੋਜਨਾਵਾਂ ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਨਾਲ ਮੇਲ ਖਾਂਦੀਆਂ ਹਨ',
      dashTitle: 'ਡੈਸ਼ਬੋਰਡ ਸੰਖੇਪ',
      dashTotal: 'ਕੁੱਲ ਮੇਲ',
      dashHighly: 'ਬਹੁਤ ਯੋਗ',
      dashUrgent: 'ਜ਼ਰੂਰੀ ਮਿਤੀਆਂ',
      dashAvgScore: 'ਔਸਤ ਮੈਚ ਸਕੋਰ',
      dashTotalBenefits: 'ਅਨੁਮਾਨਿਤ ਲਾਭ',

      poweredBy: 'ਸਮਰਥਿਆ AI ਇੰਜਣ ਦੁਆਰਾ ਸੰਚਾਲਿਤ',
      close: 'ਬੰਦ ਕਰੋ',
    },

    mr: {
      navHome: 'मुख्यपृष्ठ',
      navMatch: 'योजना शोधा',
      navDashboard: 'डॅशबोर्ड',
      navHow: 'हे कसे कार्य करते',
      navAbout: 'आमच्याबद्दल',

      personaWelfare: 'कल्याण आणि शिक्षण योजना',
      personaCredit: 'कर्ज आणि उद्योग योजना',
      personaWelfareShort: 'दिव्यांग कल्याण योजना',
      personaCreditShort: 'अ.जा. उद्योग कर्ज',

      heroBadge: 'एआय-आधारित सरकारी योजना जुळणी',
      heroHeadline: 'स्मार्ट कल्याणासह प्रत्येक विद्यार्थ्याचे सक्षमीकरण',
      heroTagline: '2 सेकंदांपेक्षा कमी वेळात सर्व पात्र सरकारी योजना शोधा. कोणतेही आधार किंवा कागदपत्रे अपलोड करण्याची गरज नाही.',
      heroCta: 'माझ्या योजना शोधा',
      heroAskAi: '✨ सामर्थ्य AI ला विचारा',
      heroVoiceMatch: '🎙️ व्हॉईस मॅच',
      heroStats1: '50+',
      heroStats1Label: 'सरकारी योजना',
      heroInstantMatch: 'त्वरित जुळणी',
      heroFreePrivate: 'मोफत आणि खाजगी',

      chipIntel: 'सामर्थ्य बुद्धिमत्ता',
      chipEngine: 'नियम इंजिन सक्रिय',
      chipSchemes: '50+ राज्य आणि केंद्रीय योजना',
      chipScoring: 'संभाव्यता स्कोअरिंग',
      chipZeroUpload: 'शून्य कागदपत्र अपलोड',
      chipDpdp: 'DPDP कायदा 2023 सुरक्षित',

      howTitle: 'सामर्थ्य कसे कार्य करते',
      howSubtitle: 'तुमच्या हक्काच्या सरकारी योजना शोधण्यासाठी चार सोप्या पायऱ्या.',
      howStep1Title: 'लोकसंख्याशास्त्रीय इनपुट',
      howStep1Desc: 'तुमचे मूलभूत निकष प्रविष्ट करा: जन्म तारीख, दिव्यांगत्व प्रकार, उत्पन्न.',
      howStep2Title: '50+ धोरण स्कॅन',
      howStep2Desc: 'स्थानिक नियम इंजिन सर्व सरकारी सूचनांची तपासणी करते.',
      howStep3Title: 'संभाव्यता स्कोअरिंग',
      howStep3Desc: 'तुमच्या पात्रतेचा अचूक स्कोअर (0-100%) मोजते.',
      howStep4Title: 'थेट अधिकृत लिंक्स',
      howStep4Desc: 'NSP, Swavlamban आणि ALIMCO साठी थेट अर्ज लिंक्स मिळवा.',
      startFinding: 'आत्ताच योजना शोधणे सुरू करा',

      aboutTag: 'सामर्थ्याबद्दल',
      aboutTitle: 'वास्तविक प्रभावासाठी तयार केलेले',
      aboutSub: 'दिव्यांग विद्यार्थी आणि सरकारी योजनांमधील अंतर कमी करणे.',
      aboutCard1Title: 'नियम-आधारित अनुमान',
      aboutCard1Desc: 'आम्ही वय, दिव्यांगत्व टक्केवारी आणि उत्पन्न मर्यादेचे मूल्यांकन करतो.',
      aboutCard2Title: 'गोपनीयता-प्रथम आर्किटेक्चर',
      aboutCard2Desc: 'कोणत्याही आधार कार्ड किंवा वैयक्तिक कागदपत्रांची आवश्यकता नाही.',
      aboutCard3Title: 'विस्पर फ्लो AI आणि व्हॉईस',
      aboutCard3Desc: 'बोलून शोध निकष भरा किंवा सामर्थ्य AI शी थेट संवाद साधा.',

      formTitle: 'पात्रता निकष अर्ज',
      formSubtitle: 'कल्याणकारी योजना किंवा सवलतीच्या कर्जाचे मूल्यमापन करण्यासाठी श्रेणी निवडा.',
      formStep1: 'वैयक्तिक माहिती',
      formStep2: 'दिव्यांगत्व तपशील',
      formStep3: 'शिक्षण आणि उत्पन्न',
      formName: 'विद्यार्थ्याचे नाव (पर्यायी)',
      formDob: 'जन्म तारीख',
      formGender: 'लिंग',
      formGenderM: 'पुरुष',
      formGenderF: 'स्त्री',
      formGenderO: 'इतर',
      formState: 'राज्य / केंद्रशासित प्रदेश',
      formDisabilityType: 'दिव्यांगत्वाचे प्रकार',
      formDisabilityPercent: 'दिव्यांगत्वाचे प्रमाण (%)',
      formEducation: 'सध्याचे शिक्षण',
      formIncome: 'वार्षिक कौटुंबिक उत्पन्न (₹)',
      formNext: 'पुढील पायरी',
      formPrev: 'मागे',
      formSubmit: 'योग्य योजना शोधा',
      formRequired: 'आवश्यक क्षेत्र',

      resultsTitle: 'पात्र योजना',
      resultsSubtitle: 'योजना तुमच्या प्रोफाइलशी जुळतात',
      dashTitle: 'डॅशबोर्ड विहंगावलोकन',
      dashTotal: 'एकूण जुळणारे',
      dashHighly: 'उच्च पात्र',
      dashUrgent: 'तातडीच्या अंतिम मुदती',
      dashAvgScore: 'सरासरी मॅच स्कोर',
      dashTotalBenefits: 'अंदाजित लाभ',

      poweredBy: 'सामर्थ्य AI इंजिनद्वारे समर्थित',
      close: 'बंद करा',
    },

    ta: {
      navHome: 'முகப்பு',
      navMatch: 'திட்டங்களைக் கண்டறியவும்',
      navDashboard: 'டாஷ்போர்டு',
      navHow: 'இயங்கும் முறை',
      navAbout: 'எங்களைப் பற்றி',

      personaWelfare: 'நலன் மற்றும் கல்வித் திட்டங்கள்',
      personaCredit: 'கடன் மற்றும் தொழில் திட்டங்கள்',
      personaWelfareShort: 'மாற்றுத்திறனாளி நலத்திட்டங்கள்',
      personaCreditShort: 'ஆதிதிராவிடர் தொழில் கடன்',

      heroBadge: 'AI-மூலம் இயங்கும் அரசுத் திட்டப் பொருத்தம்',
      heroHeadline: 'ஸ்மார்ட் நலத்திட்டங்கள் மூலம் ஒவ்வொரு மாணவரையும் வலுப்படுத்துதல்',
      heroTagline: '2 வினாடிகளுக்குள் அனைத்து தகுதியுள்ள அரசுத் திட்டங்களையும் கண்டறியவும். ஆதார் அல்லது ஆவணப் பதிவேற்றம் தேவையில்லை.',
      heroCta: 'என் திட்டங்களைக் கண்டறி',
      heroAskAi: '✨ சமார்த்தியா AI-மிடம் கேளுங்கள்',
      heroVoiceMatch: '🎙️ குரல் பொருத்தம்',
      heroStats1: '50+',
      heroStats1Label: 'அரசுத் திட்டங்கள்',
      heroInstantMatch: 'உடனடி பொருத்தம்',
      heroFreePrivate: 'இலவசம் & தனியுரிமை',

      chipIntel: 'சமார்த்தியா நுண்ணறிவு',
      chipEngine: 'விதி எஞ்சின் செயலில் உள்ளது',
      chipSchemes: '50+ மாநில & மத்திய திட்டங்கள்',
      chipScoring: 'சம்பாவித மதிப்பெண்',
      chipZeroUpload: 'பூஜ்ஜிய ஆவணப் பதிவேற்றம்',
      chipDpdp: 'DPDP சட்டம் 2023 பாதுகாப்பானது',

      howTitle: 'சமார்த்தியா எவ்வாறு இயங்குகிறது',
      howSubtitle: 'உங்களுக்குரிய அரசு நலத்திட்டங்களைக் கண்டறிய நான்கு எளிய படிகள்.',
      howStep1Title: 'மக்கள்தொகை உள்ளீடு',
      howStep1Desc: 'உங்கள் அடிப்படை அளவுகோல்களை வழங்கவும்: பிறந்த தேதி, மாற்றுத்திறன் வகை, வருமானம்.',
      howStep2Title: '50+ கொள்கை ஸ்கேன்',
      howStep2Desc: 'உள்ளூர் விதி எஞ்சின் அனைத்து அரசு அறிவிப்புகளையும் சரிபார்க்கிறது.',
      howStep3Title: 'சம்பாவித மதிப்பெண்',
      howStep3Desc: 'உங்கள் தகுதிக்கான துல்லியமான மதிப்பெண்ணைக் கணக்கிடுகிறது.',
      howStep4Title: 'நேரடி அதிகாரப்பூர்வ இணைப்புகள்',
      howStep4Desc: 'NSP, Swavlamban மற்றும் ALIMCO க்கான நேரடி விண்ணப்ப இணைப்புகளைப் பெறுங்கள்.',
      startFinding: 'இப்போது திட்டங்களைத் தேடத் தொடங்குங்கள்',

      aboutTag: 'சமார்த்தியா பற்றி',
      aboutTitle: 'உண்மையான தாக்கத்திற்காக உருவாக்கப்பட்டது',
      aboutSub: 'மாற்றுத்திறனாளி மாணவர்களுக்கும் அரசு நலத்திட்டங்களுக்கும் இடையிலான இடைவெளியைக் குறைத்தல்.',
      aboutCard1Title: 'விதி அடிப்படையிலான கணிப்பு',
      aboutCard1Desc: 'வயது, மாற்றுத்திறன் சதவீதம் மற்றும் வருமான வரம்பை நாங்கள் மதிப்பிடுகிறோம்.',
      aboutCard2Title: 'தனியுரிமை-முதல் கட்டமைப்பு',
      aboutCard2Desc: 'ஆதார் அட்டை அல்லது தனிப்பட்ட ஆவணங்கள் எதுவும் தேவையில்லை.',
      aboutCard3Title: 'விஸ்பர் ஃப்ளோ AI & குரல்',
      aboutCard3Desc: 'இயல்பாகப் பேசித் தேடலாம் அல்லது சமார்த்தியா AI உடன் உரையாடலாம்.',

      formTitle: 'தகுதி அளவுகோல் படிவம்',
      formSubtitle: 'நலத்திட்டங்கள் அல்லது கடன்களை மதிப்பிட வகையைத் தேர்ந்தெடுக்கவும்.',
      formStep1: 'தனிப்பட்ட വിവരங்கள்',
      formStep2: 'மாற்றுத்திறனாளி விவரங்கள்',
      formStep3: 'கல்வி மற்றும் வருமானம்',
      formName: 'மாணவர் பெயர் (விருப்பத்திற்குரியது)',
      formDob: 'பிறந்த தேதி',
      formGender: 'பாலினம்',
      formGenderM: 'ஆண்',
      formGenderF: 'பெண்',
      formGenderO: 'இதர',
      formState: 'மாநிலம் / யூனியன் பிரதேசம்',
      formDisabilityType: 'மாற்றுத்திறன் வகைகள்',
      formDisabilityPercent: 'மாற்றுத்திறன் சதவீதம்',
      formEducation: 'தற்போதைய கல்வி நிலை',
      formIncome: 'ஆண்டு குடும்ப வருமானம் (₹)',
      formNext: 'அடுத்த படி',
      formPrev: 'முந்தைய படி',
      formSubmit: 'பொருந்தக்கூடிய திட்டங்களைக் கண்டறியவும்',
      formRequired: 'தேவையான புலம்',

      resultsTitle: 'பொருந்திய திட்டங்கள்',
      resultsSubtitle: 'திட்டங்கள் உங்கள் சுயவிவரத்துடன் பொருந்துகின்றன',
      dashTitle: 'டாஷ்போர்டு மேலோட்டம்',
      dashTotal: 'மொத்தப் பொருத்தம்',
      dashHighly: 'மிகவும் தகுதியானது',
      dashUrgent: 'அவசர காலக்கெடு',
      dashAvgScore: 'சராசரி போட்டி மதிப்பெண்',
      dashTotalBenefits: 'மதிப்பிடப்பட்ட நன்மைகள்',

      poweredBy: 'சமார்த்தியா AI எஞ்சின் மூலம் இயங்குகிறது',
      close: 'மூடு',
    },

    gu: {
      navHome: 'હોમ',
      navMatch: 'યોજનાઓ શોધો',
      navDashboard: 'ડૅશબોર્ડ',
      navHow: 'આ કેવી રીતે કામ કરે છે',
      navAbout: 'અમારા વિશે',

      personaWelfare: 'કલ્યાણ અને શિક્ષણ યોજનાઓ',
      personaCredit: 'લોન અને સાહસ યોજનાઓ',
      personaWelfareShort: 'દિવ્યાંગ કલ્યાણ યોજનાઓ',
      personaCreditShort: 'અ.જા. સાહસ લોન',

      heroBadge: 'AI-સંચાલિત સરકારી યોજના મેચિંગ',
      heroHeadline: 'સ્માર્ટ કલ્યાણ સાથે દરેક વિદ્યાર્થીને સશક્ત બનાવવું',
      heroTagline: '2 સેકન્ડથી ઓછા સમયમાં તમામ પાત્ર સરકારી યોજનાઓ શોધો. કોઈ આધાર કે દસ્તાવેજ અપલોડ કરવાની જરૂર નથી.',
      heroCta: 'મારી યોજનાઓ શોધો',
      heroAskAi: '✨ સમર્થ્ય AI ને પૂછો',
      heroVoiceMatch: '🎙️ વોઇસ મેચ',
      heroStats1: '50+',
      heroStats1Label: 'સરકારી યોજનાઓ',
      heroInstantMatch: 'ત્વરિત મેચ',
      heroFreePrivate: 'મફત અને ખાનગી',

      chipIntel: 'સમર્થ્ય ઇન્ટેલિજન્સ',
      chipEngine: 'રૂલ એન્જિન સક્રિય',
      chipSchemes: '50+ રાજ્ય અને કેન્દ્રીય યોજનાઓ',
      chipScoring: 'સંભાવના સ્કોરિંગ',
      chipZeroUpload: 'ઝીરો ડોક્યુમેન્ટ અપલોડ',
      chipDpdp: 'DPDP એક્ટ 2023 સુરક્ષિત',

      howTitle: 'સમર્થ્ય કેવી રીતે કામ કરે છે',
      howSubtitle: 'તમારી હકની સરકારી યોજનાઓ શોધવા માટે ચાર સરળ પગલાં.',
      howStep1Title: 'વસ્તી વિષયક ઇનપુટ',
      howStep1Desc: 'તમારા મૂળભૂત માપદંડો આપો: જન્મ તારીખ, દિવ્યાંગતા પ્રકાર, આવક.',
      howStep2Title: '50+ નીતિ સ્કેન',
      howStep2Desc: 'સ્થાનિક નિયમ એન્જિન તમામ સરકારી સૂચનાઓની ચકાસણી કરે છે.',
      howStep3Title: 'સંભાવના સ્કોરિંગ',
      howStep3Desc: 'તમારી પાત્રતાનો સચોਟ સ્કોર (0-100%) ગણે છે.',
      howStep4Title: 'સીધી સત્તાવાર લિંક્સ',
      howStep4Desc: 'NSP, Swavlamban અને ALIMCO માટે સીધી લિંક્સ મેળવો.',
      startFinding: 'હમણાં જ યોજનાઓ શોધવાનું શરૂ કરો',

      aboutTag: 'સમર્થ્ય વિશે',
      aboutTitle: 'વાસ્તવિક અસર માટે બનાવેલ',
      aboutSub: 'દિવ્યાંગ વિદ્યાર્થીઓ અને સરકારી યોજનાઓ વચ્ચેનું અંતર ઘટાડવું.',
      aboutCard1Title: 'નિયમ-આધારિત અનુમાન',
      aboutCard1Desc: 'અમે ઉંમર, દિવ્યાંગતા ટકાવારી અને આવક મર્યાદાનું મૂલ્યાંકન કરીએ છીએ.',
      aboutCard2Title: 'ગોપનીયતા-પ્રથમ આર્કિટેક્ચર',
      aboutCard2Desc: 'કોઈ આધાર કાર્ડ કે વ્યક્તિગત દસ્તાવેજોની જરૂર નથી.',
      aboutCard3Title: 'વિસ્પર ફ્લો AI અને વોઇસ',
      aboutCard3Desc: 'બોલીને શોધો અથવા સમર્થ્ય AI સાથે સીધી વાતચીત કરો.',

      formTitle: 'પાત્રતા માપદંડ ફોર્મ',
      formSubtitle: 'કલ્યાણકારી યોજનાઓ અથવા લોનની ચકાસણી માટે કેટેગરી પસંદ કરો.',
      formStep1: 'વ્યક્તિગત માહિતી',
      formStep2: 'દિવ્યાંગતા વિગતો',
      formStep3: 'શિક્ષણ અને આવક',
      formName: 'વિદ્યાર્થીનું નામ (વૈકલ્પિક)',
      formDob: 'જન્મ તારીખ',
      formGender: 'જાતિ',
      formGenderM: 'પુરુષ',
      formGenderF: 'મહિલા',
      formGenderO: 'અન્ય',
      formState: 'રાજ્ય / કેન્દ્રશાસિત પ્રદેશ',
      formDisabilityType: 'દિવ્યાંગતાના પ્રકાર',
      formDisabilityPercent: 'દિવ્યાંગતા ટકાવારી',
      formEducation: 'વર્તમાન શિક્ષણ સ્તર',
      formIncome: 'વાર્ષિક કૌટુંબિક આવક (₹)',
      formNext: 'આગળનું પગલું',
      formPrev: 'પાછા',
      formSubmit: 'મેચિંગ યોજનાઓ શોધો',
      formRequired: 'જરૂરી ક્ષેત્ર',

      resultsTitle: 'મેચ થયેલ યોજનાઓ',
      resultsSubtitle: 'યોજનાઓ તમારી પ્રોફાઇલ સાથે મેળ ખાતી હોય છે',
      dashTitle: 'ડૅશબોર્ડ ઝાંખી',
      dashTotal: 'કુલ મેચ',
      dashHighly: 'ઉચ્ચ પાત્ર',
      dashUrgent: 'જરૂરી સમયમਰ્યાદા',
      dashAvgScore: 'સરેરાશ મેચ સ્કોર',
      dashTotalBenefits: 'અંદાજિત લાભો',

      poweredBy: 'સમર્થ્ય AI એન્જિન દ્વારા સંચાલિત',
      close: 'બંધ કરો',
    }
  },

  /**
   * Get translation for a key
   */
  t(key) {
    const langObj = this.translations[this.currentLang] || this.translations.en;
    return langObj[key] || this.translations.en[key] || key;
  },

  /**
   * Set language directly
   */
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      this.applyTranslations();
      localStorage.setItem('samarthya_lang', lang);
      const select = document.getElementById('langSelect');
      if (select) select.value = lang;
    }
  },

  /**
   * Toggle between supported languages
   */
  toggle() {
    const languages = ['en', 'hi', 'pa', 'mr', 'ta', 'gu'];
    const idx = languages.indexOf(this.currentLang);
    const nextLang = languages[(idx + 1) % languages.length];
    this.setLanguage(nextLang);
  },

  /**
   * Apply all translations to the DOM
   */
  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (el.tagName === 'INPUT' && el.type === 'text') {
        el.placeholder = translation;
      } else {
        el.textContent = translation;
      }
    });

    // Update document language
    document.documentElement.lang = this.currentLang;

    // Update disability checkbox labels
    const checkboxItems = document.querySelectorAll('.checkbox-item');
    checkboxItems.forEach(item => {
      const value = item.getAttribute('data-value');
      const dtype = (typeof DISABILITY_TYPES !== 'undefined' ? DISABILITY_TYPES : []).find(d => d.id === value);
      if (dtype) {
        const span = item.querySelector('span:last-child');
        if (span) {
          span.textContent = (this.currentLang === 'hi' && dtype.labelHi) ? dtype.labelHi : dtype.label;
        }
      }
    });

    // Update education level options
    const eduSelect = document.getElementById('inputEducation');
    if (eduSelect) {
      const options = eduSelect.querySelectorAll('option');
      options.forEach(opt => {
        if (opt.value) {
          const level = (typeof EDUCATION_LEVELS !== 'undefined' ? EDUCATION_LEVELS : []).find(e => e.id === opt.value);
          if (level) {
            opt.textContent = (this.currentLang === 'hi' && level.labelHi) ? level.labelHi : level.label;
          }
        }
      });
    }

    // Keep hero text aligned with active persona
    if (window.App && typeof App.setPersona === 'function' && App.currentPersona) {
      App.setPersona(App.currentPersona);
    }
  },
};

// Initialize saved language if available
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('samarthya_lang');
  if (savedLang && I18N.translations[savedLang]) {
    I18N.setLanguage(savedLang);
  }
});
