import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { CitizenProfile } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: CitizenProfile;
  onConfirmProfile?: (profile: CitizenProfile, autoCheck?: boolean) => void;
  onVoiceResult?: (text: string, profileHints?: Record<string, unknown>) => void;
}

// Convert Kannada and Hindi digits to English numbers
function normalizeIndicDigits(str: string): string {
  const indicMap: Record<string, string> = {
    '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };
  return str.replace(/[೦-೯०-९]/g, (m) => indicMap[m] || m);
}

// Intelligent extractor for Indic & English speech/text
function extractCitizenDetails(rawText: string, defaultProfile?: CitizenProfile): Partial<CitizenProfile> {
  const text = normalizeIndicDigits(rawText);
  const lower = text.toLowerCase();
  const extracted: Partial<CitizenProfile> = {};

  // 1. Extract Occupation
  if (
    lower.includes('farmer') ||
    lower.includes('kisan') ||
    lower.includes('agriculture') ||
    lower.includes('cultiv') ||
    text.includes('ರೈತ') ||
    text.includes('ಕೃಷಿ') ||
    text.includes('ಬೆಳೆ') ||
    text.includes('किसान') ||
    text.includes('खेती') ||
    text.includes('कृषि')
  ) {
    extracted.occupation = 'Farmer / Agriculture';
  } else if (
    lower.includes('student') ||
    lower.includes('scholarship') ||
    lower.includes('study') ||
    lower.includes('college') ||
    text.includes('ವಿದ್ಯಾರ್ಥಿ') ||
    text.includes('ಓದು') ||
    text.includes('ವಿದ್ಯಾರ್ಥಿವೇತನ') ||
    text.includes('छात्र') ||
    text.includes('विद्यार्थी') ||
    text.includes('पढ़ाई')
  ) {
    extracted.occupation = 'Student';
    extracted.isStudentEnrolled = true;
  } else if (
    lower.includes('daily wage') ||
    lower.includes('construction') ||
    lower.includes('labour') ||
    lower.includes('worker') ||
    text.includes('ದಿನಗೂಲಿ') ||
    text.includes('ಕಾರ್ಮಿಕ') ||
    text.includes('ಕೂಲಿ') ||
    text.includes('मजदूर') ||
    text.includes('दिहाड़ी') ||
    text.includes('श्रमिक')
  ) {
    extracted.occupation = 'Daily Wage / Construction Worker';
  } else if (
    lower.includes('artisan') ||
    lower.includes('business') ||
    lower.includes('shop') ||
    lower.includes('self-employed') ||
    text.includes('ಕುಶಲಕರ್ಮಿ') ||
    text.includes('ವ್ಯಾಪಾರ') ||
    text.includes('ಅಂಗಡಿ') ||
    text.includes('ಸ್ವಯಂ ಉದ್ಯೋಗ') ||
    text.includes('कारीगर') ||
    text.includes('दुकानदार') ||
    text.includes('स्वरोजगार')
  ) {
    extracted.occupation = 'Self-employed / Artisan';
  } else if (
    lower.includes('woman') ||
    lower.includes('women') ||
    lower.includes('homemaker') ||
    lower.includes('shg') ||
    text.includes('ಮಹಿಳೆ') ||
    text.includes('ಗೃಹಿಣಿ') ||
    text.includes('ಸ್ವಸಹಾಯ') ||
    text.includes('महिला') ||
    text.includes('गृहिणी') ||
    text.includes('एसएचजी')
  ) {
    extracted.occupation = 'Homemaker / Women';
    extracted.gender = 'Female';
  }

  // 2. Extract Age
  const ageMatch =
    text.match(/(\d{1,2})\s*(years|yr|ವರ್ಷ|ವರ್ಷದ|साल|वर्ष|आयु)/i) ||
    text.match(/(age|ವಯಸ್ಸು|आयु)\s*(is|ಆಗಿದೆ|:)?\s*(\d{1,2})/i);
  if (ageMatch) {
    const parsedAge = parseInt(ageMatch[1] || ageMatch[3], 10);
    if (parsedAge >= 5 && parsedAge <= 100) {
      extracted.age = parsedAge;
    }
  }

  // 3. Extract Land Holding (Acres)
  const landMatch = text.match(/(\d+(\.\d+)?)\s*(acres|acre|ಎಕರೆ|ಏಕರೆ|एकड़)/i);
  if (landMatch) {
    const acres = parseFloat(landMatch[1]);
    if (!isNaN(acres) && acres > 0) {
      extracted.landHoldingAcres = acres;
    }
  } else if (
    lower.includes('no land') ||
    lower.includes('landless') ||
    text.includes('ಜಮೀನು ಇಲ್ಲ') ||
    text.includes('ಭೂಮಿ ಇಲ್ಲ') ||
    text.includes('जमीन नहीं') ||
    text.includes('भूमिहीन')
  ) {
    extracted.landHoldingAcres = 0;
  }

  // 4. Extract Income
  const lakhMatch = text.match(/(\d+(\.\d+)?)\s*(lakh|lakhs|ಲಕ್ಷ|ಲಾಖ್|लाख)/i);
  if (lakhMatch) {
    const factor = parseFloat(lakhMatch[1]);
    if (!isNaN(factor)) {
      extracted.annualIncome = Math.round(factor * 100000);
    }
  } else {
    const rawNumberMatch = text.match(/(₹|rs\.?|inr|ಆದಾಯ|आय)?\s*(\d{5,7})/i);
    if (rawNumberMatch && rawNumberMatch[2]) {
      const inc = parseInt(rawNumberMatch[2], 10);
      if (inc >= 10000 && inc <= 2500000) {
        extracted.annualIncome = inc;
      }
    }
  }

  // 5. Extract State
  if (lower.includes('karnataka') || text.includes('ಕರ್ನಾಟಕ') || text.includes('कर्नाटक')) {
    extracted.state = 'Karnataka';
  } else if (lower.includes('uttar pradesh') || lower.includes('u.p') || text.includes('ಉತ್ತರ ಪ್ರದೇಶ') || text.includes('उत्तर प्रदेश')) {
    extracted.state = 'Uttar Pradesh';
  } else if (lower.includes('maharashtra') || text.includes('ಮಹಾರಾಷ್ಟ್ರ') || text.includes('महाराष्ट्र')) {
    extracted.state = 'Maharashtra';
  } else if (lower.includes('bihar') || text.includes('ಬಿಹಾರ') || text.includes('बिहार')) {
    extracted.state = 'Bihar';
  } else if (lower.includes('tamil nadu') || text.includes('ತಮಿಳುನಾಡು') || text.includes('तमिलनाडु')) {
    extracted.state = 'Tamil Nadu';
  }

  // 6. Extract District
  const districtKeywords = [
    { key: 'Haveri', aliases: ['haveri', 'ಹಾವೇರಿ', 'हावेरी'] },
    { key: 'Dharwad', aliases: ['dharwad', 'ಧಾರವಾಡ', 'धारवाड़'] },
    { key: 'Belagavi', aliases: ['belagavi', 'belgaum', 'ಬೆಳಗಾವಿ', 'बेलगावी'] },
    { key: 'Mandya', aliases: ['mandya', 'ಮಂಡ್ಯ', 'मांड्या'] },
    { key: 'Mysuru', aliases: ['mysuru', 'mysore', 'ಮೈಸೂರು', 'मैसूर'] },
    { key: 'Ballari', aliases: ['ballari', 'bellary', 'ಬಳ್ಳಾರಿ', 'बेल्लारी'] },
    { key: 'Shivamogga', aliases: ['shivamogga', 'shimoga', 'ಶಿವಮೊಗ್ಗ', 'शिमोगा'] },
    { key: 'Bengaluru Rural', aliases: ['bengaluru rural', 'bangalore rural', 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ'] },
  ];
  for (const d of districtKeywords) {
    if (d.aliases.some((alias) => lower.includes(alias) || text.includes(alias))) {
      extracted.district = d.key;
      break;
    }
  }

  // 7. Extract Name
  const nameMatch =
    text.match(/(?:my name is|i am|ನನ್ನ ಹೆಸರು|ಹೆಸರು)\s+([A-Za-z\u0C80-\u0CFF\u0900-\u097F]{2,20})/i) ||
    text.match(/(?:मेरा नाम|मैं)\s+([^\s,]{3,20})/i);
  if (nameMatch && nameMatch[1]) {
    const raw = nameMatch[1].trim();
    if (!['here', 'a', 'the', 'farmer', 'student', 'worker'].includes(raw.toLowerCase())) {
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

  // Status Indicator: 'ready' | 'listening' | 'captured' | 'unavailable'
  const [micStatus, setMicStatus] = useState<MicStatus>('ready');

  // Explicit Browser Error State
  const [errorType, setErrorType] = useState<
    'not-allowed' | 'not-found' | 'not-readable' | 'security' | 'abort' | 'insecure' | 'unsupported' | 'network' | 'language' | 'other' | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    } else {
      stopListening();
    }
  }, [isOpen, currentProfile]);

  // Clean up recognition & audio tracks on unmount
  useEffect(() => {
    return () => {
      stopListening();
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

  // Start real browser Web Speech API directly from user click action
  const startListening = async () => {
    setErrorType(null);
    setErrorMessage(null);

    // 1. Check secure context (HTTPS)
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      setIsRecording(false);
      setErrorType('insecure');
      setErrorMessage(
        language === 'kn'
          ? 'ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶಕ್ಕೆ ಸುರಕ್ಷಿತ ಸಂಪರ್ಕ (HTTPS) ಅಗತ್ಯವಿದೆ.'
          : language === 'hi'
          ? 'माइक्रोफ़ोन एक्सेस के लिए एक सुरक्षित कनेक्शन (HTTPS) आवश्यक है।'
          : 'Microphone access requires a secure connection (HTTPS).'
      );
      setMicStatus('error');
      return;
    }

    // 2. Request microphone stream directly from the user click action
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsRecording(false);
      setErrorType('unsupported');
      setErrorMessage(
        language === 'kn'
          ? 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.'
          : language === 'hi'
          ? 'इस ब्राउज़र में माइक्रोफ़ोन एक्सेस समर्थित नहीं है।'
          : 'Microphone access is not supported in this browser.'
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
          language === 'kn'
            ? 'ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನೀಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
            : language === 'hi'
            ? 'माइक्रोफ़ोन एक्सेस अवरुद्ध है। कृपया माइक्रोफ़ोन एक्सेस की अनुमति दें और पुनः प्रयास करें।'
            : 'Microphone access is blocked. Please allow microphone access and try again.'
        );
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setErrorType('not-found');
        setErrorMessage(
          language === 'kn'
            ? 'ಯಾವುದೇ ಮೈಕ್ರೊಫೋನ್ ಪತ್ತೆಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ಸಕ್ರಿಯಗೊಳಿಸಿ.'
            : language === 'hi'
            ? 'कोई माइक्रोफ़ोन नहीं मिला। कृपया माइक्रोफ़ोन कनेक्ट या सक्षम करें।'
            : 'No microphone was detected. Please connect or enable a microphone.'
        );
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setErrorType('not-readable');
        setErrorMessage(
          language === 'kn'
            ? 'ಮೈಕ್ರೊಫೋನ್ ಈಗಾಗಲೇ ಮತ್ತೊಂದು ಅಪ್ಲಿಕೇಶನ್‌ನಿಂದ ಬಳಕೆಯಲ್ಲಿದೆ.'
            : language === 'hi'
            ? 'माइक्रोफ़ोन पहले से ही किसी अन्य एप्लिकेशन द्वारा उपयोग में है।'
            : 'The microphone is already being used by another application.'
        );
      } else if (errName === 'SecurityError') {
        setErrorType('security');
        setErrorMessage(
          language === 'kn'
            ? 'ಈ ಪರಿಸರದಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶ ಲಭ್ಯವಿಲ್ಲ.'
            : language === 'hi'
            ? 'इस वातावरण में माइक्रोफ़ोन एक्सेस उपलब्ध नहीं है।'
            : 'Microphone access is not available in this environment.'
        );
      } else if (errName === 'AbortError') {
        setErrorType('abort');
        setErrorMessage(
          language === 'kn'
            ? 'ಮೈಕ್ರೊಫೋನ್ ವಿನಂತಿಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
            : language === 'hi'
            ? 'माइक्रोफ़ोन अनुरोध बाधित हुआ। कृपया पुनः प्रयास करें।'
            : 'Microphone access was aborted. Please try again.'
        );
      } else if (errName === 'OverconstrainedError') {
        setErrorType('not-found');
        setErrorMessage(
          language === 'kn'
            ? 'ಸೂಕ್ತವಾದ ಮೈಕ್ರೊಫೋನ್ ಸಾಧನ ಸಿಗಲಿಲ್ಲ.'
            : language === 'hi'
            ? 'उपयुक्त माइक्रोफ़ोन डिवाइस नहीं मिला।'
            : 'No suitable microphone device could be found.'
        );
      } else {
        setErrorType('other');
        setErrorMessage(
          errMsg ||
            (language === 'kn'
              ? 'ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶ ವಿಫಲವಾಗಿದೆ.'
              : language === 'hi'
              ? 'माइक्रोफ़ोन एक्सेस विफल रहा।'
              : 'Microphone access failed.')
        );
      }
      return;
    }

    // 3. Validate stream: Confirm stream exists, audio tracks exist, and at least one is enabled
    if (!stream || !stream.getAudioTracks || stream.getAudioTracks().length === 0) {
      setIsRecording(false);
      setErrorType('not-found');
      setErrorMessage(
        language === 'kn'
          ? 'ಯಾವುದೇ ಆಡಿಯೊ ಟ್ರ್ಯಾಕ್ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಪರಿಶೀಲಿಸಿ.'
          : language === 'hi'
          ? 'कोई ऑडियो ट्रैक नहीं मिला। कृपया माइक्रोफ़ोन जांचें।'
          : 'No active audio track was found on the microphone.'
      );
      setMicStatus('error');
      return;
    }

    const audioTracks = stream.getAudioTracks();
    const activeTrack = audioTracks.find((track) => track.enabled);
    if (!activeTrack) {
      setIsRecording(false);
      setErrorType('not-readable');
      setErrorMessage(
        language === 'kn'
          ? 'ಮೈಕ್ರೊಫೋನ್ ಆಡಿಯೊ ಟ್ರ್ಯಾಕ್ ಸಕ್ರಿಯವಾಗಿಲ್ಲ.'
          : language === 'hi'
          ? 'माइक्रोफ़ोन ऑडियो ट्रैक सक्रिय नहीं है।'
          : 'The microphone audio track is disabled or inactive.'
      );
      setMicStatus('error');
      return;
    }

    // KEEP STREAM ALIVE while recognition is active (tracks stopped only when recording ends)
    activeStreamRef.current = stream;

    // 4. Initialize SpeechRecognition with selected language
    const windowWithSpeech = window as any;
    const SpeechRecognitionClass =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsRecording(false);
      setErrorType('unsupported');
      setErrorMessage(
        language === 'kn'
          ? 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ.'
          : language === 'hi'
          ? 'इस ब्राउज़र में आवाज़ पहचान समर्थित नहीं है। कृपया इसके बजाय टाइप करें।'
          : 'Voice recognition is not supported in this browser.'
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

      // Exact language selection: Kannada -> kn-IN, Hindi -> hi-IN, English -> en-IN
      const langCode = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.lang = langCode;

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
          // User paused; keep listening without reporting error
          return;
        }

        if (event.error === 'aborted') {
          // Stopped intentionally
          return;
        }

        stopListening();
        setMicStatus('error');

        if (event.error === 'not-allowed') {
          setErrorType('not-allowed');
          setErrorMessage(
            language === 'kn'
              ? 'ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನೀಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
              : language === 'hi'
              ? 'माइक्रोफ़ोन एक्सेस अवरुद्ध है। कृपया माइक्रोफ़ोन एक्सेस की अनुमति दें और पुनः प्रयास करें।'
              : 'Microphone access is blocked. Please allow microphone access and try again.'
          );
        } else if (event.error === 'audio-capture') {
          setErrorType('not-found');
          setErrorMessage(
            language === 'kn'
              ? 'ಯಾವುದೇ ಮೈಕ್ರೊಫೋನ್ ಪತ್ತೆಯಾಗಿಲ್ಲ ಅಥವಾ ಆಡಿಯೊ ಕ್ಯಾಪ್ಚರ್ ವಿಫಲವಾಗಿದೆ.'
              : language === 'hi'
              ? 'कोई माइक्रोफ़ोन नहीं मिला या ऑडियो कैप्चर विफल रहा।'
              : 'No microphone was detected or audio capture failed.'
          );
        } else if (event.error === 'network') {
          setErrorType('network');
          setErrorMessage(
            language === 'kn'
              ? 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ನೆಟ್‌ವರ್ಕ್ ದೋಷ. ದಯವಿಟ್ಟು ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ.'
              : language === 'hi'
              ? 'आवाज़ पहचान नेटवर्क त्रुटि। कृपया इंटरनेट कनेक्शन जांचें।'
              : 'Voice recognition network error. Please check your internet connection.'
          );
        } else if (event.error === 'service-not-allowed') {
          setErrorType('security');
          setErrorMessage(
            language === 'kn'
              ? 'ಈ ಬ್ರೌಸರ್ ಪರಿಸರದಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಸೇವೆಯನ್ನು ಅನುಮತಿಸಲಾಗಿಲ್ಲ.'
              : language === 'hi'
              ? 'इस ब्राउज़र वातावरण में आवाज़ पहचान सेवा की अनुमति नहीं है।'
              : 'Voice recognition service is not permitted in this browser environment.'
          );
        } else if (event.error === 'bad-grammar' || event.error === 'language-not-supported') {
          setErrorType('language');
          setErrorMessage(
            language === 'kn'
              ? `'${langCode}' ಭಾಷೆ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಬೆಂಬಲಿಸದಿರಬಹುದು.`
              : language === 'hi'
              ? `'${langCode}' भाषा इस ब्राउज़र में समर्थित नहीं हो सकती है।`
              : `Language '${langCode}' may not be supported by this browser speech engine.`
          );
        } else {
          setErrorType('other');
          setErrorMessage(
            language === 'kn'
              ? `ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ದೋಷ: ${event.error}`
              : language === 'hi'
              ? `आवाज़ पहचान त्रुटि: ${event.error}`
              : `Voice capture error: ${event.error}.`
          );
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        // Release stream tracks when recognition ends
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
      setErrorMessage(
        language === 'kn'
          ? 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಪ್ರಾರಂಭಿಸಲು ವಿಫಲವಾಗಿದೆ.'
          : language === 'hi'
          ? 'आवाज़ पहचान शुरू करने में विफल।'
          : err?.message || 'Voice recognition is not supported in this browser.'
      );
      setMicStatus('error');
    }
  };

  // Handle clicking the Voice action button (Toggles Listening - NEVER switches to type)
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

  // Handle switching manually to Type Instead mode
  const handleTypeInsteadClick = () => {
    stopListening();
    setErrorType(null);
    setErrorMessage(null);
    setInputMode('text');
  };

  // Dedicated Try Again handler that re-executes microphone initialization
  const handleTryAgain = () => {
    setErrorType(null);
    setErrorMessage(null);
    setMicStatus('ready');
    startListening();
  };

  // Process entered/spoken text into citizen profile
  const handleProcessText = () => {
    if (!inputText.trim()) return;
    const extracted = extractCitizenDetails(inputText, currentProfile);
    setDraftProfile((prev) => ({
      ...prev,
      ...extracted,
    }));
    setStage('extracted');
  };

  // Confirm extracted profile and save
  const handleConfirm = (autoCheck: boolean = false) => {
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

  if (!isOpen) return null;

  const placeholderText = language === 'kn'
    ? 'ನಿಮ್ಮ ಅಗತ್ಯತೆಗಳನ್ನು ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ...'
    : language === 'hi'
    ? 'अपनी आवश्यकताएं बोलें या टाइप करें...'
    : 'Speak naturally or type your requirements...';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in overflow-hidden">
      <div className="relative w-full max-w-2xl rounded-3xl bg-surface-container-lowest p-6 sm:p-8 shadow-2xl border border-outline-variant/30 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        
        {/* Top Header Bar with Back and Close Buttons */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs shadow-xs border border-outline-variant/30 transition-all hover:scale-105 cursor-pointer"
              aria-label={t.back}
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>{t.back}</span>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-md">
                <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-on-surface leading-tight">
                  {t.vaTitle}
                </h3>
                <p className="text-[11px] text-on-surface-variant font-medium">
                  {placeholderText}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Language Selector & Mode Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-surface-container-low border border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-on-surface-variant uppercase pl-1">
              {t.vaDialect}
            </span>
            <div className="flex items-center gap-1">
              {[
                { code: 'kn' as const, label: 'ಕನ್ನಡ' },
                { code: 'hi' as const, label: 'हिन्दी' },
                { code: 'en' as const, label: 'English' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    if (isRecording) {
                      stopListening();
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded-full font-bold transition-all cursor-pointer ${
                    language === item.code
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/20">
            {/* The Voice button: Starts recording / shows Listening... */}
            <button
              type="button"
              onClick={handleVoiceButtonClick}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                inputMode === 'voice'
                  ? isRecording
                    ? 'bg-error text-on-error shadow-md animate-pulse ring-2 ring-error/50'
                    : 'bg-secondary text-on-secondary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
              title={isRecording ? 'Click to stop listening' : 'Click to start voice recording'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isRecording ? 'stop' : 'mic'}
              </span>
              <span>
                {inputMode === 'voice' && isRecording
                  ? language === 'kn'
                    ? '🔴 ಆಲಿಸಲಾಗುತ್ತಿದೆ... ನಿಲ್ಲಿಸಿ'
                    : language === 'hi'
                    ? '🔴 सुन रहा है... रोकें'
                    : '🔴 Listening... Stop'
                  : language === 'kn'
                  ? '🎤 ಮಾತನಾಡಲು ಪ್ರಾರಂಭಿಸಿ'
                  : language === 'hi'
                  ? '🎤 बोलना शुरू करें'
                  : '🎤 Start Speaking'}
              </span>
            </button>

            {/* Type Instead Button (Only manual fallback) */}
            <button
              type="button"
              onClick={handleTypeInsteadClick}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                inputMode === 'text'
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">keyboard</span>
              <span>
                {language === 'kn'
                  ? '⌨ ಬದಲಿಗೆ ಟೈಪ್ ಮಾಡಿ'
                  : language === 'hi'
                  ? '⌨ इसके बजाय टाइप करें'
                  : '⌨ Type Instead'}
              </span>
            </button>
          </div>
        </div>

        {/* STAGE 1: INPUT CAPTURE (VOICE OR TEXT) */}
        {stage === 'input' && (
          <div className="space-y-4 animate-fade-in">
            {/* VOICE MODE */}
            {inputMode === 'voice' && (
              <div className="p-5 sm:p-6 rounded-2xl bg-inverse-surface text-inverse-on-surface relative overflow-hidden flex flex-col items-center text-center gap-4 shadow-inner">
                
                {/* 
                  MICROPHONE STATUS INDICATOR:
                  - Listening (localized)
                  - Ready (localized)
                  - Unavailable (localized)
                  - Captured (localized)
                */}
                <div className="flex items-center justify-between w-full text-xs font-mono text-surface-container-highest">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-surface-container-highest">
                      {language === 'kn' ? 'ಸ್ಥಿತಿ:' : language === 'hi' ? 'स्थिति:' : 'Status:'}
                    </span>
                    {micStatus === 'listening' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error/20 text-error font-bold border border-error/40 animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-error animate-ping"></span>
                        <span>
                          {language === 'kn'
                            ? '🔴 ಆಲಿಸಲಾಗುತ್ತಿದೆ... (Listening)'
                            : language === 'hi'
                            ? '🔴 सुन रहा है... (Listening)'
                            : '🔴 Listening...'}
                        </span>
                      </span>
                    )}
                    {micStatus === 'ready' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed/20 text-tertiary-fixed font-bold border border-tertiary-fixed/30">
                        <span className="h-2 w-2 rounded-full bg-tertiary-fixed"></span>
                        <span>
                          {language === 'kn'
                            ? '● ಸಿದ್ಧವಾಗಿದೆ (Ready)'
                            : language === 'hi'
                            ? '● तैयार है (Ready)'
                            : '● Ready'}
                        </span>
                      </span>
                    )}
                    {micStatus === 'captured' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary-fixed font-bold border border-primary/30">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>
                          {language === 'kn'
                            ? '✓ ಧ್ವನಿ ಸೆರೆಹಿಡಿಯಲಾಗಿದೆ'
                            : language === 'hi'
                            ? '✓ आवाज़ प्राप्त हुई'
                            : '✓ Speech Captured'}
                        </span>
                      </span>
                    )}
                    {micStatus === 'error' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-bold border border-error/40">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        <span>
                          {language === 'kn'
                            ? '⚠ ದೋಷ (Error)'
                            : language === 'hi'
                            ? '⚠ त्रुटि (Error)'
                            : '⚠ Error'}
                        </span>
                      </span>
                    )}
                    {micStatus === 'unavailable' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-bold border border-error/30">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        <span>
                          {language === 'kn'
                            ? '⚠ ಲಭ್ಯವಿಲ್ಲ (Unavailable)'
                            : language === 'hi'
                            ? '⚠ अनुपलब्ध है (Unavailable)'
                            : '⚠ Unavailable'}
                        </span>
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-surface/30 text-surface-container-highest border border-surface-container-highest/20">
                    {language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'}
                  </span>
                </div>

                {/* Primary Voice Action Button */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={isRecording ? stopListening : startListening}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                      isRecording
                        ? 'bg-error text-on-error scale-110 shadow-error/40'
                        : 'bg-primary text-on-primary hover:scale-105 shadow-primary/30'
                    }`}
                    title={isRecording ? 'Click to stop' : 'Click to start speaking'}
                  >
                    <span className="material-symbols-outlined text-[36px]">
                      {isRecording ? 'stop' : 'mic'}
                    </span>
                    {isRecording && (
                      <span className="absolute -inset-2 rounded-full border-2 border-error animate-ping pointer-events-none"></span>
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-surface-bright">
                    {isRecording
                      ? language === 'kn'
                        ? '🔴 ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಈಗ ಸಹಜವಾಗಿ ಮಾತನಾಡಿ'
                        : language === 'hi'
                        ? '🔴 सुन रहा है... अब सहज रूप से बोलें'
                        : '🔴 Listening... Speak naturally now'
                      : language === 'kn'
                      ? '"ಮಾತನಾಡಲು ಪ್ರಾರಂಭಿಸಿ" ಕ್ಲಿಕ್ ಮಾಡಿ'
                      : language === 'hi'
                      ? '"बोलना शुरू करें" पर क्लिक करें'
                      : 'Click "Start Speaking" to talk'}
                  </h4>
                  <p className="text-xs text-surface-container-highest max-w-md">
                    {language === 'kn'
                      ? 'ನಿಮ್ಮ ಉದ್ಯೋಗ, ವಯಸ್ಸು, ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ಅಥವಾ ಜಿಲ್ಲೆಯನ್ನು ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ.'
                      : language === 'hi'
                      ? 'अपना व्यवसाय, आयु, भूमि क्षेत्र या जिला हिंदी, कन्नड़ या अंग्रेजी में बोलें।'
                      : 'Speak your occupation, age, land area, or state in Kannada, Hindi, or English.'}
                  </p>
                </div>

                {/* Animated Waveform Indicator */}
                <div className="flex items-center justify-center gap-1.5 h-6 pt-1">
                  {[6, 14, 24, 34, 18, 30, 38, 22, 16, 28, 12, 6].map((h, idx) => (
                    <span
                      key={idx}
                      className="w-1.5 rounded-full bg-tertiary-fixed transition-all duration-150"
                      style={{
                        height: isRecording ? `${Math.max(6, h * 0.9)}px` : '6px',
                        opacity: isRecording ? 1 : 0.35,
                      }}
                    />
                  ))}
                </div>

                {/* Real-time recognized speech input area (Editable) */}
                <div className="w-full text-left space-y-2 pt-2">
                  <label className="text-xs font-mono font-bold text-surface-container-highest flex items-center justify-between">
                    <span>
                      {language === 'kn'
                        ? 'ಗುರುತಿಸಲಾದ ಧ್ವನಿ (ತಿದ್ದುಪಡಿ ಮಾಡಬಹುದು):'
                        : language === 'hi'
                        ? 'पहचानी गई आवाज़ (संपादन योग्य):'
                        : 'Recognized Speech (Editable):'}
                    </span>
                    {isRecording && (
                      <span className="text-[10px] text-error font-bold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-error animate-ping"></span>
                        {language === 'kn' ? 'ಮೈಕ್ರೊಫೋನ್ ಸಕ್ರಿಯವಾಗಿದೆ' : language === 'hi' ? 'माइक्रोफ़ोन सक्रिय है' : 'Microphone Active'}
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
                    placeholder={placeholderText}
                    className="w-full p-3.5 rounded-xl bg-surface/20 text-surface-bright text-sm border border-surface-container-highest/30 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-surface-container-highest/60"
                  />
                </div>

                {/* Controls below voice box: Stop/Start & Submit */}
                <div className="flex flex-wrap items-center justify-between w-full pt-1 gap-2">
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={stopListening}
                      className="px-4 py-2 rounded-xl bg-error/90 hover:bg-error text-on-error text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">stop</span>
                      <span>
                        {language === 'kn' ? 'ಆಲಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ' : language === 'hi' ? 'सुनना बंद करें' : 'Stop Listening'}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startListening}
                      className="px-4 py-2 rounded-xl bg-surface-container-high/40 hover:bg-surface-container-high text-surface-bright text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">mic</span>
                      <span>
                        {inputText
                          ? language === 'kn'
                            ? 'ಇನ್ನಷ್ಟು ಮಾತನಾಡಿ'
                            : language === 'hi'
                            ? 'और बोलें'
                            : 'Speak More'
                          : language === 'kn'
                          ? 'ಮಾತನಾಡಲು ಪ್ರಾರಂಭಿಸಿ'
                          : language === 'hi'
                          ? 'बोलना शुरू करें'
                          : 'Start Speaking'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={!inputText.trim()}
                    onClick={handleProcessText}
                    className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-lg hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer ml-auto"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>{language === 'kn' ? 'ಸಲ್ಲಿಸಿ' : language === 'hi' ? 'जमा करें' : 'Submit'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TEXT MODE */}
            {inputMode === 'text' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider block font-mono">
                    {language === 'kn' ? 'ನಿಮ್ಮ ಅಗತ್ಯತೆಗಳನ್ನು ಟೈಪ್ ಮಾಡಿ' : language === 'hi' ? 'अपनी आवश्यकताएं टाइप करें' : 'Type Your Requirements'}
                  </label>
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    {language === 'kn' ? 'ಕೀಬೋರ್ಡ್ ಇನ್‌ಪುಟ್ ಮೋಡ್' : language === 'hi' ? 'कीबोर्ड इनपुट मोड' : 'Keyboard Input Mode'}
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={placeholderText}
                    className="w-full p-4 rounded-2xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleVoiceButtonClick}
                      className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">mic</span>
                      <span>
                        {language === 'kn' ? 'ಧ್ವನಿ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ' : language === 'hi' ? 'आवाज़ मोड पर स्विच करें' : 'Switch to Voice'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={!inputText.trim()}
                      onClick={handleProcessText}
                      className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>{language === 'kn' ? 'ಸಲ್ಲಿಸಿ' : language === 'hi' ? 'जमा करें' : 'Submit'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Browser Error Notification with actual error message and Retry button */}
            {errorType && (
              <div className="p-4 rounded-2xl bg-error-container text-on-error-container text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-error/40 shadow-sm animate-fade-in">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-error">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>
                      {errorType === 'not-allowed'
                        ? language === 'kn'
                          ? 'ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ'
                          : language === 'hi'
                          ? 'माइक्रोफ़ोन एक्सेस अवरुद्ध है'
                          : 'Microphone access is blocked.'
                        : errorType === 'not-found'
                        ? language === 'kn'
                          ? 'ಯಾವುದೇ ಮೈಕ್ರೊಫೋನ್ ಪತ್ತೆಯಾಗಿಲ್ಲ'
                          : language === 'hi'
                          ? 'कोई माइक्रोफ़ोन नहीं मिला'
                          : 'No microphone was detected.'
                        : errorType === 'not-readable'
                        ? language === 'kn'
                          ? 'ಮೈಕ್ರೊಫೋನ್ ಈಗಾಗಲೇ ಬಳಕೆಯಲ್ಲಿದೆ'
                          : language === 'hi'
                          ? 'माइक्रोफ़ोन उपयोग में है'
                          : 'Microphone is currently in use.'
                        : errorType === 'security'
                        ? language === 'kn'
                          ? 'ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ'
                          : language === 'hi'
                          ? 'माइक्रोफ़ोन एक्सेस प्रतिबंधित है'
                          : 'Microphone access restricted.'
                        : errorType === 'insecure'
                        ? language === 'kn'
                          ? 'ಸುರಕ್ಷಿತ ಸಂಪರ್ಕ (HTTPS) ಅಗತ್ಯವಿದೆ'
                          : language === 'hi'
                          ? 'सुरक्षित कनेक्शन (HTTPS) आवश्यक है'
                          : 'HTTPS required.'
                        : errorType === 'network'
                        ? language === 'kn'
                          ? 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ನೆಟ್‌ವರ್ಕ್ ದೋಷ'
                          : language === 'hi'
                          ? 'आवाज़ पहचान नेटवर्क त्रुटि'
                          : 'Speech recognition network error.'
                        : errorType === 'unsupported'
                        ? language === 'kn'
                          ? 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ'
                          : language === 'hi'
                          ? 'आवाज़ पहचान असमर्थित है'
                          : 'Speech recognition unsupported.'
                        : language === 'kn'
                        ? 'ಮೈಕ್ರೊಫೋನ್ ಸಮಸ್ಯೆ ಎದುರಾಗಿದೆ'
                        : language === 'hi'
                        ? 'माइक्रोफ़ोन समस्या उत्पन्न हुई'
                        : 'Microphone issue encountered.'}
                    </span>
                  </div>
                  {errorMessage && (
                    <p className="text-[11px] text-on-error-container leading-relaxed pl-6">
                      {errorMessage}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pl-6 sm:pl-0">
                  {errorType !== 'unsupported' && errorType !== 'insecure' && (
                    <button
                      type="button"
                      onClick={handleTryAgain}
                      className="px-3.5 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-bold text-xs shadow-xs border border-outline-variant/30 hover:bg-surface-container transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">refresh</span>
                      <span>
                        {language === 'kn' ? 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' : language === 'hi' ? 'पुनः प्रयास करें' : 'Try Again'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleTypeInsteadClick}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-bold text-xs shadow-xs hover:bg-primary-container transition-all cursor-pointer whitespace-nowrap"
                  >
                    {language === 'kn' ? 'ಬದಲಿಗೆ ಟೈಪ್ ಮಾಡಿ' : language === 'hi' ? 'इसके बजाय टाइप करें' : 'Type Instead'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STAGE 2: EXTRACTED PROFILE CONFIRMATION */}
        {stage === 'extracted' && (
          <div className="space-y-5 animate-fade-in">
            {/* Header info */}
            <div className="p-4 rounded-2xl bg-tertiary-fixed/20 border border-tertiary/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[22px]">verified</span>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">
                    {t.extractedInfo}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">
                    {t.weUnderstood}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStage('input')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>{language === 'kn' ? 'ಮತ್ತೆ ಮಾತನಾಡಿ' : language === 'hi' ? 'पुनः प्रयास करें' : 'Re-speak / Edit'}</span>
              </button>
            </div>

            {/* Editable Extracted Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase font-mono">
                  {t.extractedName}
                </label>
                <input
                  type="text"
                  value={draftProfile.fullName}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Enter full name"
                  className="h-10 px-3 rounded-xl bg-surface-container-lowest text-on-surface text-sm font-semibold border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Age */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase font-mono">
                  {t.extractedAge}
                </label>
                <input
                  type="number"
                  min="1"
                  max="105"
                  value={draftProfile.age}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, age: Number(e.target.value) }))}
                  className="h-10 px-3 rounded-xl bg-surface-container-lowest text-on-surface text-sm font-semibold border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Occupation */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase font-mono">
                  {t.extractedOccupation}
                </label>
                <select
                  value={draftProfile.occupation}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, occupation: e.target.value }))}
                  className="h-10 px-3 rounded-xl bg-surface-container-lowest text-on-surface text-sm font-semibold border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Farmer / Agriculture">{t.farmerOcc}</option>
                  <option value="Student">{t.studentOcc}</option>
                  <option value="Daily Wage / Construction Worker">{t.workerOcc}</option>
                  <option value="Self-employed / Artisan">{t.artisanOcc}</option>
                  <option value="Homemaker / Women">{t.homemakerOcc}</option>
                  <option value="Unemployed">{t.unemployedOcc}</option>
                </select>
              </div>

              {/* State & District */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase font-mono">
                  {t.extractedState} & {t.extractedDistrict}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={draftProfile.state}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, state: e.target.value }))}
                    className="h-10 px-2.5 rounded-xl bg-surface-container-lowest text-on-surface text-xs font-semibold border border-outline-variant/30"
                  />
                  <input
                    type="text"
                    value={draftProfile.district}
                    onChange={(e) => setDraftProfile((p) => ({ ...p, district: e.target.value }))}
                    className="h-10 px-2.5 rounded-xl bg-surface-container-lowest text-on-surface text-xs font-semibold border border-outline-variant/30"
                  />
                </div>
              </div>

              {/* Land Holding Acres */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase font-mono">
                  {t.extractedLand} ({t.acresUnit})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="1000"
                  value={draftProfile.landHoldingAcres ?? 0}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, landHoldingAcres: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  className="h-10 px-3 rounded-xl bg-surface-container-lowest text-on-surface text-sm font-semibold border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Annual Income */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase font-mono">
                  {t.extractedIncome} (₹)
                </label>
                <input
                  type="number"
                  step="5000"
                  min="10000"
                  max="2500000"
                  value={draftProfile.annualIncome}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, annualIncome: Number(e.target.value) }))}
                  className="h-10 px-3 rounded-xl bg-surface-container-lowest text-on-surface text-sm font-semibold border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Action Buttons: Confirm vs Confirm & Check Eligibility */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStage('input')}
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>{t.backToPrevious}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirm(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container-highest hover:bg-surface-container text-on-surface text-xs font-bold border border-outline-variant/30 transition-all cursor-pointer"
                >
                  <span>{t.userConfirms}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirm(true)}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>{t.confirmAndCheck}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
