import { ItemCard, ItemCategory, ItemVariant, MaterialSpecification, ScopeType, UnitType } from './catalog';

export interface ConfiguredItem {
  id: string; // Unique instance ID in this room
  cardId: string; // Reference to ItemCard.id
  name: string;
  category: ItemCategory;
  icon: string;
  description: string;
  unit: UnitType;
  quantity: number;
  selectedVariantId: string;
  selectedVariantName?: string;
  unitRate: number; // Rate per unit/sqft
  calculatedPrice: number; // (quantity * unitRate) or variant fixed price
  isSelected: boolean; // Checked or unchecked
  scopeType: ScopeType;
  materialSpec?: MaterialSpecification;
  isCustom?: boolean;
}

export interface Room {
  id: string;
  name: string;
  type: string; // 'living' | 'master_bedroom' | 'kids_room' | 'bedroom' | 'washroom' | 'foyer' | 'kitchen' | 'dining' | 'balcony' | 'custom'
  icon?: string;
  items: ConfiguredItem[];
  areaSqft?: number;
}

export interface ProjectDetails {
  projectName: string; // e.g. "Ajnara Daffodil Phase 2"
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  propertyType: string; // e.g. "3BHK"
  carpetArea: number; // e.g. 2095
  city: string;
  designerName: string;
  companyName: string;
  companyContact: string;
  quotationNumber: string;
  createdDate: string;
  validityDays: number;
  packageTier: 'Essential' | 'Premium' | 'Luxury';
  discountPercent: number;
  taxPercent: number; // e.g., 18 for GST
  notes: string;
}

export interface QuotationCalculation {
  roomBreakdowns: {
    roomId: string;
    roomName: string;
    itemsCount: number;
    subtotal: number;
  }[];
  totalItemsCount: number;
  subtotal: number;
  tierMultiplier: number;
  adjustedSubtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
}
