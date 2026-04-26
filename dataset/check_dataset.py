import pandas as pd
import numpy as np

print("=== DATA VALIDATION STARTED ===")

df = pd.read_parquet("final_threat_dataset.parquet")  # faster than CSV
print("\nShape:", df.shape)

duplicate_count = df.duplicated().sum()
print(f"\nDuplicate rows: {duplicate_count}")
if duplicate_count > 0:
    print("  WARNING: Duplicates detected — consider dropping with df.drop_duplicates()")
else:
    print("  OK: No duplicate rows")

print("\nClass distribution (binary_label):")
print(df["binary_label"].value_counts())

print("\nClass distribution (attack_type):")
print(df["attack_type"].value_counts())

print("\nUnique binary_label values:", df["binary_label"].unique())
print("Unique attack_type values:", df["attack_type"].unique())

missing = df.isnull().sum().sum()
print(f"\nTotal missing values: {missing}")
if missing > 0:
    print("  WARNING: Missing data present")
    print(df.isnull().sum()[df.isnull().sum() > 0])
else:
    print("  OK: No missing values")

numeric_cols = df.select_dtypes(include=[np.number]).columns
inf_count = np.isinf(df[numeric_cols]).sum().sum()
print(f"\nTotal inf values: {inf_count}")
if inf_count > 0:
    print("  WARNING: Inf values present — replace with np.nan then dropna")
else:
    print("  OK: No inf values")

print("\nChecking for possible leakage columns...")
suspicious_keywords = ['label', 'attack', 'class', 'type', 'id', 'timestamp']
suspicious_cols = [
    col for col in df.columns
    if any(k in col.lower() for k in suspicious_keywords)
]
if suspicious_cols:
    print("  Possible leakage-related columns (review before training):")
    for col in suspicious_cols:
        print(f"    - {col}")
    print("  NOTE: binary_label and attack_type are expected here — exclude them from X during training")
else:
    print("  OK: No suspicious columns found")

print("\nChecking constant columns...")
constant_cols = [col for col in numeric_cols if df[col].nunique() <= 1]
if constant_cols:
    print(f"  WARNING: {len(constant_cols)} constant column(s) found — drop these:")
    for col in constant_cols:
        print(f"    - {col}")
else:
    print("  OK: No constant columns")

print("\nChecking feature correlation with binary_label...")
df_corr = df[numeric_cols].copy()
df_corr["_label"] = (df["binary_label"] == "attack").astype(int)

correlations = df_corr.corr(numeric_only=True)["_label"].drop("_label")
correlations = correlations.abs().sort_values(ascending=False)

print("\nTop 10 features most correlated with label:")
print(correlations.head(10).to_string())

leakage_risk = correlations[correlations > 0.95]
if not leakage_risk.empty:
    print("\n  WARNING: These features have correlation > 0.95 — possible leakage:")
    print(leakage_risk.to_string())
else:
    print("\n  OK: No feature has suspiciously high correlation with label")

print("\nData types:")
print(df.dtypes.value_counts().to_string())

print("\n=== VALIDATION COMPLETE ===")