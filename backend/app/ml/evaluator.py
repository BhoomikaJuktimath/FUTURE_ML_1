import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from typing import Dict, Any, List, Tuple
from app.models.schemas import ModelMetrics

def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray, model_name: str) -> ModelMetrics:
    """
    Calculates MAE, RMSE, R², and safe MAPE metrics.
    """
    y_true = np.array(y_true, dtype=float)
    y_pred = np.array(y_pred, dtype=float)
    
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = float(r2_score(y_true, y_pred))
    
    # Safe MAPE: Avoid division by zero
    non_zero_mask = y_true > 1e-5
    if np.sum(non_zero_mask) > 0:
        mape = float(np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100.0)
    else:
        mape = 0.0
        
    return ModelMetrics(
        model_name=model_name,
        mae=round(mae, 2),
        rmse=round(rmse, 2),
        r2=round(r2, 4),
        mape=round(mape, 2)
    )

def generate_metric_explanations(rf_metrics: ModelMetrics, baseline_metrics: ModelMetrics) -> Tuple[str, str, str, str]:
    """
    Generates dynamic, human-readable explanations based on real computed metrics.
    """
    mae_exp = f"On average, the Random Forest predictions differ from actual daily sales by ₹{rf_metrics.mae:,.2f} units."
    rmse_exp = f"The RMSE is ₹{rf_metrics.rmse:,.2f} units, penalizing larger prediction errors more heavily than standard absolute errors."
    
    if rf_metrics.r2 >= 0.75:
        r2_exp = f"The model has an R² of {rf_metrics.r2:.2f}, explaining {rf_metrics.r2 * 100:.1f}% of the variance in historical sales (Strong fit)."
    elif rf_metrics.r2 >= 0.40:
        r2_exp = f"The model has an R² of {rf_metrics.r2:.2f}, explaining {rf_metrics.r2 * 100:.1f}% of sales variability (Moderate fit)."
    else:
        r2_exp = f"The model has an R² of {rf_metrics.r2:.2f}, explaining {max(0.0, rf_metrics.r2 * 100):.1f}% of sales variance (Needs additional historical data or features)."
        
    mape_exp = f"The Mean Absolute Percentage Error (MAPE) is {rf_metrics.mape:.2f}%, indicating the average relative forecast error magnitude."
    
    return mae_exp, rmse_exp, r2_exp, mape_exp
