export type UserRole = 'admin' | 'designer' | 'estimator' | 'client';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  avatarUrl?: string;
  status: 'active' | 'invited';
}

export interface StudioSettings {
  // Studio Profile
  companyName: string;
  tagline: string;
  contactPhone: string;
  officialEmail: string;
  websiteUrl: string;
  primaryCity: string;
  studioAddress: string;

  // Tax & Bank UPI
  gstin: string;
  panNumber: string;
  bankAccountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId: string;

  // Proposal Terms & Warranty Clauses
  proposalTerms: string[];

  // Team & RBAC
  teamMembers: TeamMember[];
}

export interface RolePermissions {
  canEditCatalog: boolean;
  canEditRates: boolean;
  canEditStudioSettings: boolean;
  canCreateProjects: boolean;
  canDeleteProjects: boolean;
  canEditQuotationItems: boolean;
  canChangeStatus: boolean;
  canAcceptProposal: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canEditCatalog: true,
    canEditRates: true,
    canEditStudioSettings: true,
    canCreateProjects: true,
    canDeleteProjects: true,
    canEditQuotationItems: true,
    canChangeStatus: true,
    canAcceptProposal: true,
  },
  designer: {
    canEditCatalog: false,
    canEditRates: false,
    canEditStudioSettings: false,
    canCreateProjects: true,
    canDeleteProjects: false,
    canEditQuotationItems: true,
    canChangeStatus: true,
    canAcceptProposal: true,
  },
  estimator: {
    canEditCatalog: true,
    canEditRates: true,
    canEditStudioSettings: false,
    canCreateProjects: false,
    canDeleteProjects: false,
    canEditQuotationItems: true,
    canChangeStatus: true,
    canAcceptProposal: false,
  },
  client: {
    canEditCatalog: false,
    canEditRates: false,
    canEditStudioSettings: false,
    canCreateProjects: false,
    canDeleteProjects: false,
    canEditQuotationItems: false,
    canChangeStatus: false,
    canAcceptProposal: true,
  },
};
