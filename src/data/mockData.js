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
    paymentIntent: "Following instructions from a message",
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
    paymentIntent: "Following instructions from a message",
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
    paymentIntent: "Paying a known person",
    scamMessage: "Hey Aarav, here is my share for the grocery bill we split yesterday. Whenever you can send it.",
    pacingInfo: "Normal cadence"
  }
};

// Realistic historical customer transfers for behavioral baseline calculations (average ~₹3,200)
export const CUSTOMER_TRANSFER_HISTORY = [
  { id: "tx_hist_1", date: "2024-08-04", amount: 2400, recipient: "Grocery Mart", category: "Daily Needs" },
  { id: "tx_hist_2", date: "2024-08-07", amount: 3100, recipient: "Priya Sharma", category: "Family Transfer" },
  { id: "tx_hist_3", date: "2024-08-11", amount: 1850, recipient: "Swiggy & Zomato", category: "Dining" },
  { id: "tx_hist_4", date: "2024-08-15", amount: 4200, recipient: "Urban Company", category: "Home Services" },
  { id: "tx_hist_5", date: "2024-08-19", amount: 2900, recipient: "Karan Mehta", category: "Shared Expenses" },
  { id: "tx_hist_6", date: "2024-08-23", amount: 3800, recipient: "Electricity Board", category: "Utilities" },
  { id: "tx_hist_7", date: "2024-08-26", amount: 1500, recipient: "Medical Pharmacy", category: "Health" },
  { id: "tx_hist_8", date: "2024-08-28", amount: 4500, recipient: "Amazon India", category: "Shopping" },
  { id: "tx_hist_9", date: "2024-08-30", amount: 2750, recipient: "BookMyShow", category: "Entertainment" },
  { id: "tx_hist_10", date: "2024-09-01", amount: 5100, recipient: "Vehicle Maintenance", category: "Automotive" }
];

export const HISTORICAL_TRANSFER_AMOUNTS = CUSTOMER_TRANSFER_HISTORY.map(tx => tx.amount);

/**
 * Calculates the statistical Z-Score for a transaction relative to customer historical transfers.
 * Formula: z = (currentAmount - mean) / standardDeviation
 * Safely handles:
 *  - empty history
 *  - fewer than 2 historical transactions
 *  - standard deviation = 0
 */
export function calculateBehavioralZScore(currentAmount, history = HISTORICAL_TRANSFER_AMOUNTS) {
  const amt = Number(currentAmount) || 0;

  // 1. Safe handling: empty or invalid history
  if (!Array.isArray(history) || history.length === 0) {
    return {
      currentAmount: amt,
      mean: 0,
      stdDev: 0,
      zScore: 0,
      isAnomaly: false,
      status: "normal",
      explanation: "No historical transactions available to compute baseline."
    };
  }

  // 2. Safe handling: fewer than 2 transactions
  if (history.length < 2) {
    const singleVal = typeof history[0] === "object" && history[0] !== null ? Number(history[0].amount) || 0 : Number(history[0]) || 0;
    return {
      currentAmount: amt,
      mean: singleVal,
      stdDev: 0,
      zScore: 0,
      isAnomaly: false,
      status: "normal",
      explanation: "At least 2 past transactions required to compute standard deviation."
    };
  }

  const n = history.length;
  const numbers = history.map(x => (typeof x === "object" && x !== null && "amount" in x) ? Number(x.amount) : Number(x) || 0);
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;

  // Sample variance using Bessel's correction (n - 1)
  const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);

  // 3. Safe handling: standard deviation = 0
  if (stdDev === 0 || isNaN(stdDev)) {
    const diff = amt - mean;
    const isAnomaly = Math.abs(diff) > 0;
    return {
      currentAmount: amt,
      mean: Math.round(mean * 100) / 100,
      stdDev: 0,
      zScore: isAnomaly ? (diff > 0 ? 99.9 : -99.9) : 0,
      isAnomaly,
      status: isAnomaly ? "anomaly" : "normal",
      explanation: isAnomaly
        ? "Transfer deviates from constant historical baseline (zero variance)."
        : "Matches constant historical baseline exactly."
    };
  }

  const zScore = (amt - mean) / stdDev;
  const roundedZ = Math.round(zScore * 100) / 100;

  // Statistical anomaly threshold: z >= 3.0 (extreme outlier, p < 0.0013)
  // Moderate caution threshold: 2.0 <= z < 3.0
  const isAnomaly = roundedZ >= 3.0;
  const isCaution = roundedZ >= 2.0 && roundedZ < 3.0;
  const status = isAnomaly ? "anomaly" : (isCaution ? "caution" : "normal");

  return {
    currentAmount: amt,
    mean: Math.round(mean * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    zScore: roundedZ,
    isAnomaly,
    status,
    explanation: isAnomaly
      ? `Transfer is ${roundedZ.toFixed(2)} standard deviations above baseline (Statistically anomalous)`
      : isCaution
        ? `Transfer is ${roundedZ.toFixed(2)} standard deviations above baseline (Moderately elevated)`
        : `Transfer is within normal baseline distribution (Z-Score: ${roundedZ.toFixed(2)})`
  };
}

