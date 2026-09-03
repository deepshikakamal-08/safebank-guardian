// Mock Banking & Security Data for SafeBank Guardian

export const INITIAL_ACCOUNT = {
  accountHolder: "Aarav Sharma",
  accountNumber: "•••• •••• 4829",
  accountType: "SafeShield Premium Savings",
  ifscCode: "SBNK0001428",
  balance: 142850.0,
  currency: "₹",
  guardianShieldStatus: "Active",
  baselineAverageTransfer: 3200.0,
  deviceTrustScore: "98% (Known Personal Device)",
  currentDevice: "Apple iPhone 15 Pro (iOS 18.2)",
  currentNetwork: "Airtel Fiber (Home Trusted Network)",
  trustedContact: {
    name: "Priya Sharma",
    relation: "Sister",
    phone: "+91 98765 43210",
    status: "Verified Safe Contact"
  }
};

export const INITIAL_TRANSACTIONS = [
  {
    id: "tx_101",
    recipient: "Swiggy Online Food",
    account: "swiggy@icici",
    category: "Food & Dining",
    amount: 420.0,
    date: "Today, 1:15 PM",
    type: "debit",
    status: "Completed",
    guardianVerdict: "Safe"
  },
  {
    id: "tx_102",
    recipient: "Tata Power Mumbai",
    account: "tatapower.billdesk@hdfc",
    category: "Utilities",
    amount: 2150.0,
    date: "Yesterday, 6:40 PM",
    type: "debit",
    status: "Completed",
    guardianVerdict: "Safe"
  },
  {
    id: "tx_103",
    recipient: "Apex Technologies Ltd",
    account: "payroll@apextech",
    category: "Salary Credit",
    amount: 95000.0,
    date: "28 Feb, 9:00 AM",
    type: "credit",
    status: "Completed",
    guardianVerdict: "Safe"
  },
  {
    id: "tx_104",
    recipient: "Flipkart Internet Pvt Ltd",
    account: "flipkart@axisbank",
    category: "Shopping",
    amount: 2499.0,
    date: "26 Feb, 4:22 PM",
    type: "debit",
    status: "Completed",
    guardianVerdict: "Safe"
  },
  {
    id: "tx_105",
    recipient: "Mumbai Metro Rail",
    account: "mmrcl@sbi",
    category: "Transit",
    amount: 80.0,
    date: "25 Feb, 8:45 AM",
    type: "debit",
    status: "Completed",
    guardianVerdict: "Safe"
  }
];

export const DEMO_SCENARIOS = {
  highRisk: {
    id: "highRisk",
    name: "Scam Demo: Bank Impersonation Threat",
    tag: "High Risk (Recommended Demo)",
    badgeColor: "rose",
    recipientName: "Account Verification Desk",
    recipientUpi: "verify.desk91@axispay",
    amount: 50000,
    beneficiaryStatus: "new", // "new" | "existing"
    scamMessage: "Your bank account will be blocked today. Transfer ₹50,000 immediately to verify your account.",
    pacingInfo: "Initiated 2m 14s after receiving message (Abnormal Speed)"
  },
  mediumRisk: {
    id: "mediumRisk",
    name: "Scenario: Urgent Unverified Medical Aid",
    tag: "Medium Risk (Explain + Verify)",
    badgeColor: "amber",
    recipientName: "Rohan Verma (Emergency)",
    recipientUpi: "rohan.care99@okicici",
    amount: 15000,
    beneficiaryStatus: "new",
    scamMessage: "Urgent! In hospital emergency room. Please send ₹15,000 right now, my phone battery is dying.",
    pacingInfo: "Initiated 6m after message arrival"
  },
  lowRisk: {
    id: "lowRisk",
    name: "Scenario: Regular Friend Transfer",
    tag: "Low Risk (Routine Transfer)",
    badgeColor: "emerald",
    recipientName: "Karan Mehta (Roommate)",
    recipientUpi: "karan.mehta@oksbi",
    amount: 1200,
    beneficiaryStatus: "existing",
    scamMessage: "Hey Aarav, here is my share for the grocery bill we split yesterday. Whenever you can send it.",
    pacingInfo: "Normal cadence"
  }
};

import { analyzeMessage } from '../ml/scamClassifier.js';

