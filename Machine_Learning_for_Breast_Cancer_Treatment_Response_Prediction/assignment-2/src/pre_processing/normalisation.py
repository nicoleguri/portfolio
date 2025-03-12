from sklearn.preprocessing import StandardScaler
import joblib
import os

class Normalisation:
    def __init__(self, is_training, models_path):
        self.is_training = is_training
        self.models_path = models_path

    def normalise_data(self, data, continuous_features):
        """Normalize only the continuous features."""
        # Create a copy of the data
        data_copy = data.copy()

        # Normalize continuous features only
        if continuous_features:
            if self.is_training:
                scaler = StandardScaler()
                data_copy[continuous_features] = scaler.fit_transform(data[continuous_features])
                joblib.dump(scaler, self.models_path + 'scaler.joblib')
            else:
                # Load the scaler and transform
                scaler = joblib.load(self.models_path + 'scaler.joblib')
                data_copy[continuous_features] = scaler.transform(data[continuous_features])

        return data_copy