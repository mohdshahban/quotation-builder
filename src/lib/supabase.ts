import { createClient } from '@supabase/supabase-js';
import { ItemCard } from '../types/catalog';
import { Room } from '../types/quotation';
import { ProjectQuotation } from '../types/project';
import { StudioSettings } from '../types/settings';

export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 'https://ajzrwbenypyziohyyihd.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3rlg7LFYgKysOzGNRVmkWQ_SZztq-0O';

export const SUPABASE_PROJECT_ID = 
  import.meta.env.VITE_SUPABASE_PROJECT_ID || 'ajzrwbenypyziohyyihd';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseHealthCheck {
  connected: boolean;
  url: string;
  projectId: string;
  tables: {
    catalog: boolean;
    adminRooms: boolean;
    projects: boolean;
    studioSettings: boolean;
  };
  errorMessage?: string;
}

/**
 * Health check to verify database connectivity and table readiness
 */
export const testSupabaseConnection = async (): Promise<SupabaseHealthCheck> => {
  const result: SupabaseHealthCheck = {
    connected: false,
    url: SUPABASE_URL,
    projectId: SUPABASE_PROJECT_ID,
    tables: {
      catalog: false,
      adminRooms: false,
      projects: false,
      studioSettings: false,
    },
  };

  try {
    // 1. Test Catalog Table
    const { error: catErr } = await supabase.from('quotation_catalog').select('id').limit(1);
    result.tables.catalog = !catErr;

    // 2. Test Admin Rooms Table
    const { error: roomErr } = await supabase.from('quotation_admin_rooms').select('id').limit(1);
    result.tables.adminRooms = !roomErr;

    // 3. Test Projects Table
    const { error: projErr } = await supabase.from('quotation_projects').select('id').limit(1);
    result.tables.projects = !projErr;

    // 4. Test Studio Settings Table
    const { error: setErr } = await supabase.from('quotation_studio_settings').select('id').limit(1);
    result.tables.studioSettings = !setErr;

    result.connected = result.tables.catalog || result.tables.adminRooms || result.tables.projects || result.tables.studioSettings;
    
    if (!result.connected) {
      result.errorMessage = catErr?.message || 'Tables may not be initialized yet. Run the SQL schema script.';
    }
  } catch (err: any) {
    result.connected = false;
    result.errorMessage = err.message || 'Failed to reach Supabase project.';
  }

  return result;
};

// ==========================================
// 1. Catalog Sync Services
// ==========================================
export const fetchCatalogFromCloud = async (): Promise<ItemCard[] | null> => {
  try {
    const { data, error } = await supabase
      .from('quotation_catalog')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase fetch catalog error:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        icon: row.icon,
        description: row.description || '',
        unit: row.unit,
        baseRate: Number(row.base_rate) || 0,
        scopeType: row.scope_type,
        defaultRooms: row.default_rooms || ['*'],
        variants: row.variants || [],
        selectedVariantId: row.selected_variant_id || '',
        materialSpec: row.material_spec,
        isCustom: row.is_custom || false,
      }));
    }
    return null;
  } catch (e) {
    console.error('Error fetching catalog from Supabase:', e);
    return null;
  }
};

export const syncCatalogToCloud = async (catalog: ItemCard[]): Promise<boolean> => {
  try {
    const rows = catalog.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      icon: item.icon,
      description: item.description || '',
      unit: item.unit,
      base_rate: item.baseRate,
      scope_type: item.scopeType,
      default_rooms: item.defaultRooms || ['*'],
      variants: item.variants || [],
      selected_variant_id: item.selectedVariantId || '',
      material_spec: item.materialSpec || {},
      is_custom: item.isCustom || false,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('quotation_catalog')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase upsert catalog error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Error syncing catalog to Supabase:', e);
    return false;
  }
};

// ==========================================
// 2. Admin Rooms Template Sync Services
// ==========================================
export const fetchAdminRoomsFromCloud = async (): Promise<Room[] | null> => {
  try {
    const { data, error } = await supabase
      .from('quotation_admin_rooms')
      .select('*')
      .order('sequence_order', { ascending: true });

    if (error) {
      console.warn('Supabase fetch admin rooms error:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        icon: row.icon,
        areaSqft: Number(row.area_sqft) || 150,
        items: row.items || [],
      }));
    }
    return null;
  } catch (e) {
    console.error('Error fetching admin rooms from Supabase:', e);
    return null;
  }
};

export const syncAdminRoomsToCloud = async (rooms: Room[]): Promise<boolean> => {
  try {
    const rows = rooms.map((room, index) => ({
      id: room.id,
      name: room.name,
      type: room.type || 'bedroom',
      icon: room.icon || 'BedDouble',
      area_sqft: room.areaSqft || 150,
      items: room.items || [],
      sequence_order: index,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('quotation_admin_rooms')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase upsert admin rooms error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Error syncing admin rooms to Supabase:', e);
    return false;
  }
};

// ==========================================
// 3. Projects Sync Services
// ==========================================
export const fetchProjectsFromCloud = async (): Promise<ProjectQuotation[] | null> => {
  try {
    const { data, error } = await supabase
      .from('quotation_projects')
      .select('*')
      .order('last_modified', { ascending: false });

    if (error) {
      console.warn('Supabase fetch projects error:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        projectDetails: row.project_details,
        rooms: row.rooms || [],
        status: row.status,
        version: row.version,
        estimateTotal: Number(row.estimate_total) || 0,
        createdAt: row.created_at,
        lastModified: row.last_modified,
        clientAcceptedDate: row.client_accepted_date,
      }));
    }
    return null;
  } catch (e) {
    console.error('Error fetching projects from Supabase:', e);
    return null;
  }
};

export const syncProjectsToCloud = async (projects: ProjectQuotation[]): Promise<boolean> => {
  try {
    const rows = projects.map((p) => ({
      id: p.id,
      project_details: p.projectDetails,
      rooms: p.rooms || [],
      status: p.status,
      version: p.version,
      estimate_total: p.estimateTotal || 0,
      created_at: p.createdAt,
      last_modified: p.lastModified,
      client_accepted_date: p.clientAcceptedDate || null,
    }));

    const { error } = await supabase
      .from('quotation_projects')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase upsert projects error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Error syncing projects to Supabase:', e);
    return false;
  }
};

// ==========================================
// 4. Studio Settings Sync Services
// ==========================================
export const fetchStudioSettingsFromCloud = async (): Promise<StudioSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('quotation_studio_settings')
      .select('settings')
      .eq('id', 'default')
      .single();

    if (error) {
      console.warn('Supabase fetch studio settings error:', error.message);
      return null;
    }

    if (data && data.settings) {
      return data.settings as StudioSettings;
    }
    return null;
  } catch (e) {
    console.error('Error fetching studio settings from Supabase:', e);
    return null;
  }
};

export const syncStudioSettingsToCloud = async (settings: StudioSettings): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('quotation_studio_settings')
      .upsert({
        id: 'default',
        settings: settings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase upsert studio settings error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Error syncing studio settings to Supabase:', e);
    return false;
  }
};
