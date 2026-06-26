import React, { useState } from 'react';
import { Settings, Save, Download, Upload, AlertCircle, FileText } from 'lucide-react';

export default function SettingsView({ 
  companyProfile = {}, 
  onSaveProfile,
  onImportData,
  onExportData,
  defaultTerms = [],
  onSaveDefaultTerms
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
      } catch (err) {
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
