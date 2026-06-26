import React, { useState } from 'react';
import { Zap, FileText, Plus, Trash2, ArrowRight } from 'lucide-react';

export default function Estimator({ 
  defaultPointRates = [], 
  onConvertToQuote 
}) {
  const [estimateName, setEstimateName] = useState('New Wiring Estimation');
  const [clientName, setClientName] = useState('');
  const [points, setPoints] = useState(
    defaultPointRates.map(p => ({
      ...p,
      qty: 0 // Start with 0 quantity
    }))
  );

  // Custom added point types
  const handleQtyChange = (index, val) => {
    const newPoints = [...points];
    newPoints[index].qty = Math.max(0, Number(val) || 0);
    setPoints(newPoints);
  };

  const handleRateChange = (index, field, val) => {
    const newPoints = [...points];
    newPoints[index][field] = Math.max(0, Number(val) || 0);
    setPoints(newPoints);
  };

  const addCustomPoint = () => {
    setPoints([
      ...points,
      {
        id: 'custom-' + Date.now(),
        name: 'Custom Service Point',
        laborRate: 150,
        materialRate: 200,
        unit: 'POINT',
        qty: 1
      }
    ]);
  };

  const removePoint = (index) => {
    setPoints(points.filter((_, i) => i !== index));
  };

  const handlePointNameChange = (index, val) => {
    const newPoints = [...points];
    newPoints[index].name = val;
    setPoints(newPoints);
  };

  // Calculations
  const activePoints = points.filter(p => p.qty > 0);
  const totalLaborCost = activePoints.reduce((sum, p) => sum + (p.qty * p.laborRate), 0);
  const totalMaterialCost = activePoints.reduce((sum, p) => sum + (p.qty * p.materialRate), 0);
  const grandTotalCost = totalLaborCost + totalMaterialCost;

  // Handle Export to Quotation
  const handleExport = () => {
    if (activePoints.length === 0) {
      alert("Please add quantities to at least one electrical point before generating a quotation.");
      return;
    }

    // Convert points to quote line items
    const items = activePoints.map(p => {
      const combinedRate = p.laborRate + p.materialRate;
      return {
        name: `${p.name} (Labor & Material Included)`,
        qty: p.qty,
        unit: p.unit || 'NOS',
        rate: combinedRate
      };
    });

    onConvertToQuote({
      clientName: clientName,
      items: items,
      name: estimateName
    });
  };

  return (
    <div className="no-print">
      <div className="page-header">
        <div>
          <h1 className="page-title">Labor & Material Point Estimator</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Quickly calculate domestic and commercial electrical contract works based on points.</p>
        </div>
      </div>

      <div className="estimator-layout">
        {/* Estimator Form Column */}
        <div>
          {/* Header Form */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Estimate Name / Job Reference</label>
                <input
                  type="text"
                  value={estimateName}
                  onChange={(e) => setEstimateName(e.target.value)}
                  className="form-control"
                  placeholder="e.g. 3 BHK House Wiring"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Client Name (Optional)</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="form-control"
                  placeholder="e.g. Nishantbhai Sharma"
                />
              </div>
            </div>
          </div>

          {/* Points Rates Table */}
          <div className="card">
            <div className="card-title">
              <span>Electrical Point Quantities</span>
              <button onClick={addCustomPoint} className="btn btn-secondary btn-sm">
                + Add Custom Point Type
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Point description</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>QTY</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Labor (₹)</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Material (₹)</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Total Rate (₹)</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Total (₹)</th>
                    <th style={{ width: '60px', textAlign: 'right' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((p, index) => {
                    const isCustom = p.id.toString().startsWith('custom-');
                    const combinedRate = (p.laborRate || 0) + (p.materialRate || 0);
                    const rowTotal = p.qty * combinedRate;

                    return (
                      <tr key={p.id} style={{ backgroundColor: p.qty > 0 ? 'var(--primary-light)' : 'transparent' }}>
                        <td>
                          {isCustom ? (
                            <input
                              type="text"
                              value={p.name}
                              onChange={(e) => handlePointNameChange(index, e.target.value)}
                              className="form-control"
                              style={{ fontWeight: 500, fontSize: '0.85rem' }}
                            />
                          ) : (
                            <span style={{ fontWeight: p.qty > 0 ? 600 : 500 }}>{p.name}</span>
                          )}
                          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Unit: {p.unit}</span>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={p.qty === 0 ? '' : p.qty}
                            onChange={(e) => handleQtyChange(index, e.target.value)}
                            className="form-control"
                            style={{ textAlign: 'center', fontWeight: p.qty > 0 ? 'bold' : 'normal' }}
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={p.laborRate}
                            onChange={(e) => handleRateChange(index, 'laborRate', e.target.value)}
                            className="form-control"
                            style={{ textAlign: 'right', fontSize: '0.8rem' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={p.materialRate}
                            onChange={(e) => handleRateChange(index, 'materialRate', e.target.value)}
                            className="form-control"
                            style={{ textAlign: 'right', fontSize: '0.8rem' }}
                          />
                        </td>
                        <td style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          ₹{combinedRate.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.85rem' }}>
                          ₹{rowTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => removePoint(index)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px', color: 'var(--danger)', border: 'none' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Estimation Summary Box Sidebar */}
        <div className="card" style={{ position: 'sticky', top: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} style={{ color: 'var(--accent-hover)' }} /> Estimate Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total labor cost</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                ₹ {totalLaborCost.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total material cost</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                ₹ {totalMaterialCost.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>GRAND TOTAL ESTIMATE</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
              ₹ {grandTotalCost.toLocaleString('en-IN')}.00
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({activePoints.length} Point types active)</span>
          </div>

          <button 
            onClick={handleExport} 
            disabled={activePoints.length === 0}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
          >
            Convert to Quotation <ArrowRight size={16} />
          </button>
          
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center', lineHeight: '1.3' }}>
            Compiles labor and material values into editable quotation line items.
          </div>
        </div>
      </div>
    </div>
  );
}
