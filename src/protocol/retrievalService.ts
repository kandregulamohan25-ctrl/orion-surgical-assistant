import { APPROVED_PROTOCOLS, ProtocolDocument } from '../data/protocols';
import { ProtocolReference } from '../types';

export interface ProtocolSearchResult {
  found: boolean;
  reference?: ProtocolReference;
  fallbackMessage?: string;
}

export class ProtocolRetrievalService {
  private protocols: ProtocolDocument[] = APPROVED_PROTOCOLS;

  public getAllProtocols(): ProtocolDocument[] {
    return this.protocols;
  }

  public getProtocolByCode(code: string): ProtocolDocument | undefined {
    return this.protocols.find(p => p.code.toLowerCase() === code.toLowerCase());
  }

  /**
   * Traceable protocol search with deterministic grounding.
   * If query is outside approved scope, returns safe disclaimer.
   */
  public queryProtocol(queryText: string): ProtocolSearchResult {
    const q = queryText.toLowerCase();

    // Map common clinical time out questions to approved sections
    if (q.includes('consent') || q.includes('paperwork') || q.includes('permission')) {
      return this.formatResult('2.4');
    }
    if (q.includes('site') || q.includes('laterality') || q.includes('left') || q.includes('right') || q.includes('mark')) {
      return this.formatResult('2.3');
    }
    if (q.includes('identity') || q.includes('name') || q.includes('wristband') || q.includes('mrn')) {
      return this.formatResult('2.2');
    }
    if (q.includes('allerg') || q.includes('penicillin') || q.includes('hypersensitiv')) {
      return this.formatResult('2.5');
    }
    if (q.includes('antibiotic') || q.includes('cefazolin') || q.includes('prophylaxis') || q.includes('60 min')) {
      return this.formatResult('2.6');
    }
    if (q.includes('imaging') || q.includes('mri') || q.includes('x-ray') || q.includes('radiology')) {
      return this.formatResult('2.7');
    }
    if (q.includes('equipment') || q.includes('sterility') || q.includes('indicator') || q.includes('blood loss')) {
      return this.formatResult('2.8');
    }
    if (q.includes('team') || q.includes('intro') || q.includes('role')) {
      return this.formatResult('2.1');
    }

    // Safety fallback: AI never invents protocol content
    return {
      found: false,
      fallbackMessage: "I don't have sufficient approved protocol evidence in knowledge base Rev SIM-2026.1 to address that inquiry."
    };
  }

  private formatResult(sectionNumber: string): ProtocolSearchResult {
    const doc = this.protocols[0];
    const section = doc.sections.find(s => s.sectionNumber === sectionNumber);
    if (!section) {
      return {
        found: false,
        fallbackMessage: "I don't have sufficient protocol evidence to make that determination."
      };
    }

    return {
      found: true,
      reference: {
        protocolId: doc.code,
        protocolTitle: doc.shortTitle,
        section: `Section ${section.sectionNumber}: ${section.heading}`,
        revision: doc.revision,
        excerpt: section.body,
        urlRef: `protocols/${doc.code.toLowerCase()}.md`
      }
    };
  }
}

export const protocolService = new ProtocolRetrievalService();
