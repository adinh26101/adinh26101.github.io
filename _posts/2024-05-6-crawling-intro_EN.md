---
title: "Introduction to Web Scraping"
date: 2024-05-06 10:00:00 +0000
categories: [Web Crawling, Python, Data Engineering]
tags: [Web Scraping, Python, BeautifulSoup, Requests, Static Website]
author: adinh26101
icon: fas fa-database
lang: en
permalink: /posts/crawling-intro/
---

### Contents
- [1. What is Web Scraping?](#-what-is-web-scraping)
- [2. Common Types of Websites](#-common-types-of-websites)
- [3. Static & Dynamic Websites](#-static-dynamic-websites)
- [4. What is the DOM Structure?](#-what-is-the-dom-structure)
- [5. Goals and Applications of Web Scraping](#-goals-and-applications-of-web-scraping)
- [6. Popular Python Libraries](#-popular-python-libraries)
- [7. Real Example: Scraping Books from books.toscrape.com](#-real-example-scraping-books-from-bookstoscrapecom)

<a name="-what-is-web-scraping"></a>
## 1. What is Web Scraping?

<p>
  <img src="assets/2024-05-6-crawling-intro/web_tech.png" alt="web_tech"/>
</p>

Web scraping is the automated process of collecting data from websites using programs — instead of manually copying data line by line. We can write a few lines of code to get hundreds or thousands of data items in just minutes.

<a name="-common-types-of-websites"></a>
## 2. Common Types of Websites

Websites are often classified by several criteria:

- By dynamism: Static vs Dynamic websites  
- By frontend/backend technologies: React, Vue, Django, Laravel, etc.  
- By code architecture: Monolith, Microservices, etc.  
- By rendering technologies: SSR, CSR, hybrid  

> In this introduction, we only focus on classification by dynamism.

<a name="-static-dynamic-websites"></a>
## 3. Static & Dynamic Websites

<p>
  <img src="assets/2024-05-6-crawling-intro/static_dynamic.png" alt="static_dynamic"/>
</p>

### Static Websites:

- Use only HTML and CSS; content is “fixed” — doesn’t change per visitor.  
- Easy to scrape since content is already in the HTML.  
- Examples: Portfolio sites, product landing pages.

### Dynamic Websites:

- Use backend processing — often PHP, Node.js, Python, etc.  
- Content changes based on user interaction or is loaded by JavaScript.  
- Harder to scrape because you must wait for the page to fully load.  
- Examples: Shopee, Facebook, real-time price tracking sites.

<a name="-what-is-the-dom-structure"></a>
## 4. What is the DOM Structure?

The DOM (Document Object Model) is a tree structure of a web page. Each HTML tag is a **node**, which can be a parent or child of other nodes.

Simple example:

```html
<body>
  <h1>Title</h1>
  <p>Description here</p>
</body>
```

### In this example:
- `<body>` is the parent

- `<h1>` and `<p>` are children

### Larger DOM example:

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
- `<html>` is the root node containing the entire webpage.

- `<head>` contains page information like the title, not directly visible.

- `<title>` is the page title shown on the browser tab.

- `<body>` holds the main content visible to users.

- Inside `<body>`, there are smaller parts called child nodes:

  - `<div class="header">` contains the main header `<h1>Welcome</h1>`.

  - `<div class="content">` contains a list of books with `<li>` items.

  - `<footer>` is the footer section with the text "Contact".

This structure is like a tree, each tag is a branch or leaf, helping us easily find and extract data when scraping websites.

<a name="-goals-and-applications-of-web-scraping"></a>
## 5. Goals and Applications of Web Scraping

<p>
  <img src="assets/2024-05-6-crawling-intro/html.png" alt="html"/>
</p>

🎯 **Main goals:**

- Automate data collection (fast, save effort)  
- Analyze and compare prices (products, crypto, flight tickets, etc.)  
- Track content changes (news, prices, rankings, etc.)  
- Create datasets for research, machine learning, statistics  
- Integrate into internal systems like dashboards or apps

---

<a name="-popular-python-libraries"></a>
## 6. Popular Python Libraries

- `requests` – Send HTTP requests, fetch HTML content  
- `BeautifulSoup` (bs4) – Easy HTML parsing and extraction  
- `lxml` – Fast and powerful parser for HTML/XML  
- `selenium` – Automate interaction with dynamic (JS) sites  
- `scrapy` – Framework for large crawling projects  
- `httpx` – Similar to requests but supports async  
- `pyppeteer`, `playwright` – Headless browser control, good for JS-heavy sites

🛠 Choose libraries based on your goals. For static sites, `requests` + `BeautifulSoup` is usually enough.

---

<a name="-real-example-scraping-books-from-bookstoscrapecom"></a>
## 7. Real example: Scraping books from books.toscrape.com

The site [books.toscrape.com](https://books.toscrape.com) is a sample site for practicing web scraping.

- It is a **static website**, ideal for beginners  
- Contains **1000 books spread across 50 pages**  
- Simple URL structure:

```text
https://books.toscrape.com/catalogue/page-{page_number}.html
```
**Download source code**  
- [demo.ipynb](/assets/2024-05-6-crawling-intro/demo.ipynb)

<iframe src="/assets/2024-05-6-crawling-intro/demo.html" width="100%" height="600px"></iframe>

- `res = requests.get(url)`: Sends an HTTP request to get the webpage content at the given URL.

- `soup = BeautifulSoup(res.text, 'html.parser')`: Parses the HTML content of the page using BeautifulSoup for easier processing.

- `books = soup.select(".col-xs-6.col-sm-4.col-md-3.col-lg-3")`: Selects all HTML elements with the class `"col-xs-6 col-sm-4 col-md-3 col-lg-3"` — these are the tags containing information for each book on the page.

Each element in `books` is a "node" containing detailed information about a book, making it easy to extract details like title, image, rating, price, etc.