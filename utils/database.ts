
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  plan: string;
  summary: string;
  timestamp: string;
  recipient: string;
  status: 'SENT' | 'FAILED';
}

const STORAGE_KEY = 'academia_afrik_db_v1';

export const db = {
  saveLead: (data: { name: string; email: string; phone: string; type: string; plan?: string; summary: string }) => {
    try {
      const leads = db.getLeads();
      const newLead: Lead = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        email: data.email || 'N/A',
        phone: data.phone || 'N/A',
        type: data.type,
        plan: data.plan || 'Not Specified',
        summary: data.summary,
        timestamp: new Date().toLocaleString(),
        recipient: 'samjonesquest@gmail.com',
        status: 'SENT'
      };
      
      leads.unshift(newLead); // Add to top
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
      
      console.log(`[DB SUCCESS] Saved new lead. Total records: ${leads.length}`);

      // Dispatch a custom event to notify listeners (like the Admin Dashboard) that data has changed
      window.dispatchEvent(new Event('db-updated'));
      
      return newLead;
    } catch (e) {
      console.error("Database Error:", e);
      return null;
    }
  },

  getLeads: (): Lead[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Database Read Error", e);
      return [];
    }
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('db-updated'));
  }
};
