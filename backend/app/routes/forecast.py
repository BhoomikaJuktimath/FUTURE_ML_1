from fastapi import APIRouter, HTTPException, Query, Body
import pandas as pd
from typing import Optional
from app.ml.preprocessing import clean_and_prepare_data
from app.ml.model_trainer import train_forecasting_models
from app.ml.forecaster import generate_future_forecast
from app.utils.storage import load_trained_model, save_trained_model
from app.routes.data import get_or_create_active_df
from app.models.schemas import ForecastResponse

router = APIRouter(prefix="/api/forecast", tags=["Forecast"])

@router.post("", response_model=ForecastResponse)
@router.post("/", response_model=ForecastResponse)
def create_forecast(horizon: int = Body(30, embed=True)):
    """
    Generates multi-step recursive sales forecast for 7, 14, 30, 60, or 90 days.
    """
    if horizon not in [7, 14, 30, 60, 90]:
        horizon = 30
        
    try:
        rf_model, metadata = load_trained_model()
        raw_df, _, _ = get_or_create_active_df()
        daily_df, _ = clean_and_prepare_data(raw_df)
        
        if not rf_model or not metadata:
            rf_model, metadata = train_forecasting_models(daily_df)
            save_trained_model(rf_model, metadata)
            
        # Get residual std from evaluation for confidence intervals
        perf = metadata.get("performance", {})
        rf_metrics = perf.get("rf_metrics", {})
        rmse = rf_metrics.get("rmse", 15.0)
        
        forecast_res = generate_future_forecast(
            daily_df=daily_df,
            rf_model=rf_model,
            horizon_days=horizon,
            residual_std=rmse
        )
        
        return forecast_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate forecast: {str(e)}")

@router.get("/history", response_model=ForecastResponse)
def get_forecast_history(horizon: int = Query(30)):
    return create_forecast(horizon=horizon)
