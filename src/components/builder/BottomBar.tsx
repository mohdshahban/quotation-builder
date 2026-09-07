import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calculator, CheckCircle2 } from 'lucide-react';
import { useQuotation } from '../../context/QuotationContext';
import { formatCurrency } from '../../utils/currency';

interface BottomBarProps {
  onGoToSummary: () => void;
  onGoToHomeType?: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ onGoToSummary, onGoToHomeType }) => {
  const { 
    rooms, 
    activeRoomId, 
    setActiveRoomId, 
    calculations, 
    activeStep, 
    setActiveStep 
  } = useQuotation();

  const [showBreakdown, setShowBreakdown] = useState(false);

  // Find index of current room
  const currentRoomIndex = rooms.findIndex(r => r.id === activeRoomId);
  const isFirstRoom = currentRoomIndex <= 0;
  const isLastRoom = currentRoomIndex === rooms.length - 1;

  const handleBack = () => {
    if (activeStep === 3) {
      setActiveStep(2);
      return;
    }
    if (!isFirstRoom) {
      setActiveRoomId(rooms[currentRoomIndex - 1].id);
    } else if (onGoToHomeType) {
      onGoToHomeType();
    }
  };

  const handleNext = () => {
    if (activeStep === 2) {
      if (!isLastRoom) {
        setActiveRoomId(rooms[currentRoomIndex + 1].id);
      } else {
        onGoToSummary();
      }
    } else if (activeStep === 1) {
      setActiveStep(2);
    }
  };

  return (
    <>
      {/* Sticky Bottom Bar matching screenshot */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-rose-100/80 shadow-floating py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Left: Live Quotation Summary Pill */}
          <div className="relative">
            <div
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center gap-3 bg-rose-50/80 hover:bg-rose-100/70 border border-rose-200/80 rounded-2xl px-4 py-2 cursor-pointer transition-all shadow-xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-white shadow-xs text-rose-600 flex items-center justify-center shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Estimated Total</span>
                  <span className="text-[10px] bg-rose-200/60 text-rose-800 font-bold px-1.5 py-0.2 rounded-full">
                    {calculations.totalItemsCount} items
                  </span>
                </div>
                <p className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">
                  {formatCurrency(calculations.grandTotal)}
                </p>
              </div>
            </div>

            {/* Subtotal Breakdown Popover */}
            {showBreakdown && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowBreakdown(false)} 
                />
                <div className="absolute bottom-full left-0 mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-30 animate-fade-in text-xs space-y-2.5">
                  <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <span>Room-by-Room Cost Breakdown</span>
                    <span className="text-rose-600">{calculations.totalItemsCount} Items</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {calculations.roomBreakdowns.map((rb) => (
                      <div key={rb.roomId} className="flex items-center justify-between text-slate-600">
                        <span className="truncate max-w-[170px]">{rb.roomName} ({rb.itemsCount})</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(rb.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-2 space-y-1 text-slate-600 font-medium">
                    <div className="flex justify-between">
                      <span>Gross Subtotal:</span>
                      <span>{formatCurrency(calculations.subtotal)}</span>
                    </div>
                    {calculations.tierMultiplier !== 1 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Tier Spec Adjustment:</span>
                        <span>{formatCurrency(calculations.adjustedSubtotal - calculations.subtotal)}</span>
                      </div>
                    )}
                    {calculations.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Special Discount:</span>
                        <span>-{formatCurrency(calculations.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>GST Taxes ({calculations.taxAmount > 0 ? '18%' : '0%'}):</span>
                      <span>{formatCurrency(calculations.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-100">
                      <span>Grand Total:</span>
                      <span className="text-rose-600 font-extrabold">{formatCurrency(calculations.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Back & Next Buttons matching screenshot */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            
            {/* Back Button (matching screenshot pink outline/tint) */}
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 sm:flex-initial px-8 py-2.5 rounded-xl border-2 border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-600 font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Next Button (matching screenshot coral-red filled) */}
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 sm:flex-initial px-10 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>{isLastRoom || activeStep === 3 ? 'View Quotation' : 'Next Room'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

        </div>
      </footer>
    </>
  );
};
