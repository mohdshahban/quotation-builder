import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfiguredItem, ProjectDetails, QuotationCalculation, Room } from '../types/quotation';
import { DEFAULT_PROJECT_DETAILS, generateDefaultRooms, createConfiguredItemFromCard } from '../data/defaultRooms';
import { calculateItemTotal, calculateQuotation } from '../utils/calculations';
import { useCatalog } from './CatalogContext';
import { useWorkspace } from './WorkspaceContext';
import { ItemCard, ScopeType } from '../types/catalog';

interface QuotationContextType {
  projectDetails: ProjectDetails;
  updateProjectDetails: (details: Partial<ProjectDetails>) => void;
  rooms: Room[];
  activeRoomId: string;
  activeRoom: Room | undefined;
  setActiveRoomId: (id: string) => void;
  renameRoom: (roomId: string, newName: string) => void;
  addRoom: (name: string, type?: string, icon?: string) => string;
  deleteRoom: (roomId: string) => void;
  duplicateRoom: (roomId: string) => void;
  toggleItemSelection: (roomId: string, itemId: string, isSelected?: boolean) => void;
  updateItemQuantity: (roomId: string, itemId: string, quantity: number) => void;
  updateItemVariant: (roomId: string, itemId: string, variantId: string) => void;
  toggleScopeAll: (roomId: string, scopeType: ScopeType, selectAll: boolean) => void;
  addItemToRoomFromCatalog: (roomId: string, card: ItemCard) => void;
  addCustomItemToRoom: (roomId: string, itemData: Partial<ConfiguredItem>) => void;
  removeItemFromRoom: (roomId: string, itemId: string) => void;
  resetQuotationToDefaults: () => void;
  activeStep: 1 | 2 | 3;
  setActiveStep: (step: 1 | 2 | 3) => void;
  calculations: QuotationCalculation;
}

const QuotationContext = createContext<QuotationContextType | undefined>(undefined);

