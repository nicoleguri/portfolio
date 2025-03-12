import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from .prepare_dataset import PrepareDataset
from .handle_missing import HandleMissing
from .handle_outliers import HandleOutliers
from .data_augmentation import DataAugmentation
from .normalisation import Normalisation
from .feature_engineering import FeatureEngineering

class DataPreprocessingPipeline:

    def __init__(self, file_path, is_training, classification, target_column, augmentation_strategy=None):
        """Initialize the pipeline with the data file path."""
        self.file_path = file_path
        self.is_training = is_training
        self.augmentation_strategy = augmentation_strategy
        self.data = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.categorical_features = None
        self.continuous_features = None
        self.target_vars = None
        self.target_column = target_column
        self.pca_model = None
        self.feature_names = None
        self.classification = classification
        if classification:
            self.models_path = './src/models/data_preprocessing/classification/'
        else:
            self.models_path = './src/models/data_preprocessing/regression/'
        os.makedirs(self.models_path, exist_ok=True)
        
    def load_and_prepare_data(self):
        """Load and prepare the initial dataset."""
        # Prepare dataset
        self.data, self.categorical_features, self.continuous_features = PrepareDataset(self.file_path).prepare_dataset(
            target_column=self.target_column,
            models_path=self.models_path,
            classification=self.classification,
            is_training=self.is_training
        )

        return self
    
    def handle_missing_values(self):
        """Handle missing values using appropriate imputation strategies."""
        self.data = HandleMissing().impute_features_and_target(
            self.data,
            self.target_column,
            self.categorical_features,
            self.continuous_features,
            self.classification
        )
        return self
    
    def handle_outliers(self, method='clip', z_threshold=10):
        """Handle outliers using the specified method."""
        self.data = HandleOutliers(self.data).handle_z_score_outliers(
            method=method, 
            z_threshold=z_threshold
        )
        # print("Handled Outliers:\n", self.data.head())
        return self
    
    def augment_training_data(self):
        """Apply data augmentation to training data if specified."""
        if not self.is_training or not self.augmentation_strategy or not self.classification:
            return self
        
        # Separate features and target
        X = self.data.drop(self.target_column, axis=1)
        y = self.data[self.target_column]
        
        # Apply augmentation
        X_balanced, y_balanced = DataAugmentation.augment_data(
            X, y, 
            strategy=self.augmentation_strategy
        )
        
        # Combine back into DataFrame
        self.data = pd.concat([
            pd.DataFrame(X_balanced, columns=X.columns),
            pd.Series(y_balanced, name=self.target_column)
        ], axis=1)
        
        return self
    
    def normalize_features(self):
        """Apply normalization to the continuous features."""
        normalizer = Normalisation(is_training=self.is_training, models_path=self.models_path)
        self.data = normalizer.normalise_data(self.data, self.continuous_features)
        return self
    
    def reduce_dimensions(self):
        """Apply PCA to reduce dimensionality of MRI features."""
        
        if self.is_training:
            # For training data: fit and save PCA model
            self.data, self.pca_model, self.feature_names = FeatureEngineering(self.data).apply_pca(target_column=self.target_column, is_training=True)
            
            # Save PCA model and feature names
            joblib.dump(self.pca_model, self.models_path + 'pca_model.joblib')
            joblib.dump(self.feature_names, self.models_path + 'feature_names.joblib')
        else:
            # For test data: load saved PCA model and transform
            try:
                self.pca_model = joblib.load(self.models_path + 'pca_model.joblib')
                self.feature_names = joblib.load(self.models_path + 'feature_names.joblib')
                self.data = FeatureEngineering(self.data).apply_pca(target_column=self.target_column, is_training=False, pca_model=self.pca_model)
                
                # Ensure columns match training data
                missing_cols = set(self.feature_names) - set(self.data.columns)
                for col in missing_cols:
                    self.data[col] = 0
                
                # Reorder columns to match training
                self.data = self.data[self.feature_names + [self.target_column]]
                
            except FileNotFoundError:
                raise ValueError("PCA model not found. Please run training pipeline first.")
        
        # print("PCA:\n", self.data.head())

        return self
    
    def split_dataset(self, data, target_column, test_size=0.2, random_state=42):
        """
        Split dataset into training and testing sets.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            The complete dataset including features and target
        target_column : str
            Name of the target column
        test_size : float, default=0.2
            Proportion of the dataset to include in the test split
        random_state : int, default=42
            Random state for reproducibility
        
        Returns:
        --------
        tuple : (X_train, X_test, y_train, y_test)
            Split datasets for training and testing
        """
        # Split features and target
        X = data.drop(target_column, axis=1)
        y = data[target_column]
        
        # Split the data
        if self.classification:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, 
                test_size=test_size, 
                random_state=random_state,
                stratify=y  # Ensure balanced split for classification
            )
        else:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, 
                test_size=test_size, 
                random_state=random_state
            )
        
        return X_train, X_test, y_train, y_test

    def split_data(self, test_size=0.2, random_state=42):
        """Split the data into training and testing sets."""
        if self.is_training:
            self.X_train, self.X_test, self.y_train, self.y_test = self.split_dataset(
                self.data,
                self.target_column,
                test_size=test_size,
                random_state=random_state
            )
        else:
            # For test data, don't split - just separate features and target
            self.X_test = self.data.drop(self.target_column, axis=1)
            self.y_test = self.data[self.target_column]
            # Set other attributes to None for test data
            self.X_train = None
            self.y_train = None
        return self

    def get_processed_data(self):
        """Return the processed and split data."""
        if self.is_training:
            return self.X_train, self.X_test, self.y_train, self.y_test
        else:
            # For test data, return None for training data
            return None, self.X_test, None, self.y_test
    
    def run_pipeline(self):
        """Run the complete preprocessing pipeline."""
        (self
        .load_and_prepare_data()
        .handle_missing_values()
        .handle_outliers()
        .augment_training_data()
        .normalize_features()
        .reduce_dimensions()
        .split_data()
        )
        return self.get_processed_data()