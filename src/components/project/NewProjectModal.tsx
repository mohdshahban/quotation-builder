import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Building, User, MapPin, Plus, Sparkles } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const { createProject, studioSettings, currentUser, setActiveNavView } = useWorkspace();

  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [propertyType, setPropertyType] = useState('3BHK');
  const [carpetArea, setCarpetArea] = useState<number>(1850);
  const [city, setCity] = useState(studioSettings.primaryCity || 'Noida NCR');
  const [packageTier, setPackageTier] = useState<'Essential' | 'Premium' | 'Luxury'>('Premium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject({
      projectName: projectName.trim() || `${propertyType} Residence - ${clientName || 'Client'}`,
      clientName: clientName.trim() || 'Valued Client',
      clientPhone,
      clientEmail,
      propertyType,
      carpetArea: Number(carpetArea) || 1500,
      city,
      packageTier,
      designerName: currentUser.name || studioSettings.companyName,
    });
    onClose();
    setActiveNavView('builder');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Interior Project"
      subtitle="Initialize a new client quotation with customizable room configurations."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Project Name & Client Name */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Project Name / Society <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="e.g. ATS Knightsbridge 4BHK"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Client Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="e.g. Vikramaditya Rathore"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Gurgaon Golf Course Rd"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Typology & Area */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Configuration</label>
            <select
              value={propertyType}
              onChange={e => setPropertyType(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all font-semibold"
            >
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4 BHK</option>
              <option value="5BHK / Villa">5 BHK / Villa</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Carpet Area (Sq.Ft)</label>
            <input
              type="number"
              min="100"
              step="50"
              value={carpetArea}
              onChange={e => setCarpetArea(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Specification Tier</label>
            <select
              value={packageTier}
              onChange={e => setPackageTier(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all font-semibold text-rose-600"
            >
              <option value="Essential">Essential Tier</option>
              <option value="Premium">Premium Tier</option>
              <option value="Luxury">Luxury Tier</option>
            </select>
          </div>
        </div>

        {/* Client Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Client Phone</label>
            <input
              type="tel"
              value={clientPhone}
              onChange={e => setClientPhone(e.target.value)}
              placeholder="+91 98100 23456"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Client Email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={e => setClientEmail(e.target.value)}
              placeholder="client@gmail.com"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create & Open in Studio</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
