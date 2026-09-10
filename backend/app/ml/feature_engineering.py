import pandas as pd
import numpy as np
from typing import List, Tuple

FEATURE_COLUMNS = [
    'year', 'month', 'day', 'day_of_week', 'week_of_year', 'quarter', 'is_weekend',
    'sin_month', 'cos_month', 'sin_dow', 'cos_dow',
    'lag_1', 'lag_7', 'lag_14', 'lag_30',
    'rolling_mean_7', 'rolling_mean_14', 'rolling_mean_30',
    'rolling_std_7', 'rolling_std_30'
]

def create_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Creates calendar and seasonal time features from the Date column.
    """
    df = df.copy()
    if not pd.api.types.is_datetime64_any_dtype(df['Date']):
        df['Date'] = pd.to_datetime(df['Date'])
        
    df['year'] = df['Date'].dt.year
    df['month'] = df['Date'].dt.month
    df['day'] = df['Date'].dt.day
    df['day_of_week'] = df['Date'].dt.dayofweek
    df['week_of_year'] = df['Date'].dt.isocalendar().week.astype(int)
    df['quarter'] = df['Date'].dt.quarter
    df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
    
    # Cyclical encodings for Month and Day of Week
    df['sin_month'] = np.sin(2 * np.pi * df['month'] / 12.0)
    df['cos_month'] = np.cos(2 * np.pi * df['month'] / 12.0)
    df['sin_dow'] = np.sin(2 * np.pi * df['day_of_week'] / 7.0)
    df['cos_dow'] = np.cos(2 * np.pi * df['day_of_week'] / 7.0)
    
    return df

def create_lag_and_rolling_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Creates historical lag and rolling statistics features.
    STRICTLY AVOIDS DATA LEAKAGE by using shift(1) before computing rolling statistics.
    """
    df = df.copy()
    
    # Lags
    for lag in [1, 7, 14, 30]:
        df[f'lag_{lag}'] = df['Sales'].shift(lag)
        
    # Rolling stats on shift(1) to avoid including target value in historical window
    shifted_sales = df['Sales'].shift(1)
    
    for window in [7, 14, 30]:
        df[f'rolling_mean_{window}'] = shifted_sales.rolling(window=window, min_periods=1).mean()
        
    for window in [7, 30]:
        df[f'rolling_std_{window}'] = shifted_sales.rolling(window=window, min_periods=1).std().fillna(0.0)
        
    return df

def generate_feature_dataset(daily_df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
    """
    Combines time features, lags, and rolling features, drops initial NaN rows caused by lags.
    Returns feature DataFrame and list of feature column names.
    """
    df = create_time_features(daily_df)
    df = create_lag_and_rolling_features(df)
    
    # Fill remaining NAs for initial rows using backfill/forwardfill
    for col in FEATURE_COLUMNS:
        if col in df.columns:
            df[col] = df[col].bfill().ffill().fillna(0.0)
            
    return df, FEATURE_COLUMNS
