import { Language } from '../types';
import { Translations, enTranslations } from './locales/en';
import { knTranslations } from './locales/kn';
import { hiTranslations } from './locales/hi';
import { taTranslations, teTranslations, mlTranslations } from './locales/southGroup';
import { bnTranslations, orTranslations, asTranslations, mniTranslations, satTranslations } from './locales/eastGroup';
import { mrTranslations, guTranslations, paTranslations, urTranslations, sdTranslations } from './locales/westCentralGroup';
import {
  saTranslations,
  neTranslations,
  maiTranslations,
  kokTranslations,
  ksTranslations,
  doiTranslations,
  brxTranslations,
} from './locales/northHimalayanGroup';

export type { Translations };

export const translations: Record<Language, Translations> = {
  en: enTranslations,
  kn: knTranslations,
  hi: hiTranslations,
  ta: taTranslations,
  te: teTranslations,
  ml: mlTranslations,
  bn: bnTranslations,
  mr: mrTranslations,
  gu: guTranslations,
  pa: paTranslations,
  or: orTranslations,
  as: asTranslations,
  ur: urTranslations,
  sa: saTranslations,
  ne: neTranslations,
  mai: maiTranslations,
  kok: kokTranslations,
  ks: ksTranslations,
  doi: doiTranslations,
  brx: brxTranslations,
  mni: mniTranslations,
  sat: satTranslations,
  sd: sdTranslations,
};

