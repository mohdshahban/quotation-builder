import { ProjectDetails, Room } from './quotation';

export type ProjectStatus = 'Draft' | 'Under Review' | 'Approved ✓' | 'Lost';

export interface ProjectQuotation {
  id: string;
  projectDetails: ProjectDetails;
  rooms: Room[];
  status: ProjectStatus;
  version: string;
  createdAt: string;
  lastModified: string;
  estimateTotal: number;
  clientAcceptedDate?: string;
}

export interface PipelineStats {
  totalPipelineValue: number;
  totalQuotationsCount: number;
  activeProposalsCount: number;
  wonApprovedValue: number;
  wonApprovedCount: number;
  conversionWinRate: number;
  averageDealSize: number;
}
