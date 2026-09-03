import React from 'react';
import { 
  ArrowRight, 
  ShieldAlert, 
  UserPlus, 
  Users, 
  Smartphone, 
  Wifi, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';

export default function SendMoney() {
  const { 
    account, 
    paymentDraft, 
    setPaymentDraft, 
    setActiveScreen 
  } = useGuardian();

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setPaymentDraft(prev => ({ ...prev, amount: val ? parseInt(val, 10) : '' }));
  };

  const handleQuickAmount = (amt) => {
    setPaymentDraft(prev => ({ ...prev, amount: amt }));
  };

  const setBeneficiary = (status) => {
    setPaymentDraft(prev => ({ ...prev, beneficiaryStatus: status }));
  };

  return (
    <div className="send-money-view" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header" style={{ marginBottom: '24px' }}>
          <div>
            <h2 className="card-title">Initiate Transfer</h2>
            <p className="card-subtitle">
              Debiting from: {account.accountType} ({account.accountNumber}) • Available: ₹{account.balance.toLocaleString('en-IN')}
            </p>
          </div>
          <span className="brand-badge">Step 2 of 5</span>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setActiveScreen('context'); }} className="form-grid">
          {/* Recipient Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="recipientName">
              <span>Recipient Name</span>
              <span className="form-label-hint">As registered or provided</span>
            </label>
            <input
              id="recipientName"
              type="text"
              className="form-input"
              value={paymentDraft.recipientName}
              onChange={(e) => setPaymentDraft({ ...paymentDraft, recipientName: e.target.value })}
              placeholder="e.g. Account Verification Desk or John Doe"
              required
            />
          </div>

          {/* Account / UPI ID */}
          <div className="form-group">
            <label className="form-label" htmlFor="recipientUpi">
              <span>Account Number or UPI ID</span>
              <span className="form-label-hint">Virtual Payment Address</span>
            </label>
            <input
              id="recipientUpi"
              type="text"
              className="form-input"
              value={paymentDraft.recipientUpi}
              onChange={(e) => setPaymentDraft({ ...paymentDraft, recipientUpi: e.target.value })}
              placeholder="e.g. verify.desk91@axispay or 9876543210@upi"
              required
            />
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="amount">
              <span>Transfer Amount</span>
              <span className="form-label-hint">Your 30-day average: ₹3,200</span>
            </label>
            <div className="input-wrapper">
              <span className="amount-symbol-prefix">₹</span>
              <input
                id="amount"
                type="text"
                className="form-input amount-input-lg"
                value={paymentDraft.amount ? paymentDraft.amount.toLocaleString('en-IN') : ''}
                onChange={handleAmountChange}
                placeholder="0"
                required
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="quick-amount-pills">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Demo quick sets:</span>
              <button 
                type="button"
                className={`pill-btn ${paymentDraft.amount === 1200 ? 'active' : ''}`}
                onClick={() => handleQuickAmount(1200)}
              >
                ₹1,200 (Routine)
              </button>
              <button 
                type="button"
                className={`pill-btn ${paymentDraft.amount === 15000 ? 'active' : ''}`}
                onClick={() => handleQuickAmount(15000)}
              >
                ₹15,000 (Medium)
              </button>
              <button 
                type="button"
                className={`pill-btn ${paymentDraft.amount === 50000 ? 'active' : ''}`}
                onClick={() => handleQuickAmount(50000)}
              >
                ₹50,000 (Scam Target)
              </button>
            </div>
          </div>

          {/* Beneficiary Status Selector */}
          <div className="form-group">
            <label className="form-label">
              <span>Beneficiary Status</span>
              <span className="form-label-hint">Key behavioral signal</span>
            </label>
            <div className="beneficiary-toggle-group">
              <div 
                className={`toggle-card ${paymentDraft.beneficiaryStatus === 'new' ? 'selected alert-style' : ''}`}
                onClick={() => setBeneficiary('new')}
              >
                <input 
                  type="radio" 
                  name="beneficiaryStatus" 
                  checked={paymentDraft.beneficiaryStatus === 'new'} 
                  onChange={() => setBeneficiary('new')}
                  className="toggle-radio"
                />
                <div>
                  <div className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UserPlus size={16} color="#d97706" />
                    <span>New Beneficiary</span>
                  </div>
                  <div className="toggle-desc">First-time payee. Added recently without past verified history.</div>
                </div>
              </div>

              <div 
                className={`toggle-card ${paymentDraft.beneficiaryStatus === 'existing' ? 'selected' : ''}`}
                onClick={() => setBeneficiary('existing')}
              >
                <input 
                  type="radio" 
                  name="beneficiaryStatus" 
                  checked={paymentDraft.beneficiaryStatus === 'existing'} 
                  onChange={() => setBeneficiary('existing')}
                  className="toggle-radio"
                />
                <div>
                  <div className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={16} color="#059669" />
                    <span>Existing Beneficiary</span>
                  </div>
                  <div className="toggle-desc">Recognized payee with previous confirmed transactions.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Simulated Device & Timing Indicators */}
          <div className="device-indicator-box">
            <div className="device-meta-items">
              <span className="meta-item">
                <Smartphone size={14} color="#0284c7" />
                <span>{account.currentDevice}</span>
              </span>
              <span className="meta-item">
                <Wifi size={14} color="#059669" />
                <span>Trusted Home Network</span>
              </span>
            </div>
            <div className="meta-item" style={{ color: '#d97706', fontWeight: 600 }}>
              <Clock size={14} />
              <span>Rapid pacing detected</span>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => setActiveScreen('home')}
            >
              Cancel
            </button>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '13px 26px', fontSize: '1rem' }}
            >
              <span>Check with Guardian</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
