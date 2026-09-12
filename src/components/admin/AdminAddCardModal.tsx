import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useCatalog } from '../../context/CatalogContext';
import { ItemCard, ScopeType } from '../../types/catalog';
import { ItemIconRenderer } from '../../utils/iconMap';
import { formatCurrency } from '../../utils/currency';
import { Search, Plus, Check, Layers, Sparkles } from 'lucide-react';

interface AdminAddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  onCreateCustomCard?: () => void;
}

export const AdminAddCardModal: React.FC<AdminAddCardModalProps> = ({
  isOpen,
  onClose,
  roomId,
  roomName,
  onCreateCustomCard,
}) => {
  const { catalog, adminRooms, addCardToAdminRoom } = useCatalog();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [scopeType, setScopeType] = useState<ScopeType>('expert_pick');

  const targetRoom = adminRooms.find(r => r.id === roomId);
  const assignedCardIds = new Set(targetRoom?.items.map(i => i.cardId) || []);

  const categories = ['all', ...Array.from(new Set(catalog.map(c => c.category)))];

  const filteredCatalog = catalog.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddCard = (card: ItemCard) => {
    addCardToAdminRoom(roomId, card, scopeType);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Pre-Saved Cards to ${roomName}`}
      subtitle="Select cards from the global catalog to assign as default items for this room."
      maxWidth="3xl"
    >
      <div className="space-y-4">
        
        {/* Search, Category & Scope Type Selector + Create Custom Card */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog cards..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-xl bg-white focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <div className="flex bg-white p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setScopeType('expert_pick')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  scopeType === 'expert_pick' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600'
                }`}
              >
                Expert Pick
              </button>
              <button
                type="button"
                onClick={() => setScopeType('optional_scope')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  scopeType === 'optional_scope' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600'
                }`}
              >
                Optional
              </button>
            </div>

            {onCreateCustomCard && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCreateCustomCard();
                }}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center gap-1 transition-colors"
                title="Create a custom card specifically for this room"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Custom Card</span>
              </button>
            )}
          </div>

        </div>

        {/* Catalog Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {filteredCatalog.map((card) => {
            const isAssigned = assignedCardIds.has(card.id);

            return (
              <div
                key={card.id}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                  isAssigned
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-white border-slate-200/80 hover:border-rose-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <ItemIconRenderer name={card.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                      {card.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{card.name}</h4>
                    {card.isCustom && (
                      <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded shrink-0">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      {formatCurrency(card.baseRate)}
                    </span>
                    <span className="text-[10px] text-slate-400">/{card.unit}</span>
                  </div>

                  {isAssigned ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>In Room</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddCard(card)}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500">
            {assignedCardIds.size} cards currently assigned to <strong>{roomName}</strong>
          </span>
          <div className="flex items-center gap-2">
            {onCreateCustomCard && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCreateCustomCard();
                }}
                className="px-3.5 py-2 font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Custom Card</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
