import React, { useState, useEffect } from 'react';
import { Settings, Volume2, Mic, BookOpen, Trash2, CheckCircle2, ShieldCheck, Play, Sparkles } from 'lucide-react';
import { speechService } from '../speech/speechService';
import { auditLogger } from '../audit/auditLogger';

interface SettingsPageProps {
  onResetEverything: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onResetEverything }) => {
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [noiseLevel, setNoiseLevel] = useState<'Quiet' | 'Normal OR' | 'High Ambient Noise'>('Normal OR');
  const [speechEngine, setSpeechEngine] = useState<'browser-native' | 'whisper-pluggable' | 'local-synthetic'>('browser-native');
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [englishVoices, setEnglishVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [testSpeechStatus, setTestSpeechStatus] = useState<string | null>(null);

  useEffect(() => {
    setTtsEnabled(speechService.isTtsEnabled());
    setNoiseLevel(speechService.getNoiseLevel());

    const loadVoices = () => {
      const voices = speechService.getAvailableEnglishVoices();
      setEnglishVoices(voices);
      const current = speechService.getSelectedVoice();
      if (current) {
        setSelectedVoiceName(current.name);
      } else if (voices.length > 0) {
        setSelectedVoiceName(voices[0].name);
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoiceName(voiceName);
    speechService.setVoiceByName(voiceName);
  };

  const handleTestVoice = () => {
    setTestSpeechStatus("Playing English audio test...");
    speechService.testVoice("ORION operating room assistant ready. Identity and pre-incision safety checks confirmed in English.");
    setTimeout(() => {
      setTestSpeechStatus(null);
    }, 4500);
  };

  const handleSave = () => {
    speechService.setTtsEnabled(ttsEnabled);
    speechService.setNoiseLevel(noiseLevel);
    if (selectedVoiceName) {
      speechService.setVoiceByName(selectedVoiceName);
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handlePurgeLogs = () => {
    if (window.confirm("Purge active simulation audit logs? This cannot be undone.")) {
      auditLogger.clear();
      onResetEverything();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            System Configuration
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            ORION Hardware & Telemetry Settings
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Configure full-duplex speech recognition, select dedicated English TTS voices, simulated ambient OR noise levels, and protocol knowledge base bindings.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" />
          Save Preferences
        </button>
      </div>

      {savedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Configuration saved successfully.</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audio & Speech Module */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Mic className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Speech Pipeline & English Voice Selection
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* English Voice Selector */}
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-blue-950 block">
                  Designated English Voice (en-US / en-GB)
                </label>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                  Locale: en-US
                </span>
              </div>

              <select
                value={selectedVoiceName}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="w-full p-2 bg-white border border-blue-300 rounded-md text-slate-900 font-medium cursor-pointer focus:ring-1 focus:ring-blue-500"
              >
                {englishVoices.length === 0 ? (
                  <option value="">Default English System Voice (en-US)</option>
                ) : (
                  englishVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))
                )}
              </select>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-blue-800">
                  {testSpeechStatus || "Guaranteed English pronunciation"}
                </span>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Play className="h-3 w-3" />
                  Test English Voice
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Primary STT Engine Abstraction
              </label>
              <select
                value={speechEngine}
                onChange={(e) => setSpeechEngine(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 cursor-pointer"
              >
                <option value="browser-native">Web Speech API (Real Microphone Continuous Stream — en-US)</option>
                <option value="whisper-pluggable">OpenAI Whisper / Self-Hosted REST Pluggable Endpoint</option>
                <option value="local-synthetic">Deterministic Synthetic Audio Simulator (No Mic Required)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Simulated Operating Room Acoustics
              </label>
              <select
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 cursor-pointer"
              >
                <option value="Quiet">Quiet (Acoustically Treated Laboratory)</option>
                <option value="Normal OR">Standard Operating Room (Ambient monitors & airflow)</option>
                <option value="High Ambient Noise">High Noise (Surgical suction + telemetry alarms active)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-900 block">Full-Duplex Text-To-Speech (TTS)</span>
                  <span className="text-[11px] text-slate-500">Play spoken auditory prompts in English for omissions and updates</span>
                </div>
                <input
                  type="checkbox"
                  checked={ttsEnabled}
                  onChange={(e) => setTtsEnabled(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Protocol & Governance Module */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <BookOpen className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Protocol Governance & Compliance
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Mounted Surgical Safety Protocol
              </label>
              <input
                type="text"
                disabled
                value="WHO Surgical Safety Checklist Part 2 (Before Incision) — Rev SIM-2026.1"
                className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Clinician Confirmation Gate Mode
              </label>
              <select
                disabled
                value="strict"
                className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-not-allowed"
              >
                <option value="strict">Strict Mandatory Dual Verification (Nonclinical Safe Mode)</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Cannot be bypassed: Safety rule requires human clinician authorization for all checklist confirmations.
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-semibold text-rose-800 mb-1">Reset & Clean State</h4>
              <p className="text-[11px] text-slate-500 mb-2">
                Clears dialogue history, active contradictions, and reinitializes the checklist state machine.
              </p>
              <button
                onClick={handlePurgeLogs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Purge All Simulation Data & Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
