---
title: "Faster R-CNN: Overview"
date: 2024-08-20 10:00:00 +0000
categories: [Machine Learning, Computer Vision]
tags: [Faster R-CNN, Object Detection, Deep Learning]
author: adinh26101
icon: fas fa-eye
lang: en
math: true
permalink: /posts/faster-rcnn/
---

### Contents
- [1. Introduction](#-introduction)
- [2. Architecture of Faster R-CNN](#-architecture)
    - [2.1 CNN Backbone](#-cnn-backbone)
    - [2.2 Region Proposal Network (RPN)](#-rpn)
    - [2.3 RoI Pooling & Classification](#-roi)
- [3. Model Workflow](#-workflow)
- [4. Advantages and Disadvantages](#-advantages-and-disadvantages)
- [5. Training Faster R-CNN (Small Demo)](#-small-demo)
- [6. References](#-references)

<a href="#-introduction" name="-introduction"></a>
## 1. Introduction

**Faster R-CNN** is a state-of-the-art object detection model that combines a Region Proposal Network (RPN) with a detection network to create a fast and accurate detection system. Unlike earlier methods that use manual region proposal algorithms (like *Selective Search*), Faster R-CNN employs a **fully convolutional RPN** to directly generate region proposals from image features. The model shares convolutional layers between the RPN and the detection network, significantly reducing computation costs.

The model consists of two stages:

- **Stage 1:** The RPN proposes candidate regions likely to contain objects.
- **Stage 2:** The classification and regression network uses these proposals to classify objects and refine bounding boxes.

<a href="#-architecture" name="-architecture"></a>
## 2. Architecture of Faster R-CNN

<p>
    <img src="assets/2025-06-1-faster-rcnn/faster-rcnn.png" alt="Faster R-CNN architecture"/>
    <em>Faster R-CNN model architecture</em>
</p>

<a href="#-cnn-backbone" name="-cnn-backbone"></a>
### 2.1 CNN Backbone

The CNN backbone is the main convolutional network used to extract features from the input image. Popular networks like **VGG16** or **ResNet** are used to produce feature maps. These feature maps are shared between the RPN and the final classification network, saving computation.

<a href="#-rpn" name="-rpn"></a>
### 2.2 Region Proposal Network (RPN)

The **RPN** replaces manual region proposal methods such as *Selective Search*. It is a small convolutional network that operates on the feature maps and generates **region proposals**. At each location on the feature map, multiple "anchor boxes" of different scales and aspect ratios are created. The RPN predicts:
- An objectness score (likelihood of containing an object)
- Bounding box coordinates adjustments (bounding box regression)

<a href="#-roi" name="-roi"></a>
### 2.3 RoI Pooling & Classification

Region proposals from the RPN have varying sizes, so **RoI Pooling** is used to normalize them to a fixed size (e.g., 7×7). Then these regions are passed through fully connected layers to:
- Classify the object class within the region
- Refine the bounding box coordinates further (bounding box regression)

<a href="#-workflow" name="-workflow"></a>
## 3. Model Workflow

### 🔹 Stage 1: Region Proposal (RPN)
1. **Input image** is passed through the CNN backbone (VGG16, ResNet, etc.) to generate a **feature map**.
2. **RPN** operates on the feature map to generate **region proposals** — areas likely to contain objects, along with confidence scores and coordinates.

### 🔹 Stage 2: Object Detection
3. Region proposals are used to extract corresponding regions from the feature map, then normalized with **RoI Pooling**.
4. These regions are fed into the **classification and regression network**:
   - Predict the **class label** of the object
   - Refine the **bounding box**
5. The **final output** is a list of bounding boxes with object classes and confidence scores.

<a href="#-advantages-and-disadvantages" name="-advantages-and-disadvantages"></a>
## 4. Advantages and Disadvantages

### ✅ Advantages
- **Faster** than previous methods (e.g., R-CNN, Fast R-CNN) due to integrated RPN and shared feature maps.
- **High accuracy** in object detection.
- **End-to-end training**: easy to optimize the whole model jointly.
- **Flexible**: easy to swap backbones (VGG, ResNet...) or incorporate new improvements.

### ❌ Disadvantages
- **Not real-time on CPU**, needs GPU for faster speed (~5fps with VGG-16).
- **More complex to implement** compared to one-stage detectors like YOLO or SSD.
- **Not optimized for mobile devices** due to large model size.

<a href="#-small-demo" name="-small-demo"></a>
## 5. Training Faster R-CNN (Small Demo)

**Download source code**

- [faster_rcnn_demo.ipynb](/assets/2025-06-1-faster-rcnn/faster_rcnn_demo.ipynb)
<iframe src="/assets/2025-06-1-faster-rcnn/faster_rcnn_demo.html" width="100%" height="600px"></iframe>

<a href="#-references" name="-references"></a>
## 6. References
[1] S. Ren, K. He, R. Girshick, J. Sun. *Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks*. arXiv:1506.01497v3 [cs.CV], 2016.  🔗 [https://arxiv.org/abs/1506.01497](https://arxiv.org/abs/1506.01497)