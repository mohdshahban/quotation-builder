import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  ChevronRight, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  MoreVertical, 
  Building,
} from 'lucide-react';
import { useQuotation } from '../../context/QuotationContext';
import { countRoomSelectedItems, calculateRoomSubtotal } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import { ProjectDetailsModal } from '../project/ProjectDetailsModal';
import { Modal } from '../common/Modal';

export const RoomSidebar: React.FC = () => {
  const {
    rooms,
    activeRoomId,
    setActiveRoomId,
    renameRoom,
    addRoom,
    deleteRoom,
    duplicateRoom,
    projectDetails,
  } = useQuotation();

  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [menuOpenRoomId, setMenuOpenRoomId] = useState<string | null>(null);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
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
      renameRoom(editingRoomId, editingName.trim());
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
      const addedId = addRoom(newRoomName.trim(), newRoomType);
      setNewRoomName('');
      setIsAddRoomModalOpen(false);
      setActiveRoomId(addedId);
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
        
        {/* Project Card at top of Sidebar matching screenshot */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-rose-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Building className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug truncate max-w-[150px]">
                {projectDetails.projectName}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {projectDetails.propertyType} / {projectDetails.carpetArea} sqft
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1 rounded transition-colors"
          >
            Edit
          </button>
        </div>

        {/* Sidebar Header & Room List Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          
          <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Room Configuration
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {rooms.length}
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
            {rooms.map((room) => {
              const isActive = room.id === activeRoomId;
              const selectedCount = countRoomSelectedItems(room);
              const roomSubtotal = calculateRoomSubtotal(room);
              const hasItems = selectedCount > 0;
              const isEditing = editingRoomId === room.id;

              return (
                <div
                  key={room.id}
                  onClick={() => {
                    if (!isEditing) setActiveRoomId(room.id);
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
                          <span>{selectedCount} Items Added</span>
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
                                  duplicateRoom(room.id);
                                  setMenuOpenRoomId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Duplicate</span>
                              </button>
                              {rooms.length > 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete "${room.name}"?`)) {
                                      deleteRoom(room.id);
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

      {/* Add Room Modal using portal */}
      <Modal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        title="Add New Room"
        subtitle="Choose a template preset or specify custom room name."
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Quick Presets */}
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
                placeholder="e.g. Master Balcony / Home Theatre"
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
                Add Room & Populate Items
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </>
  );
};
