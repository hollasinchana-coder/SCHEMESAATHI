import React, { useState, useEffect, useRef } from 'react';
import { ALL_SUPPORTED_LANGUAGES, useLanguage } from '../i18n/LanguageContext';
import { getLanguageOption } from '../i18n/languages';
import { findBestVoiceForLanguage, cleanForTTS } from '../utils/voiceEligibilityReader';
import { CitizenProfile, Language } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: CitizenProfile;
  onConfirmProfile?: (profile: CitizenProfile, autoCheck?: boolean) => void;
  onVoiceResult?: (text: string, profileHints?: Record<string, unknown>) => void;
}

// Convert all Indic numeral scripts to standard Arabic numerals
function normalizeIndicDigits(str: string): string {
  const indicMap: Record<string, string> = {
    // Kannada
    '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
    // Devanagari (Hindi, Marathi, Nepali, Sanskrit, Maithili, Bodo, Dogri, Konkani)
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
    // Bengali / Assamese
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    // Gujarati
    '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4', '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
    // Gurmukhi (Punjabi)
    '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4', '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9',
    // Odia
    '୦': '0', '୧': '1', '୨': '2', '୩': '3', '୪': '4', '୫': '5', '୬': '6', '୭': '7', '୮': '8', '୯': '9',
    // Tamil
    '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4', '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9',
    // Telugu
    '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4', '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9',
    // Malayalam
    '൦': '0', '൧': '1', '൨': '2', '൩': '3', '൪': '4', '൫': '5', '൬': '6', '൭': '7', '൮': '8', '൯': '9',
  };
  return str.replace(/[೦-೯०-९০-৯૦-૯੦-੯୦-୯௦-௯౦-౯൦-൯]/g, (m) => indicMap[m] || m);
}