// Helper to get translated reasons for why user is eligible
export function getTranslatedReason(
  reasonType: 'age' | 'occupation' | 'land' | 'income' | 'state' | 'gender' | 'ration' | 'caste' | 'student' | 'general',
  lang: Language,
  params: { age?: number; occupation?: string; income?: number; state?: string; acres?: number; extra?: string } = {}
): string {
  const { age, occupation, income, state, acres, extra } = params;

  if (lang === 'kn') {
    switch (reasonType) {
      case 'age':
        return `✓ ವಯಸ್ಸಿನ ಮಾನದಂಡ ಪೂರೈಸಲಾಗಿದೆ (ವಯಸ್ಸು ${age} ವರ್ಷಗಳು ಅರ್ಹ ವ್ಯಾಪ್ತಿಯಲ್ಲಿದೆ)`;
      case 'occupation':
        return `✓ ಉದ್ಯೋಗ ಮಾನದಂಡ ಪೂರೈಸಲಾಗಿದೆ (${occupation || 'ಅರ್ಹ ಕಸುಬು'})`;
      case 'land':
        return `✓ ಜಮೀನಿನ ಮಾಲೀಕತ್ವ ಮಾನದಂಡ ಪೂರೈಸಲಾಗಿದೆ (${acres ?? 2} ಎಕರೆ ಕೃಷಿ ಭೂಮಿ)`;
      case 'income':
        return `✓ ಆದಾಯದ ಮಾನದಂಡ ಪೂರೈಸಲಾಗಿದೆ (ವಾರ್ಷಿಕ ಆದಾಯ ₹${(income ?? 150000).toLocaleString('en-IN')} ಮಿತಿಯಲ್ಲಿದೆ)`;
      case 'state':
        return `✓ ರಾಜ್ಯ ನಿವಾಸದ ಮಾನದಂಡ ಪೂರೈಸಲಾಗಿದೆ (${state || 'ಕರ್ನಾಟಕ'} ನಿವಾಸಿ)`;
      case 'gender':
        return '✓ ಮಹಿಳಾ ಸಬಲೀಕರಣ ಯೋಜನೆಯ ಲಿಂಗ ಮಾನದಂಡ ಪೂರೈಸಲಾಗಿದೆ';
      case 'ration':
        return `✓ ಆರ್ಥಿಕ ಸ್ಥಿತಿ / ಪಡಿತರ ಚೀಟಿ ಮಾನದಂಡ ಪೂರೈಸಲಾಗಿದೆ (${extra || 'BPL / ಕಡಿಮೆ ಆದಾಯ'})`;
      case 'caste':
        return `✓ ಸಾಮಾಜಿಕ ವರ್ಗದ ಮಾನದಂಡ ಪೂರೈಸಲಾಗಿದೆ (${extra || 'ಅರ್ಹ ವರ್ಗ'})`;
      case 'student':
        return '✓ ನಿಯಮಿತ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಯಲ್ಲಿ ದಾಖಲಾದ ವಿದ್ಯಾರ್ಥಿ ಮಾನದಂಡ ಪೂರೈಸಲಾಗಿದೆ';
      default:
        return '✓ ಯೋಜನೆಯ ಸಾಮಾನ್ಯ ಅರ್ಹತಾ ಮಾನದಂಡಗಳು ಪೂರೈಕೆಯಾಗಿವೆ';
    }
  }

  if (lang === 'hi') {
    switch (reasonType) {
      case 'age':
        return `✓ आयु आवश्यकता पूरी हुई (आयु ${age} वर्ष पात्रता सीमा में है)`;
      case 'occupation':
        return `✓ व्यवसाय आवश्यकता पूरी हुई (${occupation || 'योग्य व्यवसाय'})`;
      case 'land':
        return `✓ भूमि स्वामित्व आवश्यकता पूरी हुई (${acres ?? 2} एकड़ कृषि भूमि)`;
      case 'income':
        return `✓ आय आवश्यकता पूरी हुई (वार्षिक आय ₹${(income ?? 150000).toLocaleString('en-IN')} सीमा के भीतर है)`;
      case 'state':
        return `✓ राज्य आवश्यकता पूरी हुई (${state || 'राज्य'} के निवासी)`;
      case 'gender':
        return '✓ महिला सशक्तिकरण मानदंड पूरा हुआ';
      case 'ration':
        return `✓ आर्थिक स्थिति / राशन कार्ड मानदंड पूरा हुआ (${extra || 'बीपीएल / अल्प आय'})`;
      case 'caste':
        return `✓ सामाजिक श्रेणी मानदंड पूरा हुआ (${extra || 'पात्र श्रेणी'})`;
      case 'student':
        return '✓ मान्यता प्राप्त संस्थान में नामांकित छात्र मानदंड पूरा हुआ';
      default:
        return '✓ योजना के सभी सामान्य पात्रता मानदंड पूरे हुए';
    }
  }

  if (lang === 'ta') {
    switch (reasonType) {
      case 'age':
        return `✓ வயது வரம்பு தகுதி பெறுகிறது (${age} வயது தகுதி வரம்பிற்குள் உள்ளது)`;
      case 'occupation':
        return `✓ தொழில் தகுதி பெறுகிறது (${occupation || 'தகுதியான தொழில்'})`;
      case 'land':
        return `✓ நில உரிமை தகுதி பெறுகிறது (${acres ?? 2} ஏக்கர் நிலம்)`;
      case 'income':
        return `✓ வருமான வரம்பு தகுதி பெறுகிறது (வருமானம் ₹${(income ?? 150000).toLocaleString('en-IN')} வரம்பிற்குள் உள்ளது)`;
      case 'gender':
        return '✓ மகளிர் நலத்திட்ட தகுதி பூர்த்தியானது';
      case 'student':
        return '✓ கல்வி பயிலும் மாணவர் தகுதி பூர்த்தியானது';
      default:
        return '✓ திட்டத்தின் பொதுவான தகுதி வரம்புகள் பூர்த்தியாகின';
    }
  }

  if (lang === 'te') {
    switch (reasonType) {
      case 'age':
        return `✓ వయోపరిమితి అర్హత సంతృప్తి చెందింది (${age} సంవత్సరాల వయస్సు)`;
      case 'occupation':
        return `✓ వృత్తి అర్హత సంతృప్తి చెందింది (${occupation || 'అర్హత గల వృత్తి'})`;
      case 'land':
        return `✓ భూమి యాజమాన్యం సంతృప్తి చెందింది (${acres ?? 2} ఎకరాల వ్యవసాయ భూమి)`;
      case 'income':
        return `✓ ఆదాయ పరిమితి సంతృప్తి చెందింది (వార్షిక ఆదాయం ₹${(income ?? 150000).toLocaleString('en-IN')})`;
      case 'gender':
        return '✓ మహిళా సంక్షేమ పథక అర్హత పూర్తయింది';
      case 'student':
        return '✓ విద్యార్థిగా నమోదైన అర్హత సంతృప్తి చెందింది';
      default:
        return '✓ ప్రాథమిక అర్హత ప్రమాణాలు పూర్తయ్యాయి';
    }
  }

  if (lang === 'mr') {
    switch (reasonType) {
      case 'age':
        return `✓ वयाची अट पूर्ण झाली (वय ${age} वर्षे पात्र मर्यादेत आहे)`;
      case 'occupation':
        return `✓ व्यवसायाची अट पूर्ण झाली (${occupation || 'पात्र व्यवसाय'})`;
      case 'land':
        return `✓ जमीन मालकी अट पूर्ण झाली (${acres ?? 2} एकर शेतजमीन)`;
      case 'income':
        return `✓ उत्पन्नाची अट पूर्ण झाली (वार्षिक उत्पन्न ₹${(income ?? 150000).toLocaleString('en-IN')} मर्यादेत आहे)`;
      case 'gender':
        return '✓ महिला सक्षमीकरण निकष पूर्ण झाला';
      default:
        return '✓ योजनेचे सर्व सामान्य निकष पूर्ण झाले';
    }
  }

  if (lang === 'bn') {
    switch (reasonType) {
      case 'age':
        return `✓ বয়সের শর্ত পূরণ হয়েছে (বয়স ${age} বছর উপযুক্ত সীমার মধ্যে)`;
      case 'occupation':
        return `✓ পেশার শর্ত পূরণ হয়েছে (${occupation || 'যোগ্য পেশা'})`;
      case 'land':
        return `✓ জমির মালিকানার শর্ত পূরণ হয়েছে (${acres ?? 2} একর জমি)`;
      case 'income':
        return `✓ পারিবারিক আয়ের শর্ত পূরণ হয়েছে (আয় ₹${(income ?? 150000).toLocaleString('en-IN')} সীমার মধ্যে)`;
      case 'gender':
        return '✓ নারী ক্ষমতায়ন শর্ত পূরণ হয়েছে';
      default:
        return '✓ প্রকল্পের সকল সাধারণ শর্ত পূরণ হয়েছে';
    }
  }

  // English fallback
  switch (reasonType) {
    case 'age':
      return `✓ Age requirement satisfied (Age ${age} is within eligible bracket)`;
    case 'occupation':
      return `✓ Occupation requirement satisfied (${occupation || 'Eligible occupation'})`;
    case 'land':
      return `✓ Land ownership requirement satisfied (${acres ?? 2} acres cultivable land)`;
    case 'income':
      return `✓ Income requirement satisfied (Annual income ₹${(income ?? 150000).toLocaleString('en-IN')} is within ceiling)`;
    case 'state':
      return `✓ State requirement satisfied (Resident of ${state || 'Karnataka'})`;
    case 'gender':
      return '✓ Gender requirement satisfied (Women empowerment initiative)';
    case 'ration':
      return `✓ Economic / Ration card requirement satisfied (${extra || 'BPL / Low income'})`;
    case 'caste':
      return `✓ Social category requirement satisfied (${extra || 'Eligible category'})`;
    case 'student':
      return '✓ Regular enrolled student requirement satisfied';
    default:
      return '✓ All standard scheme criteria satisfied';
  }
}

