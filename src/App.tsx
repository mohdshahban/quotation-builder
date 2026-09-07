import React, { useState } from 'react';
import { CatalogProvider } from './context/CatalogContext';
import { QuotationProvider } from './context/QuotationContext';
import { Header } from './components/common/Header';
import { BuilderView } from './components/builder/BuilderView';
import { QuotationSummary } from './components/summary/QuotationSummary';
import { CatalogDashboard } from './components/admin/CatalogDashboard';

export function AppContent() {
  const [currentView, setCurrentView] = useState<'builder' | 'summary' | 'admin'>('builder');

  return (
    <div className="min-h-screen bg-[#FAF7F8] flex flex-col font-sans">
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-1 flex flex-col">
        {currentView === 'builder' && (
          <BuilderView onGoToSummary={() => setCurrentView('summary')} />
        )}

        {currentView === 'summary' && (
          <QuotationSummary onBackToBuilder={() => setCurrentView('builder')} />
        )}

        {currentView === 'admin' && (
          <CatalogDashboard />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CatalogProvider>
      <QuotationProvider>
        <AppContent />
      </QuotationProvider>
    </CatalogProvider>
  );
}
