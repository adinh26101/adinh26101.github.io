---
title: "RiftNet: Application of RiftNet for Signal Classification"
date: 2025-06-04 10:00:00 +00
categories: [Machine Learning]
tags: [RiftNet, Signal Processing, Deep Learning, Radio Frequency Fingerprinting]
author: adinh26101
icon: fas fa-wave-square
lang: en
math: true
permalink: /posts/riftnet
---

### Contents
- [1. Introduction](#-introduction)
- [2. RiftNet Architecture](#-riftnet-architecture)
    - [2.1 Two Signal Processing Branches](#-two-signal-processing-branches)
    - [2.2 Dilated Convolutional Cells (DCC)](#-dilated-convolutional-cells-dcc)
    - [2.3 Skip Connections and Feature Aggregation](#-skip-connections-and-feature-aggregation)
    - [2.4 Final Classification Layer](#-final-classification-layer)
- [3. RiftNet Model Workflow](#-riftnet-model-workflow)
- [4. Advantages and Limitations](#-advantages-and-limitations)
- [5. Training and Model Evaluation](#-training-and-model-evaluation)
- [6. Applications and Development Potential](#-applications-and-development-potential)
- [7. References](#-references)

<a name="-introduction"></a>
## 1. Introduction

RiftNet is a deep learning model designed for classification and identification of devices based on radio frequency (RF) signals. In the fast-growing wireless network landscape, security and device identification are major challenges. Radio Frequency Fingerprinting (RFF) techniques help recognize devices by their unique signal characteristics, and RiftNet leverages deep learning methods to improve identification accuracy.

<a name="-riftnet-architecture"></a>
## 2. RiftNet Architecture

RiftNet consists of two parallel signal processing branches to capture features at different time scales.

<p>
    <img src="assets/2025-06-4-riftnet/riftnet.png" alt="RiftNet model architecture"/>
    <em>RiftNet model architecture</em>
</p>

<a name="-two-signal-processing-branches"></a>  
### 2.1 Two Signal Processing Branches  

The RiftNet model has two separate branches to exploit multi-scale temporal features of RF signals:

- **Left branch** takes a 16μs long signal segment, allowing the model to capture long-term features such as slow variations, overall waveform structure, or stable device characteristics. This branch analyzes signals over a wider time range, enhancing overall recognition capability.

- **Right branch** processes a shorter 4μs segment focusing on short-term features, capturing fast changes, fine wave patterns, and subtle details potentially missed in longer segments. This branch helps the model grasp higher-detail signal features.

The parallel combination allows RiftNet to utilize multi-level information from both long- and short-term samples, improving the discrimination of transmitting devices effectively.

---

<a name="-dilated-convolutional-cells-dcc"></a>  
### 2.2 Dilated Convolutional Cells (DCC)  

Each branch uses Dilated Convolutional Cells (DCC) — 1D convolutional layers with dilation applied to kernels.

- **Dilation** expands the receptive field of neurons without increasing kernel size or reducing resolution. This lets the model learn features at various temporal scales, from fine details to broader patterns.

- In RiftNet, stacked DCC blocks with increasing dilation rates (1, 2, 4, 8, 16, ...) capture signal information across multiple time scales, enhancing rich and accurate feature extraction.

---

<a name="-skip-connections-and-feature-aggregation"></a>  
### 2.3 Skip Connections and Feature Aggregation  

To prevent information loss in deep networks, RiftNet employs skip connections.

- Intermediate outputs from DCC blocks are connected via skip connections to preserve important features and improve gradient flow during training.

- Aggregating features from multiple layers helps the model converge better and capture diverse signal characteristics.

---

<a name="-final-classification-layer"></a>  
### 2.4 Final Classification Layer  

After feature extraction and aggregation from both branches, the feature vectors are concatenated and fed into the final classification layer.

- This layer is typically a fully connected network with hidden layers, ReLU activations, and a softmax output to predict the transmitting device label.

- This setup allows accurate discrimination of devices based on learned RF signal features.

---

<a name="-riftnet-model-workflow"></a>  
## 3. RiftNet Model Workflow  

1. **Preprocessing:** Split input signals into two segments: 16μs and 4μs.  
2. **Feature Extraction:** Parallel left and right branches process these segments through DCC blocks with different dilations.  
3. **Aggregation:** Skip connections combine features from multiple DCC layers to retain multi-scale information.  
4. **Classification:** Concatenate features from both branches and classify the device label.

---

<a name="-advantages-and-limitations"></a>  
## 4. Advantages and Limitations

**Advantages:**  
- Effectively captures both long-term and short-term signal features.  
- DCC expands the receptive field without losing detail.  
- Skip connections preserve important information throughout the network.

**Limitations:**  
- Requires large and diverse datasets for effective training.  
- Model complexity demands significant computational resources.

---

<a name="-training-and-model-evaluation"></a>  
## 5. Training and Model Evaluation

The dataset used in the study is Bluetooth signals collected at a sampling rate of 250 Msps. The dataset, published by Emre Uzundurukan et al. on Zenodo ([dataset link](https://zenodo.org/records/3876140)), contains signals from 13 Bluetooth devices across 5 brands, with around 150 signals per device, totaling nearly 1950 records. The data is split into 80% for training and 20% for testing.

<p>
    <img src="assets/2025-06-4-riftnet/dataset.png" alt="Bluetooth devices in 250 Msps dataset"/>
    <em>List of Bluetooth devices in the 250 Msps dataset</em>
</p>

**Download source code**  
- [riftnet.py](/assets/2025-06-4-riftnet/riftnet.py)  
- [utils.py](/assets/2025-06-4-riftnet/utils.py)  
- [riftnet.ipynb](/assets/2025-06-4-riftnet/riftnet.ipynb)  

<iframe src="/assets/2025-06-4-riftnet/riftnet.html" width="100%" height="600px"></iframe>

Training uses data augmentation and classification loss optimization techniques. RiftNet training results show fast and stable convergence, with loss dropping sharply in early epochs and stabilizing later, indicating effective feature learning early in training.

Classification performance on both training and testing sets steadily improves across epochs, demonstrating strong deep learning ability and generalization. The best result occurs at epoch 40 with training accuracy of 98.5% and test accuracy of 96.44%.

However, test performance shows slight fluctuations between epochs, possibly due to the small and less diverse test set, causing the model to be sensitive to distribution shifts.

---

<a name="-applications-and-development-potential"></a>  
## 6. Applications and Development Potential

RiftNet can be applied in IoT network security, enabling reliable device identification and detection of unauthorized devices. Future improvements aim to enhance generalization and identify previously unseen devices, strengthening wireless network protection.

<a name="-references"></a>  
## 7. References

[1] Emre Uzundurukan, Yaser Dalveren, and Ali Kara. A database for the radio frequency fingerprinting of bluetooth devices. *Data*, 5(2):55, 2020. 🔗 [https://www.mdpi.com/2306-5729/5/2/55](https://www.mdpi.com/2306-5729/5/2/55)

[2] Josh Robinson and Scott Kuzdeba. Riftnet: Radio frequency classification for large populations. In *2021 IEEE 18th Annual Consumer Communications & Networking Conference (CCNC)*, pages 1–6, IEEE, 2021. 🔗 [https://ieeexplore.ieee.org/document/9369455/](https://ieeexplore.ieee.org/document/9369455/)