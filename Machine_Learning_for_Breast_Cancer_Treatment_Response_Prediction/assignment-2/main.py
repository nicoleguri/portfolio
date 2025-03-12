from src.classification.pre_process import *
from src.regression.pre_process import *
from src.k_fold.k_fold_classification import *
from src.k_fold.k_fold_regression import *


def main():
    # Classification Training
    X_train, X_test, y_train, y_test = processClassificationTrain('./data/TrainDataset2024.xls')

    # Run k-fold classification on training data
    k_fold_classification = KFoldClassification()
    k_fold_classification.run_evaluation(pd.concat([X_train, X_test]), pd.concat([y_train, y_test]), optimize=True)

    # Classification Testing
    processClassificationTest('./data/TestDataSetExample.xls')

    # Regression Training
    X_train, X_test, y_train, y_test = processRegressionTrain('./data/TrainDataset2024.xls')

    # Run k-fold regression on training data
    k_fold_regression = KFoldRegression()
    k_fold_regression.run_evaluation(pd.concat([X_train, X_test]), pd.concat([y_train, y_test]), optimize=True)

    # Regression Testing
    processRegressionTest('./data/TestDataSetExample.xls')


if __name__ == "__main__":
    main()