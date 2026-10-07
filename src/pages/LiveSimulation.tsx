import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  FileText, 
  UserCheck, 
  Send, 
  Layers, 
  Sliders,
  Sparkles,
  ShieldCheck,
  Radio,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  ChecklistItem, 
  DialogueUtterance, 
  ContradictionEvent, 
  SyntheticPatient, 
  SimulationScenario, 
  AIStatus,
  AIConfidenceBreakdown
} from '../types';
import { AudioWaveform } from '../components/AudioWaveform';
import { ContradictionBanner } from '../components/ContradictionBanner';
import { speechService } from '../speech/speechService';

interface LiveSimulationProps {
  items: ChecklistItem[];
  dialogueHistory: DialogueUtterance[];
  activeContradiction: ContradictionEvent | null;
  aiStatus: AIStatus;
  aiConfidence: AIConfidenceBreakdown;
  currentPatient: SyntheticPatient;
  currentScenario: SimulationScenario;
  onSendUtterance: (utterance: DialogueUtterance) => void;
  onRequestClinicianConfirmation: (item: ChecklistItem) => void;
  onResolveContradiction: (itemCode: string) => void;
  onResetSimulation: () => void;
  onSelectScenario: (scenario: SimulationScenario) => void;
  allScenarios: SimulationScenario[];
}

