import pytest
import pandas as pd
import numpy as np

from app.utils.data_generator import generate_sample_sales_csv
from app.ml.preprocessing import clean_and_prepare_data, detect_columns
from app.ml.feature_engineering import generate_feature_dataset, create_time_features, create_lag_and_rolling_features
from app.ml.evaluator import calculate_metrics
from app.ml.model_trainer import train_forecasting_models
from app.ml.forecaster import generate_future_forecast

def test_data_generation_and_preprocessing(tmp_path):
    csv_path = str(tmp_path / "test_sales.csv")
    generate_sample_sales_csv(csv_path, num_days=100)
    
    df = pd.read_csv(csv_path)
    assert len(df) > 90
    
    date_col, sales_col = detect_columns(df)
    assert date_col in df.columns
    assert sales_col in df.columns
    
    daily_df, report = clean_and_prepare_data(df)
    assert len(daily_df) >= 90
    assert report.total_days >= 90
    assert report.health_score > 50

def test_feature_engineering_no_leakage():
    dates = pd.date_range("2023-01-01", periods=50, freq="D")
    sales = np.arange(1.0, 51.0)
    df = pd.DataFrame({"Date": dates, "Sales": sales})
    
    feat_df, cols = generate_feature_dataset(df)
    
    # Verify lag_1 for day i is sales of day i-1
    assert feat_df['lag_1'].iloc[10] == sales[9]
    assert feat_df['lag_7'].iloc[10] == sales[3]
    
    # Verify rolling mean of 7 days uses shift(1)
    expected_roll_7 = np.mean(sales[3:10]) # sales 4..10
    assert abs(feat_df['rolling_mean_7'].iloc[10] - expected_roll_7) < 1e-4

def test_metrics_calculation():
    y_true = np.array([100.0, 200.0, 150.0, 300.0])
    y_pred = np.array([110.0, 190.0, 160.0, 290.0])
    
    metrics = calculate_metrics(y_true, y_pred, "TestModel")
    assert metrics.mae == 10.0
    assert metrics.rmse == 10.0
    assert metrics.r2 > 0.90
    assert metrics.mape > 0.0

def test_model_training_and_forecasting(tmp_path):
    csv_path = str(tmp_path / "test_sales.csv")
    generate_sample_sales_csv(csv_path, num_days=200)
    df = pd.read_csv(csv_path)
    daily_df, _ = clean_and_prepare_data(df)
    
    rf_model, metadata = train_forecasting_models(daily_df)
    assert rf_model is not None
    assert "performance" in metadata
    assert metadata["performance"]["rf_metrics"]["mae"] >= 0.0
    
    forecast_res = generate_future_forecast(daily_df, rf_model, horizon_days=14)
    assert forecast_res.horizon_days == 14
    assert len(forecast_res.forecast_records) == 14
    assert forecast_res.summary.total_forecasted_sales > 0.0