import { analyzeMessage } from '../ml/scamClassifier.js';

/**
 * PROTOTYPE RISK FUSION CONFIGURATION
 * -------------------------------------------------------------
 * NOTE: This is an experimental, transparent prototype heuristic.
 * It is NOT scientifically validated for real-world production banking.
 *
 * Weights (Sum to 1.0):
 *  - mlScamProbability: 0.40 (40%) - Linguistic cues of social engineering
 *  - behavioralAnomaly: 0.25 (25%) - Statistical deviation from customer transfer baseline (Z-Score)
 *  - paymentIntent:     0.20 (20%) - Customer-stated context / pressure vector
 *  - beneficiaryStatus: 0.15 (15%) - Recipient exposure level (New vs Existing)
 *
 * Thresholds:
 *  - Fused Score >= 70 : HIGH   -> Pause payment + explain risk + ask customer to verify + optionally offer trusted contact
 *  - Fused Score >= 40 : MEDIUM -> Explain risk + ask customer to verify
 *  - Fused Score < 40  : LOW    -> Continue
 */
export const RISK_FUSION_CONFIG = {
  engineName: "Prototype Risk Fusion",
  status: "Experimental Prototype (Not Scientifically Validated for Production)",
  weights: {
    mlScamProbability: 0.40,
    behavioralAnomaly: 0.25,
    paymentIntent: 0.20,
    beneficiaryStatus: 0.15
  },
  thresholds: {
    high: 70,
    medium: 40
  },
  intentRiskMap: {
    "Following instructions from a message": 1.00,
    "Verifying my account": 1.00,
    "Receiving a refund": 0.85,
    "Other": 0.25,
    "Paying a merchant": 0.05,
    "Paying a known person": 0.00
  }
};

/**
 * Transparent Prototype Risk Fusion Function
 * Combines ML text classification, behavioral Z-Score, payment intent, and beneficiary status.
 */
