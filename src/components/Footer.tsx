import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <footer className="w-full bg-surface-container-low py-4 sm:py-5 border-t border-outline-variant/30">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Col 1: About SchemeSaathi */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">SchemeSaathi</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t.footerAbout}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="material-symbols-outlined text-tertiary text-[20px]">support_agent</span>
              <span className="font-mono text-xs font-bold text-on-surface">{t.helpline}</span>
            </div>
          </div>

          {/* Col 2: Official Portals */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-on-surface">{t.footerOfficialPortals}</span>
            <ul className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
              <li>
                <a
                  className="hover:text-primary transition-colors flex items-center gap-1"
                  href="https://www.india.gov.in"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  india.gov.in <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </li>
              <li>
                <a
                  className="hover:text-primary transition-colors flex items-center gap-1"
                  href="https://www.myscheme.gov.in"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  myScheme Portal <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </li>
              <li>
                <a
                  className="hover:text-primary transition-colors flex items-center gap-1"
                  href="https://dbtbharat.gov.in"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  DBT Bharat <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </li>
              <li>
                <a
                  className="hover:text-primary transition-colors flex items-center gap-1"
                  href="https://digitalindia.gov.in"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Digital India <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Vernacular Dialects */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-on-surface">{t.footerDialects}</span>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { code: 'kn' as const, native: 'ಕನ್ನಡ' },
                  { code: 'hi' as const, native: 'हिन्दी' },
                  { code: 'en' as const, native: 'English' },
                  { code: 'ta' as const, native: 'தமிழ்' },
                  { code: 'te' as const, native: 'తెలుగు' },
                  { code: 'bn' as const, native: 'বাংলা' },
                  { code: 'mr' as const, native: 'मराठी' },
                  { code: 'gu' as const, native: 'ગુજરાતી' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      language === l.code
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {l.native}
                  </button>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t.indicDialectsSub}
              </p>
            </div>
          </div>

          {/* Col 4: Trust & Consent */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-on-surface">{t.footerTrust}</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {t.footerTrustText}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span className="font-mono text-[11px] text-on-surface-variant uppercase">
                {t.dbtIntegration}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-3 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-on-surface-variant text-xs">
          <div>{t.footerCopyright}</div>
          <div className="flex items-center gap-4">
            <span className="hover:text-primary transition-colors cursor-pointer">{t.privacyPolicy}</span>
            <span className="hover:text-primary transition-colors cursor-pointer">{t.consentTerms}</span>
            <span className="hover:text-primary transition-colors cursor-pointer">{t.accessibilityStatement}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
