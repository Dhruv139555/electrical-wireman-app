import React from 'react';
import { 
  Home, 
  Zap, 
  FileText, 
  Users, 
  Layers, 
  Settings, 
  Menu,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { LOGO_BASE64 } from '../utils/logoBase64';

export default function Layout({ 
  children, 
  currentTab, 
  setCurrentTab, 
  companyName, 
  syncStatus = 'offline',
  currentUser = null,
  onOpenAuth,
  onSignOut
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'estimator', label: 'Point Estimator', icon: Zap },
    { id: 'invoices', label: 'Quotes & Invoices', icon: FileText },
    { id: 'clients', label: 'Client Directory', icon: Users },
    { id: 'inventory', label: 'Material List', icon: Layers },
    { id: 'settings', label: 'Business Profile', icon: Settings },
  ];

  // Helper for status badge styling
  const getSyncColor = () => {
    if (syncStatus === 'synced') return '#10b981'; // Green
    if (syncStatus === 'syncing') return '#f59e0b'; // Amber
    if (syncStatus === 'error') return '#ef4444'; // Red
    return '#64748b'; // Grey
  };

  const getSyncLabel = () => {
    if (syncStatus === 'synced') return 'Cloud Synced';
    if (syncStatus === 'syncing') return 'Syncing...';
    if (syncStatus === 'error') return 'Sync Error';
    return 'Offline (Local)';
  };

  return (
    <div className="app-container">
      {/* Sidebar - Hidden on print */}
      <aside className="sidebar no-print">
        <div className="brand-section">
          <img 
            src={LOGO_BASE64} 
            alt="Logo" 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '4px', 
              objectFit: 'cover',
              border: '1.5px solid #1e293b' 
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div>
            <h2 className="brand-name">{companyName || "HANSA ELECTRICAL"}</h2>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Electrical Solutions</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {currentTab === item.id && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentUser ? (
            <div style={{ 
              borderBottom: '1px solid #1e293b', 
              paddingBottom: '8px', 
              marginBottom: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8' }} title={currentUser.email}>
                <User size={12} style={{ flexShrink: 0 }} />
                <span style={{ 
                  textOverflow: 'ellipsis', 
                  overflow: 'hidden', 
                  whiteSpace: 'nowrap',
                  maxWidth: '180px'
                }}>
                  {currentUser.email}
                </span>
              </div>
              <button 
                onClick={onSignOut}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 600,
                  opacity: 0.8
                }}
                onMouseOver={(e) => e.target.style.opacity = '1'}
                onMouseOut={(e) => e.target.style.opacity = '0.8'}
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-primary btn-sm"
              style={{ 
                width: '100%', 
                fontSize: '0.75rem', 
                padding: '6px 10px',
                marginBottom: '4px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              Sign In to Sync
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.65rem' }}>
            <p style={{ margin: 0 }}>© 2026 Wireman</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: getSyncColor(),
                display: 'inline-block'
              }}></span>
              <span style={{ color: '#64748b', fontWeight: 600 }}>{getSyncLabel()}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
