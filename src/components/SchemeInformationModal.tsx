import React, { useState, useEffect } from 'react';
import { Scheme } from '../types';
import { getSchemeDetailedInfo, SchemeDocumentGuide } from '../data/schemeDocumentData';
import { useLanguage } from '../i18n/LanguageContext';

interface SchemeInformationModalProps {
  scheme: Scheme | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'overview' | 'documents' | 'procedure';
}

export const SchemeInformationModal: React.FC<SchemeInformationModalProps> = ({
  scheme,
  isOpen,
  onClose,
  initialTab = 'documents',
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'procedure'>(initialTab);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Before You Apply Interactive Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    hasDocs: false,
    nameMatch: false,
    npciSeeded: false,
    portalIdentified: true,
  });

  // Sync initial tab when modal opens or initialTab prop changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

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

  if (!isOpen || !scheme) return null;

  const detailedInfo = getSchemeDetailedInfo(scheme.id);

  // Fallback documents if specific scheme detailedInfo is not in map
  const fallbackDocs: SchemeDocumentGuide[] = scheme.documentsRequired.map((docName, idx) => ({
    id: `doc-${idx}`,
    name: docName,
    statusLabel: 'Required',
    whatIsIt: `Official ${docName} identifying the applicant and satisfying government welfare guidelines.`,
    whyNeeded: `Required by ${scheme.title} to authenticate applicant eligibility and verify demographic criteria.`,
    whereToGet: 'Relevant State Government Revenue Office, Issuing Portal, or Commercial Bank.',
    issuingAuthority: 'Authorized Government Department / Institution',
    howToPrepare: [
      'Procure an original copy or certified digital extract of the document.',
      'Ensure names, dates of birth, and identity numbers are clear and legible.',
      'Verify that the validity period has not expired.',
    ],
    whatToKeepReady: ['Current identity proof', 'Official reference number'],
    officialSourceUrl: scheme.officialUrl,
    officialSourceName: 'Official Portal',
  }));

  const docsToDisplay: SchemeDocumentGuide[] = detailedInfo?.documents || fallbackDocs;

  // Ensure an active document is selected by default
  const activeDoc = docsToDisplay.find((d) => d.id === selectedDocId) || docsToDisplay[0];

  const toggleChecklist = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const officialAppUrl = detailedInfo?.officialApplicationPortalUrl || scheme.officialUrl;
  const officialInfoSourceUrl = detailedInfo?.officialInformationSourceUrl || scheme.officialUrl;
  const officialInfoSourceName = detailedInfo?.officialInformationSourceName || 'myScheme.gov.in Official Source';
  const lastUpdated = detailedInfo?.lastUpdatedDate || 'September 2026';

  const handleOpenOfficialLink = () => {
    if (officialAppUrl && officialAppUrl.startsWith('http')) {
      window.open(officialAppUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const currentDocIndex = docsToDisplay.findIndex((d) => d.id === activeDoc?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-on-surface/60 backdrop-blur-sm animate-fade-in overflow-hidden">
      {/* 
        MODAL CONTAINER:
        - Width: approx 92–95% of viewport (w-[95vw] sm:w-[93vw])
        - Height: approx 90–94% of viewport (h-[92vh] sm:h-[91vh])
        - Large centered modal with rounded corners (rounded-3xl)
        - Modal stays fixed, only content area scrolls
      */}
      {/* 
        MODAL CONTAINER:
        - Width: approx 92–95% of viewport
        - Height: approx 90–92% of viewport
        - Centered modal with clean rounded-2xl
        - Modal stays fixed, only content area scrolls
      */}
      <div className="relative w-[96vw] max-w-6xl h-[92vh] max-h-[880px] rounded-2xl bg-surface-container-lowest shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden">

        {/* 
          TOP HEADER BAR (Compact ~48-52px):
          - Left: Back button
          - Center: Document name/title, Category, REQUIRED status
          - Right: Source: Official Government Information, Close Button
        */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center justify-between gap-2.5 flex-shrink-0 z-20">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <button
              onClick={onClose}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs shadow-xs border border-outline-variant/30 transition-all cursor-pointer flex-shrink-0"
              title="Go back"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>{t.back}</span>
            </button>

            <div className="flex items-center gap-1.5 overflow-hidden flex-wrap">
              <span className="font-bold text-on-surface text-xs sm:text-sm truncate max-w-[200px] sm:max-w-md">
                {activeTab === 'documents' && activeDoc ? activeDoc.name : (detailedInfo?.officialName || scheme.title)}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-primary-fixed/40 text-primary flex-shrink-0">
                {scheme.categoryLabel}
              </span>
              {activeTab === 'documents' && activeDoc && (
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded flex-shrink-0 ${
                  activeDoc.statusLabel === 'Required'
                    ? 'bg-secondary-fixed text-on-secondary-fixed'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {activeDoc.statusLabel === 'Required' ? 'REQUIRED' : activeDoc.statusLabel.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden lg:inline-block font-mono text-[11px] text-on-surface-variant font-medium">
              Source: Official Government Information
            </span>

            {/* X CLOSE BUTTON */}
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-all cursor-pointer shadow-xs border border-outline-variant/30"
              title="Close modal"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* 
          SCHEME SUB-HEADER & NAVIGATION TABS BAR (Compact ~40px):
          - Category badge, Informational disclaimer
          - 3 Core tabs: Overview & Benefits, Documents You Need, How to Apply & Checklist
        */}
        <div className="px-3 sm:px-6 py-2 border-b border-outline-variant/15 bg-surface-container-lowest flex-shrink-0 z-10 flex flex-wrap items-center justify-between gap-2">
          {/* Navigation Tabs (Compact 36-38px) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">overview</span>
              <span>Overview & Benefits</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">description</span>
              <span>Required Documents ({docsToDisplay.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('procedure')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'procedure'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">checklist</span>
              <span>How to Apply & Checklist</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-on-surface-variant font-mono">
            <span>{detailedInfo?.whoProvidesService || scheme.ministry}</span>
          </div>
        </div>

        {/* 
          MODAL SCROLLABLE BODY:
          - Only this content area scrolls vertically
          - Generous padding and spacing
          - Large, highly readable typography
        */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 md:p-10 space-y-8 bg-surface">

          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW & BENEFITS                               */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
              {/* Short Description */}
              <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 space-y-3 shadow-xs">
                <span className="text-xs font-mono font-bold uppercase text-primary tracking-wide block">
                  Official Scheme Summary
                </span>
                <h3 className="text-2xl sm:text-[26px] font-black text-on-surface leading-snug">
                  {detailedInfo?.officialName || scheme.title}
                </h3>
                <p className="text-base sm:text-[17px] text-on-surface leading-[1.65]">
                  {detailedInfo?.description || scheme.description}
                </p>
              </div>

              {/* Main Benefit Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-tertiary-fixed/15 border border-tertiary/30 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-tertiary text-[26px]">redeem</span>
                  <span className="text-xs font-mono font-bold uppercase text-tertiary tracking-wide">
                    Financial & Welfare Benefit
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-on-surface">
                  {detailedInfo?.benefitsSummary || scheme.benefitAmount}
                </div>
                {detailedInfo?.benefitDetails && (
                  <ul className="space-y-2 pt-3 border-t border-tertiary/20">
                    {detailedInfo.benefitDetails.map((b, idx) => (
                      <li key={idx} className="text-base sm:text-[17px] text-on-surface flex items-start gap-3 leading-[1.6]">
                        <span className="material-symbols-outlined text-tertiary text-[18px] mt-1 flex-shrink-0">check</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Eligibility Criteria */}
              <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 space-y-4 shadow-xs">
                <span className="text-lg sm:text-xl font-bold text-on-surface block">
                  Official Eligibility Criteria
                </span>
                <ul className="space-y-3">
                  {(detailedInfo?.eligibilityRequirements || scheme.eligibility).map((req, idx) => (
                    <li key={idx} className="text-base sm:text-[17px] text-on-surface flex items-start gap-3 leading-[1.6]">
                      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">check_circle</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Important Conditions */}
              {detailedInfo?.importantConditions && detailedInfo.importantConditions.length > 0 && (
                <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-4">
                  <span className="text-lg sm:text-xl font-bold text-secondary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    <span>Important Conditions & Exclusions</span>
                  </span>
                  <ul className="space-y-2.5">
                    {detailedInfo.importantConditions.map((cond, idx) => (
                      <li key={idx} className="text-base sm:text-[17px] text-on-surface flex items-start gap-3 leading-[1.6]">
                        <span className="text-secondary font-bold text-lg">•</span>
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Jump to Documents Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className="px-6 py-3.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-md hover:bg-primary-container transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
                >
                  <span>View Required Documents Guide</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: REQUIRED DOCUMENTS GUIDE (Compact 2-Column Layout)*/}
          {/* ======================================================== */}
          {activeTab === 'documents' && (
            <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-4">
              
              {/* COMPACT DOCUMENT SELECTOR */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                    DOCUMENT {currentDocIndex + 1} OF {docsToDisplay.length}
                  </span>
                  <span className="text-[11px] font-mono text-on-surface-variant">
                    Select a document to inspect requirements:
                  </span>
                </div>

                {/* Compact Selector Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {docsToDisplay.map((doc, idx) => {
                    const isSelected = doc.id === activeDoc?.id;
                    const docType = doc.documentType || (doc.name.toLowerCase().includes('aadhaar') ? 'Identity Document' : doc.name.toLowerCase().includes('land') ? 'Land Document' : doc.name.toLowerCase().includes('bank') ? 'Bank Record' : 'Official Document');
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-primary text-on-primary shadow-xs border-primary ring-1 ring-primary'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container border-outline-variant/25'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {idx + 1}
                        </span>
                        <span>{doc.name}</span>
                        {isSelected && <span className="text-[10px] font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COMPACT 2-COLUMN DOCUMENT CARD */}
              {activeDoc && (
                <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/30 shadow-xs space-y-4">
                  {/* Clean Document Header: Name | IDENTITY DOCUMENT | REQUIRED */}
                  <div className="border-b border-outline-variant/20 pb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-on-surface">
                          {activeDoc.name}
                        </h3>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
                          {activeDoc.name.toLowerCase().includes('aadhaar') ? 'IDENTITY DOCUMENT' : activeDoc.name.toLowerCase().includes('land') ? 'LAND RECORD' : activeDoc.name.toLowerCase().includes('bank') ? 'BANK RECORD' : 'REQUIRED RECORD'}
                        </span>
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          activeDoc.statusLabel === 'Required'
                            ? 'bg-secondary-fixed text-on-secondary-fixed'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {activeDoc.statusLabel === 'Required' ? 'REQUIRED' : activeDoc.statusLabel.toUpperCase()}
                        </span>
                      </div>
                      {activeDoc.nameVernacular && (
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          ({activeDoc.nameVernacular})
                        </p>
                      )}
                    </div>

                    <div className="text-xs text-on-surface-variant">
                      Issuing Authority: <strong className="text-on-surface">{activeDoc.issuingAuthority}</strong>
                    </div>
                  </div>

                  {/* 2-Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column (65%): What is it, Why required, Preparation Steps */}
                    <div className="lg:col-span-2 space-y-3">
                      {/* What is this document? */}
                      <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/15 space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">info</span>
                          <span>What is this document?</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
                          {activeDoc.whatIsIt}
                        </p>
                      </div>

                      {/* Why is it required? */}
                      <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/15 space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">help</span>
                          <span>Why is it required for this scheme?</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
                          {activeDoc.whyNeeded}
                        </p>
                      </div>

                      {/* Important Warning Notice */}
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                        <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">warning</span>
                        <div>
                          <strong>Important: </strong>
                          {activeDoc.commonMistakes && activeDoc.commonMistakes.length > 0
                            ? activeDoc.commonMistakes[0]
                            : 'Ensure details match exactly across your Aadhaar, bank records, and welfare applications.'}
                        </div>
                      </div>

                      {/* How do I get it ready? (Compact list) */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary text-[16px]">format_list_numbered</span>
                          <span>How to get it ready</span>
                        </h4>
                        <div className="space-y-1.5">
                          {activeDoc.howToPrepare.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/10 text-xs">
                              <span className="w-5 h-5 rounded bg-primary text-on-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <span className="text-on-surface leading-relaxed">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column (35%): Where to get, Quick verification, Source */}
                    <div className="space-y-3">
                      {/* Where to get */}
                      <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/15 space-y-1.5 text-xs">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          <span>Where can I get it?</span>
                        </h4>
                        <p className="text-on-surface font-medium leading-relaxed">
                          {activeDoc.whereToGet}
                        </p>
                      </div>

                      {/* Before you apply checklist */}
                      <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/15 space-y-2 text-xs">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-secondary text-[16px]">checklist</span>
                          <span>Before you apply</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs text-on-surface">
                          <li className="flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-primary text-[15px] shrink-0 mt-0.5">check_circle</span>
                            <span>Verify spelling of name across Aadhaar & Bank</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-primary text-[15px] shrink-0 mt-0.5">check_circle</span>
                            <span>Keep photocopies & original ready</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-primary text-[15px] shrink-0 mt-0.5">check_circle</span>
                            <span>Confirm mobile OTP linkage is active</span>
                          </li>
                        </ul>
                      </div>

                      {/* Official Source Link */}
                      {activeDoc.officialSourceUrl && (
                        <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 space-y-2 text-xs">
                          <div className="text-[11px] text-on-surface-variant">
                            Source: {activeDoc.officialSourceName}
                          </div>
                          <a
                            href={activeDoc.officialSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-colors"
                          >
                            <span>Open Official Source</span>
                            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compact Bottom Navigation Stepper */}
                  <div className="pt-3 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={currentDocIndex === 0}
                      onClick={() => setSelectedDocId(docsToDisplay[currentDocIndex - 1].id)}
                      className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-on-surface transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      <span>Previous</span>
                    </button>

                    {currentDocIndex < docsToDisplay.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setSelectedDocId(docsToDisplay[currentDocIndex + 1].id)}
                        className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Next: {docsToDisplay[currentDocIndex + 1].name}</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveTab('procedure')}
                        className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Proceed to How to Apply</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: APPLICATION PROCEDURE, CHECKLIST & OFFICIAL PORTAL */}
          {/* ======================================================== */}
          {activeTab === 'procedure' && (
            <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
              
              {/* Official Application Procedure */}
              {detailedInfo?.applicationProcedure && detailedInfo.applicationProcedure.length > 0 && (
                <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[24px]">account_tree</span>
                    <span className="text-lg sm:text-[20px] font-bold text-on-surface">
                      Official Application Procedure
                    </span>
                  </div>
                  <div className="space-y-3 pt-1">
                    {detailedInfo.applicationProcedure.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3.5 text-base sm:text-[17px] text-on-surface leading-[1.65]">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BEFORE YOU APPLY CHECKLIST */}
              <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-5">
                <div>
                  <h4 className="text-lg sm:text-[20px] font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[24px]">fact_check</span>
                    <span>Before You Apply Checklist</span>
                  </h4>
                  <p className="text-base text-on-surface-variant mt-1.5 leading-relaxed">
                    Review and verify each requirement to ensure you are fully prepared before applying on the official portal:
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'hasDocs', label: 'I have all required documents ready' },
                    { key: 'nameMatch', label: 'My name matches across Aadhaar and bank account' },
                    { key: 'npciSeeded', label: 'My bank account is Aadhaar-seeded / NPCI active' },
                    { key: 'portalIdentified', label: 'I know the official portal to apply on' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      onClick={() => toggleChecklist(item.key)}
                      className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checklist[item.key] || false}
                        onChange={() => {}}
                        className="w-5 h-5 accent-primary rounded cursor-pointer"
                      />
                      <span className={`text-base sm:text-[17px] leading-relaxed ${
                        checklist[item.key] ? 'line-through text-on-surface-variant font-medium' : 'text-on-surface font-semibold'
                      }`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>

                {allChecked ? (
                  <div className="p-4 rounded-2xl bg-tertiary-fixed/30 border border-tertiary/40 flex items-center gap-3 text-sm sm:text-base text-on-surface font-semibold">
                    <span className="material-symbols-outlined text-tertiary text-[22px]">check_circle</span>
                    <span>All checklist items confirmed! You are fully prepared to apply on the official portal.</span>
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant italic">
                    This gives you confidence before leaving SchemeSaathi to apply.
                  </p>
                )}
              </div>

              {/* OFFICIAL APPLICATION PORTAL LINK */}
              <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border-2 border-primary/40 shadow-sm space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase text-primary">
                    Official Application Portal
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-on-surface">
                    Apply directly on the official government website
                  </h4>
                  <p className="text-sm sm:text-base font-semibold text-primary/90 bg-primary/5 p-4 rounded-2xl border border-primary/20 leading-relaxed">
                    ℹ️ You will apply directly on the official government website. SchemeSaathi does not submit applications on your behalf.
                  </p>
                </div>

                {officialAppUrl ? (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-on-surface-variant">
                      <span>Official Portal: </span>
                      <span className="font-mono font-bold text-primary text-base">
                        {detailedInfo?.officialApplicationPortalName || officialAppUrl}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenOfficialLink}
                      className="px-7 py-4 rounded-2xl bg-primary text-on-primary text-sm sm:text-base font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.01]"
                    >
                      <span>Proceed to Official Application Portal</span>
                      <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-surface-container-low text-sm text-on-surface-variant space-y-2">
                    <p className="font-semibold text-secondary">
                      We could not confirm an official online application link.
                    </p>
                    <p>
                      Please visit the official information source or contact your local Taluk / District Welfare Office in person.
                    </p>
                    {officialInfoSourceUrl && (
                      <a
                        href={officialInfoSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary font-bold hover:underline"
                      >
                        <span>View Official Information Page ({officialInfoSourceName})</span>
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Informational Assurance Notice */}
              <div className="p-4 rounded-2xl bg-surface-container-low text-xs sm:text-sm text-on-surface-variant flex items-center gap-2.5 border border-outline-variant/20">
                <span className="material-symbols-outlined text-[20px] text-primary flex-shrink-0">policy</span>
                <span>
                  Authoritative Guidance Grounding: Data sourced from {officialInfoSourceName}. SchemeSaathi does not solicit credentials, OTPs, or government logins.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
