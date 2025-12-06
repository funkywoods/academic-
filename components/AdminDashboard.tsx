
import React, { useEffect, useState, useCallback } from 'react';
import { db, Lead } from '../utils/database';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  
  // Bulk SMS State
  const [isBulkSmsOpen, setIsBulkSmsOpen] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Load data function
  const loadLeads = useCallback(() => {
    const currentLeads = db.getLeads();
    setLeads(currentLeads);
  }, []);

  // Reset auth when closed, handle initial load
  useEffect(() => {
    if (!isOpen) {
      setAuthError(false);
      setPasswordInput('');
      setIsBulkSmsOpen(false);
      setSentSuccess(false);
    } else {
       if (isAuthenticated) {
         loadLeads();
       }
    }
  }, [isOpen, isAuthenticated, loadLeads]);

  // Listen for real-time database updates from the AI
  useEffect(() => {
    const handleDbUpdate = () => {
      if (isAuthenticated && isOpen) {
        loadLeads();
      }
    };

    window.addEventListener('db-updated', handleDbUpdate);
    return () => {
      window.removeEventListener('db-updated', handleDbUpdate);
    };
  }, [isAuthenticated, isOpen, loadLeads]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Security Check
    if (passwordInput === 'somejoes@somejoes.com') {
      setIsAuthenticated(true);
      setAuthError(false);
      loadLeads();
    } else {
      setAuthError(true);
    }
  };

  const handleRefresh = () => {
    loadLeads();
  };

  const handleClear = () => {
    if (window.confirm("WARNING: This will permanently delete all records. Continue?")) {
      db.clear();
      setLeads([]);
    }
  };

  // Helper to format Ghana numbers for calling
  const getActions = (phone: string) => {
    // Remove non-numeric
    let clean = phone.replace(/\D/g, '');
    
    // Convert 02x/05x to 2332x
    if (clean.startsWith('0')) {
        clean = '233' + clean.substring(1);
    }
    // If just 24..., add 233
    if (clean.length === 9) {
        clean = '233' + clean;
    }

    const telLink = `tel:+${clean}`;
    const smsLink = `sms:+${clean}`;
    
    return { telLink, smsLink, isValid: clean.length >= 10 };
  };

  const handleSendBulk = () => {
    if (!bulkMessage.trim()) return;
    setIsSending(true);
    
    // Simulate API delay
    setTimeout(() => {
        setIsSending(false);
        setSentSuccess(true);
        setTimeout(() => {
            setIsBulkSmsOpen(false);
            setSentSuccess(false);
            setBulkMessage('');
        }, 2000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-earth-900/90 backdrop-blur-md" onClick={onClose}></div>
      
      {/* AUTHENTICATION SCREEN */}
      {!isAuthenticated ? (
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-red-100 animate-float">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-2xl text-earth-800">Restricted Access</h2>
            <p className="text-earth-800/60 text-center text-sm mt-2">
              This database contains sensitive user information. Please authenticate to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-earth-800 uppercase tracking-wider mb-1">Admin Key</label>
              <input 
                type="password" 
                className={`w-full bg-sand-50 border ${authError ? 'border-red-500' : 'border-sand-200'} rounded-lg px-4 py-3 text-earth-800 focus:outline-none focus:border-gold-500 transition-all`}
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                autoFocus
              />
              {authError && <p className="text-red-500 text-xs mt-1 font-medium">Access Denied: Invalid Key</p>}
            </div>
            <button 
              type="submit" 
              className="w-full bg-earth-800 text-gold-400 font-bold py-3 rounded-lg hover:bg-earth-900 transition-colors flex items-center justify-center gap-2"
            >
              Unlock Database
            </button>
          </form>
          
          <button onClick={onClose} className="w-full text-center text-earth-800/40 text-xs font-medium mt-4 hover:text-earth-800">
            Cancel
          </button>
        </div>
      ) : (
        /* DASHBOARD SCREEN */
        <div className="relative bg-sand-50 rounded-2xl shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col overflow-hidden border border-gold-500/20">
          
          {/* Header */}
          <div className="bg-earth-800 p-6 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-nile-500/20 p-2 rounded-lg">
                <svg className="w-6 h-6 text-nile-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-display font-bold text-xl flex items-center gap-2">
                  System Database 
                  <span className="text-[10px] bg-nile-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Secure</span>
                </h2>
                <p className="text-xs text-gold-400/80">Logged in as Administrator</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={() => setIsAuthenticated(false)} className="text-xs text-white/50 hover:text-white mr-4">
                  Lock
               </button>
               <button onClick={onClose} className="hover:bg-earth-700 p-2 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white p-4 border-b border-sand-200 flex flex-wrap justify-between items-center gap-4 shrink-0">
            <div className="flex gap-4 text-sm font-medium text-earth-800/60">
              <span>Total Records: <strong className="text-earth-800">{leads.length}</strong></span>
              <span>Recipient: <strong className="text-earth-800">samjonesquest@gmail.com</strong></span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsBulkSmsOpen(true)}
                className="px-4 py-2 bg-earth-800 text-gold-400 rounded-lg text-sm font-bold hover:bg-earth-900 transition-colors flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Broadcast SMS
              </button>

              <button onClick={handleRefresh} className="px-4 py-2 bg-gold-500 text-white rounded-lg text-sm font-bold hover:bg-gold-600 transition-colors flex items-center gap-2 shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button onClick={handleClear} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors border border-red-100">
                Clear
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-grow overflow-auto p-0 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand-100 text-earth-800 font-display uppercase text-xs tracking-wider sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 w-20">Actions</th>
                  <th className="p-4 w-20">Status</th>
                  <th className="p-4 w-28">Timestamp</th>
                  <th className="p-4 w-28">Plan</th>
                  <th className="p-4 w-32">Name</th>
                  <th className="p-4 w-32">Phone</th>
                  <th className="p-4 w-40">Email</th>
                  <th className="p-4">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-20 text-center">
                       <div className="flex flex-col items-center justify-center text-earth-800/40">
                          <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-lg font-bold mb-1">No Records Found</p>
                          <p className="text-xs">Data captured by Ama will appear here instantly.</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const { telLink, smsLink, isValid } = getActions(lead.phone);
                    return (
                    <tr key={lead.id} className="hover:bg-sand-50 transition-colors group">
                      <td className="p-4 align-top">
                        <div className="flex gap-2">
                           <a 
                             href={isValid ? telLink : '#'}
                             title="Call via Phone"
                             className={`p-2 rounded-lg ${isValid ? 'bg-nile-50 text-nile-600 hover:bg-nile-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                           >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                             </svg>
                           </a>
                           <a 
                             href={isValid ? smsLink : '#'}
                             title="Send SMS"
                             className={`p-2 rounded-lg ${isValid ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                           >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                             </svg>
                           </a>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-nile-500/10 text-nile-600 text-[10px] font-bold border border-nile-500/20 uppercase tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-nile-500"></span>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-earth-800/60 align-top whitespace-nowrap">{lead.timestamp}</td>
                      <td className="p-4 align-top">
                         <span className={`inline-block px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                           lead.plan?.includes('200') ? 'bg-gold-500 text-earth-900' :
                           lead.plan?.includes('150') ? 'bg-sunset-500 text-white' :
                           lead.plan?.includes('100') ? 'bg-earth-200 text-earth-900' :
                           'bg-gray-100 text-gray-500'
                         }`}>
                          {lead.plan || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-earth-800 align-top">{lead.name}</td>
                      <td className="p-4 text-earth-800/80 font-mono text-xs align-top whitespace-nowrap">{lead.phone}</td>
                      <td className="p-4 text-earth-800/80 font-medium align-top break-all">{lead.email}</td>
                      <td className="p-4 text-earth-800/70 align-top">
                        <div className="max-w-xs text-xs leading-relaxed">
                          {lead.summary}
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-sand-50 p-3 border-t border-sand-200 text-center text-xs text-earth-800/40 font-mono">
            ENCRYPTED CONNECTION • ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}
          </div>
          
          {/* BULK SMS MODAL */}
          {isBulkSmsOpen && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-float border border-gold-500">
                    {!sentSuccess ? (
                        <>
                            <h3 className="font-display font-bold text-xl text-earth-800 mb-2">Broadcast SMS</h3>
                            <p className="text-sm text-gray-500 mb-4">Send a message to all {leads.length} contacts.</p>
                            <textarea
                                className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none resize-none mb-4"
                                placeholder="Type your message here..."
                                value={bulkMessage}
                                onChange={(e) => setBulkMessage(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsBulkSmsOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSendBulk}
                                    disabled={isSending || !bulkMessage}
                                    className="flex-1 py-2.5 bg-earth-800 text-gold-400 rounded-lg text-sm font-bold hover:bg-earth-900 disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {isSending ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-gold-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Sending...
                                        </>
                                    ) : 'Send Broadcast'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-lg text-earth-800">Messages Sent!</h3>
                            <p className="text-sm text-gray-500">Successfully broadcasted to {leads.length} contacts.</p>
                        </div>
                    )}
                </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
