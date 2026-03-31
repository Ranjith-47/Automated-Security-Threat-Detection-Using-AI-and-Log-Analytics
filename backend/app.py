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

app = FastAPI(title="Security Threat Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
COLUMNS_TO_DROP = ['Label', 'Attack Type', 'Timestamp', 'Flow ID', 'Src IP', 'Dst IP', 'Src Port', 'Dst Port', 'Protocol']

@app.post("/predict/batch")
async def predict_batch(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
        
    try:
        # Read the uploaded CSV
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        original_df = df.copy()
        
        # 1. Preprocessing
        # We don't need to manually drop columns. 
        # Instead, we select exactly the columns expected by the model scaler.
        
        # Ensure we have binary scaler loaded
        if binary_scaler is None:
            raise HTTPException(status_code=500, detail="Models not loaded properly.")
            
        required_binary_features = list(binary_scaler.feature_names_in_)
        
        # Add missing columns with 0
        for col in required_binary_features:
            if col not in df.columns:
                df[col] = 0
                
        # Fill missing values with 0
        df = df.fillna(0)
                
        # Get perfectly matched DataFrame
        X_binary_df = df[required_binary_features]
        
        # Ensure we have binary scaler loaded
        if binary_scaler is None:
            raise HTTPException(status_code=500, detail="Models not loaded properly.")
            
        # 2. Binary Prediction (Threat vs Normal)
        # Apply the binary scaler
        X_binary = binary_scaler.transform(X_binary_df)
        
        # Get predictions (0 or 1)
        binary_preds = binary_model.predict(X_binary)
        
        # Map back to categories using binary_le if available
        mapped_binary_preds = binary_le.inverse_transform(binary_preds)
        
        # Add the binary prediction to the original dataset mapping
        original_df['Prediction'] = mapped_binary_preds
        original_df['Attack_Type'] = 'Normal' # Default to Normal
        
        # 3. Multiclass Prediction (Only for attacks)
        # Check using decoded string mappings to safely identify malicious traffic
        attack_mask = (pd.Series(mapped_binary_preds).str.lower() != 'normal').values
        
        if attack_mask.any():
            # Extract just the attack rows
            df_attacks = df.loc[attack_mask].copy()
            
            # Ensure multi-class features match exactly
            required_multi_features = list(multi_scaler.feature_names_in_)
            for col in required_multi_features:
                if col not in df_attacks.columns:
                    df_attacks[col] = 0
                    
            X_multi_df = df_attacks[required_multi_features]
            
            # Apply multiclass scaler
            X_multi = multi_scaler.transform(X_multi_df)
            
            # Predict attack types
            multi_preds = multi_model.predict(X_multi)
            
            # Inverse transform attack types using multiclass label encoder
            mapped_multi_preds = multi_le.inverse_transform(multi_preds)
            
            # Map back to the original df
            original_df.loc[attack_mask, 'Attack_Type'] = mapped_multi_preds
            
        return JSONResponse(
            content={
                "message": f"Processed {len(original_df)} rows successfully.",
                "predictions": original_df.to_dict(orient="records")
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
