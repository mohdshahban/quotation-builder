import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { 
  SUPABASE_URL, 
  SUPABASE_PROJECT_ID, 
  testSupabaseConnection, 
  SupabaseHealthCheck,
  syncCatalogToCloud,
  syncAdminRoomsToCloud,
  syncProjectsToCloud,
  syncStudioSettingsToCloud,
  fetchCatalogFromCloud,
  fetchAdminRoomsFromCloud,
  fetchProjectsFromCloud,
  fetchStudioSettingsFromCloud
} from '../../lib/supabase';
import { useCatalog } from '../../context/CatalogContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  Cloud, 
  CloudRain, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  Code, 
  Copy, 
  Check, 
  ExternalLink,
  Database,
  Layers,
  FileText,
  Sliders
} from 'lucide-react';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function sqlEscape(str: string): string {
  if (str === null || str === undefined) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

function sqlJson(obj: any): string {
  const jsonStr = JSON.stringify(obj);
  return "'" + jsonStr.replace(/'/g, "''") + "'::jsonb";
}

export const generateFullMigrationSQL = (
  catalog: any[],
  adminRooms: any[],
  projects: any[],
  settings: any
): string => {
  let sql = `-- ==============================================================================
-- Supabase Schema & Dummy Data Migration Script
-- Project URL: ${SUPABASE_URL}
-- Generated for Interior Studio Quotation Builder
-- ==============================================================================

-- 1. CREATE TABLES
CREATE TABLE IF NOT EXISTS public.quotation_catalog (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Sparkles',
    description TEXT DEFAULT '',
    unit TEXT NOT NULL DEFAULT 'Unit',
    base_rate NUMERIC NOT NULL DEFAULT 0,
    scope_type TEXT NOT NULL DEFAULT 'expert_pick',
    default_rooms JSONB NOT NULL DEFAULT '["*"]'::jsonb,
    variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    selected_variant_id TEXT DEFAULT '',
    material_spec JSONB DEFAULT '{}'::jsonb,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.quotation_admin_rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'bedroom',
    icon TEXT DEFAULT 'BedDouble',
    area_sqft NUMERIC DEFAULT 150,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.quotation_projects (
    id TEXT PRIMARY KEY,
    project_details JSONB NOT NULL,
    rooms JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Draft',
    version TEXT NOT NULL DEFAULT 'v1.0',
    estimate_total NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    client_accepted_date TEXT
);

CREATE TABLE IF NOT EXISTS public.quotation_studio_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.quotation_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_admin_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_studio_settings ENABLE ROW LEVEL SECURITY;

-- 3. PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Allow full access to catalog" ON public.quotation_catalog;
CREATE POLICY "Allow full access to catalog" ON public.quotation_catalog FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to admin rooms" ON public.quotation_admin_rooms;
CREATE POLICY "Allow full access to admin rooms" ON public.quotation_admin_rooms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to projects" ON public.quotation_projects;
CREATE POLICY "Allow full access to projects" ON public.quotation_projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to studio settings" ON public.quotation_studio_settings;
CREATE POLICY "Allow full access to studio settings" ON public.quotation_studio_settings FOR ALL USING (true) WITH CHECK (true);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_catalog_category ON public.quotation_catalog (category);
CREATE INDEX IF NOT EXISTS idx_admin_rooms_seq ON public.quotation_admin_rooms (sequence_order);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.quotation_projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_last_modified ON public.quotation_projects (last_modified DESC);

-- ==============================================================================
-- 5. SEED DUMMY DATA
-- ==============================================================================

-- 5.1 SEED CATALOG (${catalog.length} items)
`;

  for (const item of catalog) {
    sql += `INSERT INTO public.quotation_catalog (
    id, name, category, icon, description, unit, base_rate, scope_type, default_rooms, variants, selected_variant_id, material_spec, is_custom, updated_at
) VALUES (
    ${sqlEscape(item.id)},
    ${sqlEscape(item.name)},
    ${sqlEscape(item.category)},
    ${sqlEscape(item.icon)},
    ${sqlEscape(item.description || '')},
    ${sqlEscape(item.unit)},
    ${item.baseRate || 0},
    ${sqlEscape(item.scopeType || 'expert_pick')},
    ${sqlJson(item.defaultRooms || ['*'])},
    ${sqlJson(item.variants || [])},
    ${sqlEscape(item.selectedVariantId || '')},
    ${sqlJson(item.materialSpec || {})},
    ${item.isCustom ? 'true' : 'false'},
    now()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    base_rate = EXCLUDED.base_rate,
    scope_type = EXCLUDED.scope_type,
    default_rooms = EXCLUDED.default_rooms,
    variants = EXCLUDED.variants,
    selected_variant_id = EXCLUDED.selected_variant_id,
    material_spec = EXCLUDED.material_spec,
    is_custom = EXCLUDED.is_custom,
    updated_at = now();

`;
  }

  sql += `\n-- 5.2 SEED ADMIN ROOM TEMPLATES (${adminRooms.length} rooms)\n`;
  adminRooms.forEach((room, idx) => {
    sql += `INSERT INTO public.quotation_admin_rooms (
    id, name, type, icon, area_sqft, items, sequence_order, updated_at
) VALUES (
    ${sqlEscape(room.id)},
    ${sqlEscape(room.name)},
    ${sqlEscape(room.type || 'bedroom')},
    ${sqlEscape(room.icon || 'BedDouble')},
    ${room.areaSqft || 150},
    ${sqlJson(room.items || [])},
    ${idx},
    now()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    area_sqft = EXCLUDED.area_sqft,
    items = EXCLUDED.items,
    sequence_order = EXCLUDED.sequence_order,
    updated_at = now();

`;
  });

  sql += `\n-- 5.3 SEED PROJECTS (${projects.length} sample projects)\n`;
  for (const proj of projects) {
    sql += `INSERT INTO public.quotation_projects (
    id, project_details, rooms, status, version, estimate_total, created_at, last_modified, client_accepted_date
) VALUES (
    ${sqlEscape(proj.id)},
    ${sqlJson(proj.projectDetails)},
    ${sqlJson(proj.rooms || [])},
    ${sqlEscape(proj.status)},
    ${sqlEscape(proj.version)},
    ${proj.estimateTotal || 0},
    ${sqlEscape(proj.createdAt || new Date().toISOString())}::timestamptz,
    ${sqlEscape(proj.lastModified || new Date().toISOString())}::timestamptz,
    ${proj.clientAcceptedDate ? sqlEscape(proj.clientAcceptedDate) : 'NULL'}
) ON CONFLICT (id) DO UPDATE SET
    project_details = EXCLUDED.project_details,
    rooms = EXCLUDED.rooms,
    status = EXCLUDED.status,
    version = EXCLUDED.version,
    estimate_total = EXCLUDED.estimate_total,
    last_modified = EXCLUDED.last_modified,
    client_accepted_date = EXCLUDED.client_accepted_date;

`;
  }

  sql += `\n-- 5.4 SEED STUDIO BRANDING & SETTINGS\n`;
  sql += `INSERT INTO public.quotation_studio_settings (
    id, settings, updated_at
) VALUES (
    'default',
    ${sqlJson(settings)},
    now()
) ON CONFLICT (id) DO UPDATE SET
    settings = EXCLUDED.settings,
    updated_at = now();
`;

  return sql;
};

const SCHEMA_ONLY_SNIPPET = `-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql

-- 1. Catalog Items Table
CREATE TABLE IF NOT EXISTS public.quotation_catalog (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Sparkles',
    description TEXT DEFAULT '',
    unit TEXT NOT NULL DEFAULT 'Unit',
    base_rate NUMERIC NOT NULL DEFAULT 0,
    scope_type TEXT NOT NULL DEFAULT 'expert_pick',
    default_rooms JSONB NOT NULL DEFAULT '["*"]'::jsonb,
    variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    selected_variant_id TEXT DEFAULT '',
    material_spec JSONB DEFAULT '{}'::jsonb,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Admin Room Templates Table
CREATE TABLE IF NOT EXISTS public.quotation_admin_rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'bedroom',
    icon TEXT DEFAULT 'BedDouble',
    area_sqft NUMERIC DEFAULT 150,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.quotation_projects (
    id TEXT PRIMARY KEY,
    project_details JSONB NOT NULL,
    rooms JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Draft',
    version TEXT NOT NULL DEFAULT 'v1.0',
    estimate_total NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    client_accepted_date TEXT
);

-- 4. Studio Settings Table
CREATE TABLE IF NOT EXISTS public.quotation_studio_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS & Open Access Policies
ALTER TABLE public.quotation_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_admin_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_studio_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on catalog" ON public.quotation_catalog FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on admin rooms" ON public.quotation_admin_rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on projects" ON public.quotation_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on settings" ON public.quotation_studio_settings FOR ALL USING (true) WITH CHECK (true);
`;

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const { catalog, adminRooms, importCatalog } = useCatalog();
  const { projects, studioSettings, updateStudioSettings } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'status' | 'sql'>('status');
  const [health, setHealth] = useState<SupabaseHealthCheck | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const runHealthCheck = async () => {
    setIsChecking(true);
    setSyncStatusMsg(null);
    try {
      const res = await testSupabaseConnection();
      setHealth(res);
    } catch (e) {
      console.error('Health check failed:', e);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runHealthCheck();
    }
  }, [isOpen]);

  const handlePushToCloud = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Pushing local data to Supabase cloud...');
    try {
      const [catOk, roomOk, projOk, setOk] = await Promise.all([
        syncCatalogToCloud(catalog),
        syncAdminRoomsToCloud(adminRooms),
        syncProjectsToCloud(projects),
        syncStudioSettingsToCloud(studioSettings),
      ]);

      if (catOk && roomOk && projOk && setOk) {
        setSyncStatusMsg('? Successfully synchronized all catalog, room templates, projects, and settings to Supabase cloud!');
      } else {
        setSyncStatusMsg('?? Some tables might not exist yet in Supabase. Check the SQL Schema tab to set up tables.');
      }
      runHealthCheck();
    } catch (e: any) {
      setSyncStatusMsg(`? Sync failed: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromCloud = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Pulling latest data from Supabase cloud...');
    try {
      const [cloudCatalog, cloudRooms, cloudProjects, cloudSettings] = await Promise.all([
        fetchCatalogFromCloud(),
        fetchAdminRoomsFromCloud(),
        fetchProjectsFromCloud(),
        fetchStudioSettingsFromCloud(),
      ]);

      let pulledCount = 0;
      if (cloudCatalog && cloudCatalog.length > 0) {
        importCatalog(cloudCatalog);
        pulledCount++;
      }
      if (cloudSettings) {
        updateStudioSettings(cloudSettings);
        pulledCount++;
      }

      if (pulledCount > 0) {
        setSyncStatusMsg('? Successfully downloaded and synced data from Supabase cloud!');
      } else {
        setSyncStatusMsg('?? No cloud data found or tables are empty. Push local data first to populate Supabase.');
      }
      runHealthCheck();
    } catch (e: any) {
      setSyncStatusMsg(`? Pull failed: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(SCHEMA_ONLY_SNIPPET);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Cloud Database Connection"
      subtitle="Connect, synchronize, and back up quotation data with your Supabase cloud backend."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'status'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Connection & Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'sql'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>SQL Schema Script</span>
          </button>
        </div>

        {/* Tab 1: Status & Sync Controls */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            
            {/* Project Details Banner */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${health?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {health?.connected ? 'Supabase Connected' : 'Supabase Configured'}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1 break-all">
                  {SUPABASE_URL}
                </p>
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-1">
                  Project ID: {SUPABASE_PROJECT_ID}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={runHealthCheck}
                  disabled={isChecking}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Checking...' : 'Test Connection'}</span>
                </button>
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                  title="Open Supabase Dashboard"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Table Readiness Diagnostic Cards */}
            <div>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Cloud Table Diagnostics
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <Layers className="w-4 h-4 text-slate-400" />
                    {health?.tables.catalog ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900">Catalog</p>
                  <p className="text-[10px] text-slate-400">
                    {health?.tables.catalog ? 'Ready' : 'Pending SQL'}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <Database className="w-4 h-4 text-slate-400" />
                    {health?.tables.adminRooms ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900">Admin Rooms</p>
                  <p className="text-[10px] text-slate-400">
                    {health?.tables.adminRooms ? 'Ready' : 'Pending SQL'}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {health?.tables.projects ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900">Projects</p>
                  <p className="text-[10px] text-slate-400">
                    {health?.tables.projects ? 'Ready' : 'Pending SQL'}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <Sliders className="w-4 h-4 text-slate-400" />
                    {health?.tables.studioSettings ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900">Settings</p>
                  <p className="text-[10px] text-slate-400">
                    {health?.tables.studioSettings ? 'Ready' : 'Pending SQL'}
                  </p>
                </div>

              </div>
            </div>

            {/* Notification message */}
            {syncStatusMsg && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 animate-fade-in">
                {syncStatusMsg}
              </div>
            )}

            {/* Sync Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handlePushToCloud}
                disabled={isSyncing}
                className="w-full sm:flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>Push Local Data to Supabase</span>
              </button>

              <button
                type="button"
                onClick={handlePullFromCloud}
                disabled={isSyncing}
                className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Pull from Supabase</span>
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: SQL Schema Setup */}
        {activeTab === 'sql' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-xs text-slate-600">
                Run this in your{' '}
                <a 
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-rose-600 hover:underline inline-flex items-center gap-0.5"
                >
                  Supabase SQL Editor <ExternalLink className="w-3 h-3" />
                </a> to initialize tables & seed dummy data:
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const fullSql = generateFullMigrationSQL(catalog, adminRooms, projects, studioSettings);
                    navigator.clipboard.writeText(fullSql);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2500);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Copies complete script with table definitions, RLS, and all default catalog items & rooms"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied Full Script!' : 'Copy Tables + Dummy Data SQL'}</span>
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
              <span className="font-bold shrink-0">💡 Quick Start:</span>
              <span>
                Click <strong>"Copy Tables + Dummy Data SQL"</strong>, paste into Supabase SQL Editor, and click <strong>RUN</strong>. This instantly creates all 4 tables, configures security policies, and populates your database with 17 catalog cards, 8 room templates, and 5 projects!
              </span>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl max-h-64 overflow-y-auto leading-relaxed border border-slate-800 select-all">
              {SCHEMA_ONLY_SNIPPET}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
};
