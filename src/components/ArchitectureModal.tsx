import React from 'react';
import { Layers, ShieldCheck, Cpu, Mic, GitBranch, Database, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                ORION System Design • Problem Statement #45
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Dual-Tier Layered Architecture & Safety Boundary
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Nonclinical Boundary Banner */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-900">
                Nonclinical Safety Assurance Boundary
              </div>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                ORION strictly functions as a simulated workflow decision-support tool. It never diagnoses conditions, never makes autonomous surgical choices, and enforces designated clinician confirmation for all state transitions.
              </p>
            </div>
          </div>

          {/* Layer Pipeline Flowchart */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Full-Duplex Pipeline Flow
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                  <Mic className="h-4 w-4 text-blue-600" />
                  1. Audio Ingest
                </div>
                <p className="text-xs text-slate-600">
                  Full-duplex stream, browser Web Speech API / pluggable Whisper, ambient noise filtering, audio waveform telemetry.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                  <Cpu className="h-4 w-4 text-indigo-600" />
                  2. LLM / NLP Layer
                </div>
                <p className="text-xs text-slate-600">
                  Utterance segmentation, intent extraction, side-conversation filtering (interruptions), concise prompt synthesis.
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1">
                  <GitBranch className="h-4 w-4 text-blue-700" />
                  3. Deterministic Engine
                </div>
                <p className="text-xs text-blue-800">
                  Strict 8-state machine, rule-based contradiction detection, omission monitoring, protocol citation binder.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  4. Clinician Gate
                </div>
                <p className="text-xs text-emerald-800">
                  Designated surgeon sign-off ([Confirm], [Reject], [Clarify]), immutable audit log, TTS speech playback.
                </p>
              </div>
            </div>
          </div>

          {/* Separation of Concerns Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Separation of Responsibilities (LLM vs Deterministic Engine)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2 font-bold text-indigo-900 mb-2 text-xs uppercase tracking-wide">
                  <Cpu className="h-4 w-4 text-indigo-600" />
                  LLM Responsibilities (Flexible Understanding)
                </div>
                <ul className="text-xs space-y-1.5 text-slate-700 list-disc list-inside">
                  <li>Interpret spontaneous multi-speaker natural language</li>
                  <li>Extract candidate named entities (e.g. "Left Knee", "Penicillin")</li>
                  <li>Filter operational interruptions (equipment/lighting chatter)</li>
                  <li>Summarize dialogue for concise auditory prompts</li>
                  <li>Never finalize checklist items independently</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2 font-bold text-blue-900 mb-2 text-xs uppercase tracking-wide">
                  <GitBranch className="h-4 w-4 text-blue-600" />
                  Deterministic Engine (Safety & Integrity)
                </div>
                <ul className="text-xs space-y-1.5 text-slate-700 list-disc list-inside">
                  <li>Controls item state machine (NOT_STARTED → CONFIRMED)</li>
                  <li>Enforces contradiction rules (e.g. Left vs Right mismatch)</li>
                  <li>Gated clinician confirmation requirements</li>
                  <li>Grounds every action in traceable protocol citations</li>
                  <li>Sub-second timestamped immutable audit trails</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Compliant with L&T Techgium Problem Statement #45 specifications
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer"
          >
            Close Architecture View
          </button>
        </div>
      </div>
    </div>
  );
};
