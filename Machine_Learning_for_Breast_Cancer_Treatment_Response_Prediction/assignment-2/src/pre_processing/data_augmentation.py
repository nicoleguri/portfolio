import pandas as pd
from sklearn.utils import resample
from imblearn.over_sampling import SMOTE

class DataAugmentation:
    
    def augment_data(X, y, minority_class=1, majority_class=0, strategy='smote'):
        """
        Augment the dataset to handle class imbalance.
        
        Parameters:
        -----------
        X : pandas.DataFrame
            Feature matrix
        y : pandas.Series
            Target variable
        minority_class : int, default=1
            Label of the minority class
        majority_class : int, default=0
            Label of the majority class
        strategy : str, default='smote'
            Strategy to use for augmentation ('smote' or 'upsample')
        
        Returns:
        --------
        tuple : (X_balanced, y_balanced)
            Balanced dataset
        """
        if strategy == 'smote':
            smote = SMOTE(random_state=42)
            X_balanced, y_balanced = smote.fit_resample(X, y)
            
        elif strategy == 'upsample':
            # Combine features and target for resampling
            data = pd.concat([X, pd.Series(y, name='target')], axis=1)
            
            # Separate majority and minority classes
            majority = data[data.target == majority_class]
            minority = data[data.target == minority_class]
            
            # Upsample minority class
            minority_upsampled = resample(
                minority,
                replace=True,
                n_samples=len(majority),
                random_state=42
            )
            
            # Combine majority and upsampled minority
            data_balanced = pd.concat([majority, minority_upsampled])
            
            # Separate features and target
            X_balanced = data_balanced.drop('target', axis=1)
            y_balanced = data_balanced.target
            
        else:
            raise ValueError(f"Unknown strategy: {strategy}")
        
        return X_balanced, y_balanced