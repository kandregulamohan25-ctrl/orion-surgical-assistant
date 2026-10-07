import React, { useState } from 'react';
import { APPROVED_PROTOCOLS, ProtocolDocument } from '../data/protocols';
import { BookOpen, Search, ShieldCheck, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { protocolService } from '../protocol/retrievalService';

export const ProtocolLibrary: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolDocument>(APPROVED_PROTOCOLS[0]);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  const activeSection = selectedProtocol.sections[selectedSectionIndex];

  const handleTestSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const res = protocolService.queryProtocol(searchQuery);
    if (res.found && res.reference) {
      setSearchFeedback(`Found Grounded Evidence: ${res.reference.section} (${res.reference.revision})`);
      // Select the corresponding section
      const secIdx = selectedProtocol.sections.findIndex(s => res.reference!.section.includes(s.sectionNumber));
      if (secIdx !== -1) setSelectedSectionIndex(secIdx);
    } else {
      setSearchFeedback(res.fallbackMessage || "No approved protocol evidence found.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Approved Knowledge Base
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Operating Theatre Clinical Safety Protocols
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Every recommendation and omission check performed by ORION is strictly cited from this immutable protocol repository. AI interventions never generate ungrounded medical directives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
            Active Revision: <strong>{selectedProtocol.revision}</strong>
          </div>
        </div>
      </div>

      {/* Protocol Grounding Test Query Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Grounding Query Tester (Deterministic Verification)
        </div>
        <form onSubmit={handleTestSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Query protocol evidence (e.g., 'consent verification rules', 'penicillin allergy', 'antibiotic timing')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Query Evidence
          </button>
        </form>

        {searchFeedback && (
          <div className={`mt-2.5 p-2.5 rounded-lg text-xs font-medium ${
            searchFeedback.includes('Found Grounded') 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {searchFeedback}
          </div>
        )}
      </div>

      {/* Protocol Viewer 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Section Navigation (4 Cols) */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Checklist Sections
          </div>

          <div className="space-y-1.5">
            {selectedProtocol.sections.map((sec, idx) => {
              const isSelected = selectedSectionIndex === idx;
              return (
                <button
                  key={sec.sectionNumber}
                  onClick={() => setSelectedSectionIndex(idx)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400">
                      SEC {sec.sectionNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 rounded">
                      APPROVED
                    </span>
                  </div>
                  <div className="mt-1 text-slate-900 line-clamp-1">
                    {sec.heading}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Section Content Viewer (8 Cols) */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-700">
              <span>{selectedProtocol.code}</span>
              <span>•</span>
              <span>Section {activeSection.sectionNumber}</span>
              <span>•</span>
              <span>Rev {selectedProtocol.revision}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              {activeSection.heading}
            </h2>
          </div>

          {/* Body Prose */}
          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 italic">
              "{activeSection.body}"
            </p>
          </div>

          {/* Mandatory Requirements */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Mandatory Checklist Criteria
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {activeSection.mandatoryRequirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contradiction & Conflict Triggers */}
          <div>
            <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              Pre-Incision Contradiction Triggers
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {activeSection.contradictionTriggers.map((trig, i) => (
                <li key={i} className="flex items-start gap-2 text-rose-950">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{trig}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Traceable Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Regulatory Basis: {selectedProtocol.regulatoryStandard}</span>
            <span className="font-mono text-emerald-700 font-semibold">Status: Immutable Approved</span>
          </div>
        </div>
      </div>
    </div>
  );
};
