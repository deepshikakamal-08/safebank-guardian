import React from 'react';
import { 
  MessageSquareQuote, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw,
  Lock,
  Eye
} from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';
import { DEMO_SCENARIOS } from '../../data/mockData';

export default function ScamContext() {
  const { 
    scamMessage, 
    setScamMessage, 
    performAnalysis, 
    isAnalyzing, 
    setActiveScreen,
    paymentDraft
  } = useGuardian();

  const handleSetExample = (text) => {
    setScamMessage(text);
  };

  return (
    <div className="scam-context-view" style={{ maxWidth: '740px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Scam Message & Context Verification</h2>
            <p className="card-subtitle">
              Evaluating psychological manipulation for transfer of ₹{Number(paymentDraft.amount).toLocaleString('en-IN')} to {paymentDraft.recipientName}
            </p>
          </div>
          <span className="brand-badge">Step 3 of 5</span>
        </div>

        {/* Informative Prompt Banner */}
        <div className="message-prompt-banner">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <MessageSquareQuote size={24} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                Did someone call, text, or instruct you to initiate this transfer?
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Social engineering scammers create artificial panic to bypass security checks. Paste any suspicious message or request you received below.
              </div>
            </div>
          </div>
        </div>

        {/* Message Input Area */}
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" htmlFor="scamTextarea">
            <span>Suspicious Message Content</span>
            <span className="form-label-hint">Paste SMS, WhatsApp, or Call script</span>
          </label>
          <textarea
            id="scamTextarea"
            className="scam-textarea"
            value={scamMessage}
            onChange={(e) => setScamMessage(e.target.value)}
            placeholder="Paste message here... e.g., 'Your bank account will be blocked today...'"
            rows={4}
          />

          {/* Quick Preset Buttons */}
          <div className="sample-messages-box">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick demo samples:</span>
            <button
              type="button"
              className="sample-pill"
              onClick={() => handleSetExample(DEMO_SCENARIOS.highRisk.scamMessage)}
              title="Official demo message"
            >
              🚨 Bank Account Block Threat (₹50k)
            </button>
            <button
              type="button"
              className="sample-pill"
              onClick={() => handleSetExample(DEMO_SCENARIOS.mediumRisk.scamMessage)}
            >
              ⚠️ Medical Distress (₹15k)
            </button>
            <button
              type="button"
              className="sample-pill"
              onClick={() => handleSetExample(DEMO_SCENARIOS.lowRisk.scamMessage)}
            >
              ✅ Regular Friend Split (₹1.2k)
            </button>
          </div>
        </div>

        {/* Explicit Privacy & Zero Snooping Declaration */}
        <div className="privacy-callout">
          <Lock size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Explicit Customer Consent Principle:</strong> SafeBank Guardian does <u>not</u> automatically scan or snoop on private SMS or WhatsApp messages. Context is only analyzed when you explicitly paste or submit it here.
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setActiveScreen('send')}
          >
            Back to Payment
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={performAnalysis}
            disabled={isAnalyzing || !scamMessage.trim()}
            style={{ padding: '13px 26px', fontSize: '1rem' }}
          >
            {isAnalyzing ? (
              <>
                <span className="pulse-dot" style={{ background: 'white' }}></span>
                <span>Correlating Signals...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analyze with Guardian</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
