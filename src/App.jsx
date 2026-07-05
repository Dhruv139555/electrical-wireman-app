import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InvoiceForm from './components/InvoiceForm';
import InvoicePrint from './components/InvoicePrint';
import Estimator from './components/Estimator';
import InventoryList from './components/InventoryList';
import ClientList from './components/ClientList';
import SettingsView from './components/Settings';
import Auth from './components/Auth';

import { 
  DEFAULT_COMPANY_PROFILE, 
  DEFAULT_MATERIALS, 
  DEFAULT_POINT_RATES, 
  DEFAULT_TERMS 
} from './utils/defaultData';

// Initial Demo Seed matching user's image quotation
const DEMO_QUOTATION = {
  id: "demo-q1",
  docType: "Quotation",
  docNumber: 1,
  date: "2026-06-23",
  validityDate: "2026-06-23",
  status: "Approved",
  clientInfo: {
    name: "Nishantbhai Sharma",
    address: "Isanpur, Ahmedabad, Gujarat, 382440",
    state: "Gujarat",
    stateCode: "24",
    gstin: "URP",
    shippingName: "Nishantbhai Sharma",
    shippingAddress: "Isanpur, Ahmedabad, Gujarat, 382445",
    shippingState: "Gujarat",
    shippingStateCode: "24"
  },
  items: [
    { name: "8 Module open box", qty: 1, unit: "NOS", rate: 80 },
    { name: "1 module Blank", qty: 8, unit: "NOS", rate: 10 },
    { name: "Male female pin", qty: 1, unit: "NOS", rate: 40 },
    { name: "1.5 mm wire", qty: 3, unit: "MTR", rate: 25 },
    { name: "19 mm flexible pipe", qty: 1, unit: "MTR", rate: 30 },
    { name: "19 mm clip", qty: 6, unit: "NOS", rate: 1.5 },
    { name: "5A socket point", qty: 1, unit: "NOS", rate: 200 },
    { name: "Camera fitting", qty: 1, unit: "NOS", rate: 150 },
    { name: "Fan open fitting", qty: 1, unit: "NOS", rate: 200 }
  ],
  taxableAmount: 864,
  cgst: 0,
  sgst: 0,
  igst: 0,
  totalTax: 0,
  roundOff: 0,
  grandTotal: 864,
  gstRate: 0,
  amountInWords: "Eight Hundred Sixty Four Rupees Only",
  terms: [
    "This is an electronically generated document.",
    "All disputes are subject to seller city jurisdiction."
  ]
};

