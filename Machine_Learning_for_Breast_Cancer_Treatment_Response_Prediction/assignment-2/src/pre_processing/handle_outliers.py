import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import scipy.stats as stats

class HandleOutliers:

    def __init__(self, data):
        self.data = data
        
    def visualise_outliers(self):
        # Example Z-score threshold for detecting extreme outliers
        z_threshold = 3

        # Calculate the number and percentage of extreme outliers for each column
        extreme_outliers_info = {}

        for col in self.data.select_dtypes(include=['int64', 'float64']).columns[1:]:
            z_scores = np.abs((self.data[col] - self.data[col].mean()) / self.data[col].std())
            outliers_count = (z_scores > z_threshold).sum()
            total_count = len(self.data[col].dropna())
            outliers_percentage = (outliers_count / total_count) * 100
            extreme_outliers_info[col] = {
                'count': outliers_count,
                'max_z_score': z_scores.max(),  # Track the maximum Z-score for the most extreme outlier
                'percentage': outliers_percentage,
                'outlier_indices': self.data[col].index[z_scores > z_threshold]  # Indices of outliers
            }

        # Sort columns by the maximum Z-score to ensure we get the most extreme outliers
        sorted_columns = sorted(
            extreme_outliers_info, 
            key=lambda x: (extreme_outliers_info[x]['count'], extreme_outliers_info[x]['max_z_score']), 
            reverse=True
        )

        # Choose the top N columns to visualize (e.g., top 24)
        top_columns = sorted_columns[:24]

        # Adjust the number of rows/columns for up to 24 plots (e.g., 6 rows, 4 columns)
        fig, axes = plt.subplots(nrows=6, ncols=4, figsize=(20, 30))
        fig.subplots_adjust(hspace=0.4, wspace=0.4)

        axes = axes.ravel()

        # Plot boxplots for the top columns with the most extreme outliers
        for i, col in enumerate(top_columns):
            outliers_count = extreme_outliers_info[col]['count']
            outliers_percentage = extreme_outliers_info[col]['percentage']
            
            # Create the boxplot
            sns.boxplot(y=col, x='pCR (outcome)', data=self.data, ax=axes[i], showfliers=False)  # Hide default fliers
            
            # Plot outliers in red
            outlier_indices = extreme_outliers_info[col]['outlier_indices']
            outliers = self.data.loc[outlier_indices]
            sns.scatterplot(
                y=outliers[col], 
                x=outliers['pCR (outcome)'], 
                ax=axes[i], 
                color='red', 
                edgecolor='w', 
                s=50, 
                alpha=0.8, 
                label='Outliers'
            )
            
            # Add title with outlier information
            axes[i].set_title(
                f"Column: {col}\nOutliers: {outliers_count} ({outliers_percentage:.2f}%)"
            )

        # Hide any unused subplots if you have fewer top columns than subplots
        for j in range(len(top_columns), len(axes)):
            fig.delaxes(axes[j])

        plt.tight_layout()
        return fig

    def count_outliers_using_iqr_range(self, iqr_multiple=1.5):
        outliers_dict = {}
        
        for column in self.data.select_dtypes(include=['int64', 'float64']).columns:
            try:
                Q1 = self.data[column].quantile(0.25)
                Q3 = self.data[column].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - iqr_multiple * IQR
                upper_bound = Q3 + iqr_multiple * IQR
                iqr_outliers = self.data[column][(self.data[column] < lower_bound) | (self.data[column] > upper_bound)]
                outliers_dict[column] = len(iqr_outliers)
            except:
                outliers_dict[column] = 0
        
        return outliers_dict

    def count_outliers_using_z_score(self, z_threshold=3):
        outliers_dict = {}
        
        for column in self.data.select_dtypes(include=['int64', 'float64']).columns:
            try:
                column_data = self.data[column].dropna()
                z_scores = np.abs((column_data - column_data.mean()) / column_data.std())
                z_score_outliers = column_data[z_scores > z_threshold]
                outliers_dict[column] = len(z_score_outliers)
            except:
                outliers_dict[column] = 0
        
        return outliers_dict

    def handle_z_score_outliers(self, method='clip', z_threshold=3):
        df_processed = self.data.copy()
        
        for column in self.data.select_dtypes(include=['int64', 'float64']).columns:
            try:
                column_data = self.data[column].dropna()
                z_scores = np.abs((column_data - column_data.mean()) / column_data.std())
                extreme_outlier_mask = z_scores > z_threshold
                
                if method == 'clip':
                    # Clip extreme values to z-score threshold boundaries
                    mean = column_data.mean()
                    std = column_data.std()
                    df_processed[column] = df_processed[column].apply(
                        lambda x: min(max(x, mean - z_threshold*std), mean + z_threshold*std)
                    )
                
                elif method == 'remove':
                    # Remove rows with extreme outliers
                    df_processed = df_processed[~extreme_outlier_mask]
                
                elif method == 'winsorize':
                    # Winsorize extreme values
                    df_processed[column] = stats.mstats.winsorize(
                        df_processed[column], 
                        limits=[0.05, 0.05]
                    )
            
            except Exception as e:
                print(f"Error processing column {column}: {e}")
        
        return df_processed