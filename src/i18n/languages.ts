import { Language } from '../types';

export interface LanguageOption {
  code: Language;
  label: string;
  native: string;
  speechCode?: string;
}

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'as', label: 'Assamese', native: 'অসমীয়া', speechCode: 'as-IN' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'brx', label: 'Bodo', native: "बर' राव", speechCode: 'brx-IN' },
  { code: 'doi', label: 'Dogri', native: 'डोगरी', speechCode: 'doi-IN' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', speechCode: 'gu-IN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'ks', label: 'Kashmiri', native: 'कॉशुर / کٲشُر', speechCode: 'ks-IN' },
  { code: 'kok', label: 'Konkani', native: 'कोंकणी', speechCode: 'kok-IN' },
  { code: 'mai', label: 'Maithili', native: 'मैथिली', speechCode: 'mai-IN' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'mni', label: 'Manipuri', native: 'মৈতৈಲೋন্', speechCode: 'mni-IN' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', speechCode: 'mr-IN' },
  { code: 'ne', label: 'Nepali', native: 'नेपाली', speechCode: 'ne-IN' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', speechCode: 'or-IN' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN' },
  { code: 'sa', label: 'Sanskrit', native: 'संस्कृतम्', speechCode: 'sa-IN' },
  { code: 'sat', label: 'Santhali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', speechCode: 'sat-IN' },
  { code: 'sd', label: 'Sindhi', native: 'سنڌي', speechCode: 'sd-IN' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'ur', label: 'Urdu', native: 'اردو', speechCode: 'ur-IN' },
];

export const ALL_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English', speechCode: 'en-IN' },
  ...INDIAN_LANGUAGES,
];

export function getLanguageOption(code: string): LanguageOption {
  return ALL_LANGUAGES.find((l) => l.code === code) || ALL_LANGUAGES[0];
}
