import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import {
  SpokenSchemeUnit,
  MULTILINGUAL_VOICE_STRINGS,
  findBestVoiceForLanguage,
} from '../utils/voiceEligibilityReader';
import { getLanguageOption } from '../i18n/languages';

interface VoiceEligibilityPlayerProps {
  speechUnits: SpokenSchemeUnit[];
  language: Language;
  onActiveSchemeChange?: (schemeId: string | null) => void;
  className?: string;
  sourceContextTitle?: string;
}

export const VoiceEligibilityPlayer: React.FC<VoiceEligibilityPlayerProps> = ({
  speechUnits,
  language,
  onActiveSchemeChange,
  className = '',
  sourceContextTitle = 'Eligibility Results',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [ttsSupported, setTtsSupported] = useState<boolean>(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [resolvedVoiceInfo, setResolvedVoiceInfo] = useState<string>('');

  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const keepAliveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const unitsRef = useRef<SpokenSchemeUnit[]>(speechUnits);
  const langRef = useRef<Language>(language);
  const isPlayingRef = useRef<boolean>(isPlaying);

  // Keep refs in sync
  useEffect(() => {
    unitsRef.current = speechUnits;
  }, [speechUnits]);

  useEffect(() => {
    langRef.current = language;
  }, [language]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const strings = MULTILINGUAL_VOICE_STRINGS[language] || MULTILINGUAL_VOICE_STRINGS.en;
  const langOption = getLanguageOption(language);

  // Check browser TTS support & load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTtsSupported(false);
      return;
    }

    const loadVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices();
        setAvailableVoices(v);
        const resolved = findBestVoiceForLanguage(language, v);
        if (resolved.voice) {
          setResolvedVoiceInfo(`${resolved.voice.name} (${resolved.targetLangCode})`);
        } else {
          setResolvedVoiceInfo(`${langOption.speechCode || 'en-IN'}`);
        }
      } catch {
        // ignore
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      stopSpeech();
    };
  }, [language]);

  // Chrome TTS keep-alive workaround
  const startKeepAlive = () => {
    stopKeepAlive();
    keepAliveTimerRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 10000);
  };

  const stopKeepAlive = () => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
  };

  // Stop speech completely
  const stopSpeech = () => {
    stopKeepAlive();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    currentUtteranceRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(0);
    if (onActiveSchemeChange) {
      onActiveSchemeChange(null);
    }
  };

  // Play a specific unit at index
  const playUnitAtIndex = (index: number) => {
    if (!('speechSynthesis' in window)) return;

    const units = unitsRef.current;
    if (!units || units.length === 0 || index >= units.length) {
      // Finished all units
      stopSpeech();
      return;
    }

    const unit = units[index];
    setCurrentIndex(index);
    if (onActiveSchemeChange) {
      onActiveSchemeChange(unit.schemeId !== 'none' ? unit.schemeId : null);
    }

    // Cancel any ongoing utterance before creating the new one
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }

    const utterance = new SpeechSynthesisUtterance(unit.fullSpeechText);
    currentUtteranceRef.current = utterance;

    // Pick best voice for selected language
    const { voice, targetLangCode } = findBestVoiceForLanguage(langRef.current, availableVoices);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || targetLangCode;
    } else {
      utterance.lang = targetLangCode || langOption.speechCode || 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      // Advance to next unit if still in playing state
      if (isPlayingRef.current) {
        const nextIndex = index + 1;
        if (nextIndex < units.length) {
          playUnitAtIndex(nextIndex);
        } else {
          stopSpeech();
        }
      }
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error on unit', index, e);
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        const nextIndex = index + 1;
        if (nextIndex < units.length && isPlayingRef.current) {
          playUnitAtIndex(nextIndex);
        } else {
          stopSpeech();
        }
      }
    };

    window.speechSynthesis.speak(utterance);
    startKeepAlive();
  };

  // User clicks "Listen to Eligibility Results"
  const handleStartListen = () => {
    if (!ttsSupported) return;

    // If already playing, stop and restart from beginning
    if (isPlaying) {
      stopSpeech();
      // Brief timeout to ensure browser synthesis cancel takes effect
      setTimeout(() => {
        setIsPlaying(true);
        setIsPaused(false);
        playUnitAtIndex(0);
      }, 50);
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);
    playUnitAtIndex(0);
  };

  // User clicks Pause / Resume
  const handleTogglePause = () => {
    if (!isPlaying || !('speechSynthesis' in window)) return;

    if (isPaused) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // fallback restart
        playUnitAtIndex(currentIndex);
      }
      setIsPaused(false);
      startKeepAlive();
    } else {
      try {
        window.speechSynthesis.pause();
      } catch {
        // ignore
      }
      setIsPaused(true);
      stopKeepAlive();
    }
  };

  // If language changes or speechUnits change while playing, restart cleanly with new language
  useEffect(() => {
    if (isPlaying) {
      stopSpeech();
    }
  }, [language]);

  const activeUnit = speechUnits[currentIndex] || speechUnits[0];
  const totalUnits = speechUnits.length;
  const progressPercent = totalUnits > 0 ? Math.round(((currentIndex + 1) / totalUnits) * 100) : 0;

  return (
    <div
      className={`rounded-xl border transition-all ${
        isPlaying
          ? 'bg-primary/5 border-primary/40 shadow-xs'
          : 'bg-surface-container-low border-outline-variant/30'
      } p-3 sm:p-3.5 ${className}`}
    >
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {/* Main Listen Button */}
          <button
            type="button"
            onClick={handleStartListen}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isPlaying
                ? 'bg-primary-container text-on-primary-container ring-2 ring-primary/40 hover:bg-primary-container/90'
                : 'bg-primary text-on-primary hover:bg-primary-container hover:scale-[1.01]'
            }`}
            title="Listen to all eligible schemes in currently selected language"
          >
            <span
              className={`material-symbols-outlined text-[17px] ${
                isPlaying && !isPaused ? 'animate-bounce' : ''
              }`}
            >
              volume_up
            </span>
            <span>
              {isPlaying ? (
                <>
                  <span className="hidden sm:inline">Re-read from Start</span>
                  <span className="sm:hidden">Restart</span>
                </>
              ) : (
                strings.listenResultsBtn
              )}
            </span>
          </button>

          {/* Pause / Resume Button */}
          {isPlaying && (
            <button
              type="button"
              onClick={handleTogglePause}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-container text-on-surface text-xs font-bold border border-outline-variant/30 transition-all cursor-pointer"
              title={isPaused ? strings.resumeBtn : strings.pauseBtn}
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                {isPaused ? 'play_arrow' : 'pause'}
              </span>
              <span>{isPaused ? strings.resumeBtn : strings.pauseBtn}</span>
            </button>
          )}

          {/* Stop Button */}
          <button
            type="button"
            onClick={stopSpeech}
            disabled={!isPlaying}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isPlaying
                ? 'bg-error/10 hover:bg-error/20 text-error border-error/30 cursor-pointer shadow-xs'
                : 'bg-surface-container text-on-surface-variant/50 border-outline-variant/20 cursor-not-allowed opacity-50'
            }`}
            title={strings.stopBtn}
          >
            <span className="material-symbols-outlined text-[16px]">stop</span>
            <span>{strings.stopBtn}</span>
          </button>
        </div>

        {/* Selected Language Badge & Spoken Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface font-medium text-[11px] border border-outline-variant/20">
            <span className="material-symbols-outlined text-[14px] text-secondary">translate</span>
            <span className="font-semibold text-primary">{langOption.label}</span>
            <span className="text-[10px] text-on-surface-variant">({langOption.native})</span>
          </div>

          {isPlaying && (
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>
                {currentIndex + 1} / {totalUnits}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Active Playback Status Bar */}
      {isPlaying && (
        <div className="mt-2.5 pt-2 border-t border-outline-variant/20 space-y-1.5 animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Soundwave equalizer indicator */}
              <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
                <span
                  className={`w-0.5 bg-primary rounded-full transition-all ${
                    isPaused ? 'h-1' : 'h-3 animate-pulse'
                  }`}
                ></span>
                <span
                  className={`w-0.5 bg-primary rounded-full transition-all ${
                    isPaused ? 'h-1' : 'h-2 animate-pulse delay-75'
                  }`}
                ></span>
                <span
                  className={`w-0.5 bg-primary rounded-full transition-all ${
                    isPaused ? 'h-1' : 'h-3.5 animate-pulse delay-150'
                  }`}
                ></span>
                <span
                  className={`w-0.5 bg-primary rounded-full transition-all ${
                    isPaused ? 'h-1' : 'h-1.5 animate-pulse'
                  }`}
                ></span>
              </div>
              <span className="font-semibold text-on-surface truncate text-xs">
                {isPaused ? (
                  <span className="text-amber-700 dark:text-amber-400 font-bold">
                    [Paused] {strings.readingNowStatus(currentIndex + 1, totalUnits, activeUnit?.schemeName || '')}
                  </span>
                ) : (
                  strings.readingNowStatus(currentIndex + 1, totalUnits, activeUnit?.schemeName || '')
                )}
              </span>
            </div>
            <span className="font-mono text-[10px] text-on-surface-variant flex-shrink-0">
              {progressPercent}% Complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-surface-container-highest rounded-full h-1 overflow-hidden">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Subtext info for citizen */}
      {!isPlaying && (
        <div className="mt-1 text-[11px] text-on-surface-variant flex items-center justify-between">
          <span>
            {totalUnits > 0
              ? `Plays all ${totalUnits} eligible schemes sequentially with full benefits, reasons, and required documents.`
              : 'Voice summary for current eligibility results.'}
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-on-surface-variant/70">
            {resolvedVoiceInfo ? `TTS: ${resolvedVoiceInfo}` : 'Web Speech API'}
          </span>
        </div>
      )}
    </div>
  );
};
