import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.models.schemas import DomainInsight, BusinessInsightsResponse

def generate_business_insights(
    daily_df: pd.DataFrame,
    forecast_data: Dict[str, Any]
) -> BusinessInsightsResponse:
    """
    Translates raw machine learning forecasts and historical performance into actionable business intelligence.
    Dynamically computes trend slopes, volatility, overstock/stockout risks, and financial projections.
    """
    recent_hist_sales = daily_df['Sales'].tail(30).values
    hist_avg = float(np.mean(recent_hist_sales))
    
    summary = forecast_data.get('summary', {})
    forecast_avg = summary.get('avg_daily_sales', hist_avg)
    total_forecast = summary.get('total_forecasted_sales', 0.0)
    horizon_days = summary.get('horizon_days', 30)
    
    forecast_records = forecast_data.get('forecast_records', [])
    preds = [r['predicted_sales'] for r in forecast_records]
    
    if len(preds) > 0:
        pred_std = float(np.std(preds))
        pred_mean = float(np.mean(preds))
        volatility_cv = pred_std / max(1e-5, pred_mean)
    else:
        volatility_cv = 0.1
        
    # Trend slope %
    if hist_avg > 1e-5:
        trend_slope_pct = ((forecast_avg - hist_avg) / hist_avg) * 100.0
    else:
        trend_slope_pct = 0.0
        
    if trend_slope_pct > 5.0:
        overall_trend = "Upward"
    elif trend_slope_pct < -5.0:
        overall_trend = "Downward"
    elif volatility_cv > 0.25:
        overall_trend = "Volatile"
    else:
        overall_trend = "Stable"
        
    insights: List[DomainInsight] = []
    
    # 1. Inventory Planning
    if overall_trend == "Upward":
        inv_desc = f"Projected demand is expected to increase by {abs(trend_slope_pct):.1f}% over the next {horizon_days} days. Daily average sales will rise from ₹{hist_avg:,.2f} to ₹{forecast_avg:,.2f}."
        inv_advice = f"Increase inventory replenishment orders by {abs(trend_slope_pct):.1f}% prior to peak demand days to maintain high fulfillment rates."
        inv_impact = "High"
    elif overall_trend == "Downward":
        inv_desc = f"Demand is forecasted to decrease by {abs(trend_slope_pct):.1f}% compared to recent historical averages."
        inv_advice = "Scale down purchase orders and hold tighter reorder points to prevent excess warehouse holding costs."
        inv_impact = "Medium"
    else:
        inv_desc = f"Demand is steady with an average projected sales rate of ₹{forecast_avg:,.2f} per day over {horizon_days} days."
        inv_advice = "Maintain standard automated replenishment cycles with periodic buffer checks."
        inv_impact = "Low"
        
    insights.append(DomainInsight(
        category="Inventory",
        title="Inventory Replenishment Strategy",
        description=inv_desc,
        impact_level=inv_impact,
        actionable_advice=inv_advice
    ))
    
    # 2. Cash Flow & Revenue Projections
    max_day = summary.get('max_sales_day', {})
    cash_desc = f"Total projected gross revenue over {horizon_days} days is ₹{total_forecast:,.2f}. Peak sales revenue is expected on {max_day.get('date', 'N/A')} reaching ₹{max_day.get('sales', 0.0):,.2f}."
    cash_advice = "Align accounts payable and supplier payment schedules with expected revenue spikes on peak sales dates."
    insights.append(DomainInsight(
        category="Cash Flow",
        title="Revenue & Cash Flow Projections",
        description=cash_desc,
        impact_level="High",
        actionable_advice=cash_advice
    ))
    
    # 3. Staffing & Operations
    if volatility_cv > 0.20 or overall_trend == "Upward":
        staff_desc = f"Sales demand exhibits substantial fluctuations (Volatility CV = {volatility_cv:.2f}). Peak demand reaches ₹{max_day.get('sales', 0.0):,.2f}."
        staff_advice = f"Schedule extra shift staffing and warehouse fulfillment labor on high-volume days around {max_day.get('date', 'peak dates')}."
        staff_impact = "High"
    else:
        staff_desc = f"Sales volume is expected to remain consistent (Daily average: ₹{forecast_avg:,.2f})."
        staff_advice = "Baseline labor scheduling is sufficient. No emergency overtime or temporary staffing required."
        staff_impact = "Low"
        
    insights.append(DomainInsight(
        category="Staffing",
        title="Workforce & Logistics Staffing",
        description=staff_desc,
        impact_level=staff_impact,
        actionable_advice=staff_advice
    ))
    
    # 4. Overstock Risk Management
    min_day = summary.get('min_sales_day', {})
    if overall_trend == "Downward" or volatility_cv > 0.30:
        overstock_desc = f"Lowest sales demand day projected on {min_day.get('date', 'N/A')} at ₹{min_day.get('sales', 0.0):,.2f}. Overstocking risk is elevated during low-demand periods."
        overstock_advice = "Run targeted promotional discounts or bundled offers during identified low-demand dates to accelerate turnover."
        overstock_impact = "High"
    else:
        overstock_desc = f"Overstock risk is low. Forecasted daily demand consistently clears baseline stock thresholds."
        overstock_advice = "Continue standard stock audits and avoid speculative bulk buying."
        overstock_impact = "Low"
        
    insights.append(DomainInsight(
        category="Overstock Risk",
        title="Excess Stock & Holding Cost Reduction",
        description=overstock_desc,
        impact_level=overstock_impact,
        actionable_advice=overstock_advice
    ))
    
    # 5. Stockout Prevention
    if overall_trend == "Upward" or volatility_cv > 0.20:
        stockout_desc = f"High risk of stockout during peak demand days (up to ₹{max_day.get('sales', 0.0):,.2f}/day) if buffer safety stock is insufficient."
        stockout_advice = f"Increase safety stock buffer by approximately {max(15, int(volatility_cv * 100))}% for core inventory SKUs."
        stockout_impact = "High"
    else:
        stockout_desc = "Stockout risk is minimal under normal lead times."
        stockout_advice = "Monitor lead times from primary vendors to ensure supplier SLA adherence."
        stockout_impact = "Low"
        
    insights.append(DomainInsight(
        category="Stockout Risk",
        title="Stockout Prevention & SLA Maintenance",
        description=stockout_desc,
        impact_level=stockout_impact,
        actionable_advice=stockout_advice
    ))
    
    return BusinessInsightsResponse(
        overall_trend=overall_trend,
        trend_slope_pct=round(float(trend_slope_pct), 2),
        volatility_cv=round(float(volatility_cv), 3),
        insights=insights
    )
