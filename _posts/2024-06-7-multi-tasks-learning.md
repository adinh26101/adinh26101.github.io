---
title: "Multi-Task Learning với R-CNN-based Models"
date: 2024-06-07 10:00:00 +0000
categories: [Machine Learning, Computer Vision]
tags: [Multi-Task Learning, R-CNN, Object Detection, Deep Learning]
author: adinh26101
icon: fas fa-tasks
lang: vi
permalink: /posts/multi-tasks-learning/
---

### Nội dung
- [1. Giới thiệu](#-gioi-thieu)
- [2. Khái niệm Multi-Task Learning](#-khai-niem)
- [3. Ứng dụng trong R-CNN](#-ung-dung-rcnn)

<a name="-gioi-thieu"></a>
## 1. Giới thiệu

**Multi-Task Learning (MTL)** là kỹ thuật học máy giúp mô hình cùng lúc học nhiều nhiệm vụ khác nhau, tận dụng được thông tin chung giữa các nhiệm vụ để cải thiện hiệu suất tổng thể. Trong lĩnh vực phát hiện đối tượng, các mô hình dựa trên **R-CNN** có thể được mở rộng để đồng thời thực hiện các tác vụ như phân loại, phát hiện, phân đoạn, hoặc ước lượng vị trí.

<p>
    <img src="assets/2024-06-7-multi-tasks-learning/multitasks.png" alt="multi-tasks-learning"/>
    <em>kiến trúc multi-tasks</em>
</p>

MTL giúp giảm thiểu overfitting, tăng khả năng tổng quát và tiết kiệm tài nguyên bằng cách chia sẻ đặc trưng giữa các nhiệm vụ. Bài viết này sẽ tập trung vào cách tích hợp MTL vào các mô hình R-CNN để cải thiện hiệu quả trong các ứng dụng thị giác máy tính.

<a name="-khai-niem"></a>
## 2. Khái niệm Multi-Task Learning

Multi-Task Learning là quá trình huấn luyện một mô hình thực hiện đồng thời nhiều nhiệm vụ khác nhau. Thay vì học từng nhiệm vụ riêng lẻ, MTL khai thác mối liên hệ và đặc trưng chung giữa các nhiệm vụ, giúp mô hình học hiệu quả hơn, giảm overfitting và tăng khả năng tổng quát.

Trong MTL, các nhiệm vụ thường chia sẻ phần lớn kiến trúc mạng (như backbone), nhưng có các nhánh riêng biệt cho từng nhiệm vụ để đảm bảo đầu ra phù hợp.

<a name="-ung-dung-rcnn"></a>
## 3. Ứng dụng trong R-CNN

Các mô hình R-CNN được thiết kế theo kiến trúc hai giai đoạn, rất phù hợp để mở rộng cho Multi-Task Learning:

- **Faster R-CNN**: tập trung vào phát hiện (detection) và phân loại đối tượng.
- **Mask R-CNN**: thêm nhiệm vụ phân đoạn (segmentation) pixel-wise ngoài phát hiện.
- **Keypoint R-CNN**: mở rộng thêm nhiệm vụ dự đoán các điểm đặc trưng (keypoints) trên đối tượng.

Cách tiếp cận này tận dụng việc chia sẻ feature backbone và thêm các nhánh đầu ra riêng biệt cho từng nhiệm vụ, giúp mô hình học đồng thời các nhiệm vụ khác nhau trong cùng một framework.

<p>
    <img src="assets/2024-06-7-multi-tasks-learning/rcnn_multitasks.jpg" alt="rcnn-based multi-tasks-learning"/>
    <em>kiến trúc rcnn-based multi-tasks</em>
</p>