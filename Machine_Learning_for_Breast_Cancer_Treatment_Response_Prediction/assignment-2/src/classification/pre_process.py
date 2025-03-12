import pandas as pd
from src.pre_processing import DataPreprocessingPipeline

def processClassificationTrain(file_path):
    # Initialize and run the pipeline
    pipeline = DataPreprocessingPipeline(
        file_path=file_path,
        is_training=True,
        classification=True,
        target_column='pCR (outcome)',
        augmentation_strategy='smote'
    )
    X_train, X_test, y_train, y_test = pipeline.run_pipeline()

    return X_train, X_test, y_train, y_test

def processClassificationTest(file_path):
    # Initialize and run the pipeline
    pipeline = DataPreprocessingPipeline(
        file_path, 
        is_training=False, 
        classification=True,
        target_column='pCR (outcome)'  # Ensure this column exists in your dataset
    )
    
    # Run the pipeline to get processed data
    X_train, X_test, y_train, y_test = pipeline.run_pipeline()
    
    return X_train, X_test, y_train, y_test