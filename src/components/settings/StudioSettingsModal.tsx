import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { StudioSettings, UserRole } from '../../types/settings';
import { 
  Building2, 
  CreditCard, 
  FileCheck2, 
  Users, 
  Plus, 
  Trash2, 
  Shield, 
  CheckCircle2, 
  UserCheck,
  Building
} from 'lucide-react';

interface StudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'tax' | 'terms' | 'team';
}

export const StudioSettingsModal: React.FC<StudioSettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
}) => {
  const { studioSettings, updateStudioSettings, currentUser, switchRole, permissions } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'profile' | 'tax' | 'terms' | 'team'>(initialTab);
  const [formData, setFormData] = useState<StudioSettings>(studioSettings);
  const [newTermText, setNewTermText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(studioSettings);
      setActiveTab(initialTab);
    }
  }, [isOpen, studioSettings, initialTab]);

  const handleChange = (field: keyof StudioSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTerm = () => {
    if (newTermText.trim()) {
      setFormData(prev => ({
        ...prev,
        proposalTerms: [...prev.proposalTerms, newTermText.trim()],
      }));
      setNewTermText('');
    }
  };

  const handleUpdateTerm = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      proposalTerms: prev.proposalTerms.map((t, i) => (i === index ? text : t)),
    }));
  };

  const handleDeleteTerm = (index: number) => {
    setFormData(prev => ({
      ...prev,
      proposalTerms: prev.proposalTerms.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudioSettings(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Studio Workspace & Branding Settings"
      subtitle="Configure studio letterhead, tax GSTIN, bank payout info, and team accounts."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-1">
        
        {/* Navigation Tabs matching Screenshots */}
        <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all text-center ${
              activeTab === 'profile'
                ? 'bg-white text-rose-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Studio Profile
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tax')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all text-center ${
              activeTab === 'tax'
                ? 'bg-white text-rose-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tax & Bank UPI
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all text-center ${
              activeTab === 'terms'
                ? 'bg-white text-rose-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Proposal Terms
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all text-center ${
              activeTab === 'team'
                ? 'bg-white text-rose-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Team Roles
          </button>
        </div>

        {/* TAB 1: STUDIO PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Studio Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={e => handleChange('companyName', e.target.value)}
                placeholder="Studio Lux Interio Design"
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => handleChange('tagline', e.target.value)}
                placeholder="Architecture • Turnkey Interiors • Modular Fitouts"
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={e => handleChange('contactPhone', e.target.value)}
                  placeholder="+91 80000 12345"
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={formData.officialEmail}
                  onChange={e => handleChange('officialEmail', e.target.value)}
                  placeholder="hello@luxinterio.com"
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  type="text"
                  value={formData.websiteUrl}
                  onChange={e => handleChange('websiteUrl', e.target.value)}
                  placeholder="www.luxinteriodesign.com"
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary City</label>
                <input
                  type="text"
                  value={formData.primaryCity}
                  onChange={e => handleChange('primaryCity', e.target.value)}
                  placeholder="Noida NCR"
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Studio Office Address</label>
              <input
                type="text"
                value={formData.studioAddress}
                onChange={e => handleChange('studioAddress', e.target.value)}
                placeholder="Suite 402, Signature One Hub, Sector 62, Noida, UP - 201309"
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>
        )}

        {/* TAB 2: TAX & BANK UPI */}
        {activeTab === 'tax' && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={e => handleChange('gstin', e.target.value)}
                  placeholder="07AAAAA0000A1Z5"
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Number</label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={e => handleChange('panNumber', e.target.value)}
                  placeholder="ABCDE1234F"
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 uppercase font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-2">
                BANK DETAILS (PRINTED ON CLIENT PROPOSALS FOR MILESTONE PAYOUTS)
              </span>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account Name</label>
                    <input
                      type="text"
                      value={formData.bankAccountName}
                      onChange={e => handleChange('bankAccountName', e.target.value)}
                      placeholder="Studio Lux Interio Design Pvt Ltd"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={e => handleChange('accountNumber', e.target.value)}
                      placeholder="920020045678912"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name & Branch</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={e => handleChange('bankName', e.target.value)}
                      placeholder="HDFC Bank, Sector 62 Branch"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.ifscCode}
                      onChange={e => handleChange('ifscCode', e.target.value)}
                      placeholder="HDFC0001234"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UPI ID (VPA)</label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={e => handleChange('upiId', e.target.value)}
                    placeholder="studiolux@hdfcbank"
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono text-rose-700"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROPOSAL TERMS */}
        {activeTab === 'terms' && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Proposal Terms & Warranty Clauses ({formData.proposalTerms.length})
              </label>
            </div>

            {/* Terms List matching screenshot */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {formData.proposalTerms.map((term, index) => (
                <div key={index} className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <span className="text-xs font-bold text-slate-400 mt-1 shrink-0">{index + 1}.</span>
                  <textarea
                    rows={2}
                    value={term}
                    onChange={(e) => handleUpdateTerm(index, e.target.value)}
                    className="flex-1 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteTerm(index)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 mt-1"
                    title="Delete clause"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Clause */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={newTermText}
                onChange={(e) => setNewTermText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTerm();
                  }
                }}
                placeholder="Type new proposal clause or warranty condition..."
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddTerm}
                disabled={!newTermText.trim()}
                className="px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg flex items-center gap-1 shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Term</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: TEAM ROLES & RBAC */}
        {activeTab === 'team' && (
          <div className="space-y-3 pt-1">
            <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-950">Active Simulating Role</p>
                <p className="text-[11px] text-slate-500">Currently logged in as: <strong className="text-slate-800">{currentUser.name} ({currentUser.role.toUpperCase()})</strong></p>
              </div>
              <div className="flex gap-1">
                {(['admin', 'designer', 'estimator', 'client'] as const).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => switchRole(role)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                      currentUser.role === role
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
                    }`}
                  >
                    {role.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Members List */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Workspace Team Members & Roles
              </label>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {studioSettings.teamMembers.map(member => (
                  <div key={member.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 border border-slate-200">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{member.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                            member.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : member.role === 'designer'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : member.role === 'estimator'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{member.designation} • {member.email}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => switchRole(member.role)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
                    >
                      {currentUser.role === member.role ? 'Current Active' : 'Switch to Role'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-3 pb-1 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md shadow-rose-200 transition-all"
          >
            Save Studio Settings
          </button>
        </div>

      </form>
    </Modal>
  );
};
