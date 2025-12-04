"""
ML Model Training Script

[MODULE 4]: Machine Learning Model Training and Evaluation

This script:
1. Loads the training dataset
2. Preprocesses features
3. Trains a Logistic Regression model
4. Evaluates performance with multiple metrics
5. Saves the trained model

MATHEMATICAL MODEL:

Logistic Regression uses the sigmoid function:
    
    σ(z) = 1 / (1 + e^(-z))

Where:
    z = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ

The model is trained using gradient descent to minimize
the Binary Cross-Entropy loss:

    L = -1/N Σ[yᵢ·log(ŷᵢ) + (1-yᵢ)·log(1-ŷᵢ)]

Author: Sofía Castellanos Lobo
Universidad de Guadalajara - CUCEI
"""

import os
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)


def load_dataset(filepath: str) -> pd.DataFrame:
    """Load and validate the training dataset"""
    print(f"\n{'='*60}")
    print("  [MODULE 4] Loading Training Dataset")
    print(f"{'='*60}")
    
    df = pd.read_csv(filepath)
    
    print(f"  ✓ Loaded {len(df)} records")
    print(f"  ✓ Features: {list(df.columns)}")
    print(f"  ✓ Target distribution:")
    print(f"    - Not readmitted (0): {(df['readmitted_30_days'] == 0).sum()}")
    print(f"    - Readmitted (1): {(df['readmitted_30_days'] == 1).sum()}")
    
    return df


def preprocess_data(df: pd.DataFrame):
    """
    Preprocess data for ML training
    
    [MODULE 4]: Feature engineering
    - One-hot encoding for categorical variables
    - Handling missing values
    - Feature scaling
    """
    print(f"\n{'='*60}")
    print("  [MODULE 4] Preprocessing Data")
    print(f"{'='*60}")
    
    # Select features
    feature_columns = [
        'age', 'bmi', 'blood_pressure_systolic', 'blood_pressure_diastolic',
        'glucose_level', 'cholesterol', 'hba1c', 'previous_admissions',
        'last_stay_duration', 'has_diabetes', 'has_hypertension',
        'has_heart_disease', 'smoking_status'
    ]
    
    # Create feature matrix
    X = df[feature_columns].copy()
    y = df['readmitted_30_days'].values
    
    # One-hot encode smoking status
    X['smoking_never'] = (X['smoking_status'] == 'NEVER').astype(int)
    X['smoking_former'] = (X['smoking_status'] == 'FORMER').astype(int)
    X['smoking_current'] = (X['smoking_status'] == 'CURRENT').astype(int)
    X = X.drop('smoking_status', axis=1)
    
    print(f"  ✓ Feature matrix shape: {X.shape}")
    print(f"  ✓ Features used: {list(X.columns)}")
    
    return X, y


def train_logistic_regression(X_train, y_train):
    """
    Train Logistic Regression model
    
    [MODULE 4]: Logistic Regression Implementation
    
    Mathematical description:
        P(Y=1|X) = 1 / (1 + e^(-(β₀ + Σβᵢxᵢ)))
    
    Hyperparameters:
        - C: Regularization strength (inverse)
        - max_iter: Maximum iterations for convergence
    """
    print(f"\n{'='*60}")
    print("  [MODULE 4] Training Logistic Regression Model")
    print(f"{'='*60}")
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', LogisticRegression(
            C=1.0,
            random_state=42,
            max_iter=1000,
            solver='lbfgs',
        ))
    ])
    
    pipeline.fit(X_train, y_train)
    
    # Extract coefficients
    lr = pipeline.named_steps['classifier']
    print("\n  Model Coefficients (βᵢ):")
    print("  " + "-" * 40)
    for name, coef in zip(X_train.columns, lr.coef_[0]):
        print(f"    {name:30s}: {coef:+.4f}")
    print(f"    {'Intercept (β₀)':30s}: {lr.intercept_[0]:+.4f}")
    
    return pipeline


def train_random_forest(X_train, y_train):
    """
    Train Random Forest model for comparison
    
    [MODULE 4]: Decision Tree Ensemble
    """
    print(f"\n{'='*60}")
    print("  [MODULE 4] Training Random Forest Model (Comparison)")
    print(f"{'='*60}")
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
        ))
    ])
    
    pipeline.fit(X_train, y_train)
    
    # Feature importance
    rf = pipeline.named_steps['classifier']
    print("\n  Feature Importance (Gini):")
    print("  " + "-" * 40)
    importance = sorted(
        zip(X_train.columns, rf.feature_importances_),
        key=lambda x: x[1],
        reverse=True
    )
    for name, imp in importance:
        print(f"    {name:30s}: {imp:.4f}")
    
    return pipeline


