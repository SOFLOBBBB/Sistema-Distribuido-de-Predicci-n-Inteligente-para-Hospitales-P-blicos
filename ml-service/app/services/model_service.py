"""
ML Model Service

[MODULE 4]: Machine Learning Model Management and Inference

This service handles:
- Loading pre-trained models
- Feature preprocessing
- Running predictions
- Calculating feature importance

MATHEMATICAL MODEL (Logistic Regression):

The logistic regression model predicts probability using the sigmoid function:

    P(Y=1|X) = 1 / (1 + e^(-z))

Where:
    z = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ

    - Y = 1 indicates the positive outcome (e.g., readmission)
    - xᵢ are the input features (age, BMI, glucose, etc.)
    - βᵢ are the learned coefficients

Loss function (Binary Cross-Entropy):
    
    L = -1/N Σ[yᵢ·log(p̂ᵢ) + (1-yᵢ)·log(1-p̂ᵢ)]

Author: Sofía Castellanos Lobo
"""

import os
import time
from pathlib import Path
from typing import Dict, Tuple, Optional

import numpy as np
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

from app.schemas import PredictionFeatures, PredictionType, RiskLevel


class ModelService:
    """
    [MODULE 4]: ML Model Service for clinical risk prediction
    
    This class manages the ML model lifecycle and inference.
    It can load pre-trained models or train new ones.
    """
    
    # Feature names in order expected by the model
    FEATURE_NAMES = [
        'age',
        'bmi',
        'blood_pressure_systolic',
        'blood_pressure_diastolic',
        'glucose_level',
        'cholesterol',
        'hba1c',
        'previous_admissions',
        'last_stay_duration',
        'has_diabetes',
        'has_hypertension',
        'has_heart_disease',
        'smoking_never',
        'smoking_former',
        'smoking_current',
    ]
    
    # Default values for missing features (mean/mode imputation)
    DEFAULT_VALUES = {
        'bmi': 25.0,
        'blood_pressure_systolic': 120,
        'blood_pressure_diastolic': 80,
        'glucose_level': 100.0,
        'cholesterol': 200.0,
        'hba1c': 5.5,
        'last_stay_duration': 0,
    }
    
    def __init__(self):
        self.model: Optional[Pipeline] = None
        self.model_version = "1.0.0"
        self.model_algorithm = "logistic_regression"
        self.feature_coefficients: Dict[str, float] = {}
        self._models_dir = Path(__file__).parent.parent / "models"
    
    def load_model(self) -> None:
        """
        Load pre-trained model from file or create a default one
        
        [MODULE 4]: Model persistence and loading
        """
        model_path = self._models_dir / "readmission_model.joblib"
        
        if model_path.exists():
            print(f"  Loading model from {model_path}")
            self.model = joblib.load(model_path)
            # Extract coefficients from loaded model
            if hasattr(self.model, 'named_steps'):
                lr = self.model.named_steps.get('classifier')
                if lr and hasattr(lr, 'coef_'):
                    self._extract_coefficients(lr)
        else:
            print("  No pre-trained model found, creating default model...")
            self._create_default_model()
    
    def _create_default_model(self) -> None:
        """
        Create a default model with reasonable coefficients
        
        [MODULE 4]: This creates a model with clinically meaningful coefficients
        based on medical literature about readmission risk factors.
        """
        # Create pipeline with scaler and logistic regression
        self.model = Pipeline([
            ('scaler', StandardScaler()),
            ('classifier', LogisticRegression(
                random_state=42,
                max_iter=1000,
                C=1.0,
            ))
        ])
        
        # Generate synthetic data to fit the model
        # This ensures the model structure is correct
        np.random.seed(42)
        n_samples = 100
        
        # Create features with realistic distributions
        X = np.column_stack([
            np.random.normal(55, 15, n_samples),      # age
            np.random.normal(27, 5, n_samples),       # bmi
            np.random.normal(130, 20, n_samples),     # bp_systolic
            np.random.normal(85, 10, n_samples),      # bp_diastolic
            np.random.normal(110, 30, n_samples),     # glucose
            np.random.normal(200, 40, n_samples),     # cholesterol
            np.random.normal(5.8, 1.0, n_samples),    # hba1c
            np.random.poisson(1.5, n_samples),        # previous_admissions
            np.random.poisson(3, n_samples),          # last_stay_duration
            np.random.binomial(1, 0.15, n_samples),   # has_diabetes
            np.random.binomial(1, 0.25, n_samples),   # has_hypertension
            np.random.binomial(1, 0.10, n_samples),   # has_heart_disease
            np.random.binomial(1, 0.50, n_samples),   # smoking_never
            np.random.binomial(1, 0.30, n_samples),   # smoking_former
            np.random.binomial(1, 0.20, n_samples),   # smoking_current
        ])
        
        # Generate target with realistic risk factors
        risk_score = (
            0.02 * (X[:, 0] - 50) +          # age effect
            0.03 * (X[:, 1] - 25) +          # bmi effect
            0.01 * (X[:, 2] - 120) +         # bp effect
            0.005 * (X[:, 4] - 100) +        # glucose effect
            0.25 * X[:, 7] +                 # previous admissions (strong effect)
            0.05 * X[:, 8] +                 # last stay duration
            0.3 * X[:, 9] +                  # diabetes
            0.2 * X[:, 10] +                 # hypertension
            0.25 * X[:, 11] +                # heart disease
            0.1 * X[:, 14] +                 # current smoker
            np.random.normal(0, 0.5, n_samples)
        )
        y = (risk_score > np.median(risk_score)).astype(int)
        
        # Fit the model
        self.model.fit(X, y)
        
        # Extract and store coefficients
        self._extract_coefficients(self.model.named_steps['classifier'])
        
        # Save the model
        self._models_dir.mkdir(parents=True, exist_ok=True)
        model_path = self._models_dir / "readmission_model.joblib"
        joblib.dump(self.model, model_path)
        print(f"  Default model saved to {model_path}")
    
    def _extract_coefficients(self, lr_model: LogisticRegression) -> None:
        """Extract feature coefficients for interpretability"""
        if hasattr(lr_model, 'coef_') and lr_model.coef_ is not None:
            coefficients = lr_model.coef_[0]
            self.feature_coefficients = {
                name: float(coef) 
                for name, coef in zip(self.FEATURE_NAMES, coefficients)
            }
    
    def preprocess_features(self, features: PredictionFeatures) -> np.ndarray:
        """
        Convert input features to model-ready format
        
        [MODULE 4]: Feature preprocessing and encoding
        
        - Handles missing values with imputation
        - Encodes categorical variables (one-hot for smoking status)
        - Converts boolean to numeric
        """
        # Handle missing values with defaults
        feature_dict = {
            'age': features.age,
            'bmi': features.bmi if features.bmi is not None else self.DEFAULT_VALUES['bmi'],
            'blood_pressure_systolic': features.blood_pressure_systolic if features.blood_pressure_systolic is not None else self.DEFAULT_VALUES['blood_pressure_systolic'],
            'blood_pressure_diastolic': features.blood_pressure_diastolic if features.blood_pressure_diastolic is not None else self.DEFAULT_VALUES['blood_pressure_diastolic'],
            'glucose_level': features.glucose_level if features.glucose_level is not None else self.DEFAULT_VALUES['glucose_level'],
            'cholesterol': features.cholesterol if features.cholesterol is not None else self.DEFAULT_VALUES['cholesterol'],
            'hba1c': features.hba1c if features.hba1c is not None else self.DEFAULT_VALUES['hba1c'],
            'previous_admissions': features.previous_admissions,
            'last_stay_duration': features.last_stay_duration if features.last_stay_duration is not None else self.DEFAULT_VALUES['last_stay_duration'],
            'has_diabetes': int(features.has_diabetes),
            'has_hypertension': int(features.has_hypertension),
            'has_heart_disease': int(features.has_heart_disease),
            # One-hot encode smoking status
            'smoking_never': 1 if features.smoking_status == 'NEVER' else 0,
            'smoking_former': 1 if features.smoking_status == 'FORMER' else 0,
            'smoking_current': 1 if features.smoking_status == 'CURRENT' else 0,
        }
        
        # Create numpy array in correct feature order
        X = np.array([[feature_dict[name] for name in self.FEATURE_NAMES]])
        
        return X
    
    def predict(
        self,
        prediction_type: PredictionType,
        features: PredictionFeatures
    ) -> Tuple[float, RiskLevel, Dict[str, float], int]:
        """
        Run prediction and return results
        
        [MODULE 4]: ML Inference
        
        Args:
            prediction_type: Type of prediction
            features: Clinical features
            
        Returns:
            Tuple of (risk_score, risk_level, feature_importance, processing_time_ms)
        """
        start_time = time.time()
        
        if self.model is None:
            raise RuntimeError("Model not loaded")
        
        # Preprocess features
        X = self.preprocess_features(features)
        
        # Get probability prediction
        # [MODULE 4]: The sigmoid function outputs probability
        probabilities = self.model.predict_proba(X)
        risk_score = float(probabilities[0][1])  # Probability of positive class
        
        # Determine risk level based on thresholds
        risk_level = self._calculate_risk_level(risk_score)
        
        # Calculate feature importance for this prediction
        feature_importance = self._calculate_feature_importance(X)
        
        # Calculate processing time
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        return risk_score, risk_level, feature_importance, processing_time_ms
    
    def _calculate_risk_level(self, risk_score: float) -> RiskLevel:
        """
        Convert probability score to categorical risk level
        
        Thresholds based on clinical relevance:
        - LOW: < 0.3 (30%)
        - MEDIUM: 0.3 - 0.7 (30-70%)
        - HIGH: >= 0.7 (70%+)
        """
        if risk_score < 0.3:
            return RiskLevel.LOW
        elif risk_score < 0.7:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.HIGH
    
    def _calculate_feature_importance(self, X: np.ndarray) -> Dict[str, float]:
        """
        Calculate feature importance for explainability
        
        [MODULE 4]: Model interpretability
        
        Uses coefficient magnitude * feature value as importance measure
        """
        if not self.feature_coefficients:
            return {}
        
        # Calculate importance as |coefficient| * |feature_value|
        importance_scores = {}
        for i, name in enumerate(self.FEATURE_NAMES):
            coef = self.feature_coefficients.get(name, 0)
            importance_scores[name] = abs(coef * X[0][i])
        
        # Normalize to sum to 1
        total = sum(importance_scores.values())
        if total > 0:
            importance_scores = {
                k: round(v / total, 4) 
                for k, v in importance_scores.items()
            }
        
        # Return top 10 features sorted by importance
        sorted_importance = dict(
            sorted(importance_scores.items(), key=lambda x: x[1], reverse=True)[:10]
        )
        
        return sorted_importance
    
    def get_model_info(self) -> Dict:
        """Get model metadata for API response"""
        return {
            "version": self.model_version,
            "algorithm": self.model_algorithm,
            "feature_count": len(self.FEATURE_NAMES),
            "feature_names": self.FEATURE_NAMES,
            "coefficients": self.feature_coefficients,
            "model_loaded": self.model is not None,
            "description": """
            Logistic Regression model for hospital readmission risk prediction.
            
            Mathematical formula:
            P(readmission) = 1 / (1 + e^(-z))
            where z = β₀ + Σ(βᵢ · xᵢ)
            
            The model outputs a probability between 0 and 1, which is then
            categorized into LOW (<0.3), MEDIUM (0.3-0.7), or HIGH (≥0.7) risk.
            """,
        }

