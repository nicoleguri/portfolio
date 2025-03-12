import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import PCA

class FeatureEngineering:

    def __init__(self, data):
        self.data = data

    def create_heatmap(self):
        matrix = self.data.iloc[:, 0:12].corr(numeric_only=True)
        # Generate a mask for the upper triangle
        mask = np.zeros_like(matrix)
        mask[np.triu_indices_from(mask)] = True
        # Set up the matplotlib figure
        fig, ax = plt.subplots(figsize=(15, 8))
        plt.title('Clinical Features Correlation')
        # Draw the heatmap with the mask and correct aspect ratio
        heatmap = sns.heatmap(matrix, vmax=1.2, square=False, cmap='crest', mask=mask, ax=ax, annot=True, fmt='.2g', linewidths=1)
        return heatmap

    def apply_pca(self, target_column, is_training=True, pca_model=None):
        """
        Apply PCA transformation while preserving clinical features and target.
        """
        # Separate target
        target = self.data[target_column]
        
        # Separate clinical and MRI features
        clinical_features = self.data.iloc[:, 0:12]
        mri_features = self.data.iloc[:, 12:]
        
        if is_training:
            # Initialize and fit PCA on the training data
            pca = PCA(n_components=0.90)
            data_pca = pca.fit_transform(mri_features)
            
            # Create DataFrame with meaningful column names for PCA components
            pca_columns = [f'PCA_Component_{i+1}' for i in range(data_pca.shape[1])]
            data_pca = pd.DataFrame(data=data_pca, columns=pca_columns)
            
            # Save column names for test data
            feature_names = list(clinical_features.columns) + list(data_pca.columns)
            
            # Combine all parts
            data_transformed = pd.concat([clinical_features, data_pca, target], axis=1)
            return data_transformed, pca, feature_names
        else:
            # Transform test data using saved PCA model
            data_pca = pca_model.transform(mri_features)
            
            # Create DataFrame with same column names as training
            n_components = pca_model.n_components_
            pca_columns = [f'PCA_Component_{i+1}' for i in range(n_components)]
            data_pca = pd.DataFrame(data=data_pca, columns=pca_columns)
            
            # Combine all parts
            data_transformed = pd.concat([clinical_features, data_pca, target], axis=1)
            return data_transformed

    def display_pca_variance(self, data):
        data, pca = self.apply_pca(data)
        plt.figure(figsize=(8, 5))
        plt.plot(np.cumsum(pca.explained_variance_ratio_), marker='o')
        plt.title('Cumulative Explained Variance')
        plt.xlabel('Number of Components')
        plt.ylabel('Cumulative Explained Variance')
        plt.grid()
        return plt
