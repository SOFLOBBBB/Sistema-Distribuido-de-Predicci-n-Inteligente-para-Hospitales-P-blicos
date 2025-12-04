"""
Health Check Router

[MODULE 3]: Health monitoring for distributed service

This router provides health check endpoints that the Backend API
can use to verify the ML service is available and functioning.

Author: Sofía Castellanos Lobo
"""

import time
from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/health")
async def health_check(request: Request):
    """
    Health check endpoint
    
    [MODULE 3]: Service discovery and health monitoring
    
    The Backend API calls this endpoint to:
    - Verify the ML service is running
    - Check if the model is loaded
    - Monitor service uptime
    
    Returns:
        Health status, model state, and uptime
    """
    model_service = request.app.state.model_service
    start_time = request.app.state.start_time
    
    uptime = time.time() - start_time
    
    return {
        "status": "healthy",
        "service": "S.D.P.I. ML Service",
        "model_loaded": model_service.model is not None,
        "model_version": model_service.model_version,
        "model_algorithm": model_service.model_algorithm,
        "uptime_seconds": round(uptime, 2),
    }


@router.get("/ready")
async def readiness_check(request: Request):
    """
    Readiness check endpoint
    
    [MODULE 3]: Kubernetes/container readiness probe compatible
    
    Returns 200 only if the service is ready to accept requests
    (model loaded and initialized).
    """
    model_service = request.app.state.model_service
    
    if model_service.model is None:
        return {
            "ready": False,
            "reason": "Model not loaded"
        }
    
    return {
        "ready": True,
        "model_version": model_service.model_version
    }

