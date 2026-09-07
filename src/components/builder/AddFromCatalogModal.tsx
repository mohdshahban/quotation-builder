import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useCatalog } from '../../context/CatalogContext';
import { useQuotation } from '../../context/QuotationContext';
import { ItemCard, ItemCategory } from '../../types/catalog';
import { ItemIconRenderer } from '../../utils/iconMap';
import { formatCurrency } from '../../utils/currency';
import { Plus, Check, Search } from 'lucide-react';

interface AddFromCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

export const AddFromCatalogModal: React.FC<AddFromCatalogModalProps> = ({
  isOpen,
  onClose,
  roomId,
}) => {
  const { catalog } = useCatalog();
  const { rooms, addItemToRoomFromCatalog } = useQuotation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentRoom = rooms.find((r) => r.id === roomId);
  const currentCardIds = currentRoom ? currentRoom.items.map((i) => i.cardId) : [];

  const categories = ['all', ...Array.from(new Set(catalog.map((c) => c.category)))];

  const filteredCatalog = catalog.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = (card: ItemCard) => {
    addItemToRoomFromCatalog(roomId, card);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Pre-Saved Cards from Catalog"
      subtitle={`Select items to insert into ${currentRoom?.name || 'this room'}.`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog cards..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Catalog Items List */}
        <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
          {filteredCatalog.map((card) => {
            const isAlreadyAdded = currentCardIds.includes(card.id);

            return (
              <div
                key={card.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isAlreadyAdded
                    ? 'bg-rose-50/40 border-rose-200/60'
                    : 'bg-white border-slate-200 hover:border-rose-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <ItemIconRenderer name={card.icon} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-slate-900 truncate">{card.name}</h5>
                    <p className="text-xs text-slate-500 truncate">{card.category} • {card.unit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-slate-800">
                    {formatCurrency(card.baseRate)}/{card.unit}
                  </span>

                  {isAlreadyAdded ? (
                    <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Added
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAdd(card)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredCatalog.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No matching catalog items found.
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Done
          </button>
        </div>

      </div>
    </Modal>
  );
};
