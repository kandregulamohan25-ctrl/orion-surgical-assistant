import React from 'react';
import { ContradictionEvent } from '../types';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ContradictionBannerProps {
  contradiction: ContradictionEvent | null;
  onResolve: (itemCode: string) => void;
}

export const ContradictionBanner: React.FC<ContradictionBannerProps> = ({
  contradiction,
  onResolve
}) => {
  if (!contradiction) return null;

  return (
    <div className="mb-4 bg-rose-50 border-l-4 border-rose-600 border-y border-r border-rose-200 rounded-r-lg p-4 shadow-xs animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase text-rose-700">
                CRITICAL CONTRADICTION DETECTED
              </span>
              <span className="text-xs font-mono px-2 py-0.5 bg-rose-200/60 text-rose-900 rounded font-semibold">
                {contradiction.itemCode}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
              {contradiction.itemTitle} contains conflicting statements
            </h4>
            <p className="text-xs text-rose-900 mt-1">
              Required Safety Action: {contradiction.clinicianActionRequired}
            </p>

            {/* Evidence comparison card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              <div className="p-2.5 bg-white border border-rose-200 rounded-md text-xs">
                <div className="font-semibold text-slate-500 uppercase text-[10px]">
                  Statement A • {contradiction.statementA.speaker}
                </div>
                <div className="font-medium text-slate-800 mt-1 italic">
                  "{contradiction.statementA.statement}"
                </div>
              </div>
              <div className="p-2.5 bg-white border border-rose-200 rounded-md text-xs">
                <div className="font-semibold text-rose-600 uppercase text-[10px]">
                  Statement B • {contradiction.statementB.speaker}
                </div>
                <div className="font-semibold text-rose-900 mt-1 italic">
                  "{contradiction.statementB.statement}"
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <button
            onClick={() => onResolve(contradiction.itemCode)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            Resolve Clarification
          </button>
          <span className="text-[11px] text-rose-700 italic">
            Checklist progression held
          </span>
        </div>
      </div>
    </div>
  );
};