export const QuotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { catalog } = useCatalog();
  const { activeProject, saveActiveProjectRooms, saveActiveProjectDetails } = useWorkspace();

  const [projectDetails, setProjectDetails] = useState<ProjectDetails>(
    activeProject?.projectDetails || DEFAULT_PROJECT_DETAILS
  );

  const [rooms, setRooms] = useState<Room[]>(
    activeProject?.rooms || generateDefaultRooms(catalog)
  );

  const [activeRoomId, setActiveRoomId] = useState<string>(
    activeProject?.rooms[0]?.id || 'room-living'
  );

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(2); // Default to Step 2 (Scope of Work)

  // Synchronize when active project in workspace changes
  useEffect(() => {
    if (activeProject) {
      setProjectDetails(activeProject.projectDetails);
      setRooms(activeProject.rooms);
      setActiveRoomId(activeProject.rooms[0]?.id || 'room-living');
    }
  }, [activeProject?.id]);

  // Keep activeRoomId valid if rooms change
  useEffect(() => {
    if (!rooms.some(r => r.id === activeRoomId) && rooms.length > 0) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  const updateProjectDetails = (details: Partial<ProjectDetails>) => {
    setProjectDetails(prev => {
      const updated = { ...prev, ...details };
      saveActiveProjectDetails(updated);
      return updated;
    });
  };

  const renameRoom = (roomId: string, newName: string) => {
    if (!newName.trim()) return;
    setRooms(prev => {
      const updated = prev.map(r => (r.id === roomId ? { ...r, name: newName.trim() } : r));
      saveActiveProjectRooms(updated);
      return updated;
    });
  };

  const addRoom = (name: string, type: string = 'custom', icon: string = 'Home'): string => {
    const newRoomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Auto-populate relevant catalog items for this room type
    const relevantCards = catalog.filter(card => 
      card.defaultRooms.includes('*') || 
      card.defaultRooms.some(r => r.toLowerCase() === name.toLowerCase() || r.toLowerCase() === type.toLowerCase())
    );

    const initialCards = relevantCards.length > 0 ? relevantCards : catalog.slice(0, 6);
    const configuredItems = initialCards.map(card => createConfiguredItemFromCard(card, undefined, card.scopeType === 'expert_pick'));

    const newRoom: Room = {
      id: newRoomId,
      name: name.trim() || 'New Room',
      type: type,
      icon: icon,
      items: configuredItems,
      areaSqft: 150,
    };

    setRooms(prev => {
      const updated = [...prev, newRoom];
      saveActiveProjectRooms(updated);
      return updated;
    });
    setActiveRoomId(newRoomId);
    return newRoomId;
  };

  const deleteRoom = (roomId: string) => {
    if (rooms.length <= 1) {
      alert('You must have at least one room in your quotation.');
      return;
    }
    const remaining = rooms.filter(r => r.id !== roomId);
    setRooms(remaining);
    saveActiveProjectRooms(remaining);
    if (activeRoomId === roomId) {
      setActiveRoomId(remaining[0]?.id || '');
    }
  };

  const duplicateRoom = (roomId: string) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) return;

    const newId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const duplicatedRoom: Room = {
      ...targetRoom,
      id: newId,
      name: `${targetRoom.name} (Copy)`,
      items: targetRoom.items.map(item => ({
        ...item,
        id: `cfg-${item.cardId}-${Math.random().toString(36).substring(2, 9)}`,
      })),
    };

    setRooms(prev => {
      const updated = [...prev, duplicatedRoom];
      saveActiveProjectRooms(updated);
      return updated;
    });
    setActiveRoomId(newId);
  };

  const toggleItemSelection = (roomId: string, itemId: string, isSelected?: boolean) => {
    setRooms(prev => {
      const updated = prev.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          items: room.items.map(item => {
            if (item.id !== itemId) return item;
            const nextSelected = isSelected !== undefined ? isSelected : !item.isSelected;
            return {
              ...item,
              isSelected: nextSelected,
            };
          }),
        };
      });
      saveActiveProjectRooms(updated);
      return updated;
    });
  };

  const updateItemQuantity = (roomId: string, itemId: string, quantity: number) => {
    const validQty = isNaN(quantity) || quantity < 0 ? 0 : quantity;
    setRooms(prev => {
      const updated = prev.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          items: room.items.map(item => {
            if (item.id !== itemId) return item;
            const calculatedPrice = calculateItemTotal(validQty, item.unitRate);
            return {
              ...item,
              quantity: validQty,
              calculatedPrice,
            };
          }),
        };
      });
      saveActiveProjectRooms(updated);
      return updated;
    });
  };

  const updateItemVariant = (roomId: string, itemId: string, variantId: string) => {
    setRooms(prev => {
      const updated = prev.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          items: room.items.map(item => {
            if (item.id !== itemId) return item;
            
            // Find corresponding card and variant from catalog
            const card = catalog.find(c => c.id === item.cardId);
            const variant = card?.variants.find(v => v.id === variantId);
            const newRate = variant ? variant.rate : item.unitRate;
            const newVariantName = variant ? variant.name : item.selectedVariantName;
            const calculatedPrice = calculateItemTotal(item.quantity, newRate);

            return {
              ...item,
              selectedVariantId: variantId,
              selectedVariantName: newVariantName,
              unitRate: newRate,
              calculatedPrice,
            };
          }),
        };
      });
      saveActiveProjectRooms(updated);
      return updated;
    });
  };

  const toggleScopeAll = (roomId: string, scopeType: ScopeType, selectAll: boolean) => {
    setRooms(prev => {
      const updated = prev.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          items: room.items.map(item => {
            if (item.scopeType === scopeType) {
              return { ...item, isSelected: selectAll };
            }
            return item;
          }),
        };
      });
      saveActiveProjectRooms(updated);
      return updated;
    });
  };

  const addItemToRoomFromCatalog = (roomId: string, card: ItemCard) => {
    setRooms(prev => {
      const updated = prev.map(room => {
        if (room.id !== roomId) return room;
        const existing = room.items.find(i => i.cardId === card.id);
        if (existing) {
          return {
            ...room,
            items: room.items.map(i => i.id === existing.id ? { ...i, isSelected: true } : i),
          };
        }
        const newItem = createConfiguredItemFromCard(card, undefined, true);
        return {
          ...room,
          items: [...room.items, newItem],
        };
      });
      saveActiveProjectRooms(updated);
      return updated;
    });
  };

  const addCustomItemToRoom = (roomId: string, itemData: Partial<ConfiguredItem>) => {
    const qty = itemData.quantity || 1;
    const rate = itemData.unitRate || 1000;
    const newItem: ConfiguredItem = {
      id: `custom-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      cardId: `card-custom-${Date.now()}`,
      name: itemData.name || 'Custom Interior Item',
      category: itemData.category || 'Modular Woodwork',
      icon: itemData.icon || 'Sparkles',
      description: itemData.description || 'Custom bespoke design',
      unit: itemData.unit || 'Unit',
      quantity: qty,
      selectedVariantId: '',
      unitRate: rate,
      calculatedPrice: qty * rate,
      isSelected: true,
      scopeType: itemData.scopeType || 'expert_pick',
      materialSpec: itemData.materialSpec,
      isCustom: true,
    };

    setRooms(prev => {
      const updated = prev.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          items: [newItem, ...room.items],
        };
      });
      saveActiveProjectRooms(updated);
      return updated;
    });
  };

  const removeItemFromRoom = (roomId: string, itemId: string) => {
    setRooms(prev => {
      const updated = prev.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          items: room.items.filter(i => i.id !== itemId),
        };
      });
      saveActiveProjectRooms(updated);
      return updated;
    });
  };

  const resetQuotationToDefaults = () => {
    const defaultR = generateDefaultRooms(catalog);
    setRooms(defaultR);
    setProjectDetails(DEFAULT_PROJECT_DETAILS);
    saveActiveProjectRooms(defaultR);
    saveActiveProjectDetails(DEFAULT_PROJECT_DETAILS);
    setActiveRoomId(defaultR[0]?.id || 'room-living');
    setActiveStep(2);
  };

  const calculations = calculateQuotation(rooms, projectDetails);

  return (
    <QuotationContext.Provider
      value={{
        projectDetails,
        updateProjectDetails,
        rooms,
        activeRoomId,
        activeRoom,
        setActiveRoomId,
        renameRoom,
        addRoom,
        deleteRoom,
        duplicateRoom,
        toggleItemSelection,
        updateItemQuantity,
        updateItemVariant,
        toggleScopeAll,
        addItemToRoomFromCatalog,
        addCustomItemToRoom,
        removeItemFromRoom,
        resetQuotationToDefaults,
        activeStep,
        setActiveStep,
        calculations,
      }}
    >
      {children}
    </QuotationContext.Provider>
  );
};

export const useQuotation = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error('useQuotation must be used within a QuotationProvider');
  }
  return context;
};
