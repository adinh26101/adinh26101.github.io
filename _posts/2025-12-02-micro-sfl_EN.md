---
title: "Microservice-Oriented Split Federated Learning with Efficient Gradient Synchronization"
date: 2025-02-12 10:00:00 +0000
categories: [Deep Learning, Split Federated Learning, Docker, Microservice]
tags: [Deep Learning, Split Federated Learning, Docker, Microservice, Split Learning, GPU Container, File-Based Gradient, Synchronous]
author: adinh26101
icon: fas fa-ruler
lang: en
permalink: /posts/micro-sfl/
math: true
pin: true
---

### Contents
- [1. Introduction](#-introduction)
- [2. Split Federated Learning: Forward and Backward Analysis](#-forward-backward)
- [3. File-based Method for Parallel Processing and Stable Gradient Transmission](#-file-based)
- [4. Microservice Architecture for Split Federated Learning](#-microservice)

<a name="-introduction"></a>
## 1. Introduction

Federated Learning is a distributed collaborative machine learning approach that enables model training without sharing raw user data. It was introduced by the Google research team led by Brendan McMahan in the seminal 2016 paper *“Communication-Efficient Learning of Deep Networks from Decentralized Data”*. Since then, Federated Learning has become a prominent topic due to its strong privacy-preserving and distributed training capabilities.

Split Federated Learning (SFL) is a variant of Federated Learning proposed by Chandra Thapa et al. in the paper *“SplitFed: When Federated Learning Meets Split Learning”* (AAAI 2022). This work formally defined SFL as a hybrid of Split Learning and Federated Learning. SFL’s key advantage lies in splitting the model to reduce client-side computation, making it suitable for resource-constrained devices that cannot run large models.

Although recent research has attempted to optimize SFL for better performance and real-world deployment, certain limitations remain — particularly the need for graph retention during backward computation. In this article, I propose a new weight-update method along with a microservice architecture that allows SFL to be deployed efficiently in practical or cloud environments.

![Split Federated Learning Process](assets/2025-12-02-micro-sfl/sfl_base_process.gif)
*Split Federated Learning process*

Split Federated Learning (SFL) combines Federated Learning and Split Learning by dividing the model into two components: a **client encoder** with weights $W_c$ and a **server backbone** with weights $W_s$. Each client processes local data through its encoder $f_c(x; W_c)$ to produce intermediate activations $h$, sends them to the server for forward computation, and receives gradients for local updates. During training, each client updates only $W_c$, while the server updates $W_s$ using aggregated gradients. The split training pipeline can be expressed as:

$$
f(x; W) = f_s\big(f_c(x; W_c); W_s\big), 
\qquad W = \{W_c, W_s\}.
$$

![Split Federated Learning Config](assets/2025-12-02-micro-sfl/split_setting.jpg)
*Split Learning architecture where labels remain entirely on the client side*

This structure reduces client workload, preserves data privacy, and scales well in distributed settings.

<a name="-forward-backward"></a>
## 2. Split Federated Learning: Forward and Backward Analysis

**Notation**
- **$ x_j^i \in \mathbb{R}^d $**: the $j$-th input sample of client $i$, where $j = 1,\dots,n^i$ and $i = 1,\dots,M$.
- **$f_c$**: client encoder producing activation $h \in \mathbb{R}^{d_c}$.
- **$f_s(\mathbf{W}_s)$**: server forward module producing output $z \in \mathbb{R}^{d_s}$.
- **$f_h(\mathbf{W}_c)$**: client-side head producing prediction $\hat{y} \in \mathbb{R}^C$.
- **$y$**: ground truth label; loss is $\ell = L(\hat{y}, y)$.

---

**Forward pass**

The input $x_j^i$ passes through the client encoder, server backbone, and client head to produce predictions and losses:

$$
x_j^i \xrightarrow{f_c} h_j^i 
\xrightarrow{f_s(\mathbf{W}_s)} z_j^i 
\xrightarrow{f_h(\mathbf{W}_c^i)} \hat{y}_j^i,
\qquad
\ell_j^i = L(\hat{y}_j^i, y_j^i)
$$

---

**Backward pass**

Client head gradient:

$$
\mathbf{g}_{c,j}^i = \frac{\partial \ell_j^i}{\partial \mathbf{W}_c^i}
$$

Gradient returned to the server:

$$
\delta_j^i = \frac{\partial \ell_j^i}{\partial z_j^i}
$$

Server backbone gradient:

$$
\mathbf{g}_{s,j}^i 
= \frac{\partial \ell_j^i}{\partial \mathbf{W}_s}
= \delta_j^i \cdot \frac{\partial z_j^i}{\partial \mathbf{W}_s}
$$

>💡 **Note:** To update the server backbone, the server only needs two things:  
> (1) the gradient $$\delta_j^i = \frac{\partial \ell_j^i}{\partial z_j^i}$$ returned from the client,  
> (2) the Jacobian $$\frac{\partial z_j^i}{\partial \mathbf{W}_s}$$ computed locally since the server owns $f_s$.  
> Combining both via chain rule gives $$\mathbf{g}_{s,j}^i = \delta_j^i \cdot \frac{\partial z_j^i}{\partial \mathbf{W}_s}.$$

---

**Batch-wise and Parallel Updates**

Client head update:

$$
\mathbf{W}_c^i \leftarrow 
\mathbf{W}_c^i 
- \eta \frac{\sum_{j=1}^{n^i} \mathbf{g}_{c,j}^i}{n^i}
$$

Server backbone update:

$$
\mathbf{W}_s \leftarrow 
\mathbf{W}_s 
- \eta \frac{\sum_{i=1}^{M} \sum_{j=1}^{n^i} \mathbf{g}_{s,j}^i}{\sum_{i=1}^{M} n^i}
$$

---

**Federated Aggregation**

$$
\mathbf{W}_c^{\text{fed}}
=
\sum_{i=1}^{M}
\frac{n^i}{\sum_{i=1}^{M} n^i}
\mathbf{W}_c^i
$$

Weights are then redistributed to all clients.

<a name="-file-based"></a>
## 3. File-based Method for Parallel Processing and Stable Gradient Transmission

As analyzed above, to compute the gradient for each batch, the server only needs:  
(1) the forward output $$z_j^i$$, and  
(2) the gradient $$\delta_j^i = \frac{\partial \ell_j^i}{\partial z_j^i}$$ returned by the client.

Thus, after computing $$z_j^i$$, the server can store this value as a file and send it back to the client. When the corresponding $$\delta_j^i$$ arrives, the server reads the file and computes the gradient for the backbone. To avoid file conflicts in parallel environments, each forward pass is assigned a unique UUID4. This eliminates the need to retain computational graphs on the server, removing a major bottleneck in backward computation.

![File-based gradient for Split Federated Learning](assets/2025-12-02-micro-sfl/sfl_propose_process.gif)
*SFL architecture using a file-based mechanism to safely store activations without retaining graphs*

<a name="-microservice"></a>
## 4. Microservice Architecture for Split Federated Learning

The diagram below illustrates the components of the system. In addition to client, split server, and federated server, a backend is added to orchestrate the training workflow, along with a database for metadata and a dashboard for real-time monitoring.

![System Components](assets/2025-12-02-micro-sfl/system_component.png)
*System components*

The backend listens to other services and coordinates the training process. A global round for each client proceeds as follows:

![One Global Round Process](assets/2025-12-02-micro-sfl/one_global_round_process.jpg)
*One global training round*

The file-based gradient update mechanism allows the split server to store only its weights and perform forward/inference. Updates are computed by averaging gradient files. As the number of clients increases, gradients can be stored in a shared storage service, turning the split server into a stateless component and enabling horizontal scaling:

![Scale Horizontal](assets/2025-12-02-micro-sfl/scale_horizontal.jpg)
*SFL horizontal scaling*

Additionally, GPU-enabled containers can be used to accelerate compute-intensive services. In my experiment setup, I used Windows with NVIDIA driver, CUDA Toolkit, NVIDIA Container Toolkit, and the image `pytorch/pytorch:2.2.2-cuda12.1-cudnn8-devel`. The architecture is shown below:

![GPU Container Architecture](assets/2025-12-02-micro-sfl/gpu_container_architecture.jpg)
*GPU container architecture*

You can read more and explore the experimental results in the paper: [here]().

The code used in the experiments is available at:  
**[https://github.com/frogdance/MicroSFL](https://github.com/frogdance/MicroSFL)**.
