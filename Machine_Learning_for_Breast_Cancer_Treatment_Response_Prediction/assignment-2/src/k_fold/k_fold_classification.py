import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from IPython.display import display

class KFoldClassification:
    def __init__(self, random_state=42):
        self.random_state = random_state
        
    def get_base_models_and_params(self):
        """Get base models and their parameter grids."""
        return {
            'Logistic Regression': (
                LogisticRegression(random_state=self.random_state, class_weight='balanced'),
                {
                    'C': [0.001, 0.01, 0.1, 1, 10, 100],
                    'solver': ['lbfgs', 'liblinear'],
                    'max_iter': [2000]
                }
            ),
            'MLP': (
                MLPClassifier(random_state=self.random_state, early_stopping=True),
                {
                    'hidden_layer_sizes': [(50,), (100,), (50, 50), (100, 50)],
                    'activation': ['relu', 'tanh'],
                    'alpha': [0.0001, 0.001, 0.01],
                    'learning_rate': ['constant', 'adaptive']
                }
            ),
            'SVM': (
                SVC(random_state=self.random_state, class_weight='balanced'),
                {
                    'C': [0.1, 1, 10],
                    'kernel': ['linear', 'rbf'],
                    'gamma': ['scale', 'auto', 0.1, 1]
                }
            ),
            'Decision Tree': (
                DecisionTreeClassifier(random_state=self.random_state, class_weight='balanced'),
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
        for train_idx, val_idx in cv.split(X_train, y_train):
            model.fit(X_train[train_idx], y_train[train_idx])
            y_pred = model.predict(X_train[val_idx])
            scores = {
                'accuracy': accuracy_score(y_train[val_idx], y_pred),
                'precision': precision_score(y_train[val_idx], y_pred),
                'recall': recall_score(y_train[val_idx], y_pred),
                'f1': f1_score(y_train[val_idx], y_pred)
            }
            cv_scores.append(scores)
        
        # Test set evaluation
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        test_scores = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred),
            'recall': recall_score(y_test, y_pred),
            'f1': f1_score(y_test, y_pred)
        }
        
        return {'cv_scores': cv_scores, 'test_scores': test_scores}

    def run_evaluation(self, X, y, optimize=True):
        """Run complete evaluation pipeline with optional optimization."""
        # Prepare data
        X, y = np.asarray(X), np.asarray(y)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, stratify=y, random_state=self.random_state
        )
        
        cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=self.random_state)
        results = {}
        
        # Get models and their parameter grids
        models_and_params = self.get_base_models_and_params()
        
        # Evaluate each model
        for name, (model, param_grid) in models_and_params.items():
            if optimize:
                print(f"\nOptimizing {name}...")
                grid_search = GridSearchCV(
                    model, param_grid, cv=5, scoring='f1', n_jobs=-1
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
            cv_metrics = {metric: [] for metric in ['accuracy', 'precision', 'recall', 'f1']}
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