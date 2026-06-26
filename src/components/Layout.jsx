import React from 'react';
import { 
  Home, 
  Zap, 
  FileText, 
  Users, 
  Layers, 
  Settings, 
  Menu,
  ChevronRight
} from 'lucide-react';
import { LOGO_BASE64 } from '../utils/logoBase64';

export default function Layout({ children, currentTab, setCurrentTab, companyName }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'estimator', label: 'Point Estimator', icon: Zap },
    { id: 'invoices', label: 'Quotes & Invoices', icon: FileText },
    { id: 'clients', label: 'Client Directory', icon: Users },
    { id: 'inventory', label: 'Material List', icon: Layers },
    { id: 'settings', label: 'Business Profile', icon: Settings },
  ];

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

        <div className="sidebar-footer">
          <p>© 2026 Wireman App</p>
          <p style={{ fontSize: '0.65rem', marginTop: '2px' }}>v1.0.0 (Local Storage)</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
