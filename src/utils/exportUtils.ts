import { ProjectDetails, Room } from '../types/quotation';
import { ItemCard } from '../types/catalog';
import { formatCurrency } from './currency';

/**
 * Generates and triggers download of a detailed BoQ (Bill of Quantities) CSV
 */
export function exportBoQToCSV(projectDetails: ProjectDetails, rooms: Room[]): void {
  const headers = [
    'Room Name',
    'Item Name',
    'Category',
    'Size / Specification',
    'Quantity',
    'Unit',
    'Unit Rate (INR)',
    'Total Amount (INR)',
    'Scope Type',
    'Material Spec',
    'Description'
  ];

  const rows: string[][] = [headers];

  rooms.forEach(room => {
    const selectedItems = room.items.filter(i => i.isSelected);
    selectedItems.forEach(item => {
      rows.push([
        `"${room.name.replace(/"/g, '""')}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.category || ''}"`,
        `"${(item.selectedVariantName || 'Standard').replace(/"/g, '""')}"`,
        `${item.quantity}`,
        `"${item.unit}"`,
        `${item.unitRate}`,
        `${item.calculatedPrice}`,
        `"${item.scopeType === 'expert_pick' ? 'Expert Scope' : 'Optional Scope'}"`,
        `"${(item.materialSpec?.coreMaterial || 'BWP Plywood / HDHMR').replace(/"/g, '""')}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`
      ]);
    });
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const filename = `${projectDetails.projectName.replace(/[^a-zA-Z0-9_-]/g, '_')}_BoQ_Quotation.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and triggers download of the Item Catalog as CSV
 */
export function exportCatalogToCSV(catalog: ItemCard[]): void {
  const headers = [
    'Card ID',
    'Name',
    'Category',
    'Unit',
    'Base Rate (INR)',
    'Scope Type',
    'Variants Count',
    'Description',
    'Core Material',
    'Finish',
    'Hardware'
  ];

  const rows: string[][] = [headers];

  catalog.forEach(card => {
    rows.push([
      `"${card.id}"`,
      `"${card.name.replace(/"/g, '""')}"`,
      `"${card.category}"`,
      `"${card.unit}"`,
      `${card.baseRate}`,
      `"${card.scopeType}"`,
      `${card.variants?.length || 0}`,
      `"${(card.description || '').replace(/"/g, '""')}"`,
      `"${(card.materialSpec?.coreMaterial || '').replace(/"/g, '""')}"`,
      `"${(card.materialSpec?.finish || '').replace(/"/g, '""')}"`,
      `"${(card.materialSpec?.hardware || '').replace(/"/g, '""')}"`
    ]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Interior_Catalog_RateList_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and triggers download of the Item Catalog as JSON
 */
export function exportCatalogToJSON(catalog: ItemCard[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(catalog, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `interior_catalog_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates a prefilled WhatsApp proposal share URL
 */
export function generateWhatsAppShareUrl(
  phone: string | undefined,
  projectDetails: ProjectDetails,
  grandTotal: number,
  roomsCount: number
): string {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const message = `✨ *Interior Fitout Quotation - ${projectDetails.projectName}* ✨\n\n` +
    `👤 *Client:* ${projectDetails.clientName}\n` +
    `🏢 *Property:* ${projectDetails.propertyType} (${projectDetails.carpetArea} sq.ft.)\n` +
    `📍 *Location:* ${projectDetails.city || 'N/A'}\n` +
    `📐 *Scope:* ${roomsCount} Rooms configured\n` +
    `💰 *Commercial Total:* ${formatCurrency(grandTotal)} (incl. GST & Warranty)\n` +
    `📋 *Quotation Ref:* ${projectDetails.quotationNumber}\n\n` +
    `_Presented by ${projectDetails.companyName || 'Studio Lux Interio'}_`;

  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
