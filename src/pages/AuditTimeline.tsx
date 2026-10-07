import React, { useState } from 'react';
import { AuditLogEntry, AuditCategory } from '../types';
import { 
  History, 
  Search, 
  Download, 
  Filter, 
  Mic, 
  Bot, 
  CheckSquare, 
  BookOpen, 
  UserCheck, 
  AlertTriangle, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { auditLogger } from '../audit/auditLogger';

interface AuditTimelineProps {
  logs: AuditLogEntry[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ logs }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
    const matchesQuery = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(auditLogger.exportJSON());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `orion_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(auditLogger.exportCSV());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `orion_audit_log_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getCategoryIcon = (category: AuditCategory) => {
    switch (category) {
      case 'SPEECH': return <Mic className="h-4 w-4 text-blue-600" />;
      case 'AI_INFERENCE': return <Bot className="h-4 w-4 text-indigo-600" />;
      case 'CHECKLIST': return <CheckSquare className="h-4 w-4 text-emerald-600" />;
      case 'PROTOCOL': return <BookOpen className="h-4 w-4 text-purple-600" />;
      case 'CONFIRMATION': return <UserCheck className="h-4 w-4 text-amber-600" />;
      case 'CONTRADICTION': return <AlertTriangle className="h-4 w-4 text-rose-600" />;
      case 'SYSTEM_SAFETY': return <ShieldCheck className="h-4 w-4 text-slate-700" />;
      default: return <History className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Immutable Regulatory Ledger
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Event & Audit Trail Timeline
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Every audio capture, candidate match, protocol citation, contradiction detection, and designated clinician sign-off is logged with sub-second timestamps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['ALL', 'SPEECH', 'CHECKLIST', 'CONFIRMATION', 'CONTRADICTION', 'PROTOCOL', 'SYSTEM_SAFETY'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Chronological Timeline Stream */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
          {filteredLogs.length === 0 ? (
            <div className="p-4 text-xs text-slate-500 italic">
              No audit records match the current filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="relative pl-6 group">
                {/* Node icon dot */}
                <div className="absolute -left-[17px] top-0 p-1.5 bg-white border-2 border-slate-300 rounded-full group-hover:border-blue-600 transition-colors shadow-2xs">
                  {getCategoryIcon(log.category)}
                </div>

                <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-3.5 space-y-1.5 hover:border-slate-300 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {log.timestamp}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono uppercase ${
                        log.severity === 'CRITICAL' || log.severity === 'ALERT'
                          ? 'bg-rose-100 text-rose-800'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-100 text-amber-800'
                          : log.severity === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        by <strong className="text-slate-800">{log.actor}</strong>
                      </span>
                    </div>

                    {log.confidenceMetric !== undefined && (
                      <span className="text-[11px] font-mono text-slate-500">
                        Score: {Math.round(log.confidenceMetric * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-bold text-slate-900">
                    {log.action}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {log.details}
                  </p>

                  {log.protocolCitation && (
                    <div className="pt-1 text-[11px] text-blue-700 font-mono flex items-center gap-1">
                      <span>Cites:</span>
                      <span>{log.protocolCitation}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