def evaluate_model(model, X_test, y_test, model_name: str):
    """
    Evaluate model performance
    
    [MODULE 4]: Statistical Analysis and Performance Metrics
    """
    print(f"\n{'='*60}")
    print(f"  [MODULE 4] Evaluating {model_name}")
    print(f"{'='*60}")
    
    # Predictions
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    # Calculate metrics
    metrics = {
        'Accuracy': accuracy_score(y_test, y_pred),
        'Precision': precision_score(y_test, y_pred),
        'Recall': recall_score(y_test, y_pred),
        'F1-Score': f1_score(y_test, y_pred),
        'ROC-AUC': roc_auc_score(y_test, y_prob),
    }
    
    print("\n  Performance Metrics:")
    print("  " + "-" * 40)
    for metric, value in metrics.items():
        print(f"    {metric:15s}: {value:.4f} ({value*100:.2f}%)")
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    print("\n  Confusion Matrix:")
    print("  " + "-" * 40)
    print(f"    True Negatives:  {cm[0][0]:4d}")
    print(f"    False Positives: {cm[0][1]:4d}")
    print(f"    False Negatives: {cm[1][0]:4d}")
    print(f"    True Positives:  {cm[1][1]:4d}")
    
    # Classification Report
    print("\n  Classification Report:")
    print("  " + "-" * 40)
    print(classification_report(y_test, y_pred, target_names=['Not Readmitted', 'Readmitted']))
    
    return metrics


def cross_validate(model, X, y, model_name: str):
    """
    Perform k-fold cross-validation
    
    [MODULE 4]: Model validation
    """
    print(f"\n{'='*60}")
    print(f"  [MODULE 4] Cross-Validation for {model_name}")
    print(f"{'='*60}")
    
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='roc_auc')
    
    print(f"\n  5-Fold Cross-Validation (ROC-AUC):")
    print("  " + "-" * 40)
    for i, score in enumerate(cv_scores, 1):
        print(f"    Fold {i}: {score:.4f}")
    print(f"    {'Mean':7s}: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")
    
    return cv_scores


def save_model(model, filepath: str):
    """Save trained model to file"""
    print(f"\n{'='*60}")
    print("  Saving Model")
    print(f"{'='*60}")
    
    Path(filepath).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, filepath)
    print(f"  ✓ Model saved to: {filepath}")


def main():
    """Main training pipeline"""
    print("\n" + "=" * 60)
    print("  S.D.P.I. - ML Model Training Pipeline")
    print("  [MODULE 4] - Cómputo Flexible / Softcomputing")
    print("  Universidad de Guadalajara - CUCEI")
    print("=" * 60)
    
    # Paths
    script_dir = Path(__file__).parent
    dataset_path = script_dir / "dataset.csv"
    model_dir = script_dir.parent / "app" / "models"
    
    # Load data
    df = load_dataset(dataset_path)
    
    # Preprocess
    X, y = preprocess_data(df)
    
    # Split data (70% train, 30% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    
    print(f"\n  Train set: {len(X_train)} samples")
    print(f"  Test set:  {len(X_test)} samples")
    
    # Train models
    lr_model = train_logistic_regression(X_train, y_train)
    rf_model = train_random_forest(X_train, y_train)
    
    # Evaluate models
    lr_metrics = evaluate_model(lr_model, X_test, y_test, "Logistic Regression")
    rf_metrics = evaluate_model(rf_model, X_test, y_test, "Random Forest")
    
    # Cross-validation
    cross_validate(lr_model, X, y, "Logistic Regression")
    cross_validate(rf_model, X, y, "Random Forest")
    
    # Compare models
    print(f"\n{'='*60}")
    print("  Model Comparison Summary")
    print(f"{'='*60}")
    print("\n  Metric              | Logistic Reg. | Random Forest")
    print("  " + "-" * 55)
    for metric in lr_metrics:
        lr_val = lr_metrics[metric]
        rf_val = rf_metrics[metric]
        winner = "←" if lr_val >= rf_val else "→"
        print(f"  {metric:20s} | {lr_val:.4f}        | {rf_val:.4f}       {winner}")
    
    # Save the primary model (Logistic Regression)
    save_model(lr_model, model_dir / "readmission_model.joblib")
    
    print("\n" + "=" * 60)
    print("  Training Complete!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()

