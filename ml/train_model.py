"""
SafeBank Guardian - Machine Learning Training Pipeline
Prototype Text Classifier for Scam Detection

This script trains a TF-IDF + Logistic Regression model to classify incoming 
messages into SCAM or LEGITIMATE. The model weights, vocabulary, IDF values, 
and preprocessing configuration are exported to JSON so that real-time inference 
can run directly inside the browser using pure JavaScript, without requiring an 
active Python backend service.

Dataset: ml/data/messages.csv (500 synthetic messages: 250 SCAM, 250 LEGITIMATE)
Output artifacts:
  - ml/model/scam_classifier_model.json   (Full parameters for JS inference)
  - ml/model/evaluation_results.json      (Evaluation metrics on held-out test set)

DISCLAIMER: This is a prototype model trained on a synthetic dataset for demonstration 
and hackathon architecture validation. It is not intended for real-world production deployment.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

def main():
    print("=" * 60)
    print("SafeBank Guardian: Training Real ML Scam Classifier")
    print("=" * 60)

    # 1. Configuration & Paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, "data", "messages.csv")
    model_dir = os.path.join(base_dir, "model")
    os.makedirs(model_dir, exist_ok=True)

    model_export_path = os.path.join(model_dir, "scam_classifier_model.json")
    eval_export_path = os.path.join(model_dir, "evaluation_results.json")

    random_seed = 42
    test_ratio = 0.20

    # 2. Load Dataset
    print(f"\n[1/6] Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f"      Total records loaded: {len(df)}")
    print(f"      Class distribution: {dict(df['label'].value_counts())}")
    print(f"      Categories count: {df['category'].nunique()} distinct categories")

    # 3. Stratified Train / Test Split
    # Using 'category' as stratification variable guarantees both class balance 
    # (SCAM vs LEGITIMATE) and category balance across training and test splits.
    print(f"\n[2/6] Performing Stratified Split (test_size={test_ratio}, random_state={random_seed})...")
    X_train, X_test, y_train, y_test, cat_train, cat_test = train_test_split(
        df['text'],
        df['label'],
        df['category'],
        test_size=test_ratio,
        random_state=random_seed,
        stratify=df['category']
    )

    print(f"      Training set: {len(X_train)} samples (SCAM: {(y_train == 'SCAM').sum()}, LEGITIMATE: {(y_train == 'LEGITIMATE').sum()})")
    print(f"      Held-out test set: {len(X_test)} samples (SCAM: {(y_test == 'SCAM').sum()}, LEGITIMATE: {(y_test == 'LEGITIMATE').sum()})")

    # 4. Feature Extraction via TF-IDF (Strict Data Leakage Prevention)
    # The vectorizer is FIT ONLY on X_train. X_test is strictly transformed using fitted stats.
    print("\n[3/6] Fitting TF-IDF Vectorizer strictly on Training Set...")
    token_regex = r"(?u)\b[a-zA-Z0-9_]+\b"
    vectorizer = TfidfVectorizer(
        lowercase=True,
        token_pattern=token_regex,
        ngram_range=(1, 2),  # unigrams and bigrams
        min_df=2,            # ignore tokens appearing fewer than 2 times
        norm="l2",           # standard Euclidean normalization
        sublinear_tf=False,
        use_idf=True,
        smooth_idf=True
    )

    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    vocab_size = len(vectorizer.vocabulary_)
    print(f"      Vocabulary size extracted: {vocab_size} n-gram features")

    # 5. Model Training: Logistic Regression
    # We configure class_weight='balanced' and fix random_state for full reproducibility.
    print("\n[4/6] Training Logistic Regression Classifier...")
    classifier = LogisticRegression(
        C=1.0,
        solver="lbfgs",
        class_weight="balanced",
        max_iter=1000,
        random_state=random_seed
    )

    classifier.fit(X_train_tfidf, y_train)
    classes = list(classifier.classes_)
    print(f"      Model classes: {classes} (Target positive index for SCAM: {classes.index('SCAM')})")

    # 6. Evaluation on Held-Out Test Set
    print("\n[5/6] Evaluating on Held-Out Test Set (Unseen Data)...")
    y_pred = classifier.predict(X_test_tfidf)
    y_pred_proba = classifier.predict_proba(X_test_tfidf)[:, classes.index("SCAM")]

    acc = float(accuracy_score(y_test, y_pred))
    prec_scam = float(precision_score(y_test, y_pred, pos_label="SCAM"))
    rec_scam = float(recall_score(y_test, y_pred, pos_label="SCAM"))
    f1_scam = float(f1_score(y_test, y_pred, pos_label="SCAM"))

    prec_legit = float(precision_score(y_test, y_pred, pos_label="LEGITIMATE"))
    rec_legit = float(recall_score(y_test, y_pred, pos_label="LEGITIMATE"))
    f1_legit = float(f1_score(y_test, y_pred, pos_label="LEGITIMATE"))

    # Confusion matrix labels: [LEGITIMATE, SCAM]
    cm = confusion_matrix(y_test, y_pred, labels=["LEGITIMATE", "SCAM"])
    tn, fp, fn, tp = cm.ravel()

    report_dict = classification_report(y_test, y_pred, output_dict=True)
    report_text = classification_report(y_test, y_pred)

    print("\n" + "-" * 50)
    print("ACTUAL EVALUATION RESULTS ON HELD-OUT TEST SET:")
    print("-" * 50)
    print(f"  Overall Accuracy : {acc:.4f} ({acc*100:.1f}%)")
    print(f"  SCAM Precision   : {prec_scam:.4f} ({prec_scam*100:.1f}%)")
    print(f"  SCAM Recall      : {rec_scam:.4f} ({rec_scam*100:.1f}%)  <-- Critical Metric")
    print(f"  SCAM F1-Score    : {f1_scam:.4f} ({f1_scam*100:.1f}%)")
    print(f"  LEGITIMATE Prec  : {prec_legit:.4f}")
    print(f"  LEGITIMATE Rec   : {rec_legit:.4f}")
    print(f"  LEGITIMATE F1    : {f1_legit:.4f}")
    print("\nConfusion Matrix [Rows: Actual, Cols: Predicted]:")
    print(f"                 Pred LEGITIMATE   Pred SCAM")
    print(f"  Act LEGITIMATE      {tn:<16}  {fp:<10}  (Total: {tn+fp})")
    print(f"  Act SCAM            {fn:<16}  {tp:<10}  (Total: {fn+tp})")
    print("-" * 50)
    print("\nFull Classification Report:")
    print(report_text)

    # Inspect top predictive features
    feature_names = vectorizer.get_feature_names_out()
    coef = classifier.coef_[0]  # coefficients for class 1 (SCAM)
    
    top_scam_indices = np.argsort(coef)[-15:][::-1]
    top_legit_indices = np.argsort(coef)[:15]

    top_scam_features = [
        {"feature": feature_names[i], "coefficient": round(float(coef[i]), 4)}
        for i in top_scam_indices
    ]
    top_legit_features = [
        {"feature": feature_names[i], "coefficient": round(float(coef[i]), 4)}
        for i in top_legit_indices
    ]

    print("Top 8 Indicators for SCAM (Positive Weights):")
    for item in top_scam_features[:8]:
        print(f"   +{item['coefficient']:<6.4f} : '{item['feature']}'")

    print("\nTop 8 Indicators for LEGITIMATE (Negative Weights):")
    for item in top_legit_features[:8]:
        print(f"   {item['coefficient']:<7.4f} : '{item['feature']}'")

    # 7. Export Model to JSON for Pure JavaScript Inference
    print(f"\n[6/6] Exporting Model and Evaluation Artifacts to JSON...")

    # Sort feature names to create consistent arrays
    # vocabulary maps token -> index
    # idf is an array where idf[index] is the IDF weight
    # coefficients is an array where coefficients[index] is the model weight
    vocab_dict = {term: int(idx) for term, idx in vectorizer.vocabulary_.items()}
    idf_list = [round(float(val), 6) for val in vectorizer.idf_]
    coef_list = [round(float(val), 6) for val in coef]
    intercept_val = round(float(classifier.intercept_[0]), 6)

    model_payload = {
        "model_name": "SafeBank_Guardian_Scam_Classifier",
        "model_type": "LogisticRegression_with_TFIDF",
        "version": "1.0.0",
        "dataset": "ml/data/messages.csv",
        "prototype_notice": "Prototype model trained on synthetic data for demonstration and security architecture validation.",
        "target_class": "SCAM",
        "classes": classes,
        "preprocessing": {
            "lowercase": True,
            "token_pattern": token_regex,
            "ngram_range": [1, 2],
            "norm": "l2",
            "use_idf": True,
            "smooth_idf": True,
            "sublinear_tf": False,
            "min_df": 2
        },
        "vocabulary_size": vocab_size,
        "intercept": intercept_val,
        "vocabulary": vocab_dict,
        "idf": idf_list,
        "coefficients": coef_list,
        "top_features": {
            "scam": top_scam_features,
            "legitimate": top_legit_features
        }
    }

    with open(model_export_path, "w", encoding="utf-8") as f:
        json.dump(model_payload, f, indent=2, ensure_ascii=False)
    print(f"      Saved model parameters: {model_export_path} ({os.path.getsize(model_export_path)/1024:.1f} KB)")

    def to_serializable(val):
        if isinstance(val, dict):
            return {str(k): to_serializable(v) for k, v in val.items()}
        elif isinstance(val, (list, tuple)):
            return [to_serializable(v) for v in val]
        elif isinstance(val, (np.integer, int)):
            return int(val)
        elif isinstance(val, (np.floating, float)):
            return round(float(val), 6)
        elif isinstance(val, (bool, np.bool_)):
            return bool(val)
        elif pd.isna(val):
            return None
        return val

    eval_payload = {
        "dataset_summary": {
            "total_samples": int(len(df)),
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            "train_class_counts": {str(k): int(v) for k, v in y_train.value_counts().items()},
            "test_class_counts": {str(k): int(v) for k, v in y_test.value_counts().items()},
            "random_seed": int(random_seed),
            "test_ratio": float(test_ratio)
        },
        "metrics": {
            "accuracy": round(acc, 4),
            "scam_recall": round(rec_scam, 4),
            "scam_precision": round(prec_scam, 4),
            "scam_f1": round(f1_scam, 4),
            "legitimate_recall": round(rec_legit, 4),
            "legitimate_precision": round(prec_legit, 4),
            "legitimate_f1": round(f1_legit, 4)
        },
        "confusion_matrix": {
            "labels": ["LEGITIMATE", "SCAM"],
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp),
            "matrix": [[int(tn), int(fp)], [int(fn), int(tp)]]
        },
        "classification_report": to_serializable(report_dict),
        "top_scam_features": top_scam_features,
        "top_legitimate_features": top_legit_features,
        "notes": "Trained on synthetic prototype dataset. Recall prioritizes catching social engineering attacks with 0 false negatives."
    }

    with open(eval_export_path, "w", encoding="utf-8") as f:
        json.dump(eval_payload, f, indent=2, ensure_ascii=False)
    print(f"      Saved evaluation report: {eval_export_path} ({os.path.getsize(eval_export_path)/1024:.1f} KB)")

    print("\n" + "=" * 60)
    print("TRAINING & EXPORT COMPLETED SUCCESSFULLY")
    print("=" * 60)

if __name__ == "__main__":
    main()
