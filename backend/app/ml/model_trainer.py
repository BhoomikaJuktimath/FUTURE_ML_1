import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore', category=UserWarning)

from sklearn.ensemble import RandomForestRegressor
from typing import Tuple, Dict, Any, List

from app.ml.feature_engineering import generate_feature_dataset, FEATURE_COLUMNS
from app.ml.evaluator import calculate_metrics, generate_metric_explanations
from app.models.schemas import ModelMetrics, FeatureImportance, PerformanceResponse

def train_forecasting_models(daily_df: pd.DataFrame) -> Tuple[RandomForestRegressor, Dict[str, Any]]:
    """
    Chronologically splits data (80% train, 20% test).
    Trains Naive Baseline and RandomForestRegressor.
    Calculates evaluation metrics and feature importances.
    """
    df, feature_cols = generate_feature_dataset(daily_df)
    
    n_samples = len(df)
    train_size = int(n_samples * 0.8)
    
    train_df = df.iloc[:train_size].copy()
    test_df = df.iloc[train_size:].copy()
    
    X_train = train_df[feature_cols]
    y_train = train_df['Sales'].values
    
    X_test = test_df[feature_cols]
    y_test = test_df['Sales'].values
    
    # 1. Train Baseline Model (Naive Forecast = previous known sales, i.e., lag_1)
    baseline_preds = test_df['lag_1'].values
    baseline_metrics = calculate_metrics(y_test, baseline_preds, "Naive Baseline (Lag-1)")
    
    # 2. Train Random Forest Model
    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    rf_preds = rf_model.predict(X_test)
    
    rf_metrics = calculate_metrics(y_test, rf_preds, "Random Forest Regressor")
    
    # Feature Importances
    importances = rf_model.feature_importances_
    feat_imp_list = [
        FeatureImportance(feature=col, importance=round(float(imp), 4))
        for col, imp in zip(feature_cols, importances)
    ]
    feat_imp_list.sort(key=lambda x: x.importance, reverse=True)
    
    # Winner determination & Improvement
    if rf_metrics.mae < baseline_metrics.mae:
        better_model = "Random Forest Regressor"
        improvement = ((baseline_metrics.mae - rf_metrics.mae) / baseline_metrics.mae) * 100.0
    else:
        better_model = "Naive Baseline"
        improvement = 0.0
        
    mae_exp, rmse_exp, r2_exp, mape_exp = generate_metric_explanations(rf_metrics, baseline_metrics)
    
    # Build Actual vs Predicted records for test set
    test_dates = test_df['Date'].dt.strftime("%Y-%m-%d").tolist()
    actual_vs_predicted = []
    for i in range(len(test_dates)):
        act = float(y_test[i])
        pred_base = float(baseline_preds[i])
        pred_rf = float(rf_preds[i])
        err_rf = float(act - pred_rf)
        
        actual_vs_predicted.append({
            "date": test_dates[i],
            "actual": round(act, 2),
            "predicted_baseline": round(pred_base, 2),
            "predicted_rf": round(pred_rf, 2),
            "error_rf": round(err_rf, 2),
            "abs_error_rf": round(abs(err_rf), 2)
        })
        
    performance_response = PerformanceResponse(
        baseline_metrics=baseline_metrics,
        rf_metrics=rf_metrics,
        better_model=better_model,
        improvement_percentage=round(float(improvement), 2),
        feature_importances=feat_imp_list,
        actual_vs_predicted=actual_vs_predicted,
        mae_explanation=mae_exp,
        rmse_explanation=rmse_exp,
        r2_explanation=r2_exp,
        mape_explanation=mape_exp
    )
    
    metadata = {
        "feature_cols": feature_cols,
        "performance": performance_response.model_dump(),
        "train_size": train_size,
        "test_size": len(test_df),
        "last_historical_date": daily_df['Date'].max().strftime("%Y-%m-%d")
    }
    
    return rf_model, metadata
