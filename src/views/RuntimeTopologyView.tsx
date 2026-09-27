import React, { useState, useEffect, useRef } from 'react';
import { SCHEMESAATHI_LOGO_URL, INITIAL_CITIZENS, INITIAL_AGENTS, INITIAL_RESOURCES, INITIAL_LOGS } from '../data/mockData';
import { TelemetryLog } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface RuntimeTopologyViewProps {
  onBackToCitizenPortal: () => void;
  onNavigateSidebar: (tab: string) => void;
  activeSidebarTab?: string;
}

export const RuntimeTopologyView: React.FC<RuntimeTopologyViewProps> = ({
  onBackToCitizenPortal,
  onNavigateSidebar,
  activeSidebarTab = 'runtime-topology',
}) => {
  const { t } = useLanguage();
  const [concurrencyCount, setConcurrencyCount] = useState<number>(4);
  const [liveClock, setLiveClock] = useState<string>('11:42:09 IST');
  const [workflowsCount, setWorkflowsCount] = useState<number>(1428);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [isFailoverActive, setIsFailoverActive] = useState<boolean>(false);
  const [failoverStatus, setFailoverStatus] = useState<string>('SIMULATED READY');
  const [logs, setLogs] = useState<TelemetryLog[]>(INITIAL_LOGS);
  const [isPlayingKannadaAudio, setIsPlayingKannadaAudio] = useState<boolean>(false);

  const handleAudioTTS = () => {
    setIsPlayingKannadaAudio(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(
        'ನಾನು ಹಾವೇರಿಯಲ್ಲಿ 2 ಎಕರೆ ಜಮೀನು ಹೊಂದಿರುವ ಸಣ್ಣ ರೈತ. ಹನಿ ನೀರಾವರಿ ಅಥವಾ ರಸಗೊಬ್ಬರಕ್ಕೆ ಸಬ್ಸಿಡಿ ಇದೆಯೇ?'
      );
      utt.rate = 0.9;
      utt.lang = 'kn-IN';
      utt.onend = () => setIsPlayingKannadaAudio(false);
      utt.onerror = () => setIsPlayingKannadaAudio(false);
      window.speechSynthesis.speak(utt);
    } else {
      setTimeout(() => setIsPlayingKannadaAudio(false), 2500);
    }
  };

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Update real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + ' IST';
      setLiveClock(timeStr);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (tag: TelemetryLog['tag'], message: string, level: TelemetryLog['level'] = 'info') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const newEntry: TelemetryLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: timeStr,
      tag,
      message,
      level,
    };
    setLogs((prev) => [...prev, newEntry]);
  };

  const handleRunDemo = () => {
    setIsDemoRunning(true);
    addLog('ORCHESTRATOR', 'Initiating 4-User Parallel Civic Ingress Demo...', 'info');

    setTimeout(() => {
      addLog('PREDICTOR', 'Analyzing pipeline dependencies for User 1 & 2. Scheme DB slot contention detected.', 'warn');
    }, 500);

    setTimeout(() => {
      addLog('MUTEX_LOCK', 'Pre-allocated locks: LLM Token Pool (3/3), Scheme Rules DB (2/2). Zero thread block.', 'success');
      setWorkflowsCount((c) => c + 4);
    }, 1200);

    setTimeout(() => {
      addLog('QUEUE_OPTIMIZER', 'Prioritized User 3 (<24hr deadline). Re-ordered deterministic queue.', 'info');
    }, 2000);

    setTimeout(() => {
      addLog('DISPATCHER', 'All 4 concurrent citizen workflows satisfied in 1,180ms. Latency saved: 640ms.', 'success');
      setIsDemoRunning(false);
    }, 3000);
  };

  const handleTriggerFailover = () => {
    setIsFailoverActive(true);
    setFailoverStatus('FAILOVER RECOVERED (0ms LOSS)');
    addLog('CIRCUIT_BREAKER', 'Fault Injected: Node-3 DB Replica timed out (>5000ms). Tripping circuit breaker...', 'alert');

    setTimeout(() => {
      addLog('ORCHESTRATOR', 'Automated Fallback to Local Redis SWR Cache. 1,428 active citizen sessions preserved without drop.', 'success');
    }, 1000);

    setTimeout(() => {
      setIsFailoverActive(false);
      setFailoverStatus('HEALTHY / RECONNECTED');
      addLog('ORCHESTRATOR', 'Node-3 DB Replica restored. Replay buffer drained. Resuming normal topology.', 'info');
    }, 4500);
  };

  const handleResetState = () => {
    setLogs(INITIAL_LOGS);
    setConcurrencyCount(4);
    setIsFailoverActive(false);
    setFailoverStatus('SIMULATED READY');
    addLog('STREAM', 'Graph queues flushed. Baseline locks re-established.', 'info');
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="flex min-h-screen bg-surface font-body-md text-on-surface">
      {/* Left Fixed Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col pt-4 pb-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-outline-variant/30">
        <div className="px-4 mb-4 flex flex-col">
          <button
            type="button"
            onClick={onBackToCitizenPortal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold shadow-xs border border-outline-variant/30 transition-all mb-3 w-fit"
            title="Return to previous screen"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>{t.back}</span>
          </button>
          <div
            onClick={onBackToCitizenPortal}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img
              alt="SchemeSaathi Civic-AI Logo"
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              src={SCHEMESAATHI_LOGO_URL}
            />
            <span className="text-xl text-primary font-bold">SchemeSaathi</span>
          </div>
          <span className="font-mono text-[11px] text-on-surface-variant uppercase mt-1">
            Agent Runtime Console
          </span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-2 flex flex-col gap-1">
          <button
            onClick={() => onNavigateSidebar('runtime-topology')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-all rounded-lg text-sm text-left cursor-pointer ${
              activeSidebarTab === 'runtime-topology'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">schema</span>
            <span>A3 Runtime Canvas</span>
          </button>

          <button
            onClick={() => onNavigateSidebar('scheme-graph-engine')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-all cursor-pointer ${
              activeSidebarTab === 'scheme-graph-engine'
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">travel_explore</span>
            <span>Discover Schemes Portal</span>
          </button>
        </nav>

        {/* Sidebar Telemetry Footer */}
        <div className="px-4 pt-3 border-t border-outline-variant/30 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
            <span>ACTIVE_AGENTS</span>
            <span className="font-bold text-tertiary">4/4 HEALTHY</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
            <span>LATENCY_VOICE</span>
            <span className="font-bold text-on-surface">142ms</span>
          </div>
        </div>
      </aside>

      {/* Main Execution Canvas */}
      <div className="pl-64 w-full flex flex-col">
        {/* Top Header Bar */}
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-6 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToCitizenPortal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant/30 transition-all shadow-xs"
              title="Return to previous screen"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>{t.back}</span>
            </button>
            <span className="text-xl font-bold text-on-surface">Agent Execution Canvas</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed px-2.5 py-0.5 font-mono text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse"></span>
              LIVE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToCitizenPortal}
              className="px-3.5 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>{t.backToPortal}</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="relative pt-20 w-full px-6 pb-16 bg-surface">
          <div className="flex flex-col w-full space-y-8 max-w-7xl mx-auto">
            {/* Top Hero Controller Status Banner */}
            <section className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-6 shadow-md border border-outline-variant/30">
              <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-secondary-fixed/40 blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col gap-6">
                {/* Master Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed shadow-sm">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
                      </span>
                      <span className="font-mono text-xs font-bold tracking-wide">
                        RUNTIME CONTROLLER: OPTIMAL
                      </span>
                    </div>
                    <span className="text-outline-variant font-mono">|</span>
                    <span className="font-mono text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">schedule</span>
                      <span className="font-bold text-on-surface">{liveClock}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-on-surface-variant uppercase">
                        Workflows Handled
                      </span>
                      <span className="font-mono text-xs text-primary font-bold px-2.5 py-1 rounded bg-surface-container-high">
                        {workflowsCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-on-surface-variant uppercase">
                        Graph Cycle
                      </span>
                      <span className="font-mono text-xs text-tertiary font-bold px-2 py-0.5 rounded bg-tertiary-fixed/60">
                        A3-DIRECTED-SYNC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Core Architecture Title & Subtitle */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-on-secondary-container bg-secondary-fixed font-mono text-[11px] font-bold uppercase tracking-wider">
                      A3 Architecture Core
                    </span>
                    <span className="text-on-surface-variant text-xs font-semibold">
                      एआई ऑर्केस्ट्रेशन और संसाधन पूर्वानुमान
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                    AI Orchestration, Resource Prediction & Dynamic Service-Graph Reservation
                  </h1>
                  <p className="text-sm text-on-surface-variant max-w-4xl leading-relaxed">
                    SchemeSaathi uses predictive runtime resource reservation to coordinate concurrent civic AI workflows and eliminate resource conflicts, starvation, and token exhaustion across shared LLM, vector knowledge-graph, and OCR clusters.
                  </p>
                </div>

                {/* Live Interactive Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low shadow-sm border border-outline-variant/20">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleRunDemo}
                      disabled={isDemoRunning}
                      className={`relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-md hover:bg-primary-container transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        isDemoRunning ? 'brightness-125 ring-2 ring-primary-fixed' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isDemoRunning ? 'sync' : 'play_arrow'}
                      </span>
                      <span>
                        {isDemoRunning ? 'Running Concurrency Simulation...' : 'Run 4-User Concurrency Demo'}
                      </span>
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                      </span>
                    </button>

                    <button
                      onClick={handleTriggerFailover}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all border ${
                        isFailoverActive
                          ? 'bg-error-container text-on-error-container border-error'
                          : 'bg-surface-container-highest text-on-surface hover:bg-error-container hover:text-on-error-container border-outline-variant/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] text-secondary">bolt</span>
                      <span>Simulate DB Spike / Failover</span>
                    </button>

                    <button
                      onClick={handleResetState}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface text-xs font-medium transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                      <span>Reset State</span>
                    </button>
                  </div>

                  {/* Concurrency Slider HUD */}
                  <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-surface-container-lowest shadow-sm border border-outline-variant/20">
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                        Concurrent Citizens
                      </span>
                      <span className="font-mono text-xs font-bold text-primary">
                        Simulated: {concurrencyCount} Users
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={concurrencyCount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setConcurrencyCount(val);
                        addLog('ORCHESTRATOR', `Scaling concurrency load profile to ${val} simulated citizens.`);
                      }}
                      className="w-28 accent-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Demo: Live Voice Ingestion Pipeline */}
            <section className="rounded-2xl bg-inverse-surface text-inverse-on-surface p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-2xl"></div>

              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-surface-container-highest/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container shadow-md">
                    <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-inverse-on-surface">
                      Technical Demo: Live Voice Ingestion Pipeline
                    </h3>
                    <p className="font-mono text-xs text-surface-container-highest uppercase">
                      Multi-Agent Orchestration Engine & Vernacular STT
                    </p>
                  </div>
                </div>

                {/* Language and Acoustic Metric */}
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-inverse-surface/80 font-mono text-xs text-tertiary-fixed font-bold border border-tertiary-fixed/30">
                    <span className="h-2 w-2 rounded-full bg-tertiary-fixed animate-ping"></span>
                    STT Latency: 142ms
                  </span>
                  <button
                    onClick={handleAudioTTS}
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-primary transition-all shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isPlayingKannadaAudio ? 'graphic_eq' : 'volume_up'}
                    </span>
                    <span>
                      {isPlayingKannadaAudio ? 'Playing Resonance...' : 'Listen to Sample Voice (Kannada/English)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Dialog Box Simulation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-6">
                {/* Left: Citizen Utterance */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-surface-container-lowest/10 backdrop-blur-md border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-surface-dim uppercase block">
                      Citizen Spoke (Voice Input Sample)
                    </span>
                    <span className="font-mono text-[10px] text-tertiary-fixed font-bold px-2 py-0.5 rounded bg-white/10">
                      Speech Captured
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-medium text-surface-bright leading-relaxed italic">
                    "ನಾನು ಹಾವೇರಿಯಲ್ಲಿ 2 ಎಕರೆ ಜಮೀನು ಹೊಂದಿರುವ ಸಣ್ಣ ರೈತ. ಹನಿ ನೀರಾವರಿ ಅಥವಾ ರಸಗೊಬ್ಬರಕ್ಕೆ ಸಬ್ಸಿಡಿ ಇದೆಯೇ?"
                  </p>
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-surface-container-highest text-xs">
                    <span>
                      Translation: "I am a small farmer with 2 acres in Haveri, Karnataka. Are there subsidies for drip irrigation or fertilizer?"
                    </span>
                  </div>
                </div>

                {/* Center: Step Trajectory Agent Badges */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <span className="font-mono text-xs text-surface-dim uppercase">Autonomous Resolution Path</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-inverse-surface/90 shadow-sm border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">mic_none</span>
                        <span className="font-mono text-xs text-inverse-on-surface">STEP 1: Bhāshini STT</span>
                      </div>
                      <span className="font-mono text-xs text-tertiary-fixed font-bold">VERIFIED (142ms)</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-inverse-surface/90 shadow-sm border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">person_pin</span>
                        <span className="font-mono text-xs text-inverse-on-surface">STEP 2: Profile Extractor</span>
                      </div>
                      <span className="font-mono text-xs text-tertiary-fixed font-bold">EXTRACTED (4 Attributes)</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-inverse-surface/90 shadow-sm border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-fixed text-[18px]">hub</span>
                        <span className="font-mono text-xs text-inverse-on-surface">STEP 3: Scheme Graph</span>
                      </div>
                      <span className="font-mono text-xs text-primary-fixed font-bold">3 MATCHES</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 shadow-sm border border-secondary/30">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary-fixed text-[18px]">policy</span>
                        <span className="font-mono text-xs text-inverse-on-surface">STEP 4: Eligibility Rules</span>
                      </div>
                      <span className="font-mono text-xs text-secondary-fixed font-bold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary-fixed animate-ping"></span>
                        CHECKING (Deterministic)
                      </span>
                    </div>
                  </div>

                  {/* Animated Waveform Visualizer */}
                  <div className="mt-2 p-3 rounded-xl bg-surface-container-lowest/5 flex items-center justify-between gap-4">
                    <span className="font-mono text-[11px] text-surface-container-high">AUDIO RESONANCE (8kHz-16kHz)</span>
                    <div className="flex items-center gap-1 h-6 flex-1 justify-center">
                      <span className="w-1 bg-tertiary-fixed-dim rounded-full h-2 animate-bounce"></span>
                      <span className="w-1 bg-tertiary-fixed-dim rounded-full h-4 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1 bg-primary-fixed rounded-full h-6 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1 bg-primary-fixed rounded-full h-3 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                      <span className="w-1 bg-secondary-fixed rounded-full h-5 animate-bounce" style={{ animationDelay: '0.25s' }}></span>
                      <span className="w-1 bg-secondary-fixed rounded-full h-3 animate-bounce" style={{ animationDelay: '0.05s' }}></span>
                      <span className="w-1 bg-tertiary-fixed rounded-full h-5 animate-bounce" style={{ animationDelay: '0.18s' }}></span>
                      <span className="w-1 bg-tertiary-fixed rounded-full h-2 animate-bounce" style={{ animationDelay: '0.12s' }}></span>
                    </div>
                    <span className="font-mono text-xs text-tertiary-fixed font-bold">SNR: 28.4 dB</span>
                  </div>
                </div>
              </div>
            </section>
            <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-md border border-outline-variant/30 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider">
                      Live Pipeline Topology
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-on-surface mt-1">
                    Interactive Runtime Service-Graph
                  </h2>
                </div>

                {/* Graph Legend */}
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed font-semibold">
                    <span className="h-2 w-2 rounded-full bg-tertiary"></span>Running
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high text-primary font-semibold">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>Reserved
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-semibold">
                    <span className="h-2 w-2 rounded-full bg-secondary-container"></span>Waiting
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-highest text-on-surface-variant font-semibold">
                    <span className="h-2 w-2 rounded-full bg-secondary"></span>Predicted
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-error-container text-on-error-container font-semibold">
                    <span className="h-2 w-2 rounded-full bg-error"></span>Unavailable
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low text-outline font-semibold">
                    <span className="h-2 w-2 rounded-full bg-outline"></span>Idle
                  </span>
                </div>
              </div>

              {/* Topological Graph Canvas */}
              <div className="relative overflow-x-auto p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/20">
                {/* Animated SVG Interconnect Cables */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none stroke-outline-variant/60"
                  preserveAspectRatio="none"
                  viewBox="0 0 1000 450"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 280 70 C 340 70, 340 90, 400 90"
                    fill="none"
                    stroke="#005e40"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="animate-pulse"
                  />
                  <path
                    d="M 280 155 C 340 155, 340 160, 400 160"
                    fill="none"
                    stroke="#005c55"
                    strokeWidth="2"
                  />
                  <path
                    d="M 280 240 C 340 240, 340 230, 400 230"
                    fill="none"
                    stroke="#fe932c"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                  <path
                    d="M 280 325 C 340 325, 340 300, 400 300"
                    fill="none"
                    stroke="#80d5cb"
                    strokeWidth="2"
                  />

                  {/* Hub to Infrastructure */}
                  <path
                    d="M 680 90 C 740 90, 750 60, 810 60"
                    fill="none"
                    stroke="#005e40"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M 680 160 C 740 160, 750 135, 810 135"
                    fill="none"
                    stroke="#005e40"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M 680 230 C 740 230, 750 210, 810 210"
                    fill="none"
                    stroke="#005c55"
                    strokeDasharray="5 3"
                    strokeWidth="2"
                  />
                  <path
                    d="M 680 300 C 740 300, 750 280, 810 280"
                    fill="none"
                    stroke="#fe932c"
                    strokeDasharray="4 4"
                    strokeWidth="2"
                  />
                </svg>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-[940px]">
                  {/* Column 1: Citizen Ingress Stream */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                      <span className="font-mono text-xs uppercase text-on-surface-variant font-bold">
                        1. Citizen Ingress Stream
                      </span>
                      <span className="font-mono text-xs text-primary font-bold">
                        {concurrencyCount} Active
                      </span>
                    </div>

                    {INITIAL_CITIZENS.slice(0, concurrencyCount).map((user) => (
                      <div
                        key={user.id}
                        className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between hover:shadow transition-shadow border border-outline-variant/20"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${user.avatarBg} flex items-center justify-center font-bold text-sm`}
                          >
                            {user.code}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-on-surface">{user.name}</p>
                            <p className="font-mono text-[11px] text-on-surface-variant">
                              {user.details}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-mono text-[10px] font-bold">
                          {user.badge}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Column 2: Agent Orchestration Hub */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                      <span className="font-mono text-xs uppercase text-on-surface-variant font-bold">
                        2. Agent Orchestration Hub
                      </span>
                      <span className="font-mono text-xs text-tertiary font-bold">
                        Runtime Lock Active
                      </span>
                    </div>

                    {INITIAL_AGENTS.map((agent) => (
                      <div
                        key={agent.id}
                        className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-outline-variant/20"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[20px] text-primary">
                            {agent.icon}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-on-surface">{agent.name}</p>
                            <p className="font-mono text-[10px] text-on-surface-variant">
                              {agent.subtitle}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            agent.status === 'Running'
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                              : agent.status === 'Reserved'
                              ? 'bg-surface-container-high text-primary'
                              : agent.status === 'Waiting'
                              ? 'bg-secondary-fixed text-on-secondary-fixed'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}
                        >
                          {agent.status === 'Running' && '🟢 RUNNING'}
                          {agent.status === 'Reserved' && '🔵 RESERVED'}
                          {agent.status === 'Waiting' && '🟡 WAITING'}
                          {agent.status === 'Predicted' && '🟠 PREDICTED'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Column 3: Dynamic Resource Clusters */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                      <span className="font-mono text-xs uppercase text-on-surface-variant font-bold">
                        3. Dynamic Resource Clusters
                      </span>
                      <span className="font-mono text-xs text-on-surface font-bold">Pool Locks</span>
                    </div>

                    {INITIAL_RESOURCES.map((res) => (
                      <div
                        key={res.id}
                        className="p-3 rounded-xl bg-surface-container-lowest shadow-sm space-y-1.5 border border-outline-variant/20"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-on-surface flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              {res.icon}
                            </span>
                            {res.name}
                          </span>
                          <span
                            className={`font-mono text-[11px] font-bold ${
                              res.id === 'llm'
                                ? 'text-error'
                                : res.id === 'rules_db'
                                ? 'text-secondary'
                                : 'text-tertiary'
                            }`}
                          >
                            {res.capacityText}
                          </span>
                        </div>
                        <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden flex">
                          <div
                            className={`${res.color} h-full transition-all duration-300`}
                            style={{ width: `${res.progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Predictive Resource Reservation Panel */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 rounded-2xl bg-surface-container-lowest p-6 shadow-md border border-outline-variant/30 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider">
                      Lookahead Reasoning Engine
                    </span>
                    <span className="font-mono text-xs text-tertiary bg-tertiary-fixed/60 px-2 py-0.5 rounded font-bold">
                      PRE-RESERVATION ACTIVE
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mt-1">
                    Predictive Resource Reservation Logic
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Currently Executing Card */}
                  <div className="p-4 rounded-xl bg-surface-container-low border-l-4 border-primary space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">terminal</span>
                      <span className="font-mono text-[11px] uppercase text-on-surface-variant font-bold">
                        Executing Agent Node
                      </span>
                    </div>
                    <p className="text-sm font-bold text-on-surface">Profile Agent ➔ LLM Cluster</p>
                    <p className="font-mono text-xs text-on-surface-variant">
                      Batch #240 • 1,840 Indic Tokens
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-tertiary font-mono text-xs font-bold">
                      <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                      <span>Parsing Kannada Dialect Constraints...</span>
                    </div>
                  </div>

                  {/* Next Step Lookahead Card */}
                  <div className="p-4 rounded-xl bg-surface-container-low border-l-4 border-secondary space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[18px]">
                        psychology
                      </span>
                      <span className="font-mono text-[11px] uppercase text-on-surface-variant font-bold">
                        Controller Lookahead (+1.2s)
                      </span>
                    </div>
                    <p className="text-sm font-bold text-on-surface">Predicted: Eligibility Engine</p>
                    <p className="text-xs text-on-surface-variant leading-snug">
                      Predicted Eligibility Agent will require{' '}
                      <span className="font-bold text-on-surface">[Scheme DB + Rules Engine]</span> in ~1.2s.
                    </p>
                    <div className="pt-1 flex items-center gap-1.5 text-secondary font-mono text-xs font-bold">
                      <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                      <span>Pre-emptively booking Slot #2</span>
                    </div>
                  </div>
                </div>

                {/* Action Taken Status Strip */}
                <div className="p-4 rounded-xl bg-primary-fixed/20 flex flex-wrap items-center justify-between gap-4 border border-primary-fixed/40">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">
                      verified_user
                    </span>
                    <div>
                      <p className="text-xs font-bold text-on-surface">
                        Pre-Reservation Lock Acquired Ahead of Time
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Scheme DB slot #2 pre-reserved. Vector DB lock acquired in background. Resource starvation prevented.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-sm border border-outline-variant/20">
                    <span className="material-symbols-outlined text-secondary text-[18px]">bolt</span>
                    <span className="font-mono text-xs text-secondary font-bold">
                      640ms Latency Eliminated
                    </span>
                  </div>
                </div>
              </div>

              {/* Latency Impact Telemetry Bento */}
              <div className="lg:col-span-4 rounded-2xl bg-surface-container-lowest p-6 shadow-md border border-outline-variant/30 flex flex-col justify-between space-y-4">
                <div>
                  <span className="font-mono text-xs text-on-surface-variant font-bold uppercase">
                    Efficiency Metric
                  </span>
                  <h4 className="text-base font-bold text-on-surface mt-1">Sequential Lock-Wait Saved</h4>
                </div>

                {/* Donut & Latency Metric */}
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-surface-container-high"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-primary"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="78, 100"
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="font-mono text-[22px] font-bold text-on-surface leading-none">
                        -640ms
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant uppercase mt-1">
                        Total Speedup
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-outline-variant/30">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-on-surface-variant">Baseline Sequential:</span>
                    <span className="font-bold text-on-surface">1,820ms</span>
                  </div>
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-on-surface-variant">A3 Predictive Pipeline:</span>
                    <span className="font-bold text-tertiary">1,180ms (-35.1%)</span>
                  </div>
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-on-surface-variant">Failure Probability:</span>
                    <span className="font-bold text-tertiary">0.02% (Target &lt; 0.5%)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Live 4-User Concurrency Monitor */}
            <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-md border border-outline-variant/30 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-secondary-container"></span>
                    <span className="font-mono text-xs text-secondary font-bold uppercase tracking-wider">
                      Starvation Prevention Monitor
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mt-1">
                    Live Multi-User Concurrency Distribution
                  </h3>
                </div>
                <span className="font-mono text-xs px-3 py-1 rounded bg-surface-container-high text-on-surface font-semibold">
                  Active Shared Mutex Locks: 3/4
                </span>
              </div>

              {/* 4 Citizen Concurrency Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1 */}
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col justify-between space-y-3 border border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-tertiary-fixed text-on-tertiary-fixed">
                      Slot 1/2
                    </span>
                    <span className="h-2 w-2 rounded-full bg-tertiary animate-ping"></span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">User 1 (Farmer, KA)</h4>
                    <p className="text-xs text-on-surface-variant">Scheme Discovery ➔ Scheme DB</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-outline-variant/30">
                    <span className="font-mono text-[11px] text-tertiary font-bold">🟢 RUNNING</span>
                    <span className="font-mono text-[11px] text-on-surface-variant">420ms elapsed</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col justify-between space-y-3 border border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-tertiary-fixed text-on-tertiary-fixed">
                      Slot 2/2
                    </span>
                    <span className="h-2 w-2 rounded-full bg-tertiary animate-ping"></span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">User 2 (Student, KA)</h4>
                    <p className="text-xs text-on-surface-variant">Scheme Discovery ➔ Scheme DB</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-outline-variant/30">
                    <span className="font-mono text-[11px] text-tertiary font-bold">🟢 RUNNING</span>
                    <span className="font-mono text-[11px] text-on-surface-variant">780ms elapsed</span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="p-4 rounded-xl bg-surface-container-low border-2 border-secondary/40 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-secondary-fixed text-on-secondary-fixed">
                      QUEUED (P0)
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      hourglass_top
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">User 3 (Worker, KL)</h4>
                    <p className="text-xs text-on-surface-variant">Scheme Discovery ➔ Scheme DB</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-outline-variant/30">
                    <span className="font-mono text-[11px] text-secondary font-bold">🟡 DEQUEUE IN 0.8s</span>
                    <span className="font-mono text-[11px] text-on-secondary-container font-semibold">
                      Priority: HIGH
                    </span>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col justify-between space-y-3 border border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-primary-fixed text-on-primary-fixed">
                      OCR-PRE-RESERVE
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-primary">lock</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">User 4 (Farmer, Haveri)</h4>
                    <p className="text-xs text-on-surface-variant">Doc Verify ➔ OCR Engine</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-outline-variant/30">
                    <span className="font-mono text-[11px] text-primary font-bold">🔵 RESERVED</span>
                    <span className="font-mono text-[11px] text-on-surface-variant">Ready for feed</span>
                  </div>
                </div>
              </div>

              {/* Cluster Resource Capacity Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-surface-container-high/60 space-y-2 border border-outline-variant/20">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-on-surface">LLM Token Pool</span>
                    <span className="font-mono font-bold text-error">FULL 100%</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-error h-full w-full"></div>
                  </div>
                  <span className="font-mono text-[11px] text-on-surface-variant block">
                    2 active + 1 reserved (Cap: 3)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-high/60 space-y-2 border border-outline-variant/20">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-on-surface">Scheme Rules DB</span>
                    <span className="font-mono font-bold text-secondary">LOCKED</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-secondary-container h-full w-full"></div>
                  </div>
                  <span className="font-mono text-[11px] text-on-surface-variant block">
                    2/2 Active • Auto-dequeue ~0.8s
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-high/60 space-y-2 border border-outline-variant/20">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-on-surface">OCR Service</span>
                    <span className="font-mono font-bold text-tertiary">AVAILABLE</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-tertiary h-full w-1/2"></div>
                  </div>
                  <span className="font-mono text-[11px] text-on-surface-variant block">
                    1/2 Active (50% headroom)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-high/60 space-y-2 border border-outline-variant/20">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-on-surface">Bhashini Voice</span>
                    <span className="font-mono font-bold text-tertiary">AVAILABLE</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-tertiary h-full w-1/4"></div>
                  </div>
                  <span className="font-mono text-[11px] text-on-surface-variant block">
                    1/4 Active (75% headroom)
                  </span>
                </div>
              </div>
            </section>

            {/* Section 4: Intelligent Priority Queue & Failure Recovery Simulator */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Priority Queue Table */}
              <div className="lg:col-span-7 rounded-2xl bg-surface-container-lowest p-6 shadow-md border border-outline-variant/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-on-surface-variant font-bold uppercase">
                      Dynamic Dispatcher
                    </span>
                    <h3 className="text-lg font-bold text-on-surface">Intelligent Task Priority Queue</h3>
                  </div>
                  <span className="font-mono text-xs text-on-surface-variant">4 Workflows Ranked</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="font-mono text-[11px] text-on-surface-variant uppercase border-b border-outline-variant/30">
                      <tr>
                        <th className="pb-2">Task ID</th>
                        <th className="pb-2">Action &amp; Citizen</th>
                        <th className="pb-2">Priority</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 font-mono font-bold text-primary">#9812</td>
                        <td className="py-3">
                          <p className="font-semibold text-on-surface">Application Submission</p>
                          <p className="font-mono text-[10px] text-on-surface-variant">
                            User 1 (Farmer, PM-Kisan)
                          </p>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono text-[10px] font-bold">
                            🔴 HIGH
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-mono text-tertiary font-semibold">Active</span>
                        </td>
                      </tr>

                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 font-mono font-bold text-primary">#9814</td>
                        <td className="py-3">
                          <p className="font-semibold text-on-surface">Scheme Deadline &lt;24hr</p>
                          <p className="font-mono text-[10px] text-on-surface-variant">
                            User 3 (Expedited Queue)
                          </p>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono text-[10px] font-bold">
                            🟠 HIGH
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-mono text-secondary font-semibold">Expedited</span>
                        </td>
                      </tr>

                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 font-mono font-bold text-primary">#9815</td>
                        <td className="py-3">
                          <p className="font-semibold text-on-surface">Eligibility Check</p>
                          <p className="font-mono text-[10px] text-on-surface-variant">
                            User 2 (Student SSP)
                          </p>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-mono text-[10px] font-bold">
                            🟡 MEDIUM
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-mono text-primary font-semibold">Reserved</span>
                        </td>
                      </tr>

                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 font-mono font-bold text-primary">#9816</td>
                        <td className="py-3">
                          <p className="font-semibold text-on-surface">General Scheme Browse</p>
                          <p className="font-mono text-[10px] text-on-surface-variant">
                            User 4 (Informational)
                          </p>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-outline font-mono text-[10px] font-bold">
                            🟢 NORMAL
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-mono text-on-surface-variant font-semibold">Queued</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Failure Recovery Simulator Box */}
              <div className="lg:col-span-5 rounded-2xl bg-surface-container-lowest p-6 shadow-md border border-outline-variant/30 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-secondary">healing</span>
                    <span className="font-mono text-xs text-secondary font-bold uppercase">
                      Self-Healing Runtime
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mt-1">
                    Failure Recovery Simulator
                  </h3>
                </div>

                <div
                  className={`p-4 rounded-xl space-y-3 transition-all duration-300 border ${
                    isFailoverActive
                      ? 'bg-error-container/40 border-error'
                      : 'bg-surface-container-low border-outline-variant/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-on-surface-variant font-bold">
                      INCIDENT #4028
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                        isFailoverActive
                          ? 'bg-error text-on-error'
                          : 'bg-secondary-fixed text-on-secondary-fixed'
                      }`}
                    >
                      {failoverStatus}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        warning
                      </span>
                      <span>Scheme Database Node-3 Connection Timeout</span>
                    </p>
                    <p className="font-mono text-[11px] text-on-surface-variant mt-1">
                      Simulated 5000ms latency anomaly on Master DB replica.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-lowest space-y-2 border border-outline-variant/20">
                    <span className="font-mono text-[10px] text-primary font-bold uppercase block">
                      Automated Orchestrator Response
                    </span>
                    <p className="text-xs text-on-surface leading-relaxed">
                      {isFailoverActive
                        ? '⚠️ Fault injected: Master DB connection dropped! Redis SWR cache auto-served 1,428 keys. Reconnect backoff initialized.'
                        : 'Triggered Circuit Breaker ➔ Fallback to Stale-While-Revalidate Local Redis Cache ➔ Zero dropped citizen requests. Workflow State Preserved (100%).'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-mono text-xs text-on-surface-variant">Resilience SLA: 99.98%</span>
                  <button
                    onClick={handleTriggerFailover}
                    className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-mono font-semibold text-[13px] hover:brightness-110 transition-all shadow-sm"
                  >
                    Trigger Instant Node Fault
                  </button>
                </div>
              </div>
            </section>

            {/* Section 5: Real-time Orchestration Event Logs */}
            <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-md border border-outline-variant/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                  <h3 className="text-lg font-bold text-on-surface">
                    Real-Time Orchestration Event Logs
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-tertiary font-bold">
                    <span className="h-2 w-2 rounded-full bg-tertiary animate-pulse"></span>
                    STREAMING 100HZ
                  </span>
                  <button
                    onClick={handleClearLogs}
                    className="px-2.5 py-1 rounded bg-surface-container-low text-on-surface-variant font-mono text-xs hover:text-on-surface border border-outline-variant/20"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Terminal Log Window */}
              <div
                ref={logContainerRef}
                className="rounded-xl bg-inverse-surface text-inverse-on-surface p-4 font-mono text-[12px] leading-relaxed max-h-56 overflow-y-auto space-y-1 shadow-inner border border-black/40"
              >
                {logs.length === 0 ? (
                  <div className="text-outline-variant italic">No event logs recorded. Trigger an action above.</div>
                ) : (
                  logs.map((item) => (
                    <div key={item.id} className="flex gap-3 text-outline-variant">
                      <span className="text-tertiary-fixed-dim">[{item.timestamp}]</span>
                      <span
                        className={
                          item.tag === 'DISPATCHER'
                            ? 'text-primary-fixed font-bold'
                            : item.tag === 'PREDICTOR'
                            ? 'text-secondary-fixed-dim font-bold'
                            : item.tag === 'MUTEX_LOCK'
                            ? 'text-tertiary-fixed font-bold'
                            : item.tag === 'CIRCUIT_BREAKER'
                            ? 'text-error font-bold'
                            : 'text-primary-fixed-dim font-bold'
                        }
                      >
                        [{item.tag}]
                      </span>
                      <span className="text-surface-bright">{item.message}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};
