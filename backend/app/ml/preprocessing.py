import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any
from app.models.schemas import DataQualityReport

def detect_columns(df: pd.DataFrame) -> Tuple[str, str]:
    """
    Intelligently detects Date and Sales target columns in a DataFrame.
    """
    date_col = None
    sales_col = None
    
    # 1. Detect Date Column
    date_candidates = [c for c in df.columns if any(k in c.lower() for k in ["date", "time", "dt", "day", "timestamp"])]
    if date_candidates:
        date_col = date_candidates[0]
    else:
        # Check object/string columns for datetime convertibility
        for col in df.columns:
            try:
                converted = pd.to_datetime(df[col], errors='coerce')
                if converted.notnull().sum() / len(df) > 0.7:
                    date_col = col
                    break
            except Exception:
                continue
                
    if not date_col:
        date_col = df.columns[0] # Fallback to 1st column
        
    # 2. Detect Sales Column
    sales_candidates = [c for c in df.columns if any(k in c.lower() for k in ["sales", "revenue", "demand", "amount", "quantity", "total", "target"]) and c != date_col]
    if sales_candidates:
        sales_col = sales_candidates[0]
    else:
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if date_col in numeric_cols:
            numeric_cols.remove(date_col)
        if numeric_cols:
            # Pick numeric column with highest positive sum/mean
            sales_col = max(numeric_cols, key=lambda c: df[c].abs().sum())
        else:
            # Pick non-date column
            sales_col = [c for c in df.columns if c != date_col][0]
            
    return date_col, sales_col

def clean_and_prepare_data(
    df: pd.DataFrame, 
    custom_date_col: str = None, 
    custom_sales_col: str = None
) -> Tuple[pd.DataFrame, DataQualityReport]:
    """
    Cleans raw DataFrame, aggregates daily sales, handles missing values & duplicates,
    and calculates a detailed Data Quality Report.
    """
    raw_rows = len(df)
    raw_cols = len(df.columns)
    missing_vals_total = int(df.isnull().sum().sum())
    duplicate_rows_count = int(df.duplicated().sum())
    
    # Determine date and sales columns
    auto_date_col, auto_sales_col = detect_columns(df)
    date_col = custom_date_col if custom_date_col and custom_date_col in df.columns else auto_date_col
    sales_col = custom_sales_col if custom_sales_col and custom_sales_col in df.columns else auto_sales_col
    
    clean_df = df.copy()
    
    # 1. Datetime Conversion
    clean_df['ds_parsed'] = pd.to_datetime(clean_df[date_col], errors='coerce')
    invalid_dates_count = int(clean_df['ds_parsed'].isnull().sum())
    clean_df = clean_df.dropna(subset=['ds_parsed'])
    
    # 2. Numeric Sales Parsing & Handling Invalid Values
    clean_df['y_raw'] = pd.to_numeric(clean_df[sales_col], errors='coerce')
    invalid_sales_count = int(clean_df['y_raw'].isnull().sum() + (clean_df['y_raw'] < 0).sum())
    clean_df = clean_df.dropna(subset=['y_raw'])
    clean_df['y_raw'] = clean_df['y_raw'].clip(lower=0.0) # Ensure sales non-negative
    
    # Sort chronologically
    clean_df = clean_df.sort_values('ds_parsed').reset_index(drop=True)
    
    # 3. Aggregate daily sales
    daily_df = clean_df.groupby('ds_parsed')['y_raw'].sum().reset_index()
    daily_df.columns = ['Date', 'Sales']
    
    # 4. Fill missing dates in chronological sequence
    min_date = daily_df['Date'].min()
    max_date = daily_df['Date'].max()
    full_date_range = pd.date_range(start=min_date, end=max_date, freq='D')
    
    daily_df = daily_df.set_index('Date').reindex(full_date_range).reset_index()
    daily_df.columns = ['Date', 'Sales']
    
    # Interpolate missing sales days (using linear interpolation)
    daily_df['Sales'] = daily_df['Sales'].interpolate(method='linear').bfill().ffill()
    
    # Descriptive Statistics
    sales_series = daily_df['Sales']
    min_s = float(sales_series.min())
    max_s = float(sales_series.max())
    mean_s = float(sales_series.mean())
    median_s = float(sales_series.median())
    std_s = float(sales_series.std()) if len(sales_series) > 1 else 0.0
    
    # Health Assessment logic
    details = []
    health_score = 100.0
    
    if raw_rows < 60:
        health_score -= 30
        details.append(f"Small dataset ({raw_rows} rows). Machine learning models perform best with 100+ records.")
    if duplicate_rows_count > 0:
        health_score -= min(15, duplicate_rows_count * 2)
        details.append(f"Removed {duplicate_rows_count} duplicate row(s).")
    if missing_vals_total > 0:
        health_score -= min(20, missing_vals_total)
        details.append(f"Handled {missing_vals_total} missing value(s).")
    if invalid_dates_count > 0:
        health_score -= 10
        details.append(f"Dropped {invalid_dates_count} invalid date entry(ies).")
    if invalid_sales_count > 0:
        health_score -= 10
        details.append(f"Handled {invalid_sales_count} negative or non-numeric sales record(s).")
        
    health_score = max(0.0, min(100.0, health_score))
    
    if health_score >= 85:
        health_status = 'Good'
        details.insert(0, "Dataset structure is healthy and ready for forecasting.")
    elif health_score >= 60:
        health_status = 'Needs Attention'
        details.insert(0, "Dataset cleaned successfully with minor adjustments.")
    else:
        health_status = 'Poor'
        details.insert(0, "Dataset contains substantial missing or dirty values that required imputation.")

    total_days = len(daily_df)
    
    quality_report = DataQualityReport(
        total_rows=raw_rows,
        total_columns=raw_cols,
        columns=df.columns.tolist(),
        detected_date_column=date_col,
        detected_sales_column=sales_col,
        start_date=min_date.strftime("%Y-%m-%d"),
        end_date=max_date.strftime("%Y-%m-%d"),
        total_days=total_days,
        missing_values_count=missing_vals_total,
        duplicate_count=duplicate_rows_count,
        invalid_records_handled=invalid_dates_count + invalid_sales_count,
        min_sales=round(min_s, 2),
        max_sales=round(max_s, 2),
        mean_sales=round(mean_s, 2),
        median_sales=round(median_s, 2),
        std_sales=round(std_s, 2),
        health_status=health_status,
        health_score=round(health_score, 1),
        details=details
    )
    
    return daily_df, quality_report
