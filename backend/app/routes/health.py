from fastapi import APIRouter
import os
from app.utils.storage import MODEL_PATH

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health")
def health_check():
    model_exists = os.path.exists(MODEL_PATH)
    return {
        "status": "online",
        "app_name": "ForecastIQ — Sales & Demand Forecasting System",
        "version": "1.0.0",
        "model_trained": model_exists
    }
