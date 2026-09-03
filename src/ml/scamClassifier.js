/**
 * SafeBank Guardian - Client-Side Machine Learning Inference Engine
 * Pure JavaScript implementation of TF-IDF Vectorizer + Logistic Regression Classifier.
 * 
 * Runs offline in the browser with ZERO backend calls, ZERO Python dependencies,
 * and ZERO external API requests.
 * 
 * Model source: ml/model/scam_classifier_model.json
 */

import defaultModel from '../../ml/model/scam_classifier_model.json' with { type: 'json' };

/**
 * Tokenize text into lowercase alphanumeric words, replicating Python's (?u)\b[a-zA-Z0-9_]+\b
 * @param {string} text 
 * @returns {string[]}
 */
export function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  const matches = text.toLowerCase().match(/\b[a-zA-Z0-9_]+\b/g);
  return matches || [];
}

/**
 * Generate unigrams and bigrams from a list of tokens
 * @param {string[]} tokens 
 * @returns {string[]}
 */
export function generateNgrams(tokens) {
  const ngrams = [];
  const len = tokens.length;
  for (let i = 0; i < len; i++) {
    ngrams.push(tokens[i]);
    if (i < len - 1) {
      ngrams.push(tokens[i] + ' ' + tokens[i + 1]);
    }
  }
  return ngrams;
}

/**
 * Factory to create an inference engine instance from a model definition
 * @param {Object} modelData 
 */
export function createClassifier(modelData = defaultModel) {
  const {
    vocabulary,
    idf,
    coefficients,
    intercept,
    classes = ['LEGITIMATE', 'SCAM'],
    target_class = 'SCAM'
  } = modelData;

  const scamIndex = classes.indexOf(target_class);

  /**
   * Vectorize input text into sparse L2-normalized TF-IDF features
   * @param {string} text 
   * @returns {{ features: Array<{term: string, index: number, value: number, count: number}>, norm: number }}
   */
  function vectorize(text) {
    const tokens = tokenize(text);
    const ngrams = generateNgrams(tokens);

    // 1. Calculate Term Frequencies (TF) for in-vocabulary terms
    const tfMap = new Map();
    for (let i = 0; i < ngrams.length; i++) {
      const term = ngrams[i];
      if (Object.prototype.hasOwnProperty.call(vocabulary, term)) {
        tfMap.set(term, (tfMap.get(term) || 0) + 1);
      }
    }

    if (tfMap.size === 0) {
      return { features: [], norm: 0, totalTokens: tokens.length };
    }

    // 2. Multiply by IDF and calculate sum of squares for L2 normalization
    let sumSquares = 0.0;
    const termEntries = [];

    for (const [term, count] of tfMap.entries()) {
      const index = vocabulary[term];
      const idfValue = idf[index];
      const rawWeight = count * idfValue;
      sumSquares += rawWeight * rawWeight;
      termEntries.push({ term, index, rawWeight, count });
    }

    const norm = Math.sqrt(sumSquares);

    // 3. Apply L2 normalization
    const features = termEntries.map(entry => ({
      term: entry.term,
      index: entry.index,
      value: norm > 0 ? entry.rawWeight / norm : 0,
      count: entry.count
    }));

    return { features, norm, totalTokens: tokens.length };
  }

  /**
   * Compute the logistic regression dot product and explainable contributions
   * @param {Array<{term: string, index: number, value: number}>} features 
   */
  function computeContributions(features) {
    let dotProduct = 0.0;
    const contributions = [];

    for (let i = 0; i < features.length; i++) {
      const { term, index, value, count } = features[i];
      const coef = coefficients[index];
      const contribution = coef * value;
      dotProduct += contribution;

      contributions.push({
        feature: term,
        featureIndex: index,
        normalizedValue: value,
        coefficient: coef,
        contribution: contribution,
        direction: contribution >= 0 ? 'SCAM' : 'LEGITIMATE',
        frequency: count
      });
    }

    return { dotProduct, contributions };
  }

  /**
   * Main prediction and explainability function
   * @param {string} message - Raw message string (SMS, WhatsApp, email, transcript)
   * @param {Object} [options]
   * @param {number} [options.topK=5] - Number of top explanatory features to return
   * @returns {Object} Structured prediction and explainability payload
   */
  function analyzeMessage(message, options = {}) {
    const topK = options.topK || 5;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        text: message || '',
        label: 'LEGITIMATE',
        scamProbability: 0.0,
        legitimateProbability: 1.0,
        riskScore: 0,
        topFeatures: [],
        explanationNote: 'These features contributed strongly to the risk assessment.',
        confidence: 'NONE',
        metadata: {
          tokenCount: 0,
          matchedVocabularyTerms: 0,
          logOdds: intercept
        }
      };
    }

    const { features, norm, totalTokens } = vectorize(message);
    const { dotProduct, contributions } = computeContributions(features);

    // z = intercept + dot(features, coefficients)
    const z = intercept + dotProduct;

    // Sigmoid function for SCAM class probability
    const scamProbability = 1.0 / (1.0 + Math.exp(-z));
    const legitimateProbability = 1.0 - scamProbability;

    const label = scamProbability >= 0.5 ? 'SCAM' : 'LEGITIMATE';
    const riskScore = Math.round(scamProbability * 100);

    // Sort contributions:
    // If prediction is SCAM, highlight features pushing toward SCAM (highest positive contribution)
    // If prediction is LEGITIMATE, highlight features pushing toward LEGITIMATE (most negative contribution)
    // Also provide magnitude-sorted top features for full explainability
    const sortedByImpact = [...contributions].sort((a, b) => {
      if (label === 'SCAM') {
        return b.contribution - a.contribution;
      } else {
        return a.contribution - b.contribution;
      }
    });

    const topFeatures = sortedByImpact.slice(0, topK).map(item => ({
      feature: item.feature,
      contribution: Number(item.contribution.toFixed(4)),
      direction: item.direction,
      modelWeight: Number(item.coefficient.toFixed(4)),
      frequency: item.frequency
    }));

    return {
      text: message,
      label,
      scamProbability: Number(scamProbability.toFixed(6)),
      legitimateProbability: Number(legitimateProbability.toFixed(6)),
      riskScore,
      topFeatures,
      // Explainability statement adhering to the design principle:
      explanationNote: 'These features contributed strongly to the risk assessment.',
      metadata: {
        tokenCount: totalTokens,
        matchedVocabularyTerms: features.length,
        logOdds: Number(z.toFixed(6)),
        intercept: Number(intercept.toFixed(6))
      }
    };
  }

  return {
    analyzeMessage,
    vectorize,
    tokenize,
    generateNgrams,
    modelInfo: {
      name: modelData.model_name,
      classes: classes,
      vocabularySize: Object.keys(vocabulary).length,
      intercept: intercept
    }
  };
}

// Default export using the bundled model parameters
const defaultClassifier = createClassifier(defaultModel);
export const analyzeMessage = defaultClassifier.analyzeMessage;
export default defaultClassifier;
