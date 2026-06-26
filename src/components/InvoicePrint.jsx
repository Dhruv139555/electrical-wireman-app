import React from 'react';
import { formatDate } from '../utils/helper';
import { LOGO_BASE64 } from '../utils/logoBase64';

export default function InvoicePrint({ document, companyProfile, onPrint }) {
  if (!document) return null;

  const isInvoice = document.docType === 'Invoice';
  const { clientInfo = {}, items = [], terms = [] } = document;
  const profile = companyProfile || {};

  // Check state comparison for GST (Gujarat code is 24)
  const companyStateCode = profile.stateCode || "24";
  const clientStateCode = clientInfo.stateCode || "24";
  const isInterState = companyStateCode !== clientStateCode;

  // Calculate items quantity sum
  const totalQty = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);

  // Print trigger
  const handlePrint = () => {
    if (onPrint) {
      onPrint(document);
    }
    window.print();
  };

  return (
    <div className="hansa-invoice-wrapper">
      {/* Action panel shown on screen only */}
      <div className="no-print" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 16px', 
        backgroundColor: '#fff',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div>
          <span style={{ fontWeight: 600 }}>Document Preview:</span> #{document.docNumber} ({document.docType})
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handlePrint} className="btn btn-primary">
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Actual Print Sheet - replicates the image layout */}
      <div className="hansa-invoice-sheet">
        {/* Company Header Card */}
        <header className="hansa-header">
          {/* Logo container */}
          <div className="hansa-logo-container">
            <img 
              src={LOGO_BASE64} 
              alt="Hansa Electrical Logo" 
              style={{
                width: '95px',
                height: '95px',
                border: '1.5px solid #000000',
                borderRadius: '4px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Company details */}
          <div className="hansa-company-info">
            <h1>{profile.name || "HANSA ELECTRICAL"}</h1>
            <p>{profile.address || "B-29 murlidhar society, Ahmedabad, Gujarat, 382445"}</p>
            <p>
              <span>📞 {profile.phone || "9687132082"}</span>
              <span style={{ marginLeft: '12px' }}>✉️ {profile.email || "jayesh_bapu83@yahoo.com"}</span>
            </p>
            <p>PAN : {profile.pan || "EDZPS3115N"}</p>
            {profile.gstin && <p>GSTIN : {profile.gstin}</p>}
          </div>

          {/* Document Title */}
          <div className="hansa-doc-title">
            {isInvoice ? 'INVOICE' : 'QUOTATION'}
          </div>
        </header>

        {/* Document Metadata grid */}
        <div className="hansa-meta-grid">
          <div>
            {isInvoice ? 'Invoice' : 'Quotation'} Number : <strong>{document.docNumber}</strong>
          </div>
          <div>
            {isInvoice ? 'Due Date' : 'Quotation Validity'} : <strong>{formatDate(document.validityDate)}</strong>
          </div>
          <div>
            Date : <strong>{formatDate(document.date)}</strong>
          </div>
        </div>

        {/* Billing Parties Box */}
        <section className="hansa-billing-parties">
          {/* Bill To */}
          <div className="hansa-party-box">
            <h3>{isInvoice ? 'Invoice To' : 'Quotation For'}</h3>
            <div className="hansa-party-details">
              <div className="name">{clientInfo.name}</div>
              <p>{clientInfo.address}</p>
              <p>State: {clientInfo.state || 'Gujarat'}</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <span>GST: {clientInfo.gstin || 'URP'}</span>
                <span className="hansa-state-badge">
                  State Code : {clientInfo.stateCode || '24'}
                </span>
              </div>
            </div>
          </div>

          {/* Ship To */}
          <div className="hansa-party-box">
            <h3>Ship To</h3>
            <div className="hansa-party-details">
              <div className="name">{clientInfo.shippingName || clientInfo.name}</div>
              <p>{clientInfo.shippingAddress || clientInfo.address}</p>
              <p>State: {clientInfo.shippingState || clientInfo.state || 'Gujarat'}</p>
              <span className="hansa-state-badge">
                State Code : {clientInfo.shippingStateCode || clientInfo.stateCode || '24'}
              </span>
            </div>
          </div>
        </section>

        {/* Items Listing Table */}
        <table className="hansa-table">
          <thead>
            <tr>
              <th style={{ width: '45px' }}>Sr. No.</th>
              <th style={{ textAlign: 'left' }}>Name of Product</th>
              <th style={{ width: '60px' }}>QTY</th>
              <th style={{ width: '60px' }}>Unit</th>
              <th style={{ width: '90px', textAlign: 'right' }}>Rate</th>
              <th style={{ width: '110px', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                <td>{item.name}</td>
                <td style={{ textAlign: 'center' }}>{item.qty}</td>
                <td style={{ textAlign: 'center' }}>{item.unit}</td>
                <td style={{ textAlign: 'right' }}>{Number(item.rate).toFixed(2)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  ₹ {Number(item.qty * item.rate).toFixed(2)}
                </td>
              </tr>
            ))}
            
            {/* Table Summation row */}
            <tr className="total-row">
              <td colSpan="2" style={{ textAlign: 'right', paddingRight: '20px' }}>Total</td>
              <td style={{ textAlign: 'center' }}>{totalQty}</td>
              <td></td>
              <td></td>
              <td style={{ textAlign: 'right' }}>
                ₹ {Number(document.taxableAmount).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Bottom split Grid: Words/Terms on Left, Taxes/Signatures on Right */}
        <div className="hansa-bottom-grid">
          {/* Left panel: Total in words & Terms & conditions */}
          <div className="hansa-bottom-left">
            <div className="hansa-words-box">
              <div className="hansa-words-label">Total Amount in words</div>
              <div className="hansa-words-value">{document.amountInWords}</div>
            </div>
            
            <div className="hansa-terms">
              <h4>Terms and conditions</h4>
              <ol>
                {terms.map((term, index) => (
                  <li key={index}>{term}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right panel: Tax computation table & Authorized Signature */}
          <div className="hansa-bottom-right">
            <div className="hansa-tax-box">
              <div className="hansa-tax-row">
                <span>Taxable Amount</span>
                <span>₹ {Number(document.taxableAmount).toFixed(2)}</span>
              </div>
              
              {/* Show GST splits only if it's an Invoice OR if GST is configured in the Quote */}
              {(isInvoice || document.totalTax > 0) && (
                <>
                  {!isInterState ? (
                    <>
                      <div className="hansa-tax-row">
                        <span>CGST @ 9%</span>
                        <span>₹ {Number(document.cgst || (document.totalTax / 2)).toFixed(2)}</span>
                      </div>
                      <div className="hansa-tax-row">
                        <span>SGST @ 9%</span>
                        <span>₹ {Number(document.sgst || (document.totalTax / 2)).toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="hansa-tax-row">
                      <span>IGST @ 18%</span>
                      <span>₹ {Number(document.igst || document.totalTax).toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}

              <div className="hansa-tax-row">
                <span>TOTAL</span>
                <span>₹ {Number(document.taxableAmount + (document.totalTax || 0)).toFixed(2)}</span>
              </div>

              <div className="hansa-tax-row">
                <span>Round Off Value</span>
                <span>₹ {Number(document.roundOff || 0).toFixed(2)}</span>
              </div>

              <div className="hansa-tax-row grand-total-row">
                <strong>Total Amount</strong>
                <strong>₹ {Number(document.grandTotal).toFixed(2)}</strong>
              </div>
            </div>

            {/* Signature Box */}
            <div className="hansa-sign-section">
              <p style={{ fontSize: '9px', marginBottom: '8px' }}>
                Certified that the particular given above are true and correct for,
              </p>
              <strong style={{ textTransform: 'uppercase' }}>{profile.name || "HANSA ELECTRICAL"}</strong>
              
              <div className="hansa-sign-line">
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
