import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_CATALOG } from '../src/data/defaultCatalog';
import { generateDefaultRooms } from '../src/data/defaultRooms';
import { DEFAULT_STUDIO_SETTINGS, generateDefaultProjects } from '../src/data/defaultWorkspace';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ajzrwbenypyziohyyihd.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3rlg7LFYgKysOzGNRVmkWQ_SZztq-0O';

function sqlEscape(str: string): string {
  if (str === null || str === undefined) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

function sqlJson(obj: any): string {
  const jsonStr = JSON.stringify(obj);
  return "'" + jsonStr.replace(/'/g, "''") + "'::jsonb";
}

async function run() {
  console.log('Generating full Supabase migration & dummy data SQL script...');

  const catalog = DEFAULT_CATALOG;
  const adminRooms = generateDefaultRooms(catalog);
  const projects = generateDefaultProjects();
  const settings = DEFAULT_STUDIO_SETTINGS;

  let sql = `-- ==============================================================================
-- Supabase Schema & Dummy Data Migration Script
-- Project URL: ${SUPABASE_URL}
-- Generated for Interior Studio Quotation Builder
-- ==============================================================================

-- 1. CREATE TABLES IF NOT EXISTS
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

-- 3. PERMISSIVE ACCESS POLICIES (FOR ANON / AUTH USERS)
DROP POLICY IF EXISTS "Allow full access to catalog" ON public.quotation_catalog;
CREATE POLICY "Allow full access to catalog" ON public.quotation_catalog
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to admin rooms" ON public.quotation_admin_rooms;
CREATE POLICY "Allow full access to admin rooms" ON public.quotation_admin_rooms
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to projects" ON public.quotation_projects;
CREATE POLICY "Allow full access to projects" ON public.quotation_projects
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to studio settings" ON public.quotation_studio_settings;
CREATE POLICY "Allow full access to studio settings" ON public.quotation_studio_settings
    FOR ALL USING (true) WITH CHECK (true);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_catalog_category ON public.quotation_catalog (category);
CREATE INDEX IF NOT EXISTS idx_admin_rooms_seq ON public.quotation_admin_rooms (sequence_order);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.quotation_projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_last_modified ON public.quotation_projects (last_modified DESC);

-- ==============================================================================
-- 5. SEED DUMMY DATA
-- ==============================================================================

-- 5.1 SEED CATALOG ITEMS (${catalog.length} items)
`;

  for (const item of catalog) {
    sql += `INSERT INTO public.quotation_catalog (
    id, name, category, icon, description, unit, base_rate, scope_type, default_rooms, variants, selected_variant_id, material_spec, is_custom, updated_at
) VALUES (
    ${sqlEscape(item.id)},
    ${sqlEscape(item.name)},
    ${sqlEscape(item.category)},
    ${sqlEscape(item.icon)},
    ${sqlEscape(item.description)},
    ${sqlEscape(item.unit)},
    ${item.baseRate},
    ${sqlEscape(item.scopeType)},
    ${sqlJson(item.defaultRooms)},
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

  sql += `\n-- 5.2 SEED ADMIN ROOM TEMPLATES (${adminRooms.length} room templates)\n`;
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

  sql += `\n-- 5.3 SEED SAMPLE PROJECTS (${projects.length} interior projects)\n`;
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
    ${sqlEscape(proj.createdAt || '2026-09-07')}::timestamptz,
    ${sqlEscape(proj.lastModified || '2026-09-07')}::timestamptz,
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

  const migrationDir = __dirname;
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }

  const outputPath = path.join(migrationDir, 'migration_with_dummy_data.sql');
  fs.writeFileSync(outputPath, sql, 'utf8');
  console.log(`Successfully wrote SQL file to: ${outputPath} (${(sql.length / 1024).toFixed(2)} KB)`);

  const schemaPath = path.join(migrationDir, 'schema.sql');
  fs.writeFileSync(schemaPath, sql, 'utf8');
  console.log(`Successfully updated schema file to: ${schemaPath}`);
}

run();
