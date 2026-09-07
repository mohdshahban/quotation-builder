import React, { createContext, useContext, useState, useEffect } from 'react';
import { ItemCard, ItemCategory } from '../types/catalog';
import { DEFAULT_CATALOG } from '../data/defaultCatalog';

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
}

const LOCAL_STORAGE_CATALOG_KEY = 'interior_quotation_catalog_v1';

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

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(catalog));
    } catch (e) {
      console.error('Failed to save catalog to localStorage:', e);
    }
  }, [catalog]);

  const addCard = (cardData: Omit<ItemCard, 'id'>): ItemCard => {
    const newCard: ItemCard = {
      ...cardData,
      id: `card-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setCatalog(prev => [newCard, ...prev]);
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
  };

  const deleteCard = (id: string) => {
    setCatalog(prev => prev.filter(item => item.id !== id));
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
