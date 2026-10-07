import React from 'react';
import { Sparkles, Play, ShieldAlert, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

interface LandingOverlayProps {
  onEnterSimulation: () => void;
  onLaunchJudgeDemo: () => void;
  onOpenArchitecture: () => void;
}

export const LandingOverlay: React.FC<LandingOverlayProps> = ({
  onEnterSimulation,
  onLaunchJudgeDemo,
  onOpenArchitecture
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-6 overflow-y-auto">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in duration-300">
        
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>L&T Techgium 10th Edition • Problem Statement #45</span>
        </div>

        {/* Logo and Headings */}
        <div className="space-y-3">
          <div className="mx-auto h-16 w-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm tracking-tight">
            OR
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
            ORION
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
            Operating Room Intelligence & Observation Navigator
          </p>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
            AI-assisted safety orchestration for simulated operating-room workflows.
          </p>
          <p className="text-sm text-slate-400 font-medium italic">
            "Safer checklists. Clearer communication. Smarter simulation."
          </p>
        </div>

        {/* Core Capabilities Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto text-xs text-slate-600">
          <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium">
            Full-Duplex Speech
          </span>
          <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium">
            Deterministic State Engine
          </span>
          <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium">
            Contradiction Detection
          </span>
          <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium">
            Traceable WHO Protocols
          </span>
          <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium">
            Mandatory Clinician Gating
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onLaunchJudgeDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Launch 3-Minute Judge Demo
          </button>

          <button
            onClick={onEnterSimulation}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Play className="h-4 w-4" />
            Enter Simulation
          </button>

          <button
            onClick={onOpenArchitecture}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Layers className="h-4 w-4" />
            View Architecture
          </button>
        </div>

        {/* Mandatory Regulatory Disclaimer */}
        <div className="pt-8 border-t border-slate-100 max-w-md mx-auto">
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            Simulation and research decision-support prototype. Not for clinical diagnostic use, real patient treatment, or autonomous surgical decision-making.
          </p>
        </div>

      </div>
    </div>
  );
};
