import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useQuotation } from '../../context/QuotationContext';
import { Shield, Sparkles, Check, Layers, Cpu, Palette, Flame, HardDrive } from 'lucide-react';

interface MaterialSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CORE_SUBSTRATES = [
  {
    id: 'bwp_ply',
    name: 'Century Club BWP Plywood (IS:710)',
    description: '100% Boiling Waterproof marine grade ply with 20-year manufacturer warranty. Best for kitchens & wet areas.',
    grade: 'Premium Plus',
  },
  {
    id: 'hdhmr',
    name: 'Action TESA / Greenpanel HDHMR',
    description: 'High-Density Moisture Resistant board (850+ kg/m³). Perfect for routered shutter profiles and dry zones.',
    grade: 'Standard Premium',
  },
  {
    id: 'sainik_mr',
    name: 'Century Sainik MR Grade Plywood',
    description: 'Moisture resistant commercial ply for wardrobes, TV consoles, and bedroom cabinets.',
    grade: 'Essential Tier',
  },
];

const SURFACE_FINISHES = [
  {
    id: 'acrylic_2mm',
    name: 'Ultra-Gloss 2mm Acrylic (Anti-Yellowing)',
    description: 'Mirror-finish high gloss acrylic shutters with laser edge-banding for seamless glass-like look.',
    grade: 'Luxury',
  },
  {
    id: 'pu_lacquer',
    name: 'PU Matte / Gloss Polyurethane Lacquer',
    description: 'Italian PU spray finish with zero edge seams and silky smooth tactile feel.',
    grade: 'Ultra Luxury',
  },
  {
    id: 'merino_laminate',
    name: 'Merino 1mm High-Pressure Laminate',
    description: 'Durable, scratch-resistant surface in solid tones, textured stone, and realistic wood grains.',
    grade: 'Premium',
  },
  {
    id: 'natural_veneer',
    name: 'Natural Teak / Walnut Veneer + Melamine',
    description: 'Authentic natural wood flitches hand-stitched and sealed with polyurethane matte polish.',
    grade: 'Artisanal',
  },
];

const HARDWARE_SYSTEMS = [
  {
    id: 'hafele_sensys',
    name: 'Hafele / Hettich Soft-Close Hinges & Channels',
    description: 'Tested for 100,000 opening cycles with integrated soft-close damping and 10-year warranty.',
    grade: 'Industry Standard',
  },
  {
    id: 'blum_tandembox',
    name: 'Blum Tandembox & Aventos Lift-Up Systems',
    description: 'Austrian precision motion hardware for deep drawers, pantry units, and overhead bifold doors.',
    grade: 'Top Tier',
  },
  {
    id: 'godrej_ebco',
    name: 'Godrej / Ebco Telescopic Channels',
    description: 'Heavy-duty steel ball bearing runners with 45kg load bearing capacity.',
    grade: 'Standard',
  },
];

export const MaterialSpecModal: React.FC<MaterialSpecModalProps> = ({ isOpen, onClose }) => {
  const { projectDetails, updateProjectDetails } = useQuotation();

  const [selectedSubstrate, setSelectedSubstrate] = useState(CORE_SUBSTRATES[0].id);
  const [selectedFinish, setSelectedFinish] = useState(SURFACE_FINISHES[0].id);
  const [selectedHardware, setSelectedHardware] = useState(HARDWARE_SYSTEMS[0].id);

  const handleApplySpecs = () => {
    const substrateObj = CORE_SUBSTRATES.find(s => s.id === selectedSubstrate);
    const finishObj = SURFACE_FINISHES.find(f => f.id === selectedFinish);
    const hardwareObj = HARDWARE_SYSTEMS.find(h => h.id === selectedHardware);

    const specSummary = `Material Specifications: Core [${substrateObj?.name}], Finish [${finishObj?.name}], Hardware [${hardwareObj?.name}].`;
    
    updateProjectDetails({
      notes: projectDetails.notes ? `${projectDetails.notes}\n${specSummary}` : specSummary,
    });
    alert('Material specifications updated successfully for this quotation!');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Material & Hardware Specification Matrix"
      subtitle="Select the structural boards, shutter surface finishes, and hardware motion systems for this project."
      maxWidth="2xl"
    >
      <div className="space-y-6 pb-2">
        
        {/* Section 1: Core Substrate */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-rose-600" />
            <span>1. Core Board Substrate (Internal Carcass & Framework)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {CORE_SUBSTRATES.map(item => {
              const isSelected = selectedSubstrate === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedSubstrate(item.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.grade}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-rose-600" />}
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-2 leading-tight">{item.name}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Surface Shutter Finish */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-rose-600" />
            <span>2. External Shutter & Elevation Surface Finish</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SURFACE_FINISHES.map(item => {
              const isSelected = selectedFinish === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedFinish(item.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.grade}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-rose-600" />}
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-2 leading-tight">{item.name}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Hardware & Motion Systems */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-rose-600" />
            <span>3. Hardware, Hinges & Soft-Close Drawer Motion</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {HARDWARE_SYSTEMS.map(item => {
              const isSelected = selectedHardware === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedHardware(item.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.grade}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-rose-600" />}
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-2 leading-tight">{item.name}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplySpecs}
            className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4" />
            <span>Apply Material Specs to Quotation</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};
