"""
Predictions Router

[MODULE 3]: REST API endpoint for distributed ML predictions
[MODULE 4]: ML inference endpoint

This router handles prediction requests from the Backend API,
demonstrating the distributed architecture of the system.

Author: Sofía Castellanos Lobo
"""

from fastapi import APIRouter, Request, HTTPException

from app.schemas import (
    PredictionRequest,
    PredictionResponse,
    RiskLevel,
)
from app.services.model_service import ModelService

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict(request: Request, prediction_request: PredictionRequest):
    """
    Run ML prediction on clinical features
    
    [MODULE 3]: This endpoint receives requests from the Backend API
    (a separate service), processes them, and returns predictions.
    This demonstrates distributed processing.
    
    [MODULE 4]: The prediction uses Logistic Regression to calculate
    the probability of the specified outcome (e.g., readmission risk).
    
    Mathematical Model:
        P(Y=1|X) = σ(z) = 1 / (1 + e^(-z))
        where z = β₀ + Σ(βᵢ · xᵢ)
    
    Args:
        prediction_request: Contains prediction_type and clinical features
        
    Returns:
        PredictionResponse with risk_score, risk_level, and feature_importance
    """
    try:
        # Get model service from app state
        model_service: ModelService = request.app.state.model_service
        
        # Run prediction
        risk_score, risk_level, feature_importance, processing_time = model_service.predict(
            prediction_type=prediction_request.prediction_type,
            features=prediction_request.features
        )
        
        return PredictionResponse(
            success=True,
            prediction_type=prediction_request.prediction_type.value,
            risk_score=round(risk_score, 4),
            risk_level=risk_level,
            model_version=model_service.model_version,
            model_algorithm=model_service.model_algorithm,
            feature_importance=feature_importance,
            processing_time_ms=processing_time,
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/model-info")
async def get_model_info(request: Request):
    """
    Get information about the loaded ML model
    
    [MODULE 4]: Model metadata and coefficients for interpretability
    
    Returns:
        Model version, algorithm, features, and coefficients
    """
    model_service: ModelService = request.app.state.model_service
    return model_service.get_model_info()