export const LiveSimulation: React.FC<LiveSimulationProps> = ({
  items,
  dialogueHistory,
  activeContradiction,
  aiStatus,
  aiConfidence,
  currentPatient,
  currentScenario,
  onSendUtterance,
  onRequestClinicianConfirmation,
  onResolveContradiction,
  onResetSimulation,
  onSelectScenario,
  allScenarios
}) => {
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [noiseLevel, setNoiseLevel] = useState<'Quiet' | 'Normal OR' | 'High Ambient Noise'>('Normal OR');
  const [manualInputText, setManualInputText] = useState<string>('');
  const [manualSpeaker, setManualSpeaker] = useState<DialogueUtterance['speaker']>('Surgeon');
  const [selectedItemForEvidence, setSelectedItemForEvidence] = useState<ChecklistItem | null>(items[0]);
  const [isAutoPlayingScenario, setIsAutoPlayingScenario] = useState<boolean>(false);
  const [scriptStepIndex, setScriptStepIndex] = useState<number>(0);

  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueHistory]);

  // Sync mic listener
  useEffect(() => {
    speechService.subscribeTranscript((payload) => {
      const newUtterance: DialogueUtterance = {
        id: `utt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        speaker: 'Surgeon',
        speakerRole: 'Operating Surgeon (Voice Input)',
        text: payload.transcript,
        confidence: payload.confidence
      };
      onSendUtterance(newUtterance);
    });
  }, [onSendUtterance]);

  // Handle scripted auto-play step timer
  useEffect(() => {
    let timer: any;
    if (isAutoPlayingScenario && scriptStepIndex < currentScenario.scriptedTimeline.length) {
      const step = currentScenario.scriptedTimeline[scriptStepIndex];
      timer = setTimeout(() => {
        const utterance: DialogueUtterance = {
          id: `utt-auto-${Date.now()}-${scriptStepIndex}`,
          timestamp: new Date().toLocaleTimeString(),
          speaker: step.speaker,
          speakerRole: `${step.speaker} (Simulated)`,
          text: step.text,
          confidence: step.confidence,
          isInterruption: step.isInterruption,
          isLowConfidence: step.confidence < 0.75
        };
        onSendUtterance(utterance);
        setScriptStepIndex(prev => prev + 1);
      }, step.delayMs || 2500);
    } else if (scriptStepIndex >= currentScenario.scriptedTimeline.length) {
      setIsAutoPlayingScenario(false);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlayingScenario, scriptStepIndex, currentScenario, onSendUtterance]);

  const toggleMicrophone = () => {
    const active = speechService.toggleListening();
    setIsMicActive(active);
  };

  const toggleTts = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    speechService.setTtsEnabled(next);
  };

  const handleNoiseChange = (level: 'Quiet' | 'Normal OR' | 'High Ambient Noise') => {
    setNoiseLevel(level);
    speechService.setNoiseLevel(level);
  };

  const handleManualSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInputText.trim()) return;

    const utterance: DialogueUtterance = {
      id: `utt-man-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      speaker: manualSpeaker,
      speakerRole: `${manualSpeaker} (Manual Input)`,
      text: manualInputText.trim(),
      confidence: noiseLevel === 'High Ambient Noise' ? 0.68 : 0.96
    };

    onSendUtterance(utterance);
    setManualInputText('');
  };

  const executeNextScriptStep = () => {
    if (scriptStepIndex < currentScenario.scriptedTimeline.length) {
      const step = currentScenario.scriptedTimeline[scriptStepIndex];
      const utterance: DialogueUtterance = {
        id: `utt-step-${Date.now()}-${scriptStepIndex}`,
        timestamp: new Date().toLocaleTimeString(),
        speaker: step.speaker,
        speakerRole: `${step.speaker} (Simulated)`,
        text: step.text,
        confidence: step.confidence,
        isInterruption: step.isInterruption,
        isLowConfidence: step.confidence < 0.75
      };
      onSendUtterance(utterance);
      setScriptStepIndex(prev => prev + 1);
    }
  };

  const resetSimulationState = () => {
    setIsAutoPlayingScenario(false);
    setScriptStepIndex(0);
    onResetSimulation();
  };

  const confirmedCount = items.filter(i => i.state === 'CONFIRMED').length;
  const progressPercent = Math.round((confirmedCount / items.length) * 100);

  // Active item needing confirmation
  const awaitingItem = items.find(i => i.state === 'AWAITING_CONFIRMATION') || null;

  return (
    <div className="space-y-4">
      {/* Simulation Scenario Control Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Active Scenario:
            </span>
            <select
              value={currentScenario.id}
              onChange={(e) => {
                const s = allScenarios.find(sc => sc.id === e.target.value);
                if (s) {
                  onSelectScenario(s);
                  setScriptStepIndex(0);
                  setIsAutoPlayingScenario(false);
                }
              }}
              className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {allScenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name} ({sc.badge})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
            <span>Patient:</span>
            <strong className="text-slate-800">{currentPatient.fullName}</strong>
            <span className="font-mono text-slate-400">[{currentPatient.simulationId}]</span>
          </div>
        </div>

        {/* Scripted timeline runner */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Turn {scriptStepIndex} / {currentScenario.scriptedTimeline.length}
          </span>

          <button
            onClick={executeNextScriptStep}
            disabled={scriptStepIndex >= currentScenario.scriptedTimeline.length || isAutoPlayingScenario}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            Next Script Step
          </button>

          <button
            onClick={() => setIsAutoPlayingScenario(!isAutoPlayingScenario)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer ${
              isAutoPlayingScenario 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isAutoPlayingScenario ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isAutoPlayingScenario ? 'Pause Script' : 'Auto Play Scenario'}
          </button>

          <button
            onClick={resetSimulationState}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Contradiction Banner (if triggered) */}
      <ContradictionBanner 
        contradiction={activeContradiction} 
        onResolve={onResolveContradiction} 
      />

      {/* Hero 3-Column Simulation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: CHECKLIST STATE (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Checklist State Machine
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Pre-Incision Time Out
                </h3>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-blue-700">
                  {progressPercent}%
                </span>
                <span className="block text-[10px] font-semibold text-slate-400">
                  {confirmedCount}/{items.length} Confirmed
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist items list */}
            <div className="mt-3 space-y-2">
              {items.map((item) => {
                const isSelected = selectedItemForEvidence?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemForEvidence(item)}
                    className={`p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        {/* State Icon */}
                        {item.state === 'CONFIRMED' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : item.state === 'AWAITING_CONFIRMATION' ? (
                          <Clock className="h-4 w-4 text-amber-500 shrink-0 animate-pulse" />
                        ) : item.state === 'CONTRADICTED' ? (
                          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                        ) : item.state === 'BLOCKED' ? (
                          <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        ) : item.state === 'UNCERTAIN' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                        )}

                        <span className={`font-semibold truncate ${
                          item.state === 'CONFIRMED' ? 'text-slate-900 line-through text-slate-500' : 'text-slate-800'
                        }`}>
                          {item.name}
                        </span>
                      </div>

                      {/* Pill Badge */}
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                        item.state === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.state === 'AWAITING_CONFIRMATION'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : item.state === 'CONTRADICTED'
                          ? 'bg-rose-100 text-rose-800'
                          : item.state === 'BLOCKED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.state.replace('_', ' ')}
                      </span>
                    </div>

                    {item.candidateValue && item.state !== 'CONFIRMED' && (
                      <div className="mt-1 text-[11px] text-blue-700 bg-blue-50/60 p-1 rounded font-medium truncate">
                        Candidate: {item.candidateValue}
                      </div>
                    )}

                    {item.confirmedBy && item.state === 'CONFIRMED' && (
                      <div className="mt-1 text-[10px] text-emerald-700 font-medium">
                        ✓ Confirmed by {item.confirmedBy}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incision Safe Gate Callout */}
          <div className="pt-3 border-t border-slate-100 text-[11px]">
            {progressPercent === 100 && !activeContradiction ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>All items confirmed. Clear for incision.</span>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Pre-incision gate locked until all items verified.</span>
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: LIVE CONVERSATION & TRANSCRIPTION (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between h-[640px]">
          {/* Header & Waveform */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Full-Duplex Multi-Speaker Feed
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Operating Theatre Audio Stream
              </h3>
            </div>

            {/* Restrained animated audio waveform */}
            <AudioWaveform 
              status={aiStatus} 
              confidence={aiConfidence.speechRecognition}
              noiseLevel={noiseLevel}
            />
          </div>

          {/* Transcript Message Scroll Area */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 scrollbar-thin">
            {dialogueHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <Radio className="h-8 w-8 text-slate-300 animate-pulse" />
                <div className="text-sm font-medium text-slate-600">
                  Listening for Operating Room Dialogue...
                </div>
                <p className="text-xs max-w-sm text-slate-400">
                  Speak using your microphone, select a scripted step above, or trigger participant utterances below.
                </p>
              </div>
            ) : (
              dialogueHistory.map((utt) => {
                const isAI = utt.speaker === 'AI Assistant';
                const isInterruption = utt.isInterruption;
                return (
                  <div
                    key={utt.id}
                    className={`flex flex-col ${isAI ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 px-1">
                      <span className={`font-bold ${
                        isAI ? 'text-blue-700' : 'text-slate-800'
                      }`}>
                        {utt.speaker}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-slate-400">{utt.timestamp}</span>
                      {utt.confidence && (
                        <span className={`font-mono text-[10px] px-1 rounded ${
                          utt.confidence >= 0.85 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                        }`}>
                          {Math.round(utt.confidence * 100)}%
                        </span>
                      )}
                    </div>

                    <div className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                      isAI
                        ? 'bg-blue-50/80 border border-blue-200 text-slate-900 shadow-xs'
                        : isInterruption
                        ? 'bg-amber-50 border border-amber-200 text-amber-950 shadow-xs italic'
                        : 'bg-slate-50 border border-slate-200/90 text-slate-900'
                    }`}>
                      {isInterruption && (
                        <span className="inline-block mr-1.5 text-amber-600 font-bold not-italic text-[10px] uppercase">
                          [Side Interruption]
                        </span>
                      )}
                      {utt.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={conversationEndRef} />
          </div>

          {/* Quick Simulated Speaker Chips */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1.5 flex items-center justify-between">
              <span>Quick Simulated Utterances</span>
              <span className="text-[10px] text-slate-400">Click to inject into live conversation</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <button
                onClick={() => {
                  onSendUtterance({
                    id: `utt-inj-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString(),
                    speaker: 'Circulating Nurse',
                    speakerRole: 'Circulating Nurse',
                    text: 'Patient identity verified: Alex Morgan, SIM-0427.',
                    confidence: 0.98
                  });
                }}
                className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-medium cursor-pointer"
              >
                + Identity (Alex Morgan)
              </button>
              <button
                onClick={() => {
                  onSendUtterance({
                    id: `utt-inj-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString(),
                    speaker: 'Surgeon',
                    speakerRole: 'Operating Surgeon',
                    text: 'Procedure confirmed: Left Knee Arthroplasty.',
                    confidence: 0.96
                  });
                }}
                className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-medium cursor-pointer"
              >
                + Procedure (Left Knee)
              </button>
              <button
                onClick={() => {
                  onSendUtterance({
                    id: `utt-inj-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString(),
                    speaker: 'Surgeon',
                    speakerRole: 'Operating Surgeon',
                    text: 'Surgical site verified: Left knee marked.',
                    confidence: 0.97
                  });
                }}
                className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-medium cursor-pointer"
              >
                + Site (Left Marked)
              </button>
              <button
                onClick={() => {
                  onSendUtterance({
                    id: `utt-inj-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString(),
                    speaker: 'Scrub Tech',
                    speakerRole: 'Scrub Tech',
                    text: 'Hold on, can someone check the equipment table and adjust the light?',
                    confidence: 0.94,
                    isInterruption: true
                  });
                }}
                className="text-[11px] px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 font-medium cursor-pointer"
              >
                ⚠ Inject Interruption
              </button>
              <button
                onClick={() => {
                  onSendUtterance({
                    id: `utt-inj-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString(),
                    speaker: 'Anesthesiologist',
                    speakerRole: 'Anesthesiologist',
                    text: 'Patient is allergic to penicillin with rash history.',
                    confidence: 0.95,
                    isContradictionTrigger: true
                  });
                }}
                className="text-[11px] px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded border border-rose-200 font-medium cursor-pointer"
              >
                ⚡ Trigger Contradiction
              </button>
            </div>

            {/* Input & Microphone Controls Form */}
            <form onSubmit={handleManualSend} className="flex items-center gap-2">
              <select
                value={manualSpeaker}
                onChange={(e) => setManualSpeaker(e.target.value as DialogueUtterance['speaker'])}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="Surgeon">Surgeon</option>
                <option value="Circulating Nurse">Circulating Nurse</option>
                <option value="Anesthesiologist">Anesthesiologist</option>
                <option value="Scrub Tech">Scrub Tech</option>
              </select>

              <input
                type="text"
                placeholder="Type simulated OR dialogue or speak into microphone..."
                value={manualInputText}
                onChange={(e) => setManualInputText(e.target.value)}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <button
                type="submit"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
                title="Send Text Utterance"
              >
                <Send className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={toggleMicrophone}
                className={`p-2 rounded-lg text-white transition-colors cursor-pointer shadow-xs ${
                  isMicActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title={isMicActive ? 'Mute Microphone' : 'Enable Real Microphone'}
              >
                {isMicActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: AI ASSISTANT STATE & PROTOCOL EVIDENCE (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                AI Assistant State & Traceability
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Decision Support Telemetry
              </h3>
            </div>

            {/* AI State Badge */}
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Assistant Operating State:
                </span>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  aiStatus === 'LISTENING'
                    ? 'bg-blue-100 text-blue-800'
                    : aiStatus === 'SPEAKING'
                    ? 'bg-emerald-100 text-emerald-800'
                    : aiStatus === 'UNCERTAIN'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-800'
                }`}>
                  {aiStatus}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Overall Confidence:</span>
                <span className="font-mono font-bold text-slate-900">
                  {Math.round(aiConfidence.overallWeightedConfidence * 100)}%
                </span>
              </div>
            </div>

            {/* Clinician Confirmation Gating Action Card (HERO REQUIRED) */}
            {awaitingItem && (
              <div className="mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-lg space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <UserCheck className="h-4 w-4 text-amber-700" />
                  <span>Clinician Confirmation Required</span>
                </div>
                <div className="text-xs text-slate-800">
                  <strong>{awaitingItem.name}:</strong> "{awaitingItem.candidateValue}"
                </div>
                <button
                  onClick={() => onRequestClinicianConfirmation(awaitingItem)}
                  className="w-full py-2 px-3 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Review & Sign Off Item
                </button>
              </div>
            )}

            {/* Traceable Protocol Evidence Card */}
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <FileText className="h-3.5 w-3.5 text-blue-600" />
                <span>Approved Protocol Evidence</span>
              </div>

              {selectedItemForEvidence ? (
                <div className="text-xs space-y-1.5 text-slate-700">
                  <div className="font-bold text-slate-900">
                    {selectedItemForEvidence.protocolRef.protocolTitle}
                  </div>
                  <div className="text-[11px] text-blue-700 font-mono font-semibold">
                    {selectedItemForEvidence.protocolRef.section} ({selectedItemForEvidence.protocolRef.revision})
                  </div>
                  <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                    "{selectedItemForEvidence.protocolRef.excerpt}"
                  </p>
                  <div className="text-[10px] text-slate-500">
                    Deterministic Rule: {selectedItemForEvidence.completionCriteria}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Select a checklist item on the left to inspect approved protocol citations.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Audio / TTS Controls */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Text-to-Speech (TTS):</span>
              <button
                onClick={toggleTts}
                className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
              >
                {ttsEnabled ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
                <span>{ttsEnabled ? 'Enabled' : 'Muted'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Acoustic Noise:</span>
              <select
                value={noiseLevel}
                onChange={(e) => handleNoiseChange(e.target.value as any)}
                className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 cursor-pointer"
              >
                <option value="Quiet">Quiet (Lab)</option>
                <option value="Normal OR">Normal OR</option>
                <option value="High Ambient Noise">High Noise</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
