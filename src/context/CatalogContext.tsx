import React, { createContext, useContext, useState, useEffect } from 'react';
import { ItemCard, ItemCategory, ScopeType } from '../types/catalog';
import { Room, ConfiguredItem } from '../types/quotation';
import { DEFAULT_CATALOG } from '../data/defaultCatalog';
import { generateDefaultRooms, createConfiguredItemFromCard } from '../data/defaultRooms';

interface CatalogContextType {
  catalog: ItemCard[];
  addCard: (card: Omit<ItemCard, 'id'>) => ItemCard;
  updateCard: (id: string, updatedFields: Partial<ItemCard>) => void;
  deleteCard: (id: string) => void;
  bulkUpdateRates: (percentageChange: number, category?: ItemCategory) => void;
  reorderCatalogCards: (fromIndex: number, toIndex: number) => void;
  reorderCardsById: (activeId: string, overId: string) => void;
  resetCatalogToDefaults: () => void;
  importCatalog: (data: ItemCard[]) => boolean;
  exportCatalog: () => string;

  // Admin Room Configuration
  adminRooms: Room[];
  activeAdminRoomId: string | null; // null = "All Catalog Cards (Global Store)"
  setActiveAdminRoomId: (roomId: string | null) => void;
  addAdminRoom: (name: string, type?: string) => string;
  renameAdminRoom: (roomId: string, newName: string) => void;
  deleteAdminRoom: (roomId: string) => void;
  duplicateAdminRoom: (roomId: string) => void;
  reorderAdminRooms: (activeRoomId: string, overRoomId: string) => void;
  moveAdminRoom: (roomId: string, direction: 'up' | 'down') => void;
  addCardToAdminRoom: (roomId: string, card: ItemCard, scopeType?: ScopeType) => void;
  removeCardFromAdminRoom: (roomId: string, cardId: string) => void;
  toggleAdminRoomCardScope: (roomId: string, cardId: string) => void;
  toggleAdminRoomCardSelection: (roomId: string, cardId: string) => void;
  reorderAdminRoomCards: (roomId: string, activeCardId: string, overCardId: string) => void;
  updateAdminRoomCardQty: (roomId: string, cardId: string, qty: number) => void;
  updateAdminRoomCardVariant: (roomId: string, cardId: string, variantId: string) => void;
  resetAdminRoomsToDefaults: () => void;
}

