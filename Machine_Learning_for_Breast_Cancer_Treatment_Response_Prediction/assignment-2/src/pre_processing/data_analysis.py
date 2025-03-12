import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import os

class DataAnalysis:

    def __init__(self, data):
        self.data = data

    def check_distribution(self):
        fig, axes = plt.subplots(3, 5, figsize=(20,10), sharey=True)
        axes = axes.ravel()
        for i, col in enumerate(self.data.columns[0:13]):
            if col == 'RelapseFreeSurvival (outcome)' or col == 'Age':
                sns.histplot(data=self.data, x=col, ax=axes[i])
            else:
                sns.countplot(data=self.data, x=col, ax=axes[i])
            axes[i].set_title(f'Count Plot for {col}')
            axes[i].set_xlabel(col)
            axes[i].set_ylabel('Count')

        plt.tight_layout()
        fig.show()