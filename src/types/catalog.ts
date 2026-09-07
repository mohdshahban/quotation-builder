export type ItemCategory = 
  | 'Modular Woodwork'
  | 'Furniture'
  | 'False Ceiling'
  | 'Electrical & Lighting'
  | 'Painting & Wall Decor'
  | 'Civil & Tiling'
  | 'Washroom & Plumbing'
  | 'Doors & Windows'
  | 'Decor & Soft Furnishings';

export type UnitType = 'Unit' | 'Sqft' | 'Rft' | 'Set' | 'Point' | 'Lumpsum' | 'Nos';

export type ScopeType = 'expert_pick' | 'optional_scope';

export interface ItemVariant {
  id: string;
  name: string; // e.g. "7ft X 6ft", "6ft X 5ft", "King Size (6x6.5ft)", "3-Door (7x4ft)"
  rate: number; // Rate per unit/sqft or specific variant price
  rateType?: 'per_unit' | 'fixed_price';
  defaultQty?: number;
  specs?: string;
}

export interface MaterialSpecification {
  coreMaterial?: string; // e.g., "Century HDHMR / Greenply Club BWP"
  finish?: string; // e.g., "1mm High Gloss Laminate / Merino Acrylic / PU Polish"
  hardware?: string; // e.g., "Hettich Soft-Close Hinges & Telescopic Channels"
  warranty?: string; // e.g., "10 Years Warranty on Plywood"
}

export interface ItemCard {
  id: string;
  name: string;
  category: ItemCategory;
  icon: string; // Icon name e.g., 'Tv', 'Sofa', 'Armchair', 'Paint', 'Square', 'Bed', 'Coffee', 'Grid'
  description: string;
  unit: UnitType;
  baseRate: number; // Default base price or rate per unit
  scopeType: ScopeType; // 'expert_pick' | 'optional_scope'
  defaultRooms: string[]; // e.g. ['Living Room', 'Master Bedroom'] or ['*']
  variants: ItemVariant[];
  selectedVariantId?: string;
  materialSpec?: MaterialSpecification;
  isCustom?: boolean;
}
