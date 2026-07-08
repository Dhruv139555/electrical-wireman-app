import { 
  Home, 
  Zap, 
  FileText, 
  Users, 
  Layers, 
  Settings, 
  ChevronRight
} from 'lucide-react';
import { LOGO_BASE64 } from '../utils/logoBase64';

export default function Layout({ 
  children, 
  currentTab, 
  setCurrentTab, 
  companyName, 
  syncStatus = 'offline'
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
