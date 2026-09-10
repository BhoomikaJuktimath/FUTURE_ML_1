import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "app_name" in data

def test_data_summary_endpoint():
    response = client.get("/api/data/summary")
    assert response.status_code == 200
    data = response.json()
    assert "quality_report" in data
    assert "preview_data" in data

def test_model_performance_endpoint():
    response = client.get("/api/model/performance")
    assert response.status_code == 200
    data = response.json()
    assert "baseline_metrics" in data
    assert "rf_metrics" in data
    assert "better_model" in data

def test_forecast_endpoint():
    response = client.post("/api/forecast", json={"horizon": 14})
    assert response.status_code == 200
    data = response.json()
    assert data["horizon_days"] == 14
    assert len(data["forecast_records"]) == 14

def test_business_insights_endpoint():
    response = client.get("/api/business-insights?horizon=30")
    assert response.status_code == 200
    data = response.json()
    assert "overall_trend" in data
    assert "insights" in data
    assert len(data["insights"]) > 0
