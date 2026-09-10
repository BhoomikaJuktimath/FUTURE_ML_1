from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DataQualityReport(BaseModel):
    total_rows: int
    total_columns: int
    columns: List[str]
    detected_date_column: str
    detected_sales_column: str
    start_date: str
    end_date: str
    total_days: int
    missing_values_count: int
    duplicate_count: int
    invalid_records_handled: int
    min_sales: float
    max_sales: float
    mean_sales: float
    median_sales: float
    std_sales: float
    health_status: str # 'Good', 'Needs Attention', 'Poor'
    health_score: float # 0 to 100
    details: List[str]

class DataSummaryResponse(BaseModel):
    quality_report: DataQualityReport
    preview_data: List[Dict[str, Any]]
    is_sample: bool
    filename: str

class ModelMetrics(BaseModel):
    model_name: str
    mae: float
    rmse: float
    r2: float
    mape: float # In percentage (e.g., 12.45%)

class FeatureImportance(BaseModel):
    feature: str
    importance: float

class PerformanceResponse(BaseModel):
    baseline_metrics: ModelMetrics
    rf_metrics: ModelMetrics
    better_model: str
    improvement_percentage: float
    feature_importances: List[FeatureImportance]
    actual_vs_predicted: List[Dict[str, Any]] # [{"date": "2023-01-01", "actual": 120.5, "predicted_baseline": 115.0, "predicted_rf": 122.1, "error_rf": -1.6}]
    mae_explanation: str
    rmse_explanation: str
    r2_explanation: str
    mape_explanation: str

class ForecastSummary(BaseModel):
    horizon_days: int
    total_forecasted_sales: float
    avg_daily_sales: float
    max_sales_day: Dict[str, Any] # {"date": "2024-01-15", "sales": 450.2}
    min_sales_day: Dict[str, Any] # {"date": "2024-01-02", "sales": 120.0}

class ForecastResponse(BaseModel):
    horizon_days: int
    summary: ForecastSummary
    forecast_records: List[Dict[str, Any]] # [{"date": "2024-01-01", "predicted_sales": 320.5, "lower_bound": 290.0, "upper_bound": 351.0}]
    timeline_chart: List[Dict[str, Any]] # Combined past actuals + test predictions + future forecast

class DomainInsight(BaseModel):
    category: str # 'Inventory', 'Cash Flow', 'Staffing', 'Overstock Risk', 'Stockout Risk', 'Strategic Recommendations'
    title: str
    description: str
    impact_level: str # 'High', 'Medium', 'Low'
    actionable_advice: str

class BusinessInsightsResponse(BaseModel):
    overall_trend: str # 'Upward', 'Downward', 'Stable', 'Volatile'
    trend_slope_pct: float
    volatility_cv: float
    insights: List[DomainInsight]

class ColumnMappingRequest(BaseModel):
    date_column: Optional[str] = None
    sales_column: Optional[str] = None
