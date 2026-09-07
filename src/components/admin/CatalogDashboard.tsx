import React, { useState, useRef } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { ItemCard, ScopeType } from '../../types/catalog';
import { ItemIconRenderer } from '../../utils/iconMap';
import { formatCurrency } from '../../utils/currency';
import { ItemFormModal } from './ItemFormModal';
import { BulkRateModal } from './BulkRateModal';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Copy, 
  TrendingUp, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  GripVertical,
  Move
} from 'lucide-react';

export const CatalogDashboard: React.FC = () => {
  const { 
    catalog, 
    addCard, 
    updateCard, 
    deleteCard, 
    reorderCardsById,
    resetCatalogToDefaults, 
    exportCatalog, 
    importCatalog 
  } = useCatalog();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Drag and drop state
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);

  const [editingCard, setEditingCard] = useState<ItemCard | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const categories = ['all', ...Array.from(new Set(catalog.map(c => c.category)))];

  const filteredCatalog = catalog.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    const matchesScope = selectedScope === 'all' || card.scopeType === selectedScope;
    return matchesSearch && matchesCategory && matchesScope;
  });

  const handleCreateCard = () => {
    setEditingCard(null);
    setIsFormModalOpen(true);
  };

  const handleEditCard = (card: ItemCard) => {
    setEditingCard(card);
    setIsFormModalOpen(true);
  };

  const handleDuplicateCard = (card: ItemCard) => {
    const duplicated: Omit<ItemCard, 'id'> = {
      ...card,
      name: `${card.name} (Custom Copy)`,
      variants: card.variants.map(v => ({
        ...v,
        id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      })),
      isCustom: true,
    };
    addCard(duplicated);
    showNotification(`Duplicated "${card.name}" card`);
  };

  const handleDeleteCard = (card: ItemCard) => {
    if (window.confirm(`Are you sure you want to delete "${card.name}" from catalog?`)) {
      deleteCard(card.id);
      showNotification(`Deleted "${card.name}"`);
    }
  };

  const handleSaveCard = (cardData: Omit<ItemCard, 'id'>, id?: string) => {
    if (id) {
      updateCard(id, cardData);
      showNotification(`Updated "${cardData.name}"`);
    } else {
      addCard(cardData);
      showNotification(`Created "${cardData.name}"`);
    }
  };

  const handleExportJSON = () => {
    const json = exportCatalog();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotation_catalog_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Catalog exported to JSON file');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const success = importCatalog(parsed);
        if (success) {
          showNotification(`Successfully imported ${parsed.length} catalog cards`);
        } else {
          alert('Invalid catalog file structure.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Reset all catalog cards & rates to default factory presets?')) {
      resetCatalogToDefaults();
      showNotification('Catalog reset to default presets');
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCardId(cardId);
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, cardId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCardId !== cardId) {
      setDragOverCardId(cardId);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, cardId: string) => {
    if (dragOverCardId === cardId) {
      setDragOverCardId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    if (draggedCardId && draggedCardId !== targetCardId) {
      reorderCardsById(draggedCardId, targetCardId);
      showNotification('Card position updated! Frontend users will now see this new order.');
    }
    setDraggedCardId(null);
    setDragOverCardId(null);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverCardId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hidden File Input for JSON Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Dashboard Top Header & Stats */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              Backend Admin
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Pre-Saved Cards & Rates Management
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Drag cards to rearrange their order. Changes automatically reorder cards for frontend users in all rooms.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCreateCard}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-200 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Card</span>
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all"
            title="Bulk update prices by %"
          >
            <TrendingUp className="w-4 h-4 text-rose-600" />
            <span>Bulk Rate Update</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
            title="Export Catalog to JSON backup"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleImportClick}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
            title="Import Catalog from JSON"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all"
            title="Reset Catalog to Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drag & Drop Instruction Pill */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50/50 to-slate-50 border border-rose-200/80 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-rose-600 animate-pulse" />
          <span className="font-semibold">
            <strong className="text-rose-700">Drag to Reposition:</strong> Grab any card by its handle or card body to drag and change its position in the catalog.
          </span>
        </div>
        <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
          {filteredCatalog.length} Total Cards
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by card name, category, or specs..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-slate-50/50"
          />
        </div>

        {/* Category & Scope Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-rose-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <select
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
            className="text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Scopes</option>
            <option value="expert_pick">Expert Picks</option>
            <option value="optional_scope">Optional Scope</option>
          </select>

          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-rose-600 font-bold' : 'text-slate-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'table' ? 'bg-white shadow-xs text-rose-600 font-bold' : 'text-slate-600'
              }`}
            >
              Table
            </button>
          </div>
        </div>

      </div>

      {/* Grid View of Cards with Drag & Drop */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCatalog.map((card, index) => {
            const hasMultipleVariants = card.variants && card.variants.length > 1;
            const isDraggingThis = draggedCardId === card.id;
            const isDragOverThis = dragOverCardId === card.id && draggedCardId !== card.id;

            return (
              <div
                key={card.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, card.id)}
                onDragOver={(e) => handleDragOver(e, card.id)}
                onDragLeave={(e) => handleDragLeave(e, card.id)}
                onDrop={(e) => handleDrop(e, card.id)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between group cursor-grab active:cursor-grabbing select-none ${
                  isDraggingThis
                    ? 'opacity-40 scale-95 border-rose-400 border-dashed bg-rose-50/50 shadow-none'
                    : isDragOverThis
                    ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/30 scale-[1.02] shadow-lg'
                    : 'border-slate-200/80 hover:border-rose-300 shadow-card hover:shadow-card-hover'
                }`}
              >
                <div>
                  {/* Top Bar: Drag Grip, Icon & Category Tag */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors"
                        title="Drag to reorder card position"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                        <ItemIconRenderer name={card.icon} className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        card.scopeType === 'expert_pick'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {card.scopeType === 'expert_pick' ? 'Expert Pick' : 'Optional'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[110px]">
                        {card.category}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                    {card.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                    {card.description || 'No description added.'}
                  </p>

                  {/* Dimension Variants Tag */}
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {hasMultipleVariants
                        ? `${card.variants.length} Size Variants`
                        : card.variants?.[0]?.name && card.variants[0].name !== 'Standard'
                        ? card.variants[0].name
                        : card.unit === 'Sqft' ? 'Per Sq.Ft Base Rate' : 'Standard'}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Base Rate & Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Base Rate</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatCurrency(card.baseRate)}
                      <span className="text-xs font-normal text-slate-500">/{card.unit}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicateCard(card)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Duplicate card"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditCard(card)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Edit card"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Table View with Reorder handles */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-3 w-8">#</th>
                  <th className="px-4 py-3">Card Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Scope Group</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Base Rate (₹)</th>
                  <th className="px-4 py-3">Variants</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCatalog.map((card, index) => {
                  const isDraggingThis = draggedCardId === card.id;
                  const isDragOverThis = dragOverCardId === card.id && draggedCardId !== card.id;

                  return (
                    <tr 
                      key={card.id} 
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      onDragOver={(e) => handleDragOver(e, card.id)}
                      onDragLeave={(e) => handleDragLeave(e, card.id)}
                      onDrop={(e) => handleDrop(e, card.id)}
                      onDragEnd={handleDragEnd}
                      className={`cursor-grab active:cursor-grabbing transition-colors ${
                        isDraggingThis
                          ? 'opacity-40 bg-rose-50'
                          : isDragOverThis
                          ? 'bg-rose-100/70 border-y-2 border-rose-500'
                          : 'hover:bg-rose-50/30'
                      }`}
                    >
                      <td className="px-3 py-3 text-slate-300">
                        <GripVertical className="w-3.5 h-3.5" />
                      </td>
                      <td className="px-4 py-3 flex items-center gap-2 font-bold text-slate-900">
                        <ItemIconRenderer name={card.icon} className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="truncate max-w-[200px]">{card.name}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{card.category}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          card.scopeType === 'expert_pick'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {card.scopeType === 'expert_pick' ? 'Expert Pick' : 'Optional'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{card.unit}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(card.baseRate)}</td>
                      <td className="px-4 py-3 text-slate-500">{card.variants?.length || 0} variants</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDuplicateCard(card)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditCard(card)}
                            className="p-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <ItemFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveCard}
        initialCard={editingCard}
      />

      {/* Bulk Rate Modal */}
      <BulkRateModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />

    </div>
  );
};
