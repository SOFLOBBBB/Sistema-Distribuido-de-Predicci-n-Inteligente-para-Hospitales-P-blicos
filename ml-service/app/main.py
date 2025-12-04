"""
S.D.P.I. ML Service - Main Application Entry Point

[MODULE 3]: Distributed microservice for ML predictions
[MODULE 4]: Machine Learning inference service

This service runs as a separate process from the main Backend API,
demonstrating a distributed architecture where ML computation
is offloaded to a specialized service.

Author: Sofía Castellanos Lobo
"""

import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import predictions, health
from app.services.model_service import ModelService


# Application startup/shutdown lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    [MODULE 4]: Load ML model on startup
    This ensures the model is ready before serving predictions
    """
    print("=" * 60)
    print("  S.D.P.I. ML Service Starting...")
    print("=" * 60)
    
    # Initialize and load the ML model
    model_service = ModelService()
    model_service.load_model()
    
    # Store in app state for access in routes
    app.state.model_service = model_service
    app.state.start_time = time.time()
    
    print(f"  ✓ Model loaded: {model_service.model_version}")
    print(f"  ✓ Algorithm: {model_service.model_algorithm}")
    print("=" * 60)
    
    yield  # Application runs here
    
    # Cleanup on shutdown
    print("  ML Service shutting down...")


# Create FastAPI application
app = FastAPI(
    title="S.D.P.I. ML Service",
    description="""
    ## Machine Learning Microservice for Hospital Prediction System
    
    This service provides ML-based clinical risk predictions as part of a 
    distributed system architecture.
    
    ### [MODULE 3] - Distributed Systems
    - Runs as an independent microservice
    - Communicates via REST API with the main backend
    - Can be scaled independently
    
    ### [MODULE 4] - Soft Computing / Machine Learning
    - Implements Logistic Regression for risk prediction
    - Provides probability scores and risk levels
    - Includes feature importance analysis
    
    ### Available Predictions
    - **READMISSION_RISK**: Risk of hospital readmission within 30 days
    - **DIABETES_RISK**: Risk of developing diabetes
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# [MODULE 3]: Configure CORS for distributed communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predictions.router, tags=["predictions"])
app.include_router(health.router, tags=["health"])


@app.get("/", tags=["root"])
async def root():
    """Root endpoint with service information"""
    return {
        "service": "S.D.P.I. ML Service",
        "description": "Machine Learning Microservice for Hospital Predictions",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "module_3": "Distributed microservice architecture",
        "module_4": "Machine Learning inference",
    }

