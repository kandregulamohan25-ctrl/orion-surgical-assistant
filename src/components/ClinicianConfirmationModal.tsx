import React from 'react';
import { ChecklistItem } from '../types';
import { CheckCircle2, XCircle, HelpCircle, ShieldAlert, FileText, UserCheck } from 'lucide-react';

interface ClinicianConfirmationModalProps {
  item: ChecklistItem | null;
  onConfirm: (itemId: string) => void;
  onReject: (itemId: string) => void;
  onClarify: (itemId: string) => void;
  onDismiss: () => void;
}

export const ClinicianConfirmationModal: React.FC<ClinicianConfirmationModalProps> = ({
  item,
  onConfirm,
  onReject,
  onClarify,
  onDismiss
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Mandatory Clinician Gating
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Confirm Checklist Item
              </h3>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Checklist Item & Code
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {item.name} <span className="font-mono text-xs font-normal text-slate-500">({item.code})</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* AI Extracted Candidate */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                AI Extracted Candidate Value
              </span>
              <span className="text-xs font-mono font-medium text-blue-700">
                Confidence: {Math.round(item.confidenceScore * 100)}%
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-900">
              "{item.candidateValue || item.lastRecognizedUtterance || 'Verification affirmative'}"
            </div>
            {item.lastRecognizedUtterance && (
              <div className="text-xs text-slate-500 mt-1 italic">
                From voice input: "{item.lastRecognizedUtterance}"
              </div>
            )}
          </div>

          {/* Traceable Protocol Citation */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs">
            <FileText className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Approved Protocol Evidence: </span>
              <span className="text-slate-700">{item.protocolRef.protocolTitle} • {item.protocolRef.section}</span>
              <span className="text-slate-500 ml-1">({item.protocolRef.revision})</span>
            </div>
          </div>

          {/* Nonclinical Safety Disclaimer */}
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <span>AI cannot autonomously complete checklist items. Explicit designated clinician authorization is required.</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onClarify(item.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Needs Clarification
            </button>
            <button
              onClick={() => onReject(item.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded-lg transition-colors cursor-pointer"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject Candidate
            </button>
          </div>
          <button
            onClick={() => onConfirm(item.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs rounded-lg transition-colors cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm Item
          </button>
        </div>
      </div>
    </div>
  );
};
