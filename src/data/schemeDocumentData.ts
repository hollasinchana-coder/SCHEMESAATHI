export interface SchemeDocumentGuide {
  id: string;
  name: string;
  nameVernacular?: string;
  documentType?: string;
  shortName?: string;
  secondaryHint?: string;
  statusLabel: 'Required' | 'Usually required' | 'Check official requirements';
  whatIsIt: string;
  whyNeeded: string;
  whereToGet: string;
  issuingAuthority: string;
  howToPrepare: string[];
  whatToKeepReady: string[];
  commonMistakes?: string[];
  officialSourceUrl: string;
  officialSourceName: string;
}

export function getDocumentType(docName: string, customType?: string): string {
  if (customType) return customType.toUpperCase();
  const lower = docName.toLowerCase();
  if (lower.includes('aadhaar')) return 'IDENTITY DOCUMENT';
  if (lower.includes('land') || lower.includes('rtc') || lower.includes('pahani') || lower.includes('khasra')) return 'LAND / REVENUE DOCUMENT';
  if (lower.includes('bank') || lower.includes('passbook')) return 'FINANCIAL DOCUMENT';
  if (lower.includes('mobile') || lower.includes('phone')) return 'COMMUNICATION / VERIFICATION';
  if (lower.includes('income')) return 'INCOME PROOF';
  if (lower.includes('caste')) return 'COMMUNITY / RESERVATION PROOF';
  if (lower.includes('student') || lower.includes('school') || lower.includes('college') || lower.includes('mark')) return 'EDUCATIONAL RECORD';
  if (lower.includes('water') || lower.includes('electricity') || lower.includes('noc')) return 'UTILITY / INFRASTRUCTURE PROOF';
  if (lower.includes('ration')) return 'HOUSEHOLD CARD';
  return 'IDENTITY DOCUMENT';
}

export function getDocumentButtonLabel(docName: string): { main: string; secondary?: string } {
  const lower = docName.toLowerCase();
  if (lower.includes('aadhaar')) return { main: 'Aadhaar Card' };
  if (lower.includes('land') || lower.includes('rtc') || lower.includes('pahani')) {
    return { main: 'Land Ownership Record', secondary: 'RTC / Pahani / 7/12 / Khasra-Khatauni' };
  }
  if (lower.includes('bank') || lower.includes('passbook')) {
    return { main: 'Bank Account / Passbook', secondary: 'Aadhaar-seeded with NPCI DBT' };
  }
  if (lower.includes('mobile') || lower.includes('phone')) return { main: 'Active Mobile Number' };
  if (lower.includes('income')) return { main: 'Income Certificate' };
  if (lower.includes('caste')) return { main: 'Caste Certificate' };
  if (lower.includes('water')) return { main: 'Water Source / Borewell NOC' };
  // Truncate or use clean name
  const clean = docName.split('(')[0].trim();
  return { main: clean };
}

export interface SchemeDetailedInfo {
  schemeId: string;
  officialName: string;
  officialNameVernacular?: string;
  description: string;
  ministry: string;
  whoProvidesService: string;
  benefitsSummary: string;
  benefitDetails: string[];
  eligibilityRequirements: string[];
  applicationProcedure: string[];
  importantConditions: string[];
  documents: SchemeDocumentGuide[];
  officialApplicationPortalUrl: string;
  officialApplicationPortalName: string;
  officialInformationSourceUrl: string;
  officialInformationSourceName: string;
  lastUpdatedDate: string;
}

