import React, { useState } from 'react';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const TrialModal: React.FC<TrialModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    trialType: '1 Day',
    dates: '',
    subject: '',
    consent: false
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-earth-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gold-500/20">
        {/* Header */}
        <div className="bg-earth-800 p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-egyptian opacity-10"></div>
          <h2 className="text-2xl font-display font-bold text-gold-400 relative z-10">Book Human Tutor Trial</h2>
          <p className="text-sand-100/80 text-sm relative z-10">Reserve your 1-2 day expert guidance session</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-earth-800 uppercase tracking-wider mb-1">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-sand-50 border border-sand-200 rounded-lg px-4 py-2 text-earth-800 focus:outline-none focus:border-gold-500 transition-colors"
              placeholder="Kwame Mensah"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-earth-800 uppercase tracking-wider mb-1">Phone Number</label>
            <input 
              required
              type="tel" 
              className="w-full bg-sand-50 border border-sand-200 rounded-lg px-4 py-2 text-earth-800 focus:outline-none focus:border-gold-500 transition-colors"
              placeholder="+233 ..."
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-earth-800 uppercase tracking-wider mb-1">Trial Type</label>
              <select 
                className="w-full bg-sand-50 border border-sand-200 rounded-lg px-4 py-2 text-earth-800 focus:outline-none focus:border-gold-500"
                value={formData.trialType}
                onChange={e => setFormData({...formData, trialType: e.target.value})}
              >
                <option>1 Day</option>
                <option>2 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-earth-800 uppercase tracking-wider mb-1">Subject</label>
              <input 
                type="text" 
                className="w-full bg-sand-50 border border-sand-200 rounded-lg px-4 py-2 text-earth-800 focus:outline-none focus:border-gold-500"
                placeholder="Math, Bio..."
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-earth-800 uppercase tracking-wider mb-1">Preferred Dates</label>
            <input 
              type="text" 
              className="w-full bg-sand-50 border border-sand-200 rounded-lg px-4 py-2 text-earth-800 focus:outline-none focus:border-gold-500"
              placeholder="e.g., May 12th & 13th"
              value={formData.dates}
              onChange={e => setFormData({...formData, dates: e.target.value})}
            />
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input 
              required
              type="checkbox" 
              id="consent"
              className="mt-1 accent-gold-500"
              checked={formData.consent}
              onChange={e => setFormData({...formData, consent: e.target.checked})}
            />
            <label htmlFor="consent" className="text-xs text-earth-800/70">
              I consent to be contacted by Academia Afrik regarding this booking.
            </label>
          </div>

          <button type="submit" className="w-full bg-sunset-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-sunset-500/30 hover:bg-orange-600 transition-all mt-4">
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrialModal;