import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, KFold, GridSearchCV
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.neural_network import MLPRegressor
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from IPython.display import display

class KFoldRegression:
    def __init__(self, random_state=42):
        self.random_state = random_state
        
    def get_base_models_and_params(self):
        """Get base models and their parameter grids."""
        return {
            'Linear Regression': (
                LinearRegression(),
                {
                    'fit_intercept': [True, False],
                }
            ),
            'MLP': (
                MLPRegressor(random_state=self.random_state, solver='adam', max_iter=5000, early_stopping=True),
                {
                    'hidden_layer_sizes': [(50,), (100,), (50, 50), (100, 50)],
                    'activation': ['relu', 'tanh'],
                    'alpha': [0.0001, 0.001, 0.01],
                    'learning_rate': ['constant', 'adaptive']
                }
            ),
            'SVR': (
                SVR(),
                {
                    'C': [0.1, 1, 10],
                    'kernel': ['linear', 'rbf'],
                    'gamma': ['scale', 'auto', 0.1, 1]
                }
            ),
            'Decision Tree': (
                DecisionTreeRegressor(random_state=self.random_state),
                {
                    'max_depth': [3, 5, 7, None],
                    'min_samples_split': [2, 5, 10],
                    'min_samples_leaf': [1, 2, 4]
                }
            )
        }

    def evaluate_model(self, model, X_train, X_test, y_train, y_test, cv):
        """Evaluate a single model using cross-validation and test set."""
        cv_scores = []
        
        # Cross-validation
        for train_idx, val_idx in cv.split(X_train):
            model.fit(X_train[train_idx], y_train[train_idx])
            y_pred = model.predict(X_train[val_idx])
            scores = {
                'mse': mean_squared_error(y_train[val_idx], y_pred),
                'rmse': np.sqrt(mean_squared_error(y_train[val_idx], y_pred)),
                'mae': mean_absolute_error(y_train[val_idx], y_pred),
                'r2': r2_score(y_train[val_idx], y_pred)
            }
            cv_scores.append(scores)
        
        # Test set evaluation
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        test_scores = {
            'mse': mean_squared_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'r2': r2_score(y_test, y_pred)
        }
        
        return {'cv_scores': cv_scores, 'test_scores': test_scores}

    def run_evaluation(self, X, y, optimize=True):
        """Run complete evaluation pipeline with optional optimization."""
        # Prepare data
        X, y = np.asarray(X), np.asarray(y)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=self.random_state
        )
        
        cv = KFold(n_splits=10, shuffle=True, random_state=self.random_state)
        results = {}
        
        # Get models and their parameter grids
        models_and_params = self.get_base_models_and_params()
        
        # Evaluate each model
        for name, (model, param_grid) in models_and_params.items():
            if optimize:
                print(f"\nOptimizing {name}...")
                grid_search = GridSearchCV(
                    model, param_grid, cv=5, scoring='r2', n_jobs=-1
                )
                grid_search.fit(X_train, y_train)
                model = grid_search.best_estimator_
                print(f"Best parameters: {grid_search.best_params_}")
                print(f"Best CV score: {grid_search.best_score_:.3f}")
            
            results[name] = self.evaluate_model(
                model, X_train, X_test, y_train, y_test, cv
            )
        
        # Print results for each model
        print("\nCross-validation Results:")
        for name, scores in results.items():
            print(f"\n{name}:")
            cv_metrics = {metric: [] for metric in ['mse', 'rmse', 'mae', 'r2']}
            for fold in scores['cv_scores']:
                for metric, value in fold.items():
                    cv_metrics[metric].append(value)
            
            for metric, values in cv_metrics.items():
                mean = np.mean(values)
                std = np.std(values)
                print(f"{metric}: {mean:.3f} ± {std:.3f}")

        print("\nTest Set Results:")
        for name, scores in results.items():
            print(f"\n{name}:")
            for metric, value in scores['test_scores'].items():
                print(f"{metric}: {value:.3f}")
        
        return results, None, None