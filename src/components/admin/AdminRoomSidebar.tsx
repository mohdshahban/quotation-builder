import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  ChevronRight, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  MoreVertical, 
  Layers,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { calculateRoomSubtotal } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import { Modal } from '../common/Modal';

export const AdminRoomSidebar: React.FC = () => {
  const {
    adminRooms,
    activeAdminRoomId,
    setActiveAdminRoomId,
    addAdminRoom,
    renameAdminRoom,
    deleteAdminRoom,
    duplicateAdminRoom,
    catalog,
  } = useCatalog();

  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [menuOpenRoomId, setMenuOpenRoomId] = useState<string | null>(null);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState('bedroom');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingRoomId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingRoomId]);

  const startEditing = (roomId: string, currentName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingRoomId(roomId);
    setEditingName(currentName);
    setMenuOpenRoomId(null);
  };

  const saveEditing = () => {
    if (editingRoomId && editingName.trim()) {
      renameAdminRoom(editingRoomId, editingName.trim());
    }
    setEditingRoomId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      setEditingRoomId(null);
    }
  };

  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      const addedId = addAdminRoom(newRoomName.trim(), newRoomType);
      setNewRoomName('');
      setIsAddRoomModalOpen(false);
      setActiveAdminRoomId(addedId);
    }
  };

  const quickRoomPresets = [
    { name: 'Kitchen', type: 'kitchen' },
    { name: 'Dining Room', type: 'dining' },
    { name: 'Pooja Room', type: 'pooja' },
    { name: 'Balcony', type: 'balcony' },
    { name: 'Home Office / Study', type: 'study' },
    { name: 'Guest Bedroom', type: 'bedroom' },
    { name: 'Home Theatre', type: 'theatre' },
    { name: 'Servant / Utility Room', type: 'utility' },
  ];

  return (
    <>
      <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-3">
        
        {/* Global Catalog Store Tab */}
        <button
          type="button"
          onClick={() => setActiveAdminRoomId(null)}
          className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between shadow-2xs group ${
            activeAdminRoomId === null
              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200'
              : 'bg-white border-slate-200/90 text-slate-800 hover:border-rose-300 hover:bg-rose-50/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              activeAdminRoomId === null ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'
            }`}>
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">All Catalog Cards</p>
              <p className={`text-[11px] ${activeAdminRoomId === null ? 'text-rose-100' : 'text-slate-400'}`}>
                Global items & base rates
              </p>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            activeAdminRoomId === null ? 'bg-white text-rose-600' : 'bg-slate-100 text-slate-600'
          }`}>
            {catalog.length} Cards
          </span>
        </button>

        {/* Room Configuration Sidebar Container matching reference image */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                ROOM CONFIGURATION
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {adminRooms.length}
              </span>
            </div>
            <button
              onClick={() => setIsAddRoomModalOpen(true)}
              className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Room</span>
            </button>
          </div>

          {/* Rooms Navigation List */}
          <div className="p-2 space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto">
            {adminRooms.map((room) => {
              const isActive = room.id === activeAdminRoomId;
              const itemsCount = room.items.length;
              const roomSubtotal = calculateRoomSubtotal(room);
              const hasItems = itemsCount > 0;
              const isEditing = editingRoomId === room.id;

              return (
                <div
                  key={room.id}
                  onClick={() => {
                    if (!isEditing) setActiveAdminRoomId(room.id);
                  }}
                  className={`relative group rounded-xl p-3 cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-blue-50/70 border-blue-200 shadow-xs ring-1 ring-blue-400/30'
                      : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    
                    {/* Left: Checkmark Icon Pill + Room Name */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      
                      {/* Checkmark box matching screenshot */}
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          hasItems
                            ? 'bg-[#1E293B] text-white'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>

                      {/* Room Name or Inline Edit Field */}
                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            onBlur={saveEditing}
                            onKeyDown={handleKeyDown}
                            className="w-full px-2 py-0.5 text-sm font-semibold bg-white border border-rose-400 rounded focus:outline-none focus:ring-2 focus:ring-rose-400/20 text-slate-800"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0" onDoubleClick={(e) => startEditing(room.id, room.name, e)}>
                          <p
                            className={`text-sm font-bold truncate transition-colors ${
                              isActive ? 'text-blue-950' : 'text-slate-800 group-hover:text-slate-950'
                            }`}
                          >
                            {room.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {formatCurrency(roomSubtotal)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Items Added Badge & Quick Edit Menu */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!isEditing && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 transition-all ${
                            isActive
                              ? 'bg-white text-blue-800 shadow-xs border border-blue-100 font-bold'
                              : 'text-slate-600 bg-slate-100 group-hover:bg-slate-200/80'
                          }`}
                        >
                          <span>{itemsCount} Items Added</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </span>
                      )}

                      {/* Actions Menu Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenRoomId(menuOpenRoomId === room.id ? null : room.id);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Room actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {menuOpenRoomId === room.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-20" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenRoomId(null);
                              }}
                            />
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-30 animate-fade-in text-xs font-semibold">
                              <button
                                onClick={(e) => startEditing(room.id, room.name, e)}
                                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Rename</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateAdminRoom(room.id);
                                  setMenuOpenRoomId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Duplicate</span>
                              </button>
                              {adminRooms.length > 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete preset room "${room.name}" from catalog template?`)) {
                                      deleteAdminRoom(room.id);
                                    }
                                    setMenuOpenRoomId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Add Room Button inside sidebar */}
          <div className="p-3 bg-slate-50/50 border-t border-slate-100">
            <button
              onClick={() => setIsAddRoomModalOpen(true)}
              className="w-full py-2 px-3 border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Room</span>
            </button>
          </div>

        </div>

      </aside>

      {/* Add Room Modal */}
      <Modal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        title="Add Preset Room to Catalog Template"
        subtitle="Configure default preset rooms that users will receive on new quotations."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Quick Room Presets:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickRoomPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setNewRoomName(preset.name);
                    setNewRoomType(preset.type);
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left flex items-center justify-between transition-all ${
                    newRoomName === preset.name
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-slate-200 hover:border-rose-300 text-slate-700 bg-white'
                  }`}
                >
                  <span>{preset.name}</span>
                  {newRoomName === preset.name && <Check className="w-3.5 h-3.5 text-rose-600" />}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddRoomSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room Name
              </label>
              <input
                type="text"
                required
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="e.g. Balcony / Home Theatre / Dining Room"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddRoomModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newRoomName.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md shadow-rose-200 disabled:opacity-50"
              >
                Create Preset Room
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};
