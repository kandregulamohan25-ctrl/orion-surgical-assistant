import { SyntheticPatient } from '../types';

export const SYNTHETIC_PATIENTS: SyntheticPatient[] = [
  {
    id: 'pat-sim-0427',
    simulationId: 'SIM-0427',
    fullName: 'Alex Morgan',
    age: 54,
    gender: 'Female (Synthetic)',
    scheduledProcedure: 'Simulated Left Total Knee Arthroplasty',
    targetAnatomicalSite: 'Left',
    targetOrgan: 'Left Knee Joint',
    knownAllergies: ['Penicillin (Moderate rash)', 'Sulfa drugs (Reported 2018)'],
    anesthesiaRiskLevel: 'ASA II',
    consentDocumented: true,
    imagingRequired: true,
    imagingAvailable: true,
    antibioticProphylaxisRequired: true,
    antibioticAdministeredMinutesAgo: 24,
    syntheticBannerText: 'SYNTHETIC BENCHMARK CASE #45 // NONCLINICAL SIMULATION ONLY'
  },
  {
    id: 'pat-sim-0812',
    simulationId: 'SIM-0812',
    fullName: 'Jordan Hayes',
    age: 41,
    gender: 'Male (Synthetic)',
    scheduledProcedure: 'Simulated Laparoscopic Cholecystectomy',
    targetAnatomicalSite: 'Midline',
    targetOrgan: 'Gallbladder',
    knownAllergies: ['No Known Drug Allergies (NKDA)'],
    anesthesiaRiskLevel: 'ASA I',
    consentDocumented: false, // Intentional test case for missing consent
    imagingRequired: true,
    imagingAvailable: true,
    antibioticProphylaxisRequired: true,
    antibioticAdministeredMinutesAgo: 45,
    syntheticBannerText: 'SYNTHETIC BENCHMARK CASE #46 // MISSING CONSENT SCENARIO'
  },
  {
    id: 'pat-sim-1104',
    simulationId: 'SIM-1104',
    fullName: 'Elena Rostova',
    age: 63,
    gender: 'Female (Synthetic)',
    scheduledProcedure: 'Simulated Right Carpal Tunnel Release',
    targetAnatomicalSite: 'Right',
    targetOrgan: 'Right Median Nerve / Transverse Carpal Ligament',
    knownAllergies: ['Latex (Severe anaphylaxis)', 'Ciprofloxacin'],
    anesthesiaRiskLevel: 'ASA II',
    consentDocumented: true,
    imagingRequired: false,
    imagingAvailable: false,
    antibioticProphylaxisRequired: false,
    syntheticBannerText: 'SYNTHETIC BENCHMARK CASE #47 // HIGH ALLERGY RISK SCENARIO'
  },
  {
    id: 'pat-sim-2049',
    simulationId: 'SIM-2049',
    fullName: 'Marcus Vance',
    age: 38,
    gender: 'Male (Synthetic)',
    scheduledProcedure: 'Simulated Right Inguinal Hernia Mesh Repair',
    targetAnatomicalSite: 'Right',
    targetOrgan: 'Right Inguinal Canal',
    knownAllergies: ['NKDA'],
    anesthesiaRiskLevel: 'ASA I',
    consentDocumented: true,
    imagingRequired: false,
    imagingAvailable: false,
    antibioticProphylaxisRequired: true,
    antibioticAdministeredMinutesAgo: 18,
    syntheticBannerText: 'SYNTHETIC BENCHMARK CASE #48 // CONTRADICTORY SITE TEST SCENARIO'
  }
];

export const DEFAULT_PATIENT = SYNTHETIC_PATIENTS[0];
