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

  // Extract structured ML values
  const mlLabel = analysisResult.predictedLabel || (analysisResult.scamProbability >= 0.5 ? 'SCAM' : 'LEGITIMATE');
  const isMlScam = mlLabel === 'SCAM';
  const scamProbRaw = typeof analysisResult.scamProbability === 'number' ? analysisResult.scamProbability : 0;
  const scamProbDisplay = analysisResult.scamProbabilityPercent || `${(scamProbRaw * 100).toFixed(1)}%`;
  const legitProbDisplay = analysisResult.legitimateProbabilityPercent || `${((1 - scamProbRaw) * 100).toFixed(1)}%`;
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
              Prototype Risk Fusion: <strong>{fusionResult.fusedScore}/100</strong> ({analysisResult.riskLevel})
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

      {/* PROTOTYPE RISK FUSION ENGINE CARD */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px 24px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Prototype Risk Fusion Engine
              </h2>
              <span style={{ fontSize: '0.72rem', background: 'var(--brand-soft)', color: 'var(--brand-primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Experimental Prototype
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Multi-signal risk synthesis combining ML message analysis (40%), behavioral Z-score (25%), payment intent (20%), and beneficiary exposure (15%). Not scientifically validated for production banking use.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
              Fused Risk Score
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 900,
              fontSize: '1.6rem',
              color: isHigh ? '#dc2626' : isMed ? '#d97706' : '#059669'
            }}>
              {fusionResult.fusedScore} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
            </span>
          </div>
        </div>

        {/* 4 Multi-Signal Weight Components */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {/* ML Component */}
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>ML SCAM PROB</span>
              <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>40% wt</span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
              {analysisResult.scamProbabilityPercent || `${(analysisResult.scamProbability * 100).toFixed(1)}%`}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Contrib: +{fusionResult.components?.ml?.contribution ?? 0} pts
            </div>
          </div>

          {/* Behavioral Component */}
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>BEHAVIORAL Z-SCORE</span>
              <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>25% wt</span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
              {behavioralStats.zScore >= 0 ? '+' : ''}{behavioralStats.zScore.toFixed(2)}σ
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Contrib: +{fusionResult.components?.behavior?.contribution ?? 0} pts
            </div>
          </div>

          {/* Payment Intent Component */}
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>PAYMENT INTENT</span>
              <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>20% wt</span>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, marginTop: 4, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={paymentDraft.paymentIntent}>
              {paymentDraft.paymentIntent || 'Unspecified'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Contrib: +{fusionResult.components?.intent?.contribution ?? 0} pts
            </div>
          </div>

          {/* Beneficiary Status Component */}
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>BENEFICIARY STATUS</span>
              <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>15% wt</span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
              {paymentDraft.beneficiaryStatus === 'new' ? 'New Payee' : 'Existing Contact'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Contrib: +{fusionResult.components?.beneficiary?.contribution ?? 0} pts
            </div>
          </div>
        </div>

        {/* Contributing Reasons */}
        <div style={{ background: isHigh ? '#fef2f2' : isMed ? '#fffbeb' : '#f0fdf4', padding: '12px 14px', borderRadius: '8px', border: `1px solid ${isHigh ? '#fecaca' : isMed ? '#fde68a' : '#bbf7d0'}` }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Signals Contributing to Fused Assessment:
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {fusionResult.contributingReasons?.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
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
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer Behavioral Baseline & Statistical Z-Score</div>
            </div>
          </div>

          {/* Real Behavioral Anomaly (Z-Score) Overview Card */}
          <div style={{
            background: behavioralStats.isAnomaly ? '#fef2f2' : '#f0fdf4',
            border: `1.5px solid ${behavioralStats.isAnomaly ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Behavioral Baseline Anomaly
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: behavioralStats.isAnomaly ? '#dc2626' : '#059669',
                  marginTop: 2
                }}>
                  {behavioralStats.isAnomaly ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                  Behavioral anomaly: {behavioralStats.isAnomaly ? 'Detected' : 'Normal'}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Behavioral Z-Score
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: behavioralStats.isAnomaly ? '#b91c1c' : '#047857'
                }}>
                  {behavioralStats.zScore >= 0 ? '+' : ''}{behavioralStats.zScore.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Metrics List per Requirement 6 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Customer baseline: </span>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>₹{behavioralStats.mean.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Current transfer: </span>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>₹{behavioralStats.currentAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Behavioral Z-Score: </span>
                <strong style={{ color: behavioralStats.isAnomaly ? '#dc2626' : '#059669', fontFamily: 'var(--font-mono)' }}>
                  {behavioralStats.zScore.toFixed(2)}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Standard Deviation: </span>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>₹{behavioralStats.stdDev.toLocaleString('en-IN')}</strong>
              </div>
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

        {/* GROUP 2: ML SCAM MESSAGE ANALYSIS */}
        <div className="signal-group-card">
          <div className="signal-group-header">
            <MessageSquare size={20} color={isMlScam ? "#dc2626" : "#059669"} />
            <div>
              <div className="signal-group-title">ML Message Risk Analysis</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trained TF-IDF + Logistic Regression Classifier</div>
            </div>
          </div>

          {/* Model Prediction & Probability Card */}
          <div style={{
            background: isMlScam ? '#fef2f2' : '#f0fdf4',
            border: `1.5px solid ${isMlScam ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Message Risk
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: isMlScam ? '#dc2626' : '#059669',
                  marginTop: 2
                }}>
                  {isMlScam ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                  {mlLabel}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Scam Probability
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: isMlScam ? '#b91c1c' : '#047857'
                }}>
                  {scamProbDisplay}
                </span>
              </div>
            </div>

            {/* Probability Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
              <div style={{
                width: `${Math.min(Math.max(scamProbRaw * 100, 2), 100)}%`,
                height: '100%',
                background: isMlScam ? 'linear-gradient(90deg, #f87171, #dc2626)' : 'linear-gradient(90deg, #34d399, #059669)',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>Legitimate Confidence: {legitProbDisplay}</span>
              <span>Model: TF-IDF + LogReg (v1.0)</span>
            </div>
          </div>

          {/* Explainability Section */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              &ldquo;These features contributed strongly to the risk assessment.&rdquo;
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Feature-level contributions derived from learned logistic regression weights:
            </div>

            {topFeatures && topFeatures.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topFeatures.map((f, i) => {
                  const isScamFeature = f.direction === 'SCAM';
                  return (
                    <div 
                      key={i} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: isScamFeature ? '#fff1f2' : '#f0fdf4',
                        border: `1px solid ${isScamFeature ? '#ffe4e6' : '#dcfce7'}`,
                        borderRadius: '8px',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: isScamFeature ? '#e11d48' : '#059669', fontWeight: 700 }}>•</span>
                        <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                          &ldquo;{f.feature}&rdquo;
                        </strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: isScamFeature ? '#be123c' : '#047857'
                        }}>
                          {isScamFeature ? '+' : ''}{f.contribution.toFixed(4)} impact
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          padding: '2px 6px',
                          background: 'rgba(0,0,0,0.04)',
                          borderRadius: '4px'
                        }}>
                          {f.direction}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                No significant vocabulary triggers matched the model vocabulary.
              </div>
            )}
          </div>

          {/* Separation Notice */}
          <div style={{
            padding: '10px 12px',
            background: 'var(--bg-subtle)',
            borderRadius: '8px',
            fontSize: '0.73rem',
            color: 'var(--text-secondary)',
            borderLeft: '3px solid #0284c7',
            lineHeight: 1.4
          }}>
            <strong>Multi-Signal Risk Fusion:</strong> Linguistic features evaluated alongside behavioral baseline deviation (Z-Score) and customer payment intent. The customer always retains control over the payment.
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
