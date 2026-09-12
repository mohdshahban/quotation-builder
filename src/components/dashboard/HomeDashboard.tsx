import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  IndianRupee, 
  Search, 
  Globe, 
  FileText, 
  Copy, 
  Trash2, 
  Building2, 
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  Layers,
  SlidersHorizontal
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ProjectStatus } from '../../types/project';
import { formatCurrency } from '../../utils/currency';

interface HomeDashboardProps {
  onOpenNewProjectModal: () => void;
  onOpenSettingsModal: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onOpenNewProjectModal,
  onOpenSettingsModal
}) => {
  const { 
    projects, 
    activeProjectId, 
    setActiveProjectId, 
    updateProjectStatus, 
    duplicateProject, 
    deleteProject, 
    studioSettings, 
    currentUser, 
    permissions, 
    pipelineStats, 
    setActiveNavView 
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.projectDetails.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectDetails.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.projectDetails.city && p.projectDetails.city.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenProjectInStudio = (projectId: string) => {
    setActiveProjectId(projectId);
    setActiveNavView('builder');
  };

  const handleOpenSummary = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProjectId(projectId);
    setActiveNavView('summary');
  };

  const handleOpenClientPortal = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProjectId(projectId);
    setActiveNavView('client_portal');
  };

  const handleDuplicate = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const dup = duplicateProject(projectId);
    alert(`Duplicated project created: "${dup.projectDetails.projectName}"`);
  };

  const handleDelete = (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!permissions.canDeleteProjects) {
      alert('Your current role does not have permission to delete projects.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${projectName}"?`)) {
      deleteProject(projectId);
    }
  };

  const handleStatusChange = (projectId: string, newStatus: ProjectStatus, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    updateProjectStatus(projectId, newStatus);
  };

  const getStatusBadgeClass = (status: ProjectStatus) => {
    switch (status) {
      case 'Approved ✓':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      case 'Lost':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-medium';
      case 'Draft':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* 1. Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#e11d48] via-[#e63956] to-[#db2777] text-white p-6 sm:p-10 shadow-xl shadow-rose-900/10">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-40 h-40 rounded-full bg-rose-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-rose-100">
                {studioSettings.companyName || 'STUDIO LUX INTERIO DESIGN'}
              </span>
              <span className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-rose-100">
                Enterprise Workspace
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {currentUser.name} 👋
            </h1>
            
            <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed">
              Manage your client pipeline, build custom room-by-room quotations, track proposal acceptances, and export white-label estimates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {permissions.canCreateProjects && (
              <button
                onClick={onOpenNewProjectModal}
                className="px-6 py-3 rounded-2xl bg-white text-rose-600 font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:bg-rose-50 transition-all flex items-center gap-2 transform active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span>New Project Quotation</span>
              </button>
            )}

            <button
              onClick={onOpenSettingsModal}
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base border border-white/30 backdrop-blur-sm transition-all flex items-center gap-2 transform active:scale-95"
              title="Studio Workspace & Branding Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pipeline 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* KPI 1: Total Pipeline */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pipeline</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {formatCurrency(pipelineStats.totalPipelineValue)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Across <span className="font-semibold text-slate-600">{pipelineStats.totalQuotationsCount}</span> total quotations
            </p>
          </div>
        </div>

        {/* KPI 2: Active Proposals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Proposals</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {pipelineStats.activeProposalsCount}
            </p>
            <p className="text-xs text-blue-600 font-semibold mt-1">
              Drafts & Client Review
            </p>
          </div>
        </div>

        {/* KPI 3: Won & Approved */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Won & Approved</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {formatCurrency(pipelineStats.wonApprovedValue)}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              {pipelineStats.wonApprovedCount} Client Accepted Deals
            </p>
          </div>
        </div>

        {/* KPI 4: Conversion Win Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conversion Win Rate</span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {pipelineStats.conversionWinRate}%
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Avg deal: <span className="font-semibold text-slate-600">{formatCurrency(pipelineStats.averageDealSize)}</span>
            </p>
          </div>
        </div>

      </div>

      {/* 3. Client Quotations & Proposals CRM Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Table Filter & Search Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                Client Quotations & Proposals
              </h2>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                {projects.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Click any quotation to open the room builder, edit items, or share interactive client links.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search project or client..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved ✓">Approved ✓</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5 sm:px-6">Project & Client</th>
                <th className="py-3 px-4">Specs / Config</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Estimate Total (₹)</th>
                <th className="py-3 px-4">Version & Date</th>
                <th className="py-3 px-5 sm:px-6 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold">No matching proposals found</p>
                    <p className="text-xs text-slate-400 mt-1">Try refining your search keyword or status filter</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map(project => {
                  const isActive = project.id === activeProjectId;
                  return (
                    <tr
                      key={project.id}
                      onClick={() => handleOpenProjectInStudio(project.id)}
                      className={`hover:bg-rose-50/40 cursor-pointer transition-colors group ${
                        isActive ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Project & Client */}
                      <td className="py-4 px-5 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isActive 
                              ? 'bg-rose-600 text-white shadow-xs' 
                              : 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
                          }`}>
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-rose-600 transition-colors leading-tight">
                              {project.projectDetails.projectName}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Client: <span className="font-medium text-slate-600">{project.projectDetails.clientName}</span> {project.projectDetails.city ? `(${project.projectDetails.city})` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Specs / Config */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-700">
                          {project.projectDetails.propertyType} • {project.projectDetails.carpetArea} sqft
                        </p>
                        <p className="text-[11px] text-rose-500 font-semibold mt-0.5">
                          {project.projectDetails.packageTier || 'Luxury Tier'}
                        </p>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <select
                          value={project.status}
                          disabled={!permissions.canChangeStatus}
                          onChange={e => handleStatusChange(project.id, e.target.value as ProjectStatus, e)}
                          className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 ${getStatusBadgeClass(
                            project.status
                          )}`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved ✓">Approved ✓</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>

                      {/* Estimate Total */}
                      <td className="py-4 px-4 whitespace-nowrap font-extrabold text-slate-800">
                        {formatCurrency(project.estimateTotal || 0)}
                      </td>

                      {/* Version & Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-700">{project.version}</p>
                        <p className="text-[11px] text-slate-400">{project.lastModified}</p>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-4 px-5 sm:px-6 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Client Portal */}
                          <button
                            onClick={e => handleOpenClientPortal(project.id, e)}
                            title="Open Interactive Client Portal View"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          >
                            <Globe className="w-4 h-4" />
                          </button>

                          {/* PDF Summary */}
                          <button
                            onClick={e => handleOpenSummary(project.id, e)}
                            title="View PDF & Proposal Summary"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Duplicate */}
                          {permissions.canCreateProjects && (
                            <button
                              onClick={e => handleDuplicate(project.id, e)}
                              title="Duplicate Proposal"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          {permissions.canDeleteProjects && (
                            <button
                              onClick={e => handleDelete(project.id, project.projectDetails.projectName, e)}
                              title="Delete Project"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Plan Usage Bar */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>
            Plan Usage: <span className="font-bold text-slate-700">{projects.length} / 999</span> Quotations used
          </p>
          <button
            onClick={onOpenSettingsModal}
            className="font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
          >
            <span>Upgrade Workspace Plan for Unlimited Projects</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
