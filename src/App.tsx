import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ChecklistItem, 
  DialogueUtterance, 
  ContradictionEvent, 
  SyntheticPatient, 
  SimulationScenario, 
  AIStatus, 
  AIConfidenceBreakdown,
  AuditLogEntry
} from './types';
import { INITIAL_CHECKLIST_ITEMS } from './checklist/initialItems';
import { DeterministicChecklistEngine } from './checklist/engine';
import { SIMULATION_SCENARIOS } from './data/scenarios';
import { SYNTHETIC_PATIENTS } from './data/patients';
import { auditLogger } from './audit/auditLogger';
import { speechService } from './speech/speechService';

// Components & Modals
import { Navbar, ActiveTab } from './components/Navbar';
import { ClinicianConfirmationModal } from './components/ClinicianConfirmationModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { LandingOverlay } from './components/LandingOverlay';

// Pages
import { CommandCenter } from './pages/CommandCenter';
import { LiveSimulation } from './pages/LiveSimulation';
import { ChecklistManager } from './pages/ChecklistManager';
import { ProtocolLibrary } from './pages/ProtocolLibrary';
import { PatientSimulation } from './pages/PatientSimulation';
import { AuditTimeline } from './pages/AuditTimeline';
import { ConfidenceInspector } from './pages/ConfidenceInspector';
import { PerformanceAnalytics } from './pages/PerformanceAnalytics';
import { ScenarioBuilder } from './pages/ScenarioBuilder';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  // Navigation & Modal States
  const [activeTab, setActiveTab] = useState<ActiveTab>('command-center');
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);
  const [pendingConfirmationItem, setPendingConfirmationItem] = useState<ChecklistItem | null>(null);

  // Engine & Simulation Core States
  const engine = useMemo(() => new DeterministicChecklistEngine(INITIAL_CHECKLIST_ITEMS), []);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(INITIAL_CHECKLIST_ITEMS);
  const [dialogueHistory, setDialogueHistory] = useState<DialogueUtterance[]>([]);
  const [activeContradiction, setActiveContradiction] = useState<ContradictionEvent | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus>('IDLE');
  const [aiConfidence, setAiConfidence] = useState<AIConfidenceBreakdown>({
    speechRecognition: 0.96,
    intentExtraction: 0.92,
    checklistMapping: 0.94,
    protocolEvidence: 1.0,
    overallWeightedConfidence: 0.96
  });
  const [currentPatient, setCurrentPatient] = useState<SyntheticPatient>(SYNTHETIC_PATIENTS[0]);
  const [currentScenario, setCurrentScenario] = useState<SimulationScenario>(SIMULATION_SCENARIOS[0]);
  const [allScenarios, setAllScenarios] = useState<SimulationScenario[]>(SIMULATION_SCENARIOS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(auditLogger.getLogs());

  // Subscribe to speech service status
  useEffect(() => {
    speechService.subscribeStatus((status) => {
      setAiStatus(status);
    });

    const unsubscribeAudit = auditLogger.subscribe((logs) => {
      setAuditLogs([...logs]);
    });

    return () => {
      unsubscribeAudit();
    };
  }, []);

  // Completion calculation
  const totalRequired = checklistItems.filter(i => i.required).length;
  const confirmedCount = checklistItems.filter(i => i.required && i.state === 'CONFIRMED').length;
  const completionPercentage = totalRequired > 0 ? Math.round((confirmedCount / totalRequired) * 100) : 0;

  // Process incoming dialogue utterance through the Deterministic Safety Engine
  const handleProcessUtterance = useCallback((utterance: DialogueUtterance) => {
    // Append to live conversation history
    setDialogueHistory(prev => [...prev, utterance]);

    // Send through deterministic state engine
    const result = engine.processUtterance(utterance);

    // Update items & contradictions
    setChecklistItems([...result.items]);
    setActiveContradiction(result.activeContradiction);
    setAiConfidence(result.confidence);

    // Log all generated audit entries
    if (result.auditEntries && result.auditEntries.length > 0) {
      auditLogger.addLogs(result.auditEntries);
    }

    // Set item requiring clinician confirmation if triggered
    if (result.needsClinicianConfirmationItem) {
      setPendingConfirmationItem(result.needsClinicianConfirmationItem);
    }

    // AI Auditory Response
    if (result.aiResponsePrompt) {
      const aiUtterance: DialogueUtterance = {
        id: `utt-ai-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        speaker: 'AI Assistant',
        speakerRole: 'ORION Decision Support',
        text: result.aiResponsePrompt,
        confidence: 1.0
      };

      // Slight natural cadence delay before AI speaks
      setTimeout(() => {
        setDialogueHistory(prev => [...prev, aiUtterance]);
        speechService.speak(result.aiResponsePrompt!);

        auditLogger.addLog({
          id: `audit-ai-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          category: 'AI_INFERENCE',
          severity: 'INFO',
          actor: 'ORION Assistant',
          action: 'Synthesized Auditory Guidance',
          details: `Prompt: "${result.aiResponsePrompt}"`,
          confidenceMetric: 0.98
        });
      }, 400);
    }
  }, [engine]);

  // Clinician Confirmation Gating Resolution
  const handleConfirmItem = (itemId: string) => {
    const res = engine.resolveClinicianConfirmation(itemId, 'CONFIRM');
    setChecklistItems([...res.items]);
    setActiveContradiction(res.activeContradiction);
    setPendingConfirmationItem(null);
    auditLogger.addLogs(res.auditEntries);

    if (res.aiResponsePrompt) {
      speechService.speak(res.aiResponsePrompt);
    }
  };

  const handleRejectItem = (itemId: string) => {
    const res = engine.resolveClinicianConfirmation(itemId, 'REJECT');
    setChecklistItems([...res.items]);
    setActiveContradiction(res.activeContradiction);
    setPendingConfirmationItem(null);
    auditLogger.addLogs(res.auditEntries);

    if (res.aiResponsePrompt) {
      speechService.speak(res.aiResponsePrompt);
    }
  };

  const handleClarifyItem = (itemId: string) => {
    const res = engine.resolveClinicianConfirmation(itemId, 'NEEDS_CLARIFICATION');
    setChecklistItems([...res.items]);
    setActiveContradiction(res.activeContradiction);
    setPendingConfirmationItem(null);
    auditLogger.addLogs(res.auditEntries);

    if (res.aiResponsePrompt) {
      speechService.speak(res.aiResponsePrompt);
    }
  };

  const handleResolveContradiction = (itemCode: string) => {
    const res = engine.dismissContradiction(itemCode);
    setChecklistItems([...res.items]);
    setActiveContradiction(res.activeContradiction);
    auditLogger.addLogs(res.auditEntries);

    if (res.aiResponsePrompt) {
      speechService.speak(res.aiResponsePrompt);
    }
  };

  const handleResetSimulation = () => {
    engine.reset();
    setChecklistItems(engine.getItems());
    setDialogueHistory([]);
    setActiveContradiction(null);
    setPendingConfirmationItem(null);
    setAiStatus('IDLE');

    auditLogger.addLog({
      id: `audit-reset-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: 'SYSTEM_SAFETY',
      severity: 'INFO',
      actor: 'Operating Staff',
      action: 'Simulation Reset',
      details: 'Checklist state machine reinitialized to NOT_STARTED for all parameters.'
    });
  };

  // Launch the 3-Minute Judge Demo Mode
  const handleStartJudgeDemo = () => {
    setShowLanding(false);
    handleResetSimulation();
    const demoScenario = SIMULATION_SCENARIOS[0]; // Official 3-min Judge Demo
    setCurrentScenario(demoScenario);
    setCurrentPatient(demoScenario.patient);
    setActiveTab('live-simulation');

    auditLogger.addLog({
      id: `audit-demo-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: 'SYSTEM_SAFETY',
      severity: 'INFO',
      actor: 'Judge Demo Engine',
      action: 'Launched 3-Minute L&T Techgium Evaluation',
      details: 'Initialized comprehensive multi-turn benchmark with simulated patient Alex Morgan SIM-0427.'
    });
  };

  const handleSelectPatient = (patient: SyntheticPatient) => {
    setCurrentPatient(patient);
    auditLogger.addLog({
      id: `audit-pat-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: 'SYSTEM_SAFETY',
      severity: 'INFO',
      actor: 'Circulating Nurse',
      action: 'Synthetic Patient Loaded',
      details: `Active profile set to ${patient.fullName} (${patient.simulationId}).`
    });
  };

  const handleSelectScenario = (scenario: SimulationScenario) => {
    setCurrentScenario(scenario);
    setCurrentPatient(scenario.patient);
    handleResetSimulation();
  };

  const handleSaveAndRunCustomScenario = (scenario: SimulationScenario) => {
    setAllScenarios(prev => [scenario, ...prev]);
    setCurrentScenario(scenario);
    setCurrentPatient(scenario.patient);
    handleResetSimulation();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Landing Overlay (Initial Product Entry) */}
      {showLanding && (
        <LandingOverlay
          onEnterSimulation={() => setShowLanding(false)}
          onLaunchJudgeDemo={handleStartJudgeDemo}
          onOpenArchitecture={() => {
            setShowLanding(false);
            setShowArchitectureModal(true);
          }}
        />
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartJudgeDemo={handleStartJudgeDemo}
        onOpenArchitecture={() => setShowArchitectureModal(true)}
        isSimulationActive={dialogueHistory.length > 0}
      />

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'command-center' && (
          <CommandCenter
            items={checklistItems}
            currentPatient={currentPatient}
            currentScenario={currentScenario}
            completionPercentage={completionPercentage}
            onStartSimulation={() => setActiveTab('live-simulation')}
            onStartJudgeDemo={handleStartJudgeDemo}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'live-simulation' && (
          <LiveSimulation
            items={checklistItems}
            dialogueHistory={dialogueHistory}
            activeContradiction={activeContradiction}
            aiStatus={aiStatus}
            aiConfidence={aiConfidence}
            currentPatient={currentPatient}
            currentScenario={currentScenario}
            onSendUtterance={handleProcessUtterance}
            onRequestClinicianConfirmation={(item) => setPendingConfirmationItem(item)}
            onResolveContradiction={handleResolveContradiction}
            onResetSimulation={handleResetSimulation}
            onSelectScenario={handleSelectScenario}
            allScenarios={allScenarios}
          />
        )}

        {activeTab === 'checklist' && (
          <ChecklistManager
            items={checklistItems}
            onRequestConfirmation={(item) => setPendingConfirmationItem(item)}
          />
        )}

        {activeTab === 'protocols' && (
          <ProtocolLibrary />
        )}

        {activeTab === 'patients' && (
          <PatientSimulation
            currentPatient={currentPatient}
            onSelectPatient={handleSelectPatient}
          />
        )}

        {activeTab === 'audit-timeline' && (
          <AuditTimeline logs={auditLogs} />
        )}

        {activeTab === 'ai-confidence' && (
          <ConfidenceInspector confidence={aiConfidence} />
        )}

        {activeTab === 'performance' && (
          <PerformanceAnalytics />
        )}

        {activeTab === 'scenario-builder' && (
          <ScenarioBuilder
            onSaveAndRunScenario={handleSaveAndRunCustomScenario}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage onResetEverything={handleResetSimulation} />
        )}
      </main>

      {/* Clinician Confirmation Gating Modal */}
      <ClinicianConfirmationModal
        item={pendingConfirmationItem}
        onConfirm={handleConfirmItem}
        onReject={handleRejectItem}
        onClarify={handleClarifyItem}
        onDismiss={() => setPendingConfirmationItem(null)}
      />

      {/* System Architecture Modal */}
      <ArchitectureModal
        isOpen={showArchitectureModal}
        onClose={() => setShowArchitectureModal(false)}
      />

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-400 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ORION (Operating Room Intelligence & Observation Navigator) • L&T Techgium 10th Edition</span>
          <span>Nonclinical Simulation Standard • Revision SIM-2026.1 • Clean White Canvas</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
