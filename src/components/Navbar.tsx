import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SCHEMESAATHI_LOGO_URL } from '../data/mockData';
import { Language } from '../types';
import { useLanguage, ALL_SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';
import { getRAGTranslation } from '../i18n/ragTranslations';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  simpleMode: boolean;
  onToggleSimpleMode: () => void;
  onOpenLogin?: () => void;
  onOpenVoice: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  simpleMode,
  onToggleSimpleMode,
  onOpenVoice,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    if (langMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [langMenuOpen]);

  const currentLangObj = useMemo(
    () => ALL_SUPPORTED_LANGUAGES.find((l) => l.code === language) || ALL_SUPPORTED_LANGUAGES[0],
    [language]
  );

  const filteredLanguages = useMemo(() => {
    if (!langSearch.trim()) return ALL_SUPPORTED_LANGUAGES;
    const query = langSearch.toLowerCase().trim();
    return ALL_SUPPORTED_LANGUAGES.filter(
      (l) =>
        l.label.toLowerCase().includes(query) ||
        l.native.toLowerCase().includes(query) ||
        l.code.toLowerCase().includes(query)
    );
  }, [langSearch]);

  const ragT = getRAGTranslation(language);

  const navLinks: { id: string; label: string; icon?: string; badge?: string }[] = [
    { id: 'home', label: t.home, icon: 'home' },
    { id: 'rag-finder', label: ragT.ragFinderNav, icon: 'manage_search', badge: ragT.geminiRagBadge },
    { id: 'how-it-works', label: t.howItWorks, icon: 'help_outline' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-xl shadow-xs border-b border-outline-variant/20">
      {/* Top Government Welfare Banner (28px high) */}
      <div className="h-7 bg-surface-container-high px-4 text-center text-[10px] font-mono text-on-surface-variant flex items-center justify-center gap-1.5">
        <span className="text-xs">🇮🇳</span>
        <span className="font-semibold text-primary">{t.govInitiative}</span>
        <span className="inline-flex items-center rounded bg-secondary px-1.5 py-0.2 text-on-secondary font-semibold text-[9px]">
          {t.dbtEnabled}
        </span>
      </div>

      {/* Main Header Row (56px height) */}
      <div className="h-14 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2.5">
        {/* Logo and Brand */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 min-w-max cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <img
            src={SCHEMESAATHI_LOGO_URL}
            alt="SchemeSaathi Logo"
            className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-primary tracking-tight leading-tight">
              SchemeSaathi
            </span>
            <span className="text-[9px] text-on-surface-variant font-medium leading-none hidden sm:inline">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3 py-1.5 text-xs sm:text-sm transition-all rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-medium'
                }`}
              >
                {link.icon && <span className="material-symbols-outlined text-[16px]">{link.icon}</span>}
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          {/* A3 Live Demo Button */}
          <button
            onClick={() => onNavigate('runtime-control-center')}
            className={`relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-tight transition-all cursor-pointer ${
              currentView === 'runtime-control-center'
                ? 'bg-primary text-on-primary ring-1 ring-primary-fixed shadow-xs'
                : 'bg-surface-container-highest text-primary hover:bg-surface-container'
            }`}
            title="Open Agent Execution Canvas & Predictive Resource Graph"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
            </span>
            <span className="hidden sm:inline">{t.a3LiveDemo}</span>
            <span className="sm:hidden">A3 Demo</span>
          </button>

          {/* Simple Mode Toggle */}
          <button
            type="button"
            onClick={onToggleSimpleMode}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              simpleMode
                ? 'bg-secondary text-on-secondary font-bold shadow-xs'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
            title="Toggle Simple High-Contrast Accessible Mode"
          >
            <span className="material-symbols-outlined text-[16px]">
              {simpleMode ? 'visibility_off' : 'visibility'}
            </span>
            <span className="hidden xl:inline font-medium">
              {simpleMode ? t.normalView : t.simpleMode}
            </span>
          </button>

          {/* 22 Indian Languages + English Selector Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setLangSearch('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs shadow-xs hover:bg-surface-container-low transition-colors border border-outline-variant/30 font-semibold cursor-pointer max-w-[130px] sm:max-w-[170px]"
              aria-label={t.selectLanguage}
              aria-expanded={langMenuOpen}
            >
              <span className="material-symbols-outlined text-[15px] text-primary flex-shrink-0">language</span>
              <span className="text-primary font-bold truncate">{currentLangObj.native}</span>
              <span className="material-symbols-outlined text-[15px] text-on-surface-variant flex-shrink-0">
                {langMenuOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 sm:w-72 rounded-2xl bg-surface-container-lowest shadow-2xl border border-outline-variant/30 py-2 z-50 animate-fade-in flex flex-col max-h-[420px]">
                {/* Header & Search */}
                <div className="px-3 pb-2 border-b border-outline-variant/20 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                    <span className="font-bold text-primary">{t.selectLanguage}</span>
                    <span className="text-[10px] bg-primary-fixed/30 text-primary font-bold px-1.5 py-0.5 rounded">
                      22 Languages
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-[15px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      placeholder="Search language / भाषा खोजें..."
                      className="w-full h-8 pl-8 pr-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Language Items Scrollable List */}
                <div className="overflow-y-auto py-1 max-h-72 scrollbar-thin">
                  {filteredLanguages.map((l) => {
                    const isSelected = language === l.code;
                    return (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code as Language);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer ${
                          isSelected
                            ? 'text-primary font-bold bg-primary-fixed/20'
                            : 'text-on-surface'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary">{l.native}</span>
                          <span className="text-[11px] text-on-surface-variant font-medium">({l.label})</span>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-primary text-[16px]">
                            check
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {filteredLanguages.length === 0 && (
                    <div className="px-4 py-3 text-center text-xs text-on-surface-variant">
                      No matching language found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Voice Assistant quick trigger */}
          <button
            onClick={onOpenVoice}
            type="button"
            title="Speak to SchemeSaathi"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-xs hover:bg-primary-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">mic</span>
            <span className="hidden sm:inline">{t.voiceAssistant}</span>
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-on-surface hover:bg-surface-container-low cursor-pointer"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-t border-outline-variant/20 px-4 py-3 space-y-1.5 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-lg text-left text-xs sm:text-sm flex items-center justify-between cursor-pointer ${
                currentView === link.id
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-2">
                {link.icon && <span className="material-symbols-outlined text-[16px]">{link.icon}</span>}
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            </button>
          ))}
          <div className="pt-2 border-t border-outline-variant/20 flex gap-2">
            <button
              onClick={() => {
                onOpenVoice();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">mic</span>
              <span>{t.voiceAssistant}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
