import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, Scheme } from '../types';
import { translations, Translations, getTranslatedReason } from './translations';

export { getTranslatedReason };

export interface LanguageOption {
  code: Language;
  label: string;
  native: string;
}

// Exactly the 22 Indian languages requested by the user
export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'brx', label: 'Bodo', native: "बर' राव" },
  { code: 'doi', label: 'Dogri', native: 'डोगरी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ks', label: 'Kashmiri', native: 'कॉशुर / کٲشُر' },
  { code: 'kok', label: 'Konkani', native: 'कोंकणी' },
  { code: 'mai', label: 'Maithili', native: 'मैथिली' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'mni', label: 'Manipuri', native: 'মৈতৈলোন্' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'ne', label: 'Nepali', native: 'नेपाली' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'sa', label: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'sat', label: 'Santhali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'sd', label: 'Sindhi', native: 'سنڌي' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
];

// All supported languages including English
export const ALL_SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English' },
  ...INDIAN_LANGUAGES,
];

interface SchemeLocalization {
  title?: string;
  desc?: string;
  benefit?: string;
  documents?: string[];
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  getSchemeTitle: (scheme: Scheme) => string;
  getSchemeDescription: (scheme: Scheme) => string;
  getSchemeBenefit: (scheme: Scheme) => string;
  getSchemeDocuments: (scheme: Scheme) => string[];
  formatCurrencyText: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Localized scheme details dictionary
const SCHEME_TRANSLATIONS: Record<string, Partial<Record<Language, SchemeLocalization>>> = {
  'pm-kisan': {
    en: {
      title: 'PM-KISAN Samman Nidhi',
      desc: 'Income support to all landholding farmer families having cultivable agricultural land to procure crop health inputs and domestic essentials.',
      benefit: '₹6,00,0 annual financial support (3 installments of ₹2,000 via DBT)',
      documents: [
        'Aadhaar Card',
        'Land Ownership Record (RTC / 7/12 / Patta)',
        'Bank Account with Active Aadhaar-DBT Seeding',
      ],
    },
    kn: {
      title: 'ಪ್ರಧಾನಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ (PM-KISAN)',
      desc: 'ಕೃಷಿ ಪರಿಕರಗಳು ಮತ್ತು ಅಗತ್ಯ ವಸ್ತುಗಳನ್ನು ಖರೀದಿಸಲು ಕೃಷಿ ಭೂಮಿ ಹೊಂದಿರುವ ಎಲ್ಲಾ ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತ ಕುಟುಂಬಗಳಿಗೆ ಆದಾಯ ಬೆಂಬಲ.',
      benefit: 'ವಾರ್ಷಿಕ ₹೬,೦೦೦ ಆರ್ಥಿಕ ನೆರವು (ಡಿಬಿಟಿ ಮೂಲಕ ತಲಾ ₹೨,೦೦೦ ರ ೩ ಕಂತುಗಳು)',
      documents: [
        'ಆಧಾರ್ ಕಾರ್ಡ್',
        'ಜಮೀನಿನ ಪಹಣಿ / RTC ದಾಖಲೆ',
        'ಡಿಬಿಟಿ ಸಕ್ರಿಯವಿರುವ ಬ್ಯಾಂಕ್ ಖಾತೆ',
      ],
    },
    hi: {
      title: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
      desc: 'खेती योग्य भूमि वाले सभी भूमिधारक किसान परिवारों को फसल इनपुट और आवश्यक जरूरतों को पूरा करने के लिए वित्तीय सहायता।',
      benefit: '₹6,000 वार्षिक वित्तीय सहायता (डीबीटी के माध्यम से ₹2,000 की 3 किस्तें)',
      documents: [
        'आधार कार्ड',
        'भूमि स्वामित्व रिकॉर्ड (खतौनी / पट्टा)',
        'आधार-डीबीटी से जुड़ा बैंक खाता',
      ],
    },
    ta: {
      title: 'பிரதான் மந்திரி கிசான் சம்மான் நிதி (PM-KISAN)',
      desc: 'விவசாய இடுபொருட்களை வாங்க நிலமுள்ள அனைத்து விவசாய குடும்பங்களுக்கும் நேரடி வருமான ஆதரவு.',
      benefit: 'ஆண்டுதோறும் ₹6,000 நிதி உதவி (DBT மூலம் தலா ₹2,000 வீதம் 3 தவணைகள்)',
      documents: ['ஆதார் அட்டை', 'பட்டா / சிட்டா நில ஆவணம்', 'ஆதார் இணைக்கப்பட்ட வங்கி கணக்கு'],
    },
    te: {
      title: 'ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి (PM-KISAN)',
      desc: 'వ్యవసాయ పెట్టుబడుల కోసం సాగు భూమి ఉన్న రైతు కుటుంబాలకు వార్షిక ఆదాయ మద్దతు.',
      benefit: 'వార్షిక ₹6,000 ఆర్థిక సహాయం (DBT ద్వారా ₹2,000 చొప్పున 3 విడతలు)',
      documents: ['ఆధార్ కార్డు', 'పట్టాదారు పాస్‌బుక్ / రెవెన్యూ రికార్డు', 'ఆధార్ లింక్ అయిన బ్యాంక్ ఖాతా'],
    },
    ml: {
      title: 'പ്രധാനമന്ത്രി കിസാൻ സമ്മാൻ നിധി (PM-KISAN)',
      desc: 'കൃഷിഭൂമിയുള്ള എല്ലാ കർഷക കുടുംബങ്ങൾക്കും കാർഷിക ആവശ്യങ്ങൾക്കായി സാമ്പത്തിക സഹായം.',
      benefit: 'പ്രതിവർഷം ₹6,000 സാമ്പത്തിക സഹായം (DBT വഴി ₹2,000 വീതമുള്ള 3 ഗഡുക്കൾ)',
      documents: ['ആധാർ കാർഡ്', 'ഭൂമിയുടെ കരം രസീത് / പട്ടയം', 'ആധാർ ലിങ്ക് ചെയ്ത ബാങ്ക് അക്കൗണ്ട്'],
    },
    mr: {
      title: 'प्रधानमंत्री किसान सन्मान निधी (PM-KISAN)',
      desc: 'शेतीसाठी खते व बियाणे खरेदी करण्यासाठी शेतजमीनधारक शेतकरी कुटुंबांना आर्थिक मदत.',
      benefit: 'वार्षिक ₹६,००० आर्थिक सहाय्य (डीबीटी द्वारे ₹२,००० चे ३ हप्ते)',
      documents: ['आधार कार्ड', '७/१२ उतारा व ८-अ नोंद', 'आधार संलग्न बँक खाते'],
    },
    bn: {
      title: 'প্রধানমন্ত্রী কিষাণ সম্মান নিধি (PM-KISAN)',
      desc: 'চাষযোগ্য জমির মালিক সকল কৃষক পরিবারকে কৃষি উপকরণ কেনার জন্য আর্থিক সহায়তা।',
      benefit: 'বার্ষিক ₹৬,০০০ আর্থিক সহায়তা (ডিবিটির মাধ্যমে ₹২,০০০ এর ৩টি কিস্তি)',
      documents: ['আধার কার্ড', 'জমির পরচা / খতিয়ান', 'আধার সংযুক্ত ব্যাঙ্ক অ্যাকাউন্ট'],
    },
  },
  'krishi-sinchayee': {
    en: {
      title: 'PM Krishi Sinchayee Yojana (Micro-Irrigation Subsidy)',
      desc: 'Accelerates water-use efficiency through Per Drop More Crop. Small and marginal farmers in Karnataka receive up to 90% subsidy for drip irrigation systems.',
      benefit: 'Up to 90% Capital Subsidy on Drip & Sprinkler Micro-Irrigation',
      documents: [
        'RTC / Land Survey Sketch (Form 16)',
        'Small Farmer Certificate (Tahsildar)',
        'Water Source / Borewell Electricity Clearance',
        'Bank Passbook',
      ],
    },
    kn: {
      title: 'ಪ್ರಧಾನಮಂತ್ರಿ ಕೃಷಿ ಸಿಂಚಾಯಿ ಯೋಜನೆ (ಹನಿ ನೀರಾವರಿ ಸಹಾಯಧನ)',
      desc: 'ಪ್ರತಿ ಹನಿಗೆ ಹೆಚ್ಚು ಬೆಳೆ ಮೂಲಕ ನೀರಿನ ಬಳಕೆಯ ದಕ್ಷತೆಯನ್ನು ಹೆಚ್ಚಿಸುವುದು. ಕರ್ನಾಟಕದ ಸಣ್ಣ ರೈತರಿಗೆ ಹನಿ ನೀರಾವರಿ ವ್ಯವಸ್ಥೆಗೆ 90% ವರೆಗೆ ಸಬ್ಸಿಡಿ.',
      benefit: 'ಹನಿ ಮತ್ತು ತುಂತುರು ನೀರಾವರಿ ಉಪಕರಣಗಳಿಗೆ ೯೦% ವರೆಗೆ ಬಂಡವಾಳ ಸಬ್ಸಿಡಿ',
      documents: [
        'ಆರ್‌ಟಿಸಿ / ಪಹಣಿ ದಾಖಲೆ (ನಮೂನೆ ೧೬)',
        'ಸಣ್ಣ ರೈತರ ಪ್ರಮಾಣಪತ್ರ (ತಹಶೀಲ್ದಾರ್)',
        'ಬೋರ್‌ವೆಲ್ ನೀರಾವರಿ ದೃಢೀಕರಣ ಪತ್ರ',
        'ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್',
      ],
    },
    hi: {
      title: 'प्रधानमंत्री कृषि सिंचाई योजना (सूक्ष्म सिंचाई सब्सिडी)',
      desc: 'प्रति बूंद अधिक फसल के माध्यम से जल दक्षता में सुधार। कर्नाटक के छोटे और सीमांत किसानों को ड्रिप सिंचाई प्रणाली पर 90% तक सब्सिडी।',
      benefit: 'ड्रिप एवं स्प्रिंकलर सिंचाई पर 90% तक पूंजीगत सब्सिडी',
      documents: [
        'खतौनी / भूमि सर्वेक्षण स्केच',
        'लघु/सीमांत किसान प्रमाण पत्र',
        'बोरवेल/जल स्रोत प्रमाण पत्र',
        'बैंक पासबुक',
      ],
    },
  },
  'ssp-scholarship': {
    en: {
      title: 'State Scholarship Portal (SSP) Post-Matric',
      desc: 'Financial assistance for post-matric students belonging to SC, ST, OBC, EWS and minority groups enrolled in recognized colleges.',
      benefit: '₹12,000 – ₹25,000 / year Tuition Fee Reimbursement + Maintenance Allowance',
      documents: [
        'College Bonafide / Admission Receipt',
        'Income & Caste Certificate (RD Number)',
        'Aadhaar Linked Bank Passbook',
        'SSLC / 10th Marks Card',
      ],
    },
    kn: {
      title: 'ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್ (SSP) ಮೆಟ್ರಿಕ್ ನಂತರದ ಸ್ಕಾಲರ್‌ಶಿಪ್',
      desc: 'ಮಾನ್ಯತೆ ಪಡೆದ ಕಾಲೇಜುಗಳಲ್ಲಿ ಕಲಿಯುತ್ತಿರುವ ಹಿಂದುಳಿದ ವರ್ಗ, ಪರಿಶಿಷ್ಟ ಜಾತಿ, ಪರಿಶಿಷ್ಟ ಪಂಗಡ ಹಾಗೂ ಅಲ್ಪಸಂಖ್ಯಾತ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಆರ್ಥಿಕ ನೆರವು.',
      benefit: 'ವಾರ್ಷಿಕ ₹೧೨,೦೦೦ – ₹೨೫,೦೦೦ ಬೋಧನಾ ಶುಲ್ಕ ಮರುಪಾವತಿ ಮತ್ತು ನಿರ್ವಹಣಾ ಭತ್ಯೆ',
      documents: [
        'ಕಾಲೇಜು ಪ್ರವೇಶ ರಸೀದಿ / ಬೋನಫೈಡ್',
        'ಆದಾಯ ಮತ್ತು ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ (RD ಸಂಖ್ಯೆ)',
        'ಆಧಾರ್ ಜೋಡಿಸಲಾದ ಬ್ಯಾಂಕ್ ಖಾತೆ',
        'ಎಸ್ಸೆಸ್ಸೆಲ್ಸಿ / ೧೦ನೇ ತರಗತಿ ಅಂಕಪಟ್ಟಿ',
      ],
    },
    hi: {
      title: 'राज्य छात्रवृत्ति पोर्टल (SSP) पोस्ट-मैट्रिक',
      desc: 'मान्यता प्राप्त कॉलेजों में पढ़ने वाले एससी, एसटी, ओबीसी, ईडब्ल्यूएस और अल्पसंख्यक छात्रों के लिए वित्तीय सहायता।',
      benefit: '₹12,000 – ₹25,000 / वर्ष ट्यूशन फीस प्रतिपूर्ति एवं निर्वाह भत्ता',
      documents: [
        'कॉलेज प्रवेश रसीद / प्रमाण पत्र',
        'आय एवं जाति प्रमाण पत्र (आरडी नंबर)',
        'आधार से जुड़ा बैंक खाता',
        '10वीं कक्षा का अंकपत्र',
      ],
    },
  },
  'lakhpati-didi': {
    en: {
      title: 'Lakhpati Didi Self-Help Group (SHG) Enterprise Initiative',
      desc: 'Enables rural women self-help group members to establish micro-enterprises with sustainable annual incomes exceeding ₹1,00,000.',
      benefit: '₹1,00,000 – ₹5,00,000 subsidized micro-enterprise loan at 4% interest',
      documents: [
        'SHG Membership Passbook (Min 6 months)',
        'SHG Resolution & Micro-Enterprise Plan',
        'Aadhaar Card & Bank Account',
      ],
    },
    kn: {
      title: 'ಲಕ್ಷಪತಿ ದೀದಿ ಮಹಿಳಾ ಸ್ವಸಹಾಯ ಸಂಘ ಉದ್ಯಮ ಸಾಲ',
      desc: 'ಗ್ರಾಮೀಣ ಮಹಿಳಾ ಸ್ವಸಹಾಯ ಸಂಘದ ಸದಸ್ಯರು ವಾರ್ಷಿಕ ₹1 ಲಕ್ಷಕ್ಕೂ ಅಧಿಕ ಆದಾಯ ಗಳಿಸಲು ಕಿರು ಉದ್ಯಮಗಳನ್ನು ಸ್ಥಾಪಿಸಲು ಪ್ರೋತ್ಸಾಹಿಸುವ ಯೋಜನೆ.',
      benefit: '೪% ಬಡ್ಡಿದರದಲ್ಲಿ ₹೧,೦೦,೦೦೦ ದಿಂದ ₹೫,೦೦,೦೦೦ ವರೆಗೆ ರಿಯಾಯಿತಿ ಸಾಲ',
      documents: [
        'ಸ್ವಸಹಾಯ ಸಂಘದ ಸದಸ್ಯತ್ವ ಪಾಸ್‌ಬುಕ್',
        'ಸಂಘದ ಅನುಮೋದನೆ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಯೋಜನೆ',
        'ಆಧಾರ್ ಕಾರ್ಡ್ ಮತ್ತು ಬ್ಯಾಂಕ್ ಖಾತೆ',
      ],
    },
    hi: {
      title: 'लखपति दीदी महिला स्वयं सहायता समूह ऋण योजना',
      desc: 'ग्रामीण महिला स्वयं सहायता समूह की सदस्यों को ₹1 लाख से अधिक की स्थायी वार्षिक आय अर्जित करने हेतु सूक्ष्म उद्यम शुरू करने में सहायता।',
      benefit: '4% ब्याज पर ₹1,00,000 से ₹5,00,000 तक का रियायती उद्यम ऋण',
      documents: [
        'एसएचजी सदस्यता पासबुक (न्यूनतम 6 माह)',
        'एसएचजी संकल्प एवं सूक्ष्म उद्यम योजना',
        'आधार कार्ड एवं बैंक खाता',
      ],
    },
  },
  'pm-awas-gramin': {
    en: {
      title: 'Pradhan Mantri Awas Yojana (Gramin)',
      desc: 'Financial aid provided to houseless and families living in kutcha houses with annual income below ₹1,80,000 to construct safe pucca dwellings.',
      benefit: '₹1,20,000 – ₹1,30,000 direct housing grant + 90 days MGNREGA wages',
      documents: [
        'SECC-2011 Deprivation Verification / Gram Sabha Approval',
        'Kutcha House Geo-Tagged Photo',
        'Aadhaar & Bank Account with DBT',
      ],
    },
    kn: {
      title: 'ಪ್ರಧಾನಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನೆ (ಗ್ರಾಮೀಣ - ಮನೆ ನಿರ್ಮಾಣ)',
      desc: 'ವಾರ್ಷಿಕ ₹1,80,000 ಕ್ಕಿಂತ ಕಡಿಮೆ ಆದಾಯ ಹೊಂದಿರುವ ವಸತಿ ರಹಿತ ಮತ್ತು ಕಚ್ಚಾ ಮನೆಯಲ್ಲಿ ವಾಸಿಸುವ ಕುಟುಂಬಗಳಿಗೆ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಿಸಲು ಧನಸಹಾಯ.',
      benefit: '₹೧,೨೦,೦೦೦ – ₹೧,೩೦,೦೦೦ ನೇರ ವಸತಿ ಅನುದಾನ + ೯೦ ದಿನಗಳ ಉದ್ಯೋಗ ಖಾತರಿ ಕೂಲಿ',
      documents: [
        'ಗ್ರಾಮ ಸಭೆ / ವಸತಿ ರಹಿತ ಪಟ್ಟಿ ಅನುಮೋದನೆ',
        'ಕಚ್ಚಾ ಮನೆಯ ಜಿಯೋ-ಟ್ಯಾಗ್ ಫೋಟೋ',
        'ಆಧಾರ್ ಮತ್ತು ಡಿಬಿಟಿ ಬ್ಯಾಂಕ್ ಖಾತೆ',
      ],
    },
    hi: {
      title: 'प्रधानमंत्री आवास योजना (ग्रामीण)',
      desc: '₹1,80,000 से कम वार्षिक आय वाले बेघर और कच्चे घरों में रहने वाले परिवारों को सुरक्षित पक्का मकान बनाने के लिए वित्तीय सहायता।',
      benefit: '₹1,20,000 – ₹1,30,000 सीधा आवास निर्माण अनुदान + 90 दिनों की मनरेगा मजदूरी',
      documents: [
        'ग्राम सभा अनुमोदन / बेघर सत्यापन सूची',
        'कच्चे घर की जियो-टैग तस्वीर',
        'आधार एवं डीबीटी बैंक खाता',
      ],
    },
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persist selected language in localStorage so it stays across refreshes, navigation, and views
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('schemesaathi_lang');
      if (saved && ALL_SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved as Language;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('schemesaathi_lang', newLang);
    } catch {
      // ignore
    }
  };

  const t = translations[language] || translations.en;

  const getSchemeTitle = (scheme: Scheme): string => {
    const loc = SCHEME_TRANSLATIONS[scheme.id]?.[language];
    if (loc?.title) return loc.title;
    // If complete translation is unavailable, keep the official scheme name unchanged
    return scheme.title;
  };

  const getSchemeDescription = (scheme: Scheme): string => {
    const loc = SCHEME_TRANSLATIONS[scheme.id]?.[language];
    if (loc?.desc) return loc.desc;
    return scheme.description;
  };

  const getSchemeBenefit = (scheme: Scheme): string => {
    const loc = SCHEME_TRANSLATIONS[scheme.id]?.[language];
    if (loc?.benefit) return loc.benefit;
    return scheme.benefitAmount;
  };

  const getSchemeDocuments = (scheme: Scheme): string[] => {
    const loc = SCHEME_TRANSLATIONS[scheme.id]?.[language];
    if (loc?.documents && loc.documents.length > 0) return loc.documents;
    return scheme.documentsRequired;
  };

  const formatCurrencyText = (amount: number): string => {
    const formatted = `₹${amount.toLocaleString('en-IN')}`;
    switch (language) {
      case 'kn':
        return `${formatted} / ವರ್ಷಕ್ಕೆ`;
      case 'hi':
        return `${formatted} / वर्ष`;
      case 'ta':
        return `${formatted} / ஆண்டுக்கு`;
      case 'te':
        return `${formatted} / సంవత్సరానికి`;
      case 'ml':
        return `${formatted} / വർഷം`;
      case 'bn':
        return `${formatted} / বছরে`;
      case 'mr':
        return `${formatted} / प्रति वर्ष`;
      case 'gu':
        return `${formatted} / પ્રતિ વર્ષ`;
      case 'pa':
        return `${formatted} / ਸਾਲਾਨਾ`;
      case 'or':
        return `${formatted} / ବାର୍ଷିକ`;
      case 'as':
        return `${formatted} / বছৰত`;
      case 'ur':
        return `${formatted} / سالانہ`;
      case 'sa':
        return `${formatted} / प्रतिवर्षम्`;
      case 'ne':
        return `${formatted} / प्रति वर्ष`;
      case 'mai':
        return `${formatted} / प्रति वर्ष`;
      case 'kok':
        return `${formatted} / वर्साक`;
      case 'ks':
        return `${formatted} / وریھس منز`;
      case 'doi':
        return `${formatted} / सालान्हा`;
      case 'brx':
        return `${formatted} / बोसोरारि`;
      case 'mni':
        return `${formatted} / চহিগী`;
      case 'sat':
        return `${formatted} / ᱥᱮᱨᱢᱟᱨᱮ`;
      case 'sd':
        return `${formatted} / سالانو`;
      default:
        return `${formatted} / yr`;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getSchemeTitle,
        getSchemeDescription,
        getSchemeBenefit,
        getSchemeDocuments,
        formatCurrencyText,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
