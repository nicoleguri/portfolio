import torch
import torch.nn as nn
import torch.optim as optim

# Define the neural network model with even more layers
class Net(nn.Module):
    def __init__(self, X_train_tensor):
        super(Net, self).__init__()
        self.x_train_tensor = X_train_tensor

        self.fc1 = nn.Linear(self.x_train_tensor.shape[1], 128)  # input layer (784) -> hidden layer (128)
        self.fc2 = nn.Linear(128, 128)  # hidden layer (128) -> hidden layer (128)
        self.fc3 = nn.Linear(128, 128)  # hidden layer (128) -> hidden layer (128)
        self.fc4 = nn.Linear(128, 128)  # hidden layer (128) -> hidden layer (128)
        self.fc5 = nn.Linear(128, 128)  # hidden layer (128) -> hidden layer (128)
        self.fc6 = nn.Linear(128, 2)  # hidden layer (128) -> output layer (2) (Binary classification)

    def forward(self, x):
        x = torch.relu(self.fc1(x))  # activation function for hidden layer
        x = torch.relu(self.fc2(x))
        x = torch.relu(self.fc3(x))
        x = torch.relu(self.fc4(x))
        x = torch.relu(self.fc5(x))
        x = self.fc6(x)
        return x