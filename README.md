# Amrita Placement Tracker
<p align="center">
<img width="516" height="193" alt="APT Logo" src="https://github.com/user-attachments/assets/fc8c034e-4c3f-41ec-9fc4-ef50fe9cfdaa" />
</p>

<div align="center">

![Version](https://img.shields.io/badge/version-1.1.0-darkred?style=for-the-badge)
![Build](https://img.shields.io/badge/build-passing-success?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-darkgreen?style=for-the-badge)
![React](https://img.shields.io/badge/react-19.2.0-61dafb?style=for-the-badge)

### **Next-Generation Campus Placement Management System**

*Streamlining placement tracking with AI-enhanced insights, real-time analytics, and collaborative peer stories*

[Features](#features) • [Tech Stack](#tech-stack) • [System Flow](#system-flow) • [Installation](#installation) • [API Guide](#api-documentation) • [Future Roadmap](#road-map)

---

<img src="https://raw.githubusercontent.com/andreasbm/rainbow-line/master/line.png" width="100%">

</div>

## 📌 Overview

**Amrita Placement Tracker (APT)** is an enterprise-grade, full-stack ecosystem designed to optimize campus recruitment at Amrita Vishwa Vidyapeetham. It provides a bridge between the **Career & Internship Readiness (CIR)** team, students, and alumni, delivering centralized tracking, deep behavioral analytics, and AI-driven growth metrics.

### 🌟 Why APT?
- **AI-Enhanced Readiness**: Proprietary scoring algorithm mapping CGPA and skills to industry requirements.
- **Storytelling Hub**: Students share and learn from real-world interview experiences.
- **Enterprise-Scale Dashboards**: High-fidelity metrics for institutional oversight.
- **Real-Time Synergy**: Live tickers, instant notifications, and dynamic scheduling.

---

## 📸 Visual Showcase

<details>
<summary><b>Click to view Dashboard Screenshots</b></summary>
<br>

| Student Dashboard | Admin Analytics |
|-------------------|-----------------|
| ![Student](https://via.placeholder.com/400x200?text=Student+Dashboard) | ![Admin](https://via.placeholder.com/400x200?text=Admin+Analytics) |

| Placement Drives | Interview Stories |
|------------------|-------------------|
| ![Drives](https://via.placeholder.com/400x200?text=Drives+Page) | ![Stories](https://via.placeholder.com/400x200?text=Stories+Page) |

</details>

---

## 🏗️ System Architecture & Flow

<details open>
<summary><b>View System Interaction</b></summary>

```mermaid
sequenceDiagram
    participant S as Student
    participant A as Admin
    participant API as Express API
    participant DB as MongoDB / Supabase
    participant AI as AI Engine

    S->>API: Login & Activity
    API->>DB: Fetch Profile & History
    API->>AI: Compute Readiness & Matches
    AI-->>API: Insights & Recommendation
    API-->>S: Personalized Dashboard

    A->>API: Upload CSV / Managed Drives
    API->>DB: Bulk Write / Update Status
    API-->>S: Live Ticker Notifications
    
    rect rgb(139, 0, 0, 0.1)
        Note over S,A: Shared Resource Hub & Interview Stories
    end
```

</details>

---

## ✨ Features

*Verified components from current architecture:*

- **Secure Authentication**: JWT-based session management with Bcrypt password hashing.
- **Role-Based Access Control**: Middleware protected routes for **Student** and **Admin** (CIR).
- **Placement Drive Engine**: Create/Update/Delete drives with eligibility criteria (CGPA/Backlogs).
- **Application Workflow**: One-click apply, automated eligibility checks, and real-time status updates (Applied → Shortlisted → Selected).
- **Student Profiling**: comprehensive profile management including Resume, Academic History, and Skills.
- **Knowledge Repository**: **PrepHub** for study materials and **Interview Experiences** for peer-shared insights.
- **Live Communication**: Dynamic **Ticker System** for flash updates and **Announcements** module.
- **Analytics Suite**: Admin dashboard with visual metrics for Placement % and department-wise stats.
- **Alumni Connect**: Curated success stories and alumni guidance feed.
- **Resource Management**: PDF/Doc upload support via Supabase/Local storage.

---

## 🛠️ Technology Stack

<div align="center">

| Core | Technologies |
|------|--------------|
| **Frontend** | ![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react) ![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=flat-square&logo=vite) ![Tailwind](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=flat-square&logo=tailwind-css) ![Framer](https://img.shields.io/badge/Framer-Motion-0055FF?style=flat-square&logo=framer) |
| **Backend** | ![Node](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js) ![Express](https://img.shields.io/badge/Express-5.2-000000?style=flat-square) ![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=json-web-tokens) |
| **Data** | ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb) ![Supabase](https://img.shields.io/badge/Supabase-Cloud-3ECF8E?style=flat-square&logo=supabase) |
| **Testing** | ![Vitest](https://img.shields.io/badge/Vitest-Unit-729B1B?style=flat-square&logo=vitest) ![Jest](https://img.shields.io/badge/Jest-Backend-C21325?style=flat-square&logo=jest) |

</div>

---

## 📂 Project Structure

```plaintext
APT/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Atomic UI & Layout components
│   │   ├── context/            # Auth, Theme, & Global State
│   │   ├── pages/
│   │   │   ├── admin/          # High-fidelity Admin Views
│   │   │   └── student/        # Personalized Student Views
│   │   ├── services/           # API Abstraction & AI Utils
│   │   └── App.jsx             # Route Guarding & Orchestration
│   └── public/                 # Static Assets & Global Styles
│
├── server/                     # Backend Logic
│   ├── controllers/            # Business Logic & Data Handling
│   ├── models/                 # Mongoose Data Schemas (13 Entities)
│   ├── routes/                 # Express API Definitions (15 Routes)
│   ├── services/               # Internal AI & Cloud Integration
│   └── data/                   # Seed Scripts & Raw Data
└── README.md                   # System Documentation
```

---

## 📡 API Documentation

APT exposes a robust REST API for cross-platform integration.

| Resource | Methods | Endpoint | Description |
|----------|---------|----------|-------------|
| **Auth** | `POST` | `/api/auth/login` | Session creation with JWT |
| **User** | `GET` | `/api/auth/me` | Current profile retrieval |
| **Student**| `GET` | `/api/student/dashboard` | Main student metric hub |
| **Drives** | `POST`| `/api/admin/drive` | Create drive (Restricted) |
| **Stories**| `POST`| `/api/experiences` | Share interview story |
| **Ticker** | `PUT` | `/api/ticker/:id`| Toggle live message status |
| **Analytics**|`GET`| `/api/reports/analytics`| Fetch system-wide metrics |

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js**: v16.0 or higher
- **Database**: MongoDB Atlas instance
- **Cloud Storage**: Supabase account (for file uploads)

### 2. Quick Start
```bash
git clone https://github.com/Team8-Synapse/APT.git
cd APT

# Install and build all environments
npm run install:all
```

### 3. Environment Config
Place a `.env` in the `/server` directory:

| Variable | Description |
|----------|-------------|
| `PORT` | Server listening port (default: 5005) |
| `MONGODB_URI` | MongoDB Atlas Connection String |
| `JWT_SECRET` | Secret key for signing tokens |
| `SUPABASE_URL` | Endpoint for Supabase storage |
| `SUPABASE_SERVICE_KEY` | Admin key for file operations |

### 4. Launch
```bash
# Production Launch
cd server && npm start

# Development with Hot-Reload
cd client && npm run dev
```

---

## 🔮 Future Roadmap

- [ ] **Mobile Application**: Native mobile app for iOS and Android.
- [ ] **Resume Parsing**: AI-based auto-filling of profile data from PDFs.
- [ ] **Mock Tests**: Integrating code compile for technical mock tests.
- [ ] **Chatbot**: AI assistant for resolving student FAQs.

---

## 🤝 Team & Contribution

**Managed by Team 8**
*Amrita Vishwa Vidyapeetham*

We welcome community feedback and contributions! Please read our [Contribution Guidelines](CONTRIBUTING.md) before submitting Pull Requests.

---

**© 2026 Amrita Placement Tracker | Built for Excellence**

![Footer](https://raw.githubusercontent.com/andreasbm/rainbow-line/master/line.png)
