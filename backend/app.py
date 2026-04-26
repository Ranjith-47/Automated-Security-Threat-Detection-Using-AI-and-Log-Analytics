import os
import io
import pandas as pd
import numpy as np
import joblib
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import warnings
warnings.filterwarnings('ignore') # Suppress sklearn version warnings if any

# Import authentication module
from auth import router as auth_router, init_db

app = FastAPI(title="Security Threat Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount authentication routes
app.include_router(auth_router)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "model")

# Global variables for models
binary_scaler = None
binary_le = None
binary_model = None

multi_scaler = None
multi_le = None
multi_model = None

@app.on_event("startup")
async def load_models():
    global binary_scaler, binary_le, binary_model
    global multi_scaler, multi_le, multi_model

    # Initialize authentication database
    init_db()

    try:
        print("Loading models...")
        # Load binary artifacts
        binary_scaler = joblib.load(os.path.join(MODEL_DIR, "binary", "scaler.pkl"))
        binary_le = joblib.load(os.path.join(MODEL_DIR, "binary", "label_encoder.pkl"))
        binary_model = joblib.load(os.path.join(MODEL_DIR, "binary", "xgb_binary_model.pkl"))
        
        # Load multiclass artifacts
        multi_scaler = joblib.load(os.path.join(MODEL_DIR, "multi_class", "scaler_multiclass.pkl"))
        multi_le = joblib.load(os.path.join(MODEL_DIR, "multi_class", "label_encoder_multiclass.pkl"))
        multi_model = joblib.load(os.path.join(MODEL_DIR, "multi_class", "xgb_multiclass_model.pkl"))
        print("Successfully loaded all models.")
    except Exception as e:
        print(f"Error loading models: {e}")

CONSTANT_COLS = [
    'Bwd PSH Flags', 'Fwd URG Flags', 'Bwd URG Flags',
    'CWE Flag Count', 'Fwd Avg Bytes/Bulk', 'Fwd Avg Packets/Bulk',
    'Fwd Avg Bulk Rate', 'Bwd Avg Bytes/Bulk',
    'Bwd Avg Packets/Bulk', 'Bwd Avg Bulk Rate'
]

# Columns to blindly drop if they exist
COLUMNS_TO_DROP = ['Label', 'Attack Type', 'attack_type', 'binary_label', 'Timestamp', 'Flow ID', 'Src IP', 'Dst IP', 'Src Port', 'Dst Port'] + CONSTANT_COLS

def perform_prediction(df: pd.DataFrame) -> dict:
    """Helper to run the two-stage XGBoost prediction on a DataFrame."""
    if binary_model is None or multi_model is None:
        raise ValueError("Models not loaded properly.")

    original_df = df.copy()
    
    # Drop columns that shouldn't be used for prediction
    df = df.drop(columns=[col for col in COLUMNS_TO_DROP if col in df.columns])
    
    required_binary_features = list(binary_scaler.feature_names_in_)
    
    # Preprocessing: Ensure all required features exist and are filled
    for col in required_binary_features:
        if col not in df.columns:
            df[col] = 0
    df = df.fillna(0)
    
    X_binary_df = df[required_binary_features]
    X_binary = binary_scaler.transform(X_binary_df)
    
    # 1. Binary Prediction
    binary_preds = binary_model.predict(X_binary)
    mapped_binary_preds = binary_le.inverse_transform(binary_preds)
    
    original_df['Prediction'] = mapped_binary_preds
    original_df['Attack_Type'] = 'Normal'
    
    # 2. Multiclass Prediction (for threats)
    attack_mask = (pd.Series(mapped_binary_preds).str.lower() != 'normal').values
    if attack_mask.any():
        df_attacks = df.loc[attack_mask].copy()
        required_multi_features = list(multi_scaler.feature_names_in_)
        for col in required_multi_features:
            if col not in df_attacks.columns:
                df_attacks[col] = 0
        X_multi_df = df_attacks[required_multi_features]
        X_multi = multi_scaler.transform(X_multi_df)
        
        multi_preds = multi_model.predict(X_multi)
        mapped_multi_preds = multi_le.inverse_transform(multi_preds)
        original_df.loc[attack_mask, 'Attack_Type'] = mapped_multi_preds
        
    # Get probabilities for confidence score
    probs = binary_model.predict_proba(X_binary)
    original_df['Confidence'] = np.max(probs, axis=1)

    return original_df.to_dict(orient="records")

@app.post("/predict/batch")
async def predict_batch(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
        
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        predictions = perform_prediction(df)
        
        return JSONResponse(
            content={
                "message": f"Processed {len(predictions)} rows successfully.",
                "predictions": predictions
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing batch: {str(e)}")

@app.post("/predict/single")
async def predict_single(features: dict):
    """
    Expects a JSON object of feature keys and values.
    Example: {"Flow Duration": 123, "Total Fwd Packets": 2, ...}
    """
    try:
        # Convert single dict to DataFrame
        df = pd.DataFrame([features])
        predictions = perform_prediction(df)
        
        return JSONResponse(content=predictions[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing single prediction: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
