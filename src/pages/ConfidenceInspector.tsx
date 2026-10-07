import React from 'react';
import { AIConfidenceBreakdown } from '../types';
import { Gauge, ShieldCheck, Cpu, Mic, GitBranch, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ConfidenceInspectorProps {
  confidence: AIConfidenceBreakdown;
}

export const ConfidenceInspector: React.FC<ConfidenceInspectorProps> = ({ confidence }) => {
  const metrics = [
    {
      title: 'Speech Recognition Acoustic Confidence',
      score: confidence.speechRecognition,
      icon: <Mic className="h-5 w-5 text-blue-600" />,
      description: 'Acoustic waveform clarity, phoneme match confidence, and operating-theatre ambient noise ratio.',
      threshold: '≥ 75% for automatic intent processing'
    },
    {
      title: 'Intent & Entity Extraction Confidence',
      score: confidence.intentExtraction,
      icon: <Cpu className="h-5 w-5 text-indigo-600" />,
      description: 'Named-entity extraction accuracy separating clinical statements from ambient equipment chatter.',
      threshold: '≥ 80% for candidate proposal'
    },
    {
      title: 'Checklist State Mapping Confidence',
      score: confidence.checklistMapping,
      icon: <GitBranch className="h-5 w-5 text-emerald-600" />,
      description: 'Deterministic mapping of extracted utterance against 8 mandatory WHO pre-incision checklist codes.',
      threshold: '100% deterministic rule adherence'
    },
    {
      title: 'Approved Protocol Evidence Grounding',
      score: confidence.protocolEvidence,
      icon: <BookOpen className="h-5 w-5 text-purple-600" />,
      description: 'Verification that candidate parameters are strictly backed by WHO-SST-P2 Rev SIM-2026.1 citations.',
      threshold: '100% mandatory (Zero generative hallucination)'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
          Transparency & Safety Telemetry
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-0.5">
          Multimodal AI Confidence & Reasoning Transparency
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          ORION measures multi-dimensional confidence across every processing tier. Even when confidence reaches 100%, the safety architecture mandates explicit clinician sign-off.
        </p>
      </div>

      {/* Standout Safety Differentiator Callout (REQUIRED) */}
      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3 shadow-xs">
        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800 shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-emerald-950">
            Safety Gate Architecture: Confidence Is Not Consent
          </h3>
          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
            "Checklist completion requires explicit designated clinician confirmation. AI confidence alone cannot complete or sign off any surgical checklist item."
          </p>
        </div>
      </div>

      {/* Multi-Factor Confidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((m, idx) => {
          const percent = Math.round(m.score * 100);
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    {m.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {m.title}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Threshold: {m.threshold}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-2xl font-bold font-mono ${
                    percent >= 90 ? 'text-emerald-700' : percent >= 75 ? 'text-blue-700' : 'text-amber-700'
                  }`}>
                    {percent}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    percent >= 90 ? 'bg-emerald-600' : percent >= 75 ? 'bg-blue-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {m.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Uncertainty Mitigation Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Uncertainty Mitigation & Degradation Protocols
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-1">Acoustic Degradation (&lt; 75%)</span>
            <p className="text-slate-600">
              ORION suppresses automatic candidate proposal and prompts: "I may have misheard the response due to ambient noise. Please clarify."
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-1">Contradictory Statements</span>
            <p className="text-slate-600">
              Deterministic contradiction engine halts progression, highlights both conflicting utterances, and requests clinician arbitration.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-1">Omission Detection</span>
            <p className="text-slate-600">
              If operating team verbalizes "Let's proceed" before mandatory items are verified, ORION issues a concise auditory omission warning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
