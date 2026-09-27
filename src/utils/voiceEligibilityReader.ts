import { Language, Scheme } from '../types';
import { EvaluatedScheme } from './eligibilityEngine';
import { getLanguageOption } from '../i18n/languages';
import { RAGSchemeResult } from '../views/RAGSchemeFinderView';

export interface SpokenSchemeUnit {
  id: string;
  schemeIndex: number;
  schemeId: string;
  schemeName: string;
  fullSpeechText: string;
  summaryText: string;
  benefit?: string;
  reasons?: string[];
  documents?: string[];
}

export interface LocalizedVoiceStrings {
  resultsHeader: (count: number) => string;
  schemeHeader: (index: number, total: number, name: string) => string;
  statusLabel: string;
  whyEligibleLabel: string;
  benefitLabel: string;
  conditionsLabel: string;
  documentsLabel: string;
  applyLabel: string;
  nextSchemeTransition: string;
  conclusion: string;
  noResultsFound: string;
  listenResultsBtn: string;
  stopBtn: string;
  pauseBtn: string;
  resumeBtn: string;
  readingNowStatus: (index: number, total: number, name: string) => string;
}

export const MULTILINGUAL_VOICE_STRINGS: Record<Language, LocalizedVoiceStrings> = {
  // 1. Kannada (ಕನ್ನಡ)
  kn: {
    resultsHeader: (n) =>
      `ಅರ್ಹತಾ ಫಲಿತಾಂಶಗಳು. ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಪ್ರಕಾರ ನೀವು ${n} ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗೆ ಅರ್ಹರಾಗಿದ್ದೀರಿ. ಪ್ರತಿಯೊಂದು ಯೋಜನೆಯ ವಿವರಗಳನ್ನು ಓದಲಾಗುತ್ತಿದೆ.`,
    schemeHeader: (i, total, name) => `ಯೋಜನೆ ${i} / ${total}: ${name}.`,
    statusLabel: 'ಅರ್ಹತೆಯ ಸ್ಥಿತಿ: ಪರಿಶೀಲಿತ ಅರ್ಹ.',
    whyEligibleLabel: 'ನೀವು ಏಕೆ ಅರ್ಹರಾಗಿದ್ದೀರಿ:',
    benefitLabel: 'ಪ್ರಮುಖ ಸೌಲಭ್ಯ:',
    conditionsLabel: 'ಮುಖ್ಯ ಅರ್ಹತಾ ನಿಯಮಗಳು:',
    documentsLabel: 'ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳು:',
    applyLabel: 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ: ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಆಧಾರ್ ಮತ್ತು ಬ್ಯಾಂಕ್ ಖಾತೆ ಮೂಲಕ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು.',
    nextSchemeTransition: 'ಮುಂದಿನ ಅರ್ಹ ಯೋಜನೆ:',
    conclusion: 'ಇದು ನಿಮ್ಮ ಎಲ್ಲಾ ಅರ್ಹ ಯೋಜನೆಗಳ ಪೂರ್ಣ ವಿವರವಾಗಿದೆ. ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಪರದೆಯ ಮೇಲಿನ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
    noResultsFound:
      'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ ಸದ್ಯಕ್ಕೆ ಯಾವುದೇ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆದಾಯ, ವಯಸ್ಸು ಅಥವಾ ಕಸುಬಿನ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಪ್ರೊಫೈಲ್ ಅಪ್‌ಡೇಟ್ ಮಾಡಿ.',
    listenResultsBtn: '🔊 ಅರ್ಹತಾ ಫಲಿತಾಂಶಗಳನ್ನು ಆಲಿಸಿ',
    stopBtn: '⏹ ನಿಲ್ಲಿಸಿ',
    pauseBtn: '⏸ ವಿರಾಮ',
    resumeBtn: '▶ ಮುಂದುವರಿಸಿ',
    readingNowStatus: (i, t, name) => `ಓದಲಾಗುತ್ತಿದೆ: ಯೋಜನೆ ${i}/${t} - ${name}`,
  },

  // 2. Hindi (हिन्दी)
  hi: {
    resultsHeader: (n) =>
      `पात्रता परिणाम। आपकी प्रोफ़ाइल के अनुसार आप ${n} सरकारी कल्याणकारी योजनाओं के लिए पात्र हैं। सभी योजनाओं का विवरण सुनाया जा रहा है।`,
    schemeHeader: (i, total, name) => `योजना ${i} / ${total}: ${name}.`,
    statusLabel: 'पात्रता स्थिति: सत्यापित पात्र।',
    whyEligibleLabel: 'आप क्यों पात्र हैं:',
    benefitLabel: 'मुख्य प्रत्यक्ष लाभ:',
    conditionsLabel: 'महत्वपूर्ण पात्रता शर्तें:',
    documentsLabel: 'आवश्यक दस्तावेज:',
    applyLabel: 'आवेदन प्रक्रिया: आधिकारिक सरकारी पोर्टल पर आधार कार्ड और बैंक खाते के साथ ऑनलाइन आवेदन कर सकते हैं।',
    nextSchemeTransition: 'अगली पात्र योजना:',
    conclusion: 'यह आपकी सभी पात्र योजनाओं की पूरी सूची है। अधिक जानकारी और आवेदन के लिए स्क्रीन पर योजना विवरण देखें।',
    noResultsFound:
      'आपकी वर्तमान प्रोफ़ाइल जानकारी के अनुसार कोई भी योजना सुसंगत नहीं पाई गई। कृपया अपनी आय, आयु अथवा व्यवसाय की जांच कर प्रोफ़ाइल अपडेट करें।',
    listenResultsBtn: '🔊 पात्रता परिणाम सुनें',
    stopBtn: '⏹ रोकें',
    pauseBtn: '⏸ विराम',
    resumeBtn: '▶ जारी रखें',
    readingNowStatus: (i, t, name) => `सुनाई जा रही है: योजना ${i}/${t} - ${name}`,
  },

  // 3. Tamil (தமிழ்)
  ta: {
    resultsHeader: (n) =>
      `தகுதி முடிவுகள். உங்கள் சுயவிவரத்தின்படி நீங்கள் ${n} அரசு நலத்திட்டங்களுக்குத் தகுதியுடையவர். விவரங்கள் ஒவ்வொன்றாக வாசிக்கப்படுகின்றன.`,
    schemeHeader: (i, total, name) => `திட்டம் ${i} / ${total}: ${name}.`,
    statusLabel: 'தகுதி நிலை: சரிபார்க்கப்பட்ட தகுதி.',
    whyEligibleLabel: 'நீங்கள் ஏன் தகுதியுடையவர்:',
    benefitLabel: 'முக்கிய பலன்:',
    conditionsLabel: 'முக்கிய தகுதி நிபந்தனைகள்:',
    documentsLabel: 'தேவையான ஆவணங்கள்:',
    applyLabel: 'விண்ணப்பிக்கும் முறை: ஆதார் மற்றும் வங்கி கணக்குடன் அதிகாரப்பூர்வ அரசு இணையதளத்தில் விண்ணப்பிக்கலாம்.',
    nextSchemeTransition: 'அடுத்த தகுதியான திட்டம்:',
    conclusion: 'இது உங்கள் அனைத்து தகுதியான திட்டங்களின் பட்டியல். மேலும் விவரங்களுக்கு திரையைப் பார்க்கவும்.',
    noResultsFound:
      'உங்கள் தற்போதைய விவரக்குறிப்பின்படி தகுதியான திட்டங்கள் எதுவும் கிடைக்கவில்லை. உங்கள் வருமானம் அல்லது தொழில் விவரங்களை புதுப்பிக்கவும்.',
    listenResultsBtn: '🔊 தகுதி முடிவுகளைக் கேளுங்கள்',
    stopBtn: '⏹ நிறுத்து',
    pauseBtn: '⏸ இடைநிறுத்து',
    resumeBtn: '▶ தொடரவும்',
    readingNowStatus: (i, t, name) => `வாசிக்கப்படுகிறது: திட்டம் ${i}/${t} - ${name}`,
  },

  // 4. Telugu (తెలుగు)
  te: {
    resultsHeader: (n) =>
      `అర్హత ఫలితాలు. మీ ప్రొఫైల్ వివరాల ప్రకారం మీరు ${n} ప్రభుత్వ సంక్షేమ పథకాలకు అర్హులు. పూర్తి వివరాలు చదవబడుతున్నాయి.`,
    schemeHeader: (i, total, name) => `పథకం ${i} / ${total}: ${name}.`,
    statusLabel: 'అర్హత స్థితి: ధృవీకరించబడిన అర్హత.',
    whyEligibleLabel: 'మీరు ఎందుకు అర్హులంటే:',
    benefitLabel: 'ప్రధాన ప్రయోజనం:',
    conditionsLabel: 'ముఖ్యమైన అర్హత నిబంధనలు:',
    documentsLabel: 'కావలసిన పత్రాలు:',
    applyLabel: 'దరఖాస్తు విధానం: ఆధార్ మరియు బ్యాంకు పాస్‌బుక్‌తో అధికారిక పోర్టల్ ద్వారా ఆన్‌లైన్‌లో దరఖాస్తు చేసుకోవచ్చు.',
    nextSchemeTransition: 'తదుపరి అర్హత గల పథకం:',
    conclusion: 'ఇది మీ అర్హత గల పథకాల పూర్తి జాబితా. స్క్రీన్‌పై వివరాలను పరిశీలించి దరఖాస్తు చేసుకోండి.',
    noResultsFound:
      'మీ ప్రస్తుత ప్రొఫైల్ ప్రకారం ఎటువంటి అర్హత గల పథకాలు లభించలేదు. దయచేసి ఆదాయం లేదా వయస్సు వివరాలను సవరించండి.',
    listenResultsBtn: '🔊 అర్హత ఫలితాలను వినండి',
    stopBtn: '⏹ ఆపండి',
    pauseBtn: '⏸ పాజ్',
    resumeBtn: '▶ పునఃప్రారంభించు',
    readingNowStatus: (i, t, name) => `చదువుతున్నది: పథకం ${i}/${t} - ${name}`,
  },

  // 5. Malayalam (മലയാളം)
  ml: {
    resultsHeader: (n) =>
      `അർഹതാ ഫലങ്ങൾ. നിങ്ങളുടെ പ്രൊഫൈൽ അടിസ്ഥാനമാക്കി നിങ്ങൾ ${n} സർക്കാർ ക്ഷേമ പദ്ധതികൾക്ക് അർഹരാണ്. മുഴുവൻ വിവരങ്ങളും വായിക്കുന്നു.`,
    schemeHeader: (i, total, name) => `പദ്ധതി ${i} / ${total}: ${name}.`,
    statusLabel: 'അർഹതാ പദവി: പരിശോധിച്ച അർഹത.',
    whyEligibleLabel: 'നിങ്ങൾ എന്തുകൊണ്ട് അർഹനാകുന്നു:',
    benefitLabel: 'പ്രധാന ആനുകൂല്യം:',
    conditionsLabel: 'പ്രധാന വ്യവസ്ഥകൾ:',
    documentsLabel: 'ആവശ്യമായ രേഖകൾ:',
    applyLabel: 'അപേക്ഷിക്കേണ്ട വിധം: ആധാർ കാർഡും ബാങ്ക് അക്കൗണ്ടുമായി ഔദ്യോഗിക സർക്കാർ പോർട്ടലിലൂടെ അപേക്ഷിക്കാം.',
    nextSchemeTransition: 'അടുത്ത അർഹമായ പദ്ധതി:',
    conclusion: 'നിങ്ങൾക്ക് അർഹമായ എല്ലാ പദ്ധതികളുടെയും വിവരങ്ങൾ പൂർത്തിയായി. കൂടുതൽ വിവരങ്ങൾ സ്ക്രീനിൽ പരിശോധിക്കുക.',
    noResultsFound:
      'നിങ്ങളുടെ നിലവിലെ വിവരങ്ങൾ പ്രകാരം അർഹമായ പദ്ധതികൾ ഒന്നും കണ്ടെത്താനായില്ല. ദയവായി വരുമാനമോ തൊഴിലോ അപ്ഡേറ്റ് ചെയ്യുക.',
    listenResultsBtn: '🔊 അർഹതാ ഫലങ്ങൾ കേൾക്കുക',
    stopBtn: '⏹ നിർത്തുക',
    pauseBtn: '⏸ താൽക്കാലികമായി നിർത്തുക',
    resumeBtn: '▶ തുടരുക',
    readingNowStatus: (i, t, name) => `വായിക്കുന്നു: പദ്ധതി ${i}/${t} - ${name}`,
  },

  // 6. Marathi (मराठी)
  mr: {
    resultsHeader: (n) =>
      `पात्रता निकाल. तुमच्या प्रोफाइलनुसार तुम्ही ${n} सरकारी कल्याणकारी योजनांसाठी पात्र आहात. सर्व योजनांचे तपशील वाचले जात आहेत.`,
    schemeHeader: (i, total, name) => `योजना ${i} / ${total}: ${name}.`,
    statusLabel: 'पात्रता स्थिती: पडताळणीकृत पात्र.',
    whyEligibleLabel: 'तुम्ही का पात्र आहात:',
    benefitLabel: 'मुख्य थेट लाभ:',
    conditionsLabel: 'महत्त्वाच्या अटी:',
    documentsLabel: 'आवश्यक कागदपत्रे:',
    applyLabel: 'अर्ज करण्याची पद्धत: अधिकृत सरकारी पोर्टलवर आधार व बँक पासबुकसह ऑनलाइन अर्ज करू शकता.',
    nextSchemeTransition: 'पुढील पात्र योजना:',
    conclusion: 'ही तुमच्या सर्व पात्र योजनांची संपूर्ण माहिती आहे. अधिक माहितीसाठी स्क्रीन तपासा.',
    noResultsFound:
      'तुमच्या सद्य प्रोफाइलनुसार कोणतीही योजना आढळली नाही. कृपया उत्पन्न, वय किंवा व्यवसाय अद्यतनित करा.',
    listenResultsBtn: '🔊 पात्रता निकाल ऐका',
    stopBtn: '⏹ थांबवा',
    pauseBtn: '⏸ विराम',
    resumeBtn: '▶ सुरू ठेवा',
    readingNowStatus: (i, t, name) => `वाचत आहे: योजना ${i}/${t} - ${name}`,
  },

  // 7. Bengali (বাংলা)
  bn: {
    resultsHeader: (n) =>
      `যোগ্যতার ফলাফল। আপনার প্রোফাইল অনুযায়ী আপনি ${n} টি সরকারি জনকল্যাণমূলক প্রকল্পের জন্য যোগ্য। সম্পূর্ণ বিবরণ পাঠ করা হচ্ছে।`,
    schemeHeader: (i, total, name) => `প্রকল্প ${i} / ${total}: ${name}.`,
    statusLabel: 'যোগ্যতার অবস্থা: যাচাইকৃত যোগ্য।',
    whyEligibleLabel: 'কেন আপনি যোগ্য:',
    benefitLabel: 'প্রধান আর্থিক সুবিধা:',
    conditionsLabel: 'গুরুত্বপূর্ণ শর্তাবলী:',
    documentsLabel: 'প্রয়োজনীয় নথিপত্র:',
    applyLabel: 'আবেদন পদ্ধতি: আধার ও ব্যাঙ্ক অ্যাকাউন্ট সহ সরকারি পোর্টালে অনলাইনে আবেদন করা যাবে।',
    nextSchemeTransition: 'পরবর্তী যোগ্য প্রকল্প:',
    conclusion: 'এটি আপনার সকল যোগ্য প্রকল্পের সম্পূর্ণ তালিকা। আরও বিস্তারিত তথ্যের জন্য স্ক্রিন দেখুন।',
    noResultsFound:
      'আপনার বর্তমান প্রোফাইল অনুসারে কোনো যোগ্য প্রকল্প পাওয়া যায়নি। অনুগ্রহ করে প্রোফাইলের তথ্য আপডেট করুন।',
    listenResultsBtn: '🔊 যোগ্যতার ফলাফল শুনুন',
    stopBtn: '⏹ থামান',
    pauseBtn: '⏸ বিরতি',
    resumeBtn: '▶ পুনরায় শুরু',
    readingNowStatus: (i, t, name) => `পড়া হচ্ছে: প্রকল্প ${i}/${t} - ${name}`,
  },

  // 8. Gujarati (ગુજરાતી)
  gu: {
    resultsHeader: (n) =>
      `પાત્રતા પરિણામો. તમારી પ્રોફાઇલ અનુસાર તમે ${n} સરકારી કલ્યાણકારી યોજનાઓ માટે પાત્ર છો. વિગતો વાંચવામાં આવી રહી છે.`,
    schemeHeader: (i, total, name) => `યોજના ${i} / ${total}: ${name}.`,
    statusLabel: 'પાત્રતા સ્થિતિ: ચકાસાયેલ પાત્ર.',
    whyEligibleLabel: 'તમે શા માટે પાત્ર છો:',
    benefitLabel: 'મુખ્ય સીધો લાભ:',
    conditionsLabel: 'મહત્વની શરતો:',
    documentsLabel: 'જરૂરી દસ્તાવેજો:',
    applyLabel: 'અરજી કરવાની રીત: આધાર કાર્ડ અને બેંક ખાતા સાથે સત્તાવાર સરકારી પોર્ટલ પર ઓનલાઇન અરજી કરી શકો છો.',
    nextSchemeTransition: 'આગામી પાત્ર યોજના:',
    conclusion: 'આ તમારી બધી પાત્ર યોજનાઓની સંપૂર્ણ યાદી છે. વધુ વિગતો માટે સ્ક્રીન તપાસો.',
    noResultsFound:
      'તમારી વર્તમાન પ્રોફાઇલ મુજબ કોઈ પાત્ર યોજનાઓ મળી નથી. કૃપા કરીને આવક અથવા વ્યવસાયની વિગતો અપડેટ કરો.',
    listenResultsBtn: '🔊 પાત્રતા પરિણામો સાંભળો',
    stopBtn: '⏹ રોકો',
    pauseBtn: '⏸ થોભો',
    resumeBtn: '▶ ચાલુ રાખો',
    readingNowStatus: (i, t, name) => `વાંચી રહ્યા છે: યોજના ${i}/${t} - ${name}`,
  },

  // 9. Punjabi (ਪੰਜਾਬੀ)
  pa: {
    resultsHeader: (n) =>
      `ਯੋਗਤਾ ਨਤੀਜੇ। ਤੁਹਾਡੇ ਪ੍ਰੋਫਾਈਲ ਅਨੁਸਾਰ ਤੁਸੀਂ ${n} ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਲਈ ਯੋਗ ਹੋ। ਸਾਰੇ ਵੇਰਵੇ ਪੜ੍ਹੇ ਜਾ ਰਹੇ ਹਨ।`,
    schemeHeader: (i, total, name) => `ਸਕੀਮ ${i} / ${total}: ${name}.`,
    statusLabel: 'ਯੋਗਤਾ ਸਥਿਤੀ: ਪ੍ਰਮਾਣਿਤ ਯੋਗ।',
    whyEligibleLabel: 'ਤੁਸੀਂ ਕਿਉਂ ਯੋਗ ਹੋ:',
    benefitLabel: 'ਮੁੱਖ ਲਾਭ:',
    conditionsLabel: 'ਮਹੱਤਵਪੂਰਨ ਸ਼ਰਤਾਂ:',
    documentsLabel: 'ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼:',
    applyLabel: 'ਅਰਜ਼ੀ ਕਿਵੇਂ ਦੇਣੀ ਹੈ: ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਬੈਂਕ ਖਾਤੇ ਨਾਲ ਸਰਕਾਰੀ ਪੋਰਟਲ ਤੇ ਆਨਲਾਈਨ ਅਪਲਾਈ ਕਰੋ।',
    nextSchemeTransition: 'ਅਗਲੀ ਯੋਗ ਸਕੀਮ:',
    conclusion: 'ਇਹ ਤੁਹਾਡੀਆਂ ਸਾਰੀਆਂ ਯੋਗ ਸਕੀਮਾਂ ਦਾ ਪੂਰਾ ਵੇਰਵਾ ਹੈ। ਹੋਰ ਜਾਣਕਾਰੀ ਲਈ ਸਕ੍ਰੀਨ ਦੇਖੋ।',
    noResultsFound:
      'ਤੁਹਾਡੇ ਮੌਜੂਦਾ ਪ੍ਰੋਫਾਈਲ ਅਨੁਸਾਰ ਕੋਈ ਯੋਗ ਸਕੀਮ ਨਹੀਂ ਮਿਲੀ। ਕਿਰਪਾ ਕਰਕੇ ਪ੍ਰੋਫਾਈਲ ਵੇਰਵੇ ਅੱਪਡੇਟ ਕਰੋ।',
    listenResultsBtn: '🔊 ਯੋਗਤਾ ਨਤੀਜੇ ਸੁਣੋ',
    stopBtn: '⏹ ਰੋਕੋ',
    pauseBtn: '⏸ ਵਿਰਾਮ',
    resumeBtn: '▶ ਜਾਰੀ ਰੱਖੋ',
    readingNowStatus: (i, t, name) => `ਪੜ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ: ਸਕੀਮ ${i}/${t} - ${name}`,
  },

  // 10. Odia (ଓଡ଼ିଆ)
  or: {
    resultsHeader: (n) =>
      `ଯୋଗ୍ୟତା ଫଳାଫଳ। ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ୍ ଅନୁଯାୟୀ ଆପଣ ${n} ଟି ସରକାରୀ ଯୋଜନା ପାଇଁ ଯୋଗ୍ୟ ଅଟନ୍ତି। ବିବରଣୀ ପଢ଼ାଯାଉଛି।`,
    schemeHeader: (i, total, name) => `ଯୋଜନା ${i} / ${total}: ${name}.`,
    statusLabel: 'ଯୋଗ୍ୟତା ସ୍ଥିତି: ପ୍ରମାଣିତ ଯୋଗ୍ୟ।',
    whyEligibleLabel: 'ଆପଣ କାହିଁକି ଯୋଗ୍ୟ:',
    benefitLabel: 'ମୁଖ୍ୟ ସୁବିଧା:',
    conditionsLabel: 'ମୁଖ୍ୟ ଯୋଗ୍ୟତା ନିୟମ:',
    documentsLabel: 'ଆବଶ୍ୟକୀୟ କାଗଜପତ୍ର:',
    applyLabel: 'ଆବେଦନ ପ୍ରଣାଳୀ: ଆଧାର ଓ ବ୍ୟାଙ୍କ ଖାତା ସହିତ ସରକାରୀ ପୋର୍ଟାଲରେ ଅନଲାଇନ୍ ଆବେଦନ କରନ୍ତୁ।',
    nextSchemeTransition: 'ପରବର୍ତ୍ତୀ ଯୋଗ୍ୟ ଯୋଜନା:',
    conclusion: 'ଏହା ଆପଣଙ୍କ ସମସ୍ତ ଯୋଗ୍ୟ ଯୋଜନାର ତାଲିକା। ଅଧିକ ବିବରଣୀ ପାଇଁ ସ୍କ୍ରିନ୍ ଦେଖନ୍ତୁ।',
    noResultsFound:
      'ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ୍ ଅନୁଯାୟୀ କୌଣସି ଯୋଜନା ମିଳିଲା ନାହିଁ। ଦୟାକରି ପ୍ରୋଫାଇଲ୍ ସଂଶୋଧନ କରନ୍ତୁ।',
    listenResultsBtn: '🔊 ଯୋଗ୍ୟତା ଫଳାଫଳ ଶୁଣନ୍ତୁ',
    stopBtn: '⏹ ବନ୍ଦ କରନ୍ତୁ',
    pauseBtn: '⏸ ବିରତି',
    resumeBtn: '▶ ଆଗକୁ ବଢ଼ନ୍ତୁ',
    readingNowStatus: (i, t, name) => `ପଢ଼ାଯାଉଛି: ଯୋଜନା ${i}/${t} - ${name}`,
  },

  // 11. Assamese (অসমীয়া)
  as: {
    resultsHeader: (n) =>
      `যোগ্যতাৰ ফলাফল। আপোনাৰ প্ৰফাইল অনুসৰি আপুনি ${n} খন চৰকাৰী আঁচনিৰ বাবে যোগ্য। সকলো বিৱৰণ পঢ়ি শুনোৱা হৈছে।`,
    schemeHeader: (i, total, name) => `আঁচনি ${i} / ${total}: ${name}.`,
    statusLabel: 'যোগ্যতাৰ স্থিতি: প্ৰমাণিত যোগ্য।',
    whyEligibleLabel: 'আপুনি কিয় যোগ্য:',
    benefitLabel: 'প্ৰধান সুবিধা:',
    conditionsLabel: 'প্ৰয়োজনীয় চৰ্তসমূহ:',
    documentsLabel: 'প্ৰয়োজনীয় নথিপত্ৰ:',
    applyLabel: 'আবেদন পদ্ধতি: আধাৰ আৰু বেংক একাউণ্টৰ সৈতে চৰকাৰী পৰ্টেলত অনলাইন আবেদন কৰক।',
    nextSchemeTransition: 'পৰৱৰ্তী যোগ্য আঁচনি:',
    conclusion: 'এইয়া আপোনাৰ যোগ্য আঁচনিসমূহৰ সম্পূৰ্ণ তালিকা। সবিশেষ জানিবলৈ স্ক্ৰীণত চাওক।',
    noResultsFound:
      'আপোনাৰ বৰ্তমানৰ প্ৰফাইল অনুসৰি কোনো আঁচনি পোৱা নগ’ল। অনুগ্ৰহ কৰি প্ৰফাইল আপডেট কৰক।',
    listenResultsBtn: '🔊 যোগ্যতাৰ ফলাফল শুনক',
    stopBtn: '⏹ বন্ধ কৰক',
    pauseBtn: '⏸ বিৰতি',
    resumeBtn: '▶ পুনৰ আৰম্ভ',
    readingNowStatus: (i, t, name) => `পঢ়া হৈছে: আঁচনি ${i}/${t} - ${name}`,
  },

  // 12. Urdu (اردو)
  ur: {
    resultsHeader: (n) =>
      `اہلیت کے نتائج۔ آپ کے پروفائل کے مطابق آپ ${n} سرکاری فلاحی اسکیموں کے لیے اہل ہیں۔ مکمل تفصیلات پڑھی جا رہی ہیں۔`,
    schemeHeader: (i, total, name) => `اسکیم ${i} از ${total}: ${name}.`,
    statusLabel: 'اہلیت کی حیثیت: تصدیق شدہ اہل۔',
    whyEligibleLabel: 'آپ کیوں اہل ہیں:',
    benefitLabel: 'بنیادی فائدہ:',
    conditionsLabel: 'اہم شرائط:',
    documentsLabel: 'مطلوبہ دستاویزات:',
    applyLabel: 'درخواست کا طریقہ: آدھار اور بینک اکاؤنٹ کے ساتھ سرکاری پورٹل پر آن لائن درخواست دیں۔',
    nextSchemeTransition: 'اگلی اہل اسکیم:',
    conclusion: 'یہ آپ کی تمام اہل اسکیموں کی مکمل فہرست ہے۔ مزید تفصیلات کے لیے اسکرین دیکھیں۔',
    noResultsFound:
      'آپ کے موجودہ پروفائل کے مطابق کوئی اسکیم دستیاب نہیں ہوئی۔ برائے مہربانی معلومات اپ ڈیٹ کریں۔',
    listenResultsBtn: '🔊 اہلیت کے نتائج سنیں',
    stopBtn: '⏹ روکیں',
    pauseBtn: '⏸ وقفہ',
    resumeBtn: '▶ جاری رکھیں',
    readingNowStatus: (i, t, name) => `پڑھا جا رہا ہے: اسکیم ${i}/${t} - ${name}`,
  },

  // 13. Sanskrit (संस्कृतम्)
  sa: {
    resultsHeader: (n) =>
      `पात्रतापरिणामाः। भवतः विवरणानुसारं भवान् ${n} सर्वकारीययोजनाभ्यः योग्यः अस्ति। सर्वेषां विवरणं श्राव्यते।`,
    schemeHeader: (i, total, name) => `योजना ${i} / ${total}: ${name}.`,
    statusLabel: 'पात्रतास्थितिः: प्रमाणीकृतः पात्रः।',
    whyEligibleLabel: 'भवतः पात्रतायाः कारणम्:',
    benefitLabel: 'मुख्यलाभः:',
    conditionsLabel: 'प्रमुखाः नियमाः:',
    documentsLabel: 'आवश्यकपत्राणि:',
    applyLabel: 'आवेदनविधिः: अधिकृतजालपुटे आधारपत्रेण सह पञ्जीकरणं कुर्वन्तु।',
    nextSchemeTransition: 'अग्रिमा योजाना:',
    conclusion: 'एषा भवतः सर्वेषां योग्यानां योजनानां पूर्णा सूचिः अस्ति। अधिकविवरणाय फलकं पश्यन्तु।',
    noResultsFound: 'भवतः विवरणेन कापि योजना न प्राप्ता। कृपया विवरणं नवीकरोतु।',
    listenResultsBtn: '🔊 पात्रतापरिणामान् शृण्वन्तु',
    stopBtn: '⏹ स्थगयतु',
    pauseBtn: '⏸ विरामः',
    resumeBtn: '▶ अनुवर्तताम्',
    readingNowStatus: (i, t, name) => `पठ्यते: योजना ${i}/${t} - ${name}`,
  },

  // 14. Nepali (नेपाली)
  ne: {
    resultsHeader: (n) =>
      `योग्यता परिणामहरू। तपाईंको प्रोफाइल अनुसार तपाईं ${n} सरकारी योजनाहरूका लागि योग्य हुनुहुन्छ। विवरणहरू पढिँदैछ।`,
    schemeHeader: (i, total, name) => `योजना ${i} / ${total}: ${name}.`,
    statusLabel: 'योग्यता स्थिति: प्रमाणित योग्य।',
    whyEligibleLabel: 'तपाईं किन योग्य हुनुहुन्छ:',
    benefitLabel: 'मुख्य प्रत्यक्ष लाभ:',
    conditionsLabel: 'महत्वपूर्ण सर्तहरू:',
    documentsLabel: 'आवश्यक कागजातहरू:',
    applyLabel: 'आवेदन प्रक्रिया: आधिकारिक सरकारी पोर्टलमा आधार र बैंक खातासहित आवेदन दिन सकिन्छ।',
    nextSchemeTransition: 'अर्को योग्य योजना:',
    conclusion: 'यो तपाईंका सबै योग्य योजनाहरूको पूर्ण सूची हो। थप जानकारीका लागि स्क्रिन हेर्नुहोस्।',
    noResultsFound:
      'तपाईंको हालको प्रोफाइल अनुसार कुनै योजना फेला परेन। कृपया आफ्नो विवरण अद्यावधिक गर्नुहोस्।',
    listenResultsBtn: '🔊 योग्यता परिणाम सुन्नुहोस्',
    stopBtn: '⏹ रोक्नुहोस्',
    pauseBtn: '⏸ रोक्नुहोस्',
    resumeBtn: '▶ जारी राख्नुहोस्',
    readingNowStatus: (i, t, name) => `पढ्दै: योजना ${i}/${t} - ${name}`,
  },

  // 15. Maithili (मैथिली)
  mai: {
    resultsHeader: (n) =>
      `पात्रता परिणाम। अहाँक प्रोफाइलक अनुसार अहाँ ${n} टा सरकारी योजनाक लेल पात्र छी। सभ विवरण सुनाओल जा रहल अछि।`,
    schemeHeader: (i, total, name) => `योजना ${i} / ${total}: ${name}.`,
    statusLabel: 'पात्रता स्थिति: प्रमाणित पात्र।',
    whyEligibleLabel: 'अहाँ किएक पात्र छी:',
    benefitLabel: 'मुख्य लाभ:',
    conditionsLabel: 'महत्वपूर्ण शर्त:',
    documentsLabel: 'आवश्यक दस्तावेज:',
    applyLabel: 'आवेदन प्रक्रिया: आधिकारिक पोर्टल पर आधार आ बैंक पासबुक संग आवेदन करू।',
    nextSchemeTransition: 'अगिला पात्र योजना:',
    conclusion: 'ई अहाँक सभ पात्र योजनाक सूची अछि। बेसी जानकारीक लेल स्क्रीन देखू।',
    noResultsFound: 'अहाँक प्रोफाइलक अनुसार कोनो योजना नहि भेटल। कृपया विवरण अपडेट करू।',
    listenResultsBtn: '🔊 पात्रता परिणाम सुनू',
    stopBtn: '⏹ रोकू',
    pauseBtn: '⏸ विराम',
    resumeBtn: '▶ चालू राखू',
    readingNowStatus: (i, t, name) => `सुनाओल जा रहल अछि: योजना ${i}/${t} - ${name}`,
  },

  // 16. Konkani (कोंकणी)
  kok: {
    resultsHeader: (n) =>
      `पात्रता निकाल. तुमच्या प्रोफाइल प्रमाणें तुमी ${n} सरकारी येवजण्यांक पात्र आसात. पुराय म्हायती वाचून दाखयतात.`,
    schemeHeader: (i, total, name) => `येवजण ${i} / ${total}: ${name}.`,
    statusLabel: 'पात्रता स्थिती: खात्री केल्ली पात्र.',
    whyEligibleLabel: 'तुमी कित्याक पात्र आसात:',
    benefitLabel: 'मुखेल फायदो:',
    conditionsLabel: 'महत्वाच्यो अटी:',
    documentsLabel: 'गरजेचीं कागदपत्रां:',
    applyLabel: 'अर्ज करपाची पद्दत: अधिकृत सरकारी पोर्टलार आधार कार्ड आनी बँक खात्या सयत अर्ज करात.',
    nextSchemeTransition: 'फुडली पात्र येवजण:',
    conclusion: 'ही तुमच्या सगळ्या पात्र येवजण्यांची पुराय वळेरी. चड म्हायती खातीर स्क्रीन पळयात.',
    noResultsFound: 'तुमच्या सद्याच्या प्रोफाइल प्रमाणें कसलीच येवजण मेळूंक ना. प्रोफाइल सुदारात.',
    listenResultsBtn: '🔊 पात्रता निकाल आयकात',
    stopBtn: '⏹ रावा',
    pauseBtn: '⏸ विसव',
    resumeBtn: '▶ फुडें चालू दवरात',
    readingNowStatus: (i, t, name) => `वाचतात: येवजण ${i}/${t} - ${name}`,
  },

  // 17. Kashmiri (कॉशुर / کٲشُر)
  ks: {
    resultsHeader: (n) =>
      `اہلیتُک نتیجہ۔ تٔہندِس پروفائلَس مُطابق چھِو تُہؠ ${n} سَرکٲرؠ سکیٖمن خٲطرٕ اہل۔ تفصیل چھِ پَرنہٕ یِوان۔`,
    schemeHeader: (i, total, name) => `سکیٖم ${i} از ${total}: ${name}.`,
    statusLabel: 'اہلیتٕچ حالت: تَصدیٖق شُدٕ اہل۔',
    whyEligibleLabel: 'تُہؠ کیازِ چھِو اہل:',
    benefitLabel: 'بُنیٲدی فٲئدٕ:',
    conditionsLabel: 'ضروٗری شَرطہٕ:',
    documentsLabel: 'ضروٗری دَستاویٖز:',
    applyLabel: 'دَرخواست دِیوٚک طریقہٕ: سَرکٲرؠ پورٹَلَس پؠٹھ کٔرِو آدھار تہٕ بینک کھاتَس سٟتؠ آن لائن دَرخواست۔',
    nextSchemeTransition: 'دویِم اہل سکیٖم:',
    conclusion: 'یہِ چھِ تُہندٮ۪ن سارِوی اہل سکیٖمن ہٕنٛز فِہرِست۔ زیٛادٕ معلوٗمات خٲطرٕ وُچھِو سکرین۔',
    noResultsFound: 'تٔہندِس سَدیا پروفائلَس مُطابق مِلی نہٕ کانہہ سکیٖم۔ مہرَبٲنی کٔرِتھ کٔرِو تَفصیٖل اَپڈیٹ۔',
    listenResultsBtn: '🔊 اہلیتُک نتیجہ بوزِو',
    stopBtn: '⏹ تھٲوِو',
    pauseBtn: '⏸ وَقفہٕ',
    resumeBtn: '▶ کٔرِو جاری',
    readingNowStatus: (i, t, name) => `پَرنہٕ یِوان چھُ: سکیٖم ${i}/${t} - ${name}`,
  },

  // 18. Dogri (डोगरी)
  doi: {
    resultsHeader: (n) =>
      `पात्रता नतीजे। तुंदे प्रोफाइल मताबक तुस ${n} सरकारी स्कीमां आस्तै पात्र ओ। सारे विवरण पढ़े जा करदे न।`,
    schemeHeader: (i, total, name) => `स्कीम ${i} / ${total}: ${name}.`,
    statusLabel: 'पात्रता स्थिति: तसदीकशुदा पात्र।',
    whyEligibleLabel: 'तुस कीं पात्र ओ:',
    benefitLabel: 'मुख्य फायदा:',
    conditionsLabel: 'खास शर्तियां:',
    documentsLabel: 'लोड़वे दस्तावेज:',
    applyLabel: 'अर्जी देने दा तरीका: सरकारी पोर्टल पर आधार ते बैंक खाते कन्नै अर्जी देओ।',
    nextSchemeTransition: 'अगली पात्र स्कीम:',
    conclusion: 'एह तुंदी सारी पात्र स्कीमां दी पूरी सूची ऐ। मते विवरण आस्तै स्क्रीन दिखो।',
    noResultsFound: 'तुंदे प्रोफाइल मताबक कोई स्कीम नेईं लब्भी। मेहरबानी करियै प्रोफाइल अपडेट करो।',
    listenResultsBtn: '🔊 पात्रता नतीजे सुनो',
    stopBtn: '⏹ रोको',
    pauseBtn: '⏸ विराम',
    resumeBtn: '▶ जारी रक्खो',
    readingNowStatus: (i, t, name) => `पढ़िया जा करदा ऐ: स्कीम ${i}/${t} - ${name}`,
  },

  // 19. Bodo (बर' राव)
  brx: {
    resultsHeader: (n) =>
      `पात्रता फिथाय। नोंथांनि प्र'फाइल बादियै नोंथाङा ${n} सरकारि बिथांखिनि थाखाय पात्र। गासै बिथांखिखौ फरायना खोनासं होनाय जादों।`,
    schemeHeader: (i, total, name) => `बिथांखि ${i} / ${total}: ${name}.`,
    statusLabel: 'पात्रता थासारि: नायबिजिरनाय पात्र।',
    whyEligibleLabel: 'नोंथाङा मानो पात्र:',
    benefitLabel: 'गाहाय मुलाम्फा:',
    conditionsLabel: 'गोनांथार रादाब:',
    documentsLabel: 'गोनां लिरबिदांफोर:',
    applyLabel: 'आरज गाबनाय नेम: सरकारि पोर्टलआव आधार आरो बेंक एकाउन्टजों अनलाइन आरज गाब।',
    nextSchemeTransition: 'गांग्रोआरि बिथांखि:',
    conclusion: 'बेनो नोंथांनि पात्र बिथांखिफोरनि गासै फारिलाइ। बांसिन मिथिनो स्क्रिनआव नाय।',
    noResultsFound: 'नोंथांनि दासिमनि प्रफाइल बादियै जेबो बिथांखि मोनाखै। अननानै प्रफाइल फोसाव।',
    listenResultsBtn: '🔊 पात्रता फिथाय खोनासं',
    stopBtn: '⏹ थादʼ',
    pauseBtn: '⏸ थादʼथʼ',
    resumeBtn: '▶ सालायबाय था',
    readingNowStatus: (i, t, name) => `फरायगासिनो दं: बिथांखि ${i}/${t} - ${name}`,
  },

  // 20. Manipuri (মৈতৈলোন্)
  mni: {
    resultsHeader: (n) =>
      `ইলিজিবিলিতি মহৈ। নহাক্কী প্রোফাইলগী মতুং ইন্না নহাক সরকারগী স্কিম ${n} গীদমক যোগ্য ওইরে। অপুনবা ৱারোলশিং পাথোক্লি।`,
    schemeHeader: (i, total, name) => `স্কিম ${i} / ${total}: ${name}.`,
    statusLabel: 'ইলিজিবিলিতি ফীভম: ভেরিফাই তৌরবা যোগ্য।',
    whyEligibleLabel: 'নহাক করম্না যোগ্য ওইরিবনো:',
    benefitLabel: 'মরুওইবা কান্নবা:',
    conditionsLabel: 'মরুওইবা চৎন-পথংশিং:',
    documentsLabel: 'মথৌ তাবা চে-চাংশিং:',
    applyLabel: 'দরখাস্ত তৌবগী পাম্বৈ: আধার অমসুং বেঙ্ক একাউন্টগা লোয়ননা ওফিসিয়েল পোর্টেলদা ওনলাইন এপ্লাই তৌবীয়ু।',
    nextSchemeTransition: 'মথংগী যোগ্য স্কিম:',
    conclusion: 'মসি নহাক্কী যোগ্য স্কিমশিংগী মপুংফাবা পরিংনি। হেন্না খঙনবগীদমক স্ক্রিন য়েংবীয়ু।',
    noResultsFound: 'নহাক্কী হৌজিক লৈরিবা প্রোফাইলগী মতুং ইন্না স্কিম অমত্তা ফংদ্রে। প্রোফাইল অপদেত তৌবীয়ু।',
    listenResultsBtn: '🔊 ইলিজিবিলিতি মহৈ তাগনু',
    stopBtn: '⏹ লেপপু',
    pauseBtn: '⏸ পোথারু',
    resumeBtn: '▶ মখা চত্থখো',
    readingNowStatus: (i, t, name) => `পাথোক্লি: স্কিম ${i}/${t} - ${name}`,
  },

  // 21. Santhali (ᱥᱟᱱᱛᱟᱲᱤ)
  sat: {
    resultsHeader: (n) =>
      `ᱡᱚᱜᱽᱭᱚᱛᱟ ᱚᱨᱡᱚ ᱾ ᱟᱢᱟᱜ ᱯᱨᱚᱯᱷᱟᱭᱤᱞ ᱞᱮᱠᱟᱛᱮ ᱟᱢ ${n} ᱥᱚᱨᱠᱟᱨᱤ ᱡᱚᱡᱚᱱᱟ ᱞᱟᱹᱜᱤᱫ ᱡᱚᱜᱽᱭᱚ ᱠᱟᱱᱟᱢ ᱾ ᱡᱚᱛᱚ ᱠᱟᱛᱷᱟ ᱯᱟᱲᱦᱟᱣ ᱦᱩᱭᱩᱜ ᱠᱟᱱᱟ ᱾`,
    schemeHeader: (i, total, name) => `ᱡᱚᱡᱚᱱᱟ ${i} / ${total}: ${name} ᱾`,
    statusLabel: 'ᱡᱚᱜᱽᱭᱚᱛᱟ ᱴᱷᱟᱶ: ᱯᱩᱨᱟᱹᱣ ᱡᱚᱜᱽᱭᱚ ᱾',
    whyEligibleLabel: 'ᱟᱢ ᱪᱮᱫᱟᱜ ᱡᱚᱜᱽᱭᱚ ᱠᱟᱱᱟᱢ:',
    benefitLabel: 'ᱢᱩᱬᱩᱛ ᱞᱟᱵᱷ:',
    conditionsLabel: 'ᱡᱟᱹᱨᱩᱲ ᱱᱤᱭᱚᱢ:',
    documentsLabel: 'ᱫᱚᱨᱠᱟᱨ ᱠᱟᱜᱚᱡᱽ:',
    applyLabel: 'ᱟᱨᱫᱟᱥ ᱦᱚᱨ: ᱟᱫᱷᱟᱨ ᱟᱨ ᱵᱮᱸᱠ ᱮᱠᱟᱣᱩᱱᱴ ᱥᱟᱶ ᱥᱚᱨᱠᱟᱨᱤ ᱯᱳᱨᱴᱟᱞ ᱨᱮ ᱚᱱᱞᱟᱭᱤᱱ ᱟᱨᱫᱟᱥ ᱢᱮ ᱾',
    nextSchemeTransition: 'ᱤᱱᱟᱹ ᱛᱟᱭᱚᱢ ᱡᱚᱡᱚᱱᱟ:',
    conclusion: 'ᱱᱚᱣᱟ ᱫᱚ ᱟᱢᱟᱜ ᱡᱚᱛᱚ ᱡᱚᱜᱽᱭᱚ ᱡᱚᱡᱚᱱᱟ ᱨᱮᱱᱟᱜ ᱛᱟᱹᱞᱠᱟᱹ ᱠᱟᱱᱟ ᱾ ᱵᱟᱹᱲᱛᱤ ᱵᱟᱰᱟᱭ ᱞᱟᱹᱜᱤᱫ ᱥᱠᱨᱤᱱ ᱧᱮᱞ ᱢᱮ ᱾',
    noResultsFound: 'ᱟᱢᱟᱜ ᱯᱨᱚᱯᱷᱟᱭᱤᱞ ᱞᱮᱠᱟᱛᱮ ᱡᱟᱦᱟᱱ ᱡᱚᱡᱚᱱᱟ ᱵᱟᱝ ᱧᱟᱢ ᱞᱮᱱᱟ ᱾ ᱫᱟᱭᱟᱠᱟᱛᱮ ᱯᱨᱚᱯᱷᱟᱭᱤᱞ ᱥᱟᱡᱟᱣ ᱢᱮ ᱾',
    listenResultsBtn: '🔊 ᱡᱚᱜᱽᱭᱚᱛᱟ ᱚᱨᱡᱚ ᱟᱸᱡᱚᱢ ᱢᱮ',
    stopBtn: '⏹ ᱛᱷᱟᱢᱵᱟᱣ',
    pauseBtn: '⏸ ᱡᱤᱨᱟᱹᱣ',
    resumeBtn: '▶ ᱪᱟᱹᱞᱩᱭ ᱢᱮ',
    readingNowStatus: (i, t, name) => `ᱯᱟᱲᱦᱟᱣ ᱠᱟᱱᱟ: ᱡᱚᱡᱚᱱᱟ ${i}/${t} - ${name}`,
  },

  // 22. Sindhi (سنڌي)
  sd: {
    resultsHeader: (n) =>
      `اهليت جا نتيجا. توهان جي پروفائل موجب توهان ${n} سرڪاري اسڪيمن جا اهل آهيو. سڀ تفصيل پڙهيا پيا وڃن.`,
    schemeHeader: (i, total, name) => `اسڪيم ${i} مان ${total}: ${name}.`,
    statusLabel: 'اهليت جي حيثيت: تصديق ٿيل اهل.',
    whyEligibleLabel: 'توهان ڇو اهل آهيو:',
    benefitLabel: 'مکيه فائدو:',
    conditionsLabel: 'ضروري شرط:',
    documentsLabel: 'گهربل دستاويز:',
    applyLabel: 'درخواست جو طريقو: آڌار ۽ بينڪ کاتي سان سرڪاري پورٽل تي آن لائن درخواست ڏيو.',
    nextSchemeTransition: 'ايندڙ اهل اسڪيم:',
    conclusion: 'هي توهان جي سڀني اهل اسڪيمن جي مڪمل فهرست آهي. وڌيڪ تفصيل لاءِ اسڪرين ڏسو.',
    noResultsFound: 'توهان جي موجوده پروفائل موجب ڪابه اسڪيم نه ملي. مهرباني ڪري تفصيل اپڊيٽ ڪريو.',
    listenResultsBtn: '🔊 اهليت جا نتيجا ٻڌو',
    stopBtn: '⏹ بند ڪريو',
    pauseBtn: '⏸ وقفو',
    resumeBtn: '▶ جاري رکو',
    readingNowStatus: (i, t, name) => `پڙهيو پيو وڃي: اسڪيم ${i}/${t} - ${name}`,
  },

  // 23. English (Default fallback)
  en: {
    resultsHeader: (n) =>
      `Eligibility Results. Based on your verified profile, you are eligible for ${n} government welfare schemes. Reading full scheme details sequentially.`,
    schemeHeader: (i, total, name) => `Scheme ${i} of ${total}: ${name}.`,
    statusLabel: 'Eligibility Status: Verified Eligible.',
    whyEligibleLabel: 'Why you are eligible:',
    benefitLabel: 'Direct Welfare Benefit:',
    conditionsLabel: 'Important Eligibility Conditions:',
    documentsLabel: 'Required Documents:',
    applyLabel: 'How to Apply: You can apply online via the official government portal using your Aadhaar and bank passbook.',
    nextSchemeTransition: 'Moving to next eligible scheme:',
    conclusion: 'This concludes your complete list of eligible schemes. Review details on screen or select any scheme to view required documents and application steps.',
    noResultsFound:
      'No eligible schemes found based on your current profile parameters. Please check your income ceiling, occupation, or age criteria and update your profile to discover other welfare programs.',
    listenResultsBtn: '🔊 Listen to Eligibility Results',
    stopBtn: '⏹ Stop',
    pauseBtn: '⏸ Pause',
    resumeBtn: '▶ Resume',
    readingNowStatus: (i, t, name) => `Reading Scheme ${i} of ${t}: ${name}`,
  },
};

