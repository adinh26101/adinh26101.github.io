---
title: "Confusion Matrix: Tổng Quan và Ứng Dụng"
date: 2025-06-05 10:00:00 +0000
categories: [Machine Learning, Evaluation Metrics]
tags: [Confusion Matrix, Classification, Model Evaluation]
author: adinh26101
icon: fas fa-chart-bar
lang: vi
math: true
permalink: /posts/confusion-matrix/
---

### Nội dung
- [1. Giới thiệu](#-gioi-thieu)
- [2. Khái niệm Confusion Matrix](#-khai-niem)
- [3. Các thành phần trong Confusion Matrix](#-cac-thanh-phan)
- [4. Các chỉ số đánh giá từ Confusion Matrix](#-chi-so-danh-gia)
    - [4.1 Accuracy](#-accuracy)
    - [4.2 Precision](#-precision)
    - [4.3 Recall](#-recall)
    - [4.4 F1-Score](#-f1-score)
- [5. Ứng dụng Confusion Matrix trong bài toán phân loại](#-ung-dung)
- [6. Tham khảo](#-tham-khao)

<a name="-gioi-thieu"></a>  
## 1. Giới thiệu

Confusion Matrix là một công cụ giúp đánh giá hiệu quả của mô hình phân loại. Nó cho biết mô hình dự đoán đúng sai như thế nào trên từng loại nhãn.

<a name="-khai-niem"></a>  
## 2. Khái niệm Confusion Matrix

Confusion Matrix là bảng thể hiện số lượng dự đoán đúng và sai giữa nhãn thật và nhãn dự đoán của mô hình.

<a name="-cac-thanh-phan"></a>  
## 3. Các thành phần trong Confusion Matrix

Trong bài toán phân loại nhị phân, Confusion Matrix gồm 4 phần chính:

- **True Positive (TP):** Dự đoán đúng nhãn Positive  
- **True Negative (TN):** Dự đoán đúng nhãn Negative  
- **False Positive (FP):** Dự đoán sai nhãn Positive (thực ra là Negative)  
- **False Negative (FN):** Dự đoán sai nhãn Negative (thực ra là Positive)  

<a name="-chi-so-danh-gia"></a>  
## 4. Các chỉ số đánh giá từ Confusion Matrix

<a name="-accuracy"></a>  
### 4.1 Accuracy  
Tỉ lệ dự đoán đúng trên tổng số mẫu:  
$$
\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}
$$

<a name="-precision"></a>  
### 4.2 Precision  
Tỉ lệ dự đoán đúng trong số mẫu dự đoán là Positive:  
$$
\text{Precision} = \frac{TP}{TP + FP}
$$

<a name="-recall"></a>  
### 4.3 Recall  
Tỉ lệ dự đoán đúng trong số mẫu thật là Positive:  
$$
\text{Recall} = \frac{TP}{TP + FN}
$$

<a name="-f1-score"></a>  
### 4.4 F1-Score  
Là trung bình harmonic của Precision và Recall:  
$$
\text{F1} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}
$$

<a name="-ung-dung"></a>  
## 5. Ứng dụng Confusion Matrix trong bài toán phân loại

Giả sử bài toán phân loại nhị phân có kết quả như sau:

| Mẫu | Ground truth | Predicted   |
|------|-----------|-----------|
| 1000 | Positive  | Positive  |
| 200  | Positive  | Negative  |
| 1500 | Negative  | Negative  |
| 300  | Negative  | Positive  |

Tính được:

- TP = 1000  
- TN = 1500  
- FP = 300  
- FN = 200  

<p>
    <img src="assets/2025-06-5-confusion-matrix/vi-du.png" alt="Ma trận nhầm lẫn"/>
</p>

Các chỉ số:

$$
\text{Accuracy} = \frac{1000 + 1500}{1000 + 1500 + 300 + 200} = \frac{2500}{3000} = 0.8333
$$

$$
\text{Precision} = \frac{1000}{1000 + 300} = \frac{1000}{1300} \approx 0.7692
$$

$$
\text{Recall} = \frac{1000}{1000 + 200} = \frac{1000}{1200} \approx 0.8333
$$

$$
\text{F1} = 2 \times \frac{0.7692 \times 0.8333}{0.7692 + 0.8333} \approx 0.8000
$$

<a href="#-tham-khao" name="-tham-khao"></a>  
## 6. Tham khảo  
[1] Scikit-learn Developers. *sklearn.metrics.confusion_matrix — scikit-learn 1.4.2 documentation*. 🔗 [https://scikit-learn.org/stable/modules/generated/sklearn.metrics.confusion_matrix.html](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.confusion_matrix.html)