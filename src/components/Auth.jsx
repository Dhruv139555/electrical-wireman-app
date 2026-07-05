import React, { useState } from 'react';
import { Mail, Lock, UserPlus, LogIn, X, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Auth({ 
  isOpen, 
  onClose, 
  onLogin, 
  onSignUp, 
  onGoogleSignIn,
  error, 
  loading,
  supabaseUrl = '',
  supabaseKey = ''
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  
  // Custom URL/Key if not configured in environment
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');

  if (!isOpen) return null;

  const needsCredentials = !supabaseUrl || !supabaseKey;

  const handleGoogleSubmit = () => {
    setLocalError('');
    if (needsCredentials && (!customUrl || !customKey)) {
      setLocalError('Please configure your Supabase Project URL and Anon API key.');
      return;
    }
    const finalUrl = supabaseUrl || customUrl;
    const finalKey = supabaseKey || customKey;
    onGoogleSignIn(finalUrl, finalKey);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (needsCredentials && (!customUrl || !customKey)) {
      setLocalError('Please configure your Supabase Project URL and Anon API key.');
      return;
    }

    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    const finalUrl = supabaseUrl || customUrl;
    const finalKey = supabaseKey || customKey;

    if (isSignUp) {
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
      onSignUp(email, password, finalUrl, finalKey);
    } else {
      onLogin(email, password, finalUrl, finalKey);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setLocalError('');
    setPassword('');
    setConfirmPassword('');
  };

  const displayError = error || localError;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2rem',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            transition: 'var(--transition)'
          }}
          className="hover-bg"
          title="Close"
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div 
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, var(--accent), var(--primary))',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.5rem',
              color: '#0f172a',
              marginBottom: '0.75rem',
              boxShadow: '0 4px 10px rgba(59, 130, 246, 0.15)'
            }}
          >
            HE
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
            {isSignUp ? 'Create Account' : 'Sign In to Cloud'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {isSignUp 
              ? 'Synchronize estimation data across your devices' 
              : 'Access your invoices, quotations & client directory'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div 
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-app)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)'
          }}
        >
          <button
            type="button"
            onClick={() => { if (isSignUp) handleToggleMode(); }}
            style={{
              flex: 1,
              padding: '6px 12px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: !isSignUp ? 'var(--bg-card)' : 'transparent',
              color: !isSignUp ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: !isSignUp ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { if (!isSignUp) handleToggleMode(); }}
            style={{
              flex: 1,
              padding: '6px 12px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: isSignUp ? 'var(--bg-card)' : 'transparent',
              color: isSignUp ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: isSignUp ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {displayError && (
          <div 
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              backgroundColor: '#fef2f2',
              color: 'var(--danger)',
              border: '1px solid #fca5a5',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              fontWeight: 500
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{displayError}</span>
          </div>
        )}

        {/* Input Forms */}
        <form onSubmit={handleSubmit}>
          {needsCredentials && (
            <div style={{ 
              backgroundColor: 'var(--bg-app)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '12px',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)', margin: 0 }}>
                ⚠️ Set Supabase credentials first
              </p>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem' }}>Project URL</label>
                <input
                  type="url"
                  required
                  className="form-control"
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                  placeholder="https://your-project.supabase.co"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem' }}>Anon API Key</label>
                <input
                  type="password"
                  required
                  className="form-control"
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} 
              />
              <input
                type="email"
                required
                className="form-control"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: isSignUp ? '1rem' : '1.5rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} 
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)' 
                  }} 
                />
                <input
                  type="password"
                  required
                  className="form-control"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span className="spinner" style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }}></span>
                Please wait...
              </span>
            ) : isSignUp ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <UserPlus size={16} /> Create Account
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <LogIn size={16} /> Sign In
              </span>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', color: 'var(--text-muted)' }}>
          <hr style={{ flexGrow: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', padding: '0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or</span>
          <hr style={{ flexGrow: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleSubmit}
          className="btn"
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '10px',
            backgroundColor: '#fff',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          disabled={loading}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-app)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        >
          {/* Inline Google SVG Logo */}
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.71-1.57 2.69-3.88 2.69-6.6z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.91-2.26a5.64 5.64 0 0 1-8.52-2.96H.53v2.33A9 9 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.53 10.58a5.41 5.41 0 0 1 0-3.16V5.09H.53a9 9 0 0 0 0 7.82l3-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4A9 9 0 0 0 .53 5.09l3 2.33a5.64 5.64 0 0 1 8.52-3.84z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Offline Disclaimer */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Continue offline without sync
          </button>
        </div>
      </div>
      
      {/* Dynamic Keyframes injected locally */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
