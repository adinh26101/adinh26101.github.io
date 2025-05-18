---
title: "Deploy Django webapp to EC2"
date: 2024-08-08 10:00:00 +0000
categories: [Webapp, Django, AWS]
tags: [Django, EC2, AWS]
author: adinh26101
layout: post
icon: fas fa-robot
lang: en
math: true
permalink: /en/posts/deploy-django-webapp-to-ec2/
---
### Contents
- [1. Introduction](#-introduction)
- [2. Create an EC2 instance](#-create-ec2-instance)
- [3. Connect EC2 and set up the code + environment](#-setup-ec2-instance)
- [4. Open port 8000 and access](#-finish)

<a href="#-introduction" name="-introduction"></a>
## 1. Introduction

Annyeong haseyo, in this post, I’ll guide you on how to deploy a Django webapp (a love confession website) to EC2.  

<a href="#-create-ec2-instance" name="-create-ec2-instance"></a>
## 2. Create an EC2 instance

To create an EC2 instance, follow these steps:

1. Open **AWS Console** and go to **EC2**.
*Make sure you deploy the webapp in a region close to your country.*
2. On the EC2 dashboard, click the **Launch Instance** button.
<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/ec2_dashboard.png" alt="ec2_dashboard"/>
    <em>Figure 1. EC2 Dashboard.</em>
</p>

3. Name the instance and click **Launch Instance**. The default OS image is **Amazon Linux 2**, and the instance type is **t2.micro** (Free Tier).
<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/launch_instance.png" alt="launch_instance"/>
    <em>Figure 2. Fill in the details.</em>
</p>

4. Choose an option for the key pair (since this is just a test app, I won’t create one, but it’s not recommended).
<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/keypair.png" alt="keypair"/>
    <em>Figure 3. Key pair option.</em>
</p>

5. Press **Launch** to create the instance.

Now that the instance is created, let’s set it up.

<a href="#-setup-ec2-instance" name="-setup-ec2-instance"></a>
## 3. Connect EC2 and set up the code + environment

1. Open the instance details and click on **Connect**.

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/connect.png" alt="connect"/>
    <em>Figure 4. Connecting to the instance.</em>
</p>

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/connect2.png" alt="connect2"/>
    <em>Figure 5. Connect via web browser for convenience.</em>
</p>

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/connect_ready.png" alt="connect_ready"/>
    <em>Figure 6. Connection ready.</em>
</p>

Let’s set up the environment for the instance:

1. Update the system:
    ```bash
    sudo dnf update -y
    ```
2. Install git:
    ```bash
    sudo dnf install git -y
    ```
3. Install pip:
    ```bash
    sudo dnf install pip -y
    ```
4. Install gunicorn:
    ```bash
    sudo pip install gunicorn
    ```

Now, let’s clone the code and continue the setup:

1. Clone the repo from GitHub:
    ```bash
    git clone https://github.com/frogdance/confess
    ```
2. Install the required libraries:
    ```bash
    cd confess
    pip install -r requirements.txt
    ```
3. Host the website:
    ```bash
    gunicorn --bind 0.0.0.0:8000 gift.wsgi:application
    ```

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/host_success.png" alt="host_success"/>
    <em>Figure 7. Hosting success message.</em>
</p>

<a href="#-finish" name="-finish"></a>
## 4. Open port 8000 and access

Next, we’ll open port 8000 for the instance. Here’s how:

1. Open the instance details, go to the **Security** tab, and click on the instance’s security group.

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/security_group.png" alt="security_group"/>
    <em>Figure 8. Security group details.</em>
</p>

2. Click **Edit inbound rules** and open port 8000.

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/edit_inbound_rule.png" alt="edit_inbound_rule"/>
    <em>Figure 9. Editing inbound rules.</em>
</p>

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/finish_edit.png" alt="finish_edit"/>
    <em>Figure 10. Set the rules as shown.</em>
</p>

After that, click **Save rules**.

3. Open the webapp to check if it’s working.

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/open_url.png" alt="open_url"/>
    <em>Figure 11. Access the instance details and click here.</em>
</p>

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/url1.png" alt="url1"/>
    <em>Figure 12. By default, the URL will be HTTPS.</em>
</p>

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/url2.png" alt="url2"/>
    <em>Figure 13. Remove the "s" and add :8000 to access it.</em>
</p>

<p>
    <img src="assets/2024-08-08-deploy-django-to-ec2/finish.png" alt="finish"/>
    <em>Figure 14. You’re all set to access your webapp.</em>
</p>

> Best of luck with your deployment. ^^