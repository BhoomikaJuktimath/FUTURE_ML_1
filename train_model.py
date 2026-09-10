import sys
import os

# Set UTF-8 output encoding for Windows terminal compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add backend to Python path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

import pandas as pd
import json
from app.utils.data_generator import generate_sample_sales_csv
from app.routes.data import get_or_create_active_df
from app.ml.preprocessing import clean_and_prepare_data
from app.ml.model_trainer import train_forecasting_models
from app.ml.forecaster import generate_future_forecast
from app.utils.storage import save_trained_model, load_trained_model

def main():
    print("=" * 60)
    print("  ForecastIQ — Machine Learning Model Training & Pipeline  ")
    print("=" * 60)
    
    # 1. Load Data
    raw_df, is_sample, filename = get_or_create_active_df()
    print(f"\n[1/5] Loaded dataset '{filename}' ({len(raw_df)} raw records).")
    
    # 2. Preprocess
    daily_df, quality_report = clean_and_prepare_data(raw_df)
    print(f"[2/5] Preprocessed {quality_report.total_days} daily aggregated records.")
    print(f"      Data Health Status: {quality_report.health_status} ({quality_report.health_score}/100)")
    print(f"      Date Range: {quality_report.start_date} to {quality_report.end_date}")
    
    # 3. Train Model
    print(f"[3/5] Engineering time/lag/rolling features & training Random Forest model...")
    rf_model, metadata = train_forecasting_models(daily_df)
    
    # 4. Save Model
    saved_path = save_trained_model(rf_model, metadata)
    print(f"[4/5] Model saved successfully to: {saved_path}")
    
    # 5. Metrics & Forecast
    perf = metadata["performance"]
    rf_m = perf["rf_metrics"]
    base_m = perf["baseline_metrics"]
    
    print("\n" + "=" * 60)
    print("  MODEL EVALUATION METRICS (80/20 Chronological Test Set)  ")
    print("=" * 60)
    print(f"  Naive Baseline MAE : Rs. {base_m['mae']:,.2f}  | RMSE: Rs. {base_m['rmse']:,.2f} | R2: {base_m['r2']:.4f}")
    print(f"  Random Forest MAE  : Rs. {rf_m['mae']:,.2f}  | RMSE: Rs. {rf_m['rmse']:,.2f} | R2: {rf_m['r2']:.4f} | MAPE: {rf_m['mape']:.2f}%")
    print(f"  Better Model       : {perf['better_model']} (+{perf['improvement_percentage']:.2f}% improvement)")
    
    forecast_res = generate_future_forecast(daily_df, rf_model, horizon_days=30, residual_std=rf_m['rmse'])
    summary = forecast_res.summary
    print("\n" + "=" * 60)
    print("  30-DAY REAL FUTURE FORECAST SUMMARY  ")
    print("=" * 60)
    print(f"  Total 30-Day Forecasted Sales : Rs. {summary.total_forecasted_sales:,.2f}")
    print(f"  Average Daily Forecast       : Rs. {summary.avg_daily_sales:,.2f}")
    print(f"  Peak Forecasted Day          : {summary.max_sales_day['date']} (Rs. {summary.max_sales_day['sales']:,.2f})")
    print(f"  Lowest Forecasted Day        : {summary.min_sales_day['date']} (Rs. {summary.min_sales_day['sales']:,.2f})")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