export const SCHEME_DETAILED_DATA: Record<string, SchemeDetailedInfo> = {
  'pm-kisan': {
    schemeId: 'pm-kisan',
    officialName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    officialNameVernacular: 'ಪ್ರಧಾನಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ • प्रधानमंत्री किसान सम्मान निधि',
    description: 'A Central Sector welfare initiative providing assured income support to all landholding farmer families across the country to meet agricultural expenses and domestic needs.',
    ministry: 'Ministry of Agriculture & Farmers Welfare, Government of India',
    whoProvidesService: 'Department of Agriculture & Farmers Welfare in coordination with State Revenue / Agriculture Departments',
    benefitsSummary: '₹6,000 per year paid in three equal four-monthly installments of ₹2,000 directly via Direct Benefit Transfer (DBT).',
    benefitDetails: [
      '₹2,000 transferred directly into the farmer\'s bank account every 4 months (April-July, August-November, December-March).',
      'Direct Benefit Transfer (DBT) via Aadhaar-linked NPCI payment gateway with zero intermediary commission.',
      'Enables timely purchase of high-quality seeds, fertilizers, organic manure, and essential cultivation equipment.'
    ],
    eligibilityRequirements: [
      'Farmer family owning cultivable agricultural land registered in official land records.',
      'Small, marginal, and regular farmer families residing in rural or peri-urban areas.',
      'Must have a functional bank account linked with an active Aadhaar number and NPCI DBT seeding.',
      'Not excluded under statutory exclusion criteria (e.g. constitutional post holders, income tax payees, retired officers with pension >= ₹10,000/month).'
    ],
    applicationProcedure: [
      'Step 1: Open the official PM-KISAN portal (pmkisan.gov.in) and locate the "Farmers Corner" section.',
      'Step 2: Select "New Farmer Registration" and choose either Rural or Urban Farmer Registration.',
      'Step 3: Enter your 12-digit Aadhaar number, active mobile number, and select your state.',
      'Step 4: Verify the OTP sent to your Aadhaar-registered mobile number.',
      'Step 5: Fill in your State, District, Sub-District, Block, and Village details.',
      'Step 6: Enter your land record identifiers (Survey/Khata number, Khasra/Dag number, and exact land area in hectares).',
      'Step 7: Provide your bank account details (Bank Name, Branch IFSC, and Account Number).',
      'Step 8: Review and submit the self-registration form. Retain your registration reference number for tracking.'
    ],
    importantConditions: [
      'Land title must be in the farmer\'s name on or before 1st February 2019 (except in cases of succession/inheritance).',
      'Mandatory e-KYC must be completed on the PM-KISAN portal using Aadhaar OTP or biometric authentication at a CSC.',
      'Bank account must be seeded with Aadhaar and mapped with NPCI; otherwise DBT payments will fail.',
      'Landholding data is verified deterministically against state land record databases (e.g., Bhoomi in Karnataka).'
    ],
    officialApplicationPortalUrl: 'https://pmkisan.gov.in',
    officialApplicationPortalName: 'PM-KISAN Official Central Portal (pmkisan.gov.in)',
    officialInformationSourceUrl: 'https://www.myscheme.gov.in/schemes/pm-kisan',
    officialInformationSourceName: 'myScheme National Civic Portal (myscheme.gov.in)',
    lastUpdatedDate: 'September 2026',
    documents: [
      {
        id: 'pmk-aadhaar',
        name: 'Aadhaar Card',
        nameVernacular: 'ಆಧಾರ್ ಕಾರ್ಡ್ • आधार कार्ड',
        statusLabel: 'Required',
        whatIsIt: 'A 12-digit unique identity number issued by the Unique Identification Authority of India (UIDAI) containing your biometric and demographic details.',
        whyNeeded: 'PM-KISAN mandates Aadhaar-based identification to authenticate the beneficiary and deliver direct bank transfers securely without duplication.',
        whereToGet: 'Issued by the Unique Identification Authority of India (UIDAI). Can be downloaded from myaadhaar.uidai.gov.in or obtained at any Aadhaar Seva Kendra.',
        issuingAuthority: 'Unique Identification Authority of India (UIDAI)',
        howToPrepare: [
          'Visit myaadhaar.uidai.gov.in and click "Download Aadhaar" using your Aadhaar number and OTP.',
          'Verify that your full name and date of birth match your land records and bank passbook exactly.',
          'Ensure your current active mobile number is linked to your Aadhaar card for receiving OTPs.',
          'If demographic corrections are needed, visit an official Aadhaar Enrolment / Seva Kendra.'
        ],
        whatToKeepReady: ['Current Aadhaar Number or Enrolment Slip', 'Active Mobile Number for OTP', 'Proof of Identity (POI) if updating details'],
        officialSourceUrl: 'https://myaadhaar.uidai.gov.in',
        officialSourceName: 'UIDAI Official Portal (myaadhaar.uidai.gov.in)'
      },
      {
        id: 'pmk-land',
        name: 'Land Ownership Record (RTC / Pahani / 7/12 / Khasra-Khatauni)',
        nameVernacular: 'ಆರ್‌ಟಿಸಿ / ಪಹಣಿ / ಜಮೀನು ದಾಖಲೆ • खसरा / खतौनी / भू-अभिलेख',
        statusLabel: 'Required',
        whatIsIt: 'The official digital record of rights, tenancy, and crop inspection (RTC/Pahani) extracted from the state government land records database.',
        whyNeeded: 'Proves that the applicant is the legal owner or title holder of cultivable agricultural land eligible under scheme criteria.',
        whereToGet: 'Downloaded from your state\'s official land records portal (e.g. Bhoomi in Karnataka, Bhulekh in UP/Maharashtra) or issued at the Taluk Tahsildar / Village Accountant office.',
        issuingAuthority: 'State Revenue Department & Land Records Authority',
        howToPrepare: [
          'Visit your state land records portal (e.g. bhoomi.karnataka.gov.in for Karnataka).',
          'Select your District, Taluk, Hobli, Village, and enter your Land Survey Number.',
          'Fetch and download the latest signed Record of Rights, Tenancy, and Crops (RTC / Pahani).',
          'Verify that your name appears as the legal owner/cultivator and check the exact land acreage.'
        ],
        whatToKeepReady: ['District, Taluk, Hobli, Village names', 'Survey Number and Hissa Number', 'Khata / Account Number'],
        officialSourceUrl: 'https://bhoomi.karnataka.gov.in',
        officialSourceName: 'Bhoomi Karnataka Land Records Portal (bhoomi.karnataka.gov.in)'
      },
      {
        id: 'pmk-bank',
        name: 'Bank Account Passbook (Aadhaar-Seeded with NPCI DBT)',
        nameVernacular: 'ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ (ಆಧಾರ್ ಲಿಂಕ್ಡ್) • बैंक पासबुक (डीबीटी समर्थित)',
        statusLabel: 'Required',
        whatIsIt: 'A functional savings bank account passbook or cancelled cheque leaf showing your legal name, account number, and branch IFSC code.',
        whyNeeded: 'All monetary grants under PM-KISAN are transferred electronically via the Public Financial Management System (PFMS) and NPCI Aadhaar Bridge.',
        whereToGet: 'Any commercial bank, regional rural bank (RRB), district cooperative bank, or India Post Payments Bank (IPPB) where you hold an active account.',
        issuingAuthority: 'Your Scheduled Commercial Bank or Post Office',
        howToPrepare: [
          'Visit your bank branch with your original Aadhaar card and passbook.',
          'Submit the "NPCI Aadhaar Mandate & DBT Seeding Form" to enable direct government payouts.',
          'Ensure the account is fully KYC-compliant and active (not dormant or inoperative).',
          'Make a clear photocopy or digital scan of the front page displaying Account Number and IFSC.'
        ],
        whatToKeepReady: ['Original Bank Passbook', 'Aadhaar Card copy', 'Bank branch IFSC code'],
        officialSourceUrl: 'https://www.npci.org.in',
        officialSourceName: 'National Payments Corporation of India (npci.org.in)'
      },
      {
        id: 'pmk-mobile',
        name: 'Active Mobile Number',
        nameVernacular: 'ಸಕ್ರಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ • सक्रिय मोबाइल नंबर',
        statusLabel: 'Required',
        whatIsIt: 'A functional mobile phone number registered in the applicant\'s name and linked with Aadhaar.',
        whyNeeded: 'Required to receive registration verification OTPs, e-KYC authentication tokens, and installment SMS alerts.',
        whereToGet: 'Issued by licensed telecommunication service providers (Airtel, Jio, BSNL, Vi).',
        issuingAuthority: 'Telecom Service Provider',
        howToPrepare: [
          'Ensure your mobile number is active with ongoing talktime / SMS validity.',
          'Confirm that this mobile number is the one registered with your Aadhaar and bank account.'
        ],
        whatToKeepReady: ['Mobile handset with active SIM card', 'Aadhaar registration record'],
        officialSourceUrl: 'https://pmkisan.gov.in',
        officialSourceName: 'PM-KISAN Portal'
      }
    ]
  },

  'krishi-sinchayee': {
    schemeId: 'krishi-sinchayee',
    officialName: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) – Per Drop More Crop',
    officialNameVernacular: 'ಪ್ರಧಾನಮಂತ್ರಿ ಕೃಷಿ ಸಿಂಚಾಯಿ ಯೋಜನೆ (ಹನಿ ನೀರಾವರಿ) • पीएम कृषि सिंचाई योजना',
    description: 'Promotes water-use efficiency through micro-irrigation systems (drip and sprinkler) by providing capital subsidies up to 90% to small and marginal farmers.',
    ministry: 'Department of Agriculture & Farmers Welfare, Ministry of Agriculture, Govt of India',
    whoProvidesService: 'State Horticulture & Agriculture Departments (e.g., Karnataka Horticulture Dept)',
    benefitsSummary: 'Up to 90% capital subsidy on approved drip and sprinkler micro-irrigation hardware installations.',
    benefitDetails: [
      'Small and marginal farmers receive up to 90% subsidy on standard drip irrigation system installation costs.',
      'Other farmers receive up to 45% - 55% capital subsidy depending on district category and water table status.',
      'Significant reduction in irrigation electricity, labor expenditure, and fertilizer washout.'
    ],
    eligibilityRequirements: [
      'Farmer with a minimum of 0.5 acre cultivable agricultural or horticultural land.',
      'Must have an assured water source (borewell, open well, farm pond, or canal access).',
      'Resident farmer in participating states (e.g. Karnataka, Maharashtra, etc.).',
      'Should not have availed micro-irrigation capital subsidy for the same plot within the last 7 years.'
    ],
    applicationProcedure: [
      'Step 1: Contact your local Raitha Samparka Kendra (RSK) or Senior Assistant Director of Horticulture (SADH).',
      'Step 2: Submit an application through the state horticulture portal (e.g. dharani.karnataka.gov.in / pmksy.gov.in).',
      'Step 3: An agriculture officer or empanelled vendor inspects the farm and submits a GPS-tagged feasibility report.',
      'Step 4: The department approves the work order and an authorized manufacturer installs the drip hardware.',
      'Step 5: Post-installation verification is completed and the subsidy is credited to the vendor/farmer bank account.'
    ],
    importantConditions: [
      'Only micro-irrigation systems from empanelled and BIS-standard certified manufacturers are eligible for subsidy.',
      'Water source inspection (borewell / well) must confirm adequate discharge for the selected acreage.'
    ],
    officialApplicationPortalUrl: 'https://pmksy.gov.in',
    officialApplicationPortalName: 'PMKSY Central Portal (pmksy.gov.in)',
    officialInformationSourceUrl: 'https://www.myscheme.gov.in/schemes/pmksy-pdmc',
    officialInformationSourceName: 'myScheme PMKSY Guidelines (myscheme.gov.in)',
    lastUpdatedDate: 'August 2026',
    documents: [
      {
        id: 'pmksy-aadhaar',
        name: 'Aadhaar Card',
        nameVernacular: 'ಆಧಾರ್ ಕಾರ್ಡ್ • आधार कार्ड',
        statusLabel: 'Required',
        whatIsIt: 'Official photo identity document issued by UIDAI with biometric identification.',
        whyNeeded: 'Authenticates the identity of the applicant farmer and links with state land registries.',
        whereToGet: 'Unique Identification Authority of India (UIDAI) / myaadhaar.uidai.gov.in',
        issuingAuthority: 'UIDAI',
        howToPrepare: ['Keep a clean photocopy of your Aadhaar card with legible photo and address.'],
        whatToKeepReady: ['Aadhaar Number', 'Original Card'],
        officialSourceUrl: 'https://myaadhaar.uidai.gov.in',
        officialSourceName: 'UIDAI'
      },
      {
        id: 'pmksy-land',
        name: 'RTC / Pahani / Land Record',
        nameVernacular: 'ಆರ್‌ಟಿಸಿ / ಪಹಣಿ • भू-अभिलेख',
        statusLabel: 'Required',
        whatIsIt: 'Digital Record of Rights, Tenancy, and Crops confirming cultivable land ownership.',
        whyNeeded: 'Determines the cultivable area and validates that the applicant is a small/marginal farmer eligible for subsidy.',
        whereToGet: 'State Revenue Department or Bhoomi portal (Karnataka).',
        issuingAuthority: 'State Revenue Department',
        howToPrepare: ['Download and print the latest digital RTC with barcode from the state revenue portal.'],
        whatToKeepReady: ['Survey Number', 'Hobli and Village names'],
        officialSourceUrl: 'https://bhoomi.karnataka.gov.in',
        officialSourceName: 'State Land Records (Bhoomi)'
      },
      {
        id: 'pmksy-water',
        name: 'Water Source & Power Certificate (Borewell / Well NOC)',
        nameVernacular: 'ನೀರಿನ ಮೂಲ ಮತ್ತು ವಿದ್ಯುತ್ ಪ್ರಮಾಣಪತ್ರ • जल स्रोत प्रमाणपत्र',
        statusLabel: 'Required',
        whatIsIt: 'A certificate or electricity billing receipt confirming an assured water source and pump installation on the plot.',
        whyNeeded: 'Micro-irrigation systems require pressurized water delivery from a functioning pump/well.',
        whereToGet: 'Local Electricity Supply Company (e.g. BESCOM/HESCOM/GESCOM) or Gram Panchayat Revenue Officer.',
        issuingAuthority: 'Local Electricity Utility / Gram Panchayat',
        howToPrepare: [
          'Obtain your latest agricultural electricity meter / connection bill (RR Number).',
          'If using a shared borewell, obtain a signed agreement or Gram Panchayat water availability certificate.'
        ],
        whatToKeepReady: ['Electricity connection RR number or borewell digging NOC', 'Panchayat endorsement'],
        officialSourceUrl: 'https://pmksy.gov.in',
        officialSourceName: 'PMKSY Guidelines'
      },
      {
        id: 'pmksy-bank',
        name: 'Bank Account Passbook',
        nameVernacular: 'ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ • बैंक पासबुक',
        statusLabel: 'Required',
        whatIsIt: 'Copy of bank passbook for direct benefit transfer or farmer share deposit.',
        whyNeeded: 'Required for processing direct DBT subsidies or bank guarantee verifications.',
        whereToGet: 'Applicant\'s scheduled commercial or cooperative bank.',
        issuingAuthority: 'Your Bank',
        howToPrepare: ['Ensure passbook has clear account number, IFSC code, and farmer name.'],
        whatToKeepReady: ['Passbook front page'],
        officialSourceUrl: 'https://pmksy.gov.in',
        officialSourceName: 'PMKSY Portal'
      }
    ]
  },

  'kcc': {
    schemeId: 'kcc',
    officialName: 'Kisan Credit Card (KCC) Subsidized Agri Credit Scheme',
    officialNameVernacular: 'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ • किसान क्रेडिट कार्ड',
    description: 'Provides timely and flexible institutional credit to farmers for crop production, maintenance, and allied agricultural activities at a subsidized effective interest rate of 4% per annum.',
    ministry: 'Department of Financial Services, Ministry of Finance in partnership with RBI & NABARD',
    whoProvidesService: 'Public & Private Commercial Banks, Regional Rural Banks (RRBs), Cooperative Banks',
    benefitsSummary: 'Short-term crop credit up to ₹3,00,000 at an effective interest rate of 4% per annum upon prompt repayment.',
    benefitDetails: [
      'Credit limit based on operational landholding, crop cultivation pattern, and scale of finance.',
      'Standard 7% interest rate with an additional 3% prompt repayment incentive (PRI), bringing net cost to 4% p.a.',
      'Flexible revolving cash credit account valid for 5 years with annual review and built-in ATM/RuPay debit card access.'
    ],
    eligibilityRequirements: [
      'Individual farmers, joint cultivators, tenant farmers, oral lessees, or sharecroppers.',
      'Age between 18 and 75 years (co-borrower required if applicant is over 60 years old).',
      'Clean credit history with no commercial willful defaults in banking institutions.'
    ],
    applicationProcedure: [
      'Step 1: Download the 1-page simplified KCC application form from your preferred bank\'s website or visit a local branch.',
      'Step 2: Attach copies of your land records (RTC/Pahani) and identity documents (Aadhaar).',
      'Step 3: Submit the form to the nearest rural/semi-urban commercial bank or cooperative branch.',
      'Step 4: The bank verifies land cultivation records and processes the loan within a statutory 14-day timeline.',
      'Step 5: Collect your RuPay Kisan Credit Card with an approved drawing limit.'
    ],
    importantConditions: [
      'Prompt annual repayment before the due date is required to receive the 3% interest subvention bonus.',
      'Collateral requirement is waived for credit limits up to ₹1,60,000 (extended to ₹3,00,000 for tie-up arrangements).'
    ],
    officialApplicationPortalUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    officialApplicationPortalName: 'KCC Official Bank Channel (myscheme.gov.in)',
    officialInformationSourceUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=1630043',
    officialInformationSourceName: 'Press Information Bureau / RBI KCC Guidelines',
    lastUpdatedDate: 'September 2026',
    documents: [
      {
        id: 'kcc-aadhaar',
        name: 'Aadhaar Card (Identity & Address Proof)',
        nameVernacular: 'ಆಧಾರ್ ಕಾರ್ಡ್ • आधार कार्ड',
        statusLabel: 'Required',
        whatIsIt: 'Official identity document with unique 12-digit UID.',
        whyNeeded: 'Mandatory KYC verification under RBI guidelines for opening credit accounts.',
        whereToGet: 'Unique Identification Authority of India (UIDAI).',
        issuingAuthority: 'UIDAI',
        howToPrepare: ['Keep original card and one self-attested photocopy ready.'],
        whatToKeepReady: ['Aadhaar Card', 'Registered Mobile'],
        officialSourceUrl: 'https://myaadhaar.uidai.gov.in',
        officialSourceName: 'UIDAI'
      },
      {
        id: 'kcc-land',
        name: 'Land Ownership Record (RTC / Pahani / 7/12)',
        nameVernacular: 'ಆರ್‌ಟಿಸಿ / ಪಹಣಿ • भू-अभिलेख / खतौनी',
        statusLabel: 'Required',
        whatIsIt: 'Record of Rights certified by the state revenue department showing crop pattern and ownership.',
        whyNeeded: 'Determines the permissible credit limit according to district scale of finance per acre.',
        whereToGet: 'State revenue department portal or Taluk Village Accountant.',
        issuingAuthority: 'State Revenue Department',
        howToPrepare: ['Procure a current-year digital RTC printout showing acreage and crop details.'],
        whatToKeepReady: ['Survey Number', 'Khata details'],
        officialSourceUrl: 'https://bhoomi.karnataka.gov.in',
        officialSourceName: 'State Revenue Land Records'
      },
      {
        id: 'kcc-nodues',
        name: 'No-Dues Certificate / Affidavit',
        nameVernacular: 'ಬಾಕಿ ಇಲ್ಲದ ಪ್ರಮಾಣಪತ್ರ • बकाया रहित प्रमाणपत्र',
        statusLabel: 'Usually required',
        whatIsIt: 'A self-declaration or certificate from neighboring PACS/banks confirming no outstanding agricultural loans on the same parcel.',
        whyNeeded: 'Prevents multi-bank over-leveraging on the same agricultural plot.',
        whereToGet: 'Local Primary Agricultural Credit Society (PACS) or self-declaration format provided by the branch.',
        issuingAuthority: 'Local Cooperative Society / Bank Branch',
        howToPrepare: ['Request a no-dues endorsement from your local village cooperative society.'],
        whatToKeepReady: ['Existing cooperative membership number if any'],
        officialSourceUrl: 'https://www.myscheme.gov.in/schemes/kcc',
        officialSourceName: 'NABARD KCC Guidelines'
      },
      {
        id: 'kcc-photo',
        name: 'Passport Size Photographs',
        nameVernacular: 'ಭಾವಚಿತ್ರಗಳು • पासपोर्ट साइज फोटो',
        statusLabel: 'Required',
        whatIsIt: 'Two recent color passport-size photographs of the applicant.',
        whyNeeded: 'Required for bank loan documentation and RuPay Kisan Card issuance.',
        whereToGet: 'Any local photo studio.',
        issuingAuthority: 'Authorized Commercial Photographer',
        howToPrepare: ['Carry 2-3 clean passport-sized photographs taken within the last 6 months.'],
        whatToKeepReady: ['Passport photographs'],
        officialSourceUrl: 'https://www.myscheme.gov.in/schemes/kcc',
        officialSourceName: 'RBI Banking Guidelines'
      }
    ]
  },

  'ssp-scholarship': {
    schemeId: 'ssp-scholarship',
    officialName: 'Karnataka State Scholarship Portal (SSP) Post-Matric Scholarship',
    officialNameVernacular: 'ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್ (SSP) • कर्नाटक राज्य छात्रवृत्ति',
    description: 'Comprehensive financial aid scheme for students belonging to SC, ST, OBC, Minorities, and EWS categories pursuing post-matric, diploma, degree, and professional education in Karnataka.',
    ministry: 'Social Welfare & Backward Classes Welfare Department, Government of Karnataka',
    whoProvidesService: 'State Scholarship Portal (SSP), Centre for e-Governance, Karnataka',
    benefitsSummary: '₹12,000 to ₹25,000 per year covering full tuition fee reimbursement and monthly maintenance allowances.',
    benefitDetails: [
      'Complete college tuition and examination fee reimbursement credited directly to the institution.',
      'Monthly maintenance and hostel allowance deposited directly into the student\'s Aadhaar-seeded bank account.',
      'Additional book grants and merit allowances for professional degree students.'
    ],
    eligibilityRequirements: [
      'Regular enrolled student in a recognized post-matric institution, degree college, or university in Karnataka.',
      'Domicile of Karnataka state.',
      'Annual family income from all sources within the prescribed category limit (₹2,50,000 for SC/ST; ₹1,00,000 to ₹2,50,000 for OBC/Minorities).',
      'Age between 15 and 35 years.'
    ],
    applicationProcedure: [
      'Step 1: Visit the official Karnataka SSP Post-Matric portal (ssp.postmatric.karnataka.gov.in).',
      'Step 2: Create a student login using your Aadhaar number and registered mobile number.',
      'Step 3: Enter your 15-character Caste & Income Certificate RD Number issued by Nadakacheri.',
      'Step 4: Select your College, University, and Course from the unified e-Attestation list.',
      'Step 5: Provide your SSLC registration number and previous academic marks.',
      'Step 6: Submit for electronic institutional verification (e-Attestation) by your college nodal officer.'
    ],
    importantConditions: [
      'Caste and Income certificate must be digitally valid and verifiable via the Nadakacheri database with an RD number.',
      'Student bank account must be actively seeded with Aadhaar and NPCI mapped for direct DBT payout.',
      'Must maintain regular academic attendance (minimum 75%) throughout the course duration.'
    ],
    officialApplicationPortalUrl: 'https://ssp.postmatric.karnataka.gov.in',
    officialApplicationPortalName: 'Karnataka SSP Post-Matric Portal (ssp.postmatric.karnataka.gov.in)',
    officialInformationSourceUrl: 'https://ssp.postmatric.karnataka.gov.in',
    officialInformationSourceName: 'Government of Karnataka Social Welfare Department',
    lastUpdatedDate: 'September 2026',
    documents: [
      {
        id: 'ssp-aadhaar',
        name: 'Student Aadhaar Card',
        nameVernacular: 'ವಿದ್ಯಾರ್ಥಿ ಆಧಾರ್ ಕಾರ್ಡ್ • विद्यार्थी आधार कार्ड',
        statusLabel: 'Required',
        whatIsIt: 'Official 12-digit identity card issued by UIDAI.',
        whyNeeded: 'Authenticates student identity and links with the Unified University College Management System (UUCMS).',
        whereToGet: 'Unique Identification Authority of India (UIDAI).',
        issuingAuthority: 'UIDAI',
        howToPrepare: ['Ensure student name matches high school marks card exactly.'],
        whatToKeepReady: ['Aadhaar Number', 'Mobile for OTP'],
        officialSourceUrl: 'https://myaadhaar.uidai.gov.in',
        officialSourceName: 'UIDAI'
      },
      {
        id: 'ssp-caste-income',
        name: 'Caste & Income Certificate (Nadakacheri RD Number)',
        nameVernacular: 'ಜಾತಿ ಮತ್ತು ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ (RD ಸಂಖ್ಯೆ) • जाति एवं आय प्रमाणपत्र',
        statusLabel: 'Required',
        whatIsIt: 'Digitally signed official certificate proving family annual income and backward/SC/ST reservation category.',
        whyNeeded: 'SSP portal fetches income and reservation category deterministically using the RD number.',
        whereToGet: 'Atalji Janasnehi Kendra (Nadakacheri) online portal (nadakacheri.karnataka.gov.in) or local Tahsildar office.',
        issuingAuthority: 'Revenue Department / Nadakacheri Atalji Janasnehi Kendra',
        howToPrepare: [
          'Visit nadakacheri.karnataka.gov.in or apply through Bangalore One / Karnataka One.',
          'Obtain the digitally signed certificate bearing the alphanumeric RD number (e.g. RD0038...).',
          'Verify that the certificate validity date has not expired.'
        ],
        whatToKeepReady: ['Ration Card / Voter ID', 'Salary slip or village accountant verification', 'Current address proof'],
        officialSourceUrl: 'https://nadakacheri.karnataka.gov.in',
        officialSourceName: 'Nadakacheri Atalji Janasnehi Kendra (nadakacheri.karnataka.gov.in)'
      },
      {
        id: 'ssp-college',
        name: 'College Bonafide Certificate & Admission Fee Receipt',
        nameVernacular: 'ಕಾಲೇಜು ಬೋನಫೈಡ್ / ಪ್ರವೇಶ ರಶೀದಿ • कॉलेज बोनाफाइड प्रमाणपत्र',
        statusLabel: 'Required',
        whatIsIt: 'Official document from the college principal confirming admission, course name, and tuition fees paid.',
        whyNeeded: 'Verifies current active student enrollment and fee structure for fee reimbursement calculations.',
        whereToGet: 'College administrative office / University student portal.',
        issuingAuthority: 'Enrolled College / University Principal',
        howToPrepare: ['Request a signed Bonafide Certificate from the college registrar after paying admission fees.'],
        whatToKeepReady: ['Admission receipt / Student ID card'],
        officialSourceUrl: 'https://ssp.postmatric.karnataka.gov.in',
        officialSourceName: 'Karnataka Higher Education'
      },
      {
        id: 'ssp-marksheet',
        name: 'Previous Academic Marksheet / SSLC Marks Card',
        nameVernacular: 'ಎಸ್ಸೆಸ್ಸೆಲ್ಸಿ / ಹಿಂದಿನ ಅಂಕಪಟ್ಟಿ • पूर्व कक्षा अंकपत्र',
        statusLabel: 'Required',
        whatIsIt: 'Official statement of marks from Karnataka KSEAB or university examination board.',
        whyNeeded: 'Confirms qualifying exam completion and continuous academic progression.',
        whereToGet: 'Karnataka School Examination and Assessment Board (KSEAB) or university.',
        issuingAuthority: 'State Education Board / University',
        howToPrepare: ['Keep original and scanned copy of SSLC/10th marks card with registration number.'],
        whatToKeepReady: ['SSLC Register Number', 'College registration number'],
        officialSourceUrl: 'https://kseab.karnataka.gov.in',
        officialSourceName: 'KSEAB Official Portal'
      },
      {
        id: 'ssp-bank',
        name: 'Student Bank Account Details (Aadhaar Seeded)',
        nameVernacular: 'ವಿದ್ಯಾರ್ಥಿ ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರ • विद्यार्थी बैंक खाता',
        statusLabel: 'Required',
        whatIsIt: 'Active bank account held in the student\'s own name.',
        whyNeeded: 'Scholarship stipends cannot be paid into parent accounts; must be in student\'s own name with NPCI seeding.',
        whereToGet: 'Any commercial bank or Post Office branch.',
        issuingAuthority: 'Student\'s Bank',
        howToPrepare: ['Open a zero-balance student account and complete Aadhaar biometric seeding.'],
        whatToKeepReady: ['Bank Passbook with Account Number and IFSC'],
        officialSourceUrl: 'https://ssp.postmatric.karnataka.gov.in',
        officialSourceName: 'State Scholarship Portal'
      }
    ]
  },

  'nmms-scholarship': {
    schemeId: 'nmms-scholarship',
    officialName: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
    officialNameVernacular: 'ರಾಷ್ಟ್ರೀಯ ಮೆರಿಟ್ ವಿದ್ಯಾರ್ಥಿವೇತನ • राष्ट्रीय मेरिट छात्रवृत्ति योजना',
    description: 'Centrally sponsored scholarship scheme by the Ministry of Education to award meritorious students of economically weaker sections to arrest dropouts at class VIII and encourage secondary studies.',
    ministry: 'Department of School Education & Literacy, Ministry of Education, Government of India',
    whoProvidesService: 'National Scholarship Portal (scholarships.gov.in) & State Education Departments',
    benefitsSummary: '₹12,000 per annum (₹1,000 per month) for students studying from Class IX through Class XII.',
    benefitDetails: [
      'Financial allowance of ₹1,000 per month (₹12,000 annually) deposited directly into student accounts.',
      'Assured assistance throughout high school and higher secondary education (Classes 9, 10, 11, and 12).',
      'Direct disbursement via National Scholarship Portal DBT gateway.'
    ],
    eligibilityRequirements: [
      'Regular student studying in government, local body, or government-aided school.',
      'Must have scored at least 55% marks (50% for SC/ST) in the Class VII examination.',
      'Parental annual income from all sources not exceeding ₹3,50,000.',
      'Must clear the state-level selection examination conducted for Class VIII students.'
    ],
    applicationProcedure: [
      'Step 1: Register on the National Scholarship Portal (scholarships.gov.in).',
      'Step 2: Enter Aadhaar number or Aadhaar Enrolment ID to create a student OTR profile.',
      'Step 3: Select "National Means-cum-Merit Scholarship Scheme".',
      'Step 4: Upload parental income certificate and school bonafide statement.',
      'Step 5: The school principal verifies the application digitally through the NSP Institute Login.'
    ],
    importantConditions: [
      'Students of Navodaya Vidyalayas, Kendriya Vidyalayas, and residential schools run by governments are not eligible.',
      'Scholarship must be renewed annually by securing minimum pass marks in Class IX, X, and XI.'
    ],
    officialApplicationPortalUrl: 'https://scholarships.gov.in',
    officialApplicationPortalName: 'National Scholarship Portal (scholarships.gov.in)',
    officialInformationSourceUrl: 'https://www.myscheme.gov.in/schemes/nmmss',
    officialInformationSourceName: 'myScheme National Scholarship Portal (myscheme.gov.in)',
    lastUpdatedDate: 'September 2026',
    documents: [
      {
        id: 'nmms-aadhaar',
        name: 'Student Aadhaar Card',
        nameVernacular: 'ವಿದ್ಯಾರ್ಥಿ ಆಧಾರ್ ಕಾರ್ಡ್ • आधार कार्ड',
        statusLabel: 'Required',
        whatIsIt: 'Unique 12-digit identity card issued by UIDAI.',
        whyNeeded: 'Mandatory identity verification on the National Scholarship Portal.',
        whereToGet: 'Unique Identification Authority of India (UIDAI).',
        issuingAuthority: 'UIDAI',
        howToPrepare: ['Ensure name and birth date match school admission register.'],
        whatToKeepReady: ['Aadhaar Number'],
        officialSourceUrl: 'https://myaadhaar.uidai.gov.in',
        officialSourceName: 'UIDAI'
      },
      {
        id: 'nmms-income',
        name: 'Parental Income Certificate',
        nameVernacular: 'ಪೋಷಕರ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ • अभिभावक आय प्रमाणपत्र',
        statusLabel: 'Required',
        whatIsIt: 'Official revenue document showing total family income from all sources is under ₹3,50,000.',
        whyNeeded: 'Demonstrates economic eligibility for the Means-cum-Merit category.',
        whereToGet: 'Revenue Department / Sub-Divisional Magistrate (SDM) / Tahsildar.',
        issuingAuthority: 'State Revenue Department',
        howToPrepare: ['Obtain digitally signed certificate from your local revenue authority.'],
        whatToKeepReady: ['Salary slip, agricultural affidavit, or self-declaration as requested by Tahsildar'],
        officialSourceUrl: 'https://scholarships.gov.in',
        officialSourceName: 'Revenue Dept'
      },
      {
        id: 'nmms-bonafide',
        name: 'School Bonafide Certificate',
        nameVernacular: 'ಶಾಲಾ ಬೋನಫೈಡ್ ಪ್ರಮಾಣಪತ್ರ • स्कूल बोनाफाइड प्रमाणपत्र',
        statusLabel: 'Required',
        whatIsIt: 'Certificate issued by the Headmaster/Principal confirming student attendance in a government or aided school.',
        whyNeeded: 'Verifies the school is an approved category school under scheme rules.',
        whereToGet: 'School Headmaster / Principal Office.',
        issuingAuthority: 'School Headmaster / Principal',
        howToPrepare: ['Request school authority to issue bonafide on official letterhead.'],
        whatToKeepReady: ['School admission register number'],
        officialSourceUrl: 'https://scholarships.gov.in',
        officialSourceName: 'Ministry of Education'
      },
      {
        id: 'nmms-bank',
        name: 'Student Bank Account Details',
        nameVernacular: 'ವಿದ್ಯಾರ್ಥಿ ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರ • बैंक पासबुक',
        statusLabel: 'Required',
        whatIsIt: 'Passbook of savings account held in the student\'s name or joint account with parent.',
        whyNeeded: 'Direct Benefit Transfer disbursement from the Ministry of Education.',
        whereToGet: 'Any Nationalized Commercial Bank or India Post Payments Bank.',
        issuingAuthority: 'Student\'s Bank',
        howToPrepare: ['Ensure bank account is mapped to NPCI Aadhaar bridge.'],
        whatToKeepReady: ['Bank Passbook copy'],
        officialSourceUrl: 'https://scholarships.gov.in',
        officialSourceName: 'National Scholarship Portal'
      }
    ]
  },

  'eshram-welfare': {
    schemeId: 'eshram-welfare',
    officialName: 'e-Shram Universal Social Security & Welfare Initiative',
    officialNameVernacular: 'ಇ-ಶ್ರಮ್ ಸಾಮಾಜಿಕ ಭದ್ರತೆ • ई-श्रम सामाजिक सुरक्षा',
    description: 'National portal creating a comprehensive database of unorganized workers to deliver social security benefits, accident insurance, and emergency welfare assistance directly.',
    ministry: 'Ministry of Labour & Employment, Government of India',
    whoProvidesService: 'Directorate General of Labour Welfare / Ministry of Labour & Employment',
    benefitsSummary: '₹2,00,000 accidental death/permanent disability cover under PMSBY, plus social security welfare access.',
    benefitDetails: [
      'Universal Unique Account Number (UAN) card recognized across all Indian states.',
      'Accidental insurance coverage of ₹2 Lakh on death/permanent disability and ₹1 Lakh on partial disability.',
      'Direct inclusion in national social security schemes, pension benefits, and disaster relief payouts.'
    ],
    eligibilityRequirements: [
      'Unorganized worker (daily wage worker, agricultural laborer, construction worker, artisan, gig worker, street vendor).',
      'Age between 16 and 59 years.',
      'Must not be an active member of EPFO, ESIC, or an income tax payee.'
    ],
    applicationProcedure: [
      'Step 1: Visit the official e-Shram portal (eshram.gov.in) or visit your nearest Common Service Centre (CSC).',
      'Step 2: Enter your Aadhaar-linked mobile number and captcha to receive an OTP.',
      'Step 3: Enter your 12-digit Aadhaar number and agree to demographic verification.',
      'Step 4: Enter address details, educational qualification, and primary occupation code.',
      'Step 5: Provide active bank account details for direct welfare transfer.',
      'Step 6: Download and print your 12-digit e-Shram Universal Account Number (UAN) Card.'
    ],
    importantConditions: [
      'Worker must be employed in the informal/unorganized sector with no formal provident fund coverage.',
      'Mobile number should ideally be linked to Aadhaar for smooth self-registration.'
    ],
    officialApplicationPortalUrl: 'https://eshram.gov.in',
    officialApplicationPortalName: 'e-Shram Official Portal (eshram.gov.in)',
    officialInformationSourceUrl: 'https://www.myscheme.gov.in/schemes/eshram',
    officialInformationSourceName: 'myScheme e-Shram Portal (myscheme.gov.in)',
    lastUpdatedDate: 'September 2026',
    documents: [
      {
        id: 'eshram-aadhaar',
        name: 'Aadhaar Card',
        nameVernacular: 'ಆಧಾರ್ ಕಾರ್ಡ್ • आधार कार्ड',
        statusLabel: 'Required',
        whatIsIt: 'Official 12-digit identification card issued by UIDAI.',
        whyNeeded: 'Mandatory primary identifier for issuing the 12-digit Universal Account Number (UAN).',
        whereToGet: 'Unique Identification Authority of India (UIDAI).',
        issuingAuthority: 'UIDAI',
        howToPrepare: ['Keep your Aadhaar card ready with readable demographic details.'],
        whatToKeepReady: ['Aadhaar Number'],
        officialSourceUrl: 'https://myaadhaar.uidai.gov.in',
        officialSourceName: 'UIDAI'
      },
      {
        id: 'eshram-mobile',
        name: 'Aadhaar-Linked Mobile Number',
        nameVernacular: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ • आधार से जुड़ा मोबाइल नंबर',
        statusLabel: 'Required',
        whatIsIt: 'Active mobile number linked with the worker\'s Aadhaar card.',
        whyNeeded: 'Receives authentication OTPs during self-registration on the portal.',
        whereToGet: 'Telecom Service Provider.',
        issuingAuthority: 'Telecom Provider',
        howToPrepare: ['Ensure your mobile phone can receive SMS messages.'],
        whatToKeepReady: ['Mobile Phone with active connection'],
        officialSourceUrl: 'https://eshram.gov.in',
        officialSourceName: 'e-Shram Portal'
      },
      {
        id: 'eshram-bank',
        name: 'Bank Account Passbook Details',
        nameVernacular: 'ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ • बैंक पासबुक',
        statusLabel: 'Required',
        whatIsIt: 'Active savings bank account details (Account number, branch name, IFSC).',
        whyNeeded: 'Enables direct transfer of accident insurance claims and emergency welfare relief.',
        whereToGet: 'Any Scheduled Commercial Bank or Post Office.',
        issuingAuthority: 'Worker\'s Bank',
        howToPrepare: ['Keep a copy of bank passbook front page displaying IFSC and account number.'],
        whatToKeepReady: ['Bank Account Number', 'IFSC Code'],
        officialSourceUrl: 'https://eshram.gov.in',
        officialSourceName: 'e-Shram'
      }
    ]
  },

  'lakhpati-didi': {
    schemeId: 'lakhpati-didi',
    officialName: 'Lakhpati Didi Self-Help Group (SHG) Livelihood Initiative',
    officialNameVernacular: 'ಲಕ್ಷಪತಿ ದೀದಿ ಮಹಿಳಾ ಸ್ವಸಹಾಯ ಸಂಘ • लखपति दीदी योजना',
    description: 'A transformative rural development program enabling women in Self-Help Groups (SHGs) to earn a sustainable annual household income of at least ₹1 Lakh through micro-enterprises and technical mentorship.',
    ministry: 'Ministry of Rural Development & Deendayal Antyodaya Yojana - NRLM',
    whoProvidesService: 'State Rural Livelihood Missions (SRLM) & Gram Panchayat Community Resource Persons',
    benefitsSummary: 'Subsidized micro-loans up to ₹5,00,000 at 4% interest with entrepreneurship training and market linkage.',
    benefitDetails: [
      'Access to collateral-free community investment funds and bank linkage loans between ₹1,00,000 and ₹5,00,000.',
      'Interest subvention reducing effective interest rates to 4% per annum for prompt repayment.',
      'Comprehensive training in agro-processing, livestock rearing, solar lamp assembly, digital financial services, and handicrafts.'
    ],
    eligibilityRequirements: [
      'Adult female citizen residing in rural or semi-urban areas.',
      'Active member of a registered Self-Help Group (SHG) under DAY-NRLM.',
      'Committed to taking up viable micro-enterprise or livelihood activities.'
    ],
    applicationProcedure: [
      'Step 1: Contact your Village Organization (VO) or Cluster Level Federation (CLF) representative.',
      'Step 2: Prepare a Micro-Investment Plan (MIP) with assistance from the Community Resource Person (CRP).',
      'Step 3: The SHG passes a resolution approving your enterprise credit application.',
      'Step 4: The Gram Panchayat and Block Mission Management Unit (BMMU) forward the dossier to the partner bank.',
      'Step 5: The bank sanctions the credit limit and disburses the funds directly into the SHG/individual account.'
    ],
    importantConditions: [
      'Must maintain regular attendance and weekly savings in your designated SHG group.',
      'Prior enterprise feasibility orientation conducted by the Community Resource Person must be completed.'
    ],
    officialApplicationPortalUrl: 'https://nrlm.gov.in',
    officialApplicationPortalName: 'DAY-NRLM National Portal (nrlm.gov.in)',
    officialInformationSourceUrl: 'https://www.myscheme.gov.in/schemes/lakhpati-didi',
    officialInformationSourceName: 'myScheme Lakhpati Didi Guidelines (myscheme.gov.in)',
    lastUpdatedDate: 'September 2026',
    documents: [
      {
        id: 'lakh-aadhaar',
        name: 'Aadhaar Card',
        nameVernacular: 'ಆಧಾರ್ ಕಾರ್ಡ್ • आधार कार्ड',
        statusLabel: 'Required',
        whatIsIt: 'Official photo identity document issued by UIDAI.',
        whyNeeded: 'Verifies the female applicant\'s identity and residence.',
        whereToGet: 'Unique Identification Authority of India (UIDAI).',
        issuingAuthority: 'UIDAI',
        howToPrepare: ['Keep a photocopy of your Aadhaar card ready.'],
        whatToKeepReady: ['Aadhaar Number'],
        officialSourceUrl: 'https://myaadhaar.uidai.gov.in',
        officialSourceName: 'UIDAI'
      },
      {
        id: 'lakh-shg',
        name: 'SHG Membership Passbook & ID',
        nameVernacular: 'ಸ್ವಸಹಾಯ ಸಂಘದ ಸದಸ್ಯತ್ವ ಪಾಸ್‌ಬುಕ್ • एसएचजी सदस्यता पासबुक',
        statusLabel: 'Required',
        whatIsIt: 'Official passbook showing member regular contributions, attendance, and internal loan repayment history.',
        whyNeeded: 'Proves active membership in an accredited National Rural Livelihoods Mission SHG.',
        whereToGet: 'Self-Help Group President / Secretary or Village Organization.',
        issuingAuthority: 'Registered Self-Help Group (DAY-NRLM)',
        howToPrepare: ['Ensure all your weekly savings and credit entries are updated in your SHG passbook.'],
        whatToKeepReady: ['SHG Passbook', 'SHG Group Code Number'],
        officialSourceUrl: 'https://nrlm.gov.in',
        officialSourceName: 'DAY-NRLM Portal'
      },
      {
        id: 'lakh-resolution',
        name: 'SHG Resolution & Recommendation Letter',
        nameVernacular: 'ಸಂಘದ ಅನುಮೋದನಾ ಪತ್ರ • एसएचजी प्रस्ताव पत्र',
        statusLabel: 'Required',
        whatIsIt: 'Minutes of meeting signed by SHG members recommending the applicant for enterprise loan assistance.',
        whyNeeded: 'Demonstrates community support and collective peer guarantee for loan recovery.',
        whereToGet: 'SHG meeting minute book / Village Organization office.',
        issuingAuthority: 'SHG Executive Committee',
        howToPrepare: ['Request an agenda item in your monthly SHG meeting to approve your enterprise plan.'],
        whatToKeepReady: ['Enterprise Activity Proposal', 'SHG Meeting Minutes'],
        officialSourceUrl: 'https://nrlm.gov.in',
        officialSourceName: 'Ministry of Rural Development'
      },
      {
        id: 'lakh-bank',
        name: 'Bank Account Passbook Details',
        nameVernacular: 'ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ • बैंक पासबुक',
        statusLabel: 'Required',
        whatIsIt: 'Bank passbook copy of the applicant\'s individual savings account.',
        whyNeeded: 'Required for crediting loan funds and interest subvention payouts.',
        whereToGet: 'Scheduled Commercial Bank / Regional Rural Bank.',
        issuingAuthority: 'Applicant\'s Bank',
        howToPrepare: ['Verify that bank account name matches Aadhaar card exactly.'],
        whatToKeepReady: ['Passbook front page'],
        officialSourceUrl: 'https://nrlm.gov.in',
        officialSourceName: 'NRLM Guidelines'
      }
    ]
  },

  'pm-awas-gramin': {
    schemeId: 'pm-awas-gramin',
    officialName: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
    officialNameVernacular: 'ಪ್ರಧಾನಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನೆ (ಗ್ರಾಮೀಣ) • प्रधानमंत्री आवास योजना ग्रामीण',
    description: 'Provides financial assistance to homeless families and households living in kutcha/dilapidated homes in rural areas to construct a safe, durable pucca house with basic amenities.',
    ministry: 'Ministry of Rural Development, Government of India',
    whoProvidesService: 'PMAY-G Division, Ministry of Rural Development & Gram Panchayats',
    benefitsSummary: 'Direct grant of ₹1,20,000 (plain areas) to ₹1,30,000 (hilly/difficult areas) plus 90 days MGNREGA wages.',
    benefitDetails: [
      'Grant of ₹1,20,000 in plains and ₹1,30,000 in hilly/difficult/northeastern states transferred in installments.',
      'Additional entitlement of 90 to 95 person-days of unskilled labor support under MGNREGA (approx ₹25,000 - ₹30,000).',
      'Additional assistance of ₹12,000 for toilet construction under Swachh Bharat Mission (Grameen).',
      'Convergence with PM Ujjwala (LPG connection) and Saubhagya (electricity connection).'
    ],
    eligibilityRequirements: [
      'Families residing in rural areas who do not own a pucca house in their name anywhere in India.',
      'Households living in zero, one, or two-room houses with kutcha walls and kutcha roof.',
      'Prioritized using the Socio-Economic and Caste Census (SECC 2011) and Awas+ survey data.',
      'Families without motorized vehicles, mechanized agricultural equipment, or government service.'
    ],
    applicationProcedure: [
      'Step 1: Check your beneficiary status in the Gram Panchayat PMAY-G Permanent Wait List (PWL).',
      'Step 2: If not included, verify your inclusion through the local Awas+ mobile survey conducted by the Panchayat Secretary.',
      'Step 3: Submit identity and land possession documents to the Gram Panchayat.',
      'Step 4: Geo-tagging of the old/dilapidated site is conducted via the AwaasApp.',
      'Step 5: Sanction order is issued and funds are disbursed in 3-4 stages directly into your bank account as construction progresses.'
    ],
    importantConditions: [
      'Minimum built-up area of the house must be 25 square meters including a dedicated cooking area.',
      'Each stage payment requires mandatory geo-tagged photograph verification (Foundation, Lintel, Roof, Completion).'
    ],
    officialApplicationPortalUrl: 'https://pmayg.nic.in',
    officialApplicationPortalName: 'PMAY-G Official Portal (pmayg.nic.in)',
    officialInformationSourceUrl: 'https://www.myscheme.gov.in/schemes/pmay-g',
    officialInformationSourceName: 'myScheme PMAY-G Guidelines (myscheme.gov.in)',
    lastUpdatedDate: 'September 2026',
    documents: [
      {
        id: 'pmay-aadhaar',
        name: 'Aadhaar Card (All Adult Family Members)',
        nameVernacular: 'ಆಧಾರ್ ಕಾರ್ಡ್ • आधार कार्ड',
        statusLabel: 'Required',
        whatIsIt: 'Official 12-digit identity card issued by UIDAI.',
        whyNeeded: 'Mandatory Aadhaar authentication for house ownership title and DBT bank transfers.',
        whereToGet: 'Unique Identification Authority of India (UIDAI).',
        issuingAuthority: 'UIDAI',
        howToPrepare: ['Collect self-attested photocopies of Aadhaar for applicant and spouse.'],
        whatToKeepReady: ['Aadhaar Cards of family members'],
        officialSourceUrl: 'https://myaadhaar.uidai.gov.in',
        officialSourceName: 'UIDAI'
      },
      {
        id: 'pmay-ration',
        name: 'BPL / Antyodaya Ration Card',
        nameVernacular: 'ಪಡಿತರ ಚೀಟಿ • राशन कार्ड',
        statusLabel: 'Required',
        whatIsIt: 'Civil supplies card showing family member composition and household economic category.',
        whyNeeded: 'Verifies family composition and confirms low-income economic classification.',
        whereToGet: 'Department of Food, Civil Supplies & Consumer Affairs.',
        issuingAuthority: 'State Food & Civil Supplies Department',
        howToPrepare: ['Keep current ration card showing all member names.'],
        whatToKeepReady: ['Ration card number and copy'],
        officialSourceUrl: 'https://ahara.kar.nic.in',
        officialSourceName: 'Food & Civil Supplies Portal'
      },
      {
        id: 'pmay-land',
        name: 'Land / Homestead Site Possession Certificate',
        nameVernacular: 'ವಸತಿ ನಿವೇಶನ ಹಕ್ಕು ಪತ್ರ • भूमि / पट्टा प्रमाणपत्र',
        statusLabel: 'Required',
        whatIsIt: 'Gram Panchayat Hakku Patra, revenue title, or land possession certificate where construction will take place.',
        whyNeeded: 'Confirms applicant has uncontested legal right to construct a dwelling on the site.',
        whereToGet: 'Gram Panchayat PDO / Village Accountant / Tahsildar.',
        issuingAuthority: 'Gram Panchayat / Revenue Authority',
        howToPrepare: ['Obtain ownership confirmation from the Panchayat Development Officer (PDO).'],
        whatToKeepReady: ['Panchayat site allocation order or ancestral site possession paper'],
        officialSourceUrl: 'https://pmayg.nic.in',
        officialSourceName: 'PMAY-G Guidelines'
      },
      {
        id: 'pmay-bank',
        name: 'Bank Account Passbook Details',
        nameVernacular: 'ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ • बैंक पासबुक',
        statusLabel: 'Required',
        whatIsIt: 'Savings bank account passbook showing active status and IFSC code.',
        whyNeeded: 'All construction stage payments are disbursed directly into this account.',
        whereToGet: 'Scheduled Commercial Bank / Post Office.',
        issuingAuthority: 'Applicant\'s Bank',
        howToPrepare: ['Ensure account is Aadhaar-seeded and operational.'],
        whatToKeepReady: ['Passbook front page'],
        officialSourceUrl: 'https://pmayg.nic.in',
        officialSourceName: 'PMAY-G Portal'
      },
      {
        id: 'pmay-jobcard',
        name: 'MGNREGA Job Card',
        nameVernacular: 'ಉದ್ಯೋಗ ಖಾತರಿ ಜಾಬ್ ಕಾರ್ಡ್ • मनरेगा जॉब कार्ड',
        statusLabel: 'Usually required',
        whatIsIt: 'Active 100-days employment guarantee card issued to rural households.',
        whyNeeded: 'Facilitates 90 days of unskilled wage compensation transferred to the beneficiary for building their home.',
        whereToGet: 'Gram Panchayat Office.',
        issuingAuthority: 'Gram Panchayat / MGNREGA Authority',
        howToPrepare: ['Keep your active Job Card number ready.'],
        whatToKeepReady: ['Job Card Number'],
        officialSourceUrl: 'https://nrega.nic.in',
        officialSourceName: 'MGNREGA National Portal'
      }
    ]
  },

  'pm-mudra-yojana': {
    schemeId: 'pm-mudra-yojana',
    officialName: 'Pradhan Mantri MUDRA Yojana (PMMY) – Shishu & Kishor',
    officialNameVernacular: 'ಮುದ್ರಾ ಯೋಜನೆ ಸಾಲ • प्रधानमंत्री मुद्रा योजना',
    description: 'Offers collateral-free institutional business loans up to ₹10 Lakhs to non-corporate, non-farm small and micro enterprises, shopkeepers, fruits/vegetable vendors, and artisans.',
    ministry: 'Department of Financial Services, Ministry of Finance, Government of India',
    whoProvidesService: 'Commercial Banks, RRBs, Small Finance Banks, MFIs, and NBFCs',
    benefitsSummary: 'Collateral-free institutional micro-credit up to ₹10,00,000 with Mudra RuPay card working capital access.',
    benefitDetails: [
      'Shishu Category: Loans up to ₹50,000 for setting up small shops, repair units, or artisan workshops.',
      'Kishor Category: Loans from ₹50,001 up to ₹5,00,000 for purchasing equipment, machinery, or inventory.',
      'Tarun Category: Loans from ₹5,00,001 up to ₹10,00,000 for enterprise expansion.',
      'Zero collateral or third-party guarantor required; backed by Credit Guarantee Fund for Micro Units (CGFMU).'
    ],
    eligibilityRequirements: [
      'Any Indian citizen running or proposing to start a non-farm income-generating micro enterprise.',
      'Artisans, small manufacturers, repair shop owners, retail shopkeepers, food service operators.',
      'No past willful default in any commercial or cooperative bank.'
    ],
    applicationProcedure: [
      'Step 1: Download the standardized Mudra loan application form from mudra.org.in or apply online via udyamimitra.in.',
      'Step 2: Attach identity proof, business address proof, and equipment/inventory cost quotations.',
      'Step 3: Submit to your local commercial bank, Small Finance Bank (e.g. Ujjivan, Equitas), or NBFC.',
      'Step 4: Bank assesses business viability and sanctions the loan without requiring collateral.',
      'Step 5: Receive loan disbursement and a Mudra Debit Card for flexible working capital withdrawals.'
    ],
    importantConditions: [
      'Loan must be utilized strictly for legitimate business assets, working capital, or equipment purchase.',
      'No processing fee is charged for Shishu loans (up to ₹50,000).'
    ],
    officialApplicationPortalUrl: 'https://www.udyamimitra.in',
    officialApplicationPortalName: 'Udyami Mitra Mudra Portal (udyamimitra.in)',
    officialInformationSourceUrl: 'https://www.mudra.org.in',
    officialInformationSourceName: 'MUDRA Official Central Portal (mudra.org.in)',
    lastUpdatedDate: 'September 2026',
    documents: [
      {
        id: 'mudra-aadhaar',
        name: 'Aadhaar Card (Identity & Residence Proof)',
        nameVernacular: 'ಆಧಾರ್ ಕಾರ್ಡ್ • आधार कार्ड',
        statusLabel: 'Required',
        whatIsIt: 'Official 12-digit UID document proving identity and residential address.',
        whyNeeded: 'Standard KYC requirement for opening commercial loan accounts.',
        whereToGet: 'Unique Identification Authority of India (UIDAI).',
        issuingAuthority: 'UIDAI',
        howToPrepare: ['Keep original and self-attested photocopy ready.'],
        whatToKeepReady: ['Aadhaar Card'],
        officialSourceUrl: 'https://myaadhaar.uidai.gov.in',
        officialSourceName: 'UIDAI'
      },
      {
        id: 'mudra-address',
        name: 'Business Address & Enterprise Establishment Proof',
        nameVernacular: 'ವ್ಯಾಪಾರ ವಿಳಾಸ ದಾಖಲೆ • व्यापार का पता प्रमाणपत्र',
        statusLabel: 'Required',
        whatIsIt: 'Shop & Establishment certificate, Trade License, Udyam Registration, or rental agreement for business premises.',
        whyNeeded: 'Verifies the enterprise location and confirms genuine commercial activity.',
        whereToGet: 'Local Municipal Council, Gram Panchayat, or Udyam Registration portal (udyamregistration.gov.in).',
        issuingAuthority: 'Local Municipal / Gram Panchayat / MSME Ministry',
        howToPrepare: [
          'Generate a free instant Udyam Registration certificate at udyamregistration.gov.in using Aadhaar.',
          'Or obtain a trade license / shop certificate from your local municipal body.'
        ],
        whatToKeepReady: ['Shop photos', 'Rental deed or property tax receipt', 'Udyam certificate'],
        officialSourceUrl: 'https://udyamregistration.gov.in',
        officialSourceName: 'Udyam Registration Portal'
      },
      {
        id: 'mudra-quotation',
        name: 'Quotation for Machinery / Raw Materials to be Purchased',
        nameVernacular: 'ಯಂತ್ರೋಪಕರಣಗಳ ಬೆಲೆ ಪಟ್ಟಿ • मशीनरी का कोटेशन',
        statusLabel: 'Usually required',
        whatIsIt: 'Official printed quotation/estimate from authorized dealer for tools, machinery, or goods to be financed.',
        whyNeeded: 'Enables the bank to issue direct disbursement cheques to the equipment supplier.',
        whereToGet: 'Authorized wholesale dealer or manufacturer from whom equipment is to be bought.',
        issuingAuthority: 'Commercial Equipment Supplier',
        howToPrepare: ['Obtain a formal proforma invoice or written quotation on dealer letterhead with GSTIN.'],
        whatToKeepReady: ['Supplier GST invoice / proforma estimate'],
        officialSourceUrl: 'https://www.mudra.org.in',
        officialSourceName: 'MUDRA Guidelines'
      },
      {
        id: 'mudra-bank',
        name: '6-Month Bank Account Statement',
        nameVernacular: 'ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್ • 6 महीने का बैंक स्टेटमेंट',
        statusLabel: 'Usually required',
        whatIsIt: 'Bank statement of the applicant or enterprise covering the last 6 months.',
        whyNeeded: 'Helps the credit manager assess cash flows and daily transaction volumes.',
        whereToGet: 'Applicant\'s Bank Branch or Netbanking/Mobile App.',
        issuingAuthority: 'Applicant\'s Bank',
        howToPrepare: ['Download or print statement from your existing bank account.'],
        whatToKeepReady: ['Bank statement printout'],
        officialSourceUrl: 'https://www.udyamimitra.in',
        officialSourceName: 'Udyami Mitra'
      }
    ]
  }
};

export function getSchemeDetailedInfo(schemeId: string): SchemeDetailedInfo | null {
  return SCHEME_DETAILED_DATA[schemeId] || null;
}
