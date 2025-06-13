---
title: "Giới thiệu về cào dữ liệu"
date: 2024-05-06 10:00:00 +0000
categories: [Web Crawling, Python, Data Engineering]
tags: [Web Scraping, Python, BeautifulSoup, Requests, Static Website]
author: adinh26101
icon: fas fa-database
lang: vi
permalink: /posts/crawling-intro/
---

### Nội dung
- [1. Cào dữ liệu là gì?](#-cào-dữ-liệu-là-gì)
- [2. Các loại website phổ biến](#-các-loại-website-phổ-biến)
- [3. Website tĩnh & động](#-website-tĩnh-động)
- [4. Cấu trúc DOM là gì?](#-cấu-trúc-dom-là-gì)
- [5. Mục tiêu và ứng dụng của việc cào dữ liệu](#-mục-tiêu-và-ứng-dụng-của-việc-cào-dữ-liệu)
- [6. Các thư viện phổ biến trong Python](#-các-thư-viện-phổ-biến-trong-python)
- [7. Ví dụ thực tế: Cào sách từ books.toscrape.com](#-ví-dụ-thực-tế-cào-sách-từ-bookstoscrapecom)

<a name="-cào-dữ-liệu-là-gì"></a>
## 1. Cào dữ liệu là gì?

<p>
  <img src="assets/2024-05-6-crawling-intro/web_tech.png" alt="web_tech"/>
</p>

Cào dữ liệu (web scraping) là quá trình thu thập thông tin tự động từ các trang web bằng chương trình – thay vì ngồi copy từng dòng dữ liệu thủ công. Chúng ta có thể viết vài dòng code để lấy hàng trăm, thậm chí hàng ngàn dữ liệu chỉ trong vài phút.

<a name="-các-loại-website-phổ-biến"></a>
## 2. Các loại website phổ biến

Web thường phân loại theo vài tiêu chí như:

- Theo tính động: Web tĩnh và Web động  
- Theo công nghệ frontend/backend: React, Vue, Django, Laravel,...  
- Theo kiến trúc tổ chức code: Monolith, Microservices,...  
- Theo công nghệ rendering: SSR, CSR, hybrid  

> Trong bài viết giới thiệu này mình chỉ nói kỹ về phân loại theo tính động thôi nhé.

<a name="-website-tĩnh-động"></a>
## 3. Website tĩnh & động

<p>
  <img src="assets/2024-05-6-crawling-intro/static_dynamic.png" alt="static_dynamic"/>
</p>

### Web tĩnh (Static):

- Chỉ dùng HTML, CSS, nội dung "cứng" – không thay đổi dù ai truy cập.  
- Dễ cào vì nội dung đã sẵn trong HTML.  
- Ví dụ: Portfolio, landing page giới thiệu sản phẩm

### Web động (Dynamic):

- Có backend xử lý – thường dùng PHP, Node.js, Python,...  
- Nội dung thay đổi theo tương tác người dùng hoặc được tải thêm bằng JavaScript.  
- Khó cào hơn vì phải đợi trang "chạy xong".  
- Ví dụ: Shopee, Facebook, các trang cập nhật giá theo thời gian thực

<a name="-cấu-trúc-dom-là-gì"></a>
## 4. Cấu trúc DOM là gì?

DOM (Document Object Model) là cấu trúc dạng cây của một trang web. Mỗi thẻ HTML là một **node** (nút), có thể là cha hoặc con của node khác.

Ví dụ đơn giản:

```html
<body>
  <h1>Tiêu đề</h1>
  <p>Mô tả nè</p>
</body>
```

### Trong ví dụ này:

- `<body>` là cha  
- `<h1>` và `<p>` là con

---

### Ví dụ DOM lớn hơn:

```html
<html>
  <head>
    <title>Trang A</title>
  </head>
  <body>
    <div class="header">
      <h1>Welcome</h1>
    </div>
    <div class="content">
      <ul>
        <li>Sách 1</li>
        <li>Sách 2</li>
      </ul>
    </div>
    <footer>Liên hệ</footer>
  </body>
</html>
```

- `<html>` là nút gốc, chứa toàn bộ trang web.

- `<head>` chứa thông tin trang như tiêu đề, không hiển thị trực tiếp.

- `<title>` là tiêu đề trang, hiện trên tab trình duyệt.

- `<body>` chứa phần nội dung chính mà người dùng thấy.

- Trong `<body>`, có các phần nhỏ hơn gọi là các node con:

  - `<div class="header">` chứa tiêu đề lớn `<h1>Welcome</h1>`.

  - `<div class="content">` chứa danh sách sách với các mục `<li>`.

  - `<footer>` là phần chân trang với chữ "Liên hệ".

Cấu trúc này giống như cây, mỗi thẻ là một nhánh hoặc lá trên cây, giúp mình dễ dàng tìm và lấy dữ liệu cần khi cào web.

<a name="-mục-tiêu-và-ứng-dụng-của-việc-cào-dữ-liệu"></a>
## 5. Mục tiêu và ứng dụng của việc cào dữ liệu

<p>
  <img src="assets/2024-05-6-crawling-intro/html.png" alt="html"/>
</p>

🎯 **Mục tiêu chính:**

- Tự động hoá thu thập dữ liệu (nhanh, tiết kiệm công sức)  
- Phân tích, so sánh giá cả (sản phẩm, tiền ảo, vé máy bay,...)  
- Theo dõi thay đổi nội dung (tin tức, giá, xếp hạng,...)  
- Tạo tập dữ liệu cho nghiên cứu, học máy, thống kê  
- Tích hợp vào hệ thống nội bộ như dashboard, app

---

<a name="-các-thư-viện-phổ-biến-trong-python"></a>
## 6. Các thư viện phổ biến trong Python

- `requests` – Gửi HTTP request, lấy nội dung HTML  
- `BeautifulSoup` (bs4) – Phân tích và trích xuất HTML dễ dùng  
- `lxml` – Parser nhanh và mạnh cho HTML/XML  
- `selenium` – Tự động hóa tương tác với trang động (JS)  
- `scrapy` – Framework chuyên dụng cho các dự án crawling lớn  
- `httpx` – Gần giống requests nhưng hỗ trợ async  
- `pyppeteer`, `playwright` – Điều khiển trình duyệt headless, tốt cho web JS nặng

🛠 Tùy mục tiêu mà chọn thư viện. Với web tĩnh thì `requests` + `BeautifulSoup` là đủ.

---

<a name="-ví-dụ-thực-tế-cào-sách-từ-bookstoscrapecom"></a>
## 7. Ví dụ thực tế: Cào sách từ books.toscrape.com

Trang [books.toscrape.com](https://books.toscrape.com) là một web mẫu để thực hành cào dữ liệu.

- Đây là **web tĩnh**, rất phù hợp cho người mới học  
- Gồm **1000 cuốn sách chia thành 50 trang**  
- Cấu trúc URL đơn giản:

```text
https://books.toscrape.com/catalogue/page-{số_trang}.html
```

**Download source code**
- [demo.ipynb](/assets/2024-05-6-crawling-intro/demo.ipynb)

<iframe src="/assets/2024-05-6-crawling-intro/demo.html" width="100%" height="600px"></iframe>

- `res = requests.get(url)`: Gửi yêu cầu HTTP lấy nội dung trang web tại URL tương ứng.

- `soup = BeautifulSoup(res.text, 'html.parser')`: Phân tích (parse) nội dung HTML của trang bằng BeautifulSoup để dễ xử lý.

- `books = soup.select(".col-xs-6.col-sm-4.col-md-3.col-lg-3")`: Lấy tất cả các phần tử HTML có class `"col-xs-6 col-sm-4 col-md-3 col-lg-3"` — đây là các thẻ chứa thông tin từng cuốn sách trên trang.

Mỗi phần tử trong `books` chính là một "node" chứa thông tin chi tiết của một cuốn sách, để mình dễ dàng truy xuất các thông tin như tên, ảnh, đánh giá, giá...