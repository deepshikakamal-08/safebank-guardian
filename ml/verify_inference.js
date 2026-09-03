/**
 * SafeBank Guardian - Model Equivalence Verification Test
 * 
 * Verifies that the client-side JavaScript inference engine in src/ml/scamClassifier.js
 * produces identical results to the trained scikit-learn Python model.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClassifier } from '../src/ml/scamClassifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelPath = path.join(__dirname, 'model', 'scam_classifier_model.json');
const referencePath = path.join(__dirname, 'model', 'python_test_reference.json');

// 1. Load exported model and Python reference results
const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
const pythonResults = JSON.parse(fs.readFileSync(referencePath, 'utf8'));

// 2. Initialize JS classifier
const classifier = createClassifier(modelData);

console.log('========================================================================================');
console.log('SafeBank Guardian: Python vs. JavaScript Inference Equivalence Verification');
console.log('========================================================================================\n');
console.log(`Model Name: ${modelData.model_name}`);
console.log(`Vocabulary Size: ${modelData.vocabulary_size}`);
console.log(`Target Class: ${modelData.target_class}`);
console.log(`Tolerance Threshold: 1e-4 (0.0001)\n`);

const TOLERANCE = 0.0001;
let allPassed = true;
const summaryTable = [];

pythonResults.forEach((tc, idx) => {
  const jsResult = classifier.analyzeMessage(tc.text);

  const probDiff = Math.abs(jsResult.scamProbability - tc.python_scam_prob);
  const labelMatches = jsResult.label === tc.python_prediction;
  const probMatches = probDiff <= TOLERANCE;
  const passed = labelMatches && probMatches;

  if (!passed) allPassed = false;

  summaryTable.push({
    category: tc.category,
    expected: tc.expected_label,
    py_pred: tc.python_prediction,
    py_prob: tc.python_scam_prob.toFixed(4),
    js_pred: jsResult.label,
    js_prob: jsResult.scamProbability.toFixed(4),
    diff: probDiff.toExponential(2),
    status: passed ? 'PASS ✅' : 'FAIL ❌'
  });

  console.log(`[TEST ${idx + 1}/8] ${tc.category.toUpperCase()}`);
  console.log(`Message: "${tc.text}"`);
  console.log(`  Python:     Prediction = ${tc.python_prediction.padEnd(10)} | Scam Probability = ${tc.python_scam_prob.toFixed(6)}`);
  console.log(`  JavaScript: Prediction = ${jsResult.label.padEnd(10)} | Scam Probability = ${jsResult.scamProbability.toFixed(6)}`);
  console.log(`  Difference: ${probDiff.toFixed(8)} (${passed ? 'Within tolerance' : 'EXCEEDS TOLERANCE'})`);
  console.log(`  Top Features (JS Explainability):`);
  jsResult.topFeatures.slice(0, 3).forEach(f => {
    const sign = f.contribution >= 0 ? '+' : '';
    console.log(`     ${sign}${f.contribution.toFixed(4)} : '${f.feature}' (${f.direction})`);
  });
  console.log(`  Status:     ${passed ? 'PASS ✅' : 'FAIL ❌'}\n`);
});

console.log('========================================================================================');
console.log('VERIFICATION SUMMARY TABLE');
console.log('========================================================================================');
console.table(summaryTable);

console.log(`\nFinal Verdict: ${allPassed ? 'ALL 8 TESTS PASSED (100% Mathematical Equivalence)' : 'TESTS FAILED'}`);
console.log('========================================================================================');

if (!allPassed) {
  process.exit(1);
} else {
  process.exit(0);
}
