# 🚀 Smart Job Matching & Skill-Gap Job Portal

A production-style **Django Job Portal** that goes beyond traditional job searching by analyzing a candidate's skills and profile against job requirements and providing a transparent **Job Match Score** and **Skill Gap Analysis**.

The platform helps candidates understand **why they match a job, which skills they already have, and which skills they are missing**, while recruiters can create job postings and evaluate applicants based on structured profile information.

---

## ✨ Key Features

### 👤 Candidate

* User registration and authentication
* Candidate profile management
* Skills management
* Education and experience information
* Resume upload
* Browse and search jobs
* View job requirements
* View personalized match percentage
* See matched skills
* See missing skills
* Skill-gap analysis
* Apply for jobs
* Track application status

### 🏢 Recruiter

* Recruiter authentication
* Create and manage job postings
* Define required skills
* Specify experience requirements
* Specify education requirements
* View applicants
* View candidate matching information
* Manage job applications

### 🧠 Smart Job Matching

The system uses a transparent rule-based matching engine rather than an unexplained AI score.

Example:

```text
Job Requirements
│
├── Python       ✓
├── Django       ✓
├── PostgreSQL   ✓
├── REST API     ✓
├── Docker       ✗
└── Redis        ✗
```

Candidate:

```text
Matched Skills
→ Python
→ Django
→ PostgreSQL
→ REST API

Missing Skills
→ Docker
→ Redis
```

The system then calculates a weighted match score based on configurable criteria such as:

```text
Skill Match       → 60%
Experience Match  → 20%
Education Match   → 20%
```

The weights are kept configurable rather than hard-coded throughout the application.

---

## 🔄 Application Flow

```text
                  ┌──────────────────┐
                  │      User        │
                  └────────┬─────────┘
                           │
             ┌─────────────┴─────────────┐
             ↓                           ↓
      ┌──────────────┐            ┌──────────────┐
      │  Candidate   │            │   Recruiter  │
      └──────┬───────┘            └──────┬───────┘
             │                           │
             ↓                           ↓
       Profile + Skills             Create Job
             │                           │
             └─────────────┬─────────────┘
                           ↓
                  ┌─────────────────┐
                  │ Matching Engine │
                  └────────┬────────┘
                           ↓
              ┌────────────────────────┐
              │ Match Score + Skill Gap│
              └───────────┬────────────┘
                          ↓
                  Job Recommendations
                          ↓
                    Application
```

---

## 🏗️ Project Architecture

```text
smart-job-portal/
│
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── accounts/
│   ├── models.py
│   ├── forms.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
│
├── jobs/
│   ├── models.py
│   ├── forms.py
│   ├── views.py
│   ├── urls.py
│   ├── services.py
│   └── admin.py
│
├── applications/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── services.py
│
├── matching/
│   ├── services.py
│   ├── utils.py
│   └── tests.py
│
├── templates/
│   ├── base.html
│   ├── accounts/
│   ├── jobs/
│   ├── applications/
│   └── matching/
│
├── static/
│   ├── css/
│   ├── js/
│   └── images/
│
├── media/
│
├── manage.py
├── requirements.txt
└── README.md
```

---

## 🗄️ Core Data Model

```text
User
 │
 └── Profile
       │
       ├── Skills
       ├── Education
       └── Experience


Job
 │
 ├── Required Skills
 ├── Experience Requirement
 └── Education Requirement
       │
       ↓
   Matching Engine
       │
       ↓
Application
 │
 └── Candidate ↔ Job
```

### Main Entities

| Entity  | Purpose        |
| ------- | -------------- |
| User    | Authentication |
| Profile | Ca             |