const DEFAULT_DEMO_CLIENTS = [
  {
    id: "c1",
    name: "Nishantbhai Sharma",
    address: "Isanpur, Ahmedabad, Gujarat, 382440",
    state: "Gujarat",
    stateCode: "24",
    gstin: "URP",
    city: "Ahmedabad"
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Data States
  const [companyProfile, setCompanyProfile] = useState(DEFAULT_COMPANY_PROFILE);
  const [materials, setMaterials] = useState(DEFAULT_MATERIALS);
  const [clients, setClients] = useState(DEFAULT_DEMO_CLIENTS);
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([DEMO_QUOTATION]);
  const [estimates, setEstimates] = useState([]);
  const [printHistory, setPrintHistory] = useState([]);
  const [defaultTerms, setDefaultTerms] = useState(DEFAULT_TERMS);

  // Editor / Viewer states
  const [creatingDocType, setCreatingDocType] = useState(null); // 'Quotation', 'Invoice', or null
  const [editingDoc, setEditingDoc] = useState(null);           // doc object or null
  const [viewingDoc, setViewingDoc] = useState(null);           // doc object or null
  const [estimatorPreload, setEstimatorPreload] = useState(null); // preloaded state from estimator convert

  // Supabase Sync States
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env?.VITE_SUPABASE_URL || 'https://ivrmxblrjbnswhwjougt.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState(import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cm14YmxyamJuc3dod2pvdWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjA1MTIsImV4cCI6MjA5ODc5NjUxMn0.V7dHk9xiCC6bxqKUhMQlMO8J-t8mVLHFOoXks5U2J1seyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cm14YmxyamJuc3dod2pvdWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjA1MTIsImV4cCI6MjA5ODc5NjUxMn0.V7dHk9xiCC6bxqKUhMQlMO8J-t8mVLHFOoXks5U2J1s');
  const [syncStatus, setSyncStatus] = useState('offline');

  // Auth States
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Background Cloud Sync Trigger
  const syncToCloud = async (id, data) => {
    const creds = getSupabaseCredentials();
    if (!creds.url || !creds.key) return;
    setSyncStatus('syncing');
    try {
      const { pushSyncData } = await import('./utils/syncService');
      const userId = currentUser ? currentUser.id : null;
      const res = await pushSyncData(creds.url, creds.key, id, data, userId);
      if (res.success) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.error('Background sync failed:', err);
      setSyncStatus('error');
    }
  };

  const handleSaveSyncCredentials = (url, key) => {
    setSupabaseUrl(url);
    setSupabaseKey(key);
    localStorage.setItem('wireman_supabase_url', url);
    localStorage.setItem('wireman_supabase_key', key);
    triggerInitialSync(url, key, currentUser?.id);
  };

  // Initial pull and merge function
  async function triggerInitialSync(url, key, userId = null) {
    if (!url || !key) {
      setSyncStatus('offline');
      return;
    }
    setSyncStatus('syncing');
    try {
      const { pullSyncData, pushSyncData, mergeCollection } = await import('./utils/syncService');
      const res = await pullSyncData(url, key, userId);
      
      if (res.success) {
        const remote = res.collections;
        
        // Merge and update companyProfile
        let mergedProfile = companyProfile;
        if (remote.companyProfile) {
          mergedProfile = remote.companyProfile.data;
          setCompanyProfile(mergedProfile);
          localStorage.setItem('wireman_company_profile', JSON.stringify(mergedProfile));
        } else {
          await pushSyncData(url, key, 'companyProfile', companyProfile, userId);
        }

        // Merge and update materials
        let localMaterials = JSON.parse(localStorage.getItem('wireman_materials') || '[]');
        if (localMaterials.length === 0) localMaterials = DEFAULT_MATERIALS;
        let mergedMaterials = localMaterials;
        if (remote.materials) {
          mergedMaterials = mergeCollection(localMaterials, remote.materials.data);
          setMaterials(mergedMaterials);
          localStorage.setItem('wireman_materials', JSON.stringify(mergedMaterials));
        } else {
          await pushSyncData(url, key, 'materials', mergedMaterials, userId);
        }

        // Merge and update clients
        let localClients = JSON.parse(localStorage.getItem('wireman_clients') || '[]');
        if (localClients.length === 0) localClients = DEFAULT_DEMO_CLIENTS;
        let mergedClients = localClients;
        if (remote.clients) {
          mergedClients = mergeCollection(localClients, remote.clients.data);
          setClients(mergedClients);
          localStorage.setItem('wireman_clients', JSON.stringify(mergedClients));
        } else {
          await pushSyncData(url, key, 'clients', mergedClients, userId);
        }

        // Merge and update invoices
        let localInvoices = JSON.parse(localStorage.getItem('wireman_invoices') || '[]');
        let mergedInvoices = localInvoices;
        if (remote.invoices) {
          mergedInvoices = mergeCollection(localInvoices, remote.invoices.data);
          setInvoices(mergedInvoices);
          localStorage.setItem('wireman_invoices', JSON.stringify(mergedInvoices));
        } else {
          await pushSyncData(url, key, 'invoices', mergedInvoices, userId);
        }

        // Merge and update quotations
        let localQuotations = JSON.parse(localStorage.getItem('wireman_quotations') || '[]');
        if (localQuotations.length === 0) localQuotations = [DEMO_QUOTATION];
        let mergedQuotations = localQuotations;
        if (remote.quotations) {
          mergedQuotations = mergeCollection(localQuotations, remote.quotations.data);
          setQuotations(mergedQuotations);
          localStorage.setItem('wireman_quotations', JSON.stringify(mergedQuotations));
        } else {
          await pushSyncData(url, key, 'quotations', mergedQuotations, userId);
        }

        // Merge and update estimates
        let localEstimates = JSON.parse(localStorage.getItem('wireman_estimates') || '[]');
        let mergedEstimates = localEstimates;
        if (remote.estimates) {
          mergedEstimates = mergeCollection(localEstimates, remote.estimates.data);
          setEstimates(mergedEstimates);
          localStorage.setItem('wireman_estimates', JSON.stringify(mergedEstimates));
        } else {
          await pushSyncData(url, key, 'estimates', mergedEstimates, userId);
        }

        setSyncStatus('synced');
      } else {
        console.error('Failed initial sync:', res.error);
        setSyncStatus('error');
      }
    } catch (err) {
      console.error('Initial sync exception:', err);
      setSyncStatus('error');
    }
  }

  // Helper to load credentials dynamically
  const getSupabaseCredentials = () => {
    const url = supabaseUrl || localStorage.getItem('wireman_supabase_url') || import.meta.env?.VITE_SUPABASE_URL || 'https://ivrmxblrjbnswhwjougt.supabase.co';
    const key = supabaseKey || localStorage.getItem('wireman_supabase_key') || import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cm14YmxyamJuc3dod2pvdWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjA1MTIsImV4cCI6MjA5ODc5NjUxMn0.V7dHk9xiCC6bxqKUhMQlMO8J-t8mVLHFOoXks5U2J1seyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cm14YmxyamJuc3dod2pvdWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjA1MTIsImV4cCI6MjA5ODc5NjUxMn0.V7dHk9xiCC6bxqKUhMQlMO8J-t8mVLHFOoXks5U2J1s';
    return { url, key };
  };

  // Auth Operations
  const handleLogin = async (email, password, customUrl = null, customKey = null) => {
    if (customUrl && customKey) {
      setSupabaseUrl(customUrl);
      setSupabaseKey(customKey);
      localStorage.setItem('wireman_supabase_url', customUrl);
      localStorage.setItem('wireman_supabase_key', customKey);
    }
    const creds = {
      url: customUrl || supabaseUrl || localStorage.getItem('wireman_supabase_url') || import.meta.env?.VITE_SUPABASE_URL || '',
      key: customKey || supabaseKey || localStorage.getItem('wireman_supabase_key') || import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_KEY || ''
    };
    if (!creds.url || !creds.key) {
      setAuthError('Supabase project URL and API key are not configured. Please enter them above.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const { signInUser } = await import('./utils/syncService');
      const res = await signInUser(creds.url, creds.key, email, password);
      if (res.success) {
        setCurrentUser(res.user);
        localStorage.setItem('wireman_supabase_session', JSON.stringify({
          user: res.user,
          session: res.session
        }));
        setIsAuthOpen(false);
        triggerInitialSync(creds.url, creds.key, res.user.id);
      } else {
        setAuthError(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } catch (err) {
      setAuthError(err.message || 'An unexpected error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (email, password, customUrl = null, customKey = null) => {
    if (customUrl && customKey) {
      setSupabaseUrl(customUrl);
      setSupabaseKey(customKey);
      localStorage.setItem('wireman_supabase_url', customUrl);
      localStorage.setItem('wireman_supabase_key', customKey);
    }
    const creds = {
      url: customUrl || supabaseUrl || localStorage.getItem('wireman_supabase_url') || import.meta.env?.VITE_SUPABASE_URL || '',
      key: customKey || supabaseKey || localStorage.getItem('wireman_supabase_key') || import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_KEY || ''
    };
    if (!creds.url || !creds.key) {
      setAuthError('Supabase project URL and API key are not configured. Please enter them above.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const { signUpUser } = await import('./utils/syncService');
      const res = await signUpUser(creds.url, creds.key, email, password);
      if (res.success) {
        setCurrentUser(res.user);
        localStorage.setItem('wireman_supabase_session', JSON.stringify({
          user: res.user,
          session: res.session
        }));
        setIsAuthOpen(false);
        triggerInitialSync(creds.url, creds.key, res.user.id);
      } else {
        setAuthError(res.error || 'Failed to register.');
      }
    } catch (err) {
      setAuthError(err.message || 'An unexpected error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = (customUrl = null, customKey = null) => {
    if (customUrl && customKey) {
      setSupabaseUrl(customUrl);
      setSupabaseKey(customKey);
      localStorage.setItem('wireman_supabase_url', customUrl);
      localStorage.setItem('wireman_supabase_key', customKey);
    }
    const creds = {
      url: customUrl || supabaseUrl || localStorage.getItem('wireman_supabase_url') || import.meta.env?.VITE_SUPABASE_URL || 'https://ivrmxblrjbnswhwjougt.supabase.co',
      key: customKey || supabaseKey || localStorage.getItem('wireman_supabase_key') || import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cm14YmxyamJuc3dod2pvdWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjA1MTIsImV4cCI6MjA5ODc5NjUxMn0.V7dHk9xiCC6bxqKUhMQlMO8J-t8mVLHFOoXks5U2J1seyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cm14YmxyamJuc3dod2pvdWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjA1MTIsImV4cCI6MjA5ODc5NjUxMn0.V7dHk9xiCC6bxqKUhMQlMO8J-t8mVLHFOoXks5U2J1s'
    };
    if (!creds.url || !creds.key) {
      setAuthError('Supabase project URL and API key are not configured.');
      return;
    }
    const redirectUrl = encodeURIComponent(window.location.origin);
    window.location.href = `${creds.url.replace(/\/$/, '')}/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}`;
  };

  const handleSignOut = async () => {
    const creds = getSupabaseCredentials();
    const sessionStr = localStorage.getItem('wireman_supabase_session');
    if (sessionStr && creds.url && creds.key) {
      try {
        const parsed = JSON.parse(sessionStr);
        const token = parsed.session?.access_token;
        if (token) {
          const { signOutUser } = await import('./utils/syncService');
          await signOutUser(creds.url, creds.key, token);
        }
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('wireman_supabase_session');
    setSyncStatus('offline');
  };

  // Load Initial Data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('wireman_company_profile');
    const savedMaterials = localStorage.getItem('wireman_materials');
    const savedClients = localStorage.getItem('wireman_clients');
    const savedInvoices = localStorage.getItem('wireman_invoices');
    const savedQuotations = localStorage.getItem('wireman_quotations');
    const savedEstimates = localStorage.getItem('wireman_estimates');
    const savedPrintHistory = localStorage.getItem('wireman_print_history');
    const savedDefaultTerms = localStorage.getItem('wireman_default_terms');

    if (savedProfile) setCompanyProfile(JSON.parse(savedProfile));
    if (savedMaterials) setMaterials(JSON.parse(savedMaterials));
    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedQuotations) setQuotations(JSON.parse(savedQuotations));
    if (savedEstimates) setEstimates(JSON.parse(savedEstimates));
    if (savedPrintHistory) setPrintHistory(JSON.parse(savedPrintHistory));
    if (savedDefaultTerms) setDefaultTerms(JSON.parse(savedDefaultTerms));

    const savedUrl = localStorage.getItem('wireman_supabase_url');
    const savedKey = localStorage.getItem('wireman_supabase_key');
    if (savedUrl) setSupabaseUrl(savedUrl);
    if (savedKey) setSupabaseKey(savedKey);
    
    // Check if there is an OAuth redirect hash in the URL (from Google Sign-In)
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const expiresAt = params.get('expires_at');
      
      if (accessToken) {
        const url = savedUrl || import.meta.env?.VITE_SUPABASE_URL || 'https://ivrmxblrjbnswhwjougt.supabase.co';
        const key = savedKey || import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cm14YmxyamJuc3dod2pvdWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjA1MTIsImV4cCI6MjA5ODc5NjUxMn0.V7dHk9xiCC6bxqKUhMQlMO8J-t8mVLHFOoXks5U2J1seyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cm14YmxyamJuc3dod2pvdWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjA1MTIsImV4cCI6MjA5ODc5NjUxMn0.V7dHk9xiCC6bxqKUhMQlMO8J-t8mVLHFOoXks5U2J1s';
        
        setAuthLoading(true);
        import('./utils/syncService').then(async ({ getUser }) => {
          const userRes = await getUser(url, key, accessToken);
          if (userRes.success) {
            const user = userRes.user;
            setCurrentUser(user);
            localStorage.setItem('wireman_supabase_session', JSON.stringify({
              user,
              session: {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_at: expiresAt
              }
            }));
            // Clean up URL hash cleanly
            window.history.replaceState(null, null, window.location.pathname);
            triggerInitialSync(url, key, user.id);
          } else {
            console.error('Failed to fetch user after OAuth:', userRes.error);
            setAuthError(userRes.error || 'Failed to authenticate Google user.');
            setIsAuthOpen(true);
          }
          setAuthLoading(false);
        }).catch(err => {
          console.error('Exception fetching user after OAuth:', err);
          setAuthError(err.message || 'Error processing Google session.');
          setIsAuthOpen(true);
          setAuthLoading(false);
        });
        return; // Skip loading standard saved session since we have a new active OAuth session
      }
    }

    // Load and verify auth session
    const savedSession = localStorage.getItem('wireman_supabase_session');
    let activeUserId = null;
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.user) {
          setCurrentUser(parsed.user);
          activeUserId = parsed.user.id;
        }
      } catch (err) {
        console.error('Failed to parse saved session:', err);
      }
    }

    const url = savedUrl || import.meta.env?.VITE_SUPABASE_URL || 'https://ivrmxblrjbnswhwjougt.supabase.co';
    const key = savedKey || import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cm14YmxyamJuc3dod2pvdWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjA1MTIsImV4cCI6MjA5ODc5NjUxMn0.V7dHk9xiCC6bxqKUhMQlMO8J-t8mVLHFOoXks5U2J1seyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cm14YmxyamJuc3dod2pvdWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjA1MTIsImV4cCI6MjA5ODc5NjUxMn0.V7dHk9xiCC6bxqKUhMQlMO8J-t8mVLHFOoXks5U2J1s';
    if (url && key) {
      triggerInitialSync(url, key, activeUserId);
    }
  }, []);

  // Synchronize browser page title dynamically for correct PDF filenames
  useEffect(() => {
    if (viewingDoc) {
      const clientName = (viewingDoc.clientInfo?.name || 'client')
        .toLowerCase()
        .trim();
      const docTypeLabel = viewingDoc.docType.toLowerCase();
      window.document.title = `${clientName} ${docTypeLabel}`;
    } else {
      window.document.title = "Hansa Electrical - Billing & Point Estimation Portal";
    }
  }, [viewingDoc]);

  // Save changes helper
  const saveToStorage = (key, data, setter) => {
    setter(data);
    localStorage.setItem(key, JSON.stringify(data));

    // Map localStorage key to Supabase key
    let cloudKey = null;
    if (key === 'wireman_company_profile') cloudKey = 'companyProfile';
    if (key === 'wireman_materials') cloudKey = 'materials';
    if (key === 'wireman_clients') cloudKey = 'clients';
    if (key === 'wireman_invoices') cloudKey = 'invoices';
    if (key === 'wireman_quotations') cloudKey = 'quotations';
    if (key === 'wireman_estimates') cloudKey = 'estimates';
    
    if (cloudKey) {
      syncToCloud(cloudKey, data);
    }
  };

  // Document Operations
  const handleSaveDocument = (doc) => {
    if (doc.docType === 'Invoice') {
      let updatedInvoices;
      if (editingDoc) {
        updatedInvoices = invoices.map(i => i.id === doc.id ? doc : i);
      } else {
        updatedInvoices = [doc, ...invoices];
      }
      saveToStorage('wireman_invoices', updatedInvoices, setInvoices);
    } else {
      let updatedQuotations;
      if (editingDoc) {
        updatedQuotations = quotations.map(q => q.id === doc.id ? doc : q);
      } else {
        updatedQuotations = [doc, ...quotations];
      }
      saveToStorage('wireman_quotations', updatedQuotations, setQuotations);
    }

    // Auto-save client if not already in clients list
    const clientExists = clients.some(c => c.name.toLowerCase() === doc.clientInfo.name.toLowerCase());
    if (!clientExists && doc.clientInfo.name.trim()) {
      const newClient = {
        id: Date.now().toString(),
        name: doc.clientInfo.name,
        address: doc.clientInfo.address,
        state: doc.clientInfo.state,
        stateCode: doc.clientInfo.stateCode,
        gstin: doc.clientInfo.gstin,
        city: doc.clientInfo.address.split(',')[1]?.trim() || 'Ahmedabad'
      };
      saveToStorage('wireman_clients', [...clients, newClient], setClients);
    }

    setEditingDoc(null);
    setCreatingDocType(null);
    setEstimatorPreload(null);
    setViewingDoc(doc); // Switch to print preview after saving!
  };

  const handleDeleteDocument = (id, type) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'Invoice') {
        const filtered = invoices.filter(i => i.id !== id);
        saveToStorage('wireman_invoices', filtered, setInvoices);
      } else {
        const filtered = quotations.filter(q => q.id !== id);
        saveToStorage('wireman_quotations', filtered, setQuotations);
      }
    }
  };

  // Pre-load next document number
  const getNextDocumentNumber = (type) => {
    const arr = type === 'Invoice' ? invoices : quotations;
    if (arr.length === 0) return 1;
    const nums = arr.map(d => Number(d.docNumber) || 0);
    return Math.max(...nums) + 1;
  };

  // Convert Point Estimate to Quotation
  const handleConvertEstimateToQuote = (estData) => {
    const nextNum = getNextDocumentNumber('Quotation');
    const newPreload = {
      docType: 'Quotation',
      docNumber: nextNum,
      date: new Date().toISOString().split('T')[0],
      clientInfo: {
        name: estData.clientName || '',
        address: '',
        state: 'Gujarat',
        stateCode: '24',
        gstin: 'URP'
      },
      items: estData.items
    };
    
    setEstimatorPreload(newPreload);
    setCreatingDocType('Quotation');
    setCurrentTab('invoices');
  };

  // Material Operations
  const handleAddMaterial = (item) => {
    saveToStorage('wireman_materials', [...materials, item], setMaterials);
  };
  const handleUpdateMaterial = (item) => {
    const updated = materials.map(m => m.id === item.id ? item : m);
    saveToStorage('wireman_materials', updated, setMaterials);
  };
  const handleDeleteMaterial = (id) => {
    const updated = materials.filter(m => m.id !== id);
    saveToStorage('wireman_materials', updated, setMaterials);
  };

  // Client Operations
  const handleAddClient = (client) => {
    saveToStorage('wireman_clients', [...clients, client], setClients);
  };
  const handleUpdateClient = (client) => {
    const updated = clients.map(c => c.id === client.id ? client : c);
    saveToStorage('wireman_clients', updated, setClients);
  };
  const handleDeleteClient = (id) => {
    const updated = clients.filter(c => c.id !== id);
    saveToStorage('wireman_clients', updated, setClients);
  };

  // Settings profile save
  const handleSaveProfile = (profile) => {
    saveToStorage('wireman_company_profile', profile, setCompanyProfile);
  };

  // Log Print History
  const handleLogPrint = (doc) => {
    const newEntry = {
      id: Date.now().toString(),
      docId: doc.id,
      docNumber: doc.docNumber,
      docType: doc.docType,
      clientName: doc.clientInfo?.name || 'Walk-in Client',
      grandTotal: doc.grandTotal,
      timestamp: new Date().toISOString()
    };
    const updated = [newEntry, ...printHistory].slice(0, 50);
    saveToStorage('wireman_print_history', updated, setPrintHistory);
  };

  // Backup Import & Export
  const handleExportData = () => {
    const dataStr = JSON.stringify({
      companyProfile,
      materials,
      clients,
      invoices,
      quotations,
      estimates
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `hansa_electrical_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = window.document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (backupData) => {
    if (backupData.companyProfile) saveToStorage('wireman_company_profile', backupData.companyProfile, setCompanyProfile);
    if (backupData.materials) saveToStorage('wireman_materials', backupData.materials, setMaterials);
    if (backupData.clients) saveToStorage('wireman_clients', backupData.clients, setClients);
    if (backupData.invoices) saveToStorage('wireman_invoices', backupData.invoices, setInvoices);
    if (backupData.quotations) saveToStorage('wireman_quotations', backupData.quotations, setQuotations);
    if (backupData.estimates) saveToStorage('wireman_estimates', backupData.estimates, setEstimates);
  };

  // Main navigation render
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            invoices={invoices}
            quotations={quotations}
            estimates={estimates}
            printHistory={printHistory}
            onClearHistory={() => saveToStorage('wireman_print_history', [], setPrintHistory)}
            onCreateNew={(type) => {
              setEditingDoc(null);
              setEstimatorPreload(null);
              setCreatingDocType(type);
            }}
            onEditDoc={(doc) => {
              setEditingDoc(doc);
              setCreatingDocType(doc.docType);
            }}
            onDeleteDoc={handleDeleteDocument}
            onViewDoc={(doc) => setViewingDoc(doc)}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'estimator':
        return (
          <Estimator 
            defaultPointRates={DEFAULT_POINT_RATES}
            onConvertToQuote={handleConvertEstimateToQuote}
          />
        );
      case 'invoices':
        return (
          <div>
            {/* Direct list of documents if not creating/editing/viewing */}
            <div className="no-print page-header">
              <div>
                <h1 className="page-title">Quotations & GST Invoices</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review past transactions or generate new billing records.</p>
              </div>
              <div className="page-actions">
                <button 
                  onClick={() => {
                    setEditingDoc(null);
                    setEstimatorPreload(null);
                    setCreatingDocType('Quotation');
                  }} 
                  className="btn btn-accent"
                >
                  Create Quote
                </button>
                <button 
                  onClick={() => {
                    setEditingDoc(null);
                    setEstimatorPreload(null);
                    setCreatingDocType('Invoice');
                  }} 
                  className="btn btn-primary"
                >
                  Create Invoice
                </button>
              </div>
            </div>

            <div className="no-print card" style={{ padding: '0.5rem 0' }}>
              {/* Combine and render document items list */}
              <Dashboard 
                invoices={invoices}
                quotations={quotations}
                estimates={estimates}
                printHistory={printHistory}
                onClearHistory={() => saveToStorage('wireman_print_history', [], setPrintHistory)}
                onCreateNew={(type) => {
                  setEditingDoc(null);
                  setEstimatorPreload(null);
                  setCreatingDocType(type);
                }}
                onEditDoc={(doc) => {
                  setEditingDoc(doc);
                  setCreatingDocType(doc.docType);
                }}
                onDeleteDoc={handleDeleteDocument}
                onViewDoc={(doc) => setViewingDoc(doc)}
                setCurrentTab={setCurrentTab}
              />
            </div>
          </div>
        );
      case 'clients':
        return (
          <ClientList 
            clients={clients}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        );
      case 'inventory':
        return (
          <InventoryList 
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onDeleteMaterial={handleDeleteMaterial}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            companyProfile={companyProfile}
            onSaveProfile={handleSaveProfile}
            onExportData={handleExportData}
            onImportData={handleImportData}
            defaultTerms={defaultTerms}
            onSaveDefaultTerms={(terms) => saveToStorage('wireman_default_terms', terms, setDefaultTerms)}
            supabaseUrl={supabaseUrl}
            supabaseKey={supabaseKey}
            onSaveSyncCredentials={handleSaveSyncCredentials}
            syncStatus={syncStatus}
            currentUser={currentUser}
            onOpenAuth={() => { setIsAuthOpen(true); setAuthError(''); }}
            onSignOut={handleSignOut}
            onTriggerSync={() => { const creds = getSupabaseCredentials(); triggerInitialSync(creds.url, creds.key, currentUser?.id); }}
          />
        );
      default:
        return <div>Tab not found</div>;
    }
  };

  // If in Print Preview mode
  if (viewingDoc) {
    return (
      <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '20px 0' }}>
        {/* Back control shown on screen only */}
        <div className="no-print" style={{ maxWidth: '850px', margin: '0 auto 15px auto', display: 'flex', justifyContent: 'flex-start' }}>
          <button 
            onClick={() => setViewingDoc(null)} 
            className="btn btn-secondary"
            style={{ fontWeight: 600 }}
          >
            ← Back to Dashboard
          </button>
        </div>

        <InvoicePrint 
          document={viewingDoc} 
          companyProfile={companyProfile} 
          onPrint={handleLogPrint}
        />
      </div>
    );
  }

  // If in Create / Edit mode
  if (creatingDocType) {
    // Generate next doc number
    const nextNum = editingDoc ? editingDoc.docNumber : getNextDocumentNumber(creatingDocType);
    
    // Construct preloaded mock if there is estimatorPreload
    let formPreload = editingDoc;
    if (!editingDoc && estimatorPreload && estimatorPreload.docType === creatingDocType) {
      formPreload = estimatorPreload;
    } else if (!editingDoc) {
      formPreload = {
        docType: creatingDocType,
        docNumber: nextNum,
        date: new Date().toISOString().split('T')[0],
        validityDate: '',
        status: creatingDocType === 'Invoice' ? 'Sent' : 'Draft',
        clientInfo: { name: '', address: '', state: 'Gujarat', stateCode: '24', gstin: 'URP' },
        items: [{ name: '', qty: 1, unit: 'NOS', rate: 0 }],
        terms: defaultTerms
      };
    }

    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <InvoiceForm 
          documentToEdit={formPreload}
          materials={materials}
          clients={clients}
          defaultTerms={defaultTerms}
          companyProfile={companyProfile}
          onSave={handleSaveDocument}
          onCancel={() => {
            setEditingDoc(null);
            setCreatingDocType(null);
            setEstimatorPreload(null);
          }}
        />
      </div>
    );
  }

  return (
    <>
      <Layout 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab}
        companyName={companyProfile.name}
        syncStatus={syncStatus}
        currentUser={currentUser}
        onOpenAuth={() => { setIsAuthOpen(true); setAuthError(''); }}
        onSignOut={handleSignOut}
      >
        {renderTabContent()}
      </Layout>
      <Auth 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
        error={authError}
        loading={authLoading}
        supabaseUrl={supabaseUrl}
        supabaseKey={supabaseKey}
      />
    </>
  );
}
