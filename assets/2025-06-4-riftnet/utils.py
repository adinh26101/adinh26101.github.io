import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from scipy.signal import hilbert
from sklearn.preprocessing import LabelEncoder

import matplotlib.pyplot as plt
from torch.utils.data import Dataset

def format_model_name(string_list):
    return "_".join(s for s in string_list)

def list_to_dict_with_indices(lst):
    result = {}
    for index, value in enumerate(lst):
        if value not in result:
            result[value] = []
        result[value].append(index)
    return result

class RFFDataset(Dataset):
    def __init__(self, file_paths, labels, transform=None):
        self.file_paths = file_paths
        self.labels = labels
        self.transform = transform
        self.model_indices = list_to_dict_with_indices(self.labels)

    def model_names(self):
        """Returns the total number of samples."""
        return set(self.model_indices.keys())

    def __len__(self):
        """Returns the total number of samples."""
        return len(self.file_paths)

    def __getitem__(self, idx):
        """Retrieves the data at index `idx`."""
        file_path = self.file_paths[idx]
        label = self.labels[idx]

        with open(file_path, 'r') as f:
            data = np.array([float(line.strip()) for line in f])

        if self.transform:
            data = self.transform(data)
            
        if idx == 663: # inverse case
            data = data[::-1]

        return data, label
    
# ----- Preprocessing -----
def preprocess_signal(signal, start_fn, analytic_fn):
    start_point = start_fn(signal)
    IQ = analytic_fn(signal[start_point:])
    i = np.real(IQ)
    q = np.imag(IQ)
    iq_tensor = np.stack([i, q], axis=0)
    return torch.tensor(iq_tensor, dtype=torch.float32)

# ----- Label Encoding -----
def encode_labels(dataset):
    y_all = [label for _, label in dataset]
    le = LabelEncoder()
    y_encoded = le.fit_transform(y_all)
    encoded_dataset = [(dataset[i][0], y_encoded[i]) for i in range(len(dataset))]
    return encoded_dataset, le

def analytic_signal(X):
    return hilbert(X)

def resample_signal(signal, target_length):
    original_indices = np.linspace(0, 1, len(signal))
    target_indices = np.linspace(0, 1, target_length)
    resampled = np.interp(target_indices, original_indices, signal)
    return resampled

class IQDataset(Dataset):
    def __init__(self, raw_dataset, analytic_fn, long_len=4000, short_len=625):
        self.data = raw_dataset
        self.analytic_fn = analytic_fn
        self.long_len = long_len
        self.short_len = short_len

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        signal, label = self.data[idx]
        IQ = self.analytic_fn(signal)

        # Split into long and short segments
        long_IQ = resample_signal(IQ, self.long_len)
        short_IQ = resample_signal(IQ, self.short_len)
        # Extract real and imaginary parts into 2 channels
        long_tensor = torch.tensor(
            np.stack([np.real(long_IQ), np.imag(long_IQ)], axis=0),
            dtype=torch.float32
        )
        short_tensor = torch.tensor(
            np.stack([np.real(short_IQ), np.imag(short_IQ)], axis=0),
            dtype=torch.float32
        )

        return long_tensor, short_tensor, label