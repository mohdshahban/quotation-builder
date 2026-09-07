import React, { useState } from 'react';
import { 
  Building2, 
  Edit2, 
  Settings, 
  FileText, 
  Layers, 
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useQuotation } from '../../context/QuotationContext';
import { formatCurrency } from '../../utils/currency';
import { ProjectDetailsModal } from '../project/ProjectDetailsModal';

interface HeaderProps {
  currentView: 'builder' | 'summary' | 'admin';
  setCurrentView: (view: 'builder' | 'summary' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { projectDetails, calculations, resetQuotationToDefaults, setActiveStep } = useQuotation();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all rooms and quotation values to default?')) {
      resetQuotationToDefaults();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight tracking-tight flex items-center gap-1.5">
                  Full Home Interior Cost Calculator
                </h1>
                <p className="text-xs text-slate-400 font-medium">Smart Room-by-Room Quotation Engine</p>
              </div>
            </div>

            {/* Project Summary Badge / Pill (From Reference Image) */}
            <div className="flex items-center bg-rose-50/70 border border-rose-200/80 rounded-full px-3.5 py-1.5 hover:bg-rose-100/60 transition-all cursor-pointer shadow-sm group"
                 onClick={() => setIsProjectModalOpen(true)}>
              <div className="w-7 h-7 rounded-full bg-white shadow-xs border border-rose-200 flex items-center justify-center text-rose-600 mr-2 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left mr-2 max-w-[170px] sm:max-w-[240px] truncate">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight group-hover:text-rose-600 transition-colors">
                  {projectDetails.projectName || 'Project Details'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {projectDetails.propertyType} • {projectDetails.carpetArea} sqft
                </p>
              </div>
              <button 
                type="button" 
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white/80 hover:bg-white px-2 py-0.5 rounded-full border border-rose-200 shadow-xs flex items-center gap-1 ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProjectModalOpen(true);
                }}
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2">
              <nav className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs sm:text-sm font-semibold">
                <button
                  onClick={() => {
                    setCurrentView('builder');
                    setActiveStep(2);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    currentView === 'builder'
                      ? 'bg-white text-rose-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span className="hidden md:inline">Room Builder</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('summary');
                    setActiveStep(3);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    currentView === 'summary'
                      ? 'bg-white text-rose-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden md:inline">Summary & PDF</span>
                </button>

                <button
                  onClick={() => setCurrentView('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    currentView === 'admin'
                      ? 'bg-white text-rose-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Manage cards, rates, and catalog descriptions"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden md:inline">Catalog Admin</span>
                </button>
              </nav>

              {/* Reset to defaults button */}
              <button
                onClick={handleReset}
                title="Reset Quotation to Default"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200/60 hidden sm:flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Project Details Edit Modal */}
      <ProjectDetailsModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </>
  );
};
