import pandas as pd
from src.pre_processing import DataPreprocessingPipeline

def processRegressionTrain(file_path):
    # Initialize and run the pipeline
    pipeline = DataPreprocessingPipeline(
        file_path=file_path,
        is_training=True,
        classification=False,
        target_column='RelapseFreeSurvival (outcome)'
    )
    X_train, X_test, y_train, y_test = pipeline.run_pipeline()

    return X_train, X_test, y_train, y_test

def processRegressionTest(file_path):
    # Initialize and run the pipeline
    pipeline = DataPreprocessingPipeline(
        file_path, 
        is_training=False, 
        classification=False,
        target_column='RelapseFreeSurvival (outcome)'
        )
    X_train, X_test, y_train, y_test = pipeline.run_pipeline()

    return X_train, X_test, y_train, y_test

