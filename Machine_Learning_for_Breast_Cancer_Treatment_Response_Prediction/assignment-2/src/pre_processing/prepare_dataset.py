import numpy as np
import pandas as pd
import os
import joblib
from .handle_missing import HandleMissing

class PrepareDataset:

    def __init__(self, file_path):
        self.file_path = file_path
        self.data = pd.read_excel(self.file_path)

    def drop_columns(self, data, columns, axis):
        return data.drop(columns=columns, axis=axis)

    def prepare_dataset(self, target_column, models_path, classification, is_training=True):
        """
        Load and prepare the initial dataset.
        """
        
        # Replace 999 with NaN
        data = HandleMissing().replace_nan_values(self.data)
        
        # Drop ID column if it exists
        if 'ID' in data.columns:
            data = self.drop_columns(data.copy(), ['ID'], 1)

        if classification:
            if 'RelapseFreeSurvival (outcome)' in data.columns:
                data = self.drop_columns(data.copy(), ['RelapseFreeSurvival (outcome)'], 1)
        else:
            if 'pCR (outcome)' in data.columns:
                data = self.drop_columns(data.copy(), ['pCR (outcome)'], 1)
        
        if is_training:
            # Process target variable
            data = self.prepare_target(data, target_column)
            # Save column names for later use
            feature_columns = [col for col in data.columns if col != target_column]
            joblib.dump(feature_columns, models_path + 'original_columns.joblib')
        else:
            # Load expected columns from training
            try:
                expected_columns = joblib.load(models_path + 'original_columns.joblib')
                # Add missing columns with zeros
                for col in expected_columns:
                    if col not in data.columns:
                        data[col] = 0
                # Add target column with dummy values for test data
                data[target_column] = 0
                # Reorder columns to match training data
                data = data[expected_columns + [target_column]]
            except FileNotFoundError:
                raise ValueError("Column information not found. Please run training pipeline first.")
        
        # Identify feature types
        feature_data = self.drop_columns(data.copy(), target_column, 1)
        # categorical_features, continuous_features = HandleMissing().identify_categorical_continuous_features(feature_data)

        categorical_features = ['ER', 'PgR', 'HER2', 'TrippleNegative', 'ChemoGrade', 'Proliferation', 'HistologyType', 'LNStatus', 'TumourStage', 'Gene']
        continuous_features= ['Age', 'original_shape_Elongation', 'original_shape_Flatness', 'original_shape_LeastAxisLength', 'original_shape_MajorAxisLength', 'original_shape_Maximum2DDiameterColumn', 'original_shape_Maximum2DDiameterRow', 'original_shape_Maximum2DDiameterSlice', 'original_shape_Maximum3DDiameter', 'original_shape_MeshVolume', 'original_shape_MinorAxisLength', 'original_shape_Sphericity', 'original_shape_SurfaceArea', 'original_shape_SurfaceVolumeRatio', 'original_shape_VoxelVolume', 'original_firstorder_10Percentile', 'original_firstorder_90Percentile', 'original_firstorder_Energy', 'original_firstorder_Entropy', 'original_firstorder_InterquartileRange', 'original_firstorder_Kurtosis', 'original_firstorder_Maximum', 'original_firstorder_MeanAbsoluteDeviation', 'original_firstorder_Mean', 'original_firstorder_Median', 'original_firstorder_Minimum', 'original_firstorder_Range', 'original_firstorder_RobustMeanAbsoluteDeviation', 'original_firstorder_RootMeanSquared', 'original_firstorder_Skewness', 'original_firstorder_TotalEnergy', 'original_firstorder_Uniformity', 'original_firstorder_Variance', 'original_glcm_Autocorrelation', 'original_glcm_ClusterProminence', 'original_glcm_ClusterShade', 'original_glcm_ClusterTendency', 'original_glcm_Contrast', 'original_glcm_Correlation', 'original_glcm_DifferenceAverage', 'original_glcm_DifferenceEntropy', 'original_glcm_DifferenceVariance', 'original_glcm_Id', 'original_glcm_Idm', 'original_glcm_Idmn', 'original_glcm_Idn', 'original_glcm_Imc1', 'original_glcm_Imc2', 'original_glcm_InverseVariance', 'original_glcm_JointAverage', 'original_glcm_JointEnergy', 'original_glcm_JointEntropy', 'original_glcm_MCC', 'original_glcm_MaximumProbability', 'original_glcm_SumAverage', 'original_glcm_SumEntropy', 'original_glcm_SumSquares', 'original_gldm_DependenceEntropy', 'original_gldm_DependenceNonUniformity', 'original_gldm_DependenceNonUniformityNormalized', 'original_gldm_DependenceVariance', 'original_gldm_GrayLevelNonUniformity', 'original_gldm_GrayLevelVariance', 'original_gldm_HighGrayLevelEmphasis', 'original_gldm_LargeDependenceEmphasis', 'original_gldm_LargeDependenceHighGrayLevelEmphasis', 'original_gldm_LargeDependenceLowGrayLevelEmphasis', 'original_gldm_LowGrayLevelEmphasis', 'original_gldm_SmallDependenceEmphasis', 'original_gldm_SmallDependenceHighGrayLevelEmphasis', 'original_gldm_SmallDependenceLowGrayLevelEmphasis', 'original_glrlm_GrayLevelNonUniformity', 'original_glrlm_GrayLevelNonUniformityNormalized', 'original_glrlm_GrayLevelVariance', 'original_glrlm_HighGrayLevelRunEmphasis', 'original_glrlm_LongRunEmphasis', 'original_glrlm_LongRunHighGrayLevelEmphasis', 'original_glrlm_LongRunLowGrayLevelEmphasis', 'original_glrlm_LowGrayLevelRunEmphasis', 'original_glrlm_RunEntropy', 'original_glrlm_RunLengthNonUniformity', 'original_glrlm_RunLengthNonUniformityNormalized', 'original_glrlm_RunPercentage', 'original_glrlm_RunVariance', 'original_glrlm_ShortRunEmphasis', 'original_glrlm_ShortRunHighGrayLevelEmphasis', 'original_glrlm_ShortRunLowGrayLevelEmphasis', 'original_glszm_GrayLevelNonUniformity', 'original_glszm_GrayLevelNonUniformityNormalized', 'original_glszm_GrayLevelVariance', 'original_glszm_HighGrayLevelZoneEmphasis', 'original_glszm_LargeAreaEmphasis', 'original_glszm_LargeAreaHighGrayLevelEmphasis', 'original_glszm_LargeAreaLowGrayLevelEmphasis', 'original_glszm_LowGrayLevelZoneEmphasis', 'original_glszm_SizeZoneNonUniformity', 'original_glszm_SizeZoneNonUniformityNormalized', 'original_glszm_SmallAreaEmphasis', 'original_glszm_SmallAreaHighGrayLevelEmphasis', 'original_glszm_SmallAreaLowGrayLevelEmphasis', 'original_glszm_ZoneEntropy', 'original_glszm_ZonePercentage', 'original_glszm_ZoneVariance', 'original_ngtdm_Busyness', 'original_ngtdm_Coarseness', 'original_ngtdm_Complexity', 'original_ngtdm_Contrast', 'original_ngtdm_Strength']
        
        return data, categorical_features, continuous_features

    def prepare_target(self, data, target_column):
        """
        Prepare target variable by handling missing values and converting to proper type.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            Input dataset
        target_column : str
            Name of the target column
        
        Returns:
        --------
        pandas.DataFrame
            Dataset with processed target variable
        """
        # Convert target to integer type, temporarily using -1 for NaN
        data[target_column] = data[target_column].fillna(-1).astype(int)
        
        # Replace -1 back to NaN
        data.loc[data[target_column] == -1, target_column] = np.nan
        
        return data
