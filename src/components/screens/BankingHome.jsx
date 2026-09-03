import React, { useState } from 'react';
import { 
  Send, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Info, 
  CheckCircle2, 
  Sparkles,
  QrCode,
  Lock
} from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';

export default function BankingHome() {
  const { account, transactions, setActiveScreen } = useGuardian();
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="banking-home-view">
      {/* Educational Paradigm Banner */}
      <div className="guardian-manifesto-banner">
        <span className="manifesto-badge">Guardian Differentiator</span>
        <div className="manifesto-text">
          <div>
            <strong>The SafeBank Philosophy:</strong> Traditional fraud detection asks <em>"Is this transaction suspicious?"</em>. 
            SafeBank Guardian asks <strong>"Is the customer being manipulated?"</strong> by evaluating emotional coercion, scam language, and intent before money ever leaves your account.
          </div>
          <div className="manifesto-flow-story">
            <span className="flow-story-label">Demo Story:</span>
            <span className="flow-step-pill">Scam Message</span>
            <span className="flow-story-arrow">→</span>
            <span className="flow-step-pill current">Payment Intent</span>
            <span className="flow-story-arrow">→</span>
            <span className="flow-step-pill">Guardian Analysis</span>
            <span className="flow-story-arrow">→</span>
            <span className="flow-step-pill danger">High Risk</span>
            <span className="flow-story-arrow">→</span>
            <span className="flow-step-pill safe">Protection</span>
          </div>
        </div>
      </div>

      {/* Account Balance & Guardian Summary Grid */}
      <div className="balance-card-grid">
        {/* Left: Account Overview Card */}
        <div className="account-overview-card">
          <div className="account-label">
            <span>{account.accountType}</span>
            <button 
              onClick={() => setShowBalance(!showBalance)} 
              className="btn-secondary-link"
              style={{ padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showBalance ? 'Hide' : 'Show'}</span>
            </button>
          </div>

          <div className="account-balance">
            <span className="balance-symbol">{account.currency}</span>
            <span>{showBalance ? account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '••••••••'}</span>
          </div>

          <div className="account-meta-row">
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Account Number</span>
              <span className="account-number-pill">{account.accountNumber}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>IFSC Code</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>{account.ifscCode}</span>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Status</span>
              <span style={{ color: 'var(--safe-emerald)', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} /> Active & Insured
              </span>
            </div>
          </div>
        </div>

        {/* Right: Guardian Safety Widget */}
        <div className="guardian-summary-widget">
          <div className="widget-shield-header">
            <div className="shield-icon-box">
              <ShieldCheck size={26} strokeWidth={2.5} />
            </div>
            <div>
              <div className="widget-title">Guardian Protection</div>
              <div className="widget-subtitle">Active Defense Shield</div>
            </div>
          </div>

          <ul className="security-checklist">
            <li className="checklist-item">
              <CheckCircle2 size={14} color="var(--safe-emerald)" />
              <span>Behavioral baseline verified</span>
            </li>
            <li className="checklist-item">
              <CheckCircle2 size={14} color="var(--safe-emerald)" />
              <span>Coercion & urgency scanner active</span>
            </li>
            <li className="checklist-item">
              <CheckCircle2 size={14} color="var(--safe-emerald)" />
              <span>Pre-transfer intervention armed</span>
            </li>
          </ul>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={12} />
            <span>Encrypted • Zero credential sharing</span>
          </div>
        </div>
      </div>

      {/* Primary Action Section: Dominant Primary CTA & Clear Secondary Cue */}
      <div className="dominant-cta-section">
        <div className="dominant-cta-main">
          <div className="dominant-cta-left">
            <button 
              className="btn-dominant-send"
              onClick={() => setActiveScreen('send')}
              id="btn-send-money-primary"
            >
              <div className="btn-dominant-send-content">
                <div className="btn-dominant-send-icon">
                  <Send size={22} />
                </div>
                <div className="btn-dominant-send-text">
                  <span className="btn-dominant-send-title">Send Money / Transfer Funds</span>
                  <span className="btn-dominant-send-desc">Initiate transfer to test SafeBank Guardian's real-time protection demo</span>
                </div>
              </div>
              <div className="btn-dominant-send-arrow">
                <ArrowUpRight size={20} />
              </div>
            </button>

            {/* Secondary Cue near payment CTA */}
            <div className="cta-guardian-cue">
              <ShieldCheck size={15} color="var(--safe-emerald)" />
              <span>Guardian will check this payment before it is sent.</span>
            </div>
          </div>

          <div className="secondary-actions-cluster">
            <button 
              className="btn btn-subdued-action" 
              onClick={() => alert("Simulated Demo: Click 'Send Money / Transfer Funds' to experience Guardian protection.")}
              title="Secondary banking action"
            >
              <QrCode size={15} />
              <span>Scan QR</span>
            </button>

            <button 
              className="btn btn-subdued-action" 
              onClick={() => alert("Simulated Demo: Click 'Send Money / Transfer Funds' to experience Guardian protection.")}
              title="Secondary banking action"
            >
              <Building2 size={15} />
              <span>Beneficiaries</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Transactions</h3>
            <p className="card-subtitle">Real-time simulated activity verified by SafeBank Guardian</p>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing 5 recent records
          </span>
        </div>

        <table className="tx-table">
          <thead>
            <tr>
              <th>Recipient / Description</th>
              <th>Category</th>
              <th>Date & Time</th>
              <th>Amount</th>
              <th>Guardian Verdict</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>
                  <div className="tx-recipient-cell">
                    <div className="tx-category-icon">
                      {tx.type === 'credit' ? <CreditCard size={18} /> : <Smartphone size={18} />}
                    </div>
                    <div>
                      <div className="tx-name">{tx.recipient}</div>
                      <div className="tx-upi">{tx.account}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{tx.category}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{tx.date}</td>
                <td>
                  <span className={`tx-amount ${tx.type}`}>
                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td>
                  <span className="guardian-badge-safe">
                    <ShieldCheck size={13} />
                    <span>{tx.guardianVerdict}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
