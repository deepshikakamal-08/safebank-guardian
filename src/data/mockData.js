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

// Analysis engine that inspects transaction intent + scam message context
export function analyzeTransactionWithGuardian({ amount, beneficiaryStatus, message, recipientName }) {
  const normalizedMsg = (message || "").toLowerCase();
  const amt = Number(amount) || 0;
  const isNewBeneficiary = beneficiaryStatus === "new";

  // SCAM CONTEXT SIGNALS
  const urgencyKeywords = ["immediately", "urgent", "right now", "today", "within 1 hour", "hurry", "expire", "dying"];
  const threatKeywords = ["blocked", "suspended", "frozen", "legal action", "arrest", "police", "penalty", "deactivate"];
  const impersonationKeywords = ["bank", "verify your account", "kyc", "customer care", "officer", "rbi", "verification desk", "income tax"];
  const paymentKeywords = ["transfer", "send", "pay", "deposit", "upi", "refund fee"];

  const hasUrgency = urgencyKeywords.some(kw => normalizedMsg.includes(kw));
  const hasThreat = threatKeywords.some(kw => normalizedMsg.includes(kw));
  const hasImpersonation = impersonationKeywords.some(kw => normalizedMsg.includes(kw));
  const hasPaymentReq = paymentKeywords.some(kw => normalizedMsg.includes(kw));

  // TRANSACTION SIGNALS
  const isUnusuallyLarge = amt >= 20000;
  const isModerateAmount = amt >= 10000 && amt < 20000;

  // Signal Objects
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
      desc: isNewBeneficiary && (hasUrgency || isUnusuallyLarge)
        ? "Rapid checkout initiated immediately upon message arrival (High cognitive pressure signature)"
        : "Standard deliberative timing observed on trusted device",
      status: isNewBeneficiary && hasUrgency ? "anomaly" : "normal",
      weight: isNewBeneficiary && hasUrgency ? 15 : 0
    }
  ];

  const scamContextSignals = [
    {
      id: "sig_ctx_1",
      title: "Urgency Language",
      detail: hasUrgency ? "Urgency cues detected ('immediately', 'today', 'urgent')" : "No artificial urgency pressure found",
      status: hasUrgency ? "anomaly" : "normal",
      detected: hasUrgency
    },
    {
      id: "sig_ctx_2",
      title: "Account-Threat Language",
      detail: hasThreat ? "Threat language detected ('bank account will be blocked', 'suspended')" : "No coercive threats detected",
      status: hasThreat ? "anomaly" : "normal",
      detected: hasThreat
    },
    {
      id: "sig_ctx_3",
      title: "Possible Bank Impersonation",
      detail: hasImpersonation ? "Claims to represent bank verification or compliance desk" : "No institutional impersonation markers",
      status: hasImpersonation ? "anomaly" : "normal",
      detected: hasImpersonation
    },
    {
      id: "sig_ctx_4",
      title: "Payment Request",
      detail: hasPaymentReq ? "Explicit demand to transfer money under coercive pretense" : "Informal or standard interpersonal context",
      status: hasPaymentReq ? "anomaly" : "normal",
      detected: hasPaymentReq
    }
  ];

  // Calculate Overall Risk Level
  let riskScore = 12; // baseline
  if (isNewBeneficiary) riskScore += 25;
  if (isUnusuallyLarge) riskScore += 28;
  if (isModerateAmount) riskScore += 12;
  if (hasUrgency) riskScore += 15;
  if (hasThreat) riskScore += 25;
  if (hasImpersonation) riskScore += 20;

  riskScore = Math.min(Math.max(riskScore, 8), 96);

  let riskLevel = "LOW";
  let diagnosisTitle = "Routine Low Risk Transfer";
  let explanation = "The transfer aligns with your normal payment patterns. SafeBank Guardian has not detected social engineering or coercive language.";
  let recommendation = "Safe to proceed with standard verification.";

  if (riskScore >= 70 || (hasThreat && hasImpersonation && isNewBeneficiary)) {
    riskLevel = "HIGH";
    diagnosisTitle = "Possible Bank Impersonation Scam";
    explanation = "The message contains account-threat and urgency language, while this payment is unusually large and is being sent to a new beneficiary. These combined signals may indicate that you are being socially engineered.";
    recommendation = "Pause Payment. Banks never ask customers to transfer funds to verify an account.";
  } else if (riskScore >= 40 || (hasUrgency && isNewBeneficiary)) {
    riskLevel = "MEDIUM";
    diagnosisTitle = "High-Pressure Coercion Alert";
    explanation = "The transfer is being directed to a new beneficiary under urgent conditions. While account threats were not detected, artificial urgency is a hallmark of peer manipulation and distress scams.";
    recommendation = "Verify the recipient's identity independently before releasing funds.";
  }

  return {
    riskLevel,
    riskScore,
    diagnosisTitle,
    explanation,
    recommendation,
    transactionSignals,
    scamContextSignals,
    amount: amt,
    isNewBeneficiary,
    hasThreat,
    hasUrgency,
    hasImpersonation
  };
}
