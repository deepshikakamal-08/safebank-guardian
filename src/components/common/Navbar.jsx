import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';

export default function Navbar() {
  const { 
    account, 
    activeScreen,
    resetDemo, 
    setActiveScreen 
  } = useGuardian();

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Brand & Tagline */}
        <div 
          className="nav-brand" 
          onClick={() => setActiveScreen(activeScreen === 'login' ? 'login' : 'home')} 
          role="button" 
          tabIndex={0}
        >
          <div className="brand-icon">
            <Shield size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div className="brand-title">
              SafeBank Guardian
              <span className="brand-badge">Fintech Security</span>
            </div>
            <div className="brand-tagline">Pause. Verify. Stay Safe.</div>
          </div>
        </div>

        {/* Center/Right Controls */}
        <div className="nav-controls">
          {activeScreen === 'login' ? (
            <div className="guardian-status-pill" style={{ background: '#f8fafc', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
              <span>Demo Customer Portal</span>
            </div>
          ) : (
            <>
              {/* Guardian Shield Live Status */}
              <div className="guardian-status-pill" title="Guardian is actively monitoring cognitive manipulation signals">
                <span className="pulse-dot"></span>
                <span>Guardian Active</span>
              </div>

              {/* Account Profile Chip */}
              <div className="user-chip">
                <div className="user-avatar" style={{ position: 'relative' }}>
                  {account.accountHolder.split(' ').map(n => n[0]).join('')}
                  <span style={{
                    position: 'absolute',
                    bottom: -1,
                    right: -1,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '1.5px solid white'
                  }} />
                </div>
                <div>
                  <div className="user-name">{account.accountHolder}</div>
                </div>
              </div>

              {/* Reset Flow Button */}
              <button 
                className="btn btn-outline" 
                style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '6px', borderRadius: 'var(--radius-full)' }}
                onClick={resetDemo}
                title="Reset simulation to initial state"
              >
                <RefreshCw size={12} />
                <span>Reset Flow</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
