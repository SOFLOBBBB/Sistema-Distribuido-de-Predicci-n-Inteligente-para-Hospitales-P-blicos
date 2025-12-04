"""
Prediction Schemas (Pydantic Models)

[MODULE 4]: Data validation for ML predictions

Author: Sofía Castellanos Lobo
"""

from enum import Enum
from typing import Optional, Dict
from pydantic import BaseModel, Field


class PredictionType(str, Enum):
    """Types of predictions available"""
    READMISSION_RISK = "READMISSION_RISK"
    DIABETES_RISK = "DIABETES_RISK"


class RiskLevel(str, Enum):
    """Risk level categories"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class PredictionFeatures(BaseModel):
    """
    Clinical features for ML prediction
    
    [MODULE 4]: These are the input features for the ML model
    Each feature corresponds to clinical measurements
    """
    
    # Demographic
    age: int = Field(..., ge=0, le=150, description="Patient age in years")
    
    # Physical measurements
    bmi: Optional[float] = Field(None, ge=10, le=80, description="Body Mass Index (kg/m²)")
    blood_pressure_systolic: Optional[int] = Field(None, ge=60, le=250, description="Systolic BP (mmHg)")
    blood_pressure_diastolic: Optional[int] = Field(None, ge=40, le=150, description="Diastolic BP (mmHg)")
    
    # Lab results
    glucose_level: Optional[float] = Field(None, ge=20, le=600, description="Fasting glucose (mg/dL)")
    cholesterol: Optional[float] = Field(None, ge=50, le=500, description="Total cholesterol (mg/dL)")
    hba1c: Optional[float] = Field(None, ge=3, le=20, description="HbA1c (%)")
    
    # Medical history
    previous_admissions: int = Field(0, ge=0, le=100, description="Number of previous hospital admissions")
    last_stay_duration: Optional[int] = Field(None, ge=0, le=365, description="Length of last stay (days)")
    has_diabetes: bool = Field(False, description="Has diagnosed diabetes")
    has_hypertension: bool = Field(False, description="Has diagnosed hypertension")
    has_heart_disease: bool = Field(False, description="Has heart disease")
    
    # Lifestyle
    smoking_status: str = Field("NEVER", description="Smoking status: NEVER, FORMER, CURRENT")

    class Config:
        json_schema_extra = {
            "example": {
                "age": 55,
                "bmi": 28.5,
                "blood_pressure_systolic": 140,
                "blood_pressure_diastolic": 90,
                "glucose_level": 126,
                "cholesterol": 220,
                "hba1c": 6.5,
                "previous_admissions": 2,
                "last_stay_duration": 5,
                "has_diabetes": True,
                "has_hypertension": True,
                "has_heart_disease": False,
                "smoking_status": "FORMER"
            }
        }


class PredictionRequest(BaseModel):
    """
    Request body for prediction endpoint
    
    [MODULE 3]: API contract between Backend API and ML Service
    """
    prediction_type: PredictionType = Field(..., description="Type of prediction to perform")
    features: PredictionFeatures = Field(..., description="Clinical features for prediction")

    class Config:
        json_schema_extra = {
            "example": {
                "prediction_type": "READMISSION_RISK",
                "features": {
                    "age": 55,
                    "bmi": 28.5,
                    "blood_pressure_systolic": 140,
                    "blood_pressure_diastolic": 90,
                    "glucose_level": 126,
                    "cholesterol": 220,
                    "previous_admissions": 2,
                    "has_diabetes": True,
                    "has_hypertension": True,
                    "has_heart_disease": False,
                    "smoking_status": "FORMER"
                }
            }
        }


class PredictionResponse(BaseModel):
    """
    Response from prediction endpoint
    
    [MODULE 4]: ML prediction result with explainability
    """
    success: bool = Field(..., description="Whether prediction was successful")
    prediction_type: str = Field(..., description="Type of prediction performed")
    risk_score: float = Field(..., ge=0, le=1, description="Probability score (0-1)")
    risk_level: RiskLevel = Field(..., description="Categorical risk level")
    model_version: str = Field(..., description="Version of the ML model used")
    model_algorithm: str = Field(..., description="Algorithm used for prediction")
    feature_importance: Dict[str, float] = Field(..., description="Feature importance scores")
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "prediction_type": "READMISSION_RISK",
                "risk_score": 0.72,
                "risk_level": "HIGH",
                "model_version": "1.0.0",
                "model_algorithm": "logistic_regression",
                "feature_importance": {
                    "previous_admissions": 0.25,
                    "age": 0.18,
                    "has_diabetes": 0.15,
                    "glucose_level": 0.12
                },
                "processing_time_ms": 15
            }
        }

