import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Sparkles, 
  Box, 
  Info,
  Plus
} from 'lucide-react';
import { ConfiguredItem } from '../../types/quotation';
import { ScopeType } from '../../types/catalog';
import { ItemCard } from './ItemCard';
import { useQuotation } from '../../context/QuotationContext';

interface ScopeSectionProps {
  title: string;
  scopeType: ScopeType;
  items: ConfiguredItem[];
  roomId: string;
  isExpert?: boolean;
  onOpenAddCatalogModal: () => void;
  onOpenAddCustomModal: () => void;
}

export const ScopeSection: React.FC<ScopeSectionProps> = ({
  title,
  scopeType,
  items,
  roomId,
  isExpert = false,
  onOpenAddCatalogModal,
  onOpenAddCustomModal,
}) => {
  const { 
    toggleItemSelection, 
    updateItemQuantity, 
    updateItemVariant, 
    toggleScopeAll, 
    removeItemFromRoom 
  } = useQuotation();

  const [isExpanded, setIsExpanded] = useState(true);

  if (items.length === 0) return null;

  const allSelected = items.length > 0 && items.every((i) => i.isSelected);
  const someSelected = items.some((i) => i.isSelected) && !allSelected;

  const handleSelectAllToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleScopeAll(roomId, scopeType, !allSelected);
  };

  return (
    <div className="space-y-3 mb-6">
      
      {/* Section Header Strip matching screenshot */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all border select-none ${
          isExpert
            ? 'bg-rose-50/60 border-rose-200/70 hover:bg-rose-100/50 text-rose-950'
            : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60 text-slate-800'
        }`}
      >
        
        {/* Left: Icon & Title & Info */}
        <div className="flex items-center gap-2">
          {isExpert ? (
            <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <Box className="w-4 h-4 text-slate-500 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-bold tracking-tight">
            {title}
          </span>
          <span className="w-4 h-4 rounded-full bg-black/5 text-black/40 text-[10px] font-bold flex items-center justify-center">
            i
          </span>
        </div>

        {/* Right: Select All Checkbox & Collapse Chevron */}
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          
          <button
            type="button"
            onClick={handleSelectAllToggle}
            className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                allSelected
                  ? 'bg-rose-600 text-white'
                  : someSelected
                  ? 'bg-rose-300 text-white'
                  : 'border border-slate-300 bg-white'
              }`}
            >
              {allSelected && <Check className="w-3 h-3 stroke-[3]" />}
              {someSelected && <div className="w-2 h-0.5 bg-white rounded-full" />}
            </div>
            <span className="text-xs text-slate-600 hidden sm:inline">Select All</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 text-slate-400 hover:text-slate-600"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

        </div>

      </div>

      {/* Cards Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 animate-fade-in">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              roomId={roomId}
              onToggle={() => toggleItemSelection(roomId, item.id)}
              onQuantityChange={(qty) => updateItemQuantity(roomId, item.id, qty)}
              onVariantChange={(vId) => updateItemVariant(roomId, item.id, vId)}
              onRemove={item.isCustom ? () => removeItemFromRoom(roomId, item.id) : undefined}
            />
          ))}

          {/* Quick Add Card Placeholder */}
          <div className="flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-slate-200 hover:border-rose-300 bg-white/60 hover:bg-rose-50/30 rounded-2xl p-4 text-center transition-all group">
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-rose-100 text-slate-400 group-hover:text-rose-600 flex items-center justify-center mb-2 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-700 group-hover:text-rose-700">Add Item</p>
            <div className="flex items-center gap-1 mt-2">
              <button
                type="button"
                onClick={onOpenAddCatalogModal}
                className="text-[11px] font-semibold text-rose-600 hover:underline px-1.5 py-0.5"
              >
                From Catalog
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={onOpenAddCustomModal}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-1.5 py-0.5"
              >
                Custom Item
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
