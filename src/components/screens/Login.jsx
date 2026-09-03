import React, { useState } from 'react';
import { Shield, ArrowRight, Lock, Check } from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';
import { CUSTOMER_PROFILES } from '../../data/mockData';

export default function Login() {
  const { selectedCustomerKey, selectCustomer, setActiveScreen } = useGuardian();
  const [selectedKey, setSelectedKey] = useState(selectedCustomerKey || 'aarav');

  const customerList = Object.values(CUSTOMER_PROFILES);
  const currentSelected = CUSTOMER_PROFILES[selectedKey] || customerList[0];

  const handleContinue = () => {
    selectCustomer(selectedKey);
    setActiveScreen('home');
  };

  return (
    <div className="login-screen-view" style={{ maxWidth: '620px', margin: '20px auto 40px', padding: '0 16px' }}>
      <div className="card" style={{ padding: '36px 32px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Brand & Tagline */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--brand-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
          }}>
            <Shield size={32} strokeWidth={2.4} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            SafeBank Guardian
          </h1>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '6px' }}>
            Pause. Verify. Stay Safe.
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            Secure banking protected against social engineering.
          </p>
        </div>

        {/* Section: Demo Customer Login */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '22px', marginBottom: '22px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Demo Customer Login
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Customer ID</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--safe-emerald)', fontWeight: 700 }}>
                ✓ Verified Demo Account
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              value={currentSelected.customerId}
              readOnly
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                letterSpacing: '0.05em'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Choose a demo customer:
            </span>
          </div>

          {/* 3 Profile Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {customerList.map((cust) => {
              const isSelected = cust.id === selectedKey;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedKey(cust.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-lg)',
                    border: `1.5px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                    background: isSelected ? '#f0f9ff' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.12)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--brand-primary)' : 'var(--bg-subtle)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}>
                      {cust.avatarInitials}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                          {cust.name}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          background: 'rgba(0,0,0,0.05)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          color: 'var(--text-muted)'
                        }}>
                          {cust.customerId}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: isSelected ? '#0369a1' : 'var(--text-muted)', marginTop: '2px' }}>
                        {cust.tagline} • Balance: ₹{cust.balance.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
                    background: isSelected ? 'var(--brand-primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Primary Action: Continue Securely */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleContinue}
            style={{ width: '100%', padding: '14px', fontSize: '1.02rem', fontWeight: 700, justifyContent: 'center' }}
          >
            <span>Continue Securely</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Small Privacy / Demo Note */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.76rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <Lock size={13} />
          <span>Demo environment — no real banking credentials are required.</span>
        </div>

      </div>
    </div>
  );
}
