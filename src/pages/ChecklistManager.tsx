import React from 'react';
import { ChecklistItem } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  GitCommit,
  UserCheck
} from 'lucide-react';

interface ChecklistManagerProps {
  items: ChecklistItem[];
  onRequestConfirmation: (item: ChecklistItem) => void;
}

export const ChecklistManager: React.FC<ChecklistManagerProps> = ({
  items,
  onRequestConfirmation
}) => {
  const confirmed = items.filter(i => i.state === 'CONFIRMED').length;
  const pending = items.filter(i => i.state === 'AWAITING_CONFIRMATION').length;
  const contradicted = items.filter(i => i.state === 'CONTRADICTED').length;
  const notStarted = items.filter(i => i.state === 'NOT_STARTED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Deterministic State Machine
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Pre-Incision Safety Checklist Architecture
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Every checklist transition is governed by strict deterministic logic. LLMs extract candidate speech entities, but state progression is strictly verified by rule-based gates requiring explicit clinician sign-off.
          </p>
        </div>

        {/* State Breakdown Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{confirmed} Confirmed</span>
          </div>
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>{pending} Awaiting Sign-Off</span>
          </div>
          <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-800 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>{contradicted} Contradicted</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
            <span>{notStarted} Not Started</span>
          </div>
        </div>
      </div>

      {/* State Machine Transition Diagram Guide */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          State Transition Flow & Gating Logic
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center flex-1 min-w-[120px]">
            <span className="font-bold text-slate-700 block">NOT_STARTED</span>
            <span className="text-[10px] text-slate-500">Awaiting audio feed</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-center flex-1 min-w-[120px]">
            <span className="font-bold text-blue-700 block">RECOGNIZED</span>
            <span className="text-[10px] text-blue-600">Candidate captured</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-center flex-1 min-w-[120px]">
            <span className="font-bold text-amber-700 block">AWAITING_CONFIRMATION</span>
            <span className="text-[10px] text-amber-600">Clinician gate lock</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center flex-1 min-w-[120px]">
            <span className="font-bold text-emerald-700 block">CONFIRMED</span>
            <span className="text-[10px] text-emerald-600">Designated sign-off</span>
          </div>
          <span className="text-slate-300 font-bold hidden sm:inline">|</span>
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-center flex-1 min-w-[120px]">
            <span className="font-bold text-rose-700 block">CONTRADICTED</span>
            <span className="text-[10px] text-rose-600">Multi-party conflict</span>
          </div>
        </div>
      </div>

      {/* Deep-Dive Item Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Mandatory Item Registry & Rule Enforcements
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            WHO-SST-P2 Rev SIM-2026.1
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.id} className="p-5 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      item.state === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.state === 'AWAITING_CONFIRMATION'
                        ? 'bg-amber-100 text-amber-800'
                        : item.state === 'CONTRADICTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.state}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                      <strong className="text-slate-800 block text-[11px] mb-0.5">Deterministic Completion Criteria:</strong>
                      <span className="text-slate-600">{item.completionCriteria}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                      <strong className="text-rose-800 block text-[11px] mb-0.5">Contradiction Trigger Rules:</strong>
                      <span className="text-slate-600">{item.contradictionRules.join('; ')}</span>
                    </div>
                  </div>

                  {item.candidateValue && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 font-medium">
                      <strong>Current Extracted Candidate: </strong>
                      "{item.candidateValue}"
                    </div>
                  )}

                  {item.confirmedBy && (
                    <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 pt-1">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Confirmed by {item.confirmedBy} at {item.confirmedAt}</span>
                    </div>
                  )}
                </div>

                {/* Right Action */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Protocol Reference</span>
                    <span className="text-xs font-mono font-medium text-blue-700">{item.protocolRef.section}</span>
                  </div>

                  {item.state === 'AWAITING_CONFIRMATION' && (
                    <button
                      onClick={() => onRequestConfirmation(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Sign Off Item
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
