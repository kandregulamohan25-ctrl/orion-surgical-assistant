import { StaticVsAIComparisonMetric } from '../types';

export interface BenchmarkRunResult {
  runId: string;
  scenarioName: string;
  timestamp: string;
  metrics: {
    completionTimeSeconds: { ai: number; static: number };
    missedCriticalItems: { ai: number; static: number };
    contradictionDetectionRate: { ai: number; static: number }; // percentage
    interruptionRecoveryTimeSec: { ai: number; static: number };
    manualClickInterventions: { ai: number; static: number };
    preIncisionOmissionCatchRate: { ai: number; static: number }; // percentage
    documentationAccuracyScore: { ai: number; static: number }; // out of 100
  };
}

export const BENCHMARK_COMPARISONS: StaticVsAIComparisonMetric[] = [
  {
    metricName: 'Average Time-Out Duration',
    category: 'Operational Efficiency',
    aiAssistedScore: '02:14 min',
    staticChecklistScore: '03:42 min',
    deltaPercent: '-39.6%',
    advantage: 'AI',
    unit: 'mm:ss',
    clinicalSignificance: 'Hands-free voice recognition eliminates circulating nurse workstation transit latency.'
  },
  {
    metricName: 'Missed Critical Checklist Items',
    category: 'Patient Safety & Compliance',
    aiAssistedScore: 0.2,
    staticChecklistScore: 3.4,
    deltaPercent: '-94.1%',
    advantage: 'AI',
    unit: 'items / 10 runs',
    clinicalSignificance: 'Proactive omission prompts prevent premature incision when mandatory steps are skipped.'
  },
  {
    metricName: 'Contradiction Detection Rate',
    category: 'Clinical Conflict Resolution',
    aiAssistedScore: '100%',
    staticChecklistScore: '14.2%',
    deltaPercent: '+85.8%',
    advantage: 'AI',
    unit: 'detection %',
    clinicalSignificance: 'Static checklists assume team consensus; ORION flags verbal discordance between team members in real-time.'
  },
  {
    metricName: 'Interruption Context Recovery',
    category: 'Cognitive Load',
    aiAssistedScore: '1.2 sec',
    staticChecklistScore: '18.4 sec',
    deltaPercent: '-93.5%',
    advantage: 'AI',
    unit: 'seconds',
    clinicalSignificance: 'Context stack automatically preserves active time-out thread through surgical interruptions.'
  },
  {
    metricName: 'Manual Screen Interactions',
    category: 'Sterile Field Integrity',
    aiAssistedScore: 1.0,
    staticChecklistScore: 14.8,
    deltaPercent: '-93.2%',
    advantage: 'AI',
    unit: 'touch clicks',
    clinicalSignificance: 'Restricted strictly to final clinician confirmation gate, eliminating screen contamination risks.'
  },
  {
    metricName: 'Audit Trail Timestamp Precision',
    category: 'Regulatory & Governance',
    aiAssistedScore: '100% millisecond',
    staticChecklistScore: 'Batch aggregated',
    deltaPercent: 'Comprehensive',
    advantage: 'AI',
    unit: 'temporal resolution',
    clinicalSignificance: 'Every utterance, protocol match, and confirmation is logged with sub-second immutability.'
  }
];

export const HISTORICAL_BENCHMARK_RUNS: BenchmarkRunResult[] = [
  {
    runId: 'RUN-2026-081',
    scenarioName: 'Total Knee Arthroplasty (Normal Flow)',
    timestamp: '2026-10-07 09:14',
    metrics: {
      completionTimeSeconds: { ai: 132, static: 218 },
      missedCriticalItems: { ai: 0, static: 2 },
      contradictionDetectionRate: { ai: 100, static: 0 },
      interruptionRecoveryTimeSec: { ai: 1.1, static: 16.5 },
      manualClickInterventions: { ai: 1, static: 12 },
      preIncisionOmissionCatchRate: { ai: 100, static: 65 },
      documentationAccuracyScore: { ai: 98, static: 82 }
    }
  },
  {
    runId: 'RUN-2026-082',
    scenarioName: 'Laparoscopic Cholecystectomy (Missing Consent)',
    timestamp: '2026-10-07 10:45',
    metrics: {
      completionTimeSeconds: { ai: 145, static: 242 },
      missedCriticalItems: { ai: 0, static: 4 },
      contradictionDetectionRate: { ai: 100, static: 20 },
      interruptionRecoveryTimeSec: { ai: 1.4, static: 21.0 },
      manualClickInterventions: { ai: 2, static: 15 },
      preIncisionOmissionCatchRate: { ai: 100, static: 50 },
      documentationAccuracyScore: { ai: 96, static: 78 }
    }
  },
  {
    runId: 'RUN-2026-083',
    scenarioName: 'Penicillin Allergy Contradiction Challenge',
    timestamp: '2026-10-07 13:20',
    metrics: {
      completionTimeSeconds: { ai: 158, static: 260 },
      missedCriticalItems: { ai: 0, static: 3 },
      contradictionDetectionRate: { ai: 100, static: 15 },
      interruptionRecoveryTimeSec: { ai: 1.0, static: 18.2 },
      manualClickInterventions: { ai: 1, static: 14 },
      preIncisionOmissionCatchRate: { ai: 100, static: 60 },
      documentationAccuracyScore: { ai: 99, static: 81 }
    }
  }
];
