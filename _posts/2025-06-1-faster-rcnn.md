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
- [5. Huấn luyện Faster R-CNN (Demo nhỏ)](#-demo-nho)
- [6. Tham khảo](#-tham-khao)

<a href="#-gioi-thieu" name="-gioi-thieu"></a>
## 1. Giới thiệu

**Faster R-CNN** là một mô hình phát hiện đối tượng hiện đại, kết hợp mạng đề xuất vùng (*Region Proposal Network - RPN*) với mạng phát hiện để tạo ra hệ thống phát hiện nhanh và chính xác. Khác với các phương pháp trước sử dụng thuật toán tạo vùng thủ công (như *Selective Search*), Faster R-CNN sử dụng **RPN**, một mạng tích chập hoàn toàn (*fully convolutional*), để sinh ra các vùng đề xuất trực tiếp từ đặc trưng hình ảnh. Mô hình chia sẻ các tầng tích chập giữa RPN và mạng phát hiện, giúp giảm chi phí tính toán đáng kể.

Mô hình gồm hai giai đoạn:

- **Stage 1:** RPN đề xuất các vùng tiềm năng có thể chứa vật thể trong ảnh.
- **Stage 2:** Mạng phân loại và hồi quy sử dụng các vùng được đề xuất để xác định nhãn lớp và tinh chỉnh hộp bao cho chính xác.

<a href="#-kien-truc" name="-kien-truc"></a>
## 2. Kiến trúc của Faster R-CNN

<p>
    <img src="assets/2025-06-1-faster-rcnn/faster-rcnn.png" alt="kiến trúc mô hình faster rcnn"/>
    <em>kiến trúc mô hình faster rcnn</em>
</p>

<a href="#-cnn-backbone" name="-cnn-backbone"></a>
### 2.1 CNN backbone

CNN backbone là mạng tích chập chính được dùng để trích xuất đặc trưng từ ảnh đầu vào. Các mạng phổ biến như **VGG16** hoặc **ResNet** được sử dụng để tạo ra bản đồ đặc trưng (*feature map*). Các đặc trưng này sau đó được chia sẻ giữa cả RPN và mạng phân loại cuối cùng, giúp tiết kiệm chi phí tính toán.

<a href="#-rpn" name="-rpn"></a>
### 2.2 Region Proposal Network (RPN)

**RPN** là thành phần thay thế các phương pháp tạo vùng thủ công như *Selective Search*. Nó là một mạng tích chập nhỏ hoạt động trên bản đồ đặc trưng và sinh ra các **vùng đề xuất (region proposals)**. Mỗi vị trí trên bản đồ đặc trưng sẽ sinh ra nhiều "anchor boxes" với các tỷ lệ và kích thước khác nhau. RPN dự đoán:
- Mức độ có khả năng chứa vật thể (objectness score)
- Toạ độ biên dạng của hộp (bounding box regression)

<a href="#-roi" name="-roi"></a>
### 2.3 RoI Pooling & Classification

Các vùng đề xuất từ RPN có kích thước không đồng nhất, nên cần được chuẩn hoá bằng **RoI Pooling** để có kích thước cố định (ví dụ 7×7). Sau đó, các vùng này được đưa qua các tầng fully connected để:
- Phân loại vùng đó là thuộc lớp nào (classification)
- Điều chỉnh lại bounding box cho chính xác hơn (bounding box regression)

<a href="#-luong-hoat-dong" name="-luong-hoat-dong"></a>
## 3. Luồng hoạt động của mô hình

### 🔹 Stage 1: Region Proposal (RPN)
1. **Ảnh đầu vào** được đưa qua CNN backbone (VGG16, ResNet...) để tạo ra **feature map**.
2. **RPN** hoạt động trên feature map để sinh ra các **region proposals** – vùng có khả năng chứa vật thể, kèm theo điểm tin cậy và tọa độ.

### 🔹 Stage 2: Object Detection
3. Các **region proposals** được sử dụng để trích xuất vùng tương ứng từ feature map và chuẩn hóa kích thước bằng **RoI Pooling**.
4. Các vùng này được đưa qua **mạng con phân loại và hồi quy**:
   - Xác định **nhãn lớp** của đối tượng
   - Tinh chỉnh lại **bounding box**
5. **Kết quả đầu ra** là danh sách các bounding box chứa vật thể, kèm nhãn và độ tin cậy.

<a href="#-uu-diem-va-nhuoc-diem" name="-uu-diem-va-nhuoc-diem"></a>
## 4. Ưu điểm và nhược điểm

### ✅ Ưu điểm
- **Tốc độ nhanh** hơn các phương pháp trước (như R-CNN, Fast R-CNN) nhờ tích hợp RPN và chia sẻ feature map.
- **Độ chính xác cao** trong phát hiện vật thể.
- **Huấn luyện end-to-end**: dễ dàng tối ưu toàn bộ mô hình.
- **Linh hoạt**: dễ thay thế backbone (VGG, ResNet...) hoặc kết hợp với các cải tiến mới.

### ❌ Nhược điểm
- **Chưa đạt real-time** trên CPU, cần GPU để chạy nhanh (~5fps với VGG-16).
- **Phức tạp trong triển khai** hơn so với các mô hình một giai đoạn như YOLO hay SSD.
- **Không tối ưu cho thiết bị di động** do kích thước mô hình lớn.

<a href="#-demo-nho" name="-demo-nho"></a>
## 5. Huấn luyện Faster R-CNN (Demo nhỏ)

**Download source code**
- [faster_rcnn_demo.ipynb](/assets/2025-06-1-faster-rcnn/faster_rcnn_demo.ipynb)

<iframe src="/assets/2025-06-1-faster-rcnn/faster_rcnn_demo.html" width="100%" height="600px"></iframe>

<a href="#-tham-khao" name="-tham-khao"></a>
## 6. Tham khảo
[1] S. Ren, K. He, R. Girshick, J. Sun. *Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks*. arXiv:1506.01497v3 [cs.CV], 2016.  🔗 [https://arxiv.org/abs/1506.01497](https://arxiv.org/abs/1506.01497)