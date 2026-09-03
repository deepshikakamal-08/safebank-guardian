import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  UserX, 
  MessageSquare, 
  AlertCircle, 
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';

export default function GuardianAnalysis() {
  const { 
    analysisResult, 
    paymentDraft, 
    scamMessage, 
    setActiveScreen 
  } = useGuardian();

  if (!analysisResult) {
    return <div>Loading analysis...</div>;
  }

  const isHigh = analysisResult.riskLevel === 'HIGH';
  const isMed = analysisResult.riskLevel === 'MEDIUM';
  const isLow = analysisResult.riskLevel === 'LOW';

  const riskClass = isHigh ? 'level-high' : isMed ? 'level-medium' : 'level-low';

  return (
    <div className="guardian-analysis-hero-view" style={{ maxWidth: '980px', margin: '0 auto' }}>
      
      {/* 5-SECOND HERO RISK CARD */}
      <div className={`hero-analysis-header ${riskClass}`}>
        <div className="risk-level-banner">
          <div className={`risk-level-badge ${isMed ? 'badge-medium' : isLow ? 'badge-low' : ''}`}>
            <ShieldAlert size={18} />
            <span>{isHigh ? 'HIGH MANIPULATION RISK' : `${analysisResult.riskLevel} MANIPULATION RISK`}</span>
          </div>
          <div className="risk-signals-cue-chip">
            <Sparkles size={14} style={{ flexShrink: 0 }} />
            <span>
              {isHigh 
                ? 'Multiple high-confidence risk signals detected' 
                : isMed 
                  ? 'Multiple moderate-risk signals detected' 
                  : 'Standard baseline signals verified'}
            </span>
          </div>
        </div>

        <h1 className="diagnosis-headline">
          {analysisResult.diagnosisTitle}
        </h1>

        <div className="diagnosis-explanation">
          {analysisResult.explanation}
        </div>
      </div>

      {/* TWO CLEARLY SEPARATED SIGNAL GROUPS */}
      <div className="signals-grid-2col">
        {/* GROUP 1: TRANSACTION SIGNALS */}
        <div className="signal-group-card">
          <div className="signal-group-header">
            <TrendingUp size={20} color="#0284c7" />
            <div>
              <div className="signal-group-title">Transaction Signals</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment Intent & Spending Baselines</div>
            </div>
          </div>

          <div className="signals-list">
            {analysisResult.transactionSignals.map(sig => {
              const isAnomaly = sig.status === 'anomaly';
              const isCaution = sig.status === 'caution';
              return (
                <div 
                  key={sig.id} 
                  className={`signal-item ${isAnomaly ? 'signal-anomaly' : isCaution ? 'signal-caution' : 'signal-normal'}`}
                >
                  <div className="signal-icon-wrap">
                    {isAnomaly ? (
                      <AlertTriangle size={18} color="#dc2626" />
                    ) : isCaution ? (
                      <AlertCircle size={18} color="#d97706" />
                    ) : (
                      <CheckCircle2 size={18} color="#059669" />
                    )}
                  </div>
                  <div className="signal-text">
                    <div className="signal-item-name">{sig.title}</div>
                    <div className="signal-item-desc">{sig.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GROUP 2: SCAM CONTEXT SIGNALS */}
        <div className="signal-group-card">
          <div className="signal-group-header">
            <MessageSquare size={20} color="#dc2626" />
            <div>
              <div className="signal-group-title">Scam Context Signals</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer-Provided Communication Analysis</div>
            </div>
          </div>

          <div className="signals-list">
            {analysisResult.scamContextSignals.map(sig => {
              const isDetected = sig.detected;
              return (
                <div 
                  key={sig.id} 
                  className={`signal-item ${isDetected ? 'signal-anomaly' : 'signal-normal'}`}
                >
                  <div className="signal-icon-wrap">
                    {isDetected ? (
                      <AlertTriangle size={18} color="#dc2626" />
                    ) : (
                      <CheckCircle2 size={18} color="#059669" />
                    )}
                  </div>
                  <div className="signal-text">
                    <div className="signal-item-name">{sig.title}</div>
                    <div className="signal-item-desc">{sig.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CORE DIFFERENTIATOR COMPARISON BANNER */}
      <div className="paradigm-comparison-card">
        <div className="paradigm-column">
          <span className="paradigm-label">Traditional Fraud Detection</span>
          <div className="paradigm-question">"Is this transaction suspicious?"</div>
          <p className="paradigm-outcome">
            ❌ <strong>Fails to catch:</strong> The user entered valid credentials, correct OTP, and clicked Send from a trusted phone. The system allows the transfer.
          </p>
        </div>

        <div className="paradigm-column" style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '20px' }}>
          <span className="paradigm-label" style={{ color: '#38bdf8' }}>SafeBank Guardian</span>
          <div className="paradigm-question" style={{ color: '#38bdf8' }}>"Is the customer being manipulated?"</div>
          <p className="paradigm-outcome" style={{ color: '#e0f2fe' }}>
            ✅ <strong>Catches the scam:</strong> Combined urgency + threat + large amount to new payee flags social engineering before money is lost.
          </p>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px' }}>
        <button 
          className="btn btn-outline" 
          onClick={() => setActiveScreen('context')}
        >
          Modify Message Context
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Recommended Action: <strong>{analysisResult.recommendation}</strong>
          </span>
          <button 
            className="btn btn-danger"
            onClick={() => setActiveScreen('protection')}
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            <span>Proceed to Guardian Protection</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}
