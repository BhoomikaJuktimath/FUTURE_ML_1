import joblib
import os
import json
from typing import Tuple, Dict, Any, Optional
from sklearn.ensemble import RandomForestRegressor

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "saved_models")
MODEL_PATH = os.path.join(MODEL_DIR, "forecast_model.joblib")
META_PATH = os.path.join(MODEL_DIR, "metadata.json")

def save_trained_model(model: RandomForestRegressor, metadata: Dict[str, Any]) -> str:
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    with open(META_PATH, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Model successfully saved to {MODEL_PATH}")
    return MODEL_PATH

def load_trained_model() -> Tuple[Optional[RandomForestRegressor], Optional[Dict[str, Any]]]:
    if not os.path.exists(MODEL_PATH) or not os.path.exists(META_PATH):
        return None, None
    try:
        model = joblib.load(MODEL_PATH)
        with open(META_PATH, "r") as f:
            meta = json.load(f)
        return model, meta
    except Exception as e:
        print(f"Error loading saved model: {e}")
        return None, None
