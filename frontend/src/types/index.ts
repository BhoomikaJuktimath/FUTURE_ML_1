export interface DataQualityReport {
  total_rows: number;
  total_columns: number;
  columns: string[];
  detected_date_column: string;
  detected_sales_column: string;
  start_date: string;
  end_date: string;
  total_days: number;
  missing_values_count: number;
  duplicate_count: number;
  invalid_records_handled: number;
  min_sales: number;
  max_sales: number;
  mean_sales: number;
  median_sales: number;
  std_sales: number;
  health_status: 'Good' | 'Needs Attention' | 'Poor';
  health_score: number;
  details: string[];
}

export interface DataSummaryResponse {
  quality_report: DataQualityReport;
  preview_data: Record<string, any>[];
  is_sample: boolean;
  filename: string;
}

export interface ModelMetrics {
  model_name: string;
  mae: number;
  rmse: number;
  r2: number;
  mape: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ActualVsPredictedPoint {
  date: string;
  actual: number;
  predicted_baseline: number;
  predicted_rf: number;
  error_rf: number;
  abs_error_rf: number;
}

export interface PerformanceResponse {
  baseline_metrics: ModelMetrics;
  rf_metrics: ModelMetrics;
  better_model: string;
  improvement_percentage: number;
  feature_importances: FeatureImportance[];
  actual_vs_predicted: ActualVsPredictedPoint[];
  mae_explanation: string;
  rmse_explanation: string;
  r2_explanation: string;
  mape_explanation: string;
}

export interface ForecastSummary {
  horizon_days: number;
  total_forecasted_sales: number;
  avg_daily_sales: number;
  max_sales_day: { date: string; sales: number };
  min_sales_day: { date: string; sales: number };
}

export interface ForecastRecord {
  date: string;
  predicted_sales: number;
  lower_bound: number;
  upper_bound: number;
}

export interface TimelineChartPoint {
  date: string;
  actual?: number;
  forecast?: number;
  lower_bound?: number;
  upper_bound?: number;
  type: 'Historical' | 'Forecast';
}

export interface ForecastResponse {
  horizon_days: number;
  summary: ForecastSummary;
  forecast_records: ForecastRecord[];
  timeline_chart: TimelineChartPoint[];
}

export interface DomainInsight {
  category: 'Inventory' | 'Cash Flow' | 'Staffing' | 'Overstock Risk' | 'Stockout Risk' | 'Strategic Recommendations';
  title: string;
  description: string;
  impact_level: 'High' | 'Medium' | 'Low';
  actionable_advice: string;
}

export interface BusinessInsightsResponse {
  overall_trend: 'Upward' | 'Downward' | 'Stable' | 'Volatile';
  trend_slope_pct: number;
  volatility_cv: number;
  insights: DomainInsight[];
}
