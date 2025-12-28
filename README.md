<div align="center">

# 🚦 RTO Management System

<img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status">
<img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">

<br/>

<br/>

**🌐 A Modern Full-Stack Solution for Regional Transport Office Operations**

*Digitizing citizen services • Streamlining workflows • Empowering authorities*

<br/>

[Features](#-features) • [Tech Stack](#️-tech-stack) • [Installation](#-quick-start) • [API Docs](#-api-endpoints) • [Contributing](#-contributing)

---

</div>

## ✨ What is RTO Management System?

A comprehensive **digital platform** that transforms how Regional Transport Offices operate. From license applications to vehicle registrations, challans to appointments — everything managed through an intuitive, role-based system.

<div align="center">

```
┌─────────────────────────────────────────────────────────────────┐
│                    🎯 KEY HIGHLIGHTS                            │
├─────────────────────────────────────────────────────────────────┤
│  🔐 Secure JWT Authentication    │  📊 Real-time Analytics     │
│  👥 Multi-Role Access Control    │  💳 Integrated Payments     │
│  📱 Responsive Modern UI         │  🔔 Smart Notifications     │
│  ⚡ Lightning Fast Performance   │  🛡️ Enterprise Security     │
└─────────────────────────────────────────────────────────────────┘
```

</div>

---

## 👥 User Roles & Capabilities

<table>
<tr>
<td width="25%" align="center">

### 👤 Citizen
**Self-Service Portal**

</td>
<td width="25%" align="center">

### 👮 Police
**Enforcement Tools**

</td>
<td width="25%" align="center">

### 🏢 RTO Officer
**Processing Hub**

</td>
<td width="25%" align="center">

### 🛡️ Admin
**System Control**

</td>
</tr>
<tr>
<td valign="top">

- Apply for DL
- Register vehicles
- View challans
- Book appointments
- Track applications
- Make payments

</td>
<td valign="top">

- Issue challans
- Verify licenses
- Check vehicle info
- Update violations
- Access reports

</td>
<td valign="top">

- Approve/reject DL
- Process registrations
- Issue licenses
- Schedule tests
- Monitor queues

</td>
<td valign="top">

- Manage users
- Assign roles
- View analytics
- System config
- Audit logs

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Shadcn](https://img.shields.io/badge/Shadcn/UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

</div>

---

## 🎯 Features

<div align="center">

| ✅ Implemented | 🚧 Coming Soon |
|---------------|----------------|
| 🔐 JWT Authentication | 📧 Email Notifications |
| 👥 Role-Based Access (6 Roles) | 📱 SMS Alerts |
| 🪪 DL Application & Management | 📊 Advanced Analytics |
| 🚗 Vehicle Registration | 📄 Document Verification |
| 🎫 Challan Management | 🤖 AI-Powered Insights |
| 📅 Appointment Booking | 🌐 Multi-language Support |
| 💳 Payment Processing | |
| 🔔 Notifications System | |
| 📈 Analytics Dashboard | |
| 🏢 RTO Office Management | |

</div>

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+  •  PostgreSQL 15+  •  npm/yarn
```

### ⚡ One-Minute Setup

<details>
<summary><b>📦 Backend Setup</b></summary>

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials
# Required Environment Variables
# Create a .env file in the backend directory with:
# - PORT=5000
# - DATABASE_URL=postgresql://user:pass@host:port/dbname
# - JWT_SECRET=your_jwt_secret
# - JWT_REFRESH_SECRET=your_refresh_secret
# - EMAIL_HOST=smtp.gmail.com (or other provider)
# - EMAIL_USER=your_email@gmail.com
# - EMAIL_PASSWORD=your_app_password

# Run database setup
psql -U postgres -f database_setup.sql

# Start development server
npm run dev
```

🟢 Backend runs at `http://localhost:5000`

</details>

<details>
<summary><b>🎨 Frontend Setup</b></summary>

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

🟢 Frontend runs at `http://localhost:5173`

</details>

---

## 📁 Project Structure

```
📦 rto-management-system
├── 🔧 backend/
│   ├── 📂 src/
│   │   ├── 🎮 controllers/     # Request handlers
│   │   ├── 📊 models/          # Database models
│   │   ├── 🛣️ routes/          # API routes
│   │   ├── 🛡️ middlewares/     # Auth & validation
│   │   ├── 🔧 utils/           # Helper functions
│   │   ├── 💾 db.ts            # Database connection
│   │   └── 🚀 index.ts         # Entry point
│   └── 📋 package.json
│
├── 🎨 frontend/
│   ├── 📂 src/
│   │   ├── 🧩 components/      # Reusable UI components
│   │   ├── 🌐 contexts/        # React contexts
│   │   ├── 🪝 hooks/           # Custom hooks
│   │   ├── 📄 pages/           # Page components
│   │   ├── 🔌 services/        # API services
│   │   ├── 📝 types/           # TypeScript types
│   │   └── 📱 App.tsx          # Root component
│   └── 📋 package.json
│
└── 📖 README.md
```

---

## 🔌 API Endpoints

<details>
<summary><b>🔐 Authentication</b></summary>

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/logout` | User logout |
| `POST` | `/api/auth/forgot-password` | Password reset |

</details>

<details>
<summary><b>👤 User Management</b></summary>

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `GET` | `/api/users/profile` | Get user profile |
| `PUT` | `/api/users/profile` | Update profile |
| `GET` | `/api/users` | List all users (Admin) |

</details>

<details>
<summary><b>🪪 Driving License</b></summary>

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `POST` | `/api/dl-applications` | Apply for DL |
| `GET` | `/api/dl-applications` | View applications |
| `PUT` | `/api/dl-applications/:id/approve` | Approve DL |
| `GET` | `/api/driving-license` | View license |

</details>

<details>
<summary><b>🚗 Vehicles</b></summary>

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `POST` | `/api/vehicles` | Register vehicle |
| `GET` | `/api/vehicles` | List vehicles |
| `GET` | `/api/vehicles/:id` | Vehicle details |

</details>

<details>
<summary><b>🎫 Challans</b></summary>

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `POST` | `/api/challans` | Issue challan |
| `GET` | `/api/challans` | List challans |
| `PUT` | `/api/challans/:id/pay` | Pay challan |

</details>

---

## 🔒 Security Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Tokens** | Secure authentication with access & refresh tokens |
| 🛡️ **RBAC** | Role-Based Access Control for 6 different user types |
| 🔑 **Bcrypt** | Industry-standard password hashing |
| 🚫 **Rate Limiting** | Protection against brute force attacks |
| ✅ **Input Validation** | Comprehensive request validation |
| 🔒 **CORS** | Configured Cross-Origin Resource Sharing |

</div>

---

## 🧪 Testing

```bash
# Import Postman collection from backend/postman_collection.json
# Refer to backend/API_TESTING_GUIDE.md for detailed instructions
```

---

## 🤝 Contributing

<div align="center">

**Contributions are welcome! Here's how you can help:**

</div>

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. 📤 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🎉 **Open** a Pull Request

---

## 📄 License

<div align="center">

This project is developed for **educational and demonstration purposes**.

---

<br/>

**⭐ If you found this project helpful, please give it a star!**

<br/>

Made with ❤️ and ☕

</div>
