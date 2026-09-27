import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { RuntimeTopologyView } from './views/RuntimeTopologyView';
import { HowItWorksView } from './views/HowItWorksView';
import { RAGSchemeFinderView } from './views/RAGSchemeFinderView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { CitizenProfile } from './types';
import { EligibilityResult, evaluateEligibility } from './utils/eligibilityEngine';
import { MOCK_SCHEMES } from './data/mockData';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

function MainAppContent() {
  const { language } = useLanguage();
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewHistory, setViewHistory] = useState<string[]>([]);
  const [sidebarTab, setSidebarTab] = useState<string>('runtime-topology');
  const [simpleMode, setSimpleMode] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  // Master persistent profile state (persists across navigation, back buttons, and language changes)
  const [profile, setProfile] = useState<CitizenProfile>({
    fullName: 'Ramesh Kumar Patil',
    age: 44,
    gender: 'Male',
    mobile: '+91 98765 43210',
    otp: '',
    isOtpVerified: false,
    state: 'Karnataka',
    district: 'Haveri',
    occupation: 'Small / Marginal Farmer',
    annualIncome: 150000,
    aadhaarLastFour: '',
    landHoldingAcres: 2.0,
  });

  // Master persistent eligibility state
  const [evaluationResult, setEvaluationResult] = useState<EligibilityResult | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [appliedSchemeIds, setAppliedSchemeIds] = useState<string[]>([]);

  // Update eligibility results dynamically when language changes
  useEffect(() => {
    if (hasEvaluated && profile) {
      const updated = evaluateEligibility(profile, MOCK_SCHEMES, language);
      setEvaluationResult(updated);
    }
  }, [language]);

  // Master persistent category filter for Find Schemes view
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('category') || 'all';
    } catch {
      return 'all';
    }
  });

  // Handle URL query parameters on initial mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const catParam = params.get('category');
      if (catParam) {
        setSelectedCategoryFilter(catParam);
      }
      if (viewParam === 'find-schemes' || viewParam === 'rag-finder') {
        setCurrentView('rag-finder');
      } else if (viewParam === 'how-it-works' || viewParam === 'runtime-control-center') {
        setCurrentView(viewParam);
      } else if (catParam) {
        setCurrentView('rag-finder');
      }
    } catch {
      // ignore
    }
  }, []);

  // Handle forward navigation with history preservation and category sync
  const handleNavigate = (viewId: string, categoryId?: string, addToHistory: boolean = true) => {
    const targetView = viewId === 'find-schemes' ? 'rag-finder' : viewId;
    if (categoryId) {
      setSelectedCategoryFilter(categoryId);
    }
    if (targetView === currentView && !categoryId) return;

    if (addToHistory) {
      setViewHistory((prev) => [...prev, currentView]);
      try {
        const queryParams = new URLSearchParams();
        if (targetView !== 'home') queryParams.set('view', targetView);
        const activeCat = categoryId || selectedCategoryFilter;
        if (activeCat && activeCat !== 'all') {
          queryParams.set('category', activeCat);
        }
        const newUrl = queryParams.toString() ? `?${queryParams.toString()}` : window.location.pathname;
        window.history.pushState({ view: targetView, category: activeCat || 'all' }, '', newUrl);
      } catch {
        // ignore
      }
    }
    setCurrentView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle logical back navigation (returns to previous logical screen, preserves profile and results)
  const handleBack = () => {
    if (viewHistory.length > 0) {
      const prevView = viewHistory[viewHistory.length - 1];
      setViewHistory((prev) => prev.slice(0, -1));
      setCurrentView(prevView);
      try {
        const queryParams = new URLSearchParams();
        if (prevView !== 'home') queryParams.set('view', prevView);
        const newUrl = queryParams.toString() ? `?${queryParams.toString()}` : window.location.pathname;
        window.history.pushState({ view: prevView }, '', newUrl);
      } catch {
        // ignore
      }

      if (prevView === 'home') {
        setTimeout(() => {
          const el = document.getElementById('explore-categories');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setCurrentView('home');
      try {
        window.history.pushState({ view: 'home' }, '', window.location.pathname);
      } catch {
        // ignore
      }
      setTimeout(() => {
        const el = document.getElementById('explore-categories');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Browser-level back button integration
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) {
        setCurrentView(e.state.view);
        if (e.state.category) {
          setSelectedCategoryFilter(e.state.category);
        }
      } else {
        handleBack();
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [viewHistory]);

  const handleSidebarNavigate = (tab: string) => {
    setSidebarTab(tab);
    if (tab === 'runtime-topology') {
      handleNavigate('runtime-control-center');
    } else if (tab === 'scheme-graph-engine') {
      handleNavigate('rag-finder');
    } else {
      handleNavigate('home');
    }
  };

  const handleRunDiscovery = (_prof: CitizenProfile) => {
    handleNavigate('rag-finder');
  };

  const isRuntimeCanvas = currentView === 'runtime-control-center';

  return (
    <div className={`min-h-screen flex flex-col bg-surface ${simpleMode ? 'contrast-125' : ''}`}>
      {/* If in Runtime Canvas, render dedicated layout with sidebar and prominent top-left back buttons */}
      {isRuntimeCanvas ? (
        <RuntimeTopologyView
          onBackToCitizenPortal={handleBack}
          onNavigateSidebar={handleSidebarNavigate}
          activeSidebarTab={sidebarTab}
        />
      ) : (
        <>
          {/* Main Citizen Portal Header */}
          <Navbar
            currentView={currentView}
            onNavigate={(v) => handleNavigate(v)}
            simpleMode={simpleMode}
            onToggleSimpleMode={() => setSimpleMode(!simpleMode)}
            onOpenVoice={() => setIsVoiceModalOpen(true)}
          />

          {/* View Body */}
          <main className="flex-1 w-full pt-[82px]">
            {currentView === 'home' && (
              <HomeView
                onNavigate={(v, catId) => handleNavigate(v, catId)}
                onOpenVoice={() => setIsVoiceModalOpen(true)}
                onRunDiscovery={handleRunDiscovery}
                simpleMode={simpleMode}
                profile={profile}
                setProfile={setProfile}
                evaluationResult={evaluationResult}
                setEvaluationResult={setEvaluationResult}
                hasEvaluated={hasEvaluated}
                setHasEvaluated={setHasEvaluated}
                appliedSchemeIds={appliedSchemeIds}
                setAppliedSchemeIds={setAppliedSchemeIds}
              />
            )}

            {currentView === 'how-it-works' && (
              <HowItWorksView
                onNavigateToDemo={() => handleNavigate('runtime-control-center')}
                onBack={handleBack}
              />
            )}

            {currentView === 'rag-finder' && (
              <RAGSchemeFinderView
                onBack={handleBack}
                onOpenVoice={() => setIsVoiceModalOpen(true)}
              />
            )}
          </main>

          {/* Main Citizen Portal Footer */}
          <Footer />
        </>
      )}

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentProfile={profile}
        onConfirmProfile={(confirmedProfile, autoCheck) => {
          setProfile(confirmedProfile);
          if (autoCheck) {
            setCurrentView('home');
            setTimeout(() => {
              const res = evaluateEligibility(confirmedProfile, MOCK_SCHEMES, language);
              setEvaluationResult(res);
              setHasEvaluated(true);
              const el = document.getElementById('resultsSection');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }, 250);
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainAppContent />
    </LanguageProvider>
  );
}
