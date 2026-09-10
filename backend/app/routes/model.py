from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import os
from typing import Optional
from app.ml.preprocessing import clean_and_prepare_data
from app.ml.model_trainer import train_forecasting_models
from app.utils.storage import save_trained_model, load_trained_model
from app.routes.data import get_or_create_active_df
from app.models.schemas import PerformanceResponse, FeatureImportance

router = APIRouter(prefix="/api/model", tags=["Model"])

@router.post("/train", response_model=PerformanceResponse)
def train_model(
    date_col: Optional[str] = Query(None),
    sales_col: Optional[str] = Query(None)
):
    """
    Triggers chronological preprocessing, feature engineering, train/test split,
    Naive Baseline vs RandomForest model training, metrics calculation, and Joblib saving.
    """
    try:
        raw_df, _, _ = get_or_create_active_df()
        daily_df, quality_report = clean_and_prepare_data(raw_df, custom_date_col=date_col, custom_sales_col=sales_col)
        
        if len(daily_df) < 30:
            raise HTTPException(
                status_code=400, 
                detail="Insufficient historical records for model training. At least 30 aggregated daily sales entries required."
            )
            
        rf_model, metadata = train_forecasting_models(daily_df)
        save_trained_model(rf_model, metadata)
        
        return PerformanceResponse(**metadata["performance"])
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

@router.get("/performance", response_model=PerformanceResponse)
def get_model_performance():
    """
    Returns stored evaluation metrics, feature importances, and actual vs predicted comparisons.
    """
    rf_model, metadata = load_trained_model()
    if not metadata or "performance" not in metadata:
        # Train automatically on active data if no saved model exists yet
        return train_model()
    return PerformanceResponse(**metadata["performance"])

@router.get("/features")
def get_model_features():
    """
    Returns the engineered features list and their importances if trained.
    """
    rf_model, metadata = load_trained_model()
    if not metadata or "performance" not in metadata:
        raw_df, _, _ = get_or_create_active_df()
        daily_df, _ = clean_and_prepare_data(raw_df)
        rf_model, metadata = train_forecasting_models(daily_df)
        save_trained_model(rf_model, metadata)
        
    perf = metadata["performance"]
    return {
        "features": metadata.get("feature_cols", []),
        "importances": perf.get("feature_importances", [])
    }
