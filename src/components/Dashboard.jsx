import React, { useState } from 'react';
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Plus, 
  Zap, 
  Search, 
  Eye, 
  Edit3, 
  Trash2 
} from 'lucide-react';

export default function Dashboard({ 
  invoices = [], 
  quotations = [], 
  estimates = [], 
  printHistory = [],
  onClearHistory,
  onCreateNew,
  onEditDoc,
  onDeleteDoc,
  onViewDoc,
  setCurrentTab 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, invoice, quotation
  const [analyticsTab, setAnalyticsTab] = useState('monthly');

  // Calculate stats
  const totalInvoiced = invoices.reduce((sum, item) => sum + (item.grandTotal || 0), 0);
  const totalOutstanding = invoices
    .filter(item => item.status !== 'Paid')
    .reduce((sum, item) => sum + (item.grandTotal || 0), 0);
  const totalPaid = invoices
    .filter(item => item.status === 'Paid')
    .reduce((sum, item) => sum + (item.grandTotal || 0), 0);
  
  const quotesCount = quotations.length;
  const activeEstimatesCount = estimates.length;

  // Monthly Revenue Aggregation
  const monthlyData = {};
  invoices.forEach(inv => {
    if (!inv.date) return;
    const monthKey = inv.date.substring(0, 7); // "YYYY-MM"
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthKey, paid: 0, pending: 0, approvedQuotes: 0, total: 0 };
    }
    if (inv.status === 'Paid') {
      monthlyData[monthKey].paid += (inv.grandTotal || 0);
    } else if (inv.status !== 'Cancelled') {
      monthlyData[monthKey].pending += (inv.grandTotal || 0);
    }
    monthlyData[monthKey].total += (inv.grandTotal || 0);
  });

  quotations.forEach(q => {
    if (!q.date) return;
    const monthKey = q.date.substring(0, 7);
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthKey, paid: 0, pending: 0, approvedQuotes: 0, total: 0 };
    }
    if (q.status === 'Approved') {
      monthlyData[monthKey].approvedQuotes += (q.grandTotal || 0);
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort((a, b) => b.localeCompare(a));
  const monthsForChart = Object.keys(monthlyData).sort((a, b) => a.localeCompare(b)).slice(-6);

  // Yearly Revenue Aggregation
  const yearlyData = {};
  invoices.forEach(inv => {
    if (!inv.date) return;
    const yearKey = inv.date.substring(0, 4); // "YYYY"
    if (!yearlyData[yearKey]) {
      yearlyData[yearKey] = { year: yearKey, paid: 0, pending: 0, approvedQuotes: 0, total: 0 };
    }
    if (inv.status === 'Paid') {
      yearlyData[yearKey].paid += (inv.grandTotal || 0);
    } else if (inv.status !== 'Cancelled') {
      yearlyData[yearKey].pending += (inv.grandTotal || 0);
    }
    yearlyData[yearKey].total += (inv.grandTotal || 0);
  });

  quotations.forEach(q => {
    if (!q.date) return;
    const yearKey = q.date.substring(0, 4);
    if (!yearlyData[yearKey]) {
      yearlyData[yearKey] = { year: yearKey, paid: 0, pending: 0, approvedQuotes: 0, total: 0 };
    }
    if (q.status === 'Approved') {
      yearlyData[yearKey].approvedQuotes += (q.grandTotal || 0);
    }
  });

  const sortedYears = Object.keys(yearlyData).sort((a, b) => b.localeCompare(a));

  // Pipeline Status Aggregation
  const getPipelineStats = () => {
    const stats = {
      quotes: {
        Approved: { count: 0, total: 0 },
        Sent: { count: 0, total: 0 },
        Draft: { count: 0, total: 0 },
        Declined: { count: 0, total: 0 }
      },
      invoices: {
        Paid: { count: 0, total: 0 },
        'Partially Paid': { count: 0, total: 0 },
        Sent: { count: 0, total: 0 },
        Draft: { count: 0, total: 0 },
        Cancelled: { count: 0, total: 0 }
      }
    };

    quotations.forEach(q => {
      const statusKey = q.status || 'Draft';
      if (!stats.quotes[statusKey]) {
        stats.quotes[statusKey] = { count: 0, total: 0 };
      }
      stats.quotes[statusKey].count += 1;
      stats.quotes[statusKey].total += (q.grandTotal || 0);
    });

    invoices.forEach(inv => {
      const statusKey = inv.status || 'Draft';
      if (!stats.invoices[statusKey]) {
        stats.invoices[statusKey] = { count: 0, total: 0 };
      }
      stats.invoices[statusKey].count += 1;
      stats.invoices[statusKey].total += (inv.grandTotal || 0);
    });

    return stats;
  };
  const pipelineStats = getPipelineStats();

  const formatMonthLabel = (key) => {
    const [year, month] = key.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month, 10) - 1]} ${year.substring(2)}`;
  };

  // Combine invoices and quotations for the recent documents table
  const allDocuments = [
    ...invoices.map(doc => ({ ...doc, docType: 'Invoice' })),
    ...quotations.map(doc => ({ ...doc, docType: 'Quotation' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter documents
  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = 
      doc.clientInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNumber?.toString().includes(searchQuery) ||
      doc.docType.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = 
      filterType === 'all' || 
      (filterType === 'invoice' && doc.docType === 'Invoice') ||
      (filterType === 'quotation' && doc.docType === 'Quotation');

    return matchesSearch && matchesType;
  });

  return (
    <div className="no-print">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome to Hansa Electrical estimation & invoicing dashboard.</p>
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

      {/* Stats Row */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Invoiced</span>
            <span className="stat-value">₹{totalInvoiced.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Outstanding Bal.</span>
            <span className="stat-value">₹{totalOutstanding.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Paid/Revenue</span>
            <span className="stat-value">₹{totalPaid.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon accent">
            <Zap size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Quotes & Estimates</span>
            <span className="stat-value">{quotesCount} Q / {activeEstimatesCount} E</span>
          </div>
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setCurrentTab('estimator')} 
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Zap size={14} style={{ color: 'var(--accent-hover)' }} /> Labor Point Estimator
          </button>
          <button 
            onClick={() => setCurrentTab('clients')} 
            className="btn btn-secondary btn-sm"
          >
            Manage Clients Directory
          </button>
          <button 
            onClick={() => setCurrentTab('inventory')} 
            className="btn btn-secondary btn-sm"
          >
            Material Price list
          </button>
        </div>
      </div>

      {/* Revenue & Work Analytics section */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
              <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
              Revenue & Work Analytics
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>Track actual income, work approved/done, and billing pipeline.</p>
          </div>
          <div className="tab-container" style={{ marginBottom: 0, paddingBottom: 0, border: 'none' }}>
            <button 
              onClick={() => setAnalyticsTab('monthly')} 
              className={`tab-btn ${analyticsTab === 'monthly' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              Monthly Revenue
            </button>
            <button 
              onClick={() => setAnalyticsTab('yearly')} 
              className={`tab-btn ${analyticsTab === 'yearly' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              Yearly Summary
            </button>
            <button 
              onClick={() => setAnalyticsTab('pipeline')} 
              className={`tab-btn ${analyticsTab === 'pipeline' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              Pipeline & Status
            </button>
          </div>
        </div>

        {/* Tab 1: Monthly */}
        {analyticsTab === 'monthly' && (
          <div>
            {monthsForChart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No transaction data available yet to display monthly trend.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* SVG Chart */}
                <div style={{ padding: '10px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', minWidth: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '10px', fontSize: '0.75rem', fontWeight: 600, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '12px', height: '12px', backgroundColor: 'var(--success)', borderRadius: '2px' }}></span>
                      Paid (Revenue)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '12px', height: '12px', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></span>
                      Approved Quotes (Work Done)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '12px', height: '12px', backgroundColor: 'var(--accent)', borderRadius: '2px' }}></span>
                      Pending Invoices
                    </span>
                  </div>

                  <svg viewBox="0 0 560 220" width="100%" height="220" style={{ overflow: 'visible' }}>
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                      const yVal = 180 - pct * 150;
                      const displayVal = Math.round(monthsForChart.reduce((max, key) => {
                        const m = monthlyData[key];
                        return Math.max(max, m.paid, m.pending, m.approvedQuotes);
                      }, 0) || 1000) * pct;

                      return (
                        <g key={i}>
                          <line x1="60" y1={yVal} x2="540" y2={yVal} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
                          <text x="50" y={yVal + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)" fontWeight="500">
                            ₹{displayVal >= 100000 ? `${(displayVal / 100000).toFixed(1)}L` : displayVal >= 1000 ? `${(displayVal / 1000).toFixed(0)}k` : displayVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* Chart Bars */}
                    {monthsForChart.map((key, idx) => {
                      const m = monthlyData[key];
                      const maxVal = Math.max(
                        monthsForChart.reduce((max, k) => {
                          const mData = monthlyData[k];
                          return Math.max(max, mData.paid, mData.pending, mData.approvedQuotes);
                        }, 0) || 1000
                      );

                      const colWidth = 480 / monthsForChart.length;
                      const xCenter = 70 + idx * colWidth + colWidth / 2;

                      const hPaid = (m.paid / maxVal) * 150;
                      const hApproved = (m.approvedQuotes / maxVal) * 150;
                      const hPending = (m.pending / maxVal) * 150;

                      const yPaid = 180 - hPaid;
                      const yApproved = 180 - hApproved;
                      const yPending = 180 - hPending;

                      return (
                        <g key={key}>
                          {/* Paid Bar (Green) */}
                          <rect 
                            x={xCenter - 21} 
                            y={yPaid} 
                            width="12" 
                            height={hPaid} 
                            fill="var(--success)" 
                            rx="2" 
                            style={{ transition: 'all 0.3s ease' }}
                          >
                            <title>{`Paid: ₹${m.paid.toLocaleString('en-IN')}`}</title>
                          </rect>

                          {/* Approved Quotes Bar (Blue) */}
                          <rect 
                            x={xCenter - 6} 
                            y={yApproved} 
                            width="12" 
                            height={hApproved} 
                            fill="var(--primary)" 
                            rx="2"
                            style={{ transition: 'all 0.3s ease' }}
                          >
                            <title>{`Approved Quotes: ₹${m.approvedQuotes.toLocaleString('en-IN')}`}</title>
                          </rect>

                          {/* Pending Bar (Amber) */}
                          <rect 
                            x={xCenter + 9} 
                            y={yPending} 
                            width="12" 
                            height={hPending} 
                            fill="var(--accent)" 
                            rx="2"
                            style={{ transition: 'all 0.3s ease' }}
                          >
                            <title>{`Pending Invoices: ₹${m.pending.toLocaleString('en-IN')}`}</title>
                          </rect>

                          {/* Month Label */}
                          <text x={xCenter} y="200" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-muted)">
                            {formatMonthLabel(key)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Table Breakdown */}
                <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  <table className="document-table" style={{ fontSize: '0.8rem', margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th style={{ color: 'var(--success)' }}>Paid</th>
                        <th style={{ color: 'var(--primary)' }}>Approved Quote</th>
                        <th style={{ color: 'var(--accent-hover)' }}>Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMonths.map(month => {
                        const m = monthlyData[month];
                        return (
                          <tr key={month}>
                            <td style={{ fontWeight: 600 }}>{formatMonthLabel(month)}</td>
                            <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{m.paid.toLocaleString('en-IN')}</td>
                            <td style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{m.approvedQuotes.toLocaleString('en-IN')}</td>
                            <td style={{ color: 'var(--accent-hover)', fontWeight: 600 }}>₹{m.pending.toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Yearly */}
        {analyticsTab === 'yearly' && (
          <div>
            {sortedYears.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No yearly records found.
              </div>
            ) : (
              <table className="document-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th style={{ color: 'var(--success)' }}>Paid Invoices (Revenue)</th>
                    <th style={{ color: 'var(--primary)' }}>Approved Quotes (Work Done)</th>
                    <th style={{ color: 'var(--accent-hover)' }}>Pending Invoices</th>
                    <th>Combined Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedYears.map(year => {
                    const y = yearlyData[year];
                    return (
                      <tr key={year}>
                        <td style={{ fontWeight: 700 }}>{year}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{y.paid.toLocaleString('en-IN')}</td>
                        <td style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{y.approvedQuotes.toLocaleString('en-IN')}</td>
                        <td style={{ color: 'var(--accent-hover)', fontWeight: 600 }}>₹{y.pending.toLocaleString('en-IN')}</td>
                        <td style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{(y.paid + y.approvedQuotes + y.pending).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Pipeline & Status */}
        {analyticsTab === 'pipeline' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Quotations Pipeline */}
            <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '1.5rem' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Quotation Pipeline</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total: ₹{quotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0).toLocaleString('en-IN')}
                </span>
              </h4>
              {Object.entries(pipelineStats.quotes).map(([status, stat]) => {
                const totalQuotesVal = quotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0) || 1;
                const pct = (stat.total / totalQuotesVal) * 100;
                
                let barColor = 'var(--text-muted)';
                if (status === 'Approved') barColor = 'var(--success)';
                if (status === 'Sent') barColor = 'var(--primary)';
                if (status === 'Draft') barColor = 'var(--accent)';
                if (status === 'Declined') barColor = 'var(--danger)';

                return (
                  <div key={status} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>
                        {status} <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>({stat.count})</span>
                      </span>
                      <span style={{ fontWeight: 700 }}>₹{stat.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: '3px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Invoices Pipeline */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Invoice Pipeline</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total: ₹{invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0).toLocaleString('en-IN')}
                </span>
              </h4>
              {Object.entries(pipelineStats.invoices).map(([status, stat]) => {
                const totalInvoicesVal = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0) || 1;
                const pct = (stat.total / totalInvoicesVal) * 100;
                
                let barColor = 'var(--text-muted)';
                if (status === 'Paid') barColor = 'var(--success)';
                if (status === 'Partially Paid') barColor = 'var(--warning)';
                if (status === 'Sent') barColor = 'var(--primary)';
                if (status === 'Draft') barColor = 'var(--accent)';
                if (status === 'Cancelled') barColor = 'var(--danger)';

                return (
                  <div key={status} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>
                        {status} <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>({stat.count})</span>
                      </span>
                      <span style={{ fontWeight: 700 }}>₹{stat.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: '3px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Main documents list + Print History */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Recent Activity List */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-title">
            <span>Recent Quotations & Invoices</span>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {/* Search Input */}
              <div style={{ position: 'relative', width: '220px' }}>
                <input
                  type="text"
                  placeholder="Search bills..."
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

              {/* Document Filters */}
              <div className="tab-container" style={{ marginBottom: 0, paddingBottom: 0, border: 'none' }}>
                <button 
                  onClick={() => setFilterType('all')} 
                  className={`tab-btn ${filterType === 'all' ? 'active' : ''}`}
                  style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilterType('quotation')} 
                  className={`tab-btn ${filterType === 'quotation' ? 'active' : ''}`}
                  style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                >
                  Quotations
                </button>
                <button 
                  onClick={() => setFilterType('invoice')} 
                  className={`tab-btn ${filterType === 'invoice' ? 'active' : ''}`}
                  style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                >
                  Invoices
                </button>
              </div>
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No documents found matching your search.</p>
              <p style={{ fontSize: '0.8rem' }}>Create a quotation or invoice using the top buttons to get started!</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="document-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Type</th>
                    <th>Client Name</th>
                    <th>Date</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={`${doc.docType}-${doc.id}`}>
                      <td style={{ fontWeight: 600 }}>#{doc.docNumber}</td>
                      <td>
                        <span className={`status-badge ${doc.docType.toLowerCase()}`}>
                          {doc.docType}
                        </span>
                      </td>
                      <td>
                        <div>{doc.clientInfo?.name || 'Walk-in Client'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {doc.clientInfo?.city}, {doc.clientInfo?.state}
                        </div>
                      </td>
                      <td>{new Date(doc.date).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontWeight: 600 }}>₹{doc.grandTotal?.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`status-badge ${doc.status.toLowerCase()}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => onViewDoc(doc)} 
                            className="btn btn-secondary btn-sm"
                            title="View / Print Document"
                            style={{ padding: '4px 8px' }}
                          >
                            <Eye size={13} />
                          </button>
                          <button 
                            onClick={() => onEditDoc(doc)} 
                            className="btn btn-secondary btn-sm"
                            title="Edit Document"
                            style={{ padding: '4px 8px' }}
                          >
                            <Edit3 size={13} />
                          </button>
                          <button 
                            onClick={() => onDeleteDoc(doc.id, doc.docType)} 
                            className="btn btn-secondary btn-sm"
                            title="Delete Document"
                            style={{ padding: '4px 8px', color: 'var(--danger)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Print & Download History Log */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={18} style={{ color: 'var(--primary)' }} />
              Download History
            </span>
            {printHistory.length > 0 && (
              <button 
                onClick={onClearHistory} 
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                title="Clear download logs"
              >
                Clear
              </button>
            )}
          </div>

          {printHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <p>No downloads recorded yet.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Logs appear here when you click 'Print / Save PDF' on any document.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {printHistory.map((log) => (
                <div 
                  key={log.id} 
                  style={{ 
                    padding: '8px 10px', 
                    backgroundColor: 'var(--bg-app)', 
                    borderRadius: '6px', 
                    borderLeft: '3px solid var(--primary)',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '2px' }}>
                    <span>{log.docType} #{log.docNumber}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 'normal' }}>
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-main)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                    {log.clientName}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span>Total: ₹{log.grandTotal?.toLocaleString('en-IN')}</span>
                    <span>{new Date(log.timestamp).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
