import { ChecklistItem, ItemState, DialogueUtterance, ContradictionEvent, AuditLogEntry, AIConfidenceBreakdown } from '../types';
import { INITIAL_CHECKLIST_ITEMS } from './initialItems';

export interface StateMachineResult {
  items: ChecklistItem[];
  activeContradiction: ContradictionEvent | null;
  aiResponsePrompt: string | null;
  interruptionDetected: boolean;
  needsClinicianConfirmationItem: ChecklistItem | null;
  auditEntries: AuditLogEntry[];
  confidence: AIConfidenceBreakdown;
  completionPercentage: number;
  canProceedToIncision: boolean;
}

export class DeterministicChecklistEngine {
  private items: ChecklistItem[];
  private activeContradictions: Map<string, ContradictionEvent>;
  private conversationContext: string[]; // Recent topics
  private pendingConfirmationItemId: string | null = null;

  constructor(initialItems: ChecklistItem[] = INITIAL_CHECKLIST_ITEMS) {
    this.items = JSON.parse(JSON.stringify(initialItems));
    this.activeContradictions = new Map();
    this.conversationContext = [];
  }

  public getItems(): ChecklistItem[] {
    return this.items;
  }

  public reset(customItems?: ChecklistItem[]) {
    this.items = JSON.parse(JSON.stringify(customItems || INITIAL_CHECKLIST_ITEMS));
    this.activeContradictions.clear();
    this.conversationContext = [];
    this.pendingConfirmationItemId = null;
  }

  /**
   * Process a new incoming utterance through the deterministic safety pipeline
   */
  public processUtterance(utterance: DialogueUtterance): StateMachineResult {
    const text = utterance.text.trim();
    const lower = text.toLowerCase();
    const auditEntries: AuditLogEntry[] = [];
    let aiResponsePrompt: string | null = null;
    let interruptionDetected = false;
    let needsClinicianConfirmationItem: ChecklistItem | null = null;

    // Default confidence breakdown
    const confidence: AIConfidenceBreakdown = {
      speechRecognition: utterance.confidence,
      intentExtraction: Math.max(0.65, Math.min(0.98, utterance.confidence - 0.03)),
      checklistMapping: 0.94,
      protocolEvidence: 1.0,
      overallWeightedConfidence: utterance.confidence * 0.95
    };

    // 1. Audit log the raw speech recognition
    auditEntries.push({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: utterance.timestamp,
      category: 'SPEECH',
      severity: utterance.isLowConfidence ? 'WARNING' : 'INFO',
      actor: utterance.speaker,
      action: 'Speech Recognized',
      details: `"${utterance.text}" (Confidence: ${Math.round(utterance.confidence * 100)}%)`,
      confidenceMetric: utterance.confidence
    });

    // 2. Interruption / Non-checklist chatter detection
    // If the utterance is equipment chatter, ambient side talk, or unprompted noise:
    const isInterruptionPattern = /check the equipment|adjust the light|suction canister|room temperature|pager ringing|phone call|what time is it/i.test(lower);
    if (isInterruptionPattern || utterance.isInterruption) {
      interruptionDetected = true;
      auditEntries.push({
        id: `audit-${Date.now()}-int`,
        timestamp: utterance.timestamp,
        category: 'SYSTEM_SAFETY',
        severity: 'INFO',
        actor: 'Context Manager',
        action: 'Interruption Filtered',
        details: `Utterance identified as non-checklist operational dialogue: "${text}". Checklist state preserved.`
      });

      aiResponsePrompt = `Acknowledged side discussion. Ready to resume pre-incision time out when ready.`;
      return this.generateResult(auditEntries, aiResponsePrompt, true, null, confidence);
    }

    // 3. Low-confidence speech handling
    if (utterance.confidence < 0.72 || utterance.isLowConfidence) {
      confidence.uncertaintyReason = 'Speech signal degraded or ambient operating room noise detected.';
      auditEntries.push({
        id: `audit-${Date.now()}-unc`,
        timestamp: utterance.timestamp,
        category: 'AI_INFERENCE',
        severity: 'WARNING',
        actor: 'ORION Speech Subsystem',
        action: 'Uncertain Speech Recognition',
        details: `Audio confidence below deterministic threshold (${Math.round(utterance.confidence * 100)}%). Safety gate requires manual clarification.`
      });

      aiResponsePrompt = `I may have misheard that statement due to ambient audio. Could you please repeat or verify?`;
      return this.generateResult(auditEntries, aiResponsePrompt, false, null, confidence);
    }

    // 4. Deterministic pattern matching & Contradiction Detection

    // --- ITEM 1: PATIENT IDENTITY ---
    if (lower.includes('patient identity') || lower.includes('alex morgan') || lower.includes('sim-0427') || lower.includes('identity confirmed') || lower.includes('patient name')) {
      const item = this.findItem('CHK-ID-01');
      if (item && item.state !== 'CONFIRMED') {
        item.state = 'AWAITING_CONFIRMATION';
        item.candidateValue = 'Alex Morgan, SIM-0427 (Double Verified)';
        item.confidenceScore = utterance.confidence;
        item.lastRecognizedUtterance = text;
        this.pendingConfirmationItemId = item.id;
        needsClinicianConfirmationItem = item;

        auditEntries.push({
          id: `audit-${Date.now()}-id`,
          timestamp: utterance.timestamp,
          category: 'CHECKLIST',
          severity: 'INFO',
          actor: 'Checklist State Machine',
          action: 'State Transition -> AWAITING_CONFIRMATION',
          details: `Patient identity candidate captured: Alex Morgan, SIM-0427.`,
          protocolCitation: item.protocolRef.section
        });

        aiResponsePrompt = `Identity candidate recognized for Alex Morgan, SIM-0427. Clinician confirmation required.`;
      }
    }

    // --- ITEM 2: PROCEDURE ---
    else if (lower.includes('procedure confirmed') || lower.includes('knee arthroplasty') || lower.includes('cholecystectomy') || lower.includes('carpal tunnel') || lower.includes('hernia repair') || lower.includes('procedure is')) {
      const item = this.findItem('CHK-PROC-02');
      if (item && item.state !== 'CONFIRMED') {
        item.state = 'AWAITING_CONFIRMATION';
        item.candidateValue = 'Simulated Left Total Knee Arthroplasty';
        item.confidenceScore = utterance.confidence;
        item.lastRecognizedUtterance = text;
        this.pendingConfirmationItemId = item.id;
        needsClinicianConfirmationItem = item;

        auditEntries.push({
          id: `audit-${Date.now()}-proc`,
          timestamp: utterance.timestamp,
          category: 'CHECKLIST',
          severity: 'INFO',
          actor: 'Checklist State Machine',
          action: 'State Transition -> AWAITING_CONFIRMATION',
          details: `Surgical procedure matched to booking schedule.`,
          protocolCitation: item.protocolRef.section
        });

        aiResponsePrompt = `Procedure candidate recognized. Clinician confirmation requested.`;
      }
    }

    // --- ITEM 3: SURGICAL SITE & LATERALITY (Contains potential contradiction testing) ---
    else if (lower.includes('site') || lower.includes('left side') || lower.includes('right side') || lower.includes('left knee') || lower.includes('right knee') || lower.includes('site confirmed') || lower.includes('marked')) {
      const item = this.findItem('CHK-SITE-03');
      if (item) {
        const mentionsLeft = lower.includes('left');
        const mentionsRight = lower.includes('right');

        // Check if there is an existing conflict with known baseline
        if (mentionsRight && !mentionsLeft) {
          // CONTRADICTION TRIGGER: Chart says Left Knee, but speaker said Right side!
          item.state = 'CONTRADICTED';
          const contradictionEvt: ContradictionEvent = {
            id: `contra-${Date.now()}`,
            timestamp: utterance.timestamp,
            itemCode: item.code,
            itemTitle: item.name,
            statementA: {
              speaker: 'Synthetic Chart / Wristband',
              statement: 'Left Knee Scheduled (Marked Left)',
              timestamp: utterance.timestamp
            },
            statementB: {
              speaker: utterance.speaker,
              statement: text,
              timestamp: utterance.timestamp
            },
            status: 'ACTIVE_CONTRADICTION',
            clinicianActionRequired: 'Re-verify physical site mark and surgical consent laterality immediately before incision.'
          };

          this.activeContradictions.set(item.code, contradictionEvt);

          auditEntries.push({
            id: `audit-${Date.now()}-contra-site`,
            timestamp: utterance.timestamp,
            category: 'CONTRADICTION',
            severity: 'CRITICAL',
            actor: 'Deterministic Safety Gate',
            action: 'Contradiction Detected: Laterality Mismatch',
            details: `Chart specifies Left, but ${utterance.speaker} verbalized "${text}". Checklist BLOCKED.`,
            protocolCitation: item.protocolRef.section
          });

          aiResponsePrompt = `WARNING: Surgical laterality contradiction detected. Scheduled site is Left, but utterance referenced Right. Clinician clarification mandatory.`;
          return this.generateResult(auditEntries, aiResponsePrompt, false, item, confidence);
        } else {
          // Left side confirmed
          if (item.state !== 'CONFIRMED') {
            item.state = 'AWAITING_CONFIRMATION';
            item.candidateValue = 'Left Knee (Marking verified in operative field)';
            item.confidenceScore = utterance.confidence;
            item.lastRecognizedUtterance = text;
            this.pendingConfirmationItemId = item.id;
            needsClinicianConfirmationItem = item;

            auditEntries.push({
              id: `audit-${Date.now()}-site`,
              timestamp: utterance.timestamp,
              category: 'CHECKLIST',
              severity: 'INFO',
              actor: 'Checklist State Machine',
              action: 'State Transition -> AWAITING_CONFIRMATION',
              details: `Surgical site Left verified with visible skin marker.`,
              protocolCitation: item.protocolRef.section
            });

            aiResponsePrompt = `Site confirmation detected: Left Knee marked. Awaiting clinician confirmation.`;
          }
        }
      }
    }

    // --- ITEM 4: CONSENT ---
    else if (lower.includes('consent') || lower.includes('paperwork') || lower.includes('signed')) {
      const item = this.findItem('CHK-CONS-04');
      if (item) {
        if (lower.includes('missing') || lower.includes('not signed') || lower.includes('no consent')) {
          item.state = 'BLOCKED';
          auditEntries.push({
            id: `audit-${Date.now()}-cons-block`,
            timestamp: utterance.timestamp,
            category: 'CHECKLIST',
            severity: 'ALERT',
            actor: 'Deterministic Safety Gate',
            action: 'State Transition -> BLOCKED',
            details: `Operative consent reported as missing or incomplete. Time-out halted.`,
            protocolCitation: item.protocolRef.section
          });
          aiResponsePrompt = `ALERT: Operative consent is reported missing. Time out is BLOCKED under Protocol 2.4 until signed form is verified.`;
          return this.generateResult(auditEntries, aiResponsePrompt, false, item, confidence);
        } else {
          if (item.state !== 'CONFIRMED') {
            item.state = 'AWAITING_CONFIRMATION';
            item.candidateValue = 'Informed Consent Form #CS-9941 Signed & Validated';
            item.confidenceScore = utterance.confidence;
            item.lastRecognizedUtterance = text;
            this.pendingConfirmationItemId = item.id;
            needsClinicianConfirmationItem = item;

            auditEntries.push({
              id: `audit-${Date.now()}-cons`,
              timestamp: utterance.timestamp,
              category: 'CHECKLIST',
              severity: 'INFO',
              actor: 'Checklist State Machine',
              action: 'State Transition -> AWAITING_CONFIRMATION',
              details: `Valid consent verified in operative chart.`,
              protocolCitation: item.protocolRef.section
            });

            aiResponsePrompt = `Consent verification detected in record. Clinician confirmation required.`;
          }
        }
      }
    }

    // --- ITEM 5: ALLERGIES & CONTRADICTIONS ---
    else if (lower.includes('allerg') || lower.includes('penicillin') || lower.includes('nkda') || lower.includes('no known allergies') || lower.includes('sulfa')) {
      const item = this.findItem('CHK-ALLERG-05');
      if (item) {
        const statesNoAllergies = lower.includes('no known') || lower.includes('nkda') || lower.includes('no allergies');
        const statesPenicillin = lower.includes('penicillin') || lower.includes('allergic to');

        // Check if an earlier utterance declared opposite
        const existingCandidate = item.candidateValue || '';
        const priorHadNoAllergies = existingCandidate.toLowerCase().includes('no known') || existingCandidate.toLowerCase().includes('nkda');
        const priorHadPenicillin = existingCandidate.toLowerCase().includes('penicillin');

        if ((statesPenicillin && priorHadNoAllergies) || (statesNoAllergies && priorHadPenicillin) || (statesPenicillin && statesNoAllergies)) {
          // MAJOR CONTRADICTION DETECTED!
          item.state = 'CONTRADICTED';
          const contradictionEvt: ContradictionEvent = {
            id: `contra-${Date.now()}-allergy`,
            timestamp: utterance.timestamp,
            itemCode: item.code,
            itemTitle: item.name,
            statementA: {
              speaker: priorHadNoAllergies ? 'Nurse / Initial Record' : 'Dr. / Surgical Attending',
              statement: 'No known allergies (NKDA stated).',
              timestamp: 'Earlier in Time Out'
            },
            statementB: {
              speaker: utterance.speaker,
              statement: text,
              timestamp: utterance.timestamp
            },
            status: 'ACTIVE_CONTRADICTION',
            clinicianActionRequired: 'Re-verify allergy profile with anesthesiologist before administering any prophylactic drugs.'
          };

          item.contradictionDetails = {
            statementA: contradictionEvt.statementA.statement,
            speakerA: contradictionEvt.statementA.speaker,
            statementB: text,
            speakerB: utterance.speaker,
            detectedAt: utterance.timestamp
          };

          this.activeContradictions.set(item.code, contradictionEvt);

          auditEntries.push({
            id: `audit-${Date.now()}-contra-alg`,
            timestamp: utterance.timestamp,
            category: 'CONTRADICTION',
            severity: 'CRITICAL',
            actor: 'Deterministic Contradiction Engine',
            action: 'Contradiction Detected: Allergy Conflict',
            details: `Conflicting statements: "No known allergies" vs "${text}". Action required: Clinician clarification.`,
            protocolCitation: item.protocolRef.section
          });

          aiResponsePrompt = `WARNING: Contradiction detected in allergy status. Conflicting statements on record: "No known allergies" versus "${text}". Clinician clarification required before proceeding.`;
          return this.generateResult(auditEntries, aiResponsePrompt, false, item, confidence);
        } else if (statesPenicillin) {
          item.state = 'AWAITING_CONFIRMATION';
          item.candidateValue = 'Allergy noted: Penicillin (Moderate rash). Alternative cephalosporin / non-beta-lactam protocol.';
          item.confidenceScore = utterance.confidence;
          item.lastRecognizedUtterance = text;
          this.pendingConfirmationItemId = item.id;
          needsClinicianConfirmationItem = item;

          auditEntries.push({
            id: `audit-${Date.now()}-alg-cand`,
            timestamp: utterance.timestamp,
            category: 'CHECKLIST',
            severity: 'INFO',
            actor: 'Checklist State Machine',
            action: 'State Transition -> AWAITING_CONFIRMATION',
            details: `Specific allergy candidate captured: Penicillin.`,
            protocolCitation: item.protocolRef.section
          });

          aiResponsePrompt = `Allergy noted: Penicillin. Please confirm allergy status.`;
        } else if (statesNoAllergies) {
          item.state = 'AWAITING_CONFIRMATION';
          item.candidateValue = 'NKDA (No Known Drug Allergies)';
          item.confidenceScore = utterance.confidence;
          item.lastRecognizedUtterance = text;
          this.pendingConfirmationItemId = item.id;
          needsClinicianConfirmationItem = item;

          auditEntries.push({
            id: `audit-${Date.now()}-alg-nkda`,
            timestamp: utterance.timestamp,
            category: 'CHECKLIST',
            severity: 'INFO',
            actor: 'Checklist State Machine',
            action: 'State Transition -> AWAITING_CONFIRMATION',
            details: `Candidate allergy status recorded as NKDA.`,
            protocolCitation: item.protocolRef.section
          });

          aiResponsePrompt = `Allergy status recorded as NKDA. Clinician confirmation requested.`;
        }
      }
    }

    // --- ITEM 6: ANTIBIOTICS ---
    else if (lower.includes('antibiotic') || lower.includes('cefazolin') || lower.includes('infusion') || lower.includes('vancomycin')) {
      const item = this.findItem('CHK-ABX-06');
      if (item && item.state !== 'CONFIRMED') {
        item.state = 'AWAITING_CONFIRMATION';
        item.candidateValue = 'Cefazolin 2g IV completed 24 mins prior (<60 min window satisfied)';
        item.confidenceScore = utterance.confidence;
        item.lastRecognizedUtterance = text;
        this.pendingConfirmationItemId = item.id;
        needsClinicianConfirmationItem = item;

        auditEntries.push({
          id: `audit-${Date.now()}-abx`,
          timestamp: utterance.timestamp,
          category: 'CHECKLIST',
          severity: 'INFO',
          actor: 'Checklist State Machine',
          action: 'State Transition -> AWAITING_CONFIRMATION',
          details: `Antibiotic prophylaxis confirmed within 60-minute pre-incision window.`,
          protocolCitation: item.protocolRef.section
        });

        aiResponsePrompt = `Antibiotic prophylaxis recognized: Cefazolin given 24 minutes ago. Ready for clinician confirmation.`;
      }
    }

    // --- ITEM 7: IMAGING ---
    else if (lower.includes('imaging') || lower.includes('mri') || lower.includes('x-ray') || lower.includes('radiology') || lower.includes('screens loaded')) {
      const item = this.findItem('CHK-IMG-07');
      if (item && item.state !== 'CONFIRMED') {
        item.state = 'AWAITING_CONFIRMATION';
        item.candidateValue = 'Pre-op Knee MRI and weight-bearing AP X-Rays loaded on ViewStation 2';
        item.confidenceScore = utterance.confidence;
        item.lastRecognizedUtterance = text;
        this.pendingConfirmationItemId = item.id;
        needsClinicianConfirmationItem = item;

        auditEntries.push({
          id: `audit-${Date.now()}-img`,
          timestamp: utterance.timestamp,
          category: 'CHECKLIST',
          severity: 'INFO',
          actor: 'Checklist State Machine',
          action: 'State Transition -> AWAITING_CONFIRMATION',
          details: `Radiological display verified on monitor.`,
          protocolCitation: item.protocolRef.section
        });

        aiResponsePrompt = `Essential imaging verified on monitor display. Clinician confirmation requested.`;
      }
    }

    // --- ITEM 8: EQUIPMENT & STERILITY ---
    else if (lower.includes('equipment') || lower.includes('sterility') || lower.includes('indicator') || lower.includes('implants ready') || lower.includes('sterilization')) {
      const item = this.findItem('CHK-EQUIP-08');
      if (item && item.state !== 'CONFIRMED') {
        item.state = 'AWAITING_CONFIRMATION';
        item.candidateValue = 'Biological indicators negative, implant tray verified, anticipated blood loss <100mL';
        item.confidenceScore = utterance.confidence;
        item.lastRecognizedUtterance = text;
        this.pendingConfirmationItemId = item.id;
        needsClinicianConfirmationItem = item;

        auditEntries.push({
          id: `audit-${Date.now()}-equip`,
          timestamp: utterance.timestamp,
          category: 'CHECKLIST',
          severity: 'INFO',
          actor: 'Checklist State Machine',
          action: 'State Transition -> AWAITING_CONFIRMATION',
          details: `Sterility indicator verified. Equipment readiness confirmed.`,
          protocolCitation: item.protocolRef.section
        });

        aiResponsePrompt = `Equipment sterility and readiness recognized. Awaiting designated clinician confirmation.`;
      }
    }

    // --- GENERAL PREMATURE PROCEED CHECK ---
    else if (lower.includes("let's proceed") || lower.includes('start incision') || lower.includes('ready to cut') || lower.includes('begin surgery')) {
      const unconfirmed = this.items.filter(i => i.required && i.state !== 'CONFIRMED');
      if (unconfirmed.length > 0) {
        const missingNames = unconfirmed.map(u => u.name).slice(0, 2).join(', ');
        aiResponsePrompt = `Before proceeding to incision, ${unconfirmed.length} mandatory checklist item${unconfirmed.length > 1 ? 's are' : ' is'} still incomplete: ${missingNames}.`;
        auditEntries.push({
          id: `audit-${Date.now()}-premature`,
          timestamp: utterance.timestamp,
          category: 'SYSTEM_SAFETY',
          severity: 'WARNING',
          actor: 'Deterministic Safety Gate',
          action: 'Omission Warning Triggered',
          details: `Team verbalized intent to proceed, but ${unconfirmed.length} required items are unconfirmed.`
        });
      } else {
        aiResponsePrompt = `All pre-incision checklist items are confirmed by designated clinician. Safe to proceed to skin incision under Protocol SIM-2026.1.`;
      }
    }

    return this.generateResult(auditEntries, aiResponsePrompt, false, needsClinicianConfirmationItem, confidence);
  }

  /**
   * Explicit Clinician Gating: Clinician explicitly acts on an item awaiting confirmation
   */
  public resolveClinicianConfirmation(
    itemId: string, 
    decision: 'CONFIRM' | 'REJECT' | 'NEEDS_CLARIFICATION',
    clinicianName: string = 'Dr. Vance (Attending Surgeon)'
  ): StateMachineResult {
    const item = this.items.find(i => i.id === itemId);
    const auditEntries: AuditLogEntry[] = [];
    let aiResponsePrompt: string | null = null;

    if (!item) {
      return this.generateResult(auditEntries, null, false, null, {
        speechRecognition: 1.0, intentExtraction: 1.0, checklistMapping: 1.0, protocolEvidence: 1.0, overallWeightedConfidence: 1.0
      });
    }

    const timestamp = new Date().toLocaleTimeString();

    if (decision === 'CONFIRM') {
      item.state = 'CONFIRMED';
      item.confirmedBy = clinicianName;
      item.confirmedAt = timestamp;
      this.pendingConfirmationItemId = null;

      // Remove contradiction if resolving it
      if (this.activeContradictions.has(item.code)) {
        this.activeContradictions.delete(item.code);
      }

      auditEntries.push({
        id: `audit-${Date.now()}-conf`,
        timestamp,
        category: 'CONFIRMATION',
        severity: 'SUCCESS',
        actor: clinicianName,
        action: 'Designated Clinician Confirmed',
        details: `Checklist item "${item.name}" explicitly verified and confirmed. State -> CONFIRMED.`,
        protocolCitation: item.protocolRef.section
      });

      aiResponsePrompt = `${item.name} officially confirmed by ${clinicianName}.`;
    } else if (decision === 'REJECT') {
      item.state = 'NOT_STARTED';
      item.candidateValue = undefined;
      this.pendingConfirmationItemId = null;

      auditEntries.push({
        id: `audit-${Date.now()}-rej`,
        timestamp,
        category: 'CONFIRMATION',
        severity: 'WARNING',
        actor: clinicianName,
        action: 'Clinician Rejected Candidate Value',
        details: `Clinician rejected candidate value for "${item.name}". Reset to NOT_STARTED.`,
        protocolCitation: item.protocolRef.section
      });

      aiResponsePrompt = `Candidate rejected for ${item.name}. Please repeat this time-out verification.`;
    } else {
      item.state = 'UNCERTAIN';
      this.pendingConfirmationItemId = null;

      auditEntries.push({
        id: `audit-${Date.now()}-clarify`,
        timestamp,
        category: 'CONFIRMATION',
        severity: 'ALERT',
        actor: clinicianName,
        action: 'Clarification Requested by Clinician',
        details: `Item "${item.name}" marked UNCERTAIN pending team clarification.`,
        protocolCitation: item.protocolRef.section
      });

      aiResponsePrompt = `Item "${item.name}" flagged for team clarification.`;
    }

    return this.generateResult(auditEntries, aiResponsePrompt, false, null, {
      speechRecognition: 1.0,
      intentExtraction: 1.0,
      checklistMapping: 1.0,
      protocolEvidence: 1.0,
      overallWeightedConfidence: 1.0
    });
  }