// Helper to get translated ineligibility reasons
export function getTranslatedIneligibilityReason(
  reasonKey: 'occupation' | 'land' | 'age' | 'income' | 'state' | 'gender' | 'general',
  lang: Language
): string {
  if (lang === 'kn') {
    switch (reasonKey) {
      case 'occupation':
        return 'ಈ ಯೋಜನೆಗೆ ನಿಗದಿತ ಕಸುಬು ಅಥವಾ ವೃತ್ತಿ ಹೊಂದಿರಬೇಕು';
      case 'land':
        return 'ಕೃಷಿ ಭೂಮಿಯ ಮಾಲೀಕತ್ವದ ದಾಖಲೆ ಅಗತ್ಯವಿದೆ';
      case 'age':
        return 'ಅರ್ಜಿದಾರರ ವಯಸ್ಸು ನಿಗದಿತ ಅರ್ಹತಾ ಮಿತಿಯಲ್ಲಿರಬೇಕು';
      case 'income':
        return 'ವಾರ್ಷಿಕ ಆದಾಯವು ಗರಿಷ್ಠ ಆದಾಯ ಮಿತಿಯನ್ನು ಮೀರಿದೆ';
      case 'state':
        return 'ಈ ಸೌಲಭ್ಯವು ನಿಗದಿತ ರಾಜ್ಯದ ನಿವಾಸಿಗಳಿಗೆ ಮಾತ್ರ ಅನ್ವಯಿಸುತ್ತದೆ';
      case 'gender':
        return 'ಈ ಯೋಜನೆಯು ಮಹಿಳಾ ಸದಸ್ಯರಿಗೆ ಮಾತ್ರ ಮೀಸಲಾಗಿದೆ';
      default:
        return 'ಅರ್ಹತಾ ಮಾನದಂಡಗಳು ಪೂರೈಕೆಯಾಗಿಲ್ಲ';
    }
  }
  if (lang === 'hi') {
    switch (reasonKey) {
      case 'occupation':
        return 'इस योजना के लिए आवश्यक व्यवसाय होना अनिवार्य है';
      case 'land':
        return 'कृषि भूमि का स्वामित्व रिकॉर्ड आवश्यक है';
      case 'age':
        return 'आवेदक की आयु निर्धारित पात्रता सीमा में होनी चाहिए';
      case 'income':
        return 'वार्षिक आय योजना की निर्धारित सीमा से अधिक है';
      case 'state':
        return 'यह योजना संबंधित राज्य के निवासियों के लिए ही उपलब्ध है';
      case 'gender':
        return 'यह योजना विशेष रूप से महिला स्वयं सहायता समूह हेतु है';
      default:
        return 'पात्रता मानदंड पूरे नहीं हुए हैं';
    }
  }
  if (lang === 'ta') {
    switch (reasonKey) {
      case 'occupation':
        return 'இத்திட்டத்திற்குரிய குறிப்பிட்ட தொழில் தேவைப்படுகிறது';
      case 'land':
        return 'விவசாய நில உரிமை ஆவணம் தேவைப்படுகிறது';
      case 'age':
        return 'விண்ணப்பதாரரின் வயது தகுதி வரம்பிற்குள் இருக்க வேண்டும்';
      case 'income':
        return 'ஆண்டு வருமானம் நிர்ணயிக்கப்பட்ட வரம்பை விட அதிகமாக உள்ளது';
      case 'gender':
        return 'இத்திட்டம் பெண்களுக்கு மட்டுமே உரித்தானது';
      default:
        return 'தகுதி வரம்புகள் பூர்த்தியாகவில்லை';
    }
  }
  if (lang === 'te') {
    switch (reasonKey) {
      case 'occupation':
        return 'ఈ పథకానికి నిర్దిష్ట వృత్తి అవసరం';
      case 'land':
        return 'వ్యవసాయ భూమి యాజమాన్య రికార్డు అవసరం';
      case 'age':
        return 'వయస్సు నిర్దేశిత పరిమితిలో ఉండాలి';
      case 'income':
        return 'వార్షિક ఆదాయం అనుమతించిన పరిమితిని మించింది';
      case 'gender':
        return 'ఈ పథకం మహిళలకు మాత్రమే ప్రత్యేకించబడింది';
      default:
        return 'అర్హత ప్రమాణాలు సంతృప్తి చెందలేదు';
    }
  }
  if (lang === 'bn') {
    switch (reasonKey) {
      case 'occupation':
        return 'এই প্রকল্পের জন্য নির্দিষ্ট পেশা থাকা আবশ্যক';
      case 'land':
        return 'কৃষি জমির মালিকানার রেকর্ড প্রয়োজন';
      case 'age':
        return 'বয়স নির্ধারিত সীমার মধ্যে হতে হবে';
      case 'income':
        return 'বার্ষিক আয় প্রকল্পের সর্বোচ্চ সীমা অতিক্রম করেছে';
      case 'gender':
        return 'এই প্রকল্পটি শুধুমাত্র মহিলাদের জন্য সংরক্ষিত';
      default:
        return 'যোগ্যতার শর্ত পূরণ হয়নি';
    }
  }
  switch (reasonKey) {
    case 'occupation':
      return 'Requires qualifying occupation category';
    case 'land':
      return 'Requires ownership of cultivable agricultural land';
    case 'age':
      return 'Age must be within scheme eligibility limit';
    case 'income':
      return 'Annual income exceeds maximum eligibility ceiling';
    case 'state':
      return 'Scheme is restricted to residents of specific state';
    case 'gender':
      return 'Scheme is exclusively for women applicants';
    default:
      return 'Criteria requirements not satisfied';
  }
}
