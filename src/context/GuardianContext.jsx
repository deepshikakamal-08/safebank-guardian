import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_ACCOUNT, 
  INITIAL_TRANSACTIONS, 
  DEMO_SCENARIOS, 
  CUSTOMER_PROFILES, 
  analyzeTransactionWithGuardian 
} from '../data/mockData';

const GuardianContext = createContext();

export function GuardianProvider({ children }) {
  // Navigation: 'login' -> 'home' -> 'send' -> 'context' -> 'analysis' -> 'protection' | 'paused'
  const [activeScreen, setActiveScreen] = useState('login');
  const [selectedCustomerKey, setSelectedCustomerKey] = useState('aarav');
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

  // Select a customer profile and update their account + baseline
  const selectCustomer = (customerKey) => {
    const profile = CUSTOMER_PROFILES[customerKey] || CUSTOMER_PROFILES.aarav;
    setSelectedCustomerKey(customerKey);
    setAccount({
      accountHolder: profile.name,
      accountNumber: profile.accountNumber,
      accountType: profile.accountType,
      ifscCode: profile.ifscCode,
      balance: profile.balance,
      currency: profile.currency,
      guardianShieldStatus: profile.guardianShieldStatus,
      baselineAverageTransfer: profile.baselineAverageTransfer,
      deviceTrustScore: profile.deviceTrustScore,
      currentDevice: profile.currentDevice,
      currentNetwork: profile.currentNetwork,
      customerId: profile.customerId,
      trustedContact: profile.trustedContact || INITIAL_ACCOUNT.trustedContact
    });
    setTransactions(profile.recentTransactions || INITIAL_TRANSACTIONS);

    // Recompute analysis with the newly selected customer's historical baseline
    const updatedAnalysis = analyzeTransactionWithGuardian({
      amount: paymentDraft.amount,
      beneficiaryStatus: paymentDraft.beneficiaryStatus,
      message: scamMessage,
      recipientName: paymentDraft.recipientName,
      paymentIntent: paymentDraft.paymentIntent || DEMO_SCENARIOS.highRisk.paymentIntent || "Following instructions from a message",
      transferHistory: profile.historicalAmounts
    });
    setAnalysisResult(updatedAnalysis);
  };

  // Run initial analysis with default scenario and default customer
  useEffect(() => {
    const profile = CUSTOMER_PROFILES[selectedCustomerKey] || CUSTOMER_PROFILES.aarav;
    const initialAnalysis = analyzeTransactionWithGuardian({
      amount: DEMO_SCENARIOS.highRisk.amount,
      beneficiaryStatus: DEMO_SCENARIOS.highRisk.beneficiaryStatus,
      message: DEMO_SCENARIOS.highRisk.scamMessage,
      recipientName: DEMO_SCENARIOS.highRisk.recipientName,
      paymentIntent: DEMO_SCENARIOS.highRisk.paymentIntent || "Following instructions from a message",
      transferHistory: profile.historicalAmounts
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

    const profile = CUSTOMER_PROFILES[selectedCustomerKey] || CUSTOMER_PROFILES.aarav;

    // Re-evaluate analysis using the currently selected customer's baseline
    const result = analyzeTransactionWithGuardian({
      amount: scenario.amount,
      beneficiaryStatus: scenario.beneficiaryStatus,
      message: scenario.scamMessage,
      recipientName: scenario.recipientName,
      paymentIntent: scenario.paymentIntent || "Following instructions from a message",
      transferHistory: profile.historicalAmounts
    });
    setAnalysisResult(result);
  };

  // Perform Guardian Analysis
  const performAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const profile = CUSTOMER_PROFILES[selectedCustomerKey] || CUSTOMER_PROFILES.aarav;
      const result = analyzeTransactionWithGuardian({
        amount: paymentDraft.amount,
        beneficiaryStatus: paymentDraft.beneficiaryStatus,
        message: scamMessage,
        recipientName: paymentDraft.recipientName,
        paymentIntent: paymentDraft.paymentIntent || DEMO_SCENARIOS.highRisk.paymentIntent || "Following instructions from a message",
        transferHistory: profile.historicalAmounts
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

  // Restart demo flow: restores Aarav Sharma, high-risk scenario, and returns to login
  const resetDemo = () => {
    setIsPaused(false);
    setContactNotified(false);
    setCoolingTimerSeconds(4 * 3600);
    selectCustomer('aarav');
    switchScenario('highRisk');
    setActiveScreen('login');
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
        selectedCustomerKey,
        selectCustomer,
        customerProfiles: CUSTOMER_PROFILES,
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