export function evaluateRiskFusion({ mlResult, behavioralStats, paymentIntent, beneficiaryStatus, amount }) {
  const scamProb = mlResult?.scamProbability ?? 0;
  const isNewBeneficiary = beneficiaryStatus === "new";
  const zScore = behavioralStats?.zScore ?? 0;
  const cfg = RISK_FUSION_CONFIG;

  // 1. ML Scam Component (Weight 40%)
  const mlScore = Math.min(Math.max(scamProb, 0), 1);
  const mlContrib = cfg.weights.mlScamProbability * mlScore;

  // 2. Behavioral Component (Weight 25%)
  let behaviorScore = 0;
  // Handle missing/insufficient history safely: does not penalize customer
  if (behavioralStats?.status === "insufficient_data" || !behavioralStats?.stdDev) {
    behaviorScore = 0;
  } else if (zScore <= 0) {
    behaviorScore = 0;
  } else if (zScore < 2.0) {
    behaviorScore = (zScore / 2.0) * 0.25;
  } else if (zScore < 3.0) {
    behaviorScore = 0.25 + ((zScore - 2.0) / 1.0) * 0.35;
  } else {
    // z >= 3.0 indicates strong statistical anomaly
    behaviorScore = Math.min(1.0, 0.60 + ((zScore - 3.0) / 5.0) * 0.40);
  }
  const behaviorContrib = cfg.weights.behavioralAnomaly * behaviorScore;

  // 3. Payment Intent Component (Weight 20%)
  const normalizedIntent = (paymentIntent || "").trim();
  const intentScore = cfg.intentRiskMap[normalizedIntent] !== undefined
    ? cfg.intentRiskMap[normalizedIntent]
    : 0.20;
  const intentContrib = cfg.weights.paymentIntent * intentScore;

  // 4. Beneficiary Status Component (Weight 15%)
  const beneficiaryScore = isNewBeneficiary ? 1.00 : 0.00;
  const beneficiaryContrib = cfg.weights.beneficiaryStatus * beneficiaryScore;

  // Base Fused Score (0 to 100)
  const baseScore = (mlContrib + behaviorContrib + intentContrib + beneficiaryContrib) * 100;

  // Multi-Signal Compound Synergy Modifier
  let synergyModifier = 0;
  if (mlScore >= 0.70 && intentScore >= 0.85 && isNewBeneficiary) {
    synergyModifier = 5; // Signals mutually amplify manipulation hypothesis
  } else if (mlScore < 0.20 && !isNewBeneficiary && intentScore === 0) {
    synergyModifier = -5; // Benign routine payment discount
  }

  const fusedScore = Math.round(Math.min(Math.max(baseScore + synergyModifier, 0), 99));

  // Determine Risk Level & Intervention Recommendation
  let riskLevel = "LOW";
  let recommendation = "Continue";
  let actionCode = "CONTINUE";
  let diagnosisTitle = "Routine Transfer - Normal Baseline";
  let explanation = "The transfer parameters align with normal customer baselines and no significant manipulation markers were detected.";

  if (fusedScore >= cfg.thresholds.high) {
    riskLevel = "HIGH";
    recommendation = "Pause payment + explain risk + ask customer to verify + optionally offer trusted contact";
    actionCode = "PAUSE_PAYMENT";
    diagnosisTitle = "High Social Engineering Risk Detected";
    explanation = `Prototype Risk Fusion detected high manipulation risk (Score: ${fusedScore}/100). The combination of high ML scam indicators (${(scamProb * 100).toFixed(1)}%), anomalous amount (Z-Score: ${zScore.toFixed(2)}), and unverified payee indicates active social engineering.`;
  } else if (fusedScore >= cfg.thresholds.medium) {
    riskLevel = "MEDIUM";
    recommendation = "Explain risk + ask customer to verify";
    actionCode = "EXPLAIN_AND_VERIFY";
    diagnosisTitle = "Elevated Risk - Customer Verification Recommended";
    explanation = `Prototype Risk Fusion detected moderate risk (Score: ${fusedScore}/100). Elevated signals were observed in payment intent or transfer distribution. Independent payee verification is recommended before proceeding.`;
  }

  // Short Human-Readable Reasons Explaining Contributing Signals
  const contributingReasons = [];
  if (mlScore >= 0.5) {
    contributingReasons.push(`High ML scam confidence (${(scamProb * 100).toFixed(1)}%) in customer communication`);
  } else if (mlScore >= 0.25) {
    contributingReasons.push(`Moderate scam probability (${(scamProb * 100).toFixed(1)}%) in message context`);
  } else {
    contributingReasons.push(`Low scam probability (${(scamProb * 100).toFixed(1)}%) in message context`);
  }

  if (behavioralStats?.isAnomaly) {
    contributingReasons.push(`Transfer amount is ${zScore.toFixed(2)} standard deviations above customer baseline (Z-Score anomaly)`);
  } else if (behavioralStats?.status === "caution") {
    contributingReasons.push(`Transfer amount is ${zScore.toFixed(2)} standard deviations above baseline (elevated)`);
  } else if (behavioralStats?.status === "insufficient_data") {
    contributingReasons.push("Customer historical baseline is limited (handled neutrally without risk penalty)");
  } else {
    contributingReasons.push(`Transfer amount is within normal historical baseline (Z-Score: ${zScore.toFixed(2)})`);
  }

  if (intentScore >= 0.85) {
    contributingReasons.push(`Payment intent ("${normalizedIntent}") matches known social engineering coercion`);
  } else if (intentScore === 0) {
    contributingReasons.push(`Payment intent ("${normalizedIntent}") matches routine personal payment`);
  } else {
    contributingReasons.push(`Payment intent: "${normalizedIntent}"`);
  }

  if (isNewBeneficiary) {
    contributingReasons.push("Recipient is an unverified new beneficiary added recently");
  } else {
    contributingReasons.push("Recipient is an established contact with past transfer history");
  }

  return {
    engineName: cfg.engineName,
    disclaimer: cfg.status,
    fusedScore,
    riskLevel,
    recommendation,
    actionCode,
    diagnosisTitle,
    explanation,
    contributingReasons,
    components: {
      ml: {
        name: "ML Scam Probability",
        score: mlScore,
        weight: cfg.weights.mlScamProbability,
        weightPercent: "40%",
        contribution: Math.round(mlContrib * 100),
        detail: `${(scamProb * 100).toFixed(1)}% scam confidence`
      },
      behavior: {
        name: "Behavioral Z-Score",
        score: behaviorScore,
        weight: cfg.weights.behavioralAnomaly,
        weightPercent: "25%",
        contribution: Math.round(behaviorContrib * 100),
        detail: `${zScore.toFixed(2)}σ deviation`
      },
      intent: {
        name: "Payment Intent",
        score: intentScore,
        weight: cfg.weights.paymentIntent,
        weightPercent: "20%",
        contribution: Math.round(intentContrib * 100),
        detail: normalizedIntent || "Unspecified"
      },
      beneficiary: {
        name: "Beneficiary Status",
        score: beneficiaryScore,
        weight: cfg.weights.beneficiaryStatus,
        weightPercent: "15%",
        contribution: Math.round(beneficiaryContrib * 100),
        detail: isNewBeneficiary ? "New Beneficiary" : "Existing Contact"
      }
    },
    synergyModifier
  };
}

