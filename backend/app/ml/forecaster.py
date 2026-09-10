import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.ensemble import RandomForestRegressor
from typing import Dict, Any, List, Tuple
from app.ml.feature_engineering import FEATURE_COLUMNS, create_time_features
from app.models.schemas import ForecastSummary, ForecastResponse

def generate_future_forecast(
    daily_df: pd.DataFrame,
    rf_model: RandomForestRegressor,
    horizon_days: int = 30,
    residual_std: float = 15.0
) -> ForecastResponse:
    """
    Performs recursive multi-step autoregressive forecasting for future dates without data leakage.
    Uses previous predictions as pseudo-historical data for future lag/rolling feature calculations.
    """
    history_df = daily_df.copy()
    if not pd.api.types.is_datetime64_any_dtype(history_df['Date']):
        history_df['Date'] = pd.to_datetime(history_df['Date'])
        
    history_df = history_df.sort_values('Date').reset_index(drop=True)
    
    last_date = history_df['Date'].max()
    
    # Store extended sequence: Date -> Sales
    sales_sequence = history_df['Sales'].tolist()
    date_sequence = history_df['Date'].tolist()
    
    future_records = []
    
    for step in range(1, horizon_days + 1):
        future_date = last_date + timedelta(days=step)
        
        # Build single-row feature dict
        feat_dict = {}
        
        # 1. Calendar Time Features
        dt = future_date
        feat_dict['year'] = dt.year
        feat_dict['month'] = dt.month
        feat_dict['day'] = dt.day
        feat_dict['day_of_week'] = dt.dayofweek
        feat_dict['week_of_year'] = int(dt.isocalendar().week)
        feat_dict['quarter'] = dt.quarter
        feat_dict['is_weekend'] = 1 if dt.dayofweek >= 5 else 0
        feat_dict['sin_month'] = np.sin(2 * np.pi * dt.month / 12.0)
        feat_dict['cos_month'] = np.cos(2 * np.pi * dt.month / 12.0)
        feat_dict['sin_dow'] = np.sin(2 * np.pi * dt.dayofweek / 7.0)
        feat_dict['cos_dow'] = np.cos(2 * np.pi * dt.dayofweek / 7.0)
        
        # 2. Lag Features (from sales_sequence)
        N = len(sales_sequence)
        for lag in [1, 7, 14, 30]:
            idx = N - lag
            if idx >= 0:
                feat_dict[f'lag_{lag}'] = sales_sequence[idx]
            else:
                feat_dict[f'lag_{lag}'] = sales_sequence[0] # Fallback
                
        # 3. Rolling Features (from sales_sequence)
        for window in [7, 14, 30]:
            sub_seq = sales_sequence[-window:] if N >= window else sales_sequence
            feat_dict[f'rolling_mean_{window}'] = float(np.mean(sub_seq))
            
        for window in [7, 30]:
            sub_seq = sales_sequence[-window:] if N >= window else sales_sequence
            feat_dict[f'rolling_std_{window}'] = float(np.std(sub_seq)) if len(sub_seq) > 1 else 0.0
            
        # Form feature vector in exact column order
        X_future = pd.DataFrame([feat_dict])[FEATURE_COLUMNS]
        
        pred_val = float(rf_model.predict(X_future)[0])
        pred_val = max(0.0, pred_val) # Sales non-negative
        
        # Prediction interval (upper / lower bounds based on residual uncertainty)
        margin = 1.96 * max(10.0, residual_std)
        lower_bound = max(0.0, pred_val - margin)
        upper_bound = pred_val + margin
        
        # Append to state for next recursive step
        sales_sequence.append(pred_val)
        date_sequence.append(future_date)
        
        future_records.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "predicted_sales": round(pred_val, 2),
            "lower_bound": round(lower_bound, 2),
            "upper_bound": round(upper_bound, 2)
        })
        
    # Calculate Forecast Summary
    total_predicted = float(sum(r['predicted_sales'] for r in future_records))
    avg_daily = float(total_predicted / horizon_days)
    
    max_rec = max(future_records, key=lambda x: x['predicted_sales'])
    min_rec = min(future_records, key=lambda x: x['predicted_sales'])
    
    summary = ForecastSummary(
        horizon_days=horizon_days,
        total_forecasted_sales=round(total_predicted, 2),
        avg_daily_sales=round(avg_daily, 2),
        max_sales_day={"date": max_rec['date'], "sales": max_rec['predicted_sales']},
        min_sales_day={"date": min_rec['date'], "sales": min_rec['predicted_sales']}
    )
    
    # Timeline Chart (Last 90 historical days + Future Forecast)
    recent_history = history_df.tail(90)
    timeline_chart = []
    
    for _, row in recent_history.iterrows():
        timeline_chart.append({
            "date": row['Date'].strftime("%Y-%m-%d"),
            "actual": round(float(row['Sales']), 2),
            "type": "Historical"
        })
        
    for r in future_records:
        timeline_chart.append({
            "date": r['date'],
            "forecast": r['predicted_sales'],
            "lower_bound": r['lower_bound'],
            "upper_bound": r['upper_bound'],
            "type": "Forecast"
        })
        
    return ForecastResponse(
        horizon_days=horizon_days,
        summary=summary,
        forecast_records=future_records,
        timeline_chart=timeline_chart
    )
