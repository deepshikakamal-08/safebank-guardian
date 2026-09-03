import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  MessageSquare, 
  AlertCircle, 
  Sparkles,
  CheckCircle2,
  Clock,
  Shield
} from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';

export default function GuardianAnalysis() {
  const { 
    analysisResult, 
    paymentDraft, 
    setActiveScreen,
    setContinueDisclaimerOpen 
  } = useGuardian();

  if (!analysisResult) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
        Loading Guardian Analysis...
      </div>
    );
  }

  const isHigh = analysisResult.riskLevel === 'HIGH';
  const isMed = analysisResult.riskLevel === 'MEDIUM';
  const isLow = analysisResult.riskLevel === 'LOW';

  const riskClass = isHigh ? 'level-high' : isMed ? 'level-medium' : 'level-low';

  // Extract structured ML values
  const mlLabel = analysisResult.predictedLabel || (analysisResult.scamProbability >= 0.5 ? 'SCAM' : 'LEGITIMATE');
  const isMlScam = mlLabel === 'SCAM';
  const scamProbRaw = typeof analysisResult.scamProbability === 'number' ? analysisResult.scamProbability : 0;
  const scamProbDisplay = analysisResult.scamProbabilityPercent || `${(scamProbRaw * 100).toFixed(1)}%`;
  const topFeatures = analysisResult.topFeatures || [];

  // Extract statistical behavioral values
  const behavioralStats = analysisResult.behavioralStats || {
    mean: 3210,
    stdDev: 1169.71,
    currentAmount: analysisResult.amount || 0,
    zScore: 0,
    isAnomaly: false,
    status: 'normal'
  };

  // Extract prototype risk fusion values
  const fusionResult = analysisResult.fusionResult || {
    fusedScore: analysisResult.riskScore || 0,
    riskLevel: analysisResult.riskLevel || 'LOW',
    recommendation: analysisResult.recommendation,
    contributingReasons: [],
    components: {}
  };

  const fusedScore = fusionResult.fusedScore ?? Math.round(analysisResult.riskScore || 0);
  const isNewBeneficiary = paymentDraft.beneficiaryStatus === 'new' || analysisResult.isNewBeneficiary;

  return (
    <div className="guardian-analysis-hero-view" style={{ maxWidth: '820px', margin: '0 auto', paddingTop: '10px', paddingBottom: '36px' }}>
      
      {/* 1. HERO SECTION */}
      <div className={`hero-analysis-header ${riskClass}`} style={{ marginBottom: '16px', borderRadius: 'var(--radius-xl)' }}>
        <div className="risk-level-banner" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              fontSize: '0.78rem', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em', 
              color: isHigh ? '#991b1b' : isMed ? '#92400e' : '#065f46' 
            }}>
              Guardian Analysis
            </span>
            <div className={`risk-level-badge ${isMed ? 'badge-medium' : isLow ? 'badge-low' : ''}`} style={{ margin: 0 }}>
              <ShieldAlert size={14} />
              <span>{analysisResult.riskLevel} RISK</span>
            </div>
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: isHigh ? '#991b1b' : isMed ? '#92400e' : '#065f46',
            background: 'rgba(255, 255, 255, 0.85)',
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${isHigh ? '#fca5a5' : isMed ? '#fcd34d' : '#a7f3d0'}`,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            {fusedScore} <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.75 }}>/ 100</span>
          </div>
        </div>

        <h1 className="diagnosis-headline" style={{ fontSize: '1.45rem', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          {analysisResult.diagnosisTitle}
        </h1>

        <p className="diagnosis-explanation" style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.5, opacity: 0.95 }}>
          {analysisResult.explanation}
        </p>
      </div>

      {/* 2. PRIMARY WARNING CARD */}
      <div style={{
        background: isHigh ? '#fef2f2' : isMed ? '#fffbeb' : '#f0fdf4',
        border: `1.5px solid ${isHigh ? '#fecaca' : isMed ? '#fde68a' : '#bbf7d0'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: isHigh ? '#fee2e2' : isMed ? '#fef3c7' : '#dcfce7',
          color: isHigh ? '#dc2626' : isMed ? '#d97706' : '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {isHigh ? <ShieldAlert size={22} /> : isMed ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
        </div>
        <div>
          <h2 style={{
            fontSize: '1.02rem',
            fontWeight: 800,
            margin: '0 0 3px 0',
            color: isHigh ? '#991b1b' : isMed ? '#92400e' : '#065f46'
          }}>
            {isHigh 
              ? 'Payment should be paused for verification' 
              : isMed 
                ? 'Verify before continuing' 
                : 'Payment appears consistent with your normal activity'}
          </h2>
          <p style={{
            fontSize: '0.85rem',
            margin: 0,
            color: isHigh ? '#7f1d1d' : isMed ? '#78350f' : '#064e3b',
            lineHeight: 1.4
          }}>
            {isHigh 
              ? 'Multiple signals suggest this payment may be influenced by social engineering.' 
              : isMed 
                ? 'Elevated signals detected across communication or transaction baseline. Please verify recipient identity independently.' 
                : 'Transaction parameters align with your routine spending baselines and communication contains no scam patterns.'}
          </p>
        </div>
      </div>

      {/* 3. "WHY WE FLAGGED THIS" SECTION */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {isLow ? 'Verification Signals' : 'Why We Flagged This'}
          </h3>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            3 core protective indicators
          </span>
        </div>

        <div className="flagged-signals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          
          {/* Card A: Message Risk */}
          <div style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${isMlScam ? '#fca5a5' : 'var(--border-light)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={16} color={isMlScam ? '#dc2626' : '#059669'} />
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Message Risk
                  </span>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: isMlScam ? '#dc2626' : '#059669',
                  background: isMlScam ? '#fef2f2' : '#f0fdf4',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  border: `1px solid ${isMlScam ? '#fecaca' : '#bbf7d0'}`
                }}>
                  {mlLabel}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: '10px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: isMlScam ? '#b91c1c' : '#047857' }}>
                  {scamProbDisplay}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>scam probability</span>
              </div>

              {/* 2-3 Top Contributing ML Features */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 600 }}>
                  Top influential tokens:
                </div>
                {topFeatures && topFeatures.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {topFeatures.slice(0, 3).map((f, i) => (
                      <span key={i} style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        background: f.direction === 'SCAM' ? '#fff1f2' : '#f0fdf4',
                        color: f.direction === 'SCAM' ? '#be123c' : '#047857',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: `1px solid ${f.direction === 'SCAM' ? '#ffe4e6' : '#dcfce7'}`
                      }}>
                        &ldquo;{f.feature}&rdquo;
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No strong scam tokens</div>
                )}
              </div>
            </div>

            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
              TF-IDF + Logistic Regression
            </div>
          </div>

          {/* Card B: Payment Behavior */}
          <div style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${behavioralStats.isAnomaly ? '#fca5a5' : 'var(--border-light)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={16} color={behavioralStats.isAnomaly ? '#dc2626' : '#0284c7'} />
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Payment Behavior
                  </span>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: behavioralStats.isAnomaly ? '#dc2626' : '#059669',
                  background: behavioralStats.isAnomaly ? '#fef2f2' : '#f0fdf4',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  border: `1px solid ${behavioralStats.isAnomaly ? '#fecaca' : '#bbf7d0'}`
                }}>
                  {behavioralStats.isAnomaly ? 'Anomaly Detected' : 'Normal'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: '10px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: behavioralStats.isAnomaly ? '#b91c1c' : '#0f172a' }}>
                  {behavioralStats.zScore >= 0 ? '+' : ''}{behavioralStats.zScore.toFixed(2)}σ
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Behavioral Z-Score</span>
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Customer baseline:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{behavioralStats.mean.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current transfer:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: behavioralStats.isAnomaly ? '#dc2626' : 'var(--text-primary)' }}>
                    ₹{Number(paymentDraft.amount).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ 
              fontSize: '0.68rem', 
              color: behavioralStats.isAnomaly ? '#b91c1c' : 'var(--text-muted)', 
              fontWeight: 600,
              paddingTop: '8px', 
              borderTop: '1px solid var(--border-light)' 
            }}>
              {behavioralStats.isAnomaly ? 'Exceeds 3.0σ statistical outlier threshold' : 'Within routine spending baseline'}
            </div>
          </div>

          {/* Card C: Payment Context */}
          <div style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${isNewBeneficiary ? '#fde68a' : 'var(--border-light)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} color="#0284c7" />
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Payment Context
                  </span>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: isNewBeneficiary ? '#d97706' : '#059669',
                  background: isNewBeneficiary ? '#fffbeb' : '#f0fdf4',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  border: `1px solid ${isNewBeneficiary ? '#fde68a' : '#bbf7d0'}`
                }}>
                  {isNewBeneficiary ? 'New Payee' : 'Known Contact'}
                </span>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                  Stated Intent:
                </span>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                  {paymentDraft.paymentIntent || 'Following instructions from a message'}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Beneficiary:</span>
                  <strong style={{ color: isNewBeneficiary ? '#d97706' : '#059669' }}>
                    {isNewBeneficiary ? 'First-time added (<5 min)' : 'Established contact'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Recipient:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{paymentDraft.recipientName}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
              Context &amp; Relationship Exposure
            </div>
          </div>

        </div>
      </div>

      {/* 4. ACTION AREA */}
      <div className="card" style={{ 
        padding: '18px 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '16px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setActiveScreen('context')}
          style={{ fontSize: '0.86rem', padding: '10px 18px' }}
        >
          ← Edit Context
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Secondary "Continue Anyway" text action for High / Medium */}
          {!isLow && (
            <button
              type="button"
              className="btn-secondary-link"
              onClick={() => {
                setActiveScreen('protection');
                if (setContinueDisclaimerOpen) setContinueDisclaimerOpen(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.84rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '6px 4px',
                fontWeight: 500
              }}
            >
              Continue Anyway
            </button>
          )}

          {/* Primary Action Button */}
          {isHigh ? (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setActiveScreen('protection')}
              style={{ padding: '12px 26px', fontSize: '0.98rem', fontWeight: 700 }}
            >
              <span>Pause &amp; Verify</span>
              <ArrowRight size={18} />
            </button>
          ) : isMed ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveScreen('protection')}
              style={{ padding: '12px 26px', fontSize: '0.98rem', fontWeight: 700, background: 'var(--warning-amber)' }}
            >
              <span>Verify Payment</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveScreen('protection')}
              style={{ padding: '12px 26px', fontSize: '0.98rem', fontWeight: 700, background: 'var(--safe-emerald)' }}
            >
              <span>Continue Payment</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 5. COLLAPSED TECHNICAL DETAILS SECTION */}
      <details style={{
        padding: '12px 16px',
        background: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)'
      }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-muted)', userSelect: 'none' }}>
          Technical fusion &amp; audit details
        </summary>
        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', lineHeight: 1.5 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>ML Model (40%):</span>
              <strong>+{fusionResult.components?.ml?.contribution ?? 0} pts</strong> ({scamProbDisplay})
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Z-Score (25%):</span>
              <strong>+{fusionResult.components?.behavior?.contribution ?? 0} pts</strong> ({behavioralStats.zScore.toFixed(2)}σ)
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Intent (20%):</span>
              <strong>+{fusionResult.components?.intent?.contribution ?? 0} pts</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Beneficiary (15%):</span>
              <strong>+{fusionResult.components?.beneficiary?.contribution ?? 0} pts</strong>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Engine: {fusionResult.engineName || 'Prototype Risk Fusion'} • Fused Score: {fusedScore}/100 • Synergy: +{fusionResult.synergyModifier || 0} pts. Experimental prototype combining real client-side ML text inference, statistical baseline Z-score, stated payment intent, and beneficiary status.
          </p>
        </div>
      </details>

    </div>
  );
}
