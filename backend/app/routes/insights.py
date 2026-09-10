from fastapi import APIRouter, HTTPException, Query
from app.ml.preprocessing import clean_and_prepare_data
from app.services.insights_service import generate_business_insights
from app.routes.forecast import create_forecast
from app.routes.data import get_or_create_active_df
from app.models.schemas import BusinessInsightsResponse

router = APIRouter(prefix="/api/business-insights", tags=["Business Insights"])

@router.get("", response_model=BusinessInsightsResponse)
@router.get("/", response_model=BusinessInsightsResponse)
def get_insights(horizon: int = Query(30)):
    try:
        raw_df, _, _ = get_or_create_active_df()
        daily_df, _ = clean_and_prepare_data(raw_df)
        
        forecast_response = create_forecast(horizon=horizon)
        forecast_dict = forecast_response.model_dump()
        
        return generate_business_insights(daily_df, forecast_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate business insights: {str(e)}")
