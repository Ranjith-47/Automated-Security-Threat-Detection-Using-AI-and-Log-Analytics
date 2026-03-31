import pandas as pd
import requests
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
parquet_path = os.path.join(BASE_DIR, "dataset", "final_threat_dataset.parquet")

if not os.path.exists(parquet_path):
    print(f"Error: Could not find {parquet_path}")
    sys.exit(1)

print(f"Loading data from {parquet_path}...")
df = pd.read_parquet(parquet_path)
df_slice = df.head(100)

temp_csv = "test_batch.csv"
df_slice.to_csv(temp_csv, index=False)
print(f"Saved test batch of {len(df_slice)} rows to {temp_csv}")

url = "http://localhost:8000/predict/batch"

print(f"Sending request to {url}...")
try:
    with open(temp_csv, 'rb') as f:
        files = {'file': (temp_csv, f, 'text/csv')}
        response = requests.post(url, files=files)

    if response.status_code == 200:
        print("Success! Response summary:")
        data = response.json()
        print(f"Message: {data.get('message', 'No message')}")
        
        preds = data.get('predictions', [])
        for i, row in enumerate(preds[:5]):
            print(f"Row {i+1} -> Prediction text: {row.get('Prediction')}, Attack Type: {row.get('Attack_Type')}")
            
    else:
        print(f"Error: Status code {response.status_code}")
        print(response.text)
except requests.exceptions.ConnectionError:
    print("Failed to connect. Is the FastAPI server running?")
finally:
    if os.path.exists(temp_csv):
        os.remove(temp_csv)
        print("Cleaned up temporary CSV file.")
