import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useQuotation } from '../../context/QuotationContext';
import { ProjectDetails } from '../../types/quotation';
import { Building, User, Phone, Mail, MapPin } from 'lucide-react';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ isOpen, onClose }) => {
  const { projectDetails, updateProjectDetails } = useQuotation();
  const [formData, setFormData] = useState<ProjectDetails>(projectDetails);

  useEffect(() => {
    if (isOpen) {
      setFormData(projectDetails);
    }
  }, [isOpen, projectDetails]);

  const handleChange = (field: keyof ProjectDetails, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectDetails(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project & Client Configuration"
      subtitle="Configure property dimensions, client details, and pricing parameters."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-1">
        
        {/* Section 1: Property Details */}
        <div className="bg-rose-50/40 border border-rose-100/80 rounded-xl p-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2.5 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" /> Property & Project Info
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project / Society Name</label>
              <input
                type="text"
                required
                value={formData.projectName}
                onChange={e => handleChange('projectName', e.target.value)}
                placeholder="e.g. Ajnara Daffodil Phase 2"
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type / Configuration</label>
              <select
                value={formData.propertyType}
                onChange={e => handleChange('propertyType', e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              >
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="2.5BHK">2.5 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="3.5BHK">3.5 BHK</option>
                <option value="4BHK">4 BHK</option>
                <option value="5BHK / Duplex">5 BHK / Duplex</option>
                <option value="Luxury Villa">Luxury Villa</option>
                <option value="Commercial Space">Commercial / Office</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Carpet Area (Sq.Ft)</label>
              <input
                type="number"
                min="100"
                step="10"
                value={formData.carpetArea}
                onChange={e => handleChange('carpetArea', Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => handleChange('city', e.target.value)}
                  placeholder="e.g. Noida Expressway"
                  className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Client Details */}
        <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Client Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={e => handleChange('clientName', e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={e => handleChange('clientPhone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={e => handleChange('clientEmail', e.target.value)}
                  placeholder="client@example.com"
                  className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Package Tier & Tax / Discount */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Package Tier</label>
            <select
              value={formData.packageTier}
              onChange={e => handleChange('packageTier', e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
            >
              <option value="Essential">Essential (Standard Finish -12%)</option>
              <option value="Premium">Premium (Best-seller 100%)</option>
              <option value="Luxury">Luxury (Ultra High-End +22%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Special Discount (%)</label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.discountPercent}
              onChange={e => handleChange('discountPercent', Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">GST Tax Rate (%)</label>
            <input
              type="number"
              min="0"
              max="28"
              value={formData.taxPercent}
              onChange={e => handleChange('taxPercent', Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Section 4: Studio Branding & Quote Ref */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Design Studio / Company Name</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={e => handleChange('companyName', e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Designer Name</label>
            <input
              type="text"
              value={formData.designerName}
              onChange={e => handleChange('designerName', e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Sticky Buttons */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-3 pb-1 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md shadow-rose-200 transition-all"
          >
            Save Project Details
          </button>
        </div>

      </form>
    </Modal>
  );
};
