---
title: "Deploy Django webapp lên EC2"
date: 2024-08-08 10:00:00 +0000
categories: [Webapp, Django, AWS]
tags: [Django, EC2, AWS]
author: adinh26101
layout: post
icon: fas fa-robot
lang: vi
math: true
permalink: /posts/deploy-django-webapp-to-ec2/
---
### Nội dung
- [1. Giới thiệu](#-gioi-thieu)
- [2. Tạo EC2 instance](#-create-ec2-instance)
- [3. Connect EC2 và setup code + môi trường](#-setup-ec2-instance)
- [4. Mở port 8000 và truy cập thôi](#-finish)

<a href="#-gioi-thieu" name="-gioi-thieu"></a>
## 1. Giới thiệu

Annyeong haseyo, trong bài post này mình sẽ hướng dẫn cách deploy một Django webapp (web tỏ tình với cờ-rớt) lên EC2 ha.  

<a href="#-create-ec2-instance" name="-create-ec2-instance"></a>
## 2. Tạo EC2 instance

Để tạo một EC2 instance các bạn làm theo các bước sau:

1. Mở **AWS Console** và vào phần **EC2**.
*Các bạn tự lưu ý region của mình để deploy webapp gần với khu vực quốc gia của mình nhé.*
2. Trên bảng điều khiển EC2, click vào nút **Launch Instance**.
<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/ec2_dashboard.png" alt="ec2_dashboard"/>
    <em>Hình 1. EC2 Dashboard.</em>
</p>

3. Đặt tên cho instance và click **Launch Instance** nhé. Mặc định option OS images là **Amazon Linux 2** và Instance type là **t2.micro** (Free Tier)
<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/launch_instance.png" alt="launch_instance"/>
    <em>Hình 2. Điền thông tin.</em>
</p>

4. Chọn option cho key pair (app test thôi nên mình không tạo cho khỏi mất công nhưng không recommend nhé).
<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/keypair.png" alt="keypair"/>
    <em>Hình 3. Chọn key pair option.</em>
</p>

5. Nhấn **Launch** để khởi tạo instance.

Tạo instance xong rồi, giờ mình setup con instance này nhé.

<a href="#-setup-ec2-instance" name="-setup-ec2-instance"></a>
## 3. Connect EC2 và setup code + môi trường

1. Mở thông tin chi tiết của instance mới tạo và click vào ô connect

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/connect.png" alt="connect"/>
    <em>Hình 4. Connect vào instance.</em>
</p>

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/connect2.png" alt="connect2"/>
    <em>Hình 5. Connect vào instance bằng web browser cho khỏe luôn ha.</em>
</p>

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/connect_ready.png" alt="connect_ready"/>
    <em>Hình 6. Connect đã sẵn sàng.</em>
</p>

Cài đặt môi trường cho instance trước nhé:

1. Update system
    ```bash
    sudo dnf update -y
    ```
2. Cài đặt git
    ```bash
    sudo dnf install git -y
    ```
3. Cài đặt pip
    ```bash
    sudo dnf install pip -y
    ```
4. Cài đặt gunicorn
    ```bash
    sudo pip install gunicorn
    ```

Giờ clone code về và setup tiếp nhé:

1. Clone repo từ github
    ```bash
    git clone https://github.com/frogdance/confess
    ```
2. Cài đặt thư viện cần thiết
    ```bash
    cd confess
    pip install -r requirements.txt
    ```
3. Host website
    ```bash
    gunicorn --bind 0.0.0.0:8000 gift.wsgi:application
    ```

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/host_success.png" alt="host_success"/>
    <em>Hình 7. Nó mà như này là okela rồi nhá.</em>
</p>

<a href="#-finish" name="-finish"></a>
## 4. Mở port 8000 và truy cập thôi

Tiếp theo là mở thêm port 8000 cho instance, mình làm như sau:

1. Mở thông tin chi tiết của instance và chọn tab **Security**, sau đó click vào cái security group của instance đó.

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/security_group.png" alt="security_group"/>
    <em>Hình 8. Nó ở đây nha.</em>
</p>

2. Tiếp theo là click vào **Edit inbound rules** và mở port 8000

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/edit_inbound_rule.png" alt="edit_inbound_rule"/>
    <em>Hình 9. Click dô đây.</em>
</p>

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/finish_edit.png" alt="finish_edit"/>
    <em>Hình 10. Add rule và setup như này nha.</em>
</p>

Sau đó tụi mình click vào **Save rules** là xong nha.

3. Mở webapp để xem thôi nào.

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/open_url.png" alt="open_url"/>
    <em>Hình 11. Các bạn quay lại trang thông tin chi tiết của instance và click vô đây nhá.</em>
</p>

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/url1.png" alt="url1"/>
    <em>Hình 12. Mặc định thì URL sẽ là https connection như vầy.</em>
</p>

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/url2.png" alt="url2"/>
    <em>Hình 13. Các bạn xóa chữ s và thêm :8000 là access được nhá.</em>
</p>

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/finish.png" alt="finish"/>
    <em>Hình 14. Như vầy là truy cập được rồi ha.</em>
</p>

> Chúc các bạn thành công. ^^