const LOCAL_STORAGE_CATALOG_KEY = 'interior_quotation_catalog_v1';
const LOCAL_STORAGE_ADMIN_ROOMS_KEY = 'interior_admin_rooms_template_v1';

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [catalog, setCatalog] = useState<ItemCard[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CATALOG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved catalog:', e);
    }
    return DEFAULT_CATALOG;
  });

  const [adminRooms, setAdminRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ADMIN_ROOMS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Deduplicate items in each loaded room
          return parsed.map((room: Room) => {
            const seen = new Set<string>();
            const uniqueItems = (room.items || []).filter(i => {
              if (seen.has(i.cardId)) return false;
              seen.add(i.cardId);
              return true;
            });
            return { ...room, items: uniqueItems };
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse saved admin rooms:', e);
    }
    return generateDefaultRooms(DEFAULT_CATALOG);
  });

  const [activeAdminRoomId, setActiveAdminRoomId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(catalog));
    } catch (e) {
      console.error('Failed to save catalog to localStorage:', e);
    }
  }, [catalog]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ADMIN_ROOMS_KEY, JSON.stringify(adminRooms));
    } catch (e) {
      console.error('Failed to save admin rooms to localStorage:', e);
    }
  }, [adminRooms]);

  const addCard = (cardData: Omit<ItemCard, 'id'>): ItemCard => {
    const newCard: ItemCard = {
      ...cardData,
      id: `card-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setCatalog(prev => [newCard, ...prev]);

    // Automatically add this new card to relevant admin room templates (preventing duplicate additions)
    setAdminRooms(prev =>
      prev.map(room => {
        const matches = 
          newCard.defaultRooms.includes('*') ||
          newCard.defaultRooms.some(
            r => r.toLowerCase() === room.name.toLowerCase() || r.toLowerCase() === (room.type || '').toLowerCase()
          );
        if (matches && !room.items.some(i => i.cardId === newCard.id)) {
          const newItem = createConfiguredItemFromCard(newCard, undefined, newCard.scopeType === 'expert_pick');
          return {
            ...room,
            items: [...room.items, newItem],
          };
        }
        return room;
      })
    );

    return newCard;
  };

  const updateCard = (id: string, updatedFields: Partial<ItemCard>) => {
    setCatalog(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, ...updatedFields };
        }
        return item;
      })
    );

    // Sync all card field updates (scopeType, rate, name, icon, unit, specs) to admin room items referencing this card
    setAdminRooms(prev =>
      prev.map(room => ({
        ...room,
        items: room.items.map(i => {
          if (i.cardId === id) {
            const newRate = updatedFields.baseRate !== undefined ? updatedFields.baseRate : i.unitRate;
            return {
              ...i,
              name: updatedFields.name !== undefined ? updatedFields.name : i.name,
              category: updatedFields.category !== undefined ? updatedFields.category : i.category,
              description: updatedFields.description !== undefined ? updatedFields.description : i.description,
              icon: updatedFields.icon !== undefined ? updatedFields.icon : i.icon,
              unit: updatedFields.unit !== undefined ? updatedFields.unit : i.unit,
              scopeType: updatedFields.scopeType !== undefined ? updatedFields.scopeType : i.scopeType,
              unitRate: newRate,
              calculatedPrice: i.quantity * newRate,
              materialSpec: updatedFields.materialSpec !== undefined ? updatedFields.materialSpec : i.materialSpec,
            };
          }
          return i;
        }),
      }))
    );
  };

  const deleteCard = (id: string) => {
    setCatalog(prev => prev.filter(item => item.id !== id));
    // Remove card from admin rooms
    setAdminRooms(prev =>
      prev.map(room => ({
        ...room,
        items: room.items.filter(i => i.cardId !== id),
      }))
    );
  };

  const reorderCatalogCards = (fromIndex: number, toIndex: number) => {
    setCatalog(prev => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length || fromIndex === toIndex) {
        return prev;
      }
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const reorderCardsById = (activeId: string, overId: string) => {
    setCatalog(prev => {
      const fromIndex = prev.findIndex(c => c.id === activeId);
      const toIndex = prev.findIndex(c => c.id === overId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return prev;
      }
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const bulkUpdateRates = (percentageChange: number, category?: ItemCategory) => {
    const multiplier = 1 + percentageChange / 100;
    setCatalog(prev =>
      prev.map(item => {
        if (category && item.category !== category) return item;
        const newBaseRate = Math.round(item.baseRate * multiplier);
        const newVariants = item.variants.map(v => ({
          ...v,
          rate: Math.round(v.rate * multiplier),
        }));
        return {
          ...item,
          baseRate: newBaseRate,
          variants: newVariants,
        };
      })
    );

    // Sync admin rooms
    setAdminRooms(prev =>
      prev.map(room => ({
        ...room,
        items: room.items.map(i => {
          if (category && i.category !== category) return i;
          const newRate = Math.round(i.unitRate * multiplier);
          return {
            ...i,
            unitRate: newRate,
            calculatedPrice: i.quantity * newRate,
          };
        }),
      }))
    );
  };

  const resetCatalogToDefaults = () => {
    setCatalog(DEFAULT_CATALOG);
    localStorage.removeItem(LOCAL_STORAGE_CATALOG_KEY);
  };

  const importCatalog = (data: ItemCard[]): boolean => {
    if (Array.isArray(data) && data.length > 0) {
      setCatalog(data);
      return true;
    }
    return false;
  };

  const exportCatalog = (): string => {
    return JSON.stringify(catalog, null, 2);
  };

  // --- Admin Room Configuration Handlers ---
  const addAdminRoom = (name: string, type: string = 'custom'): string => {
    const newRoomId = `admin-room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const relevantCards = catalog.filter(card =>
      card.defaultRooms.includes('*') ||
      card.defaultRooms.some(r => r.toLowerCase() === name.toLowerCase() || r.toLowerCase() === type.toLowerCase())
    );
    const initialCards = relevantCards.length > 0 ? relevantCards : catalog.slice(0, 5);
    const configuredItems = initialCards.map(card => createConfiguredItemFromCard(card, undefined, card.scopeType === 'expert_pick'));

    const newRoom: Room = {
      id: newRoomId,
      name: name.trim() || 'New Room',
      type: type,
      items: configuredItems,
      areaSqft: 150,
    };

    setAdminRooms(prev => [...prev, newRoom]);
    setActiveAdminRoomId(newRoomId);
    return newRoomId;
  };

  const renameAdminRoom = (roomId: string, newName: string) => {
    if (!newName.trim()) return;
    setAdminRooms(prev =>
      prev.map(r => (r.id === roomId ? { ...r, name: newName.trim() } : r))
    );
  };

  const deleteAdminRoom = (roomId: string) => {
    if (adminRooms.length <= 1) {
      alert('You must have at least one room configured in the catalog template.');
      return;
    }
    setAdminRooms(prev => prev.filter(r => r.id !== roomId));
    if (activeAdminRoomId === roomId) {
      setActiveAdminRoomId(null);
    }
  };

  const duplicateAdminRoom = (roomId: string) => {
    const targetRoom = adminRooms.find(r => r.id === roomId);
    if (!targetRoom) return;
    const newId = `admin-room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const dup: Room = {
      ...targetRoom,
      id: newId,
      name: `${targetRoom.name} (Copy)`,
      items: targetRoom.items.map(i => ({
        ...i,
        id: `cfg-${i.cardId}-${Math.random().toString(36).substring(2, 9)}`,
      })),
    };
    setAdminRooms(prev => [...prev, dup]);
    setActiveAdminRoomId(newId);
  };

  const reorderAdminRooms = (activeRoomId: string, overRoomId: string) => {
    setAdminRooms(prev => {
      const fromIndex = prev.findIndex(r => r.id === activeRoomId);
      const toIndex = prev.findIndex(r => r.id === overRoomId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const moveAdminRoom = (roomId: string, direction: 'up' | 'down') => {
    setAdminRooms(prev => {
      const index = prev.findIndex(r => r.id === roomId);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
  };

  const addCardToAdminRoom = (roomId: string, card: ItemCard, scopeType: ScopeType = 'expert_pick') => {
    setAdminRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room;
        const exists = room.items.some(i => i.cardId === card.id);
        if (exists) return room;
        const newItem = createConfiguredItemFromCard(card, undefined, true);
        newItem.scopeType = scopeType;
        return {
          ...room,
          items: [...room.items, newItem],
        };
      })
    );
  };

  const removeCardFromAdminRoom = (roomId: string, cardId: string) => {
    setAdminRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          items: room.items.filter(i => i.cardId !== cardId && i.id !== cardId),
        };
      })
    );
  };

  const toggleAdminRoomCardScope = (roomId: string, cardId: string) => {
    setAdminRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          items: room.items.map(i => {
            if (i.cardId === cardId || i.id === cardId) {
              const nextScope: ScopeType = i.scopeType === 'expert_pick' ? 'optional_scope' : 'expert_pick';
              return { ...i, scopeType: nextScope };
            }
            return i;
          }),
        };
      })
    );
  };

  const toggleAdminRoomCardSelection = (roomId: string, cardId: string) => {
    setAdminRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          items: room.items.map(i => {
            if (i.cardId === cardId || i.id === cardId) {
              return { ...i, isSelected: !i.isSelected };
            }
            return i;
          }),
        };
      })
    );
  };

  const reorderAdminRoomCards = (roomId: string, activeCardId: string, overCardId: string) => {
    setAdminRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room;
        const fromIndex = room.items.findIndex(i => i.cardId === activeCardId || i.id === activeCardId);
        const toIndex = room.items.findIndex(i => i.cardId === overCardId || i.id === overCardId);
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return room;
        const updatedItems = [...room.items];
        const [moved] = updatedItems.splice(fromIndex, 1);
        updatedItems.splice(toIndex, 0, moved);
        return {
          ...room,
          items: updatedItems,
        };
      })
    );
  };

  const updateAdminRoomCardQty = (roomId: string, cardId: string, qty: number) => {
    const validQty = isNaN(qty) || qty < 0 ? 0 : qty;
    setAdminRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          items: room.items.map(i => {
            if (i.cardId === cardId || i.id === cardId) {
              return {
                ...i,
                quantity: validQty,
                calculatedPrice: validQty * i.unitRate,
              };
            }
            return i;
          }),
        };
      })
    );
  };

  const updateAdminRoomCardVariant = (roomId: string, cardId: string, variantId: string) => {
    setAdminRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          items: room.items.map(i => {
            if (i.cardId === cardId || i.id === cardId) {
              const card = catalog.find(c => c.id === i.cardId);
              const variant = card?.variants.find(v => v.id === variantId);
              const rate = variant ? variant.rate : i.unitRate;
              return {
                ...i,
                selectedVariantId: variantId,
                selectedVariantName: variant?.name || i.selectedVariantName,
                unitRate: rate,
                calculatedPrice: i.quantity * rate,
              };
            }
            return i;
          }),
        };
      })
    );
  };

  const resetAdminRoomsToDefaults = () => {
    const def = generateDefaultRooms(catalog);
    setAdminRooms(def);
    localStorage.removeItem(LOCAL_STORAGE_ADMIN_ROOMS_KEY);
  };

  return (
    <CatalogContext.Provider
      value={{
        catalog,
        addCard,
        updateCard,
        deleteCard,
        bulkUpdateRates,
        reorderCatalogCards,
        reorderCardsById,
        resetCatalogToDefaults,
        importCatalog,
        exportCatalog,
        // Admin Room Config
        adminRooms,
        activeAdminRoomId,
        setActiveAdminRoomId,
        addAdminRoom,
        renameAdminRoom,
        deleteAdminRoom,
        duplicateAdminRoom,
        reorderAdminRooms,
        moveAdminRoom,
        addCardToAdminRoom,
        removeCardFromAdminRoom,
        toggleAdminRoomCardScope,
        toggleAdminRoomCardSelection,
        reorderAdminRoomCards,
        updateAdminRoomCardQty,
        updateAdminRoomCardVariant,
        resetAdminRoomsToDefaults,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
