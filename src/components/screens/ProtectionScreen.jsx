import React, { useState } from 'react';
import { 
  PauseCircle, 
  ShieldCheck, 
  PhoneCall, 
  Users, 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Download,
  RotateCcw,
  Shield,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';
import { VerificationModal, TrustedContactModal, ContinueAnywayModal } from './ProtectionModals';

export default function ProtectionScreen() {
  const { 
    analysisResult, 
    paymentDraft, 
    account, 
    isPaused, 
    handlePausePayment, 
    coolingTimerSeconds, 
    formatTimer, 
    resetDemo, 
    setActiveScreen,
    contactNotified,
    setContactNotified,
    verificationModalOpen,
    setVerificationModalOpen,
    trustedModalOpen,
    setTrustedModalOpen,
    continueDisclaimerOpen,
    setContinueDisclaimerOpen
  } = useGuardian();

  const [downloadedReport, setDownloadedReport] = useState(false);
  const [completedTransfer, setCompletedTransfer] = useState(false);

  const isHigh = analysisResult?.riskLevel === 'HIGH';
  const isMed = analysisResult?.riskLevel === 'MEDIUM';
  const isLow = analysisResult?.riskLevel === 'LOW';

  // Trigger report download simulation
  const handleDownloadReport = () => {
    setDownloadedReport(true);
    const content = `SAFEBANK GUARDIAN — INCIDENT REPORT
Date: ${new Date().toLocaleString()}
Account Holder: ${account.accountHolder}
Account: ${account.accountNumber}
Risk Assessment: ${analysisResult.riskLevel === 'HIGH' ? 'HIGH MANIPULATION RISK — Multiple high-confidence risk signals detected' : `${analysisResult.riskLevel} RISK`}
Diagnosis: ${analysisResult.diagnosisTitle}
Target Beneficiary: ${paymentDraft.recipientName} (${paymentDraft.recipientUpi})
Prevented Amount: ₹${Number(paymentDraft.amount).toLocaleString('en-IN')}
Status: Payment Paused (4-Hour Safety Vault Hold)
Official Bank Helpline: 1800-SAFE-BANK (1800-723-3226)`;
    
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `SafeBank_Guardian_Audit_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // IF PAYMENT WAS COMPLETED BY USER OVERRIDE
  if (completedTransfer) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <AlertTriangle size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Transfer Dispatched via Override</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '0.9rem' }}>
            Amount ₹{Number(paymentDraft.amount).toLocaleString('en-IN')} sent to {paymentDraft.recipientName}. As requested, the transfer was processed per customer instruction.
          </p>
          <div style={{ marginTop: 24 }}>
            <button className="btn btn-primary" onClick={resetDemo}>
              Return to Banking Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // POST-PAUSE CONFIRMATION SCREEN (When Pause Payment is clicked)
  if (isPaused) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div className="paused-success-card">
          <div className="paused-icon-wrap">
            <ShieldCheck size={40} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Payment Safely Paused
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 6, maxWidth: '520px', margin: '6px auto 0' }}>
            Your ₹{Number(paymentDraft.amount).toLocaleString('en-IN')} remains 100% secure in your account. The transfer to <strong>{paymentDraft.recipientName}</strong> has been suspended for verification.
          </p>

          {/* Cooling-Off Countdown Timer */}
          <div className="timer-countdown-box">
            <Clock size={22} color="#0284c7" />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Safety Cooling-Off Timer
              </div>
              <div className="countdown-digits">
                {formatTimer(coolingTimerSeconds)}
              </div>
            </div>
          </div>

          {/* What happens during the pause? */}
          <div style={{ textAlign: 'left', background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-light)', margin: '16px 0 24px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              What happens during the pause?
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={15} color="#059669" />
                <span>Zero funds have left your SafeShield account.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={15} color="#059669" />
                <span>You have time to independently verify the caller/message.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={15} color="#059669" />
                <span>Official SafeBank verification number: <strong>1800-SAFE-BANK</strong>.</span>
              </li>
              {contactNotified && (
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontWeight: 600 }}>
                  <Users size={15} />
                  <span>Trusted contact ({account.trustedContact.name}) has been notified of the pause.</span>
                </li>
              )}
            </ul>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button 
              className="btn btn-outline" 
              onClick={handleDownloadReport}
            >
              <Download size={16} />
              <span>{downloadedReport ? 'Report Downloaded' : 'Download Audit Report'}</span>
            </button>

            <button 
              className="btn btn-primary" 
              onClick={() => {
                if (typeof setIsPaused === 'function') setIsPaused(false);
                setActiveScreen('home');
              }}
            >
              <span>Back to Banking Home</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PROTECTION SCREEN
  return (
    <div className="protection-screen-view" style={{ maxWidth: '860px', margin: '0 auto' }}>
      
      {/* Reassurance Banner: Protecting customer, not accusing them */}
      <div className="protection-reassurance">
        <ShieldCheck size={28} color="#2563eb" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ display: 'block', fontSize: '0.95rem' }}>We are protecting your funds, not questioning your competence.</strong>
          <span>
            Sophisticated fraudsters use fear, authority impersonation, and false deadlines to disrupt normal judgment. 
            SafeBank Guardian gives you proportional protection so you stay in complete control.
          </span>
        </div>
      </div>

      {/* PROPORTIONAL INTERVENTION OPTIONS */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Proportional Interventions</h2>
            <p className="card-subtitle">
              Calculated for {analysisResult?.riskLevel} Risk • Transfer of ₹{Number(paymentDraft.amount).toLocaleString('en-IN')}
            </p>
          </div>
          <span className={`risk-level-badge ${isMed ? 'badge-medium' : isLow ? 'badge-low' : ''}`}>
            {analysisResult?.riskLevel} Risk
          </span>
        </div>

        <div className="intervention-options-grid">
          
          {/* OPTION 1: PAUSE PAYMENT (Primary Action for HIGH Risk) */}
          {isHigh && (
            <div 
              className="intervention-card card-primary-action"
              onClick={handlePausePayment}
            >
              <div className="recommended-pill">Recommended Action</div>
              <div className="intervention-main">
                <div className="intervention-icon-large">
                  <PauseCircle size={26} strokeWidth={2.4} />
                </div>
                <div className="intervention-info">
                  <h4>Pause Payment (4-Hour Safety Vault Hold)</h4>
                  <p>
                    Temporarily hold this transaction without debiting your funds. Gives you breathing room to verify the threat without facing financial loss.
                  </p>
                  <div className="intervention-perk-list">
                    <span>✓ Zero funds transferred</span>
                    <span>✓ Cancels automatically if confirmed scam</span>
                    <span>✓ Reversible anytime</span>
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ padding: '12px 20px', whiteSpace: 'nowrap', alignSelf: 'center' }}
                onClick={(e) => { e.stopPropagation(); handlePausePayment(); }}
              >
                <span>Pause Payment</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* OPTION 2: VERIFY PAYMENT (Checklist & Official Guide) */}
          <div 
            className={`intervention-card ${isMed ? 'card-primary-action' : ''}`}
            onClick={() => setVerificationModalOpen(true)}
          >
            {isMed && <div className="recommended-pill">Recommended Action</div>}
            <div className="intervention-main">
              <div className="intervention-icon-large" style={{ background: '#f0fdf4', color: '#059669' }}>
                <PhoneCall size={24} />
              </div>
              <div className="intervention-info">
                <h4>Verify Payment via Official Channels</h4>
                <p>
                  Check whether this request originated from official bank channels. Review the 3 golden safety rules before confirming.
                </p>
                <div className="intervention-perk-list" style={{ color: '#047857' }}>
                  <span>✓ 1800-SAFE-BANK Direct Line</span>
                  <span>✓ Impersonation detection checklist</span>
                </div>
              </div>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ padding: '10px 18px', whiteSpace: 'nowrap', alignSelf: 'center' }}
              onClick={(e) => { e.stopPropagation(); setVerificationModalOpen(true); }}
            >
              <span>View Checklist</span>
            </button>
          </div>

          {/* OPTION 3: ASK TRUSTED CONTACT (Requires explicit consent) */}
          <div 
            className="intervention-card"
            onClick={() => setTrustedModalOpen(true)}
          >
            <div className="intervention-main">
              <div className="intervention-icon-large" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Users size={24} />
              </div>
              <div className="intervention-info">
                <h4>
                  Ask Trusted Contact 
                  {contactNotified && <span style={{ color: '#059669', fontSize: '0.8rem', marginLeft: 8 }}>✓ Alert Dispatched</span>}
                </h4>
                <p>
                  Share transaction details with your verified contact <strong>{account.trustedContact.name} ({account.trustedContact.relation})</strong> for a second opinion.
                </p>
                <div className="intervention-perk-list" style={{ color: '#047857' }}>
                  <span>✓ Requires explicit consent</span>
                  <span>✓ No passwords or PINs ever shared</span>
                </div>
              </div>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ padding: '10px 18px', whiteSpace: 'nowrap', alignSelf: 'center' }}
              onClick={(e) => { e.stopPropagation(); setTrustedModalOpen(true); }}
            >
              <span>{contactNotified ? 'Contact Alerted' : 'Notify Contact'}</span>
            </button>
          </div>

          {/* LOW RISK: STANDARD FLOW */}
          {isLow && (
            <div className="intervention-card card-primary-action" onClick={() => setCompletedTransfer(true)}>
              <div className="recommended-pill" style={{ background: 'var(--safe-emerald)' }}>Routine Transfer</div>
              <div className="intervention-main">
                <div className="intervention-icon-large" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <ShieldCheck size={26} />
                </div>
                <div className="intervention-info">
                  <h4>Safe to Proceed</h4>
                  <p>No social engineering signals or baseline anomalies detected. Proceed with standard authentication.</p>
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ background: 'var(--safe-emerald)' }}
                onClick={(e) => { e.stopPropagation(); setCompletedTransfer(true); }}
              >
                Complete Transfer
              </button>
            </div>
          )}

        </div>

        {/* Customer Autonomy Option: Continue as Secondary */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            type="button" 
            className="btn-secondary-link"
            onClick={() => setActiveScreen('analysis')}
          >
            ← Back to Analysis
          </button>

          <button 
            type="button" 
            className="btn-secondary-link"
            style={{ color: '#94a3b8', fontSize: '0.82rem' }}
            onClick={() => setContinueDisclaimerOpen(true)}
            title="Customers retain ultimate authority over their funds"
          >
            I understand the risk. Continue anyway (Secondary) →
          </button>
        </div>
      </div>

      {/* Interactive Modals */}
      <VerificationModal 
        isOpen={verificationModalOpen} 
        onClose={() => setVerificationModalOpen(false)} 
      />

      <TrustedContactModal 
        isOpen={trustedModalOpen} 
        onClose={() => setTrustedModalOpen(false)} 
        onConfirm={() => setContactNotified(true)} 
      />

      <ContinueAnywayModal 
        isOpen={continueDisclaimerOpen} 
        onClose={() => setContinueDisclaimerOpen(false)} 
        onConfirmProceed={() => setCompletedTransfer(true)} 
      />

    </div>
  );
}
