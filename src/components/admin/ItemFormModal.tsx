import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ItemCard, ItemCategory, ItemVariant, ScopeType, UnitType } from '../../types/catalog';
import { AVAILABLE_ICONS } from '../../utils/iconMap';
import { useCatalog } from '../../context/CatalogContext';
import { Plus, Trash2, Layers, CheckSquare, Square, Sparkles } from 'lucide-react';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<ItemCard, 'id'>, id?: string, targetRoomId?: string) => void;
  initialCard?: ItemCard | null;
  targetRoomName?: string;
  targetRoomId?: string;
}

const DEFAULT_CATEGORIES: ItemCategory[] = [
  'Modular Woodwork',
  'Furniture',
  'False Ceiling',
  'Electrical & Lighting',
  'Painting & Wall Decor',
  'Civil & Tiling',
  'Washroom & Plumbing',
  'Doors & Windows',
  'Decor & Soft Furnishings',
];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCard,
  targetRoomName,
  targetRoomId,
}) => {
  const { adminRooms, catalog } = useCatalog();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Modular Woodwork');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [icon, setIcon] = useState('Tv');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState<UnitType>('Unit');
  const [baseRate, setBaseRate] = useState<number>(10000);
  const [scopeType, setScopeType] = useState<ScopeType>('expert_pick');
  const [defaultRooms, setDefaultRooms] = useState<string[]>(['*']);
  const [enableVariants, setEnableVariants] = useState<boolean>(false);
  const [variants, setVariants] = useState<ItemVariant[]>([]);
  const [coreMaterial, setCoreMaterial] = useState('');
  const [finish, setFinish] = useState('');
  const [hardware, setHardware] = useState('');
  const [warranty, setWarranty] = useState('');

  // Collect all unique room options from adminRooms + fallback presets
  const dynamicRoomOptions = [
    '*',
    ...Array.from(new Set([
      ...adminRooms.map(r => r.name),
      'Living Room',
      'Master Bedroom',
      'Kids Room',
      'Bedroom',
      'Kitchen',
      'Washroom 1',
      'Washroom 2',
      'Foyer',
      'Balcony',
      'Dining',
    ]))
  ];

  // Collect categories from default + existing catalog
  const allCategories = Array.from(new Set([
    ...DEFAULT_CATEGORIES,
    ...catalog.map(c => c.category)
  ]));

  useEffect(() => {
    if (initialCard) {
      setName(initialCard.name);
      if (allCategories.includes(initialCard.category as any)) {
        setCategory(initialCard.category);
        setIsCustomCategory(false);
      } else {
        setCategory('CUSTOM');
        setCustomCategoryInput(initialCard.category);
        setIsCustomCategory(true);
      }
      setIcon(initialCard.icon);
      setDescription(initialCard.description || '');
      setUnit(initialCard.unit);
      setBaseRate(initialCard.baseRate);
      setScopeType(initialCard.scopeType);
      setDefaultRooms(initialCard.defaultRooms || ['*']);
      
      const hasRealVariants = initialCard.variants && initialCard.variants.length > 0 && 
        !(initialCard.variants.length === 1 && initialCard.variants[0].name === 'Standard');
      
      setEnableVariants(Boolean(hasRealVariants));
      setVariants(initialCard.variants || []);
      setCoreMaterial(initialCard.materialSpec?.coreMaterial || '');
      setFinish(initialCard.materialSpec?.finish || '');
      setHardware(initialCard.materialSpec?.hardware || '');
      setWarranty(initialCard.materialSpec?.warranty || '');
    } else {
      setName('');
      setCategory('Modular Woodwork');
      setIsCustomCategory(false);
      setCustomCategoryInput('');
      setIcon('Sparkles');
      setDescription('');
      setUnit('Unit');
      setBaseRate(15000);
      setScopeType('expert_pick');
      setDefaultRooms(targetRoomName ? [targetRoomName] : ['*']);
      setEnableVariants(false);
      setVariants([]);
      setCoreMaterial('Century HDHMR / BWP Marine Ply');
      setFinish('1mm Matte Laminate Finish');
      setHardware('Hettich Soft-Close Hardware');
      setWarranty('10 Years Board Warranty');
    }
  }, [initialCard, isOpen, targetRoomName]);

  const handleUnitChange = (newUnit: UnitType) => {
    setUnit(newUnit);
    // When changing to Sqft, Rft, Point, Lumpsum, variants should be disabled by default unless user explicitly adds them
    if (newUnit === 'Sqft' || newUnit === 'Rft' || newUnit === 'Point' || newUnit === 'Lumpsum') {
      if (variants.length <= 1) {
        setEnableVariants(false);
        setVariants([]);
      }
    }
  };

  const handleToggleVariants = () => {
    if (!enableVariants) {
      setEnableVariants(true);
      if (variants.length === 0) {
        setVariants([
          { id: `v-${Date.now()}-1`, name: unit === 'Sqft' ? 'Premium Spec' : '(7ft X 6ft)', rate: baseRate },
          { id: `v-${Date.now()}-2`, name: unit === 'Sqft' ? 'Standard Spec' : '(6ft X 5ft)', rate: Math.round(baseRate * 0.85) }
        ]);
      }
    } else {
      setEnableVariants(false);
      setVariants([]);
    }
  };

  const handleAddVariant = () => {
    const newVariant: ItemVariant = {
      id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: unit === 'Sqft' ? 'Custom Grade' : 'New Size (e.g. 6ft X 4ft)',
      rate: baseRate,
    };
    setVariants(prev => [...prev, newVariant]);
  };

  const handleUpdateVariant = (index: number, field: keyof ItemVariant, value: any) => {
    setVariants(prev =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleRemoveVariant = (index: number) => {
    const remaining = variants.filter((_, i) => i !== index);
    setVariants(remaining);
    if (remaining.length === 0) {
      setEnableVariants(false);
    }
  };

  const toggleRoom = (room: string) => {
    if (room === '*') {
      setDefaultRooms(['*']);
      return;
    }
    const filtered = defaultRooms.filter(r => r !== '*');
    if (filtered.includes(room)) {
      const next = filtered.filter(r => r !== room);
      setDefaultRooms(next.length === 0 ? ['*'] : next);
    } else {
      setDefaultRooms([...filtered, room]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory = isCustomCategory && customCategoryInput.trim() 
      ? (customCategoryInput.trim() as ItemCategory)
      : (category as ItemCategory);

    const finalVariants = enableVariants && variants.length > 0 ? variants : [];
    const selectedVariantId = finalVariants.length > 0 ? finalVariants[0].id : '';

    const payload: Omit<ItemCard, 'id'> = {
      name: name.trim(),
      category: finalCategory,
      icon,
      description: description.trim(),
      unit,
      baseRate: Number(baseRate) || 0,
      scopeType,
      defaultRooms: defaultRooms.length > 0 ? defaultRooms : ['*'],
      variants: finalVariants,
      selectedVariantId: selectedVariantId,
      materialSpec: {
        coreMaterial: coreMaterial.trim(),
        finish: finish.trim(),
        hardware: hardware.trim(),
        warranty: warranty.trim(),
      },
      isCustom: initialCard?.isCustom !== undefined ? initialCard.isCustom : true,
    };

    onSave(payload, initialCard?.id, targetRoomId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialCard 
          ? `Edit Catalog Card: ${initialCard.name}` 
          : targetRoomName 
          ? `Create Custom Card for ${targetRoomName}`
          : 'Create Custom Catalog Card'
      }
      subtitle={
        targetRoomName
          ? `Configure a new custom card that will be added to the catalog and assigned to ${targetRoomName}.`
          : 'Configure custom card title, base rates, measurement units, dimension variants, and specifications.'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-1">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Item Title / Name</label>
              {!initialCard && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Custom Card
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bespoke Fluted TV Console, Vanity Unit, False Ceiling..."
              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <div className="space-y-1.5">
              <select
                value={isCustomCategory ? 'CUSTOM' : category}
                onChange={(e) => {
                  if (e.target.value === 'CUSTOM') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setCategory(e.target.value);
                  }
                }}
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="CUSTOM">+ Enter Custom Category...</option>
              </select>

              {isCustomCategory && (
                <input
                  type="text"
                  required
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  placeholder="Enter custom category name..."
                  className="w-full px-3 py-1 text-xs border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Scope Category</label>
            <select
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value as ScopeType)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
            >
              <option value="expert_pick">⭐ Expert Picks (Featured / Recommended)</option>
              <option value="optional_scope">💡 Optional Scope (Add-on)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Measurement Unit</label>
            <select
              value={unit}
              onChange={(e) => handleUnitChange(e.target.value as UnitType)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
            >
              <option value="Unit">Unit (Nos / Piece)</option>
              <option value="Sqft">Sqft (Square Feet)</option>
              <option value="Rft">Rft (Running Feet)</option>
              <option value="Set">Set</option>
              <option value="Point">Point</option>
              <option value="Lumpsum">Lumpsum</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {unit === 'Sqft' ? 'Rate per Sq.Ft (₹)' : unit === 'Rft' ? 'Rate per R.Ft (₹)' : 'Base Rate / Price (₹)'}
            </label>
            <input
              type="number"
              min="0"
              required
              value={baseRate}
              onChange={(e) => setBaseRate(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Card Icon</label>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            {AVAILABLE_ICONS.map((ic) => {
              const IconComp = ic.icon;
              return (
                <button
                  key={ic.name}
                  type="button"
                  onClick={() => setIcon(ic.name)}
                  className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[11px] ${
                    icon === ic.name
                      ? 'border-rose-500 bg-rose-50 text-rose-600 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[85px]">{ic.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimension / Size Variants Builder (Optional) */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleVariants}
                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                  enableVariants ? 'text-rose-600' : 'text-slate-600'
                }`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                  enableVariants ? 'bg-rose-600 text-white' : 'border border-slate-300 bg-white'
                }`}>
                  {enableVariants && <span className="text-[10px] leading-none">✓</span>}
                </div>
                <span>Size / Dimension Variants (Optional)</span>
              </button>
              {unit === 'Sqft' && (
                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                  Optional for Sqft
                </span>
              )}
            </div>

            {enableVariants && (
              <button
                type="button"
                onClick={handleAddVariant}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Variant
              </button>
            )}
          </div>

          {enableVariants ? (
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {variants.map((variant, index) => (
                <div key={variant.id || index} className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200 text-xs">
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => handleUpdateVariant(index, 'name', e.target.value)}
                    placeholder={unit === 'Sqft' ? 'Spec Name (e.g. 18mm HDHMR)' : 'Variant label (e.g. 7ft X 6ft)'}
                    className="flex-1 text-xs font-semibold px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex items-center gap-0.5">
                    <span className="text-[11px] text-slate-400 font-semibold">₹</span>
                    <input
                      type="number"
                      value={variant.rate}
                      onChange={(e) => handleUpdateVariant(index, 'rate', Number(e.target.value))}
                      className="w-20 text-xs font-bold px-1.5 py-1 border border-slate-200 rounded focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Remove variant"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic">
              {unit === 'Sqft'
                ? `No variants needed. Cost will be calculated directly as (Area in Sqft × ₹${baseRate}).`
                : 'No size dropdown will be shown. Direct base rate will apply.'}
            </p>
          )}
        </div>

        {/* Room Assignment Pills */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assigned Preset Rooms (Auto-populates inside these room defaults)
          </label>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-200/60">
            {dynamicRoomOptions.map((room) => {
              const isSelected = defaultRooms.includes(room);
              return (
                <button
                  key={room}
                  type="button"
                  onClick={() => toggleRoom(room)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  {room === '*' ? '🌟 All Rooms' : room}
                </button>
              );
            })}
          </div>
        </div>

        {/* Material Specs */}
        <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-3 space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
            Material Specifications & Quality Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Core Substrate</label>
              <input
                type="text"
                value={coreMaterial}
                onChange={(e) => setCoreMaterial(e.target.value)}
                placeholder="Century HDHMR / Marine Ply"
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Finish & Surface</label>
              <input
                type="text"
                value={finish}
                onChange={(e) => setFinish(e.target.value)}
                placeholder="1mm Merino Matte Laminate"
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Hardware Brand</label>
              <input
                type="text"
                value={hardware}
                onChange={(e) => setHardware(e.target.value)}
                placeholder="Hettich Sensys Soft-Close"
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Warranty</label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                placeholder="10 Years Board Warranty"
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key design highlight and functional summary..."
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-3 pb-1 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md shadow-rose-200 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{initialCard ? 'Save Changes' : 'Create Custom Card'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