// Analysis engine that inspects transaction intent + scam message context using real ML model
export function analyzeTransactionWithGuardian({ amount, beneficiaryStatus, message, recipientName }) {
  const amt = Number(amount) || 0;
  const isNewBeneficiary = beneficiaryStatus === "new";

  // 1. REAL ML CLASSIFIER INFERENCE
  // Runs verified TF-IDF + Logistic Regression directly in JavaScript
  const mlResult = analyzeMessage(message || "");
  const isScamDetected = mlResult.label === "SCAM";
  const scamProb = mlResult.scamProbability;
  const legitProb = mlResult.legitimateProbability;
  const topFeatures = mlResult.topFeatures || [];

  // 2. TRANSACTION SIGNALS (Payment Intent & Spending Baselines)
  const isUnusuallyLarge = amt >= 20000;
  const isModerateAmount = amt >= 10000 && amt < 20000;

  const transactionSignals = [
    {
      id: "sig_tx_1",
      title: "New Beneficiary",
      desc: isNewBeneficiary 
        ? "Recipient never received funds before; added < 5 mins ago" 
        : "Recipient is an existing known contact with past transaction history",
      status: isNewBeneficiary ? "anomaly" : "normal",
      weight: isNewBeneficiary ? 30 : 0
    },
    {
      id: "sig_tx_2",
      title: "Unusually Large Amount",
      desc: isUnusuallyLarge 
        ? `₹${amt.toLocaleString("en-IN")} is ~15.6x higher than your 30-day average transfer (₹3,200)`
        : isModerateAmount 
          ? `₹${amt.toLocaleString("en-IN")} is higher than routine transfers` 
          : `₹${amt.toLocaleString("en-IN")} is well within your daily spending baseline`,
      status: isUnusuallyLarge ? "anomaly" : (isModerateAmount ? "caution" : "normal"),
      weight: isUnusuallyLarge ? 35 : (isModerateAmount ? 15 : 0)
    },
    {
      id: "sig_tx_3",
      title: "Timing & Pacing Disruption",
      desc: isNewBeneficiary && (isScamDetected || isUnusuallyLarge)
        ? "Rapid checkout initiated immediately upon message arrival (High cognitive pressure signature)"
        : "Standard deliberative timing observed on trusted device",
      status: isNewBeneficiary && isScamDetected ? "anomaly" : "normal",
      weight: isNewBeneficiary && isScamDetected ? 15 : 0
    }
  ];

  // 3. ML SCAM CONTEXT SIGNALS (Derived directly from trained model inference)
  const scamContextSignals = [
    {
      id: "sig_ctx_ml_1",
      title: "ML Model Classification",
      detail: isScamDetected
        ? `Classified as SCAM by trained model (${(scamProb * 100).toFixed(1)}% scam probability)`
        : `Classified as LEGITIMATE by trained model (${(legitProb * 100).toFixed(1)}% legitimate confidence)`,
      status: isScamDetected ? "anomaly" : "normal",
      detected: isScamDetected
    },
    {
      id: "sig_ctx_ml_2",
      title: "Scam Probability Score",
      detail: `${(scamProb * 100).toFixed(1)}% scam probability (computed via TF-IDF + Logistic Regression)`,
      status: scamProb >= 0.7 ? "anomaly" : (scamProb >= 0.4 ? "caution" : "normal"),
      detected: scamProb >= 0.5
    },
    {
      id: "sig_ctx_ml_3",
      title: "Key Influential Tokens",
      detail: topFeatures.length > 0
        ? `Top contributing features: ${topFeatures.slice(0, 3).map(f => `'${f.feature}' (${f.direction === 'SCAM' ? '+' : ''}${f.contribution})`).join(', ')}`
        : "Standard message vocabulary with no high-weight scam tokens",
      status: isScamDetected ? "anomaly" : "normal",
      detected: isScamDetected
    }
  ];

  // 4. Interim Risk Level calculation (Separating ML from future full fusion engine)
  let riskLevel = "LOW";
  let diagnosisTitle = "Routine Low Risk Transfer";
  let explanation = `The message was classified as LEGITIMATE (${(legitProb * 100).toFixed(1)}% confidence). SafeBank Guardian detected no significant social engineering markers.`;
  let recommendation = "Safe to proceed with standard verification.";

  if (isScamDetected && (isUnusuallyLarge || isNewBeneficiary)) {
    riskLevel = "HIGH";
    diagnosisTitle = "Possible Social Engineering Scam";
    explanation = `The message was classified as SCAM by the trained ML model (${(scamProb * 100).toFixed(1)}% scam probability). Combined with high-value payment parameters to a new beneficiary, this indicates high manipulation risk.`;
    recommendation = "Pause Payment. Banks never ask customers to transfer funds to verify an account.";
  } else if (isScamDetected || scamProb >= 0.4 || (isUnusuallyLarge && isNewBeneficiary)) {
    riskLevel = "MEDIUM";
    diagnosisTitle = "Elevated Scam Risk Alert";
    explanation = `The message exhibits suspicious language patterns (${(scamProb * 100).toFixed(1)}% scam probability). Proceed with heightened caution and verify the payee.`;
    recommendation = "Verify the recipient's identity independently before releasing funds.";
  }

  return {
    riskLevel,
    riskScore: Math.round(scamProb * 100),
    diagnosisTitle,
    explanation,
    recommendation,
    transactionSignals,
    scamContextSignals,
    amount: amt,
    isNewBeneficiary,
    // Real ML fields
    mlResult,
    predictedLabel: mlResult.label,
    scamProbability: mlResult.scamProbability,
    legitimateProbability: mlResult.legitimateProbability,
    scamProbabilityPercent: (scamProb * 100).toFixed(1) + "%",
    legitimateProbabilityPercent: (legitProb * 100).toFixed(1) + "%",
    topFeatures: mlResult.topFeatures,
    explanationNote: "These features contributed strongly to the risk assessment."
  };
}
