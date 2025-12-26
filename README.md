# 🚦 RTO Management System

A full-stack **RTO (Regional Transport Office) Management System** designed to digitize and streamline citizen services such as license management, vehicle registration, challans, approvals, and role-based operations for police and RTO officials.

This project focuses on **clarity, scalability, and role-based access**, keeping the backend simple and understandable while still following good system design practices.

---

## 📌 Project Goals

- Digitize core RTO workflows
- Reduce manual paperwork and delays
- Provide role-based access for different authorities
- Ensure secure authentication and authorization
- Build a scalable foundation for future features

---

## 🧩 Core Modules

### 👤 Citizen
- Register & login
- Apply for driving license
- View license & application status
- Register vehicles
- View challans & raise disputes
- Profile management

### 👮 Police
- Issue challans
- Verify license & vehicle details
- Update challan status
- Access only authorized routes

### 🏢 RTO Officer
- Approve / reject license applications
- Approve vehicle registrations
- Issue driving licenses
- Monitor system activity

### 🛠 Admin
- Manage roles & permissions
- System monitoring
- Configuration management

---

## 🏗️ Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT Authentication
- Role-Based Access Control (RBAC)

### Frontend
- React + Vite
- TypeScript
- Tailwind CSS
- Shadcn/UI Components
- Role-based dashboards

---

## 🗂️ Folder Structure

```
rto-management-system/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── db.ts
│   │   └── index.ts
│   ├── database_setup.sql
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔐 Authentication & Security

- JWT-based authentication
- Refresh token mechanism
- Role-based route protection
- Password hashing with bcrypt
- Environment variable security

---

## 📡 API Overview

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Citizen registration | Public |
| POST | `/api/auth/login` | Login | All |
| GET | `/api/users/profile` | View profile | Authenticated |
| POST | `/api/vehicles` | Register vehicle | Citizen |
| GET | `/api/driving-license` | View license | Citizen |
| POST | `/api/challans` | Issue challan | Police |
| PUT | `/api/dl-applications/:id/approve` | Approve license | RTO Officer |
| GET | `/api/analytics` | View analytics | Admin |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
# Configure .env with database credentials
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

- Postman collection included for API testing
- Role-wise token testing
- API Testing Guide available in `backend/API_TESTING_GUIDE.md`

---

## 🎯 Features

### Implemented
- ✅ User authentication (Register/Login/Logout)
- ✅ Role-based access control (Citizen, Police, RTO Officer, Admin, Auditor)
- ✅ Driving license application & management
- ✅ Vehicle registration
- ✅ Challan management
- ✅ Appointment booking
- ✅ Payment processing
- ✅ Notifications system
- ✅ Analytics dashboard
- ✅ RTO Office management

### Future Enhancements
- 📧 Email/SMS notifications
- 📱 Mobile-responsive improvements
- 📊 Advanced analytics
- 📄 Document upload & verification

---

## 📄 License

This project is developed for **learning, demonstration, and academic purposes**.

---

> *This project emphasizes clean architecture, simplicity, and real-world applicability.*
