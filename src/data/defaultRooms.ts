import { ItemCard } from '../types/catalog';
import { ConfiguredItem, ProjectDetails, Room } from '../types/quotation';
import { DEFAULT_CATALOG } from './defaultCatalog';

export const DEFAULT_PROJECT_DETAILS: ProjectDetails = {
  projectName: 'Ajnara Daffodil Phase 2',
  clientName: 'Rahul Sharma',
  clientPhone: '+91 98765 43210',
  clientEmail: 'rahul.sharma@example.com',
  propertyType: '3BHK',
  carpetArea: 2095,
  city: 'Noida Expressway',
  designerName: 'Arch. Priya Sen',
  companyName: 'Studio Lux Interio Design',
  companyContact: '+91 80000 12345 | hello@luxinterio.com',
  quotationNumber: 'QT-2026-089',
  createdDate: new Date().toISOString().split('T')[0],
  validityDays: 30,
  packageTier: 'Premium',
  discountPercent: 5,
  taxPercent: 18,
  notes: 'Quotation includes Saint-Gobain gypsum false ceiling, Greenply Century HDHMR woodwork with Merino matte laminate finish, and Hettich soft-close hardware.',
};

export const createConfiguredItemFromCard = (card: ItemCard, overrideQty?: number, overrideSelected?: boolean): ConfiguredItem => {
  const selectedVariant = card.variants?.find(v => v.id === card.selectedVariantId) || (card.variants && card.variants.length > 0 ? card.variants[0] : undefined);
  const unitRate = selectedVariant ? selectedVariant.rate : card.baseRate;
  
  // Default quantities based on unit
  let qty = overrideQty !== undefined ? overrideQty : 1;
  if (overrideQty === undefined) {
    if (card.unit === 'Sqft') {
      if (card.name.includes('Painting')) qty = 830;
      else if (card.name.includes('False Ceiling')) qty = 280;
      else if (card.name.includes('Wallpaper')) qty = 180;
      else if (card.name.includes('Wardrobe')) qty = 60;
      else qty = 150;
    } else if (card.unit === 'Point') {
      qty = 20;
    }
  }

  const isSelected = overrideSelected !== undefined ? overrideSelected : (card.scopeType === 'expert_pick');

  return {
    id: `cfg-${card.id}-${Math.random().toString(36).substring(2, 9)}`,
    cardId: card.id,
    name: card.name,
    category: card.category,
    icon: card.icon,
    description: card.description,
    unit: card.unit,
    quantity: qty,
    selectedVariantId: selectedVariant ? selectedVariant.id : '',
    selectedVariantName: selectedVariant ? selectedVariant.name : undefined,
    unitRate: unitRate,
    calculatedPrice: qty * unitRate,
    isSelected: isSelected,
    scopeType: card.scopeType,
    materialSpec: card.materialSpec,
    isCustom: card.isCustom,
  };
};

