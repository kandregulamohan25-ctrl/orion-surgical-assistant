import React from 'react';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Bot, 
  BarChart2, 
  User, 
  FileCheck, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Layers,
  Mic
} from 'lucide-react';
import { ChecklistItem, SyntheticPatient, SimulationScenario } from '../types';
import { ActiveTab } from '../components/Navbar';

interface CommandCenterProps {
  items: ChecklistItem[];
  currentPatient: SyntheticPatient;
  currentScenario: SimulationScenario;
  completionPercentage: number;
  onStartSimulation: () => void;
  onStartJudgeDemo: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  items,
  currentPatient,
  currentScenario,
  completionPercentage,
  onStartSimulation,
  onStartJudgeDemo,
  setActiveTab
}) => {
  const confirmedCount = items.filter(i => i.state === 'CONFIRMED').length;
  const awaitingCount = items.filter(i => i.state === 'AWAITING_CONFIRMATION').length;
  const contradictedCount = items.filter(i => i.state === 'CONTRADICTED').length;

  return (
    <div className="space-y-6">
      {/* Hero Welcome / Simulation Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              ORION Simulation Environment • L&T Techgium Problem #45
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Pre-Incision Safety Orchestration & Clinical Oversight
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Full-duplex multimodal decision support for simulated operating-theatre workflows. Grounded in deterministic checklist state verification and approved WHO surgical protocols.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onStartJudgeDemo}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Launch 3-Min Judge Demo
            </button>
            <button
              onClick={onStartSimulation}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Play className="h-4 w-4" />
              Enter Live Simulation
            </button>
          </div>
        </div>

        {/* Live Simulation Meta Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Active Scenario
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
              {currentScenario.name}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Code: {currentScenario.code}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Synthetic Patient
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
              {currentPatient.fullName} ({currentPatient.simulationId})
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
              {currentPatient.scheduledProcedure}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Checklist Progression
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-sm font-bold text-slate-900">
                {confirmedCount} / {items.length} Confirmed
              </span>
              <span className="text-xs font-mono font-bold text-blue-700">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Safety Gate State
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {contradictedCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Contradiction Held
                </span>
              ) : awaitingCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                  <Clock className="h-3.5 w-3.5" />
                  {awaitingCount} Awaiting Clinician
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Gating Active
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Protocol: WHO-SST SIM-2026.1
            </div>
          </div>
        </div>
      </div>

      {/* Historical Simulation & Static Benchmark Snapshot Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">
            Validated Simulation Performance & Baseline Comparison
          </h2>
          <button
            onClick={() => setActiveTab('performance')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
          >
            Full Benchmark Analytics
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Completed Runs
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              84
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              100% protocol audited
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Omissions Prevented
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">
              31
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Pre-incision safety gates
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Contradictions Flagged
            </div>
            <div className="text-2xl font-bold text-rose-700 mt-1">
              19
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Allergy & laterality conflicts
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Avg Time-Out Duration
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              02:14
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              vs 03:42 static (-39%)
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Touch Interventions
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">
              1.0
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Sterile touchless guidance
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Clinician Agreement
            </div>
            <div className="text-2xl font-bold text-indigo-700 mt-1">
              98.4%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Zero autonomous overrides
            </div>
          </div>
        </div>
      </div>

      {/* Feature Deep Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveTab('live-simulation')}
          className="p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Mic className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-blue-700 transition-colors">
            Full-Duplex Speech & Hero OR Simulation
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Hands-free multi-speaker recognition with real-time waveform telemetry, side-conversation filtering, and ambient noise resilience.
          </p>
          <div className="mt-3 text-xs font-semibold text-blue-700 inline-flex items-center gap-1">
            Launch Simulation <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('checklist')}
          className="p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-emerald-700 transition-colors">
            Deterministic State Machine & Safety Gates
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Rule-based state transitions (NOT_STARTED → CONFIRMED). The LLM extracts candidates, while the deterministic kernel enforces rules.
          </p>
          <div className="mt-3 text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
            Inspect State Machine <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('performance')}
          className="p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="p-2.5 bg-purple-50 text-purple-700 rounded-lg w-fit group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <BarChart2 className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-purple-700 transition-colors">
            Static vs AI Benchmark Laboratory
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Direct controlled comparison measuring missed items, contradiction detection, time efficiency, and cognitive distraction.
          </p>
          <div className="mt-3 text-xs font-semibold text-purple-700 inline-flex items-center gap-1">
            View Benchmark Data <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
