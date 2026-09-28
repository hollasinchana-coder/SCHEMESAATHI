import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, ALL_SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';
import { Language } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string, categoryId?: string) => void;
  onOpenVoice: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onScrollToSection: (sectionId: string) => void;
  simpleMode: boolean;
  onToggleSimpleMode: () => void;
  appliedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenVoice,
  isCollapsed,
  onToggleCollapse,
  onScrollToSection,
  simpleMode,
  onToggleSimpleMode,
  appliedCount = 0,
}) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Accordion expansion state for sub-menus
  const [findSchemesOpen, setFindSchemesOpen] = useState(true);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(true);
  const [langPickerOpen, setLangPickerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  return (
    <aside
      className={`sticky top-[82px] h-[calc(100vh-82px)] bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col justify-between transition-all duration-300 z-40 select-none shadow-xs ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
      aria-label="Service Navigation Sidebar"
    >
      {/* Top Header Row with Collapse Button & Brand Title */}
      <div className="flex items-center justify-between p-3 border-b border-outline-variant/20">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-2 rounded-xl text-on-surface hover:bg-surface-container hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
          title={isCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>

        {!isCollapsed && (
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary truncate">
              Navigation
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary-fixed/30 text-primary font-bold">
              Civic-AI
            </span>
          </div>
        )}
      </div>

      {/* Navigation Items (Scrollable) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1.5 scrollbar-thin">
        {/* 1. 🏠 Home */}
        <button
          type="button"
          onClick={() => {
            onNavigate('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            currentView === 'home'
              ? 'bg-primary text-on-primary shadow-xs font-bold'
              : 'text-on-surface hover:bg-surface-container hover:text-primary'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="Home Dashboard"
        >
          <span className="material-symbols-outlined text-[19px] flex-shrink-0">home</span>
          {!isCollapsed && <span className="truncate">Home</span>}
        </button>

        {/* 2. 🔍 Find Schemes Group */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                onNavigate('rag-finder');
              } else {
                setFindSchemesOpen(!findSchemesOpen);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'rag-finder' && isCollapsed
                ? 'bg-primary text-on-primary font-bold'
                : 'text-on-surface hover:bg-surface-container'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Find Schemes"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[19px] text-primary flex-shrink-0">
                search
              </span>
              {!isCollapsed && <span className="truncate font-bold">Find Schemes</span>}
            </div>
            {!isCollapsed && (
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                {findSchemesOpen ? 'expand_less' : 'expand_more'}
              </span>
            )}
          </button>

          {!isCollapsed && findSchemesOpen && (
            <div className="pl-6 pr-1 space-y-0.5 animate-fade-in border-l-2 border-outline-variant/30 ml-4 my-1">
              {/* Search Schemes */}
              <button
                type="button"
                onClick={() => onNavigate('rag-finder')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer text-left ${
                  currentView === 'rag-finder'
                    ? 'text-primary font-bold bg-primary-fixed/20'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">saved_search</span>
                <span className="truncate">Search Schemes (RAG)</span>
              </button>

              {/* Browse Schemes */}
              <button
                type="button"
                onClick={() => onNavigate('rag-finder')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[14px]">category</span>
                <span className="truncate">Browse Schemes</span>
              </button>

              {/* Eligibility */}
              <button
                type="button"
                onClick={() => {
                  onNavigate('home');
                  onScrollToSection('quick-discovery');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
                <span className="truncate">Check Eligibility</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. 🤖 AI Assistant Group */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                onOpenVoice();
              } else {
                setAiAssistantOpen(!aiAssistantOpen);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-on-surface hover:bg-surface-container ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="AI Assistant"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[19px] text-secondary flex-shrink-0">
                smart_toy
              </span>
              {!isCollapsed && <span className="truncate font-bold">AI Assistant</span>}
            </div>
            {!isCollapsed && (
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                {aiAssistantOpen ? 'expand_less' : 'expand_more'}
              </span>
            )}
          </button>

          {!isCollapsed && aiAssistantOpen && (
            <div className="pl-6 pr-1 space-y-0.5 animate-fade-in border-l-2 border-outline-variant/30 ml-4 my-1">
              {/* Ask SchemeSaathi */}
              <button
                type="button"
                onClick={() => onNavigate('rag-finder')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">chat</span>
                <span className="truncate">Ask SchemeSaathi</span>
              </button>

              {/* Voice Assistant */}
              <button
                type="button"
                onClick={onOpenVoice}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-secondary font-bold hover:bg-secondary-fixed/20 transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[14px]">mic</span>
                <span className="truncate">Voice Assistant (22 Langs)</span>
              </button>

              {/* Recommendations */}
              <button
                type="button"
                onClick={() => {
                  onNavigate('home');
                  onScrollToSection('resultsSection');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span className="truncate">Recommendations</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. ⭐ My Schemes */}
        <button
          type="button"
          onClick={() => {
            onNavigate('home');
            onScrollToSection('resultsSection');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container transition-all cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="My Eligible Schemes"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-[19px] text-amber-500 flex-shrink-0">
              star
            </span>
            {!isCollapsed && <span className="truncate">My Schemes</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300">
              Active
            </span>
          )}
        </button>

        {/* 5. 📄 My Applications */}
        <button
          type="button"
          onClick={() => {
            onNavigate('home');
            onScrollToSection('resultsSection');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container transition-all cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="My Applications & DBT Status"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-[19px] text-tertiary flex-shrink-0">
              description
            </span>
            {!isCollapsed && <span className="truncate">My Applications</span>}
          </div>
          {!isCollapsed && appliedCount > 0 && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-tertiary-fixed/40 text-tertiary">
              {appliedCount}
            </span>
          )}
        </button>

        {/* 6. 📚 Resources Group */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                onNavigate('how-it-works');
              } else {
                setResourcesOpen(!resourcesOpen);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'how-it-works' && isCollapsed
                ? 'bg-primary text-on-primary font-bold'
                : 'text-on-surface hover:bg-surface-container'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Resources & Guidelines"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[19px] text-on-surface-variant flex-shrink-0">
                menu_book
              </span>
              {!isCollapsed && <span className="truncate">Resources</span>}
            </div>
            {!isCollapsed && (
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                {resourcesOpen ? 'expand_less' : 'expand_more'}
              </span>
            )}
          </button>

          {!isCollapsed && resourcesOpen && (
            <div className="pl-6 pr-1 space-y-0.5 animate-fade-in border-l-2 border-outline-variant/30 ml-4 my-1">
              <button
                type="button"
                onClick={() => onNavigate('how-it-works')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer text-left ${
                  currentView === 'how-it-works'
                    ? 'text-primary font-bold bg-primary-fixed/20'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">help_outline</span>
                <span className="truncate">How It Works</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('runtime-control-center')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer text-left ${
                  currentView === 'runtime-control-center'
                    ? 'text-primary font-bold bg-primary-fixed/20'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">account_tree</span>
                <span className="truncate">A3 Runtime Demo</span>
              </button>
            </div>
          )}
        </div>

        {/* 7. 🌐 Languages */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                // cycle or show quick selector
                setLangPickerOpen(!langPickerOpen);
              } else {
                setLangPickerOpen(!langPickerOpen);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Scheduled Indian Languages"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[19px] text-primary flex-shrink-0">
                language
              </span>
              {!isCollapsed && <span className="truncate">Languages</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono text-primary bg-primary-fixed/30 px-1.5 py-0.5 rounded font-bold">
                22
              </span>
            )}
          </button>

          {!isCollapsed && langPickerOpen && (
            <div className="p-2 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1 my-1 max-h-40 overflow-y-auto scrollbar-thin">
              <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold block mb-1">
                Select Language
              </span>
              <div className="grid grid-cols-2 gap-1">
                {ALL_SUPPORTED_LANGUAGES.slice(0, 10).map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code as Language);
                      setLangPickerOpen(false);
                    }}
                    className={`px-2 py-1 rounded text-[10px] text-left truncate cursor-pointer ${
                      language === l.code
                        ? 'bg-primary text-on-primary font-bold'
                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {l.native}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 8. 👤 My Account Group */}
        <div className="space-y-0.5 pt-1 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                onNavigate('home');
                onScrollToSection('quick-discovery');
              } else {
                setAccountOpen(!accountOpen);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="My Account"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[19px] text-primary flex-shrink-0">
                person
              </span>
              {!isCollapsed && (
                <div className="flex flex-col text-left truncate">
                  <span className="truncate font-bold">My Account</span>
                  {user && (
                    <span className="text-[10px] text-on-surface-variant font-mono truncate">
                      {user.fullName || user.emailOrPhone}
                    </span>
                  )}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                {accountOpen ? 'expand_less' : 'expand_more'}
              </span>
            )}
          </button>

          {!isCollapsed && accountOpen && (
            <div className="pl-6 pr-1 space-y-0.5 animate-fade-in border-l-2 border-outline-variant/30 ml-4 my-1">
              {/* Profile */}
              <button
                type="button"
                onClick={() => {
                  onNavigate('home');
                  onScrollToSection('quick-discovery');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[14px]">badge</span>
                <span className="truncate">Citizen Profile</span>
              </button>

              {/* Preferences */}
              <button
                type="button"
                onClick={onToggleSimpleMode}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {simpleMode ? 'visibility_off' : 'contrast'}
                </span>
                <span className="truncate">
                  {simpleMode ? 'Normal View' : 'Accessible High-Contrast'}
                </span>
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-error font-bold hover:bg-error-container/20 transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[14px]">logout</span>
                <span className="truncate">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom User Quick Info / Collapsed Logout */}
      <div className="p-2 border-t border-outline-variant/20">
        {isCollapsed ? (
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 flex items-center justify-center text-error hover:bg-error-container/20 rounded-xl transition-colors cursor-pointer"
            title="Log Out"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'C'}
              </span>
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-bold text-on-surface truncate">
                  {user?.fullName || 'Citizen User'}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono truncate">
                  {user?.emailOrPhone || 'Aadhaar Verified'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-error hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer"
              title="Log Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
