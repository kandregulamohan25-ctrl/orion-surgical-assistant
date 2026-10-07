import React, { useState } from 'react';
import { SimulationScenario, SyntheticPatient } from '../types';
import { SYNTHETIC_PATIENTS } from '../data/patients';
import { Sliders, Play, Plus, Trash2, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { ActiveTab } from '../components/Navbar';

interface ScenarioBuilderProps {
  onSaveAndRunScenario: (scenario: SimulationScenario) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  onSaveAndRunScenario,
  setActiveTab
}) => {
  const [scenarioName, setScenarioName] = useState<string>('Custom Multi-Speaker Stress Test');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(SYNTHETIC_PATIENTS[0].id);
  const [difficulty, setDifficulty] = useState<SimulationScenario['difficulty']>('Challenging');
  const [noiseLevel, setNoiseLevel] = useState<SimulationScenario['noiseLevel']>('Normal OR');
  const [hasContradiction, setHasContradiction] = useState<boolean>(true);
  const [hasInterruption, setHasInterruption] = useState<boolean>(true);
  const [hasMissingConsent, setHasMissingConsent] = useState<boolean>(false);
  const [hasUncertainSpeech, setHasUncertainSpeech] = useState<boolean>(false);

  // Script turns editor
  const [scriptTurns, setScriptTurns] = useState<Array<{
    speaker: 'Surgeon' | 'Circulating Nurse' | 'Anesthesiologist' | 'Scrub Tech';
    text: string;
    confidence: number;
    isInterruption?: boolean;
    isContradictionTrigger?: boolean;
  }>>([
    {
      speaker: 'Circulating Nurse',
      text: 'Starting time out. Patient identity confirmed: Alex Morgan, SIM-0427.',
      confidence: 0.98
    },
    {
      speaker: 'Surgeon',
      text: 'Procedure confirmed: Simulated Left Knee Arthroplasty.',
      confidence: 0.96
    },
    {
      speaker: 'Scrub Tech',
      text: 'Can someone adjust the overhead light?',
      confidence: 0.95,
      isInterruption: true
    },
    {
      speaker: 'Surgeon',
      text: 'Surgical site verified: Left knee marked.',
      confidence: 0.96
    },
    {
      speaker: 'Circulating Nurse',
      text: 'Patient has no known allergies on file.',
      confidence: 0.95
    },
    {
      speaker: 'Anesthesiologist',
      text: 'Wait, patient is allergic to penicillin with rash history.',
      confidence: 0.94,
      isContradictionTrigger: true
    }
  ]);

  const handleAddTurn = () => {
    setScriptTurns([
      ...scriptTurns,
      {
        speaker: 'Circulating Nurse',
        text: 'Signed consent document verified on chart.',
        confidence: 0.95
      }
    ]);
  };

  const handleRemoveTurn = (index: number) => {
    setScriptTurns(scriptTurns.filter((_, i) => i !== index));
  };

  const handleUpdateTurn = (index: number, field: string, val: any) => {
    const updated = [...scriptTurns];
    updated[index] = { ...updated[index], [field]: val };
    setScriptTurns(updated);
  };

  const handleRunCustomScenario = () => {
    const patient = SYNTHETIC_PATIENTS.find(p => p.id === selectedPatientId) || SYNTHETIC_PATIENTS[0];
    const newScenario: SimulationScenario = {
      id: `scen-custom-${Date.now()}`,
      name: scenarioName,
      code: `CUSTOM-${Math.floor(100 + Math.random() * 899)}`,
      badge: 'Custom Builder',
      description: `Constructed scenario with ${scriptTurns.length} turns, noise: ${noiseLevel}, contradiction: ${hasContradiction ? 'Yes' : 'No'}.`,
      patient,
      difficulty,
      noiseLevel,
      hasContradiction,
      hasInterruption,
      hasMissingConsent,
      hasUncertainSpeech,
      scriptedTimeline: scriptTurns.map((turn, i) => ({
        delayMs: 2800,
        speaker: turn.speaker,
        text: turn.text,
        confidence: turn.confidence,
        isInterruption: turn.isInterruption,
        isContradictionTrigger: turn.isContradictionTrigger
      }))
    };

    onSaveAndRunScenario(newScenario);
    setActiveTab('live-simulation');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Simulation Testbed
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Operating Room Scenario Constructor
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Design controlled test scenarios with intentional clinician mistakes, ambient acoustic degradation, conversational interruptions, and conflicting laterality statements.
          </p>
        </div>

        <button
          onClick={handleRunCustomScenario}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Play className="h-4 w-4" />
          Run Custom Simulation
        </button>
      </div>

      {/* Scenario Parameters Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Core Scenario Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Scenario Title</label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Synthetic Patient Profile</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {SYNTHETIC_PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.simulationId}) — {p.scheduledProcedure}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Ambient Noise Level</label>
            <select
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Quiet">Quiet (Simulated Lab)</option>
              <option value="Normal OR">Normal Operating Room</option>
              <option value="High Ambient Noise">High Ambient Suction / Telemetry</option>
            </select>
          </div>
        </div>

        {/* Behavioral Challenge Toggles */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={hasContradiction}
              onChange={(e) => setHasContradiction(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium text-slate-800">Contradiction Event</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={hasInterruption}
              onChange={(e) => setHasInterruption(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium text-slate-800">Interruption Handling</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={hasMissingConsent}
              onChange={(e) => setHasMissingConsent(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium text-slate-800">Missing Consent Gating</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={hasUncertainSpeech}
              onChange={(e) => setHasUncertainSpeech(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium text-slate-800">Low-Confidence Audio</span>
          </label>
        </div>
      </div>

      {/* Scripted Dialogue Turns Constructor */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Scripted Conversation Turns ({scriptTurns.length} Steps)
            </h3>
            <p className="text-xs text-slate-500">
              Define the sequence of utterances ORION will process during simulation playback.
            </p>
          </div>

          <button
            onClick={handleAddTurn}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Utterance Step
          </button>
        </div>

        <div className="space-y-3">
          {scriptTurns.map((turn, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row items-center gap-3 text-xs">
              <span className="font-mono text-slate-400 font-bold shrink-0">
                #{idx + 1}
              </span>

              <select
                value={turn.speaker}
                onChange={(e) => handleUpdateTurn(idx, 'speaker', e.target.value)}
                className="bg-white border border-slate-200 rounded-md p-1.5 font-semibold text-slate-800 focus:outline-none cursor-pointer shrink-0"
              >
                <option value="Surgeon">Surgeon</option>
                <option value="Circulating Nurse">Circulating Nurse</option>
                <option value="Anesthesiologist">Anesthesiologist</option>
                <option value="Scrub Tech">Scrub Tech</option>
              </select>

              <input
                type="text"
                value={turn.text}
                onChange={(e) => handleUpdateTurn(idx, 'text', e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-md p-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <div className="flex items-center gap-3 shrink-0">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!turn.isInterruption}
                    onChange={(e) => handleUpdateTurn(idx, 'isInterruption', e.target.checked)}
                  />
                  <span className="text-[11px] text-slate-600">Interruption</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!turn.isContradictionTrigger}
                    onChange={(e) => handleUpdateTurn(idx, 'isContradictionTrigger', e.target.checked)}
                  />
                  <span className="text-[11px] text-rose-600 font-semibold">Contradiction</span>
                </label>

                <button
                  onClick={() => handleRemoveTurn(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="Delete Step"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
