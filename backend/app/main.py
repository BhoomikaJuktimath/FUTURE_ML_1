from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes.health import router as health_router
from app.routes.data import router as data_router
from app.routes.model import router as model_router
from app.routes.forecast import router as forecast_router
from app.routes.insights import router as insights_router

from app.utils.data_generator import generate_sample_sales_csv
from app.routes.data import get_or_create_active_df
from app.ml.preprocessing import clean_and_prepare_data
from app.ml.model_trainer import train_forecasting_models
from app.utils.storage import load_trained_model, save_trained_model

app = FastAPI(
    title="ForecastIQ — Sales & Demand Forecasting System API",
    description="End-to-End Sales & Demand Forecasting ML System Backend API",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router)
app.include_router(data_router)
app.include_router(model_router)
app.include_router(forecast_router)
app.include_router(insights_router)

@app.on_event("startup")
def startup_event():
    """
    On server startup, ensure sample data exists and initial model is pre-trained.
    """
    try:
        raw_df, _, _ = get_or_create_active_df()
        rf_model, metadata = load_trained_model()
        if not rf_model or not metadata:
            print("No pre-trained model found on startup. Training initial model on sample dataset...")
            daily_df, _ = clean_and_prepare_data(raw_df)
            rf_model, metadata = train_forecasting_models(daily_df)
            save_trained_model(rf_model, metadata)
            print("Initial model trained and saved successfully.")
    except Exception as e:
        print(f"Startup warning: Could not pre-train initial model: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
