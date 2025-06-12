---
title: "Faster R-CNN: Tổng Quan"
date: 2024-08-20 10:00:00 +0000
categories: [Machine Learning, Computer Vision]
tags: [Faster R-CNN, Object Detection, Deep Learning]
author: adinh26101
icon: fas fa-eye
lang: vi
math: true
permalink: /posts/faster-rcnn/
---

### Nội dung
- [1. Giới thiệu](#-gioi-thieu)
- [2. Kiến trúc của Faster R-CNN](#-kien-truc)
    - [2.1 CNN backbone](#-cnn-backbone)
    - [2.2 Region Proposal Network (RPN)](#-rpn)
    - [2.3 RoI Pooling & Classification](#-roi)
- [3. Luồng hoạt động của mô hình](#-luong-hoat-dong)
- [4. Ưu điểm và nhược điểm](#-uu-diem-va-nhuoc-diem)
- [5. Các cải tiến liên quan](#-cai-tien)
    - [5.1 Mask R-CNN](#-mask-rcnn)
    - [5.2 Cascade R-CNN](#-cascade-rcnn)
- [6. Ứng dụng trong thực tế](#-ung-dung)
- [7. Tham khảo](#-tham-khao)

<a href="#-gioi-thieu" name="-gioi-thieu"></a>
## 1. Giới thiệu
*(Tóm tắt ngắn về Faster R-CNN, lịch sử ra đời, vai trò trong bài toán phát hiện đối tượng)*

<a href="#-kien-truc" name="-kien-truc"></a>
## 2. Kiến trúc của Faster R-CNN

<a href="#-cnn-backbone" name="-cnn-backbone"></a>
### 2.1 CNN backbone
*(VGG16, ResNet... dùng để trích xuất đặc trưng)*

<a href="#-rpn" name="-rpn"></a>
### 2.2 Region Proposal Network (RPN)
*(Sinh đề xuất vùng thay vì dùng Selective Search như trước)*

<a href="#-roi" name="-roi"></a>
### 2.3 RoI Pooling & Classification
*(Chuẩn hóa kích thước và phân loại vùng chứa đối tượng)*

<a href="#-luong-hoat-dong" name="-luong-hoat-dong"></a>
## 3. Luồng hoạt động của mô hình
*(Diễn giải quy trình: Input → Backbone → RPN → RoI → Kết quả)*

<a href="#-uu-diem-va-nhuoc-diem" name="-uu-diem-va-nhuoc-diem"></a>
## 4. Ưu điểm và nhược điểm
- Ưu: Nhanh hơn R-CNN, chính xác cao, end-to-end
- Nhược: Vẫn chậm hơn các mô hình hiện đại, khó triển khai real-time

<a href="#-cai-tien" name="-cai-tien"></a>
## 5. Các cải tiến liên quan

<a href="#-mask-rcnn" name="-mask-rcnn"></a>
### 5.1 Mask R-CNN
*(Thêm nhánh segmentation)*

<a href="#-cascade-rcnn" name="-cascade-rcnn"></a>
### 5.2 Cascade R-CNN
*(Cải thiện box refinement qua nhiều bước)*

<a href="#-ung-dung" name="-ung-dung"></a>
## 6. Ứng dụng trong thực tế
*(Camera giám sát, xe tự lái, y tế, nông nghiệp thông minh, v.v.)*

<a href="#-tham-khao" name="-tham-khao"></a>
## 7. Tham khảo
- Ren et al., *Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks*, 2015.
- Papers with Code: https://paperswithcode.com/paper/faster-r-cnn