import { ProtocolReference } from '../types';

export interface ProtocolDocument {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  category: string;
  revision: string;
  effectiveDate: string;
  reviewCycle: string;
  status: 'APPROVED' | 'DRAFT' | 'ARCHIVED';
  regulatoryStandard: string;
  summary: string;
  sections: {
    sectionNumber: string;
    heading: string;
    body: string;
    mandatoryRequirements: string[];
    contradictionTriggers: string[];
    nonclinicalDisclaimer: string;
  }[];
}

export const APPROVED_PROTOCOLS: ProtocolDocument[] = [
  {
    id: 'proto-who-timeout-01',
    code: 'WHO-SST-P2',
    title: 'WHO Surgical Safety Checklist: Part 2 - Before Skin Incision (Time Out)',
    shortTitle: 'Pre-Incision Time Out',
    category: 'Surgical Safety Standardization',
    revision: 'SIM-2026.1',
    effectiveDate: '2026-01-15',
    reviewCycle: 'Annual Simulated Review',
    status: 'APPROVED',
    regulatoryStandard: 'World Health Organization Guidelines for Safe Surgery (Simulated Adapted)',
    summary: 'Defines mandatory multidisciplinary pause immediately prior to surgical incision to confirm patient identity, procedure, site, consent, allergies, and prophylactic antibiotic timing.',
    sections: [
      {
        sectionNumber: '2.1',
        heading: 'Multidisciplinary Team Introduction & Role Acknowledgment',
        body: 'All team members (Surgeon, Anesthesiologist, Circulating Nurse, Scrub Technician) must verbally confirm their names and designated responsibilities before incision begins.',
        mandatoryRequirements: ['Verbal confirmation from lead surgeon', 'Verbal confirmation from lead anesthesiologist', 'Circulating nurse readiness check'],
        contradictionTriggers: ['Unknown operator executing critical surgical steps', 'Mismatched roster'],
        nonclinicalDisclaimer: 'Simulated guidance standard for nonclinical evaluation and educational testing.'
      },
      {
        sectionNumber: '2.2',
        heading: 'Patient Identity & Procedure Verification',
        body: 'The circulating nurse and surgeon must read two independent identifiers (Full name, Simulation ID/MRN) aloud and match against physical surgical wristband and operative consent form.',
        mandatoryRequirements: ['Full name matching', 'Simulation ID match', 'Matching scheduled procedure name without acronyms'],
        contradictionTriggers: ['Different first/last name', 'Different MRN suffix', 'Mismatched procedural nomenclature'],
        nonclinicalDisclaimer: 'All data synthetic. Zero real PHI accessed.'
      },
      {
        sectionNumber: '2.3',
        heading: 'Surgical Site & Laterality Confirmation',
        body: 'The exact anatomical side and marking must be visually verified and orally stated by the operating surgeon. "Left", "Right", "Bilateral", or "Midline" must be explicitly verified against the marked surgical field.',
        mandatoryRequirements: ['Verbal laterality statement (Left/Right)', 'Surgical site skin marker verified in operative field'],
        contradictionTriggers: ['Conflicting laterality statements (e.g. Surgeon states Right knee while Chart/Nurse states Left knee)', 'Unmarked operative site'],
        nonclinicalDisclaimer: 'Safety gate locks checklist upon any laterality disagreement.'
      },
      {
        sectionNumber: '2.4',
        heading: 'Operative Consent Verification',
        body: 'Informed consent signed by patient/surrogate must be present in the medical record matching the planned operative intervention and specific side.',
        mandatoryRequirements: ['Signed consent form present in chart', 'Procedure listed matches proposed incision scope'],
        contradictionTriggers: ['Missing consent document', 'Signature dated post-anesthesia', 'Verbal declaration of missing paperwork'],
        nonclinicalDisclaimer: 'Requires explicit designated clinician sign-off.'
      },
      {
        sectionNumber: '2.5',
        heading: 'Allergy Status & Hypersensitivity Review',
        body: 'Anesthesiologist must explicitly declare patient allergy profile (e.g. "No Known Drug Allergies - NKDA" or specific agents such as Penicillin, Latex, Cephalosporins). All conflicting declarations require immediate halt of time-out.',
        mandatoryRequirements: ['Explicit oral allergy statement by anesthesiologist', 'Cross-verification with nurse charting'],
        contradictionTriggers: ['Declaration of NKDA when another participant notes Penicillin/Latex allergy', 'Discrepancy in anaphylaxis history'],
        nonclinicalDisclaimer: 'Contradiction state triggers amber/red override until clinician resolves.'
      },
      {
        sectionNumber: '2.6',
        heading: 'Prophylactic Antibiotic Administration Timing',
        body: 'Prophylactic antibiotics must be confirmed as administered within 60 minutes prior to incision (or documented not indicated). Anesthesiologist or circulating nurse must specify agent and completion timestamp.',
        mandatoryRequirements: ['Infusion completed within 60 minutes prior to incision', 'Agent name stated (e.g., Cefazolin 2g IV)'],
        contradictionTriggers: ['Administered >60 minutes prior', 'Infusion ongoing at incision', 'Agent omitted despite order'],
        nonclinicalDisclaimer: 'Decision-support guideline only; does not dispense medications.'
      },
      {
        sectionNumber: '2.7',
        heading: 'Essential Imaging Display & Orientation',
        body: 'Radiological imaging (MRI, CT, Fluoroscopy, X-Ray) required for intraoperative navigation must be displayed on OR visual monitors with correct left/right orientation verified.',
        mandatoryRequirements: ['Images displayed on digital screens', 'Patient identification on imaging verified', 'Correct anatomical orientation verified'],
        contradictionTriggers: ['No imaging loaded when procedure demands fluoroscopy/CT', 'Inverted radiographic projection'],
        nonclinicalDisclaimer: 'Simulated environment validation display.'
      },
      {
        sectionNumber: '2.8',
        heading: 'Anticipated Critical Events & Equipment Readiness',
        body: 'Surgeon reviews anticipated critical steps, duration, and blood loss. Anesthesiologist reviews specific airway or hemodynamic concerns. Scrub team confirms sterility, indicator strips, and specialty equipment.',
        mandatoryRequirements: ['Estimated blood loss verbalized', 'Sterility confirmation', 'Equipment availability check'],
        contradictionTriggers: ['Missing implant or tray', 'Sterility failure in peel pack'],
        nonclinicalDisclaimer: 'Nonclinical checklist protocol.'
      }
    ]
  }
];

export function getProtocolCitation(sectionNumber: string): ProtocolReference {
  const primaryDoc = APPROVED_PROTOCOLS[0];
  const section = primaryDoc.sections.find(s => s.sectionNumber === sectionNumber) || primaryDoc.sections[0];
  
  return {
    protocolId: primaryDoc.code,
    protocolTitle: primaryDoc.shortTitle,
    section: `Section ${section.sectionNumber}: ${section.heading}`,
    revision: primaryDoc.revision,
    excerpt: section.body,
    urlRef: `protocols/${primaryDoc.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`
  };
}
