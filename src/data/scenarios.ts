import { SimulationScenario } from '../types';
import { SYNTHETIC_PATIENTS } from './patients';

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'scen-judge-demo',
    name: 'Official L&T Techgium 3-Minute Judge Demo',
    code: 'DEMO-JUDGE-01',
    badge: 'Comprehensive Multi-Turn',
    description: 'Autonomous orchestration showcasing Identity verification, Interruption filtering, Laterality confirmation, Allergy contradiction detection, Missing consent gating, and Final clinician sign-off.',
    patient: SYNTHETIC_PATIENTS[0], // Alex Morgan
    difficulty: 'Standard',
    noiseLevel: 'Normal OR',
    hasContradiction: true,
    hasInterruption: true,
    hasMissingConsent: false,
    hasUncertainSpeech: true,
    scriptedTimeline: [
      {
        delayMs: 1200,
        speaker: 'Circulating Nurse',
        text: 'Initiating pre-incision time out. Patient identity confirmed: Alex Morgan, Simulation ID SIM-0427.',
        confidence: 0.98
      },
      {
        delayMs: 3800,
        speaker: 'Surgeon',
        text: 'Procedure confirmed: Simulated Left Total Knee Arthroplasty.',
        confidence: 0.95
      },
      {
        delayMs: 3500,
        speaker: 'Scrub Tech',
        text: 'Hold on, can someone check the equipment table and adjust the overhead light?',
        confidence: 0.94,
        isInterruption: true
      },
      {
        delayMs: 4000,
        speaker: 'Surgeon',
        text: 'Surgical site verified: Left knee marked and visible in the sterile field.',
        confidence: 0.96
      },
      {
        delayMs: 3600,
        speaker: 'Circulating Nurse',
        text: 'Patient has no known allergies according to the initial surgical checklist.',
        confidence: 0.94
      },
      {
        delayMs: 3800,
        speaker: 'Anesthesiologist',
        text: 'Wait, patient is allergic to penicillin with documented moderate rash.',
        confidence: 0.93,
        isContradictionTrigger: true
      },
      {
        delayMs: 4200,
        speaker: 'Circulating Nurse',
        text: 'Operative consent verified and signed in medical chart.',
        confidence: 0.96
      },
      {
        delayMs: 3800,
        speaker: 'Anesthesiologist',
        text: 'Cefazolin two grams antibiotic infusion completed 24 minutes prior to incision.',
        confidence: 0.95
      },
      {
        delayMs: 3500,
        speaker: 'Scrub Tech',
        text: 'Sterility indicators verified on all implant trays, biologicals negative.',
        confidence: 0.97
      },
      {
        delayMs: 3200,
        speaker: 'Surgeon',
        text: 'Pre-op diagnostic imaging displayed on OR monitors with confirmed orientation. Let us proceed.',
        confidence: 0.96
      }
    ]
  },
  {
    id: 'scen-a-normal',
    name: 'Scenario A: Standard Compliant Time-Out',
    code: 'SCEN-STD-01',
    badge: 'Baseline',
    description: 'Flawless time-out execution across all eight mandatory pre-incision parameters without contradictions or noise.',
    patient: SYNTHETIC_PATIENTS[0],
    difficulty: 'Standard',
    noiseLevel: 'Quiet',
    hasContradiction: false,
    hasInterruption: false,
    hasMissingConsent: false,
    hasUncertainSpeech: false,
    scriptedTimeline: [
      { delayMs: 1200, speaker: 'Circulating Nurse', text: 'Time out commencing. Patient identity confirmed: Alex Morgan, SIM-0427.', confidence: 0.98 },
      { delayMs: 3200, speaker: 'Surgeon', text: 'Procedure confirmed: Simulated Left Knee Arthroplasty.', confidence: 0.97 },
      { delayMs: 3200, speaker: 'Surgeon', text: 'Surgical site verified: Left knee marked.', confidence: 0.96 },
      { delayMs: 3200, speaker: 'Circulating Nurse', text: 'Signed consent document verified on file.', confidence: 0.96 },
      { delayMs: 3200, speaker: 'Anesthesiologist', text: 'Allergy status verified: Penicillin allergy noted.', confidence: 0.95 },
      { delayMs: 3200, speaker: 'Anesthesiologist', text: 'Prophylactic antibiotics administered within 60 minutes.', confidence: 0.97 },
      { delayMs: 3200, speaker: 'Circulating Nurse', text: 'Essential imaging loaded on monitor.', confidence: 0.95 },
      { delayMs: 3200, speaker: 'Scrub Tech', text: 'Sterility verified, equipment readiness confirmed.', confidence: 0.98 }
    ]
  },
  {
    id: 'scen-b-missing-consent',
    name: 'Scenario B: Missing Operative Consent Gating',
    code: 'SCEN-CONS-02',
    badge: 'Safety Lock',
    description: 'Demonstrates deterministic safety gate halting pre-incision progress when operative consent is unverified.',
    patient: SYNTHETIC_PATIENTS[1], // Jordan Hayes (Consent Missing)
    difficulty: 'Challenging',
    noiseLevel: 'Normal OR',
    hasContradiction: false,
    hasInterruption: false,
    hasMissingConsent: true,
    hasUncertainSpeech: false,
    scriptedTimeline: [
      { delayMs: 1200, speaker: 'Circulating Nurse', text: 'Patient identity verified: Jordan Hayes, SIM-0812.', confidence: 0.97 },
      { delayMs: 3200, speaker: 'Surgeon', text: 'Procedure is Laparoscopic Cholecystectomy, midline approach.', confidence: 0.96 },
      { delayMs: 3400, speaker: 'Circulating Nurse', text: 'Warning team: signed operative consent is missing from the record.', confidence: 0.95 },
      { delayMs: 3200, speaker: 'Surgeon', text: 'Let us proceed anyway to save time.', confidence: 0.96 }
    ]
  },
  {
    id: 'scen-c-contradictory-allergy',
    name: 'Scenario C: Contradictory Allergy Statements',
    code: 'SCEN-ALRG-03',
    badge: 'Contradiction Engine',
    description: 'Demonstrates multi-party conflict detection when Nurse declares NKDA while Anesthesiologist declares Penicillin allergy.',
    patient: SYNTHETIC_PATIENTS[0],
    difficulty: 'Challenging',
    noiseLevel: 'Normal OR',
    hasContradiction: true,
    hasInterruption: false,
    hasMissingConsent: false,
    hasUncertainSpeech: false,
    scriptedTimeline: [
      { delayMs: 1200, speaker: 'Circulating Nurse', text: 'Patient Alex Morgan, SIM-0427. Patient has no known allergies.', confidence: 0.96 },
      { delayMs: 3500, speaker: 'Anesthesiologist', text: 'Wait a moment, chart indicates patient is allergic to penicillin with hives.', confidence: 0.94, isContradictionTrigger: true }
    ]
  },
  {
    id: 'scen-d-wrong-site',
    name: 'Scenario D: Wrong-Site Discrepancy Alert',
    code: 'SCEN-SITE-04',
    badge: 'Critical Hazard',
    description: 'Surgeon accidentally verbalizes Right side when schedule and wristband state Left side. Immediate alert.',
    patient: SYNTHETIC_PATIENTS[0],
    difficulty: 'Edge Case',
    noiseLevel: 'Normal OR',
    hasContradiction: true,
    hasInterruption: false,
    hasMissingConsent: false,
    hasUncertainSpeech: false,
    scriptedTimeline: [
      { delayMs: 1200, speaker: 'Circulating Nurse', text: 'Patient Alex Morgan, SIM-0427, scheduled for Left Knee.', confidence: 0.98 },
      { delayMs: 3400, speaker: 'Surgeon', text: 'Surgical site verified: Right knee prepped and ready.', confidence: 0.96, isContradictionTrigger: true }
    ]
  },
  {
    id: 'scen-e-noisy-environment',
    name: 'Scenario E: High Ambient Noise & Degraded Audio',
    code: 'SCEN-NOIS-05',
    badge: 'Noise Resilience',
    description: 'Simulates loud suction unit and OR telemetry alarms degrading speech recognition confidence below the safety threshold.',
    patient: SYNTHETIC_PATIENTS[2],
    difficulty: 'Edge Case',
    noiseLevel: 'High Ambient Noise',
    hasContradiction: false,
    hasInterruption: false,
    hasMissingConsent: false,
    hasUncertainSpeech: true,
    scriptedTimeline: [
      { delayMs: 1400, speaker: 'Surgeon', text: '[Muffled suction noise] ...Elena Rostova SIM-1104...', confidence: 0.54, isLowConfidence: true },
      { delayMs: 4000, speaker: 'Surgeon', text: 'Repeating clearly: Patient identity confirmed: Elena Rostova, SIM-1104.', confidence: 0.96 }
    ]
  },
  {
    id: 'scen-f-interruption-handling',
    name: 'Scenario F: Conversational Interruption & Resumption',
    code: 'SCEN-INTR-06',
    badge: 'Context Manager',
    description: 'Technical chatter regarding surgical lighting and laparoscopic towers interrupts the flow without corrupting state.',
    patient: SYNTHETIC_PATIENTS[0],
    difficulty: 'Challenging',
    noiseLevel: 'Normal OR',
    hasContradiction: false,
    hasInterruption: true,
    hasMissingConsent: false,
    hasUncertainSpeech: false,
    scriptedTimeline: [
      { delayMs: 1200, speaker: 'Circulating Nurse', text: 'Patient identity confirmed: Alex Morgan, SIM-0427.', confidence: 0.97 },
      { delayMs: 3200, speaker: 'Circulating Nurse', text: 'Can someone check the equipment table and adjust the light boom?', confidence: 0.94, isInterruption: true },
      { delayMs: 4000, speaker: 'Surgeon', text: 'Equipment set. Resuming checklist: Procedure is Left Total Knee Arthroplasty.', confidence: 0.96 }
    ]
  }
];

export const DEFAULT_SCENARIO = SIMULATION_SCENARIOS[0];
