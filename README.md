# Professional Cloud Blood Bank

> **Internship Task Submission | Rhombix Technologies**
> This repository contains the source code for the "Professional Cloud Blood Bank" project, developed as an assigned task during the cloud internship program at Rhombix Technologies.

---

### Video Walkthrough & Live Demo

A complete video walkthrough of the project, including a live demonstration and a technical architecture overview, is available at the link below.

▶️ **Watch the Video Explanation: https://youtu.be/U8LSaNaCXEQ

---

A live version of the application was deployed on AWS Amplify for demonstration purposes.

**Live URL:** `https://main.d1d4bllqmy20k4.amplifyapp.com/`

**Important Note on Availability:** As a best practice for managing cloud costs, the underlying AWS resources (Amplify, API Gateway, Lambda, DynamoDB) for this project are not kept running permanently. Therefore, **the live URL may become inactive**. The code in this repository remains fully functional and can be deployed on any AWS account by following the "Getting Started" instructions below. This approach demonstrates responsible cloud resource management.

---

## Project Overview & Features

This project is a full-stack, serverless web application built on AWS. It provides a complete solution for managing a blood bank's inventory, patient waitlists, and data analytics through a clean and modern user interface.

- **Dashboard & Analytics:** Real-time Key Performance Indicators (KPIs) and charts to visualize blood supply and patient demand.
- **Blood Repository Management:** Full CRUD (Create, Read, Update, Delete) functionality for donor blood units.
- **Patient Waitlist Management:** A complete system to manage patient records and track their status.
- **Intelligent Assignment:** A robust workflow to assign available blood units to matching patients.
- **Data Purge Utility:** A secure, two-step maintenance tool for administrators to bulk-delete old records.
- **Professional UI/UX:** A clean, responsive, and user-friendly interface built with Bootstrap 5, featuring modals, toast notifications, and search functionality.

---

## Technology Stack

| Category         | Technologies Used                                               |
| ---------------- | --------------------------------------------------------------- |
| **Frontend**     | `HTML5`, `CSS3`, `Bootstrap 5`, `JavaScript (ES6+)`, `Chart.js` |
| **Backend**      | `AWS Lambda`, `Amazon API Gateway`, `Amazon DynamoDB`, `AWS IAM`  |
| **Deployment**   | `AWS Amplify` (for CI/CD from this GitHub repository)           |

---

## Getting Started

To deploy your own version of this application, follow these steps:

### Backend Setup
1.  **DynamoDB:** Create two tables (`BloodBankTable`, `PatientTable`) with `id` (String) as the partition key.
2.  **IAM:** Create an execution role for Lambda with permissions to access the DynamoDB tables.
3.  **Lambda:** Create a function using the `lambda_function.py` code and attach the IAM role.
4.  **API Gateway:** Create a REST API with routes (`/donors`, `/patients`, etc.) and integrate them with the Lambda function. Deploy the API.

### Frontend Setup
1.  Clone this repository to your local machine.
2.  Open `script.js` and update the `API_BASE_URL` constant with your API Gateway's URL.
3.  Connect the repository to **AWS Amplify** to automatically build and deploy the frontend, providing you with a public URL.

---
This project was successfully completed as per the requirements of the internship task provided by **Rhombix Technologies**.