export const generateDefaultRooms = (catalog: ItemCard[] = DEFAULT_CATALOG, templateRooms?: Room[]): Room[] => {
  // If admin has defined custom template rooms, instantiate fresh copies of them
  if (templateRooms && templateRooms.length > 0) {
    return templateRooms.map(r => ({
      ...r,
      id: r.id,
      items: r.items.map(item => {
        const latestCard = catalog.find(c => c.id === item.cardId);
        const latestVariant = latestCard?.variants.find(v => v.id === item.selectedVariantId);
        const rate = latestVariant ? latestVariant.rate : (latestCard ? latestCard.baseRate : item.unitRate);
        return {
          ...item,
          id: item.id || `cfg-${item.cardId}-${Math.random().toString(36).substring(2, 9)}`,
          unitRate: rate,
          calculatedPrice: item.quantity * rate,
        };
      }),
    }));
  }

  const buildItemsForRoom = (specs: { id: string; qty: number; sel: boolean; variantId?: string }[]) => {
    return specs.map(s => {
      const card = catalog.find(c => c.id === s.id);
      if (!card) return null;
      const item = createConfiguredItemFromCard(card, s.qty, s.sel);
      if (s.variantId) {
        const v = card.variants.find(vr => vr.id === s.variantId);
        if (v) {
          item.selectedVariantId = v.id;
          item.selectedVariantName = v.name;
          item.unitRate = v.rate;
          item.calculatedPrice = item.quantity * v.rate;
        }
      }
      return item;
    }).filter(Boolean) as ConfiguredItem[];
  };

  // 1. Living Room (11 items matching screenshot)
  const livingCards = [
    { id: 'card-tv-unit', qty: 1, sel: true, variantId: 'v-tv-7x6' },
    { id: 'card-crockery-unit', qty: 1, sel: true, variantId: 'v-cr-6x5' },
    { id: 'card-sofa-2seater', qty: 1, sel: true, variantId: 'v-sof-2-std' },
    { id: 'card-sofa-3seater', qty: 2, sel: true, variantId: 'v-sof-3-std' },
    { id: 'card-wing-chair', qty: 1, sel: true, variantId: 'v-wc-std' },
    { id: 'card-coffee-table', qty: 1, sel: true, variantId: 'v-ct-rect' },
    { id: 'card-shoe-rack', qty: 1, sel: true, variantId: 'v-sr-std' },
    { id: 'card-false-ceiling', qty: 280, sel: true, variantId: 'v-fc-gyp' },
    { id: 'card-wall-painting', qty: 830, sel: true, variantId: 'v-wp-royale' },
    { id: 'card-wallpaper', qty: 180, sel: true, variantId: 'v-wpp-texture' },
    { id: 'card-fc-electrical', qty: 280, sel: true, variantId: 'v-fce-std' },
    // Optional items for living room
    { id: 'card-pooja-unit', qty: 1, sel: false, variantId: 'v-pj-std' },
    { id: 'card-designer-curtains', qty: 2, sel: false, variantId: 'v-curt-manual' },
    { id: 'card-balcony-deck', qty: 65, sel: false, variantId: 'v-bal-grass' },
  ];

  const livingRoom: Room = {
    id: 'room-living',
    name: 'Living Room',
    type: 'living',
    icon: 'Armchair',
    areaSqft: 280,
    items: buildItemsForRoom(livingCards),
  };

  // 2. Master Bedroom (7 items added)
  const masterCards = [
    { id: 'card-modular-wardrobe', qty: 65, sel: true, variantId: 'v-wrd-slide' },
    { id: 'card-bed-hydraulic', qty: 1, sel: true, variantId: 'v-bed-king' },
    { id: 'card-bedside-tables', qty: 1, sel: true, variantId: 'v-bst-std' },
    { id: 'card-dressing-unit', qty: 1, sel: true, variantId: 'v-du-std' },
    { id: 'card-false-ceiling', qty: 190, sel: true, variantId: 'v-fc-gyp' },
    { id: 'card-fc-electrical', qty: 190, sel: true, variantId: 'v-fce-std' },
    { id: 'card-wall-painting', qty: 560, sel: true, variantId: 'v-wp-royale' },
    // Optional
    { id: 'card-tv-unit', qty: 1, sel: false, variantId: 'v-tv-5x4' },
    { id: 'card-wallpaper', qty: 120, sel: false, variantId: 'v-wpp-texture' },
    { id: 'card-designer-curtains', qty: 2, sel: false, variantId: 'v-curt-manual' },
  ];

  const masterBedroom: Room = {
    id: 'room-master',
    name: 'Master Bedroom',
    type: 'master_bedroom',
    icon: 'BedDouble',
    areaSqft: 190,
    items: buildItemsForRoom(masterCards),
  };

  // 3. Kids Room (7 items added)
  const kidsCards = [
    { id: 'card-modular-wardrobe', qty: 50, sel: true, variantId: 'v-wrd-hinge' },
    { id: 'card-bed-hydraulic', qty: 1, sel: true, variantId: 'v-bed-kids' },
    { id: 'card-study-unit', qty: 1, sel: true, variantId: 'v-stu-std' },
    { id: 'card-false-ceiling', qty: 160, sel: true, variantId: 'v-fc-gyp' },
    { id: 'card-fc-electrical', qty: 160, sel: true, variantId: 'v-fce-std' },
    { id: 'card-wall-painting', qty: 480, sel: true, variantId: 'v-wp-royale' },
    { id: 'card-wallpaper', qty: 90, sel: true, variantId: 'v-wpp-mural' },
    // Optional
    { id: 'card-bedside-tables', qty: 1, sel: false, variantId: 'v-bst-float' },
    { id: 'card-designer-curtains', qty: 1, sel: false, variantId: 'v-curt-manual' },
  ];

  const kidsRoom: Room = {
    id: 'room-kids',
    name: 'Kids Room',
    type: 'kids_room',
    icon: 'Sparkles',
    areaSqft: 160,
    items: buildItemsForRoom(kidsCards),
  };

  // 4. Bedroom (Guest Bedroom - 8 items added)
  const guestCards = [
    { id: 'card-modular-wardrobe', qty: 55, sel: true, variantId: 'v-wrd-hinge' },
    { id: 'card-bed-hydraulic', qty: 1, sel: true, variantId: 'v-bed-queen' },
    { id: 'card-bedside-tables', qty: 1, sel: true, variantId: 'v-bst-std' },
    { id: 'card-dressing-unit', qty: 1, sel: true, variantId: 'v-du-std' },
    { id: 'card-false-ceiling', qty: 175, sel: true, variantId: 'v-fc-gyp' },
    { id: 'card-fc-electrical', qty: 175, sel: true, variantId: 'v-fce-std' },
    { id: 'card-wall-painting', qty: 520, sel: true, variantId: 'v-wp-royale' },
    { id: 'card-wallpaper', qty: 100, sel: true, variantId: 'v-wpp-texture' },
    // Optional
    { id: 'card-tv-unit', qty: 1, sel: false, variantId: 'v-tv-5x4' },
    { id: 'card-designer-curtains', qty: 1, sel: false, variantId: 'v-curt-manual' },
  ];

  const bedroom: Room = {
    id: 'room-bedroom',
    name: 'Bedroom',
    type: 'bedroom',
    icon: 'BedDouble',
    areaSqft: 175,
    items: buildItemsForRoom(guestCards),
  };

  // 5. Washroom 1 (3 items added)
  const washroom1Cards = [
    { id: 'card-vanity-counter', qty: 1, sel: true, variantId: 'v-van-std' },
    { id: 'card-shower-enclosure', qty: 1, sel: true, variantId: 'v-shw-fixed' },
    { id: 'card-wall-painting', qty: 140, sel: true, variantId: 'v-wp-royale' },
  ];

  const washroom1: Room = {
    id: 'room-washroom-1',
    name: 'Washroom 1',
    type: 'washroom',
    icon: 'Bath',
    areaSqft: 50,
    items: buildItemsForRoom(washroom1Cards),
  };

  // 6. Foyer (5 items added)
  const foyerCards = [
    { id: 'card-shoe-rack', qty: 1, sel: true, variantId: 'v-sr-tall' },
    { id: 'card-foyer-console', qty: 1, sel: true, variantId: 'v-foy-std' },
    { id: 'card-false-ceiling', qty: 60, sel: true, variantId: 'v-fc-gyp' },
    { id: 'card-fc-electrical', qty: 60, sel: true, variantId: 'v-fce-std' },
    { id: 'card-wall-painting', qty: 180, sel: true, variantId: 'v-wp-royale' },
    // Optional
    { id: 'card-wallpaper', qty: 45, sel: false, variantId: 'v-wpp-texture' },
  ];

  const foyer: Room = {
    id: 'room-foyer',
    name: 'Foyer',
    type: 'foyer',
    icon: 'Flame',
    areaSqft: 60,
    items: buildItemsForRoom(foyerCards),
  };

  // 7. Washroom 2 (3 items added)
  const washroom2Cards = [
    { id: 'card-vanity-counter', qty: 1, sel: true, variantId: 'v-van-std' },
    { id: 'card-shower-enclosure', qty: 1, sel: true, variantId: 'v-shw-fixed' },
    { id: 'card-wall-painting', qty: 120, sel: true, variantId: 'v-wp-royale' },
  ];

  const washroom2: Room = {
    id: 'room-washroom-2',
    name: 'Washroom 2',
    type: 'washroom',
    icon: 'Bath',
    areaSqft: 45,
    items: buildItemsForRoom(washroom2Cards),
  };

  // 8. Kitchen (1 item added matching screenshot)
  const kitchenCards = [
    { id: 'card-modular-kitchen-l', qty: 1, sel: true, variantId: 'v-kt-acrylic' },
    { id: 'card-false-ceiling', qty: 85, sel: true, variantId: 'v-fc-gyp' },
    { id: 'card-fc-electrical', qty: 85, sel: true, variantId: 'v-fce-std' },
    { id: 'card-crockery-unit', qty: 1, sel: false, variantId: 'v-cr-6x5' },
  ];

  const kitchen: Room = {
    id: 'room-kitchen',
    name: 'Kitchen',
    type: 'kitchen',
    icon: 'Utensils',
    areaSqft: 85,
    items: buildItemsForRoom(kitchenCards),
  };

  return [livingRoom, masterBedroom, kidsRoom, bedroom, washroom1, foyer, washroom2, kitchen];
};
