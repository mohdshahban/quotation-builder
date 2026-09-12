import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Printer, 
  Layers, 
  ArrowLeft, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  QrCode,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useQuotation } from '../../context/QuotationContext';
import { formatCurrency } from '../../utils/currency';

interface ClientPortalViewProps {
  onBackToDashboard: () => void;
  onGoToStudio: () => void;
  onGoToSummary: () => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  onBackToDashboard,
  onGoToStudio,
  onGoToSummary
}) => {
  const { activeProject, studioSettings, updateProjectStatus, currentUser } = useWorkspace();
  const { rooms, calculations, projectDetails } = useQuotation();

  const isApproved = activeProject?.status === 'Approved ✓';
  const [clientSignName, setClientSignName] = useState(projectDetails.clientName || '');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(rooms[0]?.id || null);

  const handleAcceptProposal = () => {
    if (!agreedTerms) {
      alert('Please check the box agreeing to the proposal terms and commercial milestones.');
      return;
    }
    if (!clientSignName.trim()) {
      alert('Please enter your full name as digital signature.');
      return;
    }

    if (activeProject) {
      updateProjectStatus(activeProject.id, 'Approved ✓');
      
      // Fire celebratory confetti animation
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Floating Portal Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <span className="text-xs bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full border border-rose-200/60 hidden sm:inline-block">
              🌐 Live Client Presentation Portal
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onGoToStudio}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Open in Studio</span>
            </button>
            <button
              onClick={onGoToSummary}
              className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Summary</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner if Approved */}
        {isApproved && (
          <div className="bg-emerald-500 text-white rounded-2xl p-5 shadow-lg flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">Proposal Approved & Accepted Online</h3>
                <p className="text-xs text-emerald-100">
                  Signed digitally by {activeProject.projectDetails.clientName} on {activeProject.clientAcceptedDate || activeProject.lastModified}. Project scope is officially locked.
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
              Status: Approved ✓
            </div>
          </div>
        )}

        {/* Main Presentation Paper Document Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Header & Studio Letterhead */}
          <div className="p-6 sm:p-10 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              
              {/* Studio Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {studioSettings.companyName || 'Studio Lux Interio Design'}
                    </h1>
                    <p className="text-xs font-semibold text-rose-600">
                      {studioSettings.tagline || 'Architecture • Turnkey Interiors • Modular Fitouts'}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-0.5 pt-2">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{studioSettings.studioAddress || 'Signature One Hub, Sector 62, Noida NCR'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{studioSettings.contactPhone}</span>
                    <span className="text-slate-300">•</span>
                    <Mail className="w-3.5 h-3.5 text-slate-400 ml-1" />
                    <span>{studioSettings.officialEmail}</span>
                  </p>
                  {studioSettings.gstin && (
                    <p className="text-[11px] text-slate-400 pt-0.5">
                      GSTIN: <span className="font-semibold text-slate-600">{studioSettings.gstin}</span> | PAN: <span className="font-semibold text-slate-600">{studioSettings.panNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Quotation Metadata Card */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 w-full md:w-auto md:min-w-[260px] text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Quotation Ref</span>
                  <span className="font-mono font-bold text-slate-800">{projectDetails.quotationNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Date Issued:</span>
                  <span className="font-semibold text-slate-700">{projectDetails.createdDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Lead Designer:</span>
                  <span className="font-bold text-rose-600">{projectDetails.designerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Validity:</span>
                  <span className="font-semibold text-slate-700">{projectDetails.validityDays} Days</span>
                </div>
              </div>

            </div>

            {/* Client & Project Badge Bar */}
            <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-rose-50/60 border border-rose-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-0.5">
                  PREPARED EXCLUSIVELY FOR
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {projectDetails.clientName} <span className="text-slate-400 font-normal">({projectDetails.projectName})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {projectDetails.propertyType} • {projectDetails.carpetArea} sq.ft. carpet area • {projectDetails.city || 'Noida NCR'}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                  COMMERCIAL ESTIMATE
                </span>
                <span className="text-2xl font-black text-rose-600">
                  {formatCurrency(calculations.grandTotal)}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  (Incl. {projectDetails.taxPercent}% GST & Material Hardware)
                </span>
              </div>
            </div>

          </div>

          {/* Investment Breakdown Cards */}
          <div className="p-6 sm:p-10 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-rose-600" />
              <span>Investment Summary Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs text-slate-400">Base Subtotal</span>
                <p className="text-lg font-bold text-slate-800 mt-1">{formatCurrency(calculations.subtotal)}</p>
                <span className="text-[11px] text-slate-400">{calculations.totalItemsCount} Items configured</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs text-slate-400">Studio Discount</span>
                <p className="text-lg font-bold text-emerald-600 mt-1">
                  {calculations.discountAmount > 0 ? `-${formatCurrency(calculations.discountAmount)}` : '₹0'}
                </p>
                <span className="text-[11px] text-emerald-600 font-medium">{projectDetails.discountPercent}% Studio Benefit</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs text-slate-400">GST (18%)</span>
                <p className="text-lg font-bold text-slate-800 mt-1">{formatCurrency(calculations.taxAmount)}</p>
                <span className="text-[11px] text-slate-400">Standard input tax</span>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200">
                <span className="text-xs text-rose-600 font-bold uppercase tracking-wider">Turnkey Total</span>
                <p className="text-xl font-black text-rose-600 mt-1">{formatCurrency(calculations.grandTotal)}</p>
                <span className="text-[11px] text-rose-700 font-medium">All-inclusive final quotation</span>
              </div>
            </div>
          </div>

          {/* Interactive Room Scope & Specifications */}
          <div className="p-6 sm:p-10 border-b border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Room-by-Room Scope & Specifications</h3>
                <p className="text-xs text-slate-500">
                  Expand each room section to review itemized woodwork, dimensions, and specifications.
                </p>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                {rooms.length} Rooms
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {rooms.map(room => {
                const roomSelectedItems = room.items.filter(i => i.isSelected);
                const roomTotal = roomSelectedItems.reduce((acc, i) => acc + i.calculatedPrice, 0);
                const isExpanded = expandedRoomId === room.id;

                return (
                  <div
                    key={room.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                  >
                    {/* Room Header Accordion Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedRoomId(isExpanded ? null : room.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{room.name}</h4>
                          <p className="text-xs text-slate-400">
                            {roomSelectedItems.length} items configured • {room.areaSqft || 150} sq.ft.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm sm:text-base font-bold text-slate-900">
                          {formatCurrency(roomTotal)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Room Items Table */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-white overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2">
                              <th className="pb-2">Item & Description</th>
                              <th className="pb-2">Specification / Size</th>
                              <th className="pb-2 text-center">Qty / Area</th>
                              <th className="pb-2 text-right">Unit Rate</th>
                              <th className="pb-2 text-right">Line Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {roomSelectedItems.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-4 text-center text-slate-400">
                                  No items active in this room.
                                </td>
                              </tr>
                            ) : (
                              roomSelectedItems.map(item => (
                                <tr key={item.id} className="py-3">
                                  <td className="py-3 pr-4">
                                    <p className="font-bold text-slate-800">{item.name}</p>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                                      {item.description}
                                    </p>
                                  </td>
                                  <td className="py-3 pr-4 text-slate-600 font-medium">
                                    {item.selectedVariantName || 'Standard Bespoke Spec'}
                                  </td>
                                  <td className="py-3 px-2 text-center font-bold text-slate-700">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td className="py-3 pr-4 text-right text-slate-600">
                                    {formatCurrency(item.unitRate)}
                                  </td>
                                  <td className="py-3 text-right font-bold text-slate-900">
                                    {formatCurrency(item.calculatedPrice)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warranty & Proposal Terms */}
          <div className="p-6 sm:p-10 border-b border-slate-100 bg-slate-50/40">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>Studio Warranty & Commercial Clauses</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                {(studioSettings.proposalTerms || []).map((term, i) => (
                  <div key={i} className="text-xs text-slate-600 flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{term}</span>
                  </div>
                ))}
              </div>

              {/* Milestone & Bank Details */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bank Payout Info</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">RTGS / NEFT / UPI</span>
                </div>

                <div className="text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Account Name:</span>
                    <span className="font-bold text-slate-800">{studioSettings.bankAccountName || studioSettings.companyName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Account Number:</span>
                    <span className="font-mono font-bold text-slate-800">{studioSettings.accountNumber || '920020045678912'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Bank & Branch:</span>
                    <span className="font-semibold text-slate-700">{studioSettings.bankName || 'HDFC Bank, Sector 62'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">IFSC Code:</span>
                    <span className="font-mono font-bold text-slate-800">{studioSettings.ifscCode || 'HDFC0001234'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">UPI ID:</span>
                    <span className="font-bold text-rose-600">{studioSettings.upiId || 'studiolux@hdfcbank'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Accept & Sign Proposal Online Section */}
          <div className="p-6 sm:p-10 bg-gradient-to-r from-rose-50/80 via-white to-pink-50/80">
            {isApproved ? (
              <div className="bg-white p-6 rounded-2xl border-2 border-emerald-200 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-800">Proposal Digitally Executed</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Thank you for confirming your interior fitout quotation. Our project execution lead will contact you to schedule site marking & 2D/3D working drawings sign-off.
                </p>
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved & Confirmed</span>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-rose-200 shadow-md space-y-5">
                <div className="text-center space-y-1">
                  <h4 className="text-lg sm:text-xl font-black text-slate-900">
                    Accept & Sign Proposal Online
                  </h4>
                  <p className="text-xs text-slate-500">
                    Confirm this quotation to lock current pricing, material batch schedules, and reserve project execution slot.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Legal Name (Digital Signature)
                    </label>
                    <input
                      type="text"
                      value={clientSignName}
                      onChange={e => setClientSignName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold text-slate-800"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={e => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span>
                      I have reviewed the room-by-room scope, specifications, and agree to the 50-45-5 payment milestone structure and warranty terms.
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAcceptProposal}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-rose-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-98"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm & Accept Proposal Online</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
