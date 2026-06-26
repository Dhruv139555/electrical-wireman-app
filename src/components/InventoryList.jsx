import React, { useState } from 'react';
import { Layers, Plus, Edit3, Trash2, Save, X, Search } from 'lucide-react';

export default function InventoryList({ 
  materials = [], 
  onAddMaterial, 
  onUpdateMaterial, 
  onDeleteMaterial 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  // Form states for Add/Edit
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('NOS');
  const [rate, setRate] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);

  // Filter materials
  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setUnit(item.unit);
    setRate(item.rate);
  };

  const cancelEdit = () => {
    setEditingId(null);
    clearForm();
  };

  const clearForm = () => {
    setName('');
    setUnit('NOS');
    setRate('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      onUpdateMaterial({
        id: editingId,
        name,
        unit,
        rate: Number(rate) || 0
      });
      setEditingId(null);
    } else {
      onAddMaterial({
        id: Date.now().toString(),
        name,
        unit,
        rate: Number(rate) || 0
      });
      setShowAddForm(false);
    }
    clearForm();
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this item from your materials database?")) {
      onDeleteMaterial(id);
    }
  };

  return (
    <div className="no-print">
      <div className="page-header">
        <div>
          <h1 className="page-title">Material Inventory & Price List</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Configure preset pricing for common electrical fittings and wires.</p>
        </div>
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
            <Plus size={16} /> Add Material
          </button>
        )}
      </div>

      {/* Add New Material Form Card */}
      {showAddForm && (
        <div className="card" style={{ border: '1px solid var(--primary)', backgroundColor: 'var(--primary-light)' }}>
          <div className="card-title">Add New Material Item</div>
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Material Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  placeholder="e.g. PolyCab 1.5mm Wire"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Billing Unit</label>
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="form-control"
                  placeholder="NOS, MTR, SET, etc."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Standard Rate (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="form-control"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" onClick={() => { setShowAddForm(false); clearForm(); }} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Material List Table */}
      <div className="card">
        <div className="card-title">
          <span>Preset Pricing Directory ({materials.length} items)</span>
          
          <div style={{ position: 'relative', width: '250px' }}>
            <input
              type="text"
              placeholder="Search materials..."
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

        {filteredMaterials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Layers size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No material items found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Material / Product Name</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Billing Unit</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Standard Rate (₹)</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((item) => {
                  const isEditing = editingId === item.id;
                  
                  if (isEditing) {
                    return (
                      <tr key={item.id} style={{ backgroundColor: '#fffbeb' }}>
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
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="form-control"
                            style={{ padding: '4px 8px', fontSize: '0.85rem', textAlign: 'center' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="any"
                            required
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            className="form-control"
                            style={{ padding: '4px 8px', fontSize: '0.85rem', textAlign: 'right' }}
                          />
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
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
                          {item.unit}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        ₹ {Number(item.rate).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => startEdit(item)} 
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px' }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)} 
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
