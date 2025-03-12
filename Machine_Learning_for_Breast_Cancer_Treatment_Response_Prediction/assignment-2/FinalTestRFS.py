from src.regression.pre_process import *
from sklearn.neural_network import MLPRegressor
from sklearn.svm import SVR
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import os
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from src.regression.DNN_model import *

class CONFIG:
    model = './src/models/regression/dnn_model.pth'
    test_dataset = './data/FinalTestDataset2024.xls'
    scaler = './src/models/data_preprocessing/scaler.joblib'
    results_path = './results/regression/'
    results = './results/regression/RFSPrediction.csv'

def predict_with_dnn(test_file_path, model_path):
    """
    Load the trained DNN model and make predictions on the test data.

    Parameters:
    test_file_path : str
        Path to the test dataset file.
    model_path : str
        Path to the saved DNN model.

    Returns:
    pd.DataFrame
        DataFrame containing IDs and predicted values.
    """

    # Read original data to get IDs
    original_data = pd.read_excel(test_file_path)
    original_ids = original_data['ID'].values

    # Load the test data
    _, X_test, _, y_test = processRegressionTest(test_file_path)

    # Convert test data to tensor
    X_test_tensor = torch.from_numpy(X_test.to_numpy()).float()

    # Load the saved DNN model
    model = Net(input_size=X_test_tensor.shape[1])
    model.load_state_dict(torch.load(model_path, weights_only=True))
    model.eval()

    # Make predictions
    with torch.no_grad():
        y_pred_tensor = model(X_test_tensor)
        y_pred = y_pred_tensor.cpu().numpy()
        
    y_pred = y_pred.squeeze()

    # Create results DataFrame
    results = pd.DataFrame({
        'ID': original_ids,
        'Predicted RelapseFreeSurvival (outcome)': y_pred
    })

    # Save results to a CSV file
    os.makedirs(CONFIG.results_path, exist_ok=True)
    results.to_csv(CONFIG.results, index=False)

    return results

# Example usage
predictions_df = predict_with_dnn(CONFIG.test_dataset, CONFIG.model)
predictions_df['Predicted RelapseFreeSurvival (outcome)'] = predictions_df['Predicted RelapseFreeSurvival (outcome)']
print("\nPredictions on Test Data:")
print(predictions_df)