# RTO Management System - Backend

A simple backend API for RTO (Regional Transport Office) Management System built with Node.js, TypeScript, Express.js, and PostgreSQL.

## Tech Stack

- Node.js (LTS)
- TypeScript
- Express.js
- PostgreSQL with pg
- JWT for authentication
- bcrypt for password hashing

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rto_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
```

### 3. Database Setup

Create a PostgreSQL database named `rto_management` and run the SQL files in `src/models/` manually to create the tables.

### 4. Run the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## API Modules

### Health Check
- `GET /health` - Server health status

### Users & Authentication
- `GET /users` - List all users (Admin only)
- `PUT /users/:id/status` - Update user status (Admin only)

### RTO Offices
- `POST /rto-offices` - Create RTO office (Admin only)
- `GET /rto-offices` - List all RTO offices

### Driving License Applications
- `POST /dl-applications` - Apply for DL (Citizen only)
- `GET /dl-applications` - View all applications (Admin/Officer)
- `PUT /dl-applications/:id/approve` - Approve application (Admin/Officer)
- `PUT /dl-applications/:id/reject` - Reject application (Admin/Officer)

### Challans
- `POST /challans` - Issue challan (Police only)
- `GET /challans/vehicle/:vehicleId` - Get challans by vehicle
- `GET /challans/my` - Get my challans (Citizen)

### Payments
- `POST /payments/:challanId/pay` - Pay challan (Citizen only)
- `GET /payments/my` - Get my payments (Citizen)

### Appointments
- `POST /appointments/book` - Book appointment (Citizen only)
- `GET /appointments/my` - Get my appointments (Citizen)
- `PUT /appointments/:id/cancel` - Cancel appointment (Citizen)

### Notifications
- `GET /notifications` - Get my notifications
- `PUT /notifications/:id/read` - Mark notification as read

## Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Roles

- **ADMIN** - Full system access
- **OFFICER** - RTO officer operations
- **CITIZEN** - Regular user operations
- **POLICE** - Challan operations