  public dismissContradiction(itemCode: string, clinicianName: string = 'Dr. Vance (Attending Surgeon)'): StateMachineResult {
    this.activeContradictions.delete(itemCode);
    const item = this.findItem(itemCode);
    const auditEntries: AuditLogEntry[] = [];
    if (item) {
      item.state = 'UNCERTAIN';
      auditEntries.push({
        id: `audit-${Date.now()}-contra-dismiss`,
        timestamp: new Date().toLocaleTimeString(),
        category: 'CONTRADICTION',
        severity: 'INFO',
        actor: clinicianName,
        action: 'Contradiction Dismissed / Clarified',
        details: `Contradiction for ${item.name} clarified by clinician. Status reset to UNCERTAIN for re-confirmation.`,
        protocolCitation: item.protocolRef.section
      });
    }

    return this.generateResult(auditEntries, `Contradiction for ${item?.name || 'item'} marked as resolved. Re-verification required.`, false, null, {
      speechRecognition: 1.0, intentExtraction: 1.0, checklistMapping: 1.0, protocolEvidence: 1.0, overallWeightedConfidence: 1.0
    });
  }

  private findItem(code: string): ChecklistItem | undefined {
    return this.items.find(i => i.code === code);
  }

  private generateResult(
    auditEntries: AuditLogEntry[],
    aiResponsePrompt: string | null,
    interruptionDetected: boolean,
    needsClinicianConfirmationItem: ChecklistItem | null,
    confidence: AIConfidenceBreakdown
  ): StateMachineResult {
    const totalRequired = this.items.filter(i => i.required).length;
    const confirmedCount = this.items.filter(i => i.required && i.state === 'CONFIRMED').length;
    const percentage = totalRequired > 0 ? Math.round((confirmedCount / totalRequired) * 100) : 0;
    const hasActiveContradiction = this.activeContradictions.size > 0;
    const canProceed = confirmedCount === totalRequired && !hasActiveContradiction;

    // Grab first active contradiction if any
    const firstContradiction = this.activeContradictions.values().next().value || null;

    return {
      items: this.items,
      activeContradiction: firstContradiction,
      aiResponsePrompt,
      interruptionDetected,
      needsClinicianConfirmationItem,
      auditEntries,
      confidence,
      completionPercentage: percentage,
      canProceedToIncision: canProceed
    };
  }
}
