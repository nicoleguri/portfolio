import numpy as np
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import SimpleImputer, IterativeImputer
from sklearn.compose import ColumnTransformer
import pandas as pd

class HandleMissing:

    def replace_nan_values(self, data):
        """Replace 999 values with NaN and return the modified DataFrame."""
        data_copy = data.copy()
        data_copy.replace(999, np.nan, inplace=True)
        return data_copy

    def get_description_data(self, data):
        return data.iloc[:, 0:13].info()

    def identify_categorical_continuous_features(self, data):
        """Identify categorical and continuous features based on data type and unique values."""
        # First, separate numeric and non-numeric columns
        numeric_columns = data.select_dtypes(include=['int64', 'float64']).columns
        non_numeric_columns = data.select_dtypes(exclude=['int64', 'float64']).columns
        
        # Among numeric columns, identify categorical (few unique values) and continuous
        categorical_features = [
            col for col in numeric_columns
            if data[col].nunique() < 20
        ] + list(non_numeric_columns)  # Add all non-numeric columns to categorical
        
        continuous_features = [
            col for col in numeric_columns
            if col not in categorical_features
        ]
        
        return categorical_features, continuous_features

    def check_missing_data(data):
        null_counts = data.isnull().sum()
        null_counts = null_counts[null_counts > 0]
        null_percentage = null_counts / len(data)

        return null_counts, null_percentage

    def init_imputers():
        mice_imputer = IterativeImputer(max_iter=50, random_state=0)
        mean_imputer = SimpleImputer(strategy='mean')
        return mice_imputer, mean_imputer

    def impute_features_and_target(self, data, target_column, categorical_features, continuous_features, classification):
        """Handle missing values for both features and target."""
        # Separate features and target
        X = data.drop(target_column, axis=1)
        y = data[target_column]
        
        # Impute features
        X_imputed = self.impute_features(X, categorical_features, continuous_features)
        
        # Impute target
        y_imputed = self.impute_target(y, classification)
        
        # Combine imputed features and target
        final_data = X_imputed.copy()
        final_data[target_column] = y_imputed
        
        return final_data

    def impute_features(self, X, categorical_features, continuous_features):
        """Impute missing values in features using appropriate strategies."""
        # Set up column transformer
        column_transformer = self.set_column_transformer(categorical_features, continuous_features)
        
        # Apply imputation
        X_imputed = self.apply_imputation(X, column_transformer)
        
        # Convert back to DataFrame
        return self.convert_to_dataframe(X_imputed, categorical_features, continuous_features)

    def impute_target(self, y, classification):
        """Impute missing values in target using mode strategy."""
        if classification:
            target_imputer = SimpleImputer(strategy='most_frequent')
        else:
            target_imputer = SimpleImputer(strategy='mean')
        y_imputed = target_imputer.fit_transform(y.values.reshape(-1, 1))
        if classification:
            return y_imputed.ravel().astype(int)
        return y_imputed.ravel()
    
    def set_column_transformer(self, categorical_features, continuous_features):
        """Set up column transformer with appropriate imputation strategies."""
        # Initialize imputers
        categorical_imputer = SimpleImputer(strategy='most_frequent')  # Use mode for categorical
        continuous_imputer = SimpleImputer(strategy='mean')  # Use mean for continuous
        
        # Create transformers list
        transformers = []
        
        # Add categorical imputer if there are categorical features
        if categorical_features:
            transformers.append(('cat', categorical_imputer, categorical_features))
        
        # Add continuous imputer if there are continuous features
        if continuous_features:
            transformers.append(('cont', continuous_imputer, continuous_features))
        
        # Create and return column transformer
        return ColumnTransformer(
            transformers=transformers,
            remainder='passthrough'
        )

    def apply_imputation(self, data, column_transformer):
        """Apply the column transformer to impute missing values."""
        return column_transformer.fit_transform(data)

    def convert_to_dataframe(self, data, categorical_features, continuous_features):
        """Convert imputed array back to DataFrame with proper column names."""
        # Combine all feature names in the correct order
        all_features = categorical_features + continuous_features
        
        # Create DataFrame with original column names
        return pd.DataFrame(data, columns=all_features)