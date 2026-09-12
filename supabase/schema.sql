-- ==============================================================================
-- Interior Studio Quotation Builder - Supabase Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/ajzrwbenypyziohyyihd/sql)
-- ==============================================================================

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

-- 2. Admin Room Configuration Templates Table
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

-- 3. Quotation Projects Table
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

-- 4. Studio Branding & Settings Table
CREATE TABLE IF NOT EXISTS public.quotation_studio_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.quotation_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_admin_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_studio_settings ENABLE ROW LEVEL SECURITY;

-- Create Open Access Policies for the Studio App (Anon + Authenticated)
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_catalog_category ON public.quotation_catalog (category);
CREATE INDEX IF NOT EXISTS idx_admin_rooms_seq ON public.quotation_admin_rooms (sequence_order);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.quotation_projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_last_modified ON public.quotation_projects (last_modified DESC);
