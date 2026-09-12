import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Edit2, 
  Settings, 
  FileText, 
  Layers, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  Globe,
  LayoutDashboard,
  Crown,
  Plus,
  Check,
  User,
  Shield,
  Briefcase
} from 'lucide-react';
import { useWorkspace, NavView } from '../../context/WorkspaceContext';
import { useQuotation } from '../../context/QuotationContext';
import { formatCurrency } from '../../utils/currency';
import { ProjectDetailsModal } from '../project/ProjectDetailsModal';
import { UserRole } from '../../types/settings';

interface HeaderProps {
  onOpenNewProjectModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewProjectModal,
  onOpenSettingsModal,
}) => {
  const { 
    projects, 
    activeProjectId, 
    activeProject, 
    setActiveProjectId, 
    studioSettings, 
    currentUser, 
    switchRole, 
    permissions,
    activeNavView,
    setActiveNavView 
  } = useWorkspace();

  const { calculations, resetQuotationToDefaults, setActiveStep } = useQuotation();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all rooms and quotation values to default?')) {
      resetQuotationToDefaults();
    }
  };

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setIsProjectDropdownOpen(false);
  };

  const rolesList: { role: UserRole; title: string; subtitle: string; icon: any }[] = [
    { role: 'admin', title: 'Admin / Principal Architect', subtitle: 'Full control over studio, rates & pipeline', icon: Crown },
    { role: 'designer', title: 'Lead Designer', subtitle: 'Room configuration & custom design', icon: Layers },
    { role: 'estimator', title: 'Cost Estimator', subtitle: 'Rate audits & commercial summaries', icon: Briefcase },
    { role: 'client', title: 'Client Viewer', subtitle: 'Interactive proposal presentation only', icon: User },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            
            {/* Left: Logo & Company Name */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveNavView('dashboard')}
                className="flex items-center gap-3 text-left group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="hidden lg:block">
                  <h1 className="text-sm sm:text-base font-black text-slate-800 leading-tight tracking-tight">
                    {studioSettings.companyName || 'Studio Lux Interio Design'}
                  </h1>
                  <p className="text-[11px] text-slate-400 font-semibold truncate max-w-[170px]">
                    {studioSettings.tagline ? studioSettings.tagline.split('•')[0] : 'Architecture'}
                  </p>
                </div>
              </button>

              {/* Project Selector Dropdown Pill */}
              <div className="relative" ref={projectDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="flex items-center bg-rose-50/80 border border-rose-200/90 rounded-full px-3 py-1.5 hover:bg-rose-100/70 transition-all text-left shadow-2xs group"
                >
                  <div className="w-6 h-6 rounded-full bg-white shadow-2xs border border-rose-200 flex items-center justify-center text-rose-600 mr-2 shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="max-w-[130px] sm:max-w-[190px] truncate mr-1.5">
                    <p className="text-xs font-bold text-slate-800 truncate leading-tight group-hover:text-rose-600 transition-colors">
                      {activeProject?.projectDetails.projectName || 'Select Project'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {activeProject?.projectDetails.propertyType} • {formatCurrency(activeProject?.estimateTotal || calculations.grandTotal)}
                    </p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Project Selector Dropdown Menu */}
                {isProjectDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Switch Project</span>
                      {permissions.canCreateProjects && (
                        <button
                          onClick={() => {
                            setIsProjectDropdownOpen(false);
                            onOpenNewProjectModal();
                          }}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>New</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-50">
                      {projects.map(p => {
                        const isSelected = p.id === activeProjectId;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectProject(p.id)}
                            className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-rose-50/50 transition-colors ${
                              isSelected ? 'bg-rose-50/40 text-rose-600 font-bold' : 'text-slate-700'
                            }`}
                          >
                            <div className="truncate mr-2">
                              <p className="text-xs font-bold truncate">{p.projectDetails.projectName}</p>
                              <p className="text-[11px] text-slate-400">
                                {p.projectDetails.clientName} • {formatCurrency(p.estimateTotal || 0)}
                              </p>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProjectDropdownOpen(false);
                          setIsProjectModalOpen(true);
                        }}
                        className="w-full text-center py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Current Project Details</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center: Main Navigation Tabs */}
            <div className="hidden md:flex items-center">
              <nav className="flex bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 text-xs sm:text-sm font-semibold">
                
                {/* 1. Dashboard */}
                <button
                  onClick={() => setActiveNavView('dashboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                    activeNavView === 'dashboard'
                      ? 'bg-white text-rose-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                {/* 2. Studio (Room Builder) */}
                <button
                  onClick={() => {
                    setActiveNavView('builder');
                    setActiveStep(2);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                    activeNavView === 'builder'
                      ? 'bg-white text-rose-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Studio</span>
                </button>

                {/* 3. Summary & PDF */}
                <button
                  onClick={() => {
                    setActiveNavView('summary');
                    setActiveStep(3);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                    activeNavView === 'summary'
                      ? 'bg-white text-rose-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Summary & PDF</span>
                </button>

                {/* 4. Catalog Admin */}
                {permissions.canEditCatalog && (
                  <button
                    onClick={() => setActiveNavView('admin')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                      activeNavView === 'admin'
                        ? 'bg-white text-rose-600 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Catalog Admin</span>
                  </button>
                )}

                {/* 5. Client Portal */}
                <button
                  onClick={() => setActiveNavView('client_portal')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                    activeNavView === 'client_portal'
                      ? 'bg-white text-rose-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-4 h-4 text-rose-500" />
                  <span className="text-rose-600">Client Portal</span>
                </button>

              </nav>
            </div>

            {/* Right: New Project / Enterprise Badge & User RBAC Switcher */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* New Project Quick Action Button */}
              {permissions.canCreateProjects && (
                <button
                  type="button"
                  onClick={onOpenNewProjectModal}
                  className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 hover:shadow-lg transition-all flex items-center gap-1.5 transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Project</span>
                </button>
              )}

              {/* Enterprise / Settings Pill */}
              <button
                type="button"
                onClick={onOpenSettingsModal}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-bold transition-colors"
                title="Studio Branding & Workspace Settings"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>Enterprise</span>
              </button>

              {/* Reset to defaults button */}
              <button
                onClick={handleReset}
                title="Reset Quotation to Default"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200/60 hidden lg:flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* User Avatar & RBAC Role Switcher */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/80"
                  title="Switch Role / View User Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs relative">
                    {currentUser.name.charAt(0)}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="hidden 2xl:block text-left pr-1">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pr-1" />
                </button>

                {/* RBAC Role Switcher Dropdown */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {/* User Profile Header */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                        <Shield className="w-3 h-3" />
                        <span className="uppercase">{currentUser.role}</span>
                      </div>
                    </div>

                    {/* Role Switcher Matrix */}
                    <div className="px-4 pt-3 pb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Switch Live RBAC Role
                      </span>
                    </div>

                    <div className="py-1 px-2 space-y-1">
                      {rolesList.map(({ role, title, subtitle, icon: IconComponent }) => {
                        const isCurrentRole = currentUser.role === role;
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              switchRole(role);
                              setIsUserDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-all ${
                              isCurrentRole
                                ? 'bg-rose-50 border border-rose-200 text-rose-900 font-semibold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                              isCurrentRole ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold leading-tight">{title}</p>
                              <p className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">{subtitle}</p>
                            </div>
                            {isCurrentRole && <Check className="w-4 h-4 text-rose-600 shrink-0 mt-1" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Settings Option */}
                    <div className="p-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onOpenSettingsModal();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Studio Workspace & Branding Settings</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-slate-200/80 bg-slate-50 px-4 py-2 flex items-center justify-around text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveNavView('dashboard')}
            className={`px-2.5 py-1 rounded-lg ${activeNavView === 'dashboard' ? 'text-rose-600 font-bold bg-white' : 'text-slate-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveNavView('builder');
              setActiveStep(2);
            }}
            className={`px-2.5 py-1 rounded-lg ${activeNavView === 'builder' ? 'text-rose-600 font-bold bg-white' : 'text-slate-600'}`}
          >
            Studio
          </button>
          <button
            onClick={() => {
              setActiveNavView('summary');
              setActiveStep(3);
            }}
            className={`px-2.5 py-1 rounded-lg ${activeNavView === 'summary' ? 'text-rose-600 font-bold bg-white' : 'text-slate-600'}`}
          >
            Summary
          </button>
          {permissions.canEditCatalog && (
            <button
              onClick={() => setActiveNavView('admin')}
              className={`px-2.5 py-1 rounded-lg ${activeNavView === 'admin' ? 'text-rose-600 font-bold bg-white' : 'text-slate-600'}`}
            >
              Catalog
            </button>
          )}
          <button
            onClick={() => setActiveNavView('client_portal')}
            className={`px-2.5 py-1 rounded-lg ${activeNavView === 'client_portal' ? 'text-rose-600 font-bold bg-white' : 'text-slate-600'}`}
          >
            Client Portal
          </button>
        </div>
      </header>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </>
  );
};