/**
 * Clean up text for natural TTS pronunciation (remove asterisks, markdown, emojis, HTML tags)
 */
export function cleanForTTS(text: string): string {
  if (!text) return '';
  return text
    .replace(/[🟢🔵⚪🌾🎓👷💼👩📋✓❌₹]/g, ' ')
    .replace(/\b₹\s*(\d+)/g, 'Rs. $1')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Builds sequential speech items for all eligible schemes evaluated in HomeView
 */
export function buildHomeEligibilitySpeechUnits(
  evaluatedSchemes: EvaluatedScheme[],
  language: Language,
  helpers: {
    getSchemeTitle: (s: Scheme) => string;
    getSchemeDescription: (s: Scheme) => string;
    getSchemeBenefit: (s: Scheme) => string;
    getSchemeDocuments: (s: Scheme) => string[];
  }
): SpokenSchemeUnit[] {
  const strings = MULTILINGUAL_VOICE_STRINGS[language] || MULTILINGUAL_VOICE_STRINGS.en;
  const total = evaluatedSchemes.length;

  if (total === 0) {
    return [
      {
        id: 'no-results',
        schemeIndex: 0,
        schemeId: 'none',
        schemeName: 'No Eligible Schemes',
        fullSpeechText: cleanForTTS(strings.noResultsFound),
        summaryText: strings.noResultsFound,
      },
    ];
  }

  const units: SpokenSchemeUnit[] = [];

  evaluatedSchemes.forEach((item, index) => {
    const schemeIndex = index + 1;
    const title = helpers.getSchemeTitle(item.scheme);
    const benefit = helpers.getSchemeBenefit(item.scheme);
    const docs = helpers.getSchemeDocuments(item.scheme);
    const reasons = item.reasons && item.reasons.length > 0 ? item.reasons : [];

    // Construct spoken text for this scheme
    const parts: string[] = [];

    // If first item, prepend overall header
    if (index === 0) {
      parts.push(strings.resultsHeader(total));
    }

    // Scheme Announcement
    parts.push(strings.schemeHeader(schemeIndex, total, title));
    parts.push(strings.statusLabel);

    // Why eligible
    if (reasons.length > 0) {
      const reasonsText = reasons.map((r) => r.replace(/^[✓\s*-]+/, '').trim()).join('. ');
      parts.push(`${strings.whyEligibleLabel} ${reasonsText}.`);
    }

    // Direct Benefit
    if (benefit) {
      parts.push(`${strings.benefitLabel} ${benefit}.`);
    }

    // Important Conditions (e.g. from scheme description)
    const desc = helpers.getSchemeDescription(item.scheme);
    if (desc) {
      parts.push(`${strings.conditionsLabel} ${desc}.`);
    }

    // Required Documents
    if (docs && docs.length > 0) {
      parts.push(`${strings.documentsLabel} ${docs.join(', ')}.`);
    }

    // Application guidance
    parts.push(strings.applyLabel);

    // Transition to next or concluding statement
    if (schemeIndex < total) {
      parts.push(strings.nextSchemeTransition);
    } else {
      parts.push(strings.conclusion);
    }

    const fullText = cleanForTTS(parts.join(' '));

    units.push({
      id: item.scheme.id,
      schemeIndex,
      schemeId: item.scheme.id,
      schemeName: title,
      fullSpeechText: fullText,
      summaryText: title,
      benefit,
      reasons,
      documents: docs,
    });
  });

  return units;
}

/**
 * Builds sequential speech items for RAG Scheme Search results
 */
export function buildRAGEligibilitySpeechUnits(
  ragSchemes: RAGSchemeResult[],
  language: Language
): SpokenSchemeUnit[] {
  const strings = MULTILINGUAL_VOICE_STRINGS[language] || MULTILINGUAL_VOICE_STRINGS.en;
  const total = ragSchemes.length;

  if (total === 0) {
    return [
      {
        id: 'rag-no-results',
        schemeIndex: 0,
        schemeId: 'none',
        schemeName: 'No Eligible Schemes',
        fullSpeechText: cleanForTTS(strings.noResultsFound),
        summaryText: strings.noResultsFound,
      },
    ];
  }

  const units: SpokenSchemeUnit[] = [];

  ragSchemes.forEach((scheme, index) => {
    const schemeIndex = index + 1;
    const title = scheme.schemeName;
    const parts: string[] = [];

    if (index === 0) {
      parts.push(strings.resultsHeader(total));
    }

    parts.push(strings.schemeHeader(schemeIndex, total, title));
    parts.push(strings.statusLabel);

    if (scheme.eligibilityMatchReason) {
      parts.push(`${strings.whyEligibleLabel} ${scheme.eligibilityMatchReason}.`);
    }

    if (scheme.benefits) {
      parts.push(`${strings.benefitLabel} ${scheme.benefits}.`);
    }

    if (scheme.whoIsEligible) {
      parts.push(`${strings.conditionsLabel} ${scheme.whoIsEligible}.`);
    }

    if (scheme.requiredDocuments && scheme.requiredDocuments.length > 0) {
      parts.push(`${strings.documentsLabel} ${scheme.requiredDocuments.join(', ')}.`);
    }

    if (scheme.howToApply) {
      parts.push(`${strings.applyLabel} ${scheme.howToApply}.`);
    } else {
      parts.push(strings.applyLabel);
    }

    if (schemeIndex < total) {
      parts.push(strings.nextSchemeTransition);
    } else {
      parts.push(strings.conclusion);
    }

    const fullText = cleanForTTS(parts.join(' '));

    units.push({
      id: `rag-scheme-${index}`,
      schemeIndex,
      schemeId: `rag-${index}`,
      schemeName: title,
      fullSpeechText: fullText,
      summaryText: title,
      benefit: scheme.benefits,
      reasons: scheme.eligibilityMatchReason ? [scheme.eligibilityMatchReason] : [],
      documents: scheme.requiredDocuments,
    });
  });

  return units;
}

/**
 * Intelligent voice resolution for all 22 Indian languages + English
 */
export function findBestVoiceForLanguage(
  langCode: Language,
  voices: SpeechSynthesisVoice[]
): { voice: SpeechSynthesisVoice | null; targetLangCode: string } {
  const langOpt = getLanguageOption(langCode);
  const targetSpeechCode = (langOpt?.speechCode || `${langCode}-IN`).toLowerCase();
  const baseLang = langCode.toLowerCase();

  if (!voices || voices.length === 0) {
    return { voice: null, targetLangCode: langOpt?.speechCode || 'en-IN' };
  }

  // 1. Exact match on speechCode (e.g. 'kn-in', 'hi-in', 'ta-in', 'te-in', 'ml-in', 'mr-in', 'bn-in')
  let matched = voices.find((v) => v.lang.toLowerCase() === targetSpeechCode);
  if (matched) return { voice: matched, targetLangCode: matched.lang };

  // 2. Starts with baseLang code (e.g. 'kn', 'hi', 'ta', 'te', 'ml', 'mr', 'bn', 'gu', 'pa', 'or')
  matched = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith(`${baseLang}-`) ||
      v.lang.toLowerCase().startsWith(`${baseLang}_`) ||
      v.lang.toLowerCase() === baseLang
  );
  if (matched) return { voice: matched, targetLangCode: matched.lang };

  // 3. Name includes language label (e.g. "Kannada", "Hindi", "Tamil", "Malayalam", "Telugu", etc.)
  const label = langOpt?.label?.toLowerCase() || '';
  if (label) {
    matched = voices.find((v) => v.name.toLowerCase().includes(label));
    if (matched) return { voice: matched, targetLangCode: matched.lang };
  }

  // 4. Try Indian English ('en-in') or any Indian regional voice
  matched = voices.find(
    (v) =>
      v.lang.toLowerCase() === 'en-in' ||
      v.lang.toLowerCase().includes('in') ||
      v.name.toLowerCase().includes('india')
  );
  if (matched) return { voice: matched, targetLangCode: matched.lang };

  // 5. Default voice
  const defaultVoice = voices.find((v) => v.default) || voices[0] || null;
  return { voice: defaultVoice, targetLangCode: defaultVoice ? defaultVoice.lang : 'en-IN' };
}
