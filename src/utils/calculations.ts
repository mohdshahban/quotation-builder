import { ProjectDetails, QuotationCalculation, Room } from '../types/quotation';

export const calculateItemTotal = (quantity: number, unitRate: number): number => {
  const q = isNaN(quantity) || quantity < 0 ? 0 : quantity;
  const r = isNaN(unitRate) || unitRate < 0 ? 0 : unitRate;
  return Math.round(q * r);
};

export const calculateRoomSubtotal = (room: Room): number => {
  return room.items
    .filter(item => item.isSelected)
    .reduce((sum, item) => sum + (item.calculatedPrice || 0), 0);
};

export const countRoomSelectedItems = (room: Room): number => {
  return room.items.filter(item => item.isSelected).length;
};

export const calculateQuotation = (
  rooms: Room[],
  project: ProjectDetails
): QuotationCalculation => {
  const roomBreakdowns = rooms.map(room => {
    const selectedItems = room.items.filter(i => i.isSelected);
    const subtotal = selectedItems.reduce((acc, item) => acc + (item.calculatedPrice || 0), 0);
    return {
      roomId: room.id,
      roomName: room.name,
      itemsCount: selectedItems.length,
      subtotal,
    };
  });

  const totalItemsCount = roomBreakdowns.reduce((acc, rb) => acc + rb.itemsCount, 0);
  const subtotal = roomBreakdowns.reduce((acc, rb) => acc + rb.subtotal, 0);

  // Tier multiplier
  let tierMultiplier = 1.0;
  if (project.packageTier === 'Essential') {
    tierMultiplier = 0.88; // 12% economy specification
  } else if (project.packageTier === 'Luxury') {
    tierMultiplier = 1.22; // 22% high-end specification
  }

  const adjustedSubtotal = Math.round(subtotal * tierMultiplier);
  const discountAmount = Math.round((adjustedSubtotal * (project.discountPercent || 0)) / 100);
  const taxableAmount = adjustedSubtotal - discountAmount;
  const taxAmount = Math.round((taxableAmount * (project.taxPercent || 0)) / 100);
  const grandTotal = taxableAmount + taxAmount;

  return {
    roomBreakdowns,
    totalItemsCount,
    subtotal,
    tierMultiplier,
    adjustedSubtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    grandTotal,
  };
};
