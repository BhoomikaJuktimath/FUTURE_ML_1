from fastapi import APIRouter, UploadFile, File, HTTPException, Body
import pandas as pd
import os
import io
from typing import Optional, Tuple
from app.ml.preprocessing import clean_and_prepare_data, detect_columns
from app.models.schemas import DataSummaryResponse, ColumnMappingRequest
from app.utils.data_generator import generate_sample_sales_csv

router = APIRouter(prefix="/api/data", tags=["Data"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
ACTIVE_CSV_PATH = os.path.join(DATA_DIR, "active_dataset.csv")
SAMPLE_CSV_PATH = os.path.join(DATA_DIR, "sample_sales.csv")

def get_or_create_active_df() -> Tuple[pd.DataFrame, bool, str]:
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(ACTIVE_CSV_PATH):
        df = pd.read_csv(ACTIVE_CSV_PATH)
        return df, False, os.path.basename(ACTIVE_CSV_PATH)
    else:
        if not os.path.exists(SAMPLE_CSV_PATH):
            generate_sample_sales_csv(SAMPLE_CSV_PATH)
        df = pd.read_csv(SAMPLE_CSV_PATH)
        df.to_csv(ACTIVE_CSV_PATH, index=False)
        return df, True, "sample_sales.csv"

@router.get("/summary", response_model=DataSummaryResponse)
def get_data_summary(date_col: Optional[str] = None, sales_col: Optional[str] = None):
    try:
        raw_df, is_sample, filename = get_or_create_active_df()
        daily_df, quality_report = clean_and_prepare_data(raw_df, custom_date_col=date_col, custom_sales_col=sales_col)
        
        # Preview top 10 raw rows formatted cleanly
        preview = raw_df.head(10).fillna("").to_dict(orient="records")
        
        return DataSummaryResponse(
            quality_report=quality_report,
            preview_data=preview,
            is_sample=is_sample,
            filename=filename
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error analyzing dataset: {str(e)}")

@router.post("/upload", response_model=DataSummaryResponse)
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a valid CSV file.")
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        if len(df) < 10:
            raise HTTPException(status_code=400, detail="Dataset must contain at least 10 historical rows.")
            
        os.makedirs(DATA_DIR, exist_ok=True)
        df.to_csv(ACTIVE_CSV_PATH, index=False)
        
        daily_df, quality_report = clean_and_prepare_data(df)
        preview = df.head(10).fillna("").to_dict(orient="records")
        
        return DataSummaryResponse(
            quality_report=quality_report,
            preview_data=preview,
            is_sample=False,
            filename=file.filename
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading uploaded CSV file: {str(e)}")

@router.post("/load-demo", response_model=DataSummaryResponse)
def load_demo_data():
    try:
        if not os.path.exists(SAMPLE_CSV_PATH):
            generate_sample_sales_csv(SAMPLE_CSV_PATH)
        df = pd.read_csv(SAMPLE_CSV_PATH)
        os.makedirs(DATA_DIR, exist_ok=True)
        df.to_csv(ACTIVE_CSV_PATH, index=False)
        
        daily_df, quality_report = clean_and_prepare_data(df)
        preview = df.head(10).fillna("").to_dict(orient="records")
        
        return DataSummaryResponse(
            quality_report=quality_report,
            preview_data=preview,
            is_sample=True,
            filename="sample_sales.csv"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error resetting to demo dataset: {str(e)}")
