// Core domain types for ORION (Operating Room Intelligence & Observation Navigator)
// Scope: Nonclinical, Simulated Operating Theatre Workflow, Pre-Incision Safety Checklist

export type ItemState = 
  | 'NOT_STARTED'
  | 'PENDING'
  | 'RECOGNIZED'
  | 'AWAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'CONTRADICTED'
  | 'UNCERTAIN'
  | 'BLOCKED';

export type AIStatus = 
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'SPEAKING'
  | 'UNCERTAIN'
  | 'MUTED'
  | 'INTERRUPTED';

export interface ProtocolReference {
  protocolId: string;
  protocolTitle: string;
  section: string;
  revision: string;
  excerpt: string;
  urlRef?: string;
}

export interface ChecklistItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'IDENTITY' | 'PROCEDURE_SITE' | 'CONSENT' | 'ALLERGY' | 'ANTIBIOTIC' | 'IMAGING' | 'EQUIPMENT' | 'ANESTHESIA_RISK';
  required: boolean;
  state: ItemState;
  completionCriteria: string;
  contradictionRules: string[];
  requiresClinicianConfirmation: boolean;
  confirmedBy?: string;
  confirmedAt?: string;
  lastRecognizedUtterance?: string;
  candidateValue?: string;
  confidenceScore: number; // 0.0 - 1.0
  protocolRef: ProtocolReference;
  contradictionDetails?: {
    statementA: string;
    speakerA: string;
    statementB: string;
    speakerB: string;
    detectedAt: string;
    resolution?: string;
  };
}

export interface SyntheticPatient {
  id: string;
  simulationId: string;
  fullName: string;
  age: number;
  gender: string;
  scheduledProcedure: string;
  targetAnatomicalSite: 'Left' | 'Right' | 'Bilateral' | 'Midline' | 'Non-laterality';
  targetOrgan: string;
  knownAllergies: string[];
  anesthesiaRiskLevel: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV';
  consentDocumented: boolean;
  imagingRequired: boolean;
  imagingAvailable: boolean;
  antibioticProphylaxisRequired: boolean;
  antibioticAdministeredMinutesAgo?: number;
  syntheticBannerText: string;
}

export interface DialogueUtterance {
  id: string;
  timestamp: string;
  speaker: 'Surgeon' | 'Circulating Nurse' | 'Anesthesiologist' | 'Scrub Tech' | 'AI Assistant' | 'Observer';
  speakerRole: string;
  text: string;
  confidence: number; // 0.0 - 1.0
  isInterruption?: boolean;
  isSideConversation?: boolean;
  isLowConfidence?: boolean;
  isContradictionTrigger?: boolean;
  recognizedEntity?: {
    itemCode?: string;
    value?: string;
    statusEffect?: ItemState;
  };
}

export interface ContradictionEvent {
  id: string;
  timestamp: string;
  itemCode: string;
  itemTitle: string;
  statementA: {
    speaker: string;
    statement: string;
    timestamp: string;
  };
  statementB: {
    speaker: string;
    statement: string;
    timestamp: string;
  };
  status: 'ACTIVE_CONTRADICTION' | 'RESOLVED_BY_CLINICIAN' | 'DISMISSED';
  clinicianActionRequired: string;
}

export type AuditCategory = 
  | 'SPEECH'
  | 'AI_INFERENCE'
  | 'CHECKLIST'
  | 'PROTOCOL'
  | 'CONFIRMATION'
  | 'CONTRADICTION'
  | 'SYSTEM_SAFETY';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  category: AuditCategory;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'CRITICAL';
  actor: string;
  action: string;
  details: string;
  protocolCitation?: string;
  confidenceMetric?: number;
}

export interface AIConfidenceBreakdown {
  speechRecognition: number;     // e.g. 0.96
  intentExtraction: number;      // e.g. 0.92
  checklistMapping: number;      // e.g. 0.94
  protocolEvidence: number;      // e.g. 1.00
  overallWeightedConfidence: number;
  uncertaintyReason?: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  code: string;
  badge: string;
  description: string;
  patient: SyntheticPatient;
  difficulty: 'Standard' | 'Challenging' | 'Edge Case';
  noiseLevel: 'Quiet' | 'Normal OR' | 'High Ambient Noise';
  hasContradiction: boolean;
  hasInterruption: boolean;
  hasMissingConsent: boolean;
  hasUncertainSpeech: boolean;
  scriptedTimeline: Array<{
    delayMs: number;
    speaker: DialogueUtterance['speaker'];
    text: string;
    confidence: number;
    isInterruption?: boolean;
    isContradictionTrigger?: boolean;
    isLowConfidence?: boolean;
  }>;
}

export interface StaticVsAIComparisonMetric {
  metricName: string;
  category: string;
  aiAssistedScore: string | number;
  staticChecklistScore: string | number;
  deltaPercent: string;
  advantage: 'AI' | 'STATIC' | 'NEUTRAL';
  unit: string;
  clinicalSignificance: string;
}
