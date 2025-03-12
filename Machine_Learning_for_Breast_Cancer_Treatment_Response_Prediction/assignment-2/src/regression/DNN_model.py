import torch
import torch.nn as nn
import torch.optim as optim

# Define the neural network model with even more layers
class Net(nn.Module):
    def __init__(self, input_size):
        super(Net, self).__init__()

        self.fc1 = nn.Linear(input_size, 512)  # Increased number of neurons
        self.bn1 = nn.BatchNorm1d(512)        # Batch Normalization
        self.fc2 = nn.Linear(512, 256)
        self.bn2 = nn.BatchNorm1d(256)
        self.fc3 = nn.Linear(256, 128)
        self.bn3 = nn.BatchNorm1d(128)
        self.fc4 = nn.Linear(128, 1)         # Regression output

    def forward(self, x):
        x = torch.relu(self.bn1(self.fc1(x)))  # Apply BatchNorm + ReLU
        x = torch.relu(self.bn2(self.fc2(x)))
        x = torch.relu(self.bn3(self.fc3(x)))
        x = self.fc4(x)  # Final layer with no activation for regression
        return x