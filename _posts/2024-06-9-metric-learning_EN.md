---
title: "Metric Learning: Learning Distances in Feature Space"
date: 2024-06-09 10:00:00 +0000
categories: [Machine Learning]
tags: [Metric Learning, Distance Learning, Deep Learning]
author: adinh26101
icon: fas fa-ruler
lang: en
permalink: /posts/metric-learning/
---

### Contents
- [1. Introduction](#-introduction)
- [2. What is Metric Learning](#-what-is-metric-learning)
- [3. Applications of Metric Learning](#-applications)

<a name="-introduction"></a>
## 1. Introduction

**Metric Learning** is a machine learning technique that aims to learn a distance function so that samples from the same class are closer together, while samples from different classes are farther apart in the feature space.

<p>
    <img src="assets/2024-06-9-metric-learning/metric-learning.png" alt="metric-learning"/>
    <em>Illustration of metric learning: distinguishing distances in embedding space</em>
</p>

This technique plays an important role in tasks such as recognition, classification, and similarity search.

<a name="-what-is-metric-learning"></a>
## 2. What is Metric Learning

Metric Learning learns a distance function or an embedding space where the distance between points with the same label is smaller than the distance between points with different labels.

Popular methods include:

- Contrastive loss  
- Triplet loss  
- N-pair loss  

<a name="-applications"></a>
## 3. Applications of Metric Learning

- Face recognition  
- Image retrieval  
- Few-shot learning  
- Speaker verification  
- Radio frequency fingerprint classification. Part 1 where I train [RiftNet](/posts/riftnet) is here, and Part 2 about the openset problem will be updated later.  
- And many other applications...

<p>
    <img src="assets/2024-06-9-metric-learning/rff.jpg" alt="metric-applications"/>
    <em>Example of metric learning application in signal recognition</em>
</p>