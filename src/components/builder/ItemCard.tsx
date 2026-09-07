import React, { useState } from 'react';
import { Check, Info, ChevronDown, Trash2 } from 'lucide-react';
import { ConfiguredItem } from '../../types/quotation';
import { useCatalog } from '../../context/CatalogContext';
import { ItemIconRenderer } from '../../utils/iconMap';
import { formatCurrency } from '../../utils/currency';
import { Modal } from '../common/Modal';

interface ItemCardProps {
  item: ConfiguredItem;
  roomId: string;
  onToggle: () => void;
  onQuantityChange: (qty: number) => void;
  onVariantChange: (variantId: string) => void;
  onRemove?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  roomId,
  onToggle,
  onQuantityChange,
  onVariantChange,
  onRemove,
}) => {
  const { catalog } = useCatalog();
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);

  // Find associated catalog item to get all available variants and rich specs
  const catalogItem = catalog.find(c => c.id === item.cardId);
  const variants = catalogItem?.variants || [];
  const hasVariants = variants.length > 1;

  const currentVariant = variants.find(v => v.id === item.selectedVariantId) || variants[0];
  const specDetails = item.materialSpec || catalogItem?.materialSpec;

  return (
    <>
      <div
        className={`relative flex flex-col justify-between bg-white rounded-2xl p-4 transition-all duration-200 border select-none ${
          item.isSelected
            ? 'border-rose-200 shadow-sm ring-1 ring-rose-300/40 bg-white'
            : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/40 opacity-80 hover:opacity-100'
        }`}
      >
        
        {/* Top Bar: Icon & Checkbox */}
        <div className="flex items-start justify-between gap-2 mb-2">
          
          {/* Card Icon */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              item.isSelected
                ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-xs'
                : 'bg-slate-100 text-slate-400 border border-slate-200'
            }`}
          >
            <ItemIconRenderer name={item.icon} className="w-6 h-6 stroke-[1.75]" />
          </div>

          <div className="flex items-center gap-1.5">
            {/* Info / Material Spec Icon */}
            {specDetails && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSpecModalOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                title="View material specifications"
              >
                <Info className="w-4 h-4" />
              </button>
            )}

            {/* Custom Item Delete */}
            {item.isCustom && onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Main Selection Checkbox (Matching Pink Box with White Check) */}
            <button
              type="button"
              onClick={onToggle}
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-all focus:outline-none ${
                item.isSelected
                  ? 'bg-rose-500 text-white shadow-xs scale-100 ring-2 ring-rose-200'
                  : 'bg-white border-2 border-slate-300 hover:border-rose-400'
              }`}
            >
              {item.isSelected && <Check className="w-4 h-4 stroke-[3]" />}
            </button>
          </div>

        </div>

        {/* Item Title & Variant */}
        <div className="my-1.5">
          <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-1">
            {item.name}
          </h4>

          {/* Variant Selector or Size pill */}
          {hasVariants ? (
            <div className="relative mt-1">
              <select
                value={item.selectedVariantId}
                onChange={(e) => onVariantChange(e.target.value)}
                disabled={!item.isSelected}
                className="w-full text-xs font-semibold text-rose-700 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200 rounded-lg px-2 py-1 pr-6 focus:outline-none appearance-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-rose-600 absolute right-2 top-2 pointer-events-none" />
            </div>
          ) : currentVariant?.name && currentVariant.name !== 'Standard' ? (
            <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
              {currentVariant.name}
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {item.description || 'Standard specifications'}
            </p>
          )}
        </div>

        {/* Bottom Section: Quantity Input & Live Price */}
        <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
          
          {/* Quantity & Unit Box */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 gap-1.5 focus-within:border-rose-400 focus-within:bg-white transition-all">
            <input
              type="number"
              min="0"
              step={item.unit === 'Sqft' ? '10' : '1'}
              value={item.quantity === 0 ? '' : item.quantity}
              onChange={(e) => onQuantityChange(parseFloat(e.target.value) || 0)}
              disabled={!item.isSelected}
              className="w-14 text-sm font-bold text-slate-800 bg-transparent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0"
            />
            <span className="text-xs font-semibold text-slate-400 select-none">
              {item.unit}
            </span>
          </div>

          {/* Calculated Price */}
          <div className="text-right">
            <p className={`text-xs font-extrabold ${item.isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
              {formatCurrency(item.calculatedPrice)}
            </p>
            <p className="text-[10px] text-slate-400">
              @{formatCurrency(item.unitRate)}/{item.unit}
            </p>
          </div>

        </div>

      </div>

      {/* Material Specification Modal */}
      {specDetails && (
        <Modal
          isOpen={isSpecModalOpen}
          onClose={() => setIsSpecModalOpen(false)}
          title={`${item.name} — Technical Specifications`}
          subtitle="Materials, hardware components, finishes, and warranty guidelines."
          maxWidth="md"
        >
          <div className="space-y-4 text-sm">
            {specDetails.coreMaterial && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Core Substrate
                </span>
                <p className="font-semibold text-slate-800">{specDetails.coreMaterial}</p>
              </div>
            )}

            {specDetails.finish && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Surface & Finish
                </span>
                <p className="font-semibold text-slate-800">{specDetails.finish}</p>
              </div>
            )}

            {specDetails.hardware && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Hardware & Fittings
                </span>
                <p className="font-semibold text-slate-800">{specDetails.hardware}</p>
              </div>
            )}

            {specDetails.warranty && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200/80 text-emerald-900">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Warranty Coverage
                </span>
                <p className="font-semibold">{specDetails.warranty}</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSpecModalOpen(false)}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
