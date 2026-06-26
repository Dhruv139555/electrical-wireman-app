import React, { useState } from 'react';
import { Users, Plus, Edit3, Trash2, Save, X, Search } from 'lucide-react';

export default function ClientList({ 
  clients = [], 
  onAddClient, 
  onUpdateClient, 
  onDeleteClient 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Gujarat');
  const [stateCode, setStateCode] = useState('24');
  const [gstin, setGstin] = useState('URP');
  const [city, setCity] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);

  // Filter clients
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEdit = (client) => {
    setEditingId(client.id);
    setName(client.name);
    setAddress(client.address);
    setState(client.state || 'Gujarat');
    setStateCode(client.stateCode || '24');
    setGstin(client.gstin || 'URP');
    setCity(client.city || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    clearForm();
  };

  const clearForm = () => {
    setName('');
    setAddress('');
    setState('Gujarat');
    setStateCode('24');
    setGstin('URP');
    setCity('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parts = address.split(',');
    let inferredCity = city;
    if (!city && parts.length > 1) {
      inferredCity = parts[parts.length - 2].trim(); // Guess city from address e.g. "Ahmedabad"
    }

    const clientData = {
      id: editingId || Date.now().toString(),
      name,
      address,
      state,
      stateCode,
      gstin,
      city: inferredCity || 'Ahmedabad'
    };

    if (editingId) {
      onUpdateClient(clientData);
      setEditingId(null);
    } else {
      onAddClient(clientData);
      setShowAddForm(false);
    }
    clearForm();
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this client from your records?")) {
      onDeleteClient(id);
    }
  };

  return (
    <div className="no-print">
      <div className="page-header">
        <div>
          <h1 className="page-title">Client Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage saved customer contact, billing, and tax details.</p>
        </div>
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
            <Plus size={16} /> Add Client
          </button>
        )}
      </div>

      {/* Add New Client Form Card */}
      {showAddForm && (
        <div className="card" style={{ border: '1px solid var(--primary)', backgroundColor: 'var(--primary-light)' }}>
          <div className="card-title">Add New Client Account</div>
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Client Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  placeholder="e.g. Nishantbhai Sharma"
                />
              </div>
              <div className="form-group">
                <label className="form-label">GSTIN / Registration</label>
                <input
                  type="text"
                  required
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="form-control"
                  placeholder="e.g. URP or 24XXXXXXXXXXXXX"
                />
              </div>
              <div className="form-group">
                <label className="form-label">City Name (Optional)</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-control"
                  placeholder="e.g. Ahmedabad"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Full Address *</label>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-control"
                rows="2"
                placeholder="e.g. Isanpur, Ahmedabad, Gujarat, 382440"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">State</label>
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

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button type="button" onClick={() => { setShowAddForm(false); clearForm(); }} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Save Client
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Clients Table */}
      <div className="card">
        <div className="card-title">
          <span>Client Database ({clients.length} accounts)</span>
          
          <div style={{ position: 'relative', width: '250px' }}>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.8rem' }}
            />
            <Search 
              size={14} 
              style={{ 
                position: 'absolute', 
                left: '10px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)' 
              }} 
            />
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No client records found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Client name</th>
                  <th>GSTIN</th>
                  <th>Billing Address</th>
                  <th>State Details</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const isEditing = editingId === client.id;

                  if (isEditing) {
                    return (
                      <tr key={client.id} style={{ backgroundColor: '#fffbeb' }}>
                        <td>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-control"
                            style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            required
                            value={gstin}
                            onChange={(e) => setGstin(e.target.value)}
                            className="form-control"
                            style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                          />
                        </td>
                        <td>
                          <textarea
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="form-control"
                            rows="2"
                            style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <input
                              type="text"
                              required
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              className="form-control"
                              style={{ padding: '4px 8px', fontSize: '0.8rem', width: '80px' }}
                            />
                            <input
                              type="text"
                              required
                              value={stateCode}
                              onChange={(e) => setStateCode(e.target.value)}
                              className="form-control"
                              style={{ padding: '4px 8px', fontSize: '0.8rem', width: '50px' }}
                            />
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button onClick={handleSave} className="btn btn-primary btn-sm" style={{ padding: '4px 8px' }}>
                              <Save size={13} />
                            </button>
                            <button onClick={cancelEdit} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                              <X size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={client.id}>
                      <td>
                        <strong style={{ fontSize: '0.95rem' }}>{client.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>City: {client.city}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                          {client.gstin}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
                        {client.address}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div>{client.state}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>Code: {client.stateCode}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => startEdit(client)} 
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px' }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(client.id)} 
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', color: 'var(--danger)' }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