// Intelligent extractor across 22 Scheduled Indian Languages & English
function extractCitizenDetails(rawText: string, defaultProfile?: CitizenProfile): Partial<CitizenProfile> {
  const text = normalizeIndicDigits(rawText);
  const lower = text.toLowerCase();
  const extracted: Partial<CitizenProfile> = {};

  // 1. Extract Occupation across languages
  if (
    lower.includes('farmer') ||
    lower.includes('kisan') ||
    lower.includes('agriculture') ||
    lower.includes('cultiv') ||
    text.includes('ರೈತ') || text.includes('ಕೃಷಿ') || text.includes('ಬೆಳೆ') ||
    text.includes('किसान') || text.includes('खेती') || text.includes('कृषि') ||
    text.includes('விவசாயி') || text.includes('விவசாயம்') ||
    text.includes('రైతు') || text.includes('వ్యవసాయం') ||
    text.includes('കർഷകൻ') || text.includes('കൃഷി') ||
    text.includes('কৃষক') || text.includes('কৃষি') ||
    text.includes('शेतकरी') || text.includes('शेती') ||
    text.includes('ખેડૂત') || text.includes('ખેતી') ||
    text.includes('କୃଷକ') || text.includes('ଚାଷୀ') ||
    text.includes('ਕਿਸਾਨ') || text.includes('ਖੇਤੀ') ||
    text.includes('کسان') || text.includes('کاشتکار')
  ) {
    extracted.occupation = 'Farmer / Agriculture';
  } else if (
    lower.includes('student') ||
    lower.includes('scholarship') ||
    lower.includes('study') ||
    lower.includes('college') ||
    text.includes('ವಿದ್ಯಾರ್ಥಿ') || text.includes('ಓದು') || text.includes('ವಿದ್ಯಾರ್ಥಿವೇತನ') ||
    text.includes('छात्र') || text.includes('विद्यार्थी') || text.includes('पढ़ाई') ||
    text.includes('மாணவர்') || text.includes('படிப்பு') ||
    text.includes('విద్యార్థి') || text.includes('చదువు') ||
    text.includes('വിദ്യാർത്ഥി') ||
    text.includes('ছাত্র') || text.includes('পড়াশোনা') ||
    text.includes('विद्यार्थी') ||
    text.includes('વિદ્યાર્થી') ||
    text.includes('ଛାତ୍ର') ||
    text.includes('ਵਿਦਿਆਰਥੀ') ||
    text.includes('طالب علم')
  ) {
    extracted.occupation = 'Student';
    extracted.isStudentEnrolled = true;
  } else if (
    lower.includes('daily wage') ||
    lower.includes('construction') ||
    lower.includes('labour') ||
    lower.includes('worker') ||
    text.includes('ದಿನಗೂಲಿ') || text.includes('ಕಾರ್ಮಿಕ') || text.includes('ಕೂಲಿ') ||
    text.includes('मजदूर') || text.includes('दिहाड़ी') || text.includes('श्रमिक') ||
    text.includes('கூலி') || text.includes('தொழிலாளி') ||
    text.includes('కూలీ') || text.includes('కార్మికుడు') ||
    text.includes('തൊഴിലാളി') ||
    text.includes('শ্রমিক') || text.includes('দিনমজুর') ||
    text.includes('मजूर') || text.includes('कामगार') ||
    text.includes('મજૂર') || text.includes('શ્રમિક') ||
    text.includes('ਮਜ਼ਦੂਰ') ||
    text.includes('مزدور')
  ) {
    extracted.occupation = 'Daily Wage / Construction Worker';
  } else if (
    lower.includes('artisan') ||
    lower.includes('business') ||
    lower.includes('shop') ||
    lower.includes('self-employed') ||
    text.includes('ಕುಶಲಕರ್ಮಿ') || text.includes('ವ್ಯಾಪಾರ') || text.includes('ಅಂಗಡಿ') || text.includes('ಸ್ವಯಂ ಉದ್ಯೋಗ') ||
    text.includes('कारीगर') || text.includes('दुकानदार') || text.includes('स्वरोजगार') ||
    text.includes('கைவினைஞர்') || text.includes('வணிகம்') ||
    text.includes('చేతివృత్తి') || text.includes('వ్యాపారం') ||
    text.includes('കരകൗശല') ||
    text.includes('কারিগর') || text.includes('ব্যবসা') ||
    text.includes('कारागीर') || text.includes('दुकान') ||
    text.includes('કારીગર') || text.includes('વેપાર')
  ) {
    extracted.occupation = 'Self-employed / Artisan';
  } else if (
    lower.includes('woman') ||
    lower.includes('women') ||
    lower.includes('homemaker') ||
    lower.includes('shg') ||
    text.includes('ಮಹಿಳೆ') || text.includes('ಗೃಹಿಣಿ') || text.includes('ಸ್ವಸಹಾಯ') ||
    text.includes('महिला') || text.includes('गृहिणी') || text.includes('एसएचजी') ||
    text.includes('பெண்') || text.includes('குடும்பத்தலைவி') ||
    text.includes('మహిళ') || text.includes('గృహిణి') ||
    text.includes('സ്ത്രീ') || text.includes('ഗൃഹനാഥ') ||
    text.includes('মহিলা') || text.includes('গৃহিণী') ||
    text.includes('महिला') || text.includes('गृहिणी') ||
    text.includes('મહિલા') || text.includes('ગૃહિણી') ||
    text.includes('ਔਰਤ') ||
    text.includes('خاتون') || text.includes('عورت')
  ) {
    extracted.occupation = 'Homemaker / Women';
    extracted.gender = 'Female';
  }

  // 2. Extract Age across scripts
  const ageMatch =
    text.match(/(\d{1,2})\s*(years|yr|ವರ್ಷ|ವರ್ಷದ|साल|वर्ष|आयु|வயது|வருடம்|సంవత్సరాలు|ఏళ్ళు|വയസ്സ്|বছর|বয়স|વર્ષ|ਉਮਰ|سال|عمر)/i) ||
    text.match(/(age|ವಯಸ್ಸು|आयु|வயது|వయస్సు|വയസ്സ്|বয়স|ਉਮਰ|عمر)\s*(is|ಆಗಿದೆ|:|है|உள்ளது|ఉంది)?\s*(\d{1,2})/i);
  if (ageMatch) {
    const parsedAge = parseInt(ageMatch[1] || ageMatch[3], 10);
    if (parsedAge >= 5 && parsedAge <= 100) {
      extracted.age = parsedAge;
    }
  }

  // 3. Extract Land Holding (Acres) across scripts
  const landMatch = text.match(/(\d+(\.\d+)?)\s*(acres|acre|ಎಕರೆ|ಏಕರೆ|एकड़|ஏக்கர்|ఎకరాలు|ఎకరం|ഏക്കർ|একর|एकर|એકર|ਏਕੜ|ایکڑ)/i);
  if (landMatch) {
    const acres = parseFloat(landMatch[1]);
    if (!isNaN(acres) && acres > 0) {
      extracted.landHoldingAcres = acres;
    }
  } else if (
    lower.includes('no land') ||
    lower.includes('landless') ||
    text.includes('ಜಮೀನು ಇಲ್ಲ') || text.includes('ಭೂಮಿ ಇಲ್ಲ') ||
    text.includes('जमीन नहीं') || text.includes('भूमिहीन') ||
    text.includes('நிலம் இல்லை') || text.includes('భూమి లేదు') ||
    text.includes('ഭൂമിയില്ല') || text.includes('জমি নেই') ||
    text.includes('जमीन नाही') || text.includes('જમીન નથી')
  ) {
    extracted.landHoldingAcres = 0;
  }

  // 4. Extract Income across scripts
  const lakhMatch = text.match(/(\d+(\.\d+)?)\s*(lakh|lakhs|ಲಕ್ಷ|ಲಾಖ್|लाख|லட்சம்|లక్షలు|ലക്ഷം|লাখ|લાખ|ਲੱਖ|لاکھ)/i);
  if (lakhMatch) {
    const factor = parseFloat(lakhMatch[1]);
    if (!isNaN(factor)) {
      extracted.annualIncome = Math.round(factor * 100000);
    }
  } else {
    const rawNumberMatch = text.match(/(₹|rs\.?|inr|ಆದಾಯ|आय|வருமானம்|ఆదాయం|வருமானம்|আয়|આવક|ਆਮਦਨ|آمدنی)?\s*(\d{5,7})/i);
    if (rawNumberMatch && rawNumberMatch[2]) {
      const inc = parseInt(rawNumberMatch[2], 10);
      if (inc >= 10000 && inc <= 2500000) {
        extracted.annualIncome = inc;
      }
    }
  }

  // 5. Extract State across major languages
  if (lower.includes('karnataka') || text.includes('ಕರ್ನಾಟಕ') || text.includes('कर्नाटक') || text.includes('கர்நாடகா') || text.includes('కర్ణాటక')) {
    extracted.state = 'Karnataka';
  } else if (lower.includes('uttar pradesh') || lower.includes('u.p') || text.includes('ಉತ್ತರ ಪ್ರದೇಶ') || text.includes('उत्तर प्रदेश') || text.includes('உத்தரப் பிரதேசம்')) {
    extracted.state = 'Uttar Pradesh';
  } else if (lower.includes('maharashtra') || text.includes('ಮಹಾರಾಷ್ಟ್ರ') || text.includes('महाराष्ट्र') || text.includes('மகாராஷ்டிரா')) {
    extracted.state = 'Maharashtra';
  } else if (lower.includes('bihar') || text.includes('ಬಿಹಾರ') || text.includes('बिहार') || text.includes('பீகார்')) {
    extracted.state = 'Bihar';
  } else if (lower.includes('tamil nadu') || text.includes('ತಮಿಳುನಾಡು') || text.includes('तमिलनाडु') || text.includes('தமிழ்நாடு')) {
    extracted.state = 'Tamil Nadu';
  } else if (lower.includes('telangana') || text.includes('ತೆಲಂಗಾಣ') || text.includes('तेलंगाना') || text.includes('తెలంగాణ')) {
    extracted.state = 'Telangana';
  } else if (lower.includes('west bengal') || text.includes('ಪಶ್ಚಿಮ ಬಂಗಾಳ') || text.includes('पश्चिम बंगाल') || text.includes('পশ্চিমবঙ্গ')) {
    extracted.state = 'West Bengal';
  } else if (lower.includes('kerala') || text.includes('ಕೇರಳ') || text.includes('केरल') || text.includes('கேரளா') || text.includes('കേരളം')) {
    extracted.state = 'Kerala';
  } else if (lower.includes('punjab') || text.includes('ಪಂಜಾಬ್') || text.includes('पंजाब') || text.includes('ਪੰਜਾਬ')) {
    extracted.state = 'Punjab';
  } else if (lower.includes('rajasthan') || text.includes('ರಾಜಸ್ಥಾನ') || text.includes('राजस्थान')) {
    extracted.state = 'Rajasthan';
  } else if (lower.includes('gujarat') || text.includes('ಗುಜರಾತ್') || text.includes('गुजरात') || text.includes('ગુજરાત')) {
    extracted.state = 'Gujarat';
  } else if (lower.includes('odisha') || text.includes('ಒಡಿಶಾ') || text.includes('ओडिशा') || text.includes('ଓଡ଼ିଶା')) {
    extracted.state = 'Odisha';
  } else if (lower.includes('assam') || text.includes('ಅಸ್ಸಾಂ') || text.includes('असम') || text.includes('অসম')) {
    extracted.state = 'Assam';
  }

  // 6. Extract District
  const districtKeywords = [
    { key: 'Haveri', aliases: ['haveri', 'ಹಾವೇರಿ', 'हावेरी', 'ஹாவேரி', 'హావేరి'] },
    { key: 'Dharwad', aliases: ['dharwad', 'ಧಾರವಾಡ', 'धारवाड़', 'தார்வாட்', 'ధార్వాడ్'] },
    { key: 'Belagavi', aliases: ['belagavi', 'belgaum', 'ಬೆಳಗಾವಿ', 'बेलगावी', 'బెళగావి'] },
    { key: 'Mandya', aliases: ['mandya', 'ಮಂಡ್ಯ', 'मांड्या', 'மண்டியா'] },
    { key: 'Mysuru', aliases: ['mysuru', 'mysore', 'ಮೈಸೂರು', 'मैसूर', 'மைசூர்'] },
    { key: 'Ballari', aliases: ['ballari', 'bellary', 'ಬಳ್ಳಾರಿ', 'बेल्लारी'] },
    { key: 'Shivamogga', aliases: ['shivamogga', 'shimoga', 'ಶಿವಮೊಗ್ಗ', 'शिमोगा'] },
    { key: 'Bengaluru Rural', aliases: ['bengaluru rural', 'bangalore rural', 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', 'बेंगलुरु ग्रामीण'] },
    { key: 'Pune', aliases: ['pune', 'पुणे', 'ಪುಣೆ', 'புனே'] },
    { key: 'Patna', aliases: ['patna', 'पटना', 'ಪಟ್ನಾ'] },
    { key: 'Varanasi', aliases: ['varanasi', 'वाराणसी', 'ವಾರಣಾಸಿ'] },
    { key: 'Madurai', aliases: ['madurai', 'மதுரை', 'ಮಧುರೈ'] },
  ];
  for (const d of districtKeywords) {
    if (d.aliases.some((alias) => lower.includes(alias) || text.includes(alias))) {
      extracted.district = d.key;
      break;
    }
  }

  // 7. Extract Name across scripts
  const nameMatch =
    text.match(/(?:my name is|i am|ನನ್ನ ಹೆಸರು|ಹೆಸರು|मेरा नाम|मैं|என் பெயர்|నా పేరు|എന്റെ പേര്|আমার নাম|माझं नाव|મારું નામ|ਮੇਰਾ ਨਾਂ|میرا نام)\s+([^\s,.:;]{2,25})/i);
  if (nameMatch && nameMatch[1]) {
    const raw = nameMatch[1].trim();
    if (!['here', 'a', 'the', 'farmer', 'student', 'worker', 'citizen'].includes(raw.toLowerCase())) {
      extracted.fullName = raw;
    }
  }

  return {
    ...defaultProfile,
    ...extracted,
  };
}

export type MicStatus = 'ready' | 'listening' | 'error' | 'captured' | 'unavailable';

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onConfirmProfile,
  onVoiceResult,
}) => {
  const { language, setLanguage, t } = useLanguage();

  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const [stage, setStage] = useState<'input' | 'extracted'>('input');

  // Status Indicator: 'ready' | 'listening' | 'captured' | 'unavailable' | 'error'
  const [micStatus, setMicStatus] = useState<MicStatus>('ready');

  // Browser Speech & Audio State
  const [errorType, setErrorType] = useState<
    'not-allowed' | 'not-found' | 'not-readable' | 'security' | 'abort' | 'insecure' | 'unsupported' | 'network' | 'language' | 'other' | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Text-to-Speech Output state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Extracted citizen profile draft
  const [draftProfile, setDraftProfile] = useState<CitizenProfile>(() => ({
    fullName: currentProfile?.fullName || '',
    age: currentProfile?.age || 35,
    gender: currentProfile?.gender || 'Male',
    mobile: currentProfile?.mobile || '',
    otp: '4819',
    isOtpVerified: true,
    state: currentProfile?.state || 'Karnataka',
    district: currentProfile?.district || 'Haveri',
    occupation: currentProfile?.occupation || 'Farmer / Agriculture',
    annualIncome: currentProfile?.annualIncome || 150000,
    aadhaarLastFour: currentProfile?.aadhaarLastFour || '',
    landHoldingAcres: currentProfile?.landHoldingAcres ?? 0,
    casteCategory: currentProfile?.casteCategory || 'General',
    rationCardStatus: currentProfile?.rationCardStatus || 'BPL',
  }));

  const recognitionRef = useRef<any>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  const currentLangOption = getLanguageOption(language);
  const activeSpeechLocale = currentLangOption?.speechCode || `${language}-IN`;

  // Prevent background page scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Load available speech synthesis voices for text-to-speech output
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        try {
          const v = window.speechSynthesis.getVoices();
          setAvailableVoices(v);
        } catch {
          // ignore
        }
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Sync draft profile when modal opens or currentProfile changes
  useEffect(() => {
    if (isOpen) {
      if (currentProfile) {
        setDraftProfile(currentProfile);
      }
      setStage('input');
      setErrorType(null);
      setErrorMessage(null);
      setInputText('');
      setInputMode('voice');
      setMicStatus('ready');
      stopSpeakingAudio();
    } else {
      stopListening();
      stopSpeakingAudio();
    }
  }, [isOpen, currentProfile]);

  // Clean up recognition & audio tracks on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeakingAudio();
    };
  }, []);

  // Stop active speech recognition and properly release microphone stream
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      activeStreamRef.current = null;
    }

    setIsRecording(false);
  };

  // Stop Text-to-Speech audio output
  const stopSpeakingAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    setIsSpeaking(false);
  };

  // Speak aloud in currently selected language
  const speakTextInSelectedLanguage = (textToSpeak: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      stopSpeakingAudio();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleaned = cleanForTTS(textToSpeak);
      const utterance = new SpeechSynthesisUtterance(cleaned);

      const { voice, targetLangCode } = findBestVoiceForLanguage(language, availableVoices);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || targetLangCode;
      } else {
        utterance.lang = targetLangCode || activeSpeechLocale;
      }

      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS playback error:', err);
      setIsSpeaking(false);
    }
  };

  // Start real browser Web Speech API for selected 22 Scheduled Indian Language
  const startListening = async () => {
    stopSpeakingAudio();
    setErrorType(null);
    setErrorMessage(null);

    // 1. Check secure context (HTTPS)
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      setIsRecording(false);
      setErrorType('insecure');
      setErrorMessage(
        t.voiceUnavailableNotice || 'Microphone access requires a secure connection (HTTPS).'
      );
      setMicStatus('error');
      return;
    }

    // 2. Request microphone stream directly from user click action
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsRecording(false);
      setErrorType('unsupported');
      setErrorMessage(
        `Voice input is not supported in this browser. Please use text input or try Chrome.`
      );
      setMicStatus('error');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      console.warn('getUserMedia error caught:', err);
      setIsRecording(false);
      setMicStatus('error');
      const errName = err?.name || '';
      const errMsg = err?.message || '';

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setErrorType('not-allowed');
        setErrorMessage(
          'Microphone access is blocked. Please allow microphone permissions in your browser and try again.'
        );
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setErrorType('not-found');
        setErrorMessage('No microphone was detected. Please connect or enable a microphone.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setErrorType('not-readable');
        setErrorMessage('The microphone is already in use by another application.');
      } else if (errName === 'SecurityError') {
        setErrorType('security');
        setErrorMessage('Microphone access is restricted in this browser environment.');
      } else if (errName === 'AbortError') {
        setErrorType('abort');
        setErrorMessage('Microphone access request was cancelled. Please try again.');
      } else {
        setErrorType('other');
        setErrorMessage(errMsg || 'Microphone access failed. Please use text input instead.');
      }
      return;
    }

    // 3. Validate audio track
    if (!stream || !stream.getAudioTracks || stream.getAudioTracks().length === 0) {
      setIsRecording(false);
      setErrorType('not-found');
      setErrorMessage('No active audio track was found on the microphone.');
      setMicStatus('error');
      return;
    }

    const audioTracks = stream.getAudioTracks();
    const activeTrack = audioTracks.find((track) => track.enabled);
    if (!activeTrack) {
      setIsRecording(false);
      setErrorType('not-readable');
      setErrorMessage('The microphone audio track is disabled or inactive.');
      setMicStatus('error');
      return;
    }

    activeStreamRef.current = stream;

    // 4. Initialize SpeechRecognition with selected 22-language locale
    const windowWithSpeech = window as any;
    const SpeechRecognitionClass =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsRecording(false);
      setErrorType('unsupported');
      setErrorMessage(
        `Voice input is not available in this browser. Please try Chrome or use text input.`
      );
      setMicStatus('error');
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {
            // ignore
          }
        });
        activeStreamRef.current = null;
      }
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Exact language locale for the selected language from single source of truth
      recognition.lang = activeSpeechLocale;

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorType(null);
        setErrorMessage(null);
        setMicStatus('listening');
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript + ' ';
          } else {
            interimText += event.results[i][0].transcript;
          }
        }
        const fullTranscript = (finalText + interimText).trim();
        if (fullTranscript) {
          setInputText(fullTranscript);
          setMicStatus('captured');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition onerror:', event.error, event);

        if (event.error === 'no-speech') {
          return;
        }

        if (event.error === 'aborted') {
          return;
        }

        stopListening();

        if (event.error === 'not-allowed') {
          setErrorType('not-allowed');
          setMicStatus('error');
          setErrorMessage('Microphone access is blocked. Please allow microphone permissions and try again.');
        } else if (event.error === 'bad-grammar' || event.error === 'language-not-supported') {
          // Graceful fallback: Do NOT switch language to English; show friendly message and offer text input
          setErrorType('language');
          setMicStatus('unavailable');
          setErrorMessage(
            `Voice input for this language (${currentLangOption.label}) is not available in this browser. Please try Chrome or use text input.`
          );
        } else if (event.error === 'network') {
          setErrorType('network');
          setMicStatus('error');
          setErrorMessage('Voice recognition network error. Please check your internet connection.');
        } else if (event.error === 'service-not-allowed') {
          setErrorType('security');
          setMicStatus('error');
          setErrorMessage('Voice recognition service is not permitted in this browser.');
        } else {
          setErrorType('other');
          setMicStatus('error');
          setErrorMessage(`Voice capture error: ${event.error}. Please try again or use text input.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (activeStreamRef.current) {
          activeStreamRef.current.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch {
              // ignore
            }
          });
          activeStreamRef.current = null;
        }
        setMicStatus((prev) => {
          if (prev === 'listening') {
            return inputText.trim() ? 'captured' : 'ready';
          }
          return prev;
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      stopListening();
      setErrorType('unsupported');
      setMicStatus('unavailable');
      setErrorMessage(
        `Voice input for this language (${currentLangOption.label}) is not available in this browser. Please try Chrome or use text input.`
      );
    }
  };

  const handleVoiceButtonClick = () => {
    if (inputMode !== 'voice') {
      setInputMode('voice');
      startListening();
      return;
    }

    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleTypeInsteadClick = () => {
    stopListening();
    stopSpeakingAudio();
    setErrorType(null);
    setErrorMessage(null);
    setInputMode('text');
  };

  const handleTryAgain = () => {
    setErrorType(null);
    setErrorMessage(null);
    setMicStatus('ready');
    startListening();
  };

  const handleProcessText = () => {
    if (!inputText.trim()) return;
    const extracted = extractCitizenDetails(inputText, currentProfile);
    setDraftProfile((prev) => ({
      ...prev,
      ...extracted,
    }));
    setStage('extracted');
  };

  const handleConfirm = (autoCheck: boolean = false) => {
    stopSpeakingAudio();
    if (onConfirmProfile) {
      onConfirmProfile(draftProfile, autoCheck);
    }
    if (onVoiceResult) {
      onVoiceResult(inputText, {
        occupation: draftProfile.occupation,
        state: draftProfile.state,
        district: draftProfile.district,
        landAcres: draftProfile.landHoldingAcres,
        hasLand: (draftProfile.landHoldingAcres ?? 0) > 0,
      });
    }
    onClose();
  };

  // Build spoken summary for Extracted stage
  const getUnderstoodSpokenSummary = () => {
    const parts = [
      `${t.weUnderstood || 'Information verified'}.`,
      `${t.fullNameLabel || 'Name'}: ${draftProfile.fullName || 'Citizen'}.`,
      `${t.ageLabel || 'Age'}: ${draftProfile.age}.`,
      `${t.occupationLabel || 'Occupation'}: ${draftProfile.occupation}.`,
      `${t.stateLabel || 'State'}: ${draftProfile.state}, ${draftProfile.district}.`,
      draftProfile.landHoldingAcres && draftProfile.landHoldingAcres > 0
        ? `${t.cultivableLandTitle || 'Land'}: ${draftProfile.landHoldingAcres} ${t.acresUnit || 'acres'}.`
        : '',
      `${t.incomeLabel || 'Income'}: ${draftProfile.annualIncome} rupees.`,
    ];
    return parts.filter(Boolean).join(' ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in overflow-hidden">
      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-surface-container-lowest p-4 sm:p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-3.5 sm:gap-4 max-h-[92vh] overflow-y-auto">
        
        {/* Top Header Bar with Back and Close */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs shadow-xs border border-outline-variant/30 transition-all cursor-pointer"
              aria-label={t.back}
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>{t.back}</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-md flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">record_voice_over</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-on-surface leading-tight">
                  {t.vaTitle}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">
                  {t.typeRequestPlaceholder}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Language Selector (ALL 22 SCHEDULED LANGUAGES) & Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl sm:rounded-2xl bg-surface-container-low border border-outline-variant/20">
          {/* Dynamic 22-Language Dropdown - Single Source of Truth */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-on-surface-variant uppercase pl-1">
              {t.vaDialect}:
            </span>
            <div className="relative flex items-center">
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value as Language;
                  setLanguage(newLang);
                  if (isRecording) {
                    stopListening();
                  }
                  stopSpeakingAudio();
                }}
                className="h-8 pl-3 pr-7 rounded-full bg-surface-container-high text-primary text-xs font-bold border border-outline-variant/30 appearance-none focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-xs transition-colors"
                title="Select language (22 Indian languages supported)"
              >
                {ALL_SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} — {l.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 text-on-surface-variant pointer-events-none text-[15px]">
                expand_more
              </span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold hidden sm:inline">
              {activeSpeechLocale}
            </span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/20">
            <button
              type="button"
              onClick={handleVoiceButtonClick}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                inputMode === 'voice'
                  ? isRecording
                    ? 'bg-error text-on-error shadow-md animate-pulse ring-2 ring-error/50'
                    : 'bg-secondary text-on-secondary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
              title={isRecording ? 'Click to stop listening' : 'Click to start voice recording'}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isRecording ? 'stop' : 'mic'}
              </span>
              <span>
                {inputMode === 'voice' && isRecording
                  ? t.stopSpeaking || 'Stop'
                  : t.startSpeaking || 'Speak'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleTypeInsteadClick}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                inputMode === 'text'
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">keyboard</span>
              <span>{t.orTypeInstead || 'Type Instead'}</span>
            </button>
          </div>
        </div>

        {/* STAGE 1: INPUT CAPTURE (VOICE OR TEXT) */}
        {stage === 'input' && (
          <div className="space-y-3 animate-fade-in">
            {/* VOICE MODE */}
            {inputMode === 'voice' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-inverse-surface text-inverse-on-surface relative overflow-hidden flex flex-col items-center text-center gap-3.5 shadow-inner">
                
                {/* Microphone Status Indicator */}
                <div className="flex items-center justify-between w-full text-xs font-mono text-surface-container-highest">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-surface-container-highest">
                      Status:
                    </span>
                    {micStatus === 'listening' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error/20 text-error font-bold border border-error/40 animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-error animate-ping"></span>
                        <span>{t.voiceListeningStatus || 'Listening...'}</span>
                      </span>
                    )}
                    {micStatus === 'ready' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary-fixed/20 text-tertiary-fixed font-bold border border-tertiary-fixed/30">
                        <span className="h-2 w-2 rounded-full bg-tertiary-fixed"></span>
                        <span>Ready ({currentLangOption.native})</span>
                      </span>
                    )}
                    {micStatus === 'captured' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary-fixed font-bold border border-primary/30">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>{t.vaSpeechResolved || 'Speech Captured'}</span>
                      </span>
                    )}
                    {micStatus === 'unavailable' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        <span>Unavailable in Browser</span>
                      </span>
                    )}
                    {micStatus === 'error' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-bold border border-error/40">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        <span>Error</span>
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-surface/30 text-surface-container-highest border border-surface-container-highest/20">
                    {activeSpeechLocale}
                  </span>
                </div>

                {/* Primary Voice Action Button */}
                <div className="py-0.5">
                  <button
                    type="button"
                    onClick={isRecording ? stopListening : startListening}
                    className={`relative w-18 h-18 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                      isRecording
                        ? 'bg-error text-on-error scale-105 shadow-error/40'
                        : 'bg-primary text-on-primary hover:scale-105 shadow-primary/30'
                    }`}
                    title={isRecording ? 'Click to stop' : 'Click to start speaking'}
                  >
                    <span className="material-symbols-outlined text-[32px]">
                      {isRecording ? 'stop' : 'mic'}
                    </span>
                    {isRecording && (
                      <span className="absolute -inset-2 rounded-full border-2 border-error animate-ping pointer-events-none"></span>
                    )}
                  </button>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-sm sm:text-base font-bold text-surface-bright">
                    {isRecording
                      ? `Listening in ${currentLangOption.native} (${currentLangOption.label})... Speak naturally.`
                      : `Click microphone to speak in ${currentLangOption.native} (${currentLangOption.label})`}
                  </h4>
                  <p className="text-[11px] text-surface-container-highest max-w-md">
                    Mention your occupation, age, land area in acres, or district.
                  </p>
                </div>

                {/* Animated Waveform Indicator */}
                <div className="flex items-center justify-center gap-1 h-5">
                  {[6, 14, 22, 30, 16, 26, 32, 20, 14, 24, 12, 6].map((h, idx) => (
                    <span
                      key={idx}
                      className="w-1 rounded-full bg-tertiary-fixed transition-all duration-150"
                      style={{
                        height: isRecording ? `${Math.max(6, h * 0.75)}px` : '4px',
                        opacity: isRecording ? 1 : 0.35,
                      }}
                    />
                  ))}
                </div>

                {/* Real-time recognized speech input area (Editable) */}
                <div className="w-full text-left space-y-1.5 pt-1">
                  <label className="text-[11px] font-mono font-bold text-surface-container-highest flex items-center justify-between">
                    <span>{t.vaCitizenInput || 'Recognized Speech (Editable):'}</span>
                    {isRecording && (
                      <span className="text-[10px] text-error font-bold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-error animate-ping"></span>
                        Active ({activeSpeechLocale})
                      </span>
                    )}
                  </label>
                  <textarea
                    rows={3}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (e.target.value.trim() && micStatus !== 'listening') {
                        setMicStatus('captured');
                      }
                    }}
                    placeholder={t.typeRequestPlaceholder || 'Speak naturally or type details here...'}
                    className="w-full p-3 rounded-xl bg-surface/20 text-surface-bright text-xs sm:text-sm border border-surface-container-highest/30 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-surface-container-highest/60"
                  />
                </div>

                {/* Controls below voice box: Stop/Start & Submit */}
                <div className="flex flex-wrap items-center justify-between w-full pt-1 gap-2">
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={stopListening}
                      className="px-3.5 py-1.5 rounded-xl bg-error/90 hover:bg-error text-on-error text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">stop</span>
                      <span>{t.stopSpeaking || 'Stop Listening'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startListening}
                      className="px-3.5 py-1.5 rounded-xl bg-surface-container-high/40 hover:bg-surface-container-high text-surface-bright text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">mic</span>
                      <span>{inputText ? (t.vaReRecord || 'Speak More') : (t.startSpeaking || 'Start Speaking')}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={!inputText.trim()}
                    onClick={handleProcessText}
                    className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>{t.submitBtn || 'Submit'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TEXT MODE */}
            {inputMode === 'text' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider block font-mono">
                    Type Your Requirements
                  </label>
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    {currentLangOption.native} ({currentLangOption.label})
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t.typeRequestPlaceholder || 'Type your details (e.g. farmer with 2 acres in Karnataka)...'}
                    className="w-full p-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                  />
                  <div className="mt-2.5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleVoiceButtonClick}
                      className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">mic</span>
                      <span>Switch to Voice</span>
                    </button>

                    <button
                      type="button"
                      disabled={!inputText.trim()}
                      onClick={handleProcessText}
                      className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>{t.submitBtn || 'Submit'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Browser Speech-Recognition Fallback Notice */}
            {errorType && (
              <div className="p-3.5 rounded-xl bg-surface-container text-on-surface text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border border-outline-variant/30 shadow-xs animate-fade-in">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                    <span>
                      {errorType === 'language'
                        ? 'Speech Engine Notice'
                        : errorType === 'not-allowed'
                        ? 'Microphone Permission Required'
                        : 'Voice Input Notification'}
                    </span>
                  </div>
                  {errorMessage && (
                    <p className="text-[11px] text-on-surface-variant leading-relaxed pl-5">
                      {errorMessage}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pl-5 sm:pl-0 flex-shrink-0">
                  {errorType !== 'unsupported' && errorType !== 'insecure' && errorType !== 'language' && (
                    <button
                      type="button"
                      onClick={handleTryAgain}
                      className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-bold text-xs shadow-xs border border-outline-variant/30 hover:bg-surface-container transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">refresh</span>
                      <span>Try Again</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleTypeInsteadClick}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-bold text-xs shadow-xs hover:bg-primary-container transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">keyboard</span>
                    <span>{t.orTypeInstead || 'Type Instead'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STAGE 2: EXTRACTED PROFILE CONFIRMATION */}
        {stage === 'extracted' && (
          <div className="space-y-4 animate-fade-in">
            {/* Header info with Voice Output TTS capability */}
            <div className="p-3.5 rounded-xl bg-tertiary-fixed/20 border border-tertiary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">verified</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-on-surface">
                    {t.extractedInfo || 'Profile Details Extracted'}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-on-surface-variant">
                    {t.weUnderstood || 'Review understood information below before checking schemes.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice Output TTS button for Understood profile */}
                <button
                  type="button"
                  onClick={() => speakTextInSelectedLanguage(getUnderstoodSpokenSummary())}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                    isSpeaking
                      ? 'bg-primary text-on-primary border-primary shadow-xs animate-pulse'
                      : 'bg-surface-container-lowest text-primary border-primary/30 hover:bg-primary-fixed/20'
                  }`}
                  title="Listen to understood profile details in currently selected language"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isSpeaking ? 'stop' : 'volume_up'}
                  </span>
                  <span>{isSpeaking ? 'Stop Audio' : (t.vaListenAudio || 'Listen')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopSpeakingAudio();
                    setStage('input');
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:text-on-surface bg-surface-container-high/60 hover:bg-surface-container-high flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                  <span>{t.editProfileBtn || 'Edit Input'}</span>
                </button>
              </div>
            </div>

            {/* Editable Extracted Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                  {t.extractedName || 'Full Name'}
                </label>
                <input
                  type="text"
                  value={draftProfile.fullName}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Enter full name"
                  className="h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Age */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                  {t.extractedAge || 'Age'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="105"
                  value={draftProfile.age}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, age: Number(e.target.value) }))}
                  className="h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Occupation */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                  {t.extractedOccupation || 'Occupation'}
                </label>
                <select
                  value={draftProfile.occupation}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, occupation: e.target.value }))}
                  className="h-9 px-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="Farmer / Agriculture">{t.farmerOcc || 'Farmer / Agriculture'}</option>
                  <option value="Student">{t.studentOcc || 'Student'}</option>
                  <option value="Daily Wage / Construction Worker">{t.workerOcc || 'Daily Wage Worker'}</option>
                  <option value="Self-employed / Artisan">{t.artisanOcc || 'Artisan / Self-employed'}</option>
                  <option value="Homemaker / Women">{t.homemakerOcc || 'Homemaker / Women'}</option>
                  <option value="Unemployed">{t.unemployedOcc || 'Unemployed'}</option>
                </select>
              </div>

              {/* State & District */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                  {t.extractedState || 'State'} & {t.extractedDistrict || 'District'}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={draftProfile.state}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, state: e.target.value }))}
                    className="h-9 px-2 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold border border-outline-variant/30"
                  />
                  <input
                    type="text"
                    value={draftProfile.district}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, district: e.target.value }))}
                    className="h-9 px-2 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold border border-outline-variant/30"
                  />
                </div>
              </div>

              {/* Land Holding Acres */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                  {t.extractedLand || 'Land Holding'} ({t.acresUnit || 'acres'})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="1000"
                  value={draftProfile.landHoldingAcres ?? 0}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, landHoldingAcres: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  className="h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Annual Income */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                  {t.extractedIncome || 'Annual Income'} (₹)
                </label>
                <input
                  type="number"
                  step="5000"
                  min="10000"
                  max="2500000"
                  value={draftProfile.annualIncome}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, annualIncome: Number(e.target.value) }))}
                  className="h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  stopSpeakingAudio();
                  setStage('input');
                }}
                className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                <span>{t.backToPrevious || 'Back'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirm(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-container text-on-surface text-xs font-bold border border-outline-variant/30 transition-all cursor-pointer"
                >
                  <span>{t.userConfirms || 'Save to Profile'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirm(true)}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>{t.confirmAndCheck || 'Confirm & Check Eligibility'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
