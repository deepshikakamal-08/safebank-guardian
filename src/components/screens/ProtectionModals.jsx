import React, { useState } from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  AlertTriangle, 
  X, 
  Check, 
  Users, 
  Lock, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';

export function VerificationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Official Verification Guide</h3>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
          Follow these golden safety rules before transferring money under pressure:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 10, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid var(--border-light)' }}>
            <Check size={16} color="#059669" style={{ flexShrink: 0, marginTop: 3 }} />
            <div style={{ fontSize: '0.82rem' }}>
              <strong>Bank Golden Rule:</strong> SafeBank will <u>NEVER</u> ask you to transfer money to another account to "verify", "unblock", or "protect" your funds.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid var(--border-light)' }}>
            <PhoneCall size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: 3 }} />
            <div style={{ fontSize: '0.82rem' }}>
              <strong>Call Official Helpline:</strong> Dial <strong>1800-SAFE-BANK (1800-723-3226)</strong> directly from your keypad. Scammers can spoof caller ID numbers to look official.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid var(--border-light)' }}>
            <Lock size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 3 }} />
            <div style={{ fontSize: '0.82rem' }}>
              <strong>Zero Credential Sharing:</strong> Never disclose your MPIN, OTP, or net banking password. Bank officials do not need your credentials.
            </div>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          onClick={onClose}
        >
          Understood • Return to Interventions
        </button>
      </div>
    </div>
  );
}

export function TrustedContactModal({ isOpen, onClose, onConfirm }) {
  const { account } = useGuardian();
  const [consentGiven, setConsentGiven] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Ask Trusted Contact</h3>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid var(--border-light)', marginBottom: 18 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Designated Contact</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{account.trustedContact.name} ({account.trustedContact.relation})</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{account.trustedContact.phone}</div>
        </div>

        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 16 }}>
          When in doubt, a trusted family member can review the situation objectively and help identify high-pressure scams.
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', marginBottom: 20 }}>
          <input 
            type="checkbox" 
            checked={consentGiven} 
            onChange={(e) => setConsentGiven(e.target.checked)}
            style={{ marginTop: 3 }} 
          />
          <span>
            <strong>Explicit Consent:</strong> I authorize SafeBank Guardian to share a secure alert and the transaction details with {account.trustedContact.name}. No passwords or PINs will ever be revealed.
          </span>
        </label>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1.4 }}
            disabled={!consentGiven}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Send Alert to Contact
          </button>
        </div>
      </div>
    </div>
  );
}

export function ContinueAnywayModal({ isOpen, onClose, onConfirmProceed }) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--risk-bg)', color: 'var(--risk-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--risk-dark)' }}>Customer Autonomy Confirmation</h3>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
          SafeBank Guardian does not permanently seize or confiscate your funds. As our customer, you retain ultimate authority.
        </p>

        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 14, borderRadius: 8, marginBottom: 18, fontSize: '0.82rem', color: '#991b1b', lineHeight: 1.4 }}>
          ⚠️ <strong>High Risk Warning:</strong> If you are acting on instructions from a phone caller claiming your account will be suspended, you are very likely speaking to an impersonator. Once funds are transferred via UPI, they cannot easily be reversed.
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', marginBottom: 20 }}>
          <input 
            type="checkbox" 
            checked={acknowledged} 
            onChange={(e) => setAcknowledged(e.target.checked)}
            style={{ marginTop: 3 }} 
          />
          <span>
            I acknowledge the manipulation warning and confirm I am proceeding voluntarily under my own judgment.
          </span>
        </label>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
            Stay Protected
          </button>
          <button 
            className="btn btn-danger" 
            style={{ flex: 1.2 }}
            disabled={!acknowledged}
            onClick={() => {
              onConfirmProceed();
              onClose();
            }}
          >
            Authorize Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
