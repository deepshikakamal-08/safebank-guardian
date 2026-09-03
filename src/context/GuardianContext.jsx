import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ACCOUNT, INITIAL_TRANSACTIONS, DEMO_SCENARIOS, analyzeTransactionWithGuardian } from '../data/mockData';

const GuardianContext = createContext();

export function GuardianProvider({ children }) {
  const [activeScreen, setActiveScreen] = useState('home'); // 'home' | 'send' | 'context' | 'analysis' | 'protection' | 'paused'
  const [activeScenarioKey, setActiveScenarioKey] = useState('highRisk');
  const [account, setAccount] = useState(INITIAL_ACCOUNT);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  // Form state
  const [paymentDraft, setPaymentDraft] = useState({
    recipientName: DEMO_SCENARIOS.highRisk.recipientName,
    recipientUpi: DEMO_SCENARIOS.highRisk.recipientUpi,
    amount: DEMO_SCENARIOS.highRisk.amount,
    beneficiaryStatus: DEMO_SCENARIOS.highRisk.beneficiaryStatus,
    paymentIntent: DEMO_SCENARIOS.highRisk.paymentIntent || "Following instructions from a message"
  });

  const [scamMessage, setScamMessage] = useState(DEMO_SCENARIOS.highRisk.scamMessage);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Interventions state
  const [isPaused, setIsPaused] = useState(false);
  const [coolingTimerSeconds, setCoolingTimerSeconds] = useState(4 * 3600); // 4 hours
  const [contactNotified, setContactNotified] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [trustedModalOpen, setTrustedModalOpen] = useState(false);
  const [continueDisclaimerOpen, setContinueDisclaimerOpen] = useState(false);

  // Run initial analysis with default scenario
  useEffect(() => {
    const initialAnalysis = analyzeTransactionWithGuardian({
      amount: DEMO_SCENARIOS.highRisk.amount,
      beneficiaryStatus: DEMO_SCENARIOS.highRisk.beneficiaryStatus,
      message: DEMO_SCENARIOS.highRisk.scamMessage,
      recipientName: DEMO_SCENARIOS.highRisk.recipientName,
      paymentIntent: DEMO_SCENARIOS.highRisk.paymentIntent || "Following instructions from a message"
    });
    setAnalysisResult(initialAnalysis);
  }, []);

  // Cooling-off timer countdown effect
  useEffect(() => {
    let timer;
    if (isPaused && coolingTimerSeconds > 0) {
      timer = setInterval(() => {
        setCoolingTimerSeconds(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPaused, coolingTimerSeconds]);

  // Load a predefined scenario
  const switchScenario = (scenarioKey) => {
    const scenario = DEMO_SCENARIOS[scenarioKey];
    if (!scenario) return;

    setActiveScenarioKey(scenarioKey);
    setPaymentDraft({
      recipientName: scenario.recipientName,
      recipientUpi: scenario.recipientUpi,
      amount: scenario.amount,
      beneficiaryStatus: scenario.beneficiaryStatus,
      paymentIntent: scenario.paymentIntent || "Following instructions from a message"
    });
    setScamMessage(scenario.scamMessage);

    // Re-evaluate analysis
    const result = analyzeTransactionWithGuardian({
      amount: scenario.amount,
      beneficiaryStatus: scenario.beneficiaryStatus,
      message: scenario.scamMessage,
      recipientName: scenario.recipientName,
      paymentIntent: scenario.paymentIntent || "Following instructions from a message"
    });
    setAnalysisResult(result);
  };

  // Perform Guardian Analysis
  const performAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeTransactionWithGuardian({
        amount: paymentDraft.amount,
        beneficiaryStatus: paymentDraft.beneficiaryStatus,
        message: scamMessage,
        recipientName: paymentDraft.recipientName,
        paymentIntent: paymentDraft.paymentIntent
      });
      setAnalysisResult(result);
      setIsAnalyzing(false);
      setActiveScreen('analysis');
    }, 650);
  };

  // Pause Payment action
  const handlePausePayment = () => {
    setIsPaused(true);
    setActiveScreen('paused');
  };

  // Restart demo flow
  const resetDemo = () => {
    setIsPaused(false);
    setContactNotified(false);
    setCoolingTimerSeconds(4 * 3600);
    switchScenario('highRisk');
    setActiveScreen('home');
  };

  // Format seconds to HH:MM:SS
  const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <GuardianContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        activeScenarioKey,
        switchScenario,
        account,
        transactions,
        paymentDraft,
        setPaymentDraft,
        scamMessage,
        setScamMessage,
        isAnalyzing,
        analysisResult,
        performAnalysis,
        isPaused,
        handlePausePayment,
        coolingTimerSeconds,
        formatTimer,
        resetDemo,
        contactNotified,
        setContactNotified,
        verificationModalOpen,
        setVerificationModalOpen,
        trustedModalOpen,
        setTrustedModalOpen,
        continueDisclaimerOpen,
        setContinueDisclaimerOpen
      }}
    >
      {children}
    </GuardianContext.Provider>
  );
}

export function useGuardian() {
  const context = useContext(GuardianContext);
  if (!context) {
    throw new Error('useGuardian must be used within a GuardianProvider');
  }
  return context;
}
