import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ItemCategory } from '../../types/catalog';
import { useCatalog } from '../../context/CatalogContext';
import { TrendingUp, Percent } from 'lucide-react';

interface BulkRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: ('all' | ItemCategory)[] = [
  'all',
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

export const BulkRateModal: React.FC<BulkRateModalProps> = ({ isOpen, onClose }) => {
  const { bulkUpdateRates } = useCatalog();
  const [percentage, setPercentage] = useState<number>(5);
  const [selectedCategory, setSelectedCategory] = useState<'all' | ItemCategory>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (percentage === 0) return;

    bulkUpdateRates(
      percentage,
      selectedCategory === 'all' ? undefined : (selectedCategory as ItemCategory)
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Rate Adjustment"
      subtitle="Update prices across catalog items by a specified percentage."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories (Entire Catalog)' : cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Percentage Adjustment (%)
          </label>
          <div className="relative">
            <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="number"
              step="1"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              placeholder="e.g. 5 for +5% inflation or -5 for discount"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Positive values increase prices (e.g. +5% for material cost rise), negative values discount.
          </p>
        </div>

        <div className="flex gap-2">
          {[+5, +10, +15, -5, -10].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPercentage(p)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                percentage === p
                  ? 'bg-rose-50 border-rose-500 text-rose-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {p > 0 ? `+${p}%` : `${p}%`}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md shadow-rose-200 flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Apply Price Adjustment</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
