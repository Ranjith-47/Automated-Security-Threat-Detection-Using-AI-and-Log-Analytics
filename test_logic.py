import os
import pandas as pd
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

binary_scaler = joblib.load(os.path.join(MODEL_DIR, "binary", "scaler.pkl"))
binary_model = joblib.load(os.path.join(MODEL_DIR, "binary", "xgb_binary_model.pkl"))

parquet_path = os.path.join(BASE_DIR, "dataset", "final_threat_dataset.parquet")
df = pd.read_parquet(parquet_path).head(100)

CONSTANT_COLS = [
    'Bwd PSH Flags', 'Fwd URG Flags', 'Bwd URG Flags',
    'CWE Flag Count', 'Fwd Avg Bytes/Bulk', 'Fwd Avg Packets/Bulk',
    'Fwd Avg Bulk Rate', 'Bwd Avg Bytes/Bulk',
    'Bwd Avg Packets/Bulk', 'Bwd Avg Bulk Rate'
]

COLUMNS_TO_DROP = ['Label', 'Attack Type', 'Timestamp', 'Flow ID', 'Src IP', 'Dst IP', 'Src Port', 'Dst Port', 'Protocol']

for col in COLUMNS_TO_DROP:
    if col in df.columns:
        df = df.drop(columns=[col])
        
for col in CONSTANT_COLS:
    if col in df.columns:
        df = df.drop(columns=[col])

df = df.fillna(0)
df = df.select_dtypes(include=['number'])

print("Columns before transform:", df.columns.tolist())
try:
    X_binary = binary_scaler.transform(df)
    print("Transform successful!")
except Exception as e:
    print("Error during transform:", repr(e))
