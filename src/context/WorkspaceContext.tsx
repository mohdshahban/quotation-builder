import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectQuotation, ProjectStatus, PipelineStats } from '../types/project';
import { StudioSettings, TeamMember, UserRole, ROLE_PERMISSIONS, RolePermissions } from '../types/settings';
import { DEFAULT_STUDIO_SETTINGS, DEFAULT_TEAM_MEMBERS, generateDefaultProjects } from '../data/defaultWorkspace';
import { ProjectDetails, Room } from '../types/quotation';
import { generateDefaultRooms } from '../data/defaultRooms';
import { DEFAULT_CATALOG } from '../data/defaultCatalog';
import { useCatalog } from './CatalogContext';

export type NavView = 'dashboard' | 'builder' | 'summary' | 'admin' | 'client_portal';

interface WorkspaceContextType {
  projects: ProjectQuotation[];
  activeProjectId: string;
  activeProject: ProjectQuotation | undefined;
  setActiveProjectId: (id: string) => void;
  createProject: (details?: Partial<ProjectDetails>, initialRooms?: Room[]) => ProjectQuotation;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  duplicateProject: (id: string) => ProjectQuotation;
  deleteProject: (id: string) => void;
  saveActiveProjectRooms: (rooms: Room[]) => void;
  saveActiveProjectDetails: (details: ProjectDetails) => void;
  studioSettings: StudioSettings;
  updateStudioSettings: (settings: Partial<StudioSettings>) => void;
  currentUser: TeamMember;
  setCurrentUser: (user: TeamMember) => void;
  switchRole: (role: UserRole) => void;
  permissions: RolePermissions;
  pipelineStats: PipelineStats;
  activeNavView: NavView;
  setActiveNavView: (view: NavView) => void;
}

