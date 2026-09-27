import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { VoiceEligibilityPlayer } from '../components/VoiceEligibilityPlayer';
import { buildRAGEligibilitySpeechUnits } from '../utils/voiceEligibilityReader';
import { getRAGTranslation } from '../i18n/ragTranslations';

export interface RAGSchemeResult {
  schemeName: string;
  category: string;
  whoIsEligible: string;
  benefits: string;
  requiredDocuments: string[];
  howToApply: string;
  officialPortal: string;
  eligibilityMatchReason?: string;
}

export interface RAGSearchResponse {
  clarificationQuestion: string | null;
  missingField: string | null;
  officialDisclaimer: string;
  schemes: RAGSchemeResult[];
  retrievalMethod: string;
  totalEvaluated: number;
}

interface RAGSchemeFinderViewProps {
  onBack?: () => void;
  onOpenVoice?: () => void;
}

const INDIAN_STATES = [
  'All India',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const RAGSchemeFinderView: React.FC<RAGSchemeFinderViewProps> = ({ onBack }) => {
  const { t, language } = useLanguage();
  const ragT = getRAGTranslation(language);

  // Search Filter and Natural Query State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [naturalQuery, setNaturalQuery] = useState<string>('');

  // Citizen Profile Form State
  const [fullName, setFullName] = useState<string>('Ramesh Kumar');
  const [age, setAge] = useState<string>('44');
  const [gender, setGender] = useState<string>('Male');
  const [state, setState] = useState<string>('Karnataka');
  const [income, setIncome] = useState<string>('150000');
  const [occupation, setOccupation] = useState<string>('Farmer');
  const [studentStatus, setStudentStatus] = useState<string>('Not Enrolled');
  const [category, setCategory] = useState<string>('OBC');
  const [additionalDetails, setAdditionalDetails] = useState<string>('Owns 2.0 acres of cultivable agricultural land');

  // RAG Search State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<RAGSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSpeakingSchemeId, setActiveSpeakingSchemeId] = useState<string | null>(null);

  // Filtered schemes by active category filter
  const displayedSchemes = useMemo(() => {
    if (!results || !results.schemes) return [];
    if (selectedCategoryFilter === 'all') return results.schemes;
    const filterLower = selectedCategoryFilter.toLowerCase();
    return results.schemes.filter((s) => {
      const matchCat = s.category.toLowerCase().includes(filterLower);
      const matchName = s.schemeName.toLowerCase().includes(filterLower);
      const matchElig = s.whoIsEligible.toLowerCase().includes(filterLower);
      return matchCat || matchName || matchElig;
    });
  }, [results, selectedCategoryFilter]);

  // Compute RAG Speech units dynamically whenever displayed results or language change
  const ragSpeechUnits = useMemo(() => {
    if (!displayedSchemes || displayedSchemes.length === 0) return [];
    return buildRAGEligibilitySpeechUnits(displayedSchemes, language);
  }, [displayedSchemes, language]);

  // Clarification Handling
  const [clarificationAnswer, setClarificationAnswer] = useState<string>('');

  // Knowledge base modal and active file state
  const [showDatasetModal, setShowDatasetModal] = useState<boolean>(false);
  const [datasetRows, setDatasetRows] = useState<any[]>([]);
  const [isLoadingDataset, setIsLoadingDataset] = useState<boolean>(false);
  const [activeFilename, setActiveFilename] = useState<string>('schemes_clean.csv');
  const [activeSchemeCount, setActiveSchemeCount] = useState<number>(10);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync active dataset info on load
  const loadDatasetInfo = async () => {
    try {
      const res = await fetch('/api/rag/dataset');
      if (res.ok) {
        const data = await res.json();
        setActiveFilename(data.filePath || 'schemes_clean.csv');
        setActiveSchemeCount(data.count || (data.schemes ? data.schemes.length : 0));
        setDatasetRows(data.schemes || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadDatasetInfo();
  }, []);

  // Handle custom file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadSuccessMessage(null);

    try {
      const text = await file.text();
      const res = await fetch('/api/rag/upload-dataset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvContent: text,
          filename: file.name,
        }),
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      setActiveFilename(data.filename || file.name);
      setActiveSchemeCount(data.count);
      setUploadSuccessMessage(`Successfully uploaded "${data.filename || file.name}" with ${data.count} schemes. Only this file will be used for scheme discovery.`);
      setResults(null); // Clear previous results to guarantee only the uploaded file is queried
      await loadDatasetInfo();
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(err.message || 'Failed to upload dataset file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Reset to default dataset
  const handleResetDataset = async () => {
    setIsUploading(true);
    setError(null);
    try {
      const res = await fetch('/api/rag/reset-dataset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setActiveFilename(data.filename || 'schemes_clean.csv');
        setActiveSchemeCount(data.count);
        setUploadSuccessMessage('Reverted to default schemes_clean.csv');
        setResults(null);
        await loadDatasetInfo();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset dataset.');
    } finally {
      setIsUploading(false);
    }
  };

  // Hackathon Preset Profiles
  const loadPreset = (preset: 'farmer' | 'student' | 'women' | 'artisan' | 'missing_age') => {
    setError(null);
    setClarificationAnswer('');
    if (preset === 'farmer') {
      setFullName('Ramesh Kumar Patil');
      setAge('44');
      setGender('Male');
      setState('Karnataka');
      setIncome('150000');
      setOccupation('Farmer');
      setStudentStatus('Not Enrolled');
      setCategory('OBC');
      setAdditionalDetails('Small and marginal farmer with 2.0 acres cultivable land');
    } else if (preset === 'student') {
      setFullName('Sneha Deshmukh');
      setAge('19');
      setGender('Female');
      setState('Maharashtra');
      setIncome('240000');
      setOccupation('Student');
      setStudentStatus('Enrolled Student');
      setCategory('SC');
      setAdditionalDetails('Pursuing second year B.Sc degree in recognized college');
    } else if (preset === 'women') {
      setFullName('Sunita Devi');
      setAge('34');
      setGender('Female');
      setState('Bihar');
      setIncome('120000');
      setOccupation('Self-employed');
      setStudentStatus('Not Enrolled');
      setCategory('EWS');
      setAdditionalDetails('Member of rural Self-Help Group (SHG) seeking livelihood credit');
    } else if (preset === 'artisan') {
      setFullName('Mohammad Arif');
      setAge('38');
      setGender('Male');
      setState('Uttar Pradesh');
      setIncome('200000');
      setOccupation('Artisan / Craftsman');
      setStudentStatus('Not Enrolled');
      setCategory('OBC');
      setAdditionalDetails('Traditional carpenter working with hand tools seeking credit and toolkits');
    } else if (preset === 'missing_age') {
      // Intentionally empty age to demonstrate Gemini clarification flow
      setFullName('Vikram Singh');
      setAge('');
      setGender('Male');
      setState('Rajasthan');
      setIncome('250000');
      setOccupation('Student');
      setStudentStatus('Enrolled Student');
      setCategory('General');
      setAdditionalDetails('');
    }
  };

  // Perform RAG search
  const handleSearch = async (overrideClarification?: string) => {
    setIsLoading(true);
    setError(null);

    const payload = {
      profile: {
        fullName,
        age: age ? Number(age) : null,
        gender,
        state,
        income: income ? Number(income) : 0,
        occupation,
        studentStatus,
        category,
        additionalDetails,
      },
      clarificationAnswer: overrideClarification !== undefined ? overrideClarification : clarificationAnswer,
    };

    try {
      const res = await fetch('/api/rag/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned error status ${res.status}`);
      }

      const data: RAGSearchResponse = await res.json();
      setResults(data);
    } catch (err: any) {
      console.error('RAG search error:', err);
      setError(err.message || 'Failed to search schemes. Please check backend status.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dataset for inspection
  const fetchDataset = async () => {
    setIsLoadingDataset(true);
    try {
      const res = await fetch('/api/rag/dataset');
      const data = await res.json();
      setDatasetRows(data.schemes || []);
      setActiveFilename(data.filePath || 'schemes_clean.csv');
      setActiveSchemeCount(data.count || (data.schemes ? data.schemes.length : 0));
      setShowDatasetModal(true);
    } catch (err) {
      console.error('Failed to fetch dataset:', err);
    } finally {
      setIsLoadingDataset(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Hidden File Input for Custom Dataset Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv,text/plain"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Back & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold shadow-xs border border-outline-variant/30 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>{ragT.backToPortal}</span>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* File Upload Trigger */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Upload a custom schemes CSV file"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>{isUploading ? ragT.uploading : ragT.uploadSchemeFile}</span>
          </button>

          {/* Reset to Default Button if custom file is active */}
          {activeFilename !== 'schemes_clean.csv' && (
            <button
              onClick={handleResetDataset}
              disabled={isUploading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium border border-outline-variant/30 transition cursor-pointer"
              title="Reset to default schemes_clean.csv"
            >
              <span className="material-symbols-outlined text-[15px]">restart_alt</span>
              <span>{ragT.resetDefault}</span>
            </button>
          )}

          {/* Inspect Dataset Table */}
          <button
            onClick={fetchDataset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-primary text-xs font-semibold border border-primary/20 transition-all cursor-pointer"
            title="Inspect Grounding Knowledge Base"
          >
            <span className="material-symbols-outlined text-[16px]">database</span>
            <span>{ragT.inspectFileData} ({activeSchemeCount})</span>
          </button>
        </div>
      </div>

      {/* Upload Notification Banner */}
      {uploadSuccessMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-3.5 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
            <span className="font-semibold">{uploadSuccessMessage}</span>
          </div>
          <button
            onClick={() => setUploadSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Main Hero & Context Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-on-primary/15 text-[10px] font-mono font-semibold tracking-wider uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {ragT.strictEngineBadge}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {ragT.ragPageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-on-primary/90 leading-relaxed">
              {ragT.ragPageSubtitle}
            </p>
          </div>

          <div className="bg-surface-container-lowest/15 backdrop-blur-md p-3 rounded-lg border border-on-primary/20 text-xs space-y-1 flex-shrink-0">
            <div className="font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-amber-300">verified</span>
              <span>{ragT.zeroHallucinationCard}</span>
            </div>
            <div className="text-on-primary/80 text-[11px]">
              {ragT.activeFile} <span className="font-mono font-bold text-amber-200">{activeFilename}</span>
            </div>
            <div className="text-on-primary/80 text-[11px]">
              {ragT.indexedSchemes} <span className="font-mono font-bold">{activeSchemeCount} schemes</span>
            </div>
            <div className="text-on-primary/80 text-[11px]">
              {ragT.retriever} <span className="font-mono">Gemini File Search RAG</span>
            </div>
            <div className="text-on-primary/80 text-[11px]">
              {ragT.enforcement} <span className="text-emerald-300 font-semibold">{ragT.strictFileBounding}</span>
            </div>
          </div>
        </div>

        {/* Hackathon Preset Quick-Switchers */}
        <div className="mt-3.5 pt-3 border-t border-on-primary/20 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-on-primary/80 mr-1">{ragT.demoPresets}</span>
          <button
            onClick={() => loadPreset('farmer')}
            className="px-2 py-0.5 rounded bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30 text-[11px] font-medium transition cursor-pointer"
          >
            🌾 Ramesh (Farmer, ₹1.5L)
          </button>
          <button
            onClick={() => loadPreset('student')}
            className="px-2 py-0.5 rounded bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30 text-[11px] font-medium transition cursor-pointer"
          >
            🎓 Sneha (SC Student, ₹2.4L)
          </button>
          <button
            onClick={() => loadPreset('women')}
            className="px-2 py-0.5 rounded bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30 text-[11px] font-medium transition cursor-pointer"
          >
            👩 Sunita (Women SHG, ₹1.2L)
          </button>
          <button
            onClick={() => loadPreset('artisan')}
            className="px-2 py-0.5 rounded bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30 text-[11px] font-medium transition cursor-pointer"
          >
            🔨 Mohammad (Artisan, ₹2.0L)
          </button>
          <button
            onClick={() => loadPreset('missing_age')}
            className="px-2 py-0.5 rounded bg-amber-400 text-on-surface font-semibold text-[11px] shadow-xs hover:bg-amber-300 transition cursor-pointer"
            title="Demonstrates clarifying questions when required eligibility details are missing"
          >
            ❓ Clarification Test (Missing Age)
          </button>
        </div>
      </div>

      {/* Semantic Search Bar */}
      <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-xl shadow-xs border border-outline-variant/30 space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              placeholder="Describe your situation or scheme requirement in any language..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:outline-none text-xs sm:text-sm text-on-surface"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (naturalQuery.trim()) {
                    setAdditionalDetails((prev) => (prev ? `${prev}. ${naturalQuery}` : naturalQuery));
                  }
                  handleSearch();
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (naturalQuery.trim()) {
                setAdditionalDetails((prev) => (prev ? `${prev}. ${naturalQuery}` : naturalQuery));
              }
              handleSearch();
            }}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[17px]">search_insights</span>
            <span>{isLoading ? (ragT.searchingButton || 'Retrieving via Gemini RAG...') : 'Search Schemes via Gemini RAG'}</span>
          </button>
        </div>

        {/* Small Static Example (Visual guidance only; does not run search or alter input) */}
        <p className="text-xs text-on-surface-variant pl-1">
          Example: I am a small farmer with 2 acres. What government schemes can I apply for?
        </p>
      </div>

      {/* Main Grid: Profile Form (Left/Top) and Results (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Citizen Profile Form */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-xs border border-outline-variant/30 space-y-3">
          <div className="border-b border-outline-variant/20 pb-2">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
              <span>{ragT.citizenIntakeProfile}</span>
            </h2>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {ragT.citizenIntakeDesc} <code className="font-mono">{activeFilename}</code>.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-3 text-xs"
          >
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-on-surface mb-1">{ragT.fullName}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:outline-none text-sm"
              />
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  {ragT.age} <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 44"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">{ragT.gender}</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:outline-none text-sm"
                >
                  <option value="Male">{ragT.genderMale}</option>
                  <option value="Female">{ragT.genderFemale}</option>
                  <option value="Transgender">{ragT.genderTransgender}</option>
                  <option value="All">{ragT.genderAll}</option>
                </select>
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block font-semibold text-on-surface mb-1">{ragT.stateUt}</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:outline-none text-sm"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Annual Income */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-on-surface">{ragT.annualIncome}</label>
                <span className="text-[11px] font-mono text-primary font-bold">
                  ₹{Number(income || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:outline-none text-sm"
              />
              <div className="flex gap-1.5 mt-1.5">
                {['100000', '180000', '250000', '350000', '500000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setIncome(val)}
                    className="px-2 py-0.5 rounded-md bg-surface-container hover:bg-surface-container-high text-[10px] font-mono text-on-surface-variant cursor-pointer"
                  >
                    ₹{(Number(val) / 100000).toFixed(1)}L
                  </button>
                ))}
              </div>
            </div>

            {/* Occupation */}
            <div>
              <label className="block font-semibold text-on-surface mb-1">{ragT.occupation}</label>
              <select
                value={occupation}
                onChange={(e) => {
                  setOccupation(e.target.value);
                  if (e.target.value === 'Student') {
                    setStudentStatus('Enrolled Student');
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:outline-none text-sm"
              >
                <option value="Farmer">Farmer / Agriculture</option>
                <option value="Student">Student (School / College)</option>
                <option value="Unorganized Worker">Unorganized / Daily Wage Worker</option>
                <option value="Artisan / Craftsman">Artisan / Traditional Craftsman</option>
                <option value="Small Business / MSME">Small Business / MSME Entrepreneur</option>
                <option value="Self-employed">Self-employed / SHG Member</option>
                <option value="Homemaker">Homemaker</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Student Status & Social Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-on-surface mb-1">{ragT.studentStatus}</label>
                <select
                  value={studentStatus}
                  onChange={(e) => setStudentStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:outline-none text-sm"
                >
                  <option value="Not Enrolled">Not Enrolled</option>
                  <option value="Enrolled Student">Enrolled Student</option>
                  <option value="Any">Any / Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">{ragT.socialCategory}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:outline-none text-sm"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                  <option value="Minority">Minority</option>
                </select>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <label className="block font-semibold text-on-surface mb-1">
                {ragT.additionalDetails}
              </label>
              <textarea
                rows={2}
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder={ragT.additionalDetailsPlaceholder}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:outline-none text-xs"
              />
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>{ragT.searchingButton}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">search_insights</span>
                  <span>{ragT.searchButton}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Clarification Gate and Results Page */}
        <div className="lg:col-span-7 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-error-container text-on-error-container p-4 rounded-xl text-xs flex items-center gap-2 border border-error/20">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Clarification Gate (Requirement: If important info is missing, ask clarification instead of guessing) */}
          {results && results.clarificationQuestion && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 p-5 rounded-2xl shadow-sm space-y-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-amber-600 text-[24px]">contact_support</span>
                <div>
                  <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                    {ragT.clarificationTitle}
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                    {ragT.clarificationDesc}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-amber-200 text-xs font-semibold text-on-surface">
                &ldquo;{results.clarificationQuestion}&rdquo;
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={clarificationAnswer}
                  onChange={(e) => setClarificationAnswer(e.target.value)}
                  placeholder={ragT.clarificationPlaceholder}
                  className="flex-1 px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:outline-none text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleSearch(clarificationAnswer)}
                  disabled={!clarificationAnswer.trim() || isLoading}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {ragT.submitMatch}
                </button>
              </div>
            </div>
          )}

          {/* Results Container */}
          {results && !results.clarificationQuestion && (
            <div className="space-y-3">
              {/* Official Verification Disclaimer Banner (Mandatory Requirement) */}
              <div className="bg-surface-container-high border-l-4 border-primary p-3 rounded-lg shadow-xs space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[17px]">verified_user</span>
                  <span className="font-bold text-xs text-on-surface">
                    {ragT.verificationNotice}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  {results.officialDisclaimer}
                </p>
              </div>

              {/* Retrieval Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-on-surface-variant font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Retriever: {results.retrievalMethod}</span>
                </div>
                <div>
                  {ragT.eligibleSchemesFound} <strong className="text-primary">{displayedSchemes.length}</strong> / {results.totalEvaluated} {ragT.inDataset}
                </div>
              </div>

              {/* Multilingual Voice Output Player for RAG Search Results */}
              <VoiceEligibilityPlayer
                speechUnits={ragSpeechUnits}
                language={language}
                onActiveSchemeChange={setActiveSpeakingSchemeId}
                sourceContextTitle="RAG Search Results"
              />

              {/* Zero Results State */}
              {displayedSchemes.length === 0 && (
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 text-center space-y-2.5">
                  <span className="material-symbols-outlined text-[40px] text-outline">search_off</span>
                  <h3 className="text-base font-bold text-on-surface">{ragT.noEligibleFound}</h3>
                  <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                    {ragT.noEligibleFoundDesc}
                  </p>
                </div>
              )}

              {/* List of Recommended Schemes */}
              {displayedSchemes.map((scheme, idx) => {
                const isSpeakingThisScheme =
                  activeSpeakingSchemeId === scheme.schemeName || activeSpeakingSchemeId === `rag-${idx}`;
                return (
                  <div
                    key={idx}
                    className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl shadow-xs border-2 space-y-2.5 transition hover:shadow-sm ${
                      isSpeakingThisScheme
                        ? 'border-primary ring-2 ring-primary/40 shadow-md bg-primary-fixed/5'
                        : 'border-outline-variant/30'
                    }`}
                  >
                    {/* Scheme Header */}
                    <div className="flex flex-wrap items-start justify-between gap-1.5 border-b border-outline-variant/20 pb-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-wider">
                            {scheme.category}
                          </span>
                          {scheme.eligibilityMatchReason && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ {scheme.eligibilityMatchReason}
                            </span>
                          )}
                          {isSpeakingThisScheme && (
                            <span className="font-mono text-[9px] uppercase font-bold text-primary bg-primary-fixed/50 px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse border border-primary/30">
                              <span className="material-symbols-outlined text-[12px]">volume_up</span>
                              <span>{ragT.reading}</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-on-surface leading-snug">
                          {scheme.schemeName}
                        </h3>
                      </div>

                      <a
                        href={scheme.officialPortal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-bold transition cursor-pointer"
                      >
                        <span>{ragT.officialPortal}</span>
                        <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      </a>
                    </div>

                    {/* 1. Who is Eligible */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-primary">groups</span>
                        {ragT.whoIsEligible}
                      </span>
                      <p className="text-xs text-on-surface leading-relaxed bg-surface-container-low/50 p-2.5 rounded-xl border border-outline-variant/20">
                        {scheme.whoIsEligible}
                      </p>
                    </div>

                    {/* 2. Benefits */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600">payments</span>
                        {ragT.keyBenefits}
                      </span>
                      <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 leading-relaxed">
                        {scheme.benefits}
                      </p>
                    </div>

                    {/* 3. Required Documents */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-secondary">description</span>
                        {ragT.requiredDocuments}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {scheme.requiredDocuments.map((doc, dIdx) => (
                          <span
                            key={dIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high text-[11px] text-on-surface font-medium border border-outline-variant/30"
                          >
                            <span className="material-symbols-outlined text-[12px] text-primary">check_circle</span>
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 4. How to Apply */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-primary">how_to_reg</span>
                        {ragT.howToApply}
                      </span>
                      <p className="text-xs text-on-surface leading-relaxed bg-surface-container-low/50 p-2.5 rounded-xl border border-outline-variant/20 whitespace-pre-line">
                        {scheme.howToApply}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Initial Placeholder State when no search executed yet */}
          {!results && !isLoading && (
            <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[36px]">travel_explore</span>
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-on-surface">{ragT.readyToDiscover}</h3>
                <p className="text-xs text-on-surface-variant">
                  {ragT.readyToDiscoverDesc}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs hover:bg-primary-container transition cursor-pointer"
                >
                  {ragT.startDiscovery}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dataset Inspection Modal */}
      {showDatasetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-outline-variant/40 flex flex-col overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container">
              <div>
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">table_chart</span>
                  <span>{ragT.knowledgeBase} {activeFilename}</span>
                </h3>
                <p className="text-[11px] text-on-surface-variant">
                  {datasetRows.length} {ragT.authenticSchemesIndexed}
                </p>
              </div>
              <button
                onClick={() => setShowDatasetModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 text-xs">
              <div className="border border-outline-variant/30 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high border-b border-outline-variant/30 font-semibold text-on-surface text-[11px]">
                      <th className="p-2.5">Scheme Name</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">State</th>
                      <th className="p-2.5">Age Range</th>
                      <th className="p-2.5">Income Limit</th>
                      <th className="p-2.5">Occupation</th>
                      <th className="p-2.5">Official Portal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {datasetRows.map((row, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/50">
                        <td className="p-2.5 font-bold text-primary">{row.scheme_name}</td>
                        <td className="p-2.5">{row.category}</td>
                        <td className="p-2.5">{row.state}</td>
                        <td className="p-2.5">{row.min_age} - {row.max_age}</td>
                        <td className="p-2.5 font-mono">₹{Number(row.income_limit || 0).toLocaleString('en-IN')}</td>
                        <td className="p-2.5">{row.occupation}</td>
                        <td className="p-2.5">
                          <a
                            href={row.official_portal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary underline text-[11px]"
                          >
                            Link
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 border-t border-outline-variant/30 bg-surface-container-low flex justify-end">
              <button
                onClick={() => setShowDatasetModal(false)}
                className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold cursor-pointer"
              >
                {ragT.closeViewer}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
