import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface HowItWorksViewProps {
  onNavigateToDemo: () => void;
  onBack?: () => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onNavigateToDemo, onBack }) => {
  const { t, language } = useLanguage();

  const journeySteps = [
    {
      num: '1',
      icon: 'mic',
      title: language === 'kn' ? 'ಧ್ವನಿ ಅಥವಾ ಪ್ರೊಫೈಲ್ ಇನ್‌ಪುಟ್' : language === 'hi' ? 'वॉयस या प्रोफ़ाइल इनपुट' : 'Citizen Speaks / Enters Profile',
      desc: language === 'kn' ? 'ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಮೂಲಭೂತ ಪ್ರೊಫೈಲ್ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.' : language === 'hi' ? 'अपनी मातृभाषा में बोलें या बुनियादी प्रोफ़ाइल विवरण भरें।' : 'Speak naturally in your mother tongue or enter basic profile details.',
    },
    {
      num: '2',
      icon: 'rule',
      title: language === 'kn' ? 'ಅರ್ಹತೆ ಪರಿಶೀಲನೆ' : language === 'hi' ? 'पात्रता मूल्यांकन' : 'Deterministic Eligibility Check',
      desc: language === 'kn' ? 'ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಯೋಜನೆಗಳ ಮಾನದಂಡಗಳೊಂದಿಗೆ ನಿಯಮಾನುಸಾರ ಹೋಲಿಕೆ.' : language === 'hi' ? 'केंद्र एवं राज्य योजना नियमों के साथ सीधा मिलान।' : 'Instant rule-based evaluation against central and state government guidelines.',
    },
    {
      num: '3',
      icon: 'recommend',
      title: language === 'kn' ? 'ಅರ್ಹ ಯೋಜನೆಗಳ ಪಟ್ಟಿ' : language === 'hi' ? 'पात्र योजनाओं की सूची' : 'Eligible Schemes Display',
      desc: language === 'kn' ? 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಅಧಿಕೃತ ಯೋಜನೆಗಳನ್ನು ಮಾತ್ರ ವೀಕ್ಷಿಸಿ.' : language === 'hi' ? 'केवल वही योजनाएं देखें जिनके लिए आपकी प्रोफ़ाइल वास्तव में पात्र है।' : 'See exact government welfare schemes you qualify for with direct benefits.',
    },
    {
      num: '4',
      icon: 'support_agent',
      title: language === 'kn' ? 'ಯೋಜನಾ ಮಾಹಿತಿ ಏಜೆಂಟ್' : language === 'hi' ? 'योजना सूचना एजेंट' : 'Scheme Information Agent',
      desc: language === 'kn' ? 'ಯೋಜನೆಯನ್ನು ಆರಿಸಿ ಅಧಿಕೃತ ಮೂಲಗಳಿಂದ ತಾಜಾ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಿರಿ.' : language === 'hi' ? 'योजना चुनें और आधिकारिक स्रोतों से अद्यतन जानकारी प्राप्त करें।' : 'Select any scheme to inspect latest official requirements and application guidance.',
    },
    {
      num: '5',
      icon: 'description',
      title: language === 'kn' ? 'ಅಗತ್ಯ ದಾಖಲೆಗಳ ವಿವರಣೆ' : language === 'hi' ? 'सटीक आवश्यक दस्तावेज' : 'Exact Required Documents',
      desc: language === 'kn' ? 'ಪ್ರತಿಯೊಂದು ದಾಖಲೆ ಏನು, ಎಲ್ಲಿ ಪಡೆಯಬೇಕು ಮತ್ತು ಹೇಗೆ ಸಿದ್ಧಪಡಿಸಬೇಕು ತಿಳಿಯಿರಿ.' : language === 'hi' ? 'प्रत्येक दस्तावेज क्या है, कहाँ से प्राप्त करें और कैसे तैयार करें जानें।' : 'Understand what each document is, where to obtain it, and preparation steps.',
    },
    {
      num: '6',
      icon: 'open_in_new',
      title: language === 'kn' ? 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ' : language === 'hi' ? 'आधिकारिक पोर्टल पर सीधा आवेदन' : 'Apply on Official Government Portal',
      desc: language === 'kn' ? 'ಸಿದ್ಧತಾ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ ಮುಗಿಸಿ ನೇರವಾಗಿ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಜಾಲತಾಣಕ್ಕೆ ಹೋಗಿ.' : language === 'hi' ? 'चेकलिस्ट की पुष्टि कर सीधे आधिकारिक सरकारी वेबसाइट पर सुरक्षित आवेदन करें।' : 'Review the readiness checklist and proceed directly to the authentic government portal.',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-4 animate-fade-in">
      {/* Top Back Navigation Bar */}
      {onBack && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold shadow-xs border border-outline-variant/30 transition-all cursor-pointer"
            title="Return to previous screen"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>{t.back}</span>
          </button>
        </div>
      )}

      {/* Header (Compact) */}
      <div className="text-center space-y-1">
        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono text-[10px] font-bold uppercase tracking-wider">
          Citizen Journey & Transparency
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface">
          {t.howItWorks}
        </h1>
        <p className="text-xs text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          SchemeSaathi guides citizens to official government welfare without collecting documents, filling forms, or requesting login credentials.
        </p>
      </div>

      {/* Clear 6-Step Visual Journey */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-on-surface uppercase font-mono flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Citizen Discovery & Guidance Journey
          </h2>
          <span className="text-[10px] text-primary font-semibold">100% Informational • No Fake Portals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {journeySteps.map((step) => (
            <div
              key={step.num}
              className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col justify-between space-y-1.5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed/40 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                </div>
                <span className="font-mono text-[10px] font-extrabold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                  Step {step.num}
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-on-surface">{step.title}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Principle Box */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
        <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          <span>Core Guarantee: SchemeSaathi is a Civic Guide, Not an Application Submitter</span>
        </div>
        <p className="text-xs text-on-surface leading-relaxed">
          SchemeSaathi strictly empowers citizens with knowledge. The application does not collect or upload identity documents, does not store credentials, does not handle OTPs or CAPTCHAs, and does not submit forms on government portals. Citizens apply directly and safely on authentic government websites (such as pmkisan.gov.in, sevasindhu.karnataka.gov.in, etc.) with complete confidence.
        </p>
      </div>

      {/* Technical Architecture Strip for Judges */}
      <div className="p-5 rounded-2xl bg-inverse-surface text-inverse-on-surface flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="h-2 w-2 rounded-full bg-tertiary animate-ping"></span>
            <span className="font-mono text-[10px] text-tertiary uppercase font-bold tracking-wider">
              For Hackathon Judges & Engineers
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold">
            Inspect the A3 Runtime Execution Canvas
          </h3>
          <p className="text-xs text-inverse-on-surface/80">
            Explore live multi-agent orchestration, STT pipeline, mutex locks, and concurrency topology.
          </p>
        </div>

        <button
          onClick={onNavigateToDemo}
          className="px-4 py-2 rounded-lg bg-tertiary text-on-tertiary font-bold text-xs shadow hover:opacity-95 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
        >
          <span>Open A3 Execution Canvas</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
