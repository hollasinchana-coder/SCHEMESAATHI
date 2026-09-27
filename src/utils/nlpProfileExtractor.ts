import { CitizenProfile, Language } from '../types';

export interface ExtractedSummaryItem {
  key: string;
  label: string;
  value: string;
}

export interface ExtractedProfileResult {
  updatedProfile: Partial<CitizenProfile>;
  items: ExtractedSummaryItem[];
  rawText: string;
}

export function extractProfileFromText(
  text: string,
  currentProfile: CitizenProfile,
  lang: Language = 'en'
): ExtractedProfileResult {
  const lower = text.toLowerCase();
  const updated: Partial<CitizenProfile> = {};
  const items: ExtractedSummaryItem[] = [];

  // 1. Occupation Detection
  if (
    lower.includes('farmer') ||
    lower.includes('agriculture') ||
    lower.includes('crop') ||
    lower.includes('drip') ||
    lower.includes('kisan') ||
    lower.includes('ರೈತ') ||
    lower.includes('ಕೃಷಿ') ||
    lower.includes('ಬೆಳೆ') ||
    lower.includes('किसान') ||
    lower.includes('खेती') ||
    lower.includes('फसल')
  ) {
    updated.occupation = 'Small / Marginal Farmer';
    items.push({
      key: 'occupation',
      label: lang === 'kn' ? 'ಕಸುಬು' : lang === 'hi' ? 'व्यवसाय' : 'Occupation',
      value: lang === 'kn' ? 'ಸಣ್ಣ / ಅತಿ ಸಣ್ಣ ರೈತರು' : lang === 'hi' ? 'छोटे / सीमांत किसान' : 'Small / Marginal Farmer',
    });
  } else if (
    lower.includes('student') ||
    lower.includes('scholarship') ||
    lower.includes('college') ||
    lower.includes('study') ||
    lower.includes('fellowship') ||
    lower.includes('ವಿದ್ಯಾರ್ಥಿ') ||
    lower.includes('ಕಾಲೇಜು') ||
    lower.includes('ವಿದ್ಯಾರ್ಥಿವೇತನ') ||
    lower.includes('छात्र') ||
    lower.includes('छात्रवृत्ति') ||
    lower.includes('पढ़ाई')
  ) {
    updated.occupation = 'Student / Researcher';
    items.push({
      key: 'occupation',
      label: lang === 'kn' ? 'ಕಸುಬು' : lang === 'hi' ? 'व्यवसाय' : 'Occupation',
      value: lang === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ / ಸಂಶೋಧಕ' : lang === 'hi' ? 'छात्र / शोधकर्ता' : 'Student / Researcher',
    });
  } else if (
    lower.includes('daily wage') ||
    lower.includes('labor') ||
    lower.includes('labour') ||
    lower.includes('worker') ||
    lower.includes('shramik') ||
    lower.includes('construction') ||
    lower.includes('ಕಾರ್ಮಿಕ') ||
    lower.includes('ದಿನಗೂಲಿ') ||
    lower.includes('ಕೂಲಿ') ||
    lower.includes('मजदूर') ||
    lower.includes('श्रमिक') ||
    lower.includes('दिहाड़ी')
  ) {
    updated.occupation = 'Daily Wage Worker';
    items.push({
      key: 'occupation',
      label: lang === 'kn' ? 'ಕಸುಬು' : lang === 'hi' ? 'व्यवसाय' : 'Occupation',
      value: lang === 'kn' ? 'ದಿನಗೂಲಿ ಕಾರ್ಮಿಕ' : lang === 'hi' ? 'दिहाड़ी मजदूर' : 'Daily Wage Worker',
    });
  } else if (
    lower.includes('artisan') ||
    lower.includes('enterprise') ||
    lower.includes('business') ||
    lower.includes('shop') ||
    lower.includes('mudra') ||
    lower.includes('msme') ||
    lower.includes('ಉದ್ಯಮಿ') ||
    lower.includes('ವ್ಯಾಪಾರ') ||
    lower.includes('ಅಂಗಡಿ') ||
    lower.includes('उद्यमी') ||
    lower.includes('व्यापारी') ||
    lower.includes('दुकान') ||
    lower.includes('कारीगर')
  ) {
    updated.occupation = 'Micro Enterprise / Artisan';
    items.push({
      key: 'occupation',
      label: lang === 'kn' ? 'ಕಸುಬು' : lang === 'hi' ? 'व्यवसाय' : 'Occupation',
      value: lang === 'kn' ? 'ಕಿರು ಉದ್ಯಮ / ಕುಶಲಕರ್ಮಿ' : lang === 'hi' ? 'सूक्ष्म उद्यम / कारीगर' : 'Micro Enterprise / Artisan',
    });
  }

  // 2. District Detection
  let detectedDistrict = '';
  if (lower.includes('haveri') || lower.includes('ಹಾವೇರಿ') || lower.includes('हावेरी')) {
    detectedDistrict = 'Haveri';
    updated.district = 'Haveri';
    updated.state = 'Karnataka';
  } else if (lower.includes('dharwad') || lower.includes('ಧಾರವಾಡ') || lower.includes('धारवाड़')) {
    detectedDistrict = 'Dharwad';
    updated.district = 'Dharwad';
    updated.state = 'Karnataka';
  } else if (lower.includes('belagavi') || lower.includes('belgaum') || lower.includes('ಬೆಳಗಾವಿ') || lower.includes('बेलगावी')) {
    detectedDistrict = 'Belagavi';
    updated.district = 'Belagavi';
    updated.state = 'Karnataka';
  } else if (lower.includes('mysuru') || lower.includes('mysore') || lower.includes('ಮೈಸೂರು') || lower.includes('मैसूर')) {
    detectedDistrict = 'Mysuru';
    updated.district = 'Mysuru';
    updated.state = 'Karnataka';
  } else if (lower.includes('pune') || lower.includes('ಪುಣೆ') || lower.includes('पुणे')) {
    detectedDistrict = 'Pune';
    updated.district = 'Pune';
    updated.state = 'Maharashtra';
  } else if (lower.includes('bengaluru') || lower.includes('bangalore') || lower.includes('ಬೆಂಗಳೂರು') || lower.includes('बेंगलुरु')) {
    detectedDistrict = 'Bengaluru Rural';
    updated.district = 'Bengaluru Rural';
    updated.state = 'Karnataka';
  }

  // 3. State Detection
  if (lower.includes('karnataka') || lower.includes('ಕರ್ನಾಟಕ') || lower.includes('कर्नाटक')) {
    updated.state = 'Karnataka';
  } else if (lower.includes('maharashtra') || lower.includes('ಮಹಾರಾಷ್ಟ್ರ') || lower.includes('महाराष्ट्र')) {
    updated.state = 'Maharashtra';
  } else if (lower.includes('uttar pradesh') || lower.includes('ಉತ್ತರ ಪ್ರದೇಶ') || lower.includes('उत्तर प्रदेश')) {
    updated.state = 'Uttar Pradesh';
  } else if (lower.includes('tamil nadu') || lower.includes('ತಮಿಳುನಾಡು') || lower.includes('तमिलनाडु')) {
    updated.state = 'Tamil Nadu';
  } else if (lower.includes('telangana') || lower.includes('ತೆಲಂಗಾಣ') || lower.includes('तेलंगाना')) {
    updated.state = 'Telangana';
  }

  if (updated.district || updated.state) {
    const locDistrict = updated.district || currentProfile.district;
    const locState = updated.state || currentProfile.state;
    items.push({
      key: 'location',
      label: lang === 'kn' ? 'ಸ್ಥಳ' : lang === 'hi' ? 'स्थान' : 'Location',
      value: `${locDistrict}, ${locState}`,
    });
  }

  // 4. Land Ownership & Acreage Detection
  const acreMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:acres?|acre|ಎಕರೆ|एकड़)/i);
  if (acreMatch) {
    const acres = parseFloat(acreMatch[1]);
    updated.landHoldingAcres = acres;
    items.push({
      key: 'land',
      label: lang === 'kn' ? 'ಕೃಷಿ ಭೂಮಿ' : lang === 'hi' ? 'कृषि भूमि' : 'Agricultural Land',
      value: lang === 'kn' ? `ಹೌದು, ${acres} ಎಕರೆ` : lang === 'hi' ? `हाँ, ${acres} एकड़` : `Yes, ${acres} acres`,
    });
  } else if (
    lower.includes('no land') ||
    lower.includes('landless') ||
    lower.includes('ಜಮೀನಿಲ್ಲ') ||
    lower.includes('ಭೂಮಿ ಇಲ್ಲ') ||
    lower.includes('भूमिहीन') ||
    lower.includes('जमीन नहीं')
  ) {
    updated.landHoldingAcres = 0;
    items.push({
      key: 'land',
      label: lang === 'kn' ? 'ಕೃಷಿ ಭೂಮಿ' : lang === 'hi' ? 'कृषि भूमि' : 'Agricultural Land',
      value: lang === 'kn' ? 'ಇಲ್ಲ (ಜಮೀನಿಲ್ಲ)' : lang === 'hi' ? 'नहीं (भूमिहीन)' : 'No Land',
    });
  } else if (updated.occupation === 'Small / Marginal Farmer' && currentProfile.landHoldingAcres) {
    // Keep existing land or default 2 acres
    updated.landHoldingAcres = currentProfile.landHoldingAcres || 2.0;
    items.push({
      key: 'land',
      label: lang === 'kn' ? 'ಕೃಷಿ ಭೂಮಿ' : lang === 'hi' ? 'कृषि भूमि' : 'Agricultural Land',
      value: lang === 'kn' ? `ಹೌದು, ${updated.landHoldingAcres} ಎಕರೆ` : lang === 'hi' ? `हाँ, ${updated.landHoldingAcres} एकड़` : `Yes, ${updated.landHoldingAcres} acres`,
    });
  }

  // 5. Income Detection
  // Matches "2 lakh", "2.5 lakh", "150000", "200000", "₹2 lakh", "2 ಲಕ್ಷ", "2 लाख"
  const lakhMatch = lower.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lacs?|lac|ಲಕ್ಷ|लाख)/i);
  const directIncomeMatch = lower.match(/(?:₹|rs\.?|inr)\s*(\d{5,7})/i) || lower.match(/\b(\d{5,7})\b/);

  if (lakhMatch) {
    const lval = parseFloat(lakhMatch[1]);
    const inc = Math.round(lval * 100000);
    updated.annualIncome = inc;
    items.push({
      key: 'income',
      label: lang === 'kn' ? 'ವಾರ್ಷಿಕ ಆದಾಯ' : lang === 'hi' ? 'वार्षिक आय' : 'Annual Income',
      value: `₹${inc.toLocaleString('en-IN')}`,
    });
  } else if (directIncomeMatch) {
    const inc = parseInt(directIncomeMatch[1], 10);
    if (inc >= 10000 && inc <= 2500000) {
      updated.annualIncome = inc;
      items.push({
        key: 'income',
        label: lang === 'kn' ? 'ವಾರ್ಷಿಕ ಆದಾಯ' : lang === 'hi' ? 'वार्षिक आय' : 'Annual Income',
        value: `₹${inc.toLocaleString('en-IN')}`,
      });
    }
  }

  // 6. Age Detection
  const ageMatch = lower.match(/(\d{1,2})\s*(?:years?\s*old|years?|ವರ್ಷ|साल|आयु|ವಯಸ್ಸು)/i) || lower.match(/(?:age|ವಯಸ್ಸು|आयु)\s*(?:is|:)?\s*(\d{1,2})/i);
  if (ageMatch) {
    const parsedAge = parseInt(ageMatch[1], 10);
    if (parsedAge >= 10 && parsedAge <= 100) {
      updated.age = parsedAge;
      items.push({
        key: 'age',
        label: lang === 'kn' ? 'ವಯಸ್ಸು' : lang === 'hi' ? 'आयु' : 'Age',
        value: `${parsedAge} ${lang === 'kn' ? 'ವರ್ಷ' : lang === 'hi' ? 'वर्ष' : 'years'}`,
      });
    }
  }

  // 7. Gender Detection
  if (
    lower.includes('female') ||
    lower.includes('woman') ||
    lower.includes('girl') ||
    lower.includes('shg') ||
    lower.includes('ಮಹಿಳೆ') ||
    lower.includes('ಹೆಣ್ಣು') ||
    lower.includes('महिला') ||
    lower.includes('औरत')
  ) {
    updated.gender = 'Female';
    items.push({
      key: 'gender',
      label: lang === 'kn' ? 'ಲಿಂಗ' : lang === 'hi' ? 'लिंग' : 'Gender',
      value: lang === 'kn' ? 'ಮಹಿಳೆ' : lang === 'hi' ? 'महिला' : 'Female',
    });
  } else if (
    lower.includes('male') ||
    lower.includes('man') ||
    lower.includes('boy') ||
    lower.includes('ಪುರುಷ') ||
    lower.includes('पुरुष')
  ) {
    updated.gender = 'Male';
  }

  // Fallback: If no specific items detected, show what we found or keep defaults
  if (items.length === 0) {
    items.push({
      key: 'general',
      label: lang === 'kn' ? 'ಸ್ಥಿತಿ' : lang === 'hi' ? 'स्थिति' : 'Status',
      value: lang === 'kn' ? 'ಸಾಮಾನ್ಯ ವಿಚಾರಣೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ' : lang === 'hi' ? 'सामान्य अनुरोध प्राप्त हुआ' : 'General inquiry received',
    });
  }

  return {
    updatedProfile: updated,
    items,
    rawText: text,
  };
}
