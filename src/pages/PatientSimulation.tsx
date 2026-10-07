import React from 'react';
import { SYNTHETIC_PATIENTS } from '../data/patients';
import { SyntheticPatient } from '../types';
import { User, ShieldAlert, FileText, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

interface PatientSimulationProps {
  currentPatient: SyntheticPatient;
  onSelectPatient: (patient: SyntheticPatient) => void;
}

export const PatientSimulation: React.FC<PatientSimulationProps> = ({
  currentPatient,
  onSelectPatient
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Simulated Health Record
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Synthetic Patient Cohort & Clinical Case Profiles
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            All clinical identities, anatomical sides, and allergy profiles are strictly synthetic benchmarks created for safety validation under Problem Statement #45. Zero real Protected Health Information (PHI) is processed.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Synthetic Patient Engine Active</span>
        </div>
      </div>

      {/* Grid of Synthetic Patients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SYNTHETIC_PATIENTS.map((pat) => {
          const isSelected = pat.id === currentPatient.id;
          return (
            <div
              key={pat.id}
              onClick={() => onSelectPatient(pat)}
              className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
                isSelected
                  ? 'border-blue-600 ring-1 ring-blue-600 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {pat.simulationId}
                </span>
                {isSelected && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Active Case
                  </span>
                )}
              </div>

              <div className="mt-3">
                <h3 className="text-base font-bold text-slate-900">
                  {pat.fullName}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  {pat.age} yrs • {pat.gender}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Scheduled Procedure</span>
                  <span className="font-semibold text-slate-800">{pat.scheduledProcedure}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium text-[10px] uppercase">Laterality</span>
                  <span className="font-bold text-slate-900">{pat.targetAnatomicalSite}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Known Allergies</span>
                  <span className={`font-medium ${
                    pat.knownAllergies[0].includes('No Known') ? 'text-slate-600' : 'text-rose-700 font-semibold'
                  }`}>
                    {pat.knownAllergies.join(', ')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium text-[10px] uppercase">Consent Status</span>
                  <span className={`font-semibold ${
                    pat.consentDocumented ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {pat.consentDocumented ? 'Signed & Valid' : 'MISSING (Test Flag)'}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPatient(pat);
                }}
                className={`w-full mt-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {isSelected ? 'Currently Selected' : 'Load Into Simulation'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Patient Deep-Dive Dossier */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Comprehensive Electronic Operative Dossier
            </span>
            <h2 className="text-base font-bold text-slate-900">
              {currentPatient.fullName} — Pre-Incision Reference Record
            </h2>
          </div>
          <span className="font-mono text-xs text-slate-500">
            {currentPatient.syntheticBannerText}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 text-xs">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase text-[11px]">Identity & Demographics</h4>
            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Simulation MRN:</span>
                <span className="font-mono font-bold">{currentPatient.simulationId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-semibold">{currentPatient.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Age / Gender:</span>
                <span>{currentPatient.age} / {currentPatient.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ASA Risk Score:</span>
                <span className="font-semibold">{currentPatient.anesthesiaRiskLevel}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase text-[11px]">Surgical Specifications</h4>
            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Target Anatomy:</span>
                <span className="font-semibold">{currentPatient.targetOrgan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Designated Side:</span>
                <span className="font-bold text-blue-700">{currentPatient.targetAnatomicalSite}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Imaging Required:</span>
                <span>{currentPatient.imagingRequired ? 'Yes (Displayed)' : 'Not Required'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Antibiotic Prophylaxis:</span>
                <span>{currentPatient.antibioticProphylaxisRequired ? `Administered ${currentPatient.antibioticAdministeredMinutesAgo}m prior` : 'Not Indicated'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase text-[11px]">Safety Flags & Sensitivities</h4>
            <div className="space-y-1.5 text-slate-700">
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500 block mb-0.5">Known Allergies:</span>
                <span className={`font-semibold ${
                  currentPatient.knownAllergies[0].includes('No Known') ? 'text-slate-800' : 'text-rose-700'
                }`}>
                  {currentPatient.knownAllergies.join('; ')}
                </span>
              </div>
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500 block mb-0.5">Operative Consent Form:</span>
                <span className={currentPatient.consentDocumented ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-bold'}>
                  {currentPatient.consentDocumented ? 'Signed informed consent validated on chart' : 'MISSING: Halts pre-incision progression'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