// Analysis engine that inspects transaction intent + scam message context using real ML model, Z-score, and Risk Fusion
export function analyzeTransactionWithGuardian({ amount, beneficiaryStatus, message, recipientName, paymentIntent, transferHistory }) {
  const amt = Number(amount) || 0;
  const isNewBeneficiary = beneficiaryStatus === "new";

  // 1. REAL ML CLASSIFIER INFERENCE
  // Runs verified TF-IDF + Logistic Regression directly in JavaScript
  const mlResult = analyzeMessage(message || "");
  const isScamDetected = mlResult.label === "SCAM";
  const scamProb = mlResult.scamProbability;
  const legitProb = mlResult.legitimateProbability;
  const topFeatures = mlResult.topFeatures || [];

  // 2. STATISTICAL BEHAVIORAL ANOMALY (Z-SCORE)
  // Replaces hardcoded ₹20,000 threshold with z = (amount - mean) / stdDev
  const history = transferHistory || HISTORICAL_TRANSFER_AMOUNTS;
  const behavioralStats = calculateBehavioralZScore(amt, history);
  const isBehavioralAnomaly = behavioralStats.isAnomaly;
  const isBehavioralCaution = behavioralStats.status === "caution";

  // 3. PROTOTYPE RISK FUSION ENGINE
  // Synthesizes ML Scam Probability, Behavioral Z-Score, Payment Intent, and Beneficiary Status
  const fusionResult = evaluateRiskFusion({
    mlResult,
    behavioralStats,
    paymentIntent,
    beneficiaryStatus,
    amount: amt
  });

  const riskLevel = fusionResult.riskLevel;
  const riskScore = fusionResult.fusedScore;
  const diagnosisTitle = fusionResult.diagnosisTitle;
  const explanation = fusionResult.explanation;
  const recommendation = fusionResult.recommendation;

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
      title: "Statistical Baseline Anomaly (Z-Score)",
      desc: `Customer baseline: ₹${behavioralStats.mean.toLocaleString("en-IN")} (σ = ₹${behavioralStats.stdDev.toLocaleString("en-IN")}) • Current transfer: ₹${amt.toLocaleString("en-IN")} • Behavioral Z-Score: ${behavioralStats.zScore.toFixed(2)} • Behavioral anomaly: ${isBehavioralAnomaly ? "Detected" : "Normal"}`,
      status: behavioralStats.status,
      weight: isBehavioralAnomaly ? 35 : (isBehavioralCaution ? 15 : 0)
    },
    {
      id: "sig_tx_3",
      title: "Timing & Pacing Disruption",
      desc: isNewBeneficiary && (isScamDetected || isBehavioralAnomaly)
        ? "Rapid checkout initiated immediately upon message arrival (High cognitive pressure signature)"
        : "Standard deliberative timing observed on trusted device",
      status: isNewBeneficiary && isScamDetected ? "anomaly" : "normal",
      weight: isNewBeneficiary && isScamDetected ? 15 : 0
    }
  ];

  // 4. ML SCAM CONTEXT SIGNALS (Derived directly from trained model inference)
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
    paymentIntent: paymentIntent || "Following instructions from a message",
    // Prototype Risk Fusion
    fusionResult,
    isFused: true,
    // Statistical Behavioral Anomaly (Z-Score)
    behavioralStats,
    zScore: behavioralStats.zScore,
    historicalMean: behavioralStats.mean,
    standardDeviation: behavioralStats.stdDev,
    behavioralAnomalyDetected: isBehavioralAnomaly,
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
