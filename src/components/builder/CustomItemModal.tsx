import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ItemCategory, ScopeType, UnitType } from '../../types/catalog';
import { useQuotation } from '../../context/QuotationContext';
import { AVAILABLE_ICONS } from '../../utils/iconMap';

interface CustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

export const CustomItemModal: React.FC<CustomItemModalProps> = ({ isOpen, onClose, roomId }) => {
  const { addCustomItemToRoom } = useQuotation();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Modular Woodwork');
  const [icon, setIcon] = useState('Sparkles');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState<UnitType>('Unit');
  const [unitRate, setUnitRate] = useState<number>(5000);
  const [quantity, setQuantity] = useState<number>(1);
  const [scopeType, setScopeType] = useState<ScopeType>('expert_pick');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomItemToRoom(roomId, {
      name: name.trim(),
      category,
      icon,
      description: description.trim() || 'Custom bespoke design',
      unit,
      unitRate: Number(unitRate) || 0,
      quantity: Number(quantity) || 1,
      scopeType,
    });

    // Reset and close
    setName('');
    setDescription('');
    setUnitRate(5000);
    setQuantity(1);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Custom Item to Room"
      subtitle="Define a custom item card specific to this room."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 pb-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Item Title / Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Fluted Accent Partition / Velvet Headboard"
            className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="Modular Woodwork">Modular Woodwork</option>
              <option value="Furniture">Furniture</option>
              <option value="False Ceiling">False Ceiling</option>
              <option value="Electrical & Lighting">Electrical & Lighting</option>
              <option value="Painting & Wall Decor">Painting & Wall Decor</option>
              <option value="Civil & Tiling">Civil & Tiling</option>
              <option value="Washroom & Plumbing">Washroom & Plumbing</option>
              <option value="Decor & Soft Furnishings">Decor & Soft Furnishings</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Scope Group</label>
            <select
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value as ScopeType)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="expert_pick">Expert Picks (Recommended)</option>
              <option value="optional_scope">Optional Scope (Add-on)</option>
            </select>
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Icon</label>
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
                      ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                  title={ic.label}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[85px]">{ic.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Type</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as UnitType)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="Unit">Unit (Nos)</option>
              <option value="Sqft">Sqft (Area)</option>
              <option value="Rft">Rft (Running)</option>
              <option value="Set">Set</option>
              <option value="Point">Point</option>
              <option value="Lumpsum">Lumpsum</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Rate (₹)</label>
            <input
              type="number"
              min="0"
              value={unitRate}
              onChange={(e) => setUnitRate(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Specification / Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Custom dimensions, finish specifications, material brands..."
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

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
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md shadow-rose-200 transition-all"
          >
            Add Custom Item
          </button>
        </div>
      </form>
    </Modal>
  );
};
