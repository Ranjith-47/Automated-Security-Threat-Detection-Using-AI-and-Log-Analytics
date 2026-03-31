import pandas as pd

df = pd.read_parquet("final_threat_dataset.parquet")

print("binary_label values:")
print(df["binary_label"].unique())

print("\nattack_type values:")
print(df["attack_type"].unique())

print("\nFull distribution:")
print(df[["binary_label", "attack_type"]].value_counts().reset_index().to_string(index=False))