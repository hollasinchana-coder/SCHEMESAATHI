import { CitizenProfile, Scheme, Language } from '../types';
import { getTranslatedReason } from '../i18n/translations';

export interface EvaluatedScheme {
  scheme: Scheme;
  isEligible: boolean;
  reasons: string[];
  ineligibilityReasons: string[];
  benefitSummary: string;
}

export interface EligibilityResult {
  eligibleSchemes: EvaluatedScheme[];
  ineligibleSchemes: EvaluatedScheme[];
  totalEvaluated: number;
  evaluatedAt: string;
}

export function evaluateEligibility(
  profile: CitizenProfile,
  allSchemes: Scheme[],
  lang: Language = 'en'
): EligibilityResult {
  const eligibleSchemes: EvaluatedScheme[] = [];
  const ineligibleSchemes: EvaluatedScheme[] = [];

  const age = Number(profile.age) || 0;
  const income = Number(profile.annualIncome) || 0;
  const occ = (profile.occupation || '').trim();
  const state = (profile.state || '').trim();
  const gender = profile.gender || 'Male';
  const hasLand = (profile.landHoldingAcres ?? 0) > 0;
  const landAcres = profile.landHoldingAcres ?? 0;

  const occLower = occ.toLowerCase();
  const isFarmer = occLower.includes('farmer') || occLower.includes('agri') || occ === 'Small / Marginal Farmer';
  const isStudent = occLower.includes('student') || occLower.includes('researcher') || Boolean(profile.isStudentEnrolled);
  const isWorker = occLower.includes('worker') || occLower.includes('wage') || occLower.includes('labour') || occLower.includes('construction');
  const isArtisan = occLower.includes('artisan') || occLower.includes('self-employed') || occLower.includes('enterprise') || occLower.includes('business') || occLower.includes('micro');
  const isWoman = gender === 'Female' || occLower.includes('woman') || occLower.includes('women') || occLower.includes('homemaker') || Boolean(profile.isShgMember);
  const isBPL = profile.rationCardStatus === 'BPL' || profile.rationCardStatus === 'Antyodaya' || income <= 180000;

  for (const scheme of allSchemes) {
    const reasons: string[] = [];
    const ineligibilityReasons: string[] = [];
    let isEligible = true;
    let benefitSummary = scheme.benefitAmount;

    switch (scheme.id) {
      case 'pm-kisan': {
        // PM-KISAN: Small & marginal farmer with cultivable land, age 18-85, income <= 8,00,000
        if (lang === 'kn') {
          benefitSummary = 'ವಾರ್ಷಿಕ ₹೬,೦೦೦ ಆರ್ಥಿಕ ನೆರವು (ಡಿಬಿಟಿ ಮೂಲಕ ತಲಾ ₹೨,೦೦೦ ರ ೩ ಕಂತುಗಳು)';
        } else if (lang === 'hi') {
          benefitSummary = '₹6,000 वार्षिक वित्तीय सहायता (डीबीटी के माध्यम से ₹2,000 की 3 किस्तें)';
        } else {
          benefitSummary = '₹6,000 annual financial support (3 installments of ₹2,000 via DBT)';
        }
        
        if (isFarmer || hasLand) {
          reasons.push(getTranslatedReason('occupation', lang, { occupation: occ || 'Farmer' }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Requires occupation to be Farmer / Agriculture');
        }

        if (hasLand) {
          reasons.push(getTranslatedReason('land', lang, { acres: landAcres }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Requires ownership of cultivable agricultural land');
        }

        if (age >= 18 && age <= 85) {
          reasons.push(getTranslatedReason('age', lang, { age }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Applicant must be between 18 and 85 years of age');
        }

        if (income <= 800000) {
          reasons.push(getTranslatedReason('income', lang, { income }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Annual income exceeds the ₹8,00,000 ceiling');
        }
        break;
      }

      case 'krishi-sinchayee': {
        // Krishi Sinchayee (Drip irrigation): Farmer in Karnataka, land >= 0.5 acres, income <= 5,00,000, age >= 18
        if (lang === 'kn') {
          benefitSummary = 'ಹನಿ ಮತ್ತು ತುಂತುರು ನೀರಾವರಿ ಉಪಕರಣಗಳಿಗೆ ೯೦% ವರೆಗೆ ಬಂಡವಾಳ ಸಬ್ಸಿಡಿ';
        } else if (lang === 'hi') {
          benefitSummary = 'ड्रिप एवं स्प्रिंकलर सिंचाई पर 90% तक पूंजीगत सब्सिडी';
        } else {
          benefitSummary = 'Up to 90% Capital Subsidy on Drip & Sprinkler Micro-Irrigation';
        }

        if (isFarmer || hasLand) {
          reasons.push(getTranslatedReason('occupation', lang, { occupation: occ || 'Farmer' }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Requires occupation to be Farmer / Agriculture');
        }

        if (hasLand && landAcres >= 0.5) {
          reasons.push(getTranslatedReason('land', lang, { acres: landAcres }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Requires minimum 0.5 acre cultivable agricultural land');
        }

        if (state === 'Karnataka' || state === '') {
          reasons.push(getTranslatedReason('state', lang, { state: 'Karnataka' }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('This specific 90% subsidy is available for Karnataka residents');
        }

        if (age >= 18) {
          reasons.push(getTranslatedReason('age', lang, { age }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Must be at least 18 years of age');
        }

        if (income <= 500000) {
          reasons.push(getTranslatedReason('income', lang, { income }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Annual income exceeds ₹5,00,000 limit');
        }
        break;
      }

      case 'kcc-loan':
      case 'kcc': {
        // Kisan Credit Card
        if (lang === 'kn') {
          benefitSummary = '೪% ಬಡ್ಡಿದರದಲ್ಲಿ ₹೩,೦೦,೦೦೦ ವರೆಗೆ ಸಾಂಸ್ಥಿಕ ಕೃಷಿ ಸಾಲ ಸೌಲಭ್ಯ';
        } else if (lang === 'hi') {
          benefitSummary = '4% प्रभावी ब्याज दर पर ₹3,00,000 तक का रियायती कृषि ऋण';
        } else {
          benefitSummary = 'Low-interest institutional agricultural credit up to ₹3,00,000 at 4% effective interest';
        }

        if (isFarmer || hasLand) {
          reasons.push(getTranslatedReason('occupation', lang, { occupation: occ || 'Farmer' }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Requires occupation to be Farmer / Cultivator');
        }

        if (hasLand) {
          reasons.push(getTranslatedReason('land', lang, { acres: landAcres }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Requires cultivable land records');
        }

        if (age >= 18 && age <= 75) {
          reasons.push(getTranslatedReason('age', lang, { age }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Applicant must be between 18 and 75 years old');
        }
        break;
      }

      case 'ssp-scholarship': {
        // Karnataka SSP: Student in Karnataka, income <= 2,50,000, age 15-35
        if (lang === 'kn') {
          benefitSummary = 'ವಾರ್ಷಿಕ ₹೧೨,೦೦೦ – ₹೨೫,೦೦೦ ಬೋಧನಾ ಶುಲ್ಕ ಮರುಪಾವತಿ ಮತ್ತು ನಿರ್ವಹಣಾ ಭತ್ಯೆ';
        } else if (lang === 'hi') {
          benefitSummary = '₹12,000 – ₹25,000 / वर्ष ट्यूशन फीस प्रतिपूर्ति एवं निर्वाह भत्ता';
        } else {
          benefitSummary = '₹12,000 – ₹25,000 / year Tuition Fee Reimbursement + Maintenance Allowance';
        }

        if (isStudent) {
          reasons.push(getTranslatedReason('occupation', lang, { occupation: occ || 'Student' }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Requires applicant to be an enrolled Student');
        }

        if (state === 'Karnataka' || state === '') {
          reasons.push(getTranslatedReason('state', lang, { state: 'Karnataka' }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('SSP Scholarship is for Karnataka domicile students only');
        }

        if (income <= 250000) {
          reasons.push(getTranslatedReason('income', lang, { income }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Family annual income exceeds the ₹2,50,000 threshold');
        }

        if (age >= 15 && age <= 35) {
          reasons.push(getTranslatedReason('age', lang, { age }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Age must be between 15 and 35 years');
        }
        break;
      }

      case 'nmms-scholarship': {
        // National Merit Scholarship: Student anywhere in India, income <= 3,50,000, age 13-25
        if (lang === 'kn') {
          benefitSummary = 'ಡಿಬಿಟಿ ಮೂಲಕ ನೇರವಾಗಿ ವಿದ್ಯಾರ್ಥಿ ಖಾತೆಗೆ ವಾರ್ಷಿಕ ₹೧೨,೦೦೦ ವಿದ್ಯಾರ್ಥಿವೇತನ';
        } else if (lang === 'hi') {
          benefitSummary = 'डीबीटी के माध्यम से सीधे खाते में ₹12,000 वार्षिक छात्रवृत्ति सहायता';
        } else {
          benefitSummary = '₹12,000 annual scholarship assistance';
        }

        if (isStudent) {
          reasons.push(getTranslatedReason('occupation', lang, { occupation: occ || 'Student' }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Applicant must be an enrolled Student');
        }

        if (income <= 350000) {
          reasons.push(getTranslatedReason('income', lang, { income }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Family annual income exceeds ₹3,50,000');
        }

        if (age >= 13 && age <= 25) {
          reasons.push(getTranslatedReason('age', lang, { age }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Age must be between 13 and 25 years');
        }
        break;
      }

      case 'eshram-welfare': {
        // e-Shram: Daily wage worker, age 16-59, income <= 3,00,000
        if (lang === 'kn') {
          benefitSummary = '₹೨,೦೦,೦೦೦ ಅಪಘಾತ ಮರಣ ವಿಮಾ ರಕ್ಷಣೆ ಮತ್ತು ಕಲ್ಯಾಣ ಸೌಲಭ್ಯಗಳು';
        } else if (lang === 'hi') {
          benefitSummary = '₹2,00,000 दुर्घटना मृत्यु बीमा सुरक्षा एवं कल्याणकारी लाभ';
        } else {
          benefitSummary = '₹2,00,000 Accidental Death Cover + Social Security Welfare Entitlements';
        }

        if (isWorker || occLower.includes('unemployed')) {
          reasons.push(getTranslatedReason('occupation', lang, { occupation: occ || 'Worker' }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Requires occupation to be Daily Wage / Construction Worker');
        }

        if (age >= 16 && age <= 59) {
          reasons.push(getTranslatedReason('age', lang, { age }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Applicant must be between 16 and 59 years of age');
        }

        if (income <= 300000) {
          reasons.push(getTranslatedReason('income', lang, { income }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Annual income exceeds unorganized worker threshold of ₹3,00,000');
        }
        break;
      }

      case 'lakhpati-didi': {
        // Lakhpati Didi: Female or Homemaker, age 18-60, income <= 3,00,000
        if (lang === 'kn') {
          benefitSummary = '೪% ಬಡ್ಡಿದರದಲ್ಲಿ ₹೧,೦೦,೦೦೦ ದಿಂದ ₹೫,೦೦,೦೦೦ ವರೆಗೆ ರಿಯಾಯಿತಿ ಸಾಲ';
        } else if (lang === 'hi') {
          benefitSummary = '4% ब्याज पर ₹1,00,000 से ₹5,00,000 तक का रियायती उद्यम ऋण';
        } else {
          benefitSummary = '₹1,00,000 – ₹5,00,000 Subsidized Enterprise Loan at 4% Interest';
        }

        if (isWoman) {
          reasons.push(getTranslatedReason('gender', lang));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Scheme is exclusively for women self-help group members');
        }

        if (age >= 18 && age <= 60) {
          reasons.push(getTranslatedReason('age', lang, { age }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Age must be between 18 and 60 years');
        }

        if (income <= 300000) {
          reasons.push(getTranslatedReason('income', lang, { income }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Annual family income must not exceed ₹3,00,000');
        }
        break;
      }

      case 'pm-awas-gramin': {
        // PM Awas Gramin: Low income (<= 1,80,000 or BPL/Antyodaya), age >= 18
        if (lang === 'kn') {
          benefitSummary = '₹೧,೨೦,೦೦೦ – ₹೧,೩೦,೦೦೦ ನೇರ ವಸತಿ ಅನುದಾನ + ೯೦ ದಿನಗಳ ಉದ್ಯೋಗ ಖಾತರಿ ಕೂಲಿ';
        } else if (lang === 'hi') {
          benefitSummary = '₹1,20,000 – ₹1,30,000 सीधा आवास निर्माण अनुदान + 90 दिनों की मनरेगा मजदूरी';
        } else {
          benefitSummary = '₹1,20,000 – ₹1,30,000 Direct Housing Grant + 90 Days MGNREGA Wages';
        }

        if (isBPL || income <= 180000) {
          reasons.push(getTranslatedReason('income', lang, { income }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Annual income must be within ₹1,80,000 (Low Income / BPL benchmark)');
        }

        if (age >= 18) {
          reasons.push(getTranslatedReason('age', lang, { age }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Applicant must be an adult (18+ years)');
        }
        break;
      }

      case 'pm-mudra-yojana': {
        // Mudra: Self-employed / Micro Enterprise / Artisan, age 18-65
        if (lang === 'kn') {
          benefitSummary = 'ಯಾವುದೇ ಆಸ್ತಿ ಅಡಮಾನವಿಲ್ಲದೆ ₹೧೦,೦೦,೦೦೦ ವರೆಗೆ ವ್ಯಾಪಾರ ಸಾಲ ಸೌಲಭ್ಯ';
        } else if (lang === 'hi') {
          benefitSummary = 'बिना किसी गारंटी के ₹10,00,000 तक का व्यावसायिक ऋण (शिशु, किशोर, तरुण)';
        } else {
          benefitSummary = 'Up to ₹10,00,000 Collateral-Free Business Credit';
        }

        if (isArtisan || occLower.includes('artisan') || occLower.includes('self-employed')) {
          reasons.push(getTranslatedReason('occupation', lang, { occupation: occ || 'Self-employed / Artisan' }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Requires occupation to be Self-employed / Artisan');
        }

        if (age >= 18 && age <= 65) {
          reasons.push(getTranslatedReason('age', lang, { age }));
        } else {
          isEligible = false;
          ineligibilityReasons.push('Applicant must be between 18 and 65 years old');
        }
        break;
      }

      default: {
        if (scheme.category === 'farmer') {
          if (occ === 'Small / Marginal Farmer' && hasLand && age >= 18 && income <= 600000) {
            reasons.push(getTranslatedReason('occupation', lang, { occupation: occ }));
            reasons.push(getTranslatedReason('age', lang, { age }));
          } else {
            isEligible = false;
            ineligibilityReasons.push('Does not satisfy farmer category requirements');
          }
        } else if (scheme.category === 'student') {
          if (occ === 'Student / Researcher' && age <= 35 && income <= 300000) {
            reasons.push(getTranslatedReason('occupation', lang, { occupation: occ }));
          } else {
            isEligible = false;
            ineligibilityReasons.push('Requires student status and qualifying income');
          }
        } else if (scheme.category === 'worker') {
          if (occ === 'Daily Wage Worker' && age >= 18 && age <= 60) {
            reasons.push(getTranslatedReason('occupation', lang, { occupation: occ }));
          } else {
            isEligible = false;
            ineligibilityReasons.push('Requires daily-wage worker status');
          }
        }
        break;
      }
    }

    const evaluated: EvaluatedScheme = {
      scheme,
      isEligible,
      reasons: reasons.length > 0 ? reasons : [getTranslatedReason('general', lang)],
      ineligibilityReasons,
      benefitSummary,
    };

    if (isEligible) {
      eligibleSchemes.push(evaluated);
    } else {
      ineligibleSchemes.push(evaluated);
    }
  }

  return {
    eligibleSchemes,
    ineligibleSchemes,
    totalEvaluated: allSchemes.length,
    evaluatedAt: new Date().toLocaleTimeString('en-IN'),
  };
}
