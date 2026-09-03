import React from 'react';
import { Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';

export default function Navbar() {
  const { 
    account, 
    activeScreen,
    activeScenarioKey, 
    switchScenario, 
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

              {/* Quick Scenario Switcher for Hackathon Judges */}
              <div className="scenario-selector">
                <span className="scenario-label">Demo Preset:</span>
                <select
                  className="scenario-select"
                  value={activeScenarioKey}
                  onChange={(e) => switchScenario(e.target.value)}
                  title="Select a hackathon demonstration scenario"
                >
                  <option value="highRisk">🚨 High Risk: Impersonation Threat (₹50k)</option>
                  <option value="mediumRisk">⚠️ Med Risk: Urgent Aid Request (₹15k)</option>
                  <option value="lowRisk">✅ Low Risk: Routine Friend Transfer (₹1.2k)</option>
                </select>
              </div>

              {/* Account Profile Chip */}
              <div className="user-chip">
                <div className="user-avatar">
                  {account.accountHolder.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="user-name">{account.accountHolder}</div>
                </div>
              </div>

              {/* Quick Restart Demo */}
              <button 
                className="btn btn-outline" 
                style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                onClick={resetDemo}
                title="Reset flow to beginning"
              >
                <RefreshCw size={13} />
                <span>Reset Demo</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
