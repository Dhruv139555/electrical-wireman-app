import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, X, Search } from 'lucide-react';
import { calculateGST, convertNumberToWords } from '../utils/helper';

export default function InvoiceForm({ 
  documentToEdit = null, 
  materials = [], 
  clients = [], 
  defaultTerms = [], 
  companyProfile = {},
  onSave, 
  onCancel 
}) {
  const [docType, setDocType] = useState('Quotation');
  const [docNumber, setDocNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validityDate, setValidityDate] = useState('');
  const [status, setStatus] = useState('Draft');

  // Client Info state
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientState, setClientState] = useState('Gujarat');
  const [clientStateCode, setClientStateCode] = useState('24');
  const [clientGstin, setClientGstin] = useState('URP');
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingState, setShippingState] = useState('Gujarat');
  const [shippingStateCode, setShippingStateCode] = useState('24');
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Autocomplete UI states
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  // Items table state
  const [items, setItems] = useState([
    { name: '', qty: 1, unit: 'NOS', rate: 0, showDropdown: false }
  ]);

  // Tax and totals state
  const [applyGst, setApplyGst] = useState(false);
  const [gstRate, setGstRate] = useState(18);
  const [taxableAmount, setTaxableAmount] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [amountInWords, setAmountInWords] = useState('');

  // Terms and conditions state
  const [terms, setTerms] = useState([]);

  // Pre-load data if editing
  useEffect(() => {
    if (documentToEdit) {
      setDocType(documentToEdit.docType || 'Quotation');
      setDocNumber(documentToEdit.docNumber || '');
      setDate(documentToEdit.date || '');
      setValidityDate(documentToEdit.validityDate || '');
      setStatus(documentToEdit.status || 'Draft');

      const c = documentToEdit.clientInfo || {};
      setClientName(c.name || '');
      setClientAddress(c.address || '');
      setClientState(c.state || 'Gujarat');
      setClientStateCode(c.stateCode || '24');
      setClientGstin(c.gstin || 'URP');
      setShippingName(c.shippingName || '');
      setShippingAddress(c.shippingAddress || '');
      setShippingState(c.shippingState || 'Gujarat');
      setShippingStateCode(c.shippingStateCode || '24');
      
      const isSame = c.address === c.shippingAddress && c.name === c.shippingName;
      setSameAsBilling(isSame);

      setItems(documentToEdit.items.map(item => ({ ...item, showDropdown: false })));
      setApplyGst(documentToEdit.totalTax > 0);
      setGstRate(documentToEdit.gstRate || 18);
      setTerms(documentToEdit.terms || []);
    } else {
      // Set default validity date (e.g. 1 month from now)
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setValidityDate(nextMonth.toISOString().split('T')[0]);
      setTerms([...defaultTerms]);
      
      // Auto-generate invoice/quotation number based on count in parent is handled in App.jsx,
      // but we will let App.jsx pass it down or we check it.
    }
  }, [documentToEdit, defaultTerms]);

  // Sync shipping address with billing if checked
  useEffect(() => {
    if (sameAsBilling) {
      setShippingName(clientName);
      setShippingAddress(clientAddress);
      setShippingState(clientState);
      setShippingStateCode(clientStateCode);
    }
  }, [sameAsBilling, clientName, clientAddress, clientState, clientStateCode]);

  // Recalculate totals whenever items, applyGst, or clientStateCode changes
  useEffect(() => {
    // Calculate taxable amount (subtotal)
    const subtotal = items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.rate || 0)), 0);
    setTaxableAmount(subtotal);

    // Determine state comparison
    const businessStateCode = companyProfile.stateCode || '24';
    const isInterState = clientStateCode !== businessStateCode;

    if (applyGst && subtotal > 0) {
      const taxResults = calculateGST({
        taxableAmount: subtotal,
        isInterState,
        gstRate
      });

      setCgst(taxResults.cgst);
      setSgst(taxResults.sgst);
      setIgst(taxResults.igst);
      setTotalTax(taxResults.totalTax);
      setGrandTotal(taxResults.grandTotal);
      setRoundOff(taxResults.roundOff);
    } else {
      setCgst(0);
      setSgst(0);
      setIgst(0);
      setTotalTax(0);
      const rounded = Math.round(subtotal);
      setGrandTotal(rounded);
      setRoundOff(Number((rounded - subtotal).toFixed(2)));
    }
  }, [items, applyGst, gstRate, clientStateCode, companyProfile]);

  // Convert grandTotal to words
  useEffect(() => {
    setAmountInWords(convertNumberToWords(grandTotal));
  }, [grandTotal]);

  // Toggle document type resets defaults
  const handleDocTypeChange = (type) => {
    setDocType(type);
    if (type === 'Invoice') {
      setApplyGst(true);
      setStatus('Sent');
    } else {
      setApplyGst(false);
      setStatus('Draft');
    }
  };

  // Client Selection autocomplete
  const handleSelectClient = (client) => {
    setClientName(client.name);
    setClientAddress(client.address);
    setClientState(client.state || 'Gujarat');
    setClientStateCode(client.stateCode || '24');
    setClientGstin(client.gstin || 'URP');
    
    if (sameAsBilling) {
      setShippingName(client.name);
      setShippingAddress(client.address);
      setShippingState(client.state || 'Gujarat');
      setShippingStateCode(client.stateCode || '24');
    }
    
    setShowClientDropdown(false);
    setClientSearchQuery('');
  };

  // Items table operations
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSelectProduct = (index, prod) => {
    const newItems = [...items];
    newItems[index].name = prod.name;
    newItems[index].unit = prod.unit;
    newItems[index].rate = prod.rate;
    newItems[index].showDropdown = false;
    setItems(newItems);
  };

  const addRow = () => {
    setItems([...items, { name: '', qty: 1, unit: 'NOS', rate: 0, showDropdown: false }]);
  };

  const removeRow = (index) => {
    if (items.length === 1) {
      setItems([{ name: '', qty: 1, unit: 'NOS', rate: 0, showDropdown: false }]);
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const moveRowUp = (index) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    setItems(newItems);
  };

  const moveRowDown = (index) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    setItems(newItems);
  };

  // Terms and conditions operations
  const handleTermChange = (index, value) => {
    const newTerms = [...terms];
    newTerms[index] = value;
    setTerms(newTerms);
  };

  const addTerm = () => {
    setTerms([...terms, '']);
  };

  const removeTerm = (index) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  // Save submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert("Please enter a client name.");
      return;
    }

    const validItems = items.filter(item => item.name.trim() !== '');
    if (validItems.length === 0) {
      alert("Please add at least one valid product line item.");
      return;
    }

    const documentData = {
      id: documentToEdit ? documentToEdit.id : Date.now().toString(),
      docType,
      docNumber: Number(docNumber) || Date.now() % 10000,
      date,
      validityDate,
      status,
      clientInfo: {
        name: clientName,
        address: clientAddress,
        state: clientState,
        stateCode: clientStateCode,
        gstin: clientGstin,
        shippingName,
        shippingAddress,
        shippingState,
        shippingStateCode
      },
      items: validItems.map(item => ({
        name: item.name,
        qty: Number(item.qty),
        unit: item.unit,
        rate: Number(item.rate)
      })),
      taxableAmount,
      cgst,
      sgst,
      igst,
      totalTax,
      roundOff,
      grandTotal,
      gstRate: applyGst ? gstRate : 0,
      amountInWords,
      terms: terms.filter(t => t.trim() !== '')
    };

    onSave(documentData);
  };

  // Filter client choices based on search
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  return (
    <div className="card">
      <div className="page-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div>
          <h2 className="page-title">{documentToEdit ? 'Edit Document' : 'Create New Document'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fill in billing details, items list, and terms below.</p>
        </div>
        <button onClick={onCancel} className="btn btn-secondary btn-sm">
          <X size={14} /> Close
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Doc Type Selector */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span className="form-label" style={{ minWidth: '100px' }}>Document Type:</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDocTypeChange('Quotation')}
              className={`btn btn-sm ${docType === 'Quotation' ? 'btn-accent' : 'btn-secondary'}`}
            >
              Quotation
            </button>
            <button
              type="button"
              onClick={() => handleDocTypeChange('Invoice')}
              className={`btn btn-sm ${docType === 'Invoice' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Tax Invoice
            </button>
          </div>
        </div>

        {/* Top metadata grid */}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Document Number</label>
            <input
              type="number"
              required
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="form-control"
              placeholder="e.g. 1"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Issue Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label className="form-label">{docType === 'Invoice' ? 'Due Date' : 'Validity Date'}</label>
            <input
              type="date"
              required
              value={validityDate}
              onChange={(e) => setValidityDate(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Document Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-control"
            >
              {docType === 'Quotation' ? (
                <>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Approved">Approved</option>
                  <option value="Declined">Declined</option>
                </>
              ) : (
                <>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>
        </div>

        <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

        {/* Client details box */}
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Bill To Info */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', fontWeight: 600 }}>
              {docType === 'Invoice' ? 'Bill To (Client Details)' : 'Quotation For'}
            </h4>
            
            {/* Search Client */}
            <div className="form-group autocomplete-container" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">Search Client Directory</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Type to search saved client..."
                  value={clientSearchQuery}
                  onFocus={() => setShowClientDropdown(true)}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ paddingRight: '2rem' }}
                />
                <Search size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              </div>
              
              {showClientDropdown && clientSearchQuery && (
                <div className="autocomplete-dropdown">
                  {filteredClients.length === 0 ? (
                    <div style={{ padding: '8px', fontSize: '0.8rem', color: '#999' }}>No clients found</div>
                  ) : (
                    filteredClients.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => handleSelectClient(c)}
                        className="autocomplete-item"
                      >
                        <strong>{c.name}</strong> ({c.city}, {c.state})
                      </div>
                    ))
                  )}
                  <div 
                    onClick={() => setShowClientDropdown(false)}
                    style={{ padding: '6px 8px', borderTop: '1px solid #eee', fontSize: '0.75rem', color: 'var(--primary)', textAlign: 'right', cursor: 'pointer' }}
                  >
                    Close Dropdown
                  </div>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">Client Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="form-control"
                placeholder="e.g. Nishantbhai Sharma"
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">Billing Address</label>
              <textarea
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="form-control"
                rows="2"
                placeholder="e.g. Isanpur, Ahmedabad, Gujarat, 382440"
              />
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  value={clientState}
                  onChange={(e) => setClientState(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">State Code</label>
                <input
                  type="text"
                  value={clientStateCode}
                  onChange={(e) => setClientStateCode(e.target.value)}
                  className="form-control"
                  placeholder="Gujarat is 24"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Client GSTIN / Type</label>
              <input
                type="text"
                value={clientGstin}
                onChange={(e) => setClientGstin(e.target.value)}
                className="form-control"
                placeholder="e.g. URP or 24XXXXXXXXXXXXX"
              />
            </div>
          </div>

          {/* Ship To Info */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--primary)', fontWeight: 600 }}>Ship To (Site Address)</h4>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={sameAsBilling} 
                  onChange={(e) => setSameAsBilling(e.target.checked)} 
                />
                Same as Billing
              </label>
            </div>

            {!sameAsBilling && (
              <>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label">Recipient Name</label>
                  <input
                    type="text"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    className="form-control"
                    placeholder="e.g. Nishantbhai Sharma"
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label">Shipping Address</label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="form-control"
                    rows="2"
                    placeholder="e.g. Site Address"
                  />
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State Code</label>
                    <input
                      type="text"
                      value={shippingStateCode}
                      onChange={(e) => setShippingStateCode(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
              </>
            )}

            {sameAsBilling && (
              <div style={{ 
                border: '1px dashed var(--border-color)', 
                padding: '2rem', 
                borderRadius: '8px', 
                textAlign: 'center', 
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                height: 'calc(100% - 2.5rem)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                Shipping details are linked to billing details. Uncheck 'Same as Billing' to change.
              </div>
            )}
          </div>
        </div>

        <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

        {/* Line Items Table Editor */}
        <h4 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Billing Product Details</h4>
        <div className="billing-table-container">
          <table className="billing-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Name of Product *</th>
                <th style={{ width: '90px' }}>QTY</th>
                <th style={{ width: '90px' }}>Unit</th>
                <th style={{ width: '110px' }}>Rate (₹)</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Total (₹)</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                // Autocomplete product filter
                const filteredProds = materials.filter(m => 
                  m.name.toLowerCase().includes(item.name.toLowerCase())
                );

                return (
                  <tr key={index}>
                    <td style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>{index + 1}</td>
                    
                    {/* Product Autocomplete Cell */}
                    <td className="autocomplete-container">
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => {
                          handleItemChange(index, 'name', e.target.value);
                          handleItemChange(index, 'showDropdown', true);
                        }}
                        onFocus={() => handleItemChange(index, 'showDropdown', true)}
                        className="form-control"
                        placeholder="Type to search or write custom item..."
                      />

                      {item.showDropdown && item.name && (
                        <div className="autocomplete-dropdown">
                          {filteredProds.slice(0, 10).map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => handleSelectProduct(index, p)}
                              className="autocomplete-item"
                            >
                              {p.name} - <span style={{ color: '#888', fontSize: '0.75rem' }}>₹{p.rate} / {p.unit}</span>
                            </div>
                          ))}
                          <div 
                            onClick={() => handleItemChange(index, 'showDropdown', false)}
                            style={{ padding: '4px 6px', borderTop: '1px solid #eee', fontSize: '0.75rem', color: 'var(--primary)', textAlign: 'right', cursor: 'pointer' }}
                          >
                            Close
                          </div>
                        </div>
                      )}
                    </td>

                    <td>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        required
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                        className="form-control"
                        style={{ textAlign: 'center' }}
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        required
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="form-control"
                        placeholder="NOS"
                        style={{ textAlign: 'center' }}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        className="form-control"
                        style={{ textAlign: 'right' }}
                      />
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.85rem' }}>
                      ₹{((Number(item.qty || 0)) * (Number(item.rate || 0))).toFixed(2)}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveRowUp(index)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px' }}
                          title="Move Up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={index === items.length - 1}
                          onClick={() => moveRowDown(index)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px' }}
                          title="Move Down"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px', color: 'var(--danger)' }}
                          title="Delete Row"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addRow}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.5rem' }}
        >
          <Plus size={14} /> Add Line Item
        </button>

        {/* Lower Grid: Terms Left / Calculations Right */}
        <div className="total-summary-section">
          {/* Terms & Conditions Box */}
          <div style={{ flexGrow: 1, minWidth: '320px', maxWidth: '550px' }}>
            <h5 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Terms & Conditions</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {terms.map((term, index) => (
                <div key={index} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{index + 1}.</span>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => handleTermChange(index, e.target.value)}
                    className="form-control"
                    style={{ flexGrow: 1, fontSize: '0.8rem', padding: '4px 8px' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeTerm(index)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px', color: 'var(--danger)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTerm}
                className="btn btn-secondary btn-sm"
                style={{ width: '120px', fontSize: '0.75rem', padding: '3px 6px', marginTop: '4px' }}
              >
                + Add Term Line
              </button>
            </div>
          </div>

          {/* Tax Configurations & Totals Column */}
          <div className="totals-col">
            <div className="form-group" style={{ marginBottom: '0.75rem', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="applyGstCheck"
                checked={applyGst}
                onChange={(e) => setApplyGst(e.target.checked)}
              />
              <label htmlFor="applyGstCheck" className="form-label" style={{ cursor: 'pointer', margin: 0 }}>
                Calculate GST (CGST/SGST/IGST)
              </label>
            </div>

            {applyGst && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">GST Tax Rate (%)</label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="form-control"
                  style={{ padding: '4px 6px', fontSize: '0.85rem' }}
                >
                  <option value="5">5 %</option>
                  <option value="12">12 %</option>
                  <option value="18">18 % (Standard)</option>
                  <option value="28">28 %</option>
                </select>
              </div>
            )}

            <div className="totals-row">
              <span>Taxable Subtotal:</span>
              <strong>₹ {taxableAmount.toFixed(2)}</strong>
            </div>

            {applyGst && (
              <>
                {clientStateCode === (companyProfile.stateCode || '24') ? (
                  <>
                    <div className="totals-row">
                      <span>CGST ({(gstRate / 2)}%):</span>
                      <span>₹ {cgst.toFixed(2)}</span>
                    </div>
                    <div className="totals-row">
                      <span>SGST ({(gstRate / 2)}%):</span>
                      <span>₹ {sgst.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="totals-row">
                    <span>IGST ({gstRate}%):</span>
                    <span>₹ {igst.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}

            <div className="totals-row">
              <span>Round Off:</span>
              <span>₹ {roundOff.toFixed(2)}</span>
            </div>

            <div className="totals-row grand-total">
              <span>Grand Total:</span>
              <span>₹ {grandTotal.toLocaleString('en-IN')}.00</span>
            </div>
            
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.3', textAlign: 'right' }}>
              <strong>In Words:</strong> {amountInWords}
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            <Save size={16} /> Save Document
          </button>
        </div>
      </form>
    </div>
  );
}
