import React, { useRef, useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { useCatalog } from '../../context/CatalogContext';
import { formatCurrency } from '../../utils/currency';
import { StepHeader } from '../builder/StepHeader';
import { MaterialSpecModal } from '../builder/MaterialSpecModal';
import { exportBoQToCSV, generateWhatsAppShareUrl } from '../../utils/exportUtils';
import { 
  Printer, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Share2,
  FileSpreadsheet,
  MessageSquare,
  Shield,
  Layers,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuotationSummaryProps {
  onBackToBuilder: () => void;
}

export const QuotationSummary: React.FC<QuotationSummaryProps> = ({ onBackToBuilder }) => {
  const { projectDetails, updateProjectDetails, rooms, calculations, setActiveStep } = useQuotation();
  const { catalog } = useCatalog();
  const printRef = useRef<HTMLDivElement>(null);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  const getCatalogOrderIndex = (cardId: string) => {
    const index = catalog.findIndex((c) => c.id === cardId);
    return index === -1 ? 9999 : index;
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handlePrint = () => {
    triggerConfetti();
    window.print();
  };

  const handleShare = () => {
    const summaryText = `*Interior Quotation: ${projectDetails.projectName}*\nClient: ${projectDetails.clientName}\nRooms: ${rooms.length}\nGrand Total: ${formatCurrency(calculations.grandTotal)}\nDate: ${projectDetails.createdDate}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      alert('Quotation summary copied to clipboard!');
    }
  };

  const handleWhatsAppShare = () => {
    const url = generateWhatsAppShareUrl(
      projectDetails.clientPhone,
      projectDetails,
      calculations.grandTotal,
      rooms.length
    );
    window.open(url, '_blank');
  };

  const handleExportBoQ = () => {
    exportBoQToCSV(projectDetails, rooms);
  };

  const activeRoomsWithItems = rooms.filter(r => r.items.some(i => i.isSelected));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in space-y-6">
      
      {/* Wizard Step Header */}
      <div className="no-print">
        <StepHeader />
      </div>

      {/* Top Action Bar */}
      <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
        <button
          onClick={() => {
            setActiveStep(2);
            onBackToBuilder();
          }}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Room Configuration</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tier Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {(['Essential', 'Premium', 'Luxury'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => updateProjectDetails({ packageTier: tier })}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  projectDetails.packageTier === tier
                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          {/* Material Specs Trigger */}
          <button
            onClick={() => setIsMaterialModalOpen(true)}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            title="Configure Material Standards & Brands"
          >
            <Shield className="w-3.5 h-3.5 text-rose-500" />
            <span>Materials</span>
          </button>

          {/* Export BoQ CSV */}
          <button
            onClick={handleExportBoQ}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            title="Download Bill of Quantities CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>BoQ (CSV)</span>
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={handleWhatsAppShare}
            className="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            title="Share Proposal via WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          {/* Copy Summary */}
          <button
            onClick={handleShare}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-md shadow-rose-200 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Quotation Paper Document */}
      <div
        ref={printRef}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-8 text-slate-800"
      >
        
        {/* Document Header with Company Branding */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-rose-100 pb-8">
          <div>
            <div className="flex items-center gap-2 text-rose-600 font-extrabold text-xl sm:text-2xl tracking-tight">
              <Sparkles className="w-7 h-7" />
              <span>{projectDetails.companyName || 'Studio Lux Interio'}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Architecture • Interior Design • Turnkey Fitouts
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {projectDetails.companyContact || '+91 80000 12345 • info@luxinterio.com'}
            </p>
          </div>

          <div className="text-left sm:text-right bg-rose-50/50 sm:bg-transparent p-4 sm:p-0 rounded-2xl w-full sm:w-auto border sm:border-0 border-rose-100">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600 block mb-1">
              Interior Cost Estimate
            </span>
            <p className="text-lg font-extrabold text-slate-900">{projectDetails.quotationNumber}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Date: <span className="font-semibold text-slate-700">{projectDetails.createdDate}</span>
            </p>
            <p className="text-xs text-slate-500">
              Validity: <span className="font-semibold text-slate-700">{projectDetails.validityDays} Days</span>
            </p>
          </div>
        </div>

        {/* Project & Client Meta Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Project Specification
            </span>
            <h3 className="text-base font-bold text-slate-900">{projectDetails.projectName}</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {projectDetails.propertyType} • {projectDetails.carpetArea} Sq.Ft • {projectDetails.city}
            </p>
            <p className="text-xs text-rose-600 font-semibold mt-1">
              Tier: {projectDetails.packageTier} Package
            </p>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Prepared For
            </span>
            <h3 className="text-base font-bold text-slate-900">{projectDetails.clientName}</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Phone: {projectDetails.clientPhone} • Email: {projectDetails.clientEmail}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Lead Architect: <span className="font-semibold text-slate-700">{projectDetails.designerName}</span>
            </p>
          </div>
        </div>

        {/* Room-by-Room Itemized Breakdown */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              Room-Wise Scope of Work
            </h4>
            <span className="text-xs text-slate-500 font-semibold">
              {activeRoomsWithItems.length} Rooms • {calculations.totalItemsCount} Total Items
            </span>
          </div>

          {activeRoomsWithItems.map((room) => {
            const selectedItems = room.items
              .filter(i => i.isSelected)
              .sort((a, b) => getCatalogOrderIndex(a.cardId) - getCatalogOrderIndex(b.cardId));
            const roomTotal = selectedItems.reduce((sum, i) => sum + i.calculatedPrice, 0);

            return (
              <div key={room.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                {/* Room Section Banner */}
                <div className="bg-rose-50/60 px-5 py-3 border-b border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{room.name}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-rose-700 border border-rose-200">
                      {selectedItems.length} Items
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">
                    {formatCurrency(roomTotal)}
                  </span>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-2.5">Item Description</th>
                        <th className="px-4 py-2.5">Size / Variant</th>
                        <th className="px-4 py-2.5 text-center">Qty / Area</th>
                        <th className="px-4 py-2.5 text-right">Unit Rate</th>
                        <th className="px-5 py-2.5 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3 max-w-sm sm:max-w-md">
                            <p className="font-bold text-slate-900 leading-snug">{item.name}</p>
                            {item.description && (
                              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 whitespace-normal break-words leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-semibold">
                            {item.selectedVariantName && item.selectedVariantName !== 'Standard'
                              ? item.selectedVariantName
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-800">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">
                            {formatCurrency(item.unitRate)}
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-slate-900">
                            {formatCurrency(item.calculatedPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Material & Specification Standard Box */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-r from-slate-50 to-rose-50/30 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Standard Material & Quality Specifications
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-0.5">Woodwork Core:</span>
              <span className="text-slate-600">Century / Greenply BWP & HDHMR Boards</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-0.5">Hardware & Fittings:</span>
              <span className="text-slate-600">Hettich & Hafele Soft-Close Hardware</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-0.5">Ceiling & Lighting:</span>
              <span className="text-slate-600">Gyproc Channels + Philips COB LED</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-0.5">Warranty & Service:</span>
              <span className="text-emerald-700 font-bold">10 Years Termite & Water Warranty</span>
            </div>
          </div>
        </div>

        {/* Financial Calculation Summary & Payment Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          
          {/* Payment Milestones */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-600" />
              Payment Milestones & Handover Schedule
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">1. Booking & Design Kickoff (10%):</span>
                <span className="font-bold text-slate-900">{formatCurrency(calculations.grandTotal * 0.1)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">2. 2D/3D Finalization & Factory Release (40%):</span>
                <span className="font-bold text-slate-900">{formatCurrency(calculations.grandTotal * 0.4)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">3. Material Dispatch to Site (45%):</span>
                <span className="font-bold text-slate-900">{formatCurrency(calculations.grandTotal * 0.45)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">4. Final QC & Handover (5%):</span>
                <span className="font-bold text-slate-900">{formatCurrency(calculations.grandTotal * 0.05)}</span>
              </div>
            </div>
          </div>

          {/* Pricing Totals Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Estimated Subtotal:</span>
              <span className="font-bold text-slate-900">{formatCurrency(calculations.subtotal)}</span>
            </div>

            {calculations.tierMultiplier !== 1 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Tier Specification ({projectDetails.packageTier}):</span>
                <span>{formatCurrency(calculations.adjustedSubtotal - calculations.subtotal)}</span>
              </div>
            )}

            {calculations.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Promotional Discount ({projectDetails.discountPercent}%):</span>
                <span>-{formatCurrency(calculations.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Net Taxable Amount:</span>
              <span className="font-bold text-slate-900">{formatCurrency(calculations.taxableAmount)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>GST Tax ({projectDetails.taxPercent}%):</span>
              <span className="font-bold text-slate-900">{formatCurrency(calculations.taxAmount)}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Grand Total:</span>
              <span className="text-xl sm:text-2xl font-extrabold text-rose-600">
                {formatCurrency(calculations.grandTotal)}
              </span>
            </div>
          </div>

        </div>

        {/* Signatures & Notes */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <p className="font-semibold mb-12">Client Acceptance & Signature:</p>
            <div className="border-t border-slate-300 pt-1 w-48 font-medium">
              {projectDetails.clientName}
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <p className="font-semibold mb-12">Authorized Architect / Designer Signature:</p>
            <div className="border-t border-slate-300 pt-1 w-48 font-medium">
              {projectDetails.designerName}
            </div>
          </div>
        </div>

      </div>

      {/* Material Specification Modal */}
      <MaterialSpecModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
      />

    </div>
  );
};
