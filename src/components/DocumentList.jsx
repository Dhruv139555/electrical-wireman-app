import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Edit3, 
  Copy, 
  ArrowRight, 
  Check, 
  Trash2, 
  Plus, 
  FileText 
} from 'lucide-react';

export default function DocumentList({ 
  invoices = [], 
  quotations = [], 
  onEditDoc, 
  onDeleteDoc, 
  onViewDoc, 
  onDuplicateDoc,
  onConvertQuoteToInvoice,
  onUpdateDocStatus,
  onCreateNew 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, quotation, invoice
  const [statusFilter, setStatusFilter] = useState('all'); // all, Draft, Sent, Paid, Approved, Cancelled, Declined

  // Combine and sort documents
  const allDocuments = [
    ...invoices.map(doc => ({ ...doc, docType: 'Invoice' })),
    ...quotations.map(doc => ({ ...doc, docType: 'Quotation' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Apply filters
  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = 
      doc.clientInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNumber?.toString().includes(searchQuery) ||
      doc.docType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.clientInfo?.city && doc.clientInfo.city.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesType = 
      typeFilter === 'all' || 
      (typeFilter === 'invoice' && doc.docType === 'Invoice') ||
      (typeFilter === 'quotation' && doc.docType === 'Quotation');

    const matchesStatus = 
      statusFilter === 'all' || 
      doc.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="no-print">
      {/* Header Section */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotations & GST Invoices</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Search, filter, and manage all your customer quotations and tax bills.
          </p>
        </div>
        <div className="page-actions">
          <button onClick={() => onCreateNew('Quotation')} className="btn btn-accent">
            <Plus size={16} /> Create Quote
          </button>
          <button onClick={() => onCreateNew('Invoice')} className="btn btn-primary">
            <Plus size={16} /> Create GST Invoice
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.5fr 1fr 1fr', 
          gap: '1rem', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by client, bill no, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
            />
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)' 
              }} 
            />
          </div>

          {/* Type Filter buttons */}
          <div className="tab-container" style={{ marginBottom: 0, paddingBottom: 0, border: 'none', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={() => { setTypeFilter('all'); setStatusFilter('all'); }} 
              className={`tab-btn ${typeFilter === 'all' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1 }}
            >
              All
            </button>
            <button 
              onClick={() => { setTypeFilter('quotation'); setStatusFilter('all'); }} 
              className={`tab-btn ${typeFilter === 'quotation' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1 }}
            >
              Quotations
            </button>
            <button 
              onClick={() => { setTypeFilter('invoice'); setStatusFilter('all'); }} 
              className={`tab-btn ${typeFilter === 'invoice' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1 }}
            >
              Invoices
            </button>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ height: '38px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              <option value="all">All Statuses</option>
              {typeFilter !== 'invoice' && <option value="Approved">Approved</option>}
              {typeFilter !== 'invoice' && <option value="Declined">Declined</option>}
              <option value="Sent">Sent</option>
              <option value="Draft">Draft</option>
              {typeFilter !== 'quotation' && <option value="Paid">Paid</option>}
              {typeFilter !== 'quotation' && <option value="Partially Paid">Partially Paid</option>}
              {typeFilter !== 'quotation' && <option value="Cancelled">Cancelled</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: '0.5rem 0' }}>
        {filteredDocuments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <FileText size={52} style={{ opacity: 0.15, marginBottom: '1.25rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>No Documents Found</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              No bills or quotations matched your filter options.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="document-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.5rem' }}>No.</th>
                  <th>Type</th>
                  <th>Client Name</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => {
                  const isUnpaidInvoice = doc.docType === 'Invoice' && doc.status !== 'Paid' && doc.status !== 'Cancelled';
                  const isUnapprovedQuote = doc.docType === 'Quotation' && doc.status !== 'Approved' && doc.status !== 'Declined';
                  const showQuickStatus = isUnpaidInvoice || isUnapprovedQuote;

                  return (
                    <tr key={`${doc.docType}-${doc.id}`}>
                      <td style={{ fontWeight: 700, paddingLeft: '1.5rem' }}>#{doc.docNumber}</td>
                      <td>
                        <span className={`status-badge ${doc.docType.toLowerCase()}`}>
                          {doc.docType}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{doc.clientInfo?.name || 'Walk-in Client'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {doc.clientInfo?.city ? `${doc.clientInfo.city}, ` : ''}{doc.clientInfo?.state || 'Gujarat'}
                        </div>
                      </td>
                      <td>{new Date(doc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{doc.grandTotal?.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`status-badge ${doc.status.toLowerCase().replace(' ', '-')}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {/* View Preview */}
                          <button 
                            onClick={() => onViewDoc(doc)} 
                            className="btn btn-secondary btn-sm"
                            title="View / Print Document"
                            style={{ padding: '6px 8px' }}
                          >
                            <Eye size={13} />
                          </button>
                          
                          {/* Edit Details */}
                          <button 
                            onClick={() => onEditDoc(doc)} 
                            className="btn btn-secondary btn-sm"
                            title="Edit Document"
                            style={{ padding: '6px 8px' }}
                          >
                            <Edit3 size={13} />
                          </button>

                          {/* Clone/Duplicate */}
                          <button 
                            onClick={() => onDuplicateDoc(doc)} 
                            className="btn btn-secondary btn-sm"
                            title="Duplicate Document"
                            style={{ padding: '6px 8px' }}
                          >
                            <Copy size={13} />
                          </button>

                          {/* Convert Quotation to Invoice */}
                          {doc.docType === 'Quotation' && (
                            <button 
                              onClick={() => onConvertQuoteToInvoice(doc)} 
                              className="btn btn-secondary btn-sm"
                              title="Convert to GST Invoice"
                              style={{ padding: '6px 8px', color: 'var(--success)' }}
                            >
                              <ArrowRight size={13} />
                            </button>
                          )}

                          {/* Quick Status Mark Done */}
                          {showQuickStatus && (
                            <button 
                              onClick={() => onUpdateDocStatus(doc.id, doc.docType, doc.docType === 'Invoice' ? 'Paid' : 'Approved')} 
                              className="btn btn-secondary btn-sm"
                              title={doc.docType === 'Invoice' ? "Mark as Paid" : "Mark as Approved"}
                              style={{ padding: '6px 8px', color: 'var(--success)' }}
                            >
                              <Check size={13} />
                            </button>
                          )}

                          {/* Delete Document */}
                          <button 
                            onClick={() => onDeleteDoc(doc.id, doc.docType)} 
                            className="btn btn-secondary btn-sm"
                            title="Delete Document"
                            style={{ padding: '6px 8px', color: 'var(--danger)' }}
                          >
                            <Trash2 size={13} />
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
