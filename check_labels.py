import joblib
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

binary_le = joblib.load(os.path.join(BASE_DIR, "model", "binary", "label_encoder.pkl"))
print("Binary classes:", binary_le.classes_)

multi_le = joblib.load(os.path.join(BASE_DIR, "model", "multi_class", "label_encoder_multiclass.pkl"))
print("Multiclass classes:", multi_le.classes_)
