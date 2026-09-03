import React from 'react';
import { Check, ShieldAlert } from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';

const STEPS = [
  { id: 'home', label: '1. Banking Home', sub: 'Simulated Account' },
  { id: 'send', label: '2. Send Money', sub: 'Intent & Beneficiary' },
  { id: 'context', label: '3. Scam Context', sub: 'Message Analysis' },
  { id: 'analysis', label: '4. Guardian Analysis', sub: 'Explainable Signals', isHero: true },
  { id: 'protection', label: '5. Protection', sub: 'Proportional Action' }
];

export default function StepTracker() {
  const { activeScreen, setActiveScreen, isPaused } = useGuardian();

  const getStepIndex = (screenId) => {
    if (screenId === 'paused') return 4;
    return STEPS.findIndex(s => s.id === screenId);
  };

  const currentIndex = getStepIndex(activeScreen);

  return (
    <div className="stepper-container">
      <div className="stepper-list">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentIndex;
          const isCompleted = idx < currentIndex;

          return (
            <React.Fragment key={step.id}>
              <div 
                className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setActiveScreen(step.id)}
                title={`Jump to ${step.label}`}
              >
                <div className="step-number">
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : step.isHero ? (
                    <ShieldAlert size={14} />
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className="step-text">
                  <span className="step-title">
                    {step.label}
                    {step.isHero && <span style={{ marginLeft: 4, color: '#dc2626', fontSize: '0.65rem', fontWeight: 800 }}>★ HERO</span>}
                  </span>
                  <span className="step-sub">{step.sub}</span>
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <div 
                  className="step-divider-line" 
                  style={{
                    backgroundColor: idx < currentIndex ? 'var(--safe-emerald)' : 'var(--border-light)'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
