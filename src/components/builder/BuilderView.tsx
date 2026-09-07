import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { StepHeader } from './StepHeader';
import { RoomSidebar } from './RoomSidebar';
import { ScopeSection } from './ScopeSection';
import { BottomBar } from './BottomBar';
import { CustomItemModal } from './CustomItemModal';
import { AddFromCatalogModal } from './AddFromCatalogModal';
import { Sparkles, Plus, Layers, Edit3 } from 'lucide-react';
import { calculateRoomSubtotal, countRoomSelectedItems } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';

import { useCatalog } from '../../context/CatalogContext';

interface BuilderViewProps {
  onGoToSummary: () => void;
}

export const BuilderView: React.FC<BuilderViewProps> = ({ onGoToSummary }) => {
  const { activeRoom, renameRoom } = useQuotation();
  const { catalog } = useCatalog();

  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState(false);
  const [isAddCatalogModalOpen, setIsAddCatalogModalOpen] = useState(false);
  const [isRenamingHeader, setIsRenamingHeader] = useState(false);
  const [headerNameInput, setHeaderNameInput] = useState('');

  if (!activeRoom) return null;

  const getCatalogOrderIndex = (cardId: string) => {
    const index = catalog.findIndex((c) => c.id === cardId);
    return index === -1 ? 9999 : index;
  };

  const expertItems = activeRoom.items
    .filter((i) => i.scopeType === 'expert_pick')
    .sort((a, b) => getCatalogOrderIndex(a.cardId) - getCatalogOrderIndex(b.cardId));

  const optionalItems = activeRoom.items
    .filter((i) => i.scopeType === 'optional_scope')
    .sort((a, b) => getCatalogOrderIndex(a.cardId) - getCatalogOrderIndex(b.cardId));

  const selectedCount = countRoomSelectedItems(activeRoom);
  const roomSubtotal = calculateRoomSubtotal(activeRoom);

  const startRename = () => {
    setHeaderNameInput(activeRoom.name);
    setIsRenamingHeader(true);
  };

  const saveRename = () => {
    if (headerNameInput.trim()) {
      renameRoom(activeRoom.id, headerNameInput.trim());
    }
    setIsRenamingHeader(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      
      {/* Wizard Step Progress Indicator */}
      <StepHeader />

      {/* Main Builder Grid Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex-1">
        
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left: Room Configuration Sidebar */}
          <RoomSidebar />

          {/* Right: Active Room Canvas */}
          <main className="flex-1 w-full min-w-0 bg-white/70 rounded-3xl p-4 sm:p-6 border border-rose-100/70 shadow-xs">
            
            {/* Canvas Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-100">
              
              <div>
                <div className="flex items-center gap-2">
                  {isRenamingHeader ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={headerNameInput}
                        onChange={(e) => setHeaderNameInput(e.target.value)}
                        onBlur={saveRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename();
                          if (e.key === 'Escape') setIsRenamingHeader(false);
                        }}
                        className="px-2 py-1 text-lg sm:text-xl font-extrabold text-slate-900 border border-rose-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                      />
                      <button
                        onClick={saveRename}
                        className="text-xs font-bold bg-rose-600 text-white px-2 py-1 rounded-md"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <h2
                      onClick={startRename}
                      className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 cursor-pointer group"
                      title="Click to rename room"
                    >
                      <span>{activeRoom.name}</span>
                      <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
                    </h2>
                  )}

                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
                    {selectedCount} Selected
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Customize pre-saved furniture, false ceiling, and woodwork for this space.
                </p>
              </div>

              {/* Action Buttons & Room Subtotal Pill */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Room Total</span>
                  <span className="text-sm font-extrabold text-slate-900">{formatCurrency(roomSubtotal)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddCatalogModalOpen(true)}
                  className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add from Catalog</span>
                </button>
              </div>

            </div>

            {/* Scope Section 1: Expert Picks */}
            <ScopeSection
              title="Our Expert Picks for You"
              scopeType="expert_pick"
              items={expertItems}
              roomId={activeRoom.id}
              isExpert={true}
              onOpenAddCatalogModal={() => setIsAddCatalogModalOpen(true)}
              onOpenAddCustomModal={() => setIsAddCustomModalOpen(true)}
            />

            {/* Scope Section 2: Optional Scope */}
            <ScopeSection
              title="Optional Scope & Add-ons"
              scopeType="optional_scope"
              items={optionalItems}
              roomId={activeRoom.id}
              isExpert={false}
              onOpenAddCatalogModal={() => setIsAddCatalogModalOpen(true)}
              onOpenAddCustomModal={() => setIsAddCustomModalOpen(true)}
            />

          </main>

        </div>

      </div>

      {/* Sticky Bottom Navigation Bar */}
      <BottomBar onGoToSummary={onGoToSummary} />

      {/* Add Custom Item Modal */}
      <CustomItemModal
        isOpen={isAddCustomModalOpen}
        onClose={() => setIsAddCustomModalOpen(false)}
        roomId={activeRoom.id}
      />

      {/* Add From Catalog Modal */}
      <AddFromCatalogModal
        isOpen={isAddCatalogModalOpen}
        onClose={() => setIsAddCatalogModalOpen(false)}
        roomId={activeRoom.id}
      />

    </div>
  );
};
