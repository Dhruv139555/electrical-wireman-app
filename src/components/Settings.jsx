import { Save, Download, Upload, AlertCircle, FileText } from 'lucide-react';

export default function SettingsView({ 
  companyProfile = {}, 
  onSaveProfile,
  onImportData,
  onExportData,
  defaultTerms = [],
  onSaveDefaultTerms,
  // Sync settings props
  supabaseUrl = '',
  supabaseKey = '',
  onSaveSyncCredentials,
  deviceId = '',
  onTriggerSync
}) {
  // Company state
  const [name, setName] = useState(companyProfile.name || '');
  const [address, setAddress] = useState(companyProfile.address || '');
  const [phone, setPhone] = useState(companyProfile.phone || '');
  const [email, setEmail] = useState(companyProfile.email || '');
  const [pan, setPan] = useState(companyProfile.pan || '');
  const [gstin, setGstin] = useState(companyProfile.gstin || '');
  const [bankName, setBankName] = useState(companyProfile.bankName || '');
  const [bankAcc, setBankAcc] = useState(companyProfile.bankAcc || '');
  const [bankIfsc, setBankIfsc] = useState(companyProfile.bankIfsc || '');
  const [bankBranch, setBankBranch] = useState(companyProfile.bankBranch || '');
  const [state, setState] = useState(companyProfile.state || 'Gujarat');
  const [stateCode, setStateCode] = useState(companyProfile.stateCode || '24');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [localTerms, setLocalTerms] = useState(defaultTerms || []);

  // Sync state variables
  const [syncUrl, setSyncUrl] = useState(supabaseUrl);
  const [syncKey, setSyncKey] = useState(supabaseKey);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    setSyncUrl(supabaseUrl);
    setSyncKey(supabaseKey);
  }, [supabaseUrl, supabaseKey]);

  const handleTestConnection = async () => {
    if (!syncUrl || !syncKey) return;
    setTestingConnection(true);
    setTestResult(null);
    try {
      const { testSyncConnection } = await import('../utils/syncService');
      const res = await testSyncConnection(syncUrl, syncKey);
      setTestingConnection(false);
      if (res.success) {
        setTestResult({ success: true, message: 'Connection successful! Table "wireman_sync" is ready.' });
      } else {
        setTestResult({ success: false, message: `Connection failed: ${res.error}` });
      }
    } catch (err) {
      setTestingConnection(false);
      setTestResult({ success: false, message: `Connection failed: ${err.message}` });
    }
  };

  const handleSaveSync = () => {
    onSaveSyncCredentials(syncUrl, syncKey);
    setMessage('Supabase credentials saved successfully! Syncing database...');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleTermChange = (index, value) => {
    const updated = [...localTerms];
    updated[index] = value;
    setLocalTerms(updated);
  };

  const handleAddTerm = () => {
    setLocalTerms([...localTerms, '']);
  };

  const handleRemoveTerm = (index) => {
    setLocalTerms(localTerms.filter((_, i) => i !== index));
  };

  const handleSaveTerms = () => {
    onSaveDefaultTerms(localTerms.filter(t => t.trim() !== ''));
    setMessage('Default terms & conditions saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile({
      name,
      address,
      phone,
      email,
      pan,
      gstin,
      bankName,
      bankAcc,
      bankIfsc,
      bankBranch,
      state,
      stateCode
    });
    setMessage('Company profile saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleFileUpload = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (confirm("Importing this backup will merge or overwrite your current settings, documents, and clients list. Do you want to continue?")) {
          onImportData(parsed);
          setMessage('Backup imported successfully!');
          setTimeout(() => setMessage(''), 4000);
        }
      } catch {
        setError('Failed to parse backup file. Please make sure it is a valid JSON backup.');
        setTimeout(() => setError(''), 4000);
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <div className="no-print">
      <div className="page-header">
        <div>
          <h1 className="page-title">Business Settings & Profile</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Configure business metadata, PAN details, bank accounts, and backup data.</p>
        </div>
      </div>

      {message && (
        <div style={{ backgroundColor: '#ecfdf5', color: 'var(--success)', border: '1px solid #10b981', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fef2f2', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div className="estimator-layout" style={{ gridTemplateColumns: '2fr 1.2fr' }}>
        {/* Profile Card */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.25rem' }}>
            Company Billing Information
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">Agency / Business Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  placeholder="e.g. HANSA ELECTRICAL"
                />
              </div>
              <div className="form-group">
                <label className="form-label">PAN Number</label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="form-control"
                  placeholder="e.g. EDZPS3115N"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Office / Billing Address *</label>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-control"
                rows="2"
                placeholder="Full address"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="form-control"
                  placeholder="If registered"
                />
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">Registered State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">State Code</label>
                <input
                  type="text"
                  required
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="form-control"
                  placeholder="Gujarat is 24"
                />
              </div>
            </div>

            <h4 style={{ margin: '1.5rem 0 1rem 0', paddingBottom: '0.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--primary)' }}>
              Bank Account Details (Printed on Invoices)
            </h4>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="form-control"
                  placeholder="e.g. State Bank of India"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Account Number</label>
                <input
                  type="text"
                  value={bankAcc}
                  onChange={(e) => setBankAcc(e.target.value)}
                  className="form-control"
                  placeholder="Account No."
                />
              </div>
              <div className="form-group">
                <label className="form-label">IFSC Code</label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  className="form-control"
                  placeholder="IFSC Code"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bank Branch</label>
                <input
                  type="text"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  className="form-control"
                  placeholder="Branch location"
                />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Business Profile
              </button>
            </div>
          </form>
        </div>

        {/* Data Management Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Default Terms & Conditions Configuration */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: 'var(--primary)' }} />
              Default Terms & Conditions
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              These terms will automatically populate when creating a new quotation or invoice.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
              {localTerms.map((term, index) => (
                <div key={index} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={term}
                    onChange={(e) => handleTermChange(index, e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.8rem', padding: '6px 10px', flexGrow: 1 }}
                    placeholder="Enter terms/condition rule..."
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemoveTerm(index)} 
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 10px', color: 'var(--danger)', border: '1px solid var(--border-color)' }}
                    title="Remove item"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {localTerms.length === 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem' }}>
                  No default terms added. Click below to add one.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <button 
                type="button" 
                onClick={handleAddTerm} 
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem' }}
              >
                + Add Term
              </button>
              <button 
                type="button" 
                onClick={handleSaveTerms} 
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.8rem' }}
              >
                Save Terms
              </button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Backup & Data Utility
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              All invoices, estimates, and customer lists are saved directly inside your browser cache (LocalStorage). Download a backup to protect against browser clears.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={onExportData} 
                className="btn btn-secondary"
                style={{ width: '100%', display: 'inline-flex', gap: '8px', justifyContent: 'center' }}
              >
                <Download size={14} /> Export Backup (JSON)
              </button>

              <label 
                className="btn btn-secondary"
                style={{ width: '100%', display: 'inline-flex', gap: '8px', justifyContent: 'center', cursor: 'pointer', margin: 0 }}
              >
                <Upload size={14} /> Import Backup (JSON)
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          {/* Cloud Sync Settings Card */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} style={{ color: 'var(--primary)' }} />
              Cloud Sync & Database Sync
            </h3>
            
            {(supabaseUrl && supabaseKey) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ 
                  backgroundColor: '#ecfdf5', 
                  border: '1px solid #a7f3d0', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <div style={{ 
                    backgroundColor: '#10b981', 
                    color: '#fff', 
                    borderRadius: '50%', 
                    width: '20px', 
                    height: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>✓</div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#065f46' }}>Database Sync Enabled</h4>
                    <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>
                      Device ID: <strong style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{deviceId}</strong>
                    </p>
                    <p style={{ fontSize: '0.7rem', color: '#065f46', marginTop: '4px' }}>
                      Data is backed up privately to your cloud database under this device's ID.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    onClick={onTriggerSync}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '0.8rem', display: 'inline-flex', gap: '6px', justifyContent: 'center' }}
                  >
                    Sync Now
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      onSaveSyncCredentials('', '');
                      setSyncUrl('');
                      setSyncKey('');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '0.8rem', display: 'inline-flex', gap: '6px', justifyContent: 'center', color: 'var(--danger)' }}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  By default, your data is saved only on this system. To enable automatic cloud backup and sync, expand the <strong>Advanced Database Settings</strong> below and connect a Supabase database.
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  System ID: <span style={{ fontFamily: 'monospace' }}>{deviceId}</span>
                </p>
              </div>
            )}

            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <details style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
                <summary style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                  Advanced Database Settings
                </summary>
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Provide a custom Supabase connection if you are self-hosting your database or running it without environment variables.
                  </p>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Supabase Project URL</label>
                    <input 
                      type="text" 
                      value={syncUrl} 
                      onChange={(e) => setSyncUrl(e.target.value)} 
                      className="form-control"
                      style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      placeholder="https://your-project.supabase.co"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Supabase Anon API Key</label>
                    <input 
                      type="password" 
                      value={syncKey} 
                      onChange={(e) => setSyncKey(e.target.value)} 
                      className="form-control"
                      style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    />
                  </div>

                  {testResult && (
                    <div style={{ 
                      padding: '8px 12px', 
                      borderRadius: '6px', 
                      fontSize: '0.75rem', 
                      backgroundColor: testResult.success ? '#ecfdf5' : '#fef2f2',
                      color: testResult.success ? '#065f46' : '#991b1b',
                      border: `1px solid ${testResult.success ? '#a7f3d0' : '#fca5a5'}`
                    }}>
                      {testResult.message}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                    <button 
                      type="button" 
                      onClick={handleTestConnection} 
                      disabled={testingConnection || !syncUrl || !syncKey}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem' }}
                    >
                      {testingConnection ? 'Testing...' : 'Test Connection'}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleSaveSync} 
                      disabled={!syncUrl || !syncKey}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Save & Connect
                    </button>
                  </div>
                  
                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <details style={{ fontSize: '0.75rem', cursor: 'pointer' }}>
                      <summary style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        How to setup Supabase? (SQL Script)
                      </summary>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        <p>1. Create a free project on <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>.</p>
                        <p>2. Open your project SQL Editor and run this query to create the sync table:</p>
                        <pre style={{ 
                          backgroundColor: 'var(--bg-app)', 
                          padding: '8px', 
                          borderRadius: '4px', 
                          fontSize: '0.65rem', 
                          overflowX: 'auto',
                          border: '1px solid var(--border-color)',
                          marginTop: '4px',
                          fontFamily: 'monospace',
                          cursor: 'text'
                        }} onClick={(e) => e.stopPropagation()}>
{`CREATE TABLE IF NOT EXISTS wireman_sync (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE wireman_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read write" ON wireman_sync
  FOR ALL USING (true) WITH CHECK (true);`}
                        </pre>
                        <p style={{ marginTop: '4px' }}>3. Copy the Project URL and Anon API key from Settings &gt; API and paste them above.</p>
                      </div>
                    </details>
                  </div>
                </div>
              </details>
            </div>
          </div>

          <div className="card" style={{ border: '1px solid #fed7aa', backgroundColor: '#fff7ed' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
              <AlertCircle size={16} /> Data Security Reminder
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#7c2d12', lineHeight: '1.4' }}>
              Clearing your browser's history or cookie cache may remove your electrical wireman documents if you clear site-data. It is recommended to perform a weekly JSON backup export!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
