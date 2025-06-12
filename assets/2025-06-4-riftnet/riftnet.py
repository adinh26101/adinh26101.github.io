import torch
import torch.nn as nn
import torch.nn.functional as F

class DCC(nn.Module):
    def __init__(self, dilation, kernel_size, filters, in_channels=None):
        super(DCC, self).__init__()
        self.kernel_size = kernel_size
        self.dilation = dilation
        self.filters = filters

        # Default in_channels = filters unless overridden
        self.in_channels = in_channels if in_channels is not None else filters

        # padding = ((kernel_size - 1) // 2) * dilation
        padding = 0
        self.conv = nn.Conv1d(
            self.in_channels,
            self.filters,
            kernel_size,
            padding=padding,
            dilation=dilation
        )
        self.bn = nn.BatchNorm1d(self.filters)
        self.relu = nn.ReLU()

    def forward(self, x):
        return self.relu(self.bn(self.conv(x)))


class ConvBN(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size):
        super(ConvBN, self).__init__()
        # padding = kernel_size // 2  # Preserve length
        padding = 0
        self.block = nn.Sequential(
            nn.Conv1d(in_channels, out_channels, kernel_size, padding=padding),
            nn.BatchNorm1d(out_channels)
        )

    def forward(self, x):
        return self.block(x)
    
class ConvBNPool(nn.Module):
    def __init__(self, kernel_size, channels, pooling=None):
        super(ConvBNPool, self).__init__()
        # Repeating ConvBN layers and pooling 3 times
        self.block = nn.Sequential(
            ConvBN(channels, channels, kernel_size),
            nn.ReLU(),
            ConvBN(channels, channels, kernel_size),
            pooling if pooling else nn.AvgPool1d(kernel_size, ceil_mode=True),

            ConvBN(channels, channels, kernel_size),
            nn.ReLU(),
            ConvBN(channels, channels, kernel_size),
            pooling if pooling else nn.AvgPool1d(kernel_size, ceil_mode=True),

            ConvBN(channels, channels, kernel_size),
            nn.ReLU(),
            ConvBN(channels, channels, kernel_size),
            pooling if pooling else nn.AvgPool1d(kernel_size, ceil_mode=True),
        )

    def forward(self, x):
        return self.block(x)
    
class LeftBranch(nn.Module):
    def __init__(self):
        super(LeftBranch, self).__init__()
        self.first_dcc = DCC(dilation=1, kernel_size=2, filters=100, in_channels=2)
        
        self.dcc_blocks = nn.ModuleList([
            DCC(2, 4, 100),
            DCC(4, 4, 100),
            DCC(8, 4, 100),
            DCC(16, 4, 100),
            DCC(32, 4, 100),
            DCC(64, 4, 100),
            DCC(128, 4, 100),
            DCC(256, 4, 100),
        ])

        self.relu_bn = nn.Sequential(
            nn.ReLU(),
            nn.BatchNorm1d(100)
        )

        self.post_block = ConvBNPool(kernel_size=8, channels=100)

    def forward(self, x):
        x = self.first_dcc(x)
        residual = x
        for block in self.dcc_blocks:
            x = block(x)

        # Ensure the length is the same for both x and residual
        min_len = min(x.size(-1), residual.size(-1))
        x = x[..., :min_len]
        residual = residual[..., :min_len]

        x = x + residual
        x = self.relu_bn(x)
        x = self.post_block(x)
        return x

class RightBranch(nn.Module):
    def __init__(self):
        super(RightBranch, self).__init__()
        self.first_dcc = DCC(dilation=1, kernel_size=4, filters=50, in_channels=2)

        dcc_block = nn.Sequential(
            DCC(2, 8, 50),
            DCC(4, 8, 50),
            DCC(8, 8, 50),
            DCC(16, 8, 50),
            DCC(32, 8, 50)
        )

        # Repeating right branch layers 10 times
        self.dcc_stack = nn.ModuleList([dcc_block] * 1)

        self.conv_stack = ConvBNPool(kernel_size=4, channels=50, pooling=nn.MaxPool1d(kernel_size=2, ceil_mode=True))

        # Final pooling layer
        self.avg_pool = nn.AvgPool1d(kernel_size=10, ceil_mode=True)

    def forward(self, x):
        x = self.first_dcc(x)
        for layer in self.dcc_stack:
            x = layer(x)
        x = self.conv_stack(x)
        x = self.avg_pool(x)
        return x
    
class RiftNet(nn.Module):
    def __init__(self, num_classes):
        super(RiftNet, self).__init__()
        self.left = LeftBranch()
        self.right = RightBranch()
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(400, 128),
            nn.ReLU(),
            nn.Linear(128, num_classes),
            nn.Softmax(dim=1)
        )

    def forward(self, x_long, x_short):
        x_left = self.left(x_long)     # From 16us IQ samples
        x_right = self.right(x_short)  # From 2.5us IQ samples
        # print(x_left.shape, x_right.shape)

        x_left = torch.flatten(x_left, start_dim=1)
        x_right = torch.flatten(x_right, start_dim=1)
        
        x = torch.cat([x_left, x_right], dim=1)
        return self.classifier(x)