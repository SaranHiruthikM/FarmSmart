import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
import sys

# Define dataset path
DATASET_PATH = os.path.join("..", "dataset", "Agriculture_price_dataset.csv")
MODEL_DIR = os.path.join("..", "models")

# Ensure models directory exists
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def load_and_preprocess_data():
    if not os.path.exists(DATASET_PATH):
        print(f"Error: Dataset not found at {DATASET_PATH}")
        sys.exit(1)

    print("Loading dataset...")
    df = pd.read_csv(DATASET_PATH)

    # Convert 'Price Date' to datetime
    df['Price Date'] = pd.to_datetime(df['Price Date'], dayfirst=True, errors='coerce')
    df = df.dropna(subset=['Price Date'])

    # Strip any whitespace from column names
    df.columns = [c.strip() for c in df.columns]

    print(f"Dataset loaded: {len(df)} rows.")
    print(f"Date range: {df['Price Date'].min()} to {df['Price Date'].max()}")
    print(f"Original Unique Crops: {df['Commodity'].nunique()}")

    return df

def train_monthly_model(df):
    print("\nAggregating data by Crop, Year, and Month...")
    
    # Extract Year and Month directly
    df['Year'] = df['Price Date'].dt.year
    df['Month'] = df['Price Date'].dt.month

    # Aggregation Strategy:
    # We group by Commodity, Year, and Month to get the average 'Modal_Price' for that month across all regions.
    # This smoothes out daily fluctuations and regional variances, focusing on the temporal trend of the crop itself.
    monthly_df = df.groupby(['Commodity', 'Year', 'Month'])['Modal_Price'].mean().reset_index()
    
    print(f"Aggregated Data Size: {len(monthly_df)} monthly records")

    # Encode 'Commodity' (Crop Name) to numbers
    le = LabelEncoder()
    monthly_df['Crop_ID'] = le.fit_transform(monthly_df['Commodity'])
    
    # Save the label encoder for inference
    joblib.dump(le, os.path.join(MODEL_DIR, "crop_label_encoder.pkl"))
    print("Label Encoder saved.")

    # Define Features (X) and Target (y)
    # Inputs: Crop_ID, Year, Month
    # Output: Average Monthly Price
    X = monthly_df[['Crop_ID', 'Year', 'Month']]
    y = monthly_df['Modal_Price']

    # Train Random Forest Regressor
    # We use a robust number of trees (100) and allow parallel processing (-1)
    print(f"Training Random Forest on {len(X)} records...")
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X, y)

    # Evaluate (Self-test on training data for sanity check)
    predictions = model.predict(X)
    mae = mean_absolute_error(y, predictions)
    r2 = r2_score(y, predictions)
    print(f"Training MAE: {mae:.2f} (Average error in price)")
    print(f"Training R2 Score: {r2:.2f}")

    # Save the trained model
    model_path = os.path.join(MODEL_DIR, "monthly_crop_price_model.pkl")
    joblib.dump(model, model_path)
    print(f"Global Monthly Model saved to {model_path}")
    
    return model, le

def predict_example(model, le, crop_name, year, month):
    try:
        # Encode crop name
        crop_id = le.transform([crop_name])[0]
        
        # Create input array (Need to match training columns)
        input_data = pd.DataFrame({
            'Crop_ID': [crop_id],
            'Year': [year],
            'Month': [month]
        })
        
        # Predict
        predicted_price = model.predict(input_data)[0]
        print(f"Predicted Price for {crop_name} in {month}/{year}: {predicted_price:.2f}/kg (approx)") # Assuming price is per unit/quintal/kg based on dataset
        return predicted_price
    except Exception as e:
        print(f"Could not predict for {crop_name}: {e}")

def main():
    df = load_and_preprocess_data()
    model, le = train_monthly_model(df)
    
    print("\n--- Testing Model Predictions ---")
    # Test with some known high-volume crops
    top_crops = df['Commodity'].value_counts().head(3).index.tolist()
    
    for crop in top_crops:
        # Predict for a future date
        predict_example(model, le, crop, 2025, 12)
        predict_example(model, le, crop, 2026, 1)

if __name__ == "__main__":
    main()