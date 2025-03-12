from src.classification.pre_process import *
from sklearn.svm import SVC
import joblib
import os
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import accuracy_score, confusion_matrix, ConfusionMatrixDisplay
import pandas as pd
from src.classification.DNN_model import *

class CONFIG:
    model = './src/models/classification/neural_network_model.pth'
    test_dataset = './data/FinalTestDataset2024.xls'
    scaler = './src/models/data_preprocessing/scaler.joblib'
    results_path = './results/classification/'
    results = './results/classification/PCRPrediction.csv'

# Classification
def predict_new_data(test_file_path, model_path):
    """
    Preprocess new data and make predictions using a saved PyTorch model.
    """

    # Read original data to get IDs
    original_data = pd.read_excel(test_file_path)
    original_ids = original_data['ID'].values
    
    # Initialize pipeline for test data
    _, X_test, _, y_test = processClassificationTest(test_file_path)
    
    # Convert data to tensors
    X_test_tensor = torch.from_numpy(X_test.to_numpy()).float()
    
    # Load the saved PyTorch model
    model = Net(X_test_tensor)
    model.load_state_dict(torch.load(model_path, weights_only=True))
    model.eval()
    
    # Make predictions
    with torch.no_grad():
        predictions = model(X_test_tensor).argmax(dim=1)
    
    # Create results DataFrame
    results = pd.DataFrame({
        'ID': original_ids,
        'Predicted pCR (outcome)': predictions.cpu().numpy()
    })
    
    # Save results to a CSV file
    os.makedirs(CONFIG.results_path, exist_ok=True)
    results.to_csv(CONFIG.results, index=False)
    
    return results

# Make predictions on test data using the saved PyTorch model
predictions_df = predict_new_data(CONFIG.test_dataset, CONFIG.model)
print("\nPredictions on Test Data:")
print(predictions_df)