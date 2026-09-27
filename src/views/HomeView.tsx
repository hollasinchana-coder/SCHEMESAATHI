import React, { useState, useRef, useMemo } from 'react';
import { HERO_PORTRAIT_URL, MOCK_SCHEMES } from '../data/mockData';
import { CitizenProfile, Scheme } from '../types';
import { evaluateEligibility, EligibilityResult, EvaluatedScheme } from '../utils/eligibilityEngine';
import { useLanguage } from '../i18n/LanguageContext';
import { SchemeInformationModal } from '../components/SchemeInformationModal';
import { VoiceEligibilityPlayer } from '../components/VoiceEligibilityPlayer';
import { buildHomeEligibilitySpeechUnits } from '../utils/voiceEligibilityReader';
import { getRAGTranslation } from '../i18n/ragTranslations';

interface HomeViewProps {
  onNavigate: (view: string, categoryId?: string) => void;
  onOpenVoice: () => void;
  onRunDiscovery?: (profile: CitizenProfile) => void;
  simpleMode: boolean;
  profile: CitizenProfile;
  setProfile: React.Dispatch<React.SetStateAction<CitizenProfile>>;
  evaluationResult: EligibilityResult | null;
  setEvaluationResult: (result: EligibilityResult | null) => void;
  hasEvaluated: boolean;
  setHasEvaluated: (val: boolean) => void;
  appliedSchemeIds: string[];
  setAppliedSchemeIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenVoice,
  simpleMode,
  profile,
  setProfile,
  evaluationResult,
  setEvaluationResult,
  hasEvaluated,
  setHasEvaluated,
  appliedSchemeIds,
  setAppliedSchemeIds,
}) => {
  const { language, setLanguage, t, getSchemeTitle, getSchemeDescription, getSchemeBenefit, getSchemeDocuments, formatCurrencyText } = useLanguage();
  const ragT = getRAGTranslation(language);

  // Local interaction states
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [infoAgentScheme, setInfoAgentScheme] = useState<Scheme | null>(null);
  const [infoAgentTab, setInfoAgentTab] = useState<'overview' | 'documents' | 'procedure'>('documents');
  const [activeSpeakingSchemeId, setActiveSpeakingSchemeId] = useState<string | null>(null);

  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  // Compute speech units dynamically whenever evaluationResult or language changes
  const homeSpeechUnits = useMemo(() => {
    if (!evaluationResult) return [];
    return buildHomeEligibilitySpeechUnits(
      evaluationResult.eligibleSchemes,
      language,
      {
        getSchemeTitle,
        getSchemeDescription,
        getSchemeBenefit,
        getSchemeDocuments,
      }
    );
  }, [evaluationResult, language, getSchemeTitle, getSchemeDescription, getSchemeBenefit, getSchemeDocuments]);

  // Perform deterministic eligibility check
  const handleCheckEligibility = () => {
    setIsEvaluating(true);

    setTimeout(() => {
      const result = evaluateEligibility(profile, MOCK_SCHEMES, language);
      setEvaluationResult(result);
      setIsEvaluating(false);
      setHasEvaluated(true);

      // Smooth scroll to results
      setTimeout(() => {
        if (resultsSectionRef.current) {
          resultsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 600);
  };

  // Presets for instant testing of required test cases
  const applyPreset = (preset: 'test1' | 'test2' | 'test3') => {
    if (preset === 'test1') {
      // Qualifies for multiple schemes (PM-Kisan, Krishi Sinchayee, KCC, PM Awas)
      setProfile({
        fullName: 'Ramesh Kumar Patil',
        age: 44,
        gender: 'Male',
        mobile: '+91 98765 43210',
        otp: '4819',
        isOtpVerified: true,
        state: 'Karnataka',
        district: 'Haveri',
        occupation: 'Farmer / Agriculture',
        annualIncome: 150000,
        aadhaarLastFour: '8921',
        landHoldingAcres: 2.0,
        landType: 'Irrigated',
        casteCategory: 'OBC',
        rationCardStatus: 'BPL',
        hasDisability: false,
        isStudentEnrolled: false,
      });
    } else if (preset === 'test2') {
      // Qualifies for exactly ONE scheme (NMMS Central Scholarship)
      setProfile({
        fullName: 'Rahul Deshmukh',
        age: 19,
        gender: 'Male',
        mobile: '+91 98111 22334',
        otp: '5512',
        isOtpVerified: true,
        state: 'Maharashtra',
        district: 'Pune',
        occupation: 'Student',
        annualIncome: 300000,
        aadhaarLastFour: '4412',
        landHoldingAcres: 0,
        casteCategory: 'General',
        rationCardStatus: 'APL',
        hasDisability: false,
        isStudentEnrolled: true,
        educationLevel: 'Undergraduate',
      });
    } else if (preset === 'test3') {
      // Qualifies for ZERO schemes (Age 75 or High Income Daily Wage Worker)
      setProfile({
        fullName: 'Vikramaditya Rao',
        age: 75,
        gender: 'Male',
        mobile: '+91 99000 88776',
        otp: '9012',
        isOtpVerified: true,
        state: 'Karnataka',
        district: 'Bengaluru Rural',
        occupation: 'Daily Wage / Construction Worker',
        annualIncome: 850000, // Exceeds all worker limits and Awas limits
        aadhaarLastFour: '3109',
        landHoldingAcres: 0,
        casteCategory: 'General',
        rationCardStatus: 'None',
        hasDisability: false,
        isStudentEnrolled: false,
      });
    }
    setHasEvaluated(false);
    setEvaluationResult(null);
  };

  const occupations = [
    { id: 'farmer', title: 'Farmer / Agriculture', label: t.farmerOcc, emoji: '🌾' },
    { id: 'student', title: 'Student', label: t.studentOcc, emoji: '🎓' },
    { id: 'worker', title: 'Daily Wage / Construction Worker', label: t.workerOcc, emoji: '👷' },
    { id: 'artisan', title: 'Self-employed / Artisan', label: t.artisanOcc, emoji: '💼' },
    { id: 'women', title: 'Homemaker / Women', label: t.homemakerOcc, emoji: '👩' },
    { id: 'unemployed', title: 'Unemployed', label: t.unemployedOcc, emoji: '📋' },
  ];

  // Robust string state for Acres input so typing 1, 1.5, 2, 2.5, 3, 5, 10 is completely smooth
  const [acresInputString, setAcresInputString] = useState<string>(() => {
    const val = profile.landHoldingAcres ?? 2.0;
    return val > 0 ? String(val) : '2.0';
  });

  // Keep acresInputString synchronized when profile updates externally (e.g. presets)
  React.useEffect(() => {
    if (profile.landHoldingAcres !== undefined && profile.landHoldingAcres > 0) {
      if (parseFloat(acresInputString) !== profile.landHoldingAcres) {
        setAcresInputString(String(profile.landHoldingAcres));
      }
    } else if (profile.landHoldingAcres === 0 && acresInputString !== '0') {
      setAcresInputString('0');
    }
  }, [profile.landHoldingAcres]);

  const hasLand = (profile.landHoldingAcres ?? 0) > 0;

  return (
    <div className={`w-full ${simpleMode ? 'text-lg' : ''}`}>
      {/* Decorative ambient orbs */}
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-primary-fixed/20 blur-3xl"></div>
        <div className="pointer-events-none absolute top-96 left-[-10%] h-[32rem] w-[32rem] rounded-full bg-secondary-fixed/30 blur-3xl"></div>

        {/* 1. Hero Section (Compact 2-Column Layout) */}
        <section className="relative w-full px-4 sm:px-6 lg:px-8 pt-3 pb-3 sm:py-4">
          <div className="mx-auto max-w-7xl">
            {/* Metadata row: Single source, no duplicate initiative banner */}
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-mono text-xs font-bold text-primary tracking-wide">
                {t.liveSyncCount}
              </span>
            </div>

            {/* Main Title & Two-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
              {/* Left Column: Heading, Description, CTAs */}
              <div className="lg:col-span-7 flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-black text-on-surface tracking-tight leading-[1.12]">
                  {t.heroTitlePre} <span className="text-primary font-black">{t.heroTitleHighlight}</span>
                </h1>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                  {t.heroSubtitle}
                </p>

                {/* Primary & Secondary Action CTAs */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (formSectionRef.current) {
                        formSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm shadow-md hover:bg-primary-container transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px]">verified</span>
                    <span>{t.checkEligibilityCta}</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('rag-finder')}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px]">manage_search</span>
                    <span>{ragT.ragFinderNav}</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/20 uppercase font-semibold">
                      {ragT.geminiRagBadge}
                    </span>
                  </button>

                  <button
                    onClick={onOpenVoice}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-all border border-outline-variant/30 text-xs sm:text-sm font-semibold cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[17px] text-secondary">mic</span>
                    <span>{t.speakToSchemeSaathi}</span>
                  </button>
                </div>

                {/* Vernacular Dialects Indicator */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                    {t.voiceSupportedIn}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-primary-fixed/30 text-primary text-[10px] font-bold">
                    22 Languages
                  </span>
                  {[
                    { code: 'kn' as const, label: 'ಕನ್ನಡ' },
                    { code: 'hi' as const, label: 'हिंदी' },
                    { code: 'ta' as const, label: 'தமிழ்' },
                    { code: 'te' as const, label: 'తెలుగు' },
                    { code: 'bn' as const, label: 'বাংলা' },
                    { code: 'mr' as const, label: 'मराठी' },
                    { code: 'en' as const, label: 'English' },
                  ].map((tag) => (
                    <button
                      key={tag.code}
                      type="button"
                      onClick={() => setLanguage(tag.code)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                        language === tag.code
                          ? 'bg-primary text-on-primary font-bold shadow-xs'
                          : 'bg-surface-container-high text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Hero Visual Card (Compact & Balanced) */}
              <div className="lg:col-span-5 flex flex-col gap-2">
                <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant/30 p-1">
                  <img
                    src={HERO_PORTRAIT_URL}
                    alt="Indian Citizen Welfare Discovery"
                    className="w-full h-36 sm:h-44 object-cover rounded-lg"
                  />
                </div>

                {/* Metric Strip (Compact) */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 shadow-xs">
                    <span className="text-[9px] font-mono uppercase text-on-surface-variant block">
                      {t.avgBenefitDiscovered}
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-primary font-bold">
                      {t.avgBenefitValue}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 shadow-xs">
                    <span className="text-[9px] font-mono uppercase text-on-surface-variant block">
                      {t.applicationCycleTime}
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-secondary font-bold">
                      {t.applicationCycleValue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Embedded User Details & Profile Intake Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4" id="quick-discovery" ref={formSectionRef}>
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl bg-surface-container-lowest p-3.5 sm:p-5 shadow-sm border border-outline-variant/30">
              {/* RAG Knowledge Base Callout Banner */}
              <div className="mb-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-500/30 p-2.5 sm:p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">manage_search</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-on-surface">
                        {ragT.ragBannerTitle}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono text-[9px] font-bold">
                        schemes_clean.csv
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {ragT.ragBannerSubtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('rag-finder')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <span>{ragT.launchRagFinder}</span>
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </button>
              </div>

              {/* Section Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-3 bg-surface-container-low/50 p-2.5 sm:p-3 rounded-xl border border-outline-variant/20">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    <span className="font-mono text-[10px] text-primary uppercase font-bold tracking-wider">
                      {t.citizenIntakeBadge}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-on-surface leading-tight">
                    {t.profileTitle}
                  </h2>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {t.profileSubtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenVoice}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-highest text-primary text-xs font-semibold hover:bg-surface-container transition-all self-start sm:self-auto border border-outline-variant/30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">mic</span>
                  <span>{t.voiceAssistant}</span>
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCheckEligibility();
                }}
                className="space-y-4"
              >
                {/* Row 1: Name, Age, Gender */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-6 flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                      <span>{t.fullNameLabel}</span>
                      <span
                        onClick={onOpenVoice}
                        className="material-symbols-outlined text-primary text-[16px] cursor-pointer hover:scale-110 transition-transform"
                        title="Dictate name"
                      >
                        mic
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                        person
                      </span>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                        required
                        className="w-full h-10 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface text-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-xs transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                      <span>{t.ageLabel}</span>
                      <span
                        onClick={onOpenVoice}
                        className="material-symbols-outlined text-primary text-[16px] cursor-pointer hover:scale-110 transition-transform"
                      >
                        mic
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                        calendar_today
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="110"
                        value={profile.age}
                        onChange={(e) => setProfile((p) => ({ ...p, age: Number(e.target.value) }))}
                        required
                        className="w-full h-10 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface text-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-xs transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">{t.genderLabel}</label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                        wc
                      </span>
                      <select
                        value={profile.gender}
                        onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value as 'Male' | 'Female' | 'Other' }))}
                        className="w-full h-10 pl-10 pr-8 rounded-lg bg-surface-container-low text-on-surface text-sm appearance-none focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-xs transition-all font-medium cursor-pointer"
                      >
                        <option value="Male">{t.male}</option>
                        <option value="Female">{t.female}</option>
                        <option value="Other">{t.other}</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 text-on-surface-variant pointer-events-none text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Category / Caste & State & District */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Category / Caste */}
                  <div className="sm:col-span-4 flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">
                      {t.casteCategoryLabel}
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                        category
                      </span>
                      <select
                        value={profile.casteCategory || 'General'}
                        onChange={(e) => setProfile((p) => ({ ...p, casteCategory: e.target.value as any }))}
                        className="w-full h-10 pl-10 pr-8 rounded-lg bg-surface-container-low text-on-surface text-sm appearance-none focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-xs font-medium cursor-pointer"
                      >
                        <option value="General">{t.general}</option>
                        <option value="OBC">{t.obc}</option>
                        <option value="SC">{t.sc}</option>
                        <option value="ST">{t.st}</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 text-on-surface-variant pointer-events-none text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* State */}
                  <div className="sm:col-span-4 flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">
                      {t.stateLabel}
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                        map
                      </span>
                      <select
                        value={profile.state}
                        onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
                        className="w-full h-10 pl-10 pr-8 rounded-lg bg-surface-container-low text-on-surface text-sm appearance-none focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-xs font-medium cursor-pointer"
                      >
                        <option value="Karnataka">Karnataka (ಕರ್ನಾಟಕ)</option>
                        <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                        <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                        <option value="Bihar">Bihar (बिहार)</option>
                        <option value="Tamil Nadu">Tamil Nadu (தமிழ்நாடு)</option>
                        <option value="Rajasthan">Rajasthan (राजस्थान)</option>
                        <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                        <option value="West Bengal">West Bengal (পশ্চিমবঙ্গ)</option>
                        <option value="Telangana">Telangana (తెలంగాణ)</option>
                        <option value="Kerala">Kerala (കേരളം)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 text-on-surface-variant pointer-events-none text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* District */}
                  <div className="sm:col-span-4 flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">
                      {t.districtLabel}
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                        location_city
                      </span>
                      <input
                        type="text"
                        value={profile.district}
                        onChange={(e) => setProfile((p) => ({ ...p, district: e.target.value }))}
                        placeholder="e.g. Haveri, Dharwad, Pune"
                        className="w-full h-10 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface text-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Primary Occupation Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">
                    {t.occupationLabel}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {occupations.map((occ) => {
                      const isSelected = profile.occupation === occ.title;
                      return (
                        <button
                          key={occ.id}
                          type="button"
                          onClick={() => {
                            setProfile((p) => ({
                              ...p,
                              occupation: occ.title,
                              landHoldingAcres: occ.id === 'farmer' ? (p.landHoldingAcres && p.landHoldingAcres > 0 ? p.landHoldingAcres : 2.0) : 0,
                              isStudentEnrolled: occ.id === 'student' ? true : p.isStudentEnrolled,
                              gender: occ.id === 'women' ? 'Female' : p.gender,
                            }));
                          }}
                          className={`p-2 rounded-lg flex flex-col items-center justify-center text-center gap-1 transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-on-primary shadow-xs border-primary'
                              : 'bg-surface-container-low text-on-surface hover:bg-surface-container border-outline-variant/20'
                          }`}
                        >
                          <span className="text-xl">{occ.emoji}</span>
                          <span className="text-[11px] font-bold leading-tight">{occ.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Row 4: Land Ownership & Details */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">landscape</span>
                    <div>
                      <span className="text-xs font-semibold text-on-surface block">
                        {t.cultivableLandTitle}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        {t.landSubtext}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-surface-container-lowest p-0.5 rounded-lg border border-outline-variant/30">
                      <button
                        type="button"
                        onClick={() => {
                          const val = (profile.landHoldingAcres && profile.landHoldingAcres > 0) ? profile.landHoldingAcres : 2.0;
                          setAcresInputString(String(val));
                          setProfile((p) => ({
                            ...p,
                            landHoldingAcres: val,
                          }));
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          hasLand ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {t.yesBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAcresInputString('0');
                          setProfile((p) => ({ ...p, landHoldingAcres: 0 }));
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          !hasLand ? 'bg-error text-on-error shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {t.noBtn}
                      </button>
                    </div>

                    {hasLand && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded-lg border border-outline-variant/30">
                          <input
                            id="landAcresInput"
                            type="number"
                            step="any"
                            min="0"
                            max="1000"
                            value={acresInputString}
                            onChange={(e) => {
                              const raw = e.target.value;
                              setAcresInputString(raw);
                              const parsed = parseFloat(raw);
                              const num = isNaN(parsed) ? 0 : parsed;
                              setProfile((p) => ({ ...p, landHoldingAcres: num }));
                            }}
                            className="w-16 text-center text-xs font-bold text-primary focus:outline-none"
                          />
                          <span className="text-[11px] font-semibold text-on-surface-variant">{t.acresUnit}</span>
                        </div>

                        {/* Irrigated vs Dry Land Toggle */}
                        <div className="flex items-center gap-0.5 bg-surface-container-lowest p-0.5 rounded-lg border border-outline-variant/30 text-xs">
                          <button
                            type="button"
                            onClick={() => setProfile((p) => ({ ...p, landType: 'Irrigated' }))}
                            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                              profile.landType !== 'Dry' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                          >
                            {t.irrigatedLand}
                          </button>
                          <button
                            type="button"
                            onClick={() => setProfile((p) => ({ ...p, landType: 'Dry' }))}
                            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                              profile.landType === 'Dry' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                          >
                            {t.dryLand}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 5: Economic Status (Ration Card) & Disability Status */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Ration Card Status */}
                  <div className="sm:col-span-8 flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">
                      {t.rationCardLabel}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'BPL', label: t.rationBpl },
                        { id: 'APL', label: t.rationApl },
                        { id: 'Antyodaya', label: t.rationAntyodaya },
                        { id: 'None', label: t.rationNone },
                      ].map((item) => {
                        const isSelected = (profile.rationCardStatus || 'BPL') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setProfile((p) => ({ ...p, rationCardStatus: item.id as any }))}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-on-primary border-primary shadow-xs'
                                : 'bg-surface-container-low text-on-surface border-outline-variant/20 hover:bg-surface-container'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Disability Status */}
                  <div className="sm:col-span-4 flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">
                      {t.disabilityLabel}
                    </label>
                    <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30 h-9">
                      <button
                        type="button"
                        onClick={() => setProfile((p) => ({ ...p, hasDisability: true }))}
                        className={`flex-1 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          profile.hasDisability ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {t.yes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfile((p) => ({ ...p, hasDisability: false }))}
                        className={`flex-1 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          !profile.hasDisability ? 'bg-surface-container-high text-on-surface font-semibold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {t.no}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 6: Student Enrollment (conditional/available) */}
                {(profile.occupation === 'Student' || profile.isStudentEnrolled) && (
                  <div className="p-3 rounded-xl bg-surface-container-low border border-primary/20 space-y-2 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-primary block">
                          🎓 {t.studentEnrollmentLabel}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {t.currentlyEnrolled}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-surface-container-lowest p-0.5 rounded-lg border border-outline-variant/30">
                        <button
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, isStudentEnrolled: true }))}
                          className={`px-2.5 py-0.5 text-xs font-bold rounded-md cursor-pointer ${
                            profile.isStudentEnrolled !== false ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                          }`}
                        >
                          {t.yes}
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, isStudentEnrolled: false }))}
                          className={`px-2.5 py-0.5 text-xs font-bold rounded-md cursor-pointer ${
                            profile.isStudentEnrolled === false ? 'bg-error text-on-error' : 'text-on-surface-variant'
                          }`}
                        >
                          {t.no}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 pt-0.5">
                      <label className="text-[11px] font-bold text-on-surface uppercase font-mono">
                        {t.educationLevelLabel}
                      </label>
                      <select
                        value={profile.educationLevel || 'Undergraduate'}
                        onChange={(e) => setProfile((p) => ({ ...p, educationLevel: e.target.value }))}
                        className="h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface text-xs border border-outline-variant/30 font-medium"
                      >
                        <option value="School">{t.eduSchool}</option>
                        <option value="Higher Secondary">{t.eduHigherSecondary}</option>
                        <option value="Undergraduate">{t.eduUndergrad}</option>
                        <option value="Postgraduate">{t.eduPostgrad}</option>
                        <option value="Vocational">{t.eduVocational}</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Row 7: Annual Family Income (Exact Number Input + Slider + Quick Presets) */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="text-xs font-semibold text-on-surface">
                      {t.incomeLabel}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-on-surface-variant">{t.incomeDirectInputLabel}</span>
                      <div className="relative flex items-center">
                        <span className="absolute left-2.5 text-xs font-bold text-primary">₹</span>
                        <input
                          type="number"
                          step="5000"
                          min="10000"
                          max="2500000"
                          value={profile.annualIncome ?? 150000}
                          onChange={(e) => setProfile((p) => ({ ...p, annualIncome: Number(e.target.value) }))}
                          className="h-8 pl-6 pr-2 w-32 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-bold border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="20000"
                    max="1000000"
                    step="10000"
                    value={profile.annualIncome ?? 150000}
                    onChange={(e) => setProfile((p) => ({ ...p, annualIncome: Number(e.target.value) }))}
                    className="w-full accent-primary h-1.5 bg-surface-container-highest rounded cursor-pointer"
                  />

                  <div className="flex items-center justify-between font-mono text-[10px] text-on-surface-variant">
                    <span>{t.bplMarker}</span>
                    <span>{t.obcMarker}</span>
                    <span>{t.highIncomeMarker}</span>
                  </div>
                </div>

                {/* Compact Check Eligibility Button */}
                <div className="pt-1.5">
                  <button
                    id="checkEligibilityBtn"
                    type="submit"
                    disabled={isEvaluating}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-primary text-on-primary text-sm sm:text-base font-bold shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 hover:scale-[1.005] cursor-pointer"
                  >
                    {isEvaluating ? (
                      <>
                        <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                        <span>{t.checkingEligibility}</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">verified</span>
                        <span>{t.checkEligibilityBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* RESULTS SECTION */}
            <div id="resultsSection" ref={resultsSectionRef} className="mt-4 sm:mt-5">
              {isEvaluating && (
                <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-center space-y-2.5 shadow-xs">
                  <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
                    refresh
                  </span>
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-on-surface">{t.checkingEligibility}</h3>
                    <p className="text-xs text-on-surface-variant">
                      {t.checkingSub}
                    </p>
                  </div>
                </div>
              )}

              {!isEvaluating && hasEvaluated && evaluationResult && (
                <div className="space-y-3.5 animate-fade-in">
                  {/* Result Summary Header */}
                  <div className="p-3 sm:p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high text-[11px] font-mono font-bold text-primary">
                          <span className="material-symbols-outlined text-[14px]">task_alt</span>
                          {t.eligibilityCheckComplete}
                        </span>
                        <span className="font-mono text-[10px] text-on-surface-variant">
                          {t.evaluatedAt} {evaluationResult.evaluatedAt}
                        </span>
                      </div>

                      <div className="mt-1.5">
                        {evaluationResult.eligibleSchemes.length > 0 ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-primary font-mono">
                              {evaluationResult.eligibleSchemes.length}
                            </span>
                            <h2 className="text-base sm:text-lg font-extrabold text-on-surface">
                              {language === 'kn'
                                ? (evaluationResult.eligibleSchemes.length === 1
                                    ? 'ನೀವು ೧ ಯೋಜನೆಗೆ ಅರ್ಹರಾಗಿದ್ದೀರಿ.'
                                    : `ನೀವು ${evaluationResult.eligibleSchemes.length} ಯೋಜನೆಗಳಿಗೆ ಅರ್ಹರಾಗಿದ್ದೀರಿ.`)
                                : language === 'hi'
                                ? (evaluationResult.eligibleSchemes.length === 1
                                    ? 'आप 1 योजना के लिए पात्र हैं।'
                                    : `आप ${evaluationResult.eligibleSchemes.length} योजनाओं के लिए पात्र हैं।`)
                                : (evaluationResult.eligibleSchemes.length === 1
                                    ? 'You are eligible for 1 scheme.'
                                    : `You are eligible for ${evaluationResult.eligibleSchemes.length} schemes.`)}
                            </h2>
                          </div>
                        ) : (
                          <h2 className="text-base sm:text-lg font-extrabold text-error">
                            {t.noEligibleFoundTitle}
                          </h2>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (formSectionRef.current) {
                            formSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold border border-outline-variant/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                        <span>{t.updateMyProfile}</span>
                      </button>
                    </div>
                  </div>

                  {/* Multilingual Voice Output Player for Eligibility Results */}
                  <VoiceEligibilityPlayer
                    speechUnits={homeSpeechUnits}
                    language={language}
                    onActiveSchemeChange={setActiveSpeakingSchemeId}
                    sourceContextTitle="Eligibility Results"
                  />

                  {/* CASE 1 & 2: ONE OR MORE ELIGIBLE SCHEMES */}
                  {evaluationResult.eligibleSchemes.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-extrabold text-on-surface tracking-tight uppercase font-mono flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-tertiary animate-pulse"></span>
                          {t.yourEligibleSchemes}
                        </h3>
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          {t.showingEntitlements} ({evaluationResult.eligibleSchemes.length})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {evaluationResult.eligibleSchemes.map((item) => {
                          const docs = getSchemeDocuments(item.scheme);
                          const isSpeakingThisScheme = activeSpeakingSchemeId === item.scheme.id;
                          return (
                            <div
                              key={item.scheme.id}
                              id={`scheme-card-${item.scheme.id}`}
                              className={`rounded-xl bg-surface-container-lowest p-3.5 sm:p-4 shadow-xs border-2 transition-all flex flex-col justify-between space-y-2.5 h-auto ${
                                isSpeakingThisScheme
                                  ? 'border-primary ring-2 ring-primary/40 shadow-md bg-primary-fixed/5'
                                  : 'border-tertiary/40 hover:border-tertiary'
                              }`}
                            >
                              <div className="space-y-2.5">
                                {/* Title and Category */}
                                <div>
                                  <div className="flex items-center justify-between gap-1.5 mb-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-bold font-mono text-tertiary bg-tertiary-fixed/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-tertiary"></span>
                                        {t.eligibleBadge}
                                      </span>
                                      {item.scheme.dbtEnabled && (
                                        <span className="font-mono text-[9px] uppercase font-bold text-primary bg-primary-fixed/30 px-1.5 py-0.5 rounded-md">
                                          {t.dbtDirectBadge}
                                        </span>
                                      )}
                                    </div>

                                    {/* Spoken reading active pill */}
                                    {isSpeakingThisScheme && (
                                      <span className="font-mono text-[9px] uppercase font-bold text-primary bg-primary-fixed/50 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse border border-primary/30">
                                        <span className="material-symbols-outlined text-[13px]">volume_up</span>
                                        <span>Reading</span>
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="text-sm sm:text-base font-bold text-on-surface leading-snug">
                                    🟢 {getSchemeTitle(item.scheme)}
                                  </h4>
                                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">
                                    {getSchemeDescription(item.scheme)}
                                  </p>
                                </div>

                                {/* Why you're eligible section */}
                                <div className="p-2.5 rounded-lg bg-tertiary-fixed/15 border border-tertiary/20 space-y-1">
                                  <span className="font-mono text-[10px] text-tertiary font-bold uppercase tracking-wider block">
                                    {t.whyEligibleHeading}
                                  </span>
                                  <ul className="space-y-0.5 text-[11px] text-on-surface">
                                    {item.reasons.map((r, idx) => (
                                      <li key={idx} className="flex items-start gap-1">
                                        <span className="material-symbols-outlined text-tertiary text-[14px] mt-0.5 flex-shrink-0">
                                          check_circle
                                        </span>
                                        <span className="leading-snug">{r}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Main Benefit */}
                                <div className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/20">
                                  <span className="text-[9px] font-mono uppercase text-on-surface-variant font-bold block">
                                    {t.benefitLabel}
                                  </span>
                                  <div className="text-xs sm:text-sm font-extrabold text-primary mt-0.5">
                                    {getSchemeBenefit(item.scheme)}
                                  </div>
                                </div>

                                {/* Required Documents */}
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-mono uppercase text-on-surface-variant font-bold block">
                                    {t.requiredDocumentsLabel}
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {docs.map((doc, dIdx) => (
                                      <span
                                        key={dIdx}
                                        className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface text-[10px] font-medium"
                                      >
                                        {doc}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Card Action Buttons */}
                              <div className="pt-2 border-t border-outline-variant/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInfoAgentScheme(item.scheme);
                                    setInfoAgentTab('overview');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-primary bg-primary-fixed/20 hover:bg-primary-fixed/40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[14px]">info</span>
                                  <span>{t.viewDetailsBtn}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setInfoAgentScheme(item.scheme);
                                    setInfoAgentTab('documents');
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-on-primary hover:bg-primary-container shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer hover:scale-[1.01]"
                                >
                                  <span className="material-symbols-outlined text-[15px]">menu_book</span>
                                  <span>
                                    {language === 'kn'
                                      ? 'ದಾಖಲೆಗಳು ಮತ್ತು ಅರ್ಜಿ ಮಾರ್ಗದರ್ಶಿ'
                                      : language === 'hi'
                                      ? 'दस्तावेज और आवेदन गाइड'
                                      : 'Required Documents & Guide'}
                                  </span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CASE 3: ZERO ELIGIBLE SCHEMES */}
                  {evaluationResult.eligibleSchemes.length === 0 && (
                    <div className="p-5 sm:p-6 rounded-xl bg-surface-container-lowest border-2 border-outline-variant/30 text-center space-y-3 shadow-xs">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high mx-auto flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-[24px]">search_off</span>
                      </div>

                      <div className="space-y-1 max-w-lg mx-auto">
                        <h3 className="text-lg font-extrabold text-on-surface">
                          {t.noEligibleFoundTitle}
                        </h3>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {t.noEligibleFoundDesc}
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (formSectionRef.current) {
                              formSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit_note</span>
                          <span>{t.updateMyProfile}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Scheme Information Agent Modal */}
        <SchemeInformationModal
          scheme={infoAgentScheme}
          isOpen={!!infoAgentScheme}
          onClose={() => setInfoAgentScheme(null)}
          initialTab={infoAgentTab}
        />

        {/* Bottom Voice Interaction Floating Assistant Dock */}
        <div className="fixed bottom-5 right-5 z-40">
          <button
            onClick={onOpenVoice}
            type="button"
            className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-primary text-on-primary shadow-xl shadow-primary/30 hover:bg-primary-container transition-all hover:scale-105 cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-surface-container-lowest text-primary">
              <span className="material-symbols-outlined text-[17px]">mic</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-none">{t.voiceAssistant}</span>
              <span className="text-[10px] text-primary-fixed font-medium">22 Languages • Speak / Type</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
