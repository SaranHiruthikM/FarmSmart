import sys
import os
import joblib
import pandas as pd
import json

# Define paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "monthly_crop_price_model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "crop_label_encoder.pkl")

def predict(crop_name, year, month):
    try:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODER_PATH):
            return {"error": "Model files not found"}

        # Load models
        model = joblib.load(MODEL_PATH)
        le = joblib.load(ENCODER_PATH)

        # Normalize crop name
        crop_name = crop_name.strip().title()

        # Encode crop
        try:
            crop_id = le.transform([crop_name])[0]
        except ValueError:
            return {"error": f"Crop '{crop_name}' not recognized by the model"}


        # Prepare input
        input_data = pd.DataFrame({
            'Crop_ID': [crop_id],
            'Year': [year],
            'Month': [month]
        })

        # Predict
        prediction = model.predict(input_data)[0]
        
        # 1. Convert Quintal price to Kg price (/ 100)
        kg_price = float(prediction) / 100
        
        # 2. Add annual drift for future forecasting
        # Random Forest (the model used) is a tree-based regressor which does NOT extrapolate.
        # It results in the SAME price for all years beyond its training threshold.
        # We add a 5% cumulative annual growth to simulate market inflation for future dates.
        if year > 2025:
            drift = 1.05 ** (year - 2025)
            kg_price *= drift
            
        return {
            "crop": crop_name,
            "year": year,
            "month": month,
            "predicted_price": round(kg_price, 2)
        }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Missing arguments: crop_name year month"}))
        sys.exit(1)

    crop = sys.argv[1]
    year = int(sys.argv[2])
    month = int(sys.argv[3])

    result = predict(crop, year, month)
    print(json.dumps(result))
