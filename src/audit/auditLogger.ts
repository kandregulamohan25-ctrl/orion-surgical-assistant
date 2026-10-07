import { AuditLogEntry, AuditCategory } from '../types';

export class OrionAuditLogger {
  private logs: AuditLogEntry[] = [];
  private listeners: Array<(logs: AuditLogEntry[]) => void> = [];

  constructor() {
    this.seedInitialLogs();
  }

  private seedInitialLogs() {
    const now = new Date();
    const formatTime = (minusSeconds: number) => {
      const d = new Date(now.getTime() - minusSeconds * 1000);
      return d.toTimeString().split(' ')[0];
    };

    this.logs = [
      {
        id: 'init-01',
        timestamp: formatTime(180),
        category: 'SYSTEM_SAFETY',
        severity: 'INFO',
        actor: 'ORION Kernel',
        action: 'Subsystem Boot Sequence',
        details: 'Simulation environment initialized. Operating within Nonclinical Decision-Support Boundary.'
      },
      {
        id: 'init-02',
        timestamp: formatTime(175),
        category: 'PROTOCOL',
        severity: 'INFO',
        actor: 'Protocol Registry',
        action: 'Knowledge Base Mounted',
        details: 'Mounted WHO-SST-P2 Rev SIM-2026.1: Pre-Incision Safety Checklist.',
        protocolCitation: 'Section 2.1 - 2.8'
      },
      {
        id: 'init-03',
        timestamp: formatTime(170),
        category: 'SPEECH',
        severity: 'INFO',
        actor: 'Speech Subsystem',
        action: 'Full-Duplex Pipeline Calibrated',
        details: 'Microphone stream bound. Noise profile calibrated to OR standard.'
      }
    ];
  }

  public getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  public addLog(entry: AuditLogEntry) {
    this.logs.unshift(entry);
    this.notify();
  }

  public addLogs(entries: AuditLogEntry[]) {
    this.logs = [...entries, ...this.logs];
    this.notify();
  }

  public clear() {
    this.logs = [];
    this.notify();
  }

  public subscribe(listener: (logs: AuditLogEntry[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.logs));
  }

  public exportJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  public exportCSV(): string {
    const headers = ['Timestamp', 'Category', 'Severity', 'Actor', 'Action', 'Details', 'Protocol Citation'];
    const rows = this.logs.map(log => [
      `"${log.timestamp}"`,
      `"${log.category}"`,
      `"${log.severity}"`,
      `"${log.actor}"`,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      `"${log.protocolCitation || 'N/A'}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const auditLogger = new OrionAuditLogger();
