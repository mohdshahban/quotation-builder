import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfiguredItem, ProjectDetails, QuotationCalculation, Room } from '../types/quotation';
import { DEFAULT_PROJECT_DETAILS, generateDefaultRooms, createConfiguredItemFromCard } from '../data/defaultRooms';
import { calculateItemTotal, calculateQuotation } from '../utils/calculations';
import { useCatalog } from './CatalogContext';
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

const LOCAL_STORAGE_PROJECT_KEY = 'interior_quotation_project_v1';
const LOCAL_STORAGE_ROOMS_KEY = 'interior_quotation_rooms_v1';

const QuotationContext = createContext<QuotationContextType | undefined>(undefined);

export const QuotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { catalog } = useCatalog();

  const [projectDetails, setProjectDetails] = useState<ProjectDetails>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROJECT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved project details:', e);
    }
    return DEFAULT_PROJECT_DETAILS;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ROOMS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved rooms:', e);
    }
    return generateDefaultRooms(catalog);
  });

  const [activeRoomId, setActiveRoomId] = useState<string>(() => {
    return rooms[0]?.id || 'room-living';
  });

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(2); // Default to Step 2 (Scope of Work matching screenshot)

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, JSON.stringify(projectDetails));
    } catch (e) {
      console.error('Failed to save project details to localStorage:', e);
    }
  }, [projectDetails]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ROOMS_KEY, JSON.stringify(rooms));
    } catch (e) {
      console.error('Failed to save rooms to localStorage:', e);
    }
  }, [rooms]);

  // Keep activeRoomId valid if rooms change
  useEffect(() => {
    if (!rooms.some(r => r.id === activeRoomId) && rooms.length > 0) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  const updateProjectDetails = (details: Partial<ProjectDetails>) => {
    setProjectDetails(prev => ({ ...prev, ...details }));
  };

  const renameRoom = (roomId: string, newName: string) => {
    if (!newName.trim()) return;
    setRooms(prev =>
      prev.map(r => (r.id === roomId ? { ...r, name: newName.trim() } : r))
    );
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

    setRooms(prev => [...prev, newRoom]);
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

    setRooms(prev => [...prev, duplicatedRoom]);
    setActiveRoomId(newId);
  };

  const toggleItemSelection = (roomId: string, itemId: string, isSelected?: boolean) => {
    setRooms(prev =>
      prev.map(room => {
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
      })
    );
  };

  const updateItemQuantity = (roomId: string, itemId: string, quantity: number) => {
    const validQty = isNaN(quantity) || quantity < 0 ? 0 : quantity;
    setRooms(prev =>
      prev.map(room => {
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
      })
    );
  };

  const updateItemVariant = (roomId: string, itemId: string, variantId: string) => {
    setRooms(prev =>
      prev.map(room => {
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
      })
    );
  };

  const toggleScopeAll = (roomId: string, scopeType: ScopeType, selectAll: boolean) => {
    setRooms(prev =>
      prev.map(room => {
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
      })
    );
  };

  const addItemToRoomFromCatalog = (roomId: string, card: ItemCard) => {
    setRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room;
        // Check if already in room
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
      })
    );
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
      description: itemData.description || 'Custom crafted specification',
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

    setRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          items: [newItem, ...room.items],
        };
      })
    );
  };

  const removeItemFromRoom = (roomId: string, itemId: string) => {
    setRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          items: room.items.filter(i => i.id !== itemId),
        };
      })
    );
  };

  const resetQuotationToDefaults = () => {
    const defaultR = generateDefaultRooms(catalog);
    setRooms(defaultR);
    setProjectDetails(DEFAULT_PROJECT_DETAILS);
    setActiveRoomId(defaultR[0]?.id || 'room-living');
    setActiveStep(2);
    localStorage.removeItem(LOCAL_STORAGE_PROJECT_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ROOMS_KEY);
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
