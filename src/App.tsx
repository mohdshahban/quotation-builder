import React, { useState } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { CatalogProvider } from './context/CatalogContext';
import { QuotationProvider } from './context/QuotationContext';
import { Header } from './components/common/Header';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { BuilderView } from './components/builder/BuilderView';
import { QuotationSummary } from './components/summary/QuotationSummary';
import { CatalogDashboard } from './components/admin/CatalogDashboard';
import { ClientPortalView } from './components/client/ClientPortalView';
import { StudioSettingsModal } from './components/settings/StudioSettingsModal';
import { NewProjectModal } from './components/project/NewProjectModal';

function AppContent() {
  const { activeNavView, setActiveNavView } = useWorkspace();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F8] flex flex-col font-sans text-slate-800 antialiased selection:bg-rose-500 selection:text-white">
      {/* Universal Top Header Navigation */}
      <Header
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {activeNavView === 'dashboard' && (
          <HomeDashboard
            onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          />
        )}

        {activeNavView === 'builder' && (
          <BuilderView onGoToSummary={() => setActiveNavView('summary')} />
        )}

        {activeNavView === 'summary' && (
          <QuotationSummary onBackToBuilder={() => setActiveNavView('builder')} />
        )}

        {activeNavView === 'admin' && (
          <CatalogDashboard />
        )}

        {activeNavView === 'client_portal' && (
          <ClientPortalView
            onBackToDashboard={() => setActiveNavView('dashboard')}
            onGoToStudio={() => setActiveNavView('builder')}
            onGoToSummary={() => setActiveNavView('summary')}
          />
        )}
      </main>

      {/* Studio Workspace & Branding Settings Modal */}
      <StudioSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <CatalogProvider>
      <WorkspaceProvider>
        <QuotationProvider>
          <AppContent />
        </QuotationProvider>
      </WorkspaceProvider>
    </CatalogProvider>
  );
}