const LOCAL_STORAGE_PROJECTS_KEY = 'interior_studio_projects_v2';
const LOCAL_STORAGE_ACTIVE_PROJ_KEY = 'interior_studio_active_proj_v2';
const LOCAL_STORAGE_SETTINGS_KEY = 'interior_studio_settings_v2';
const LOCAL_STORAGE_USER_KEY = 'interior_studio_user_v2';

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { catalog, adminRooms } = useCatalog();

  const [projects, setProjects] = useState<ProjectQuotation[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved projects:', e);
    }
    return generateDefaultProjects(DEFAULT_CATALOG);
  });

  const [activeProjectId, setActiveProjectIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVE_PROJ_KEY);
      if (saved) return saved;
    } catch (e) {}
    return 'proj-1';
  });

  const [studioSettings, setStudioSettings] = useState<StudioSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved studio settings:', e);
    }
    return DEFAULT_STUDIO_SETTINGS;
  });

  const [currentUser, setCurrentUserState] = useState<TeamMember>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved current user:', e);
    }
    return DEFAULT_TEAM_MEMBERS[0];
  });

  const [activeNavView, setActiveNavView] = useState<NavView>('dashboard');

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to localStorage:', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_PROJ_KEY, activeProjectId);
    } catch (e) {}
  }, [activeProjectId]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(studioSettings));
    } catch (e) {
      console.error('Failed to save studio settings to localStorage:', e);
    }
  }, [studioSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(currentUser));
    } catch (e) {
      console.error('Failed to save current user to localStorage:', e);
    }
  }, [currentUser]);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id);
  };

  const createProject = (details?: Partial<ProjectDetails>, initialRooms?: Room[]): ProjectQuotation => {
    const newId = `proj-${Date.now()}`;
    const rooms = initialRooms || generateDefaultRooms(catalog, adminRooms);
    
    const newProject: ProjectQuotation = {
      id: newId,
      projectDetails: {
        projectName: details?.projectName || 'New Interior Project',
        clientName: details?.clientName || 'Valued Client',
        clientPhone: details?.clientPhone || '+91 ',
        clientEmail: details?.clientEmail || '',
        propertyType: details?.propertyType || '3BHK',
        carpetArea: details?.carpetArea || 1800,
        city: details?.city || studioSettings.primaryCity || 'Noida NCR',
        designerName: currentUser.name || 'Arch. Priya Sen',
        companyName: studioSettings.companyName,
        companyContact: `${studioSettings.contactPhone} | ${studioSettings.officialEmail}`,
        quotationNumber: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
        createdDate: new Date().toISOString().split('T')[0],
        validityDays: 30,
        packageTier: details?.packageTier || 'Premium',
        discountPercent: details?.discountPercent || 0,
        taxPercent: 18,
        notes: details?.notes || 'Complete turnkey interior quotation including modular woodwork, false ceiling, and electrical fittings.',
      },
      rooms: rooms,
      status: 'Draft',
      version: 'v1.0',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      estimateTotal: 1250000,
    };

    setProjects(prev => [newProject, ...prev]);
    setActiveProjectIdState(newId);
    return newProject;
  };

  const updateProjectStatus = (id: string, status: ProjectStatus) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            status,
            clientAcceptedDate: status === 'Approved ✓' ? new Date().toISOString().split('T')[0] : p.clientAcceptedDate,
            lastModified: new Date().toISOString().split('T')[0],
          };
        }
        return p;
      })
    );
  };

  const duplicateProject = (id: string): ProjectQuotation => {
    const target = projects.find(p => p.id === id);
    if (!target) return projects[0];

    const newId = `proj-${Date.now()}`;
    const duplicated: ProjectQuotation = {
      ...target,
      id: newId,
      projectDetails: {
        ...target.projectDetails,
        projectName: `${target.projectDetails.projectName} (Copy)`,
        quotationNumber: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
        createdDate: new Date().toISOString().split('T')[0],
      },
      version: 'v1.0',
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
    };

    setProjects(prev => [duplicated, ...prev]);
    setActiveProjectIdState(newId);
    return duplicated;
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) {
      alert('You must have at least one project in your pipeline.');
      return;
    }
    const remaining = projects.filter(p => p.id !== id);
    setProjects(remaining);
    if (activeProjectId === id) {
      setActiveProjectIdState(remaining[0]?.id || '');
    }
  };

  const saveActiveProjectRooms = (rooms: Room[]) => {
    setProjects(prev =>
      prev.map(p => (p.id === activeProjectId ? { ...p, rooms, lastModified: new Date().toISOString().split('T')[0] } : p))
    );
  };

  const saveActiveProjectDetails = (details: ProjectDetails) => {
    setProjects(prev =>
      prev.map(p => (p.id === activeProjectId ? { ...p, projectDetails: details, lastModified: new Date().toISOString().split('T')[0] } : p))
    );
  };

  const updateStudioSettings = (settings: Partial<StudioSettings>) => {
    setStudioSettings(prev => ({ ...prev, ...settings }));
  };

  const setCurrentUser = (user: TeamMember) => {
    setCurrentUserState(user);
  };

  const switchRole = (role: UserRole) => {
    const matchedMember = DEFAULT_TEAM_MEMBERS.find(m => m.role === role) || {
      id: `team-${role}`,
      name: role === 'admin' ? 'Vikram Malhotra' : role === 'designer' ? 'Arch. Priya Sen' : role === 'estimator' ? 'Rameshwar Verma' : 'Rahul Sharma (Client)',
      email: `${role}@luxinterio.com`,
      role: role,
      designation: role === 'admin' ? 'Principal Architect' : role === 'designer' ? 'Lead Designer' : role === 'estimator' ? 'Estimator' : 'Client',
      status: 'active' as const,
    };
    setCurrentUserState(matchedMember);
  };

  const permissions = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.admin;

  // Compute Pipeline Stats
  const totalPipelineValue = projects.reduce((acc, p) => acc + (p.estimateTotal || 0), 0);
  const totalQuotationsCount = projects.length;
  const activeProposalsCount = projects.filter(p => p.status === 'Draft' || p.status === 'Under Review').length;
  const approvedProjects = projects.filter(p => p.status === 'Approved ✓');
  const wonApprovedValue = approvedProjects.reduce((acc, p) => acc + (p.estimateTotal || 0), 0);
  const wonApprovedCount = approvedProjects.length;
  const conversionWinRate = totalQuotationsCount > 0 ? Math.round((wonApprovedCount / totalQuotationsCount) * 100) : 0;
  const averageDealSize = totalQuotationsCount > 0 ? Math.round(totalPipelineValue / totalQuotationsCount) : 0;

  const pipelineStats: PipelineStats = {
    totalPipelineValue,
    totalQuotationsCount,
    activeProposalsCount,
    wonApprovedValue,
    wonApprovedCount,
    conversionWinRate,
    averageDealSize,
  };

  return (
    <WorkspaceContext.Provider
      value={{
        projects,
        activeProjectId,
        activeProject,
        setActiveProjectId,
        createProject,
        updateProjectStatus,
        duplicateProject,
        deleteProject,
        saveActiveProjectRooms,
        saveActiveProjectDetails,
        studioSettings,
        updateStudioSettings,
        currentUser,
        setCurrentUser,
        switchRole,
        permissions,
        pipelineStats,
        activeNavView,
        setActiveNavView,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
