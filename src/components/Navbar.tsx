import React from 'react';
import { 
  Activity, 
  PlayCircle, 
  CheckSquare, 
  BookOpen, 
  User, 
  History, 
  Gauge, 
  BarChart3, 
  Sliders, 
  Settings, 
  Layers, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export type ActiveTab = 
  | 'command-center'
  | 'live-simulation'
  | 'checklist'
  | 'protocols'
  | 'patients'
  | 'audit-timeline'
  | 'ai-confidence'
  | 'performance'
  | 'scenario-builder'
  | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onStartJudgeDemo: () => void;
  onOpenArchitecture: () => void;
  isSimulationActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onStartJudgeDemo,
  onOpenArchitecture,
  isSimulationActive
}) => {
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'command-center', label: 'Command Center', icon: <Activity className="h-4 w-4" /> },
    { id: 'live-simulation', label: 'Live OR Simulation', icon: <PlayCircle className="h-4 w-4" /> },
    { id: 'checklist', label: 'Checklist State', icon: <CheckSquare className="h-4 w-4" /> },
    { id: 'protocols', label: 'Protocols', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'patients', label: 'Synthetic Patients', icon: <User className="h-4 w-4" /> },
    { id: 'audit-timeline', label: 'Audit Timeline', icon: <History className="h-4 w-4" /> },
    { id: 'ai-confidence', label: 'AI Confidence', icon: <Gauge className="h-4 w-4" /> },
    { id: 'performance', label: 'Static vs AI Benchmark', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'scenario-builder', label: 'Scenario Builder', icon: <Sliders className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Banner: Nonclinical Safety & Regulatory Disclaimer */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-1 text-[11px] flex items-center justify-between text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>
            <strong className="text-slate-700">L&T TECHGIUM 10TH EDITION • PROBLEM #45:</strong> Nonclinical simulated decision-support prototype. Never for direct patient diagnosis or autonomous care.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenArchitecture}
            className="text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Layers className="h-3 w-3" />
            System Architecture
          </button>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-emerald-700 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            WHO-SST Rev SIM-2026.1
          </span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Product Title */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('command-center')} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black tracking-tighter text-sm group-hover:bg-blue-700 transition-colors">
                OR
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-950 font-sans">
                    ORION
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                    Sim 10.0
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 hidden sm:block">
                  Operating Room Intelligence & Observation Navigator
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* Status indicator */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
              <span className={`h-2 w-2 rounded-full ${isSimulationActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>Status: <strong className="text-slate-900">{isSimulationActive ? 'Simulation Active' : 'Ready'}</strong></span>
            </div>

            {/* Judge Demo Quick Action */}
            <button
              onClick={onStartJudgeDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Start Judge Demo
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none border-t border-slate-100">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
