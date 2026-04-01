# Finance Data Processing & Access Control Backend

A modular, production-ready backend API for managing financial records with JWT authentication, role-based access control (RBAC), and SQL-powered analytics.

Built with **Node.js**, **Express.js**, **MySQL**, and **Sequelize ORM**.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Sample Request/Response](#sample-requestresponse)
- [Role-Based Access Matrix](#role-based-access-matrix)
- [Assumptions](#assumptions)
- [Tradeoffs](#tradeoffs)

---

## Features

- **JWT Authentication** with HTTP-only cookies (XSS-safe)
- **Role-Based Access Control**: Viewer, Analyst, Admin
- **Financial Record Management**: Full CRUD with soft delete
- **Dashboard Analytics**: SQL-level aggregation (SUM, GROUP BY, DATE_FORMAT)
- **Input Validation**: Custom validators, no external libraries
- **Consistent Error Handling**: Global error handler with proper HTTP status codes
- **Clean Architecture**: Strict separation of concerns across layers

---

## Project Structure

```
finance-backend/
├── server.js                   # Entry point
├── config/
│   ├── db.js                   # Sequelize DB connection
│   └── constants.js            # App-wide enums & constants
├── models/
│   ├── index.js                # Model associations & db export
│   ├── User.js                 # User model with bcrypt hooks
│   └── Transaction.js          # Transaction model with soft delete
├── middlewares/
│   ├── auth.js                 # JWT verification from cookies
│   ├── authorize.js            # Role-based access: authorize(...roles)
│   └── errorHandler.js         # Global error handler
├── controllers/
│   ├── authController.js       # Register, login, logout
│   ├── userController.js       # Admin user management
│   ├── transactionController.js# CRUD + filtered listing
│   └── dashboardController.js  # SQL aggregate analytics
├── routes/
│   ├── authRoutes.js           # /api/auth/*
│   ├── userRoutes.js           # /api/users/*
│   ├── transactionRoutes.js    # /api/transactions/*
│   └── dashboardRoutes.js      # /api/dashboard/*
├── utils/
│   ├── ApiError.js             # Custom error class
│   ├── ApiResponse.js          # Standardized response wrapper
│   └── validators.js           # Input validation helpers
├── .env                        # Environment variables (not committed)
├── .env.example                # Env template
└── .gitignore
```

---

## Setup Instructions

### Prerequisites

- **Node.js** v16 or higher
- **MySQL** 8.0 or higher
- **npm** v8 or higher

### 1. Clone & Install

```bash
cd finance-backend
npm install
```

### 2. Create MySQL Database

```sql
CREATE DATABASE finance_db;
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_USER=root
DB_PASS=your_actual_mysql_password
DB_NAME=finance_db
JWT_SECRET=your_strong_secret_key
```

### 4. Start the Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The server will:
1. Connect to MySQL
2. Sync database tables automatically (via `sequelize.sync({ alter: true })`)
3. Start listening on the configured PORT (default: 5000)

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASS` | MySQL password | — |
| `DB_NAME` | Database name | `finance_db` |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `COOKIE_MAX_AGE` | Cookie max age (ms) | `604800000` (7 days) |

---

## API Documentation

### Auth Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and get JWT cookie |
| POST | `/api/auth/logout` | Public | Clear JWT cookie |

### User Management Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| PUT | `/api/users/:id/role` | Admin | Update user's role |
| PATCH | `/api/users/:id/status` | Admin | Toggle user active/inactive |

### Transaction Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/transactions` | Admin | Create new transaction |
| GET | `/api/transactions` | All Roles* | List transactions (with filters) |
| GET | `/api/transactions/:id` | All Roles | Get transaction by ID |
| PUT | `/api/transactions/:id` | Admin | Update transaction |
| DELETE | `/api/transactions/:id` | Admin | Soft delete transaction |

> *Viewer sees only their own transactions. Analyst and Admin see all.

**Query Filters for GET /api/transactions:**
- `?startDate=2024-01-01` — Filter by start date
- `?endDate=2024-12-31` — Filter by end date
- `?category=salary` — Filter by category
- `?type=income` — Filter by type (income/expense)

### Dashboard Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/summary` | All Roles | Total income, expenses, net balance |
| GET | `/api/dashboard/category-totals` | All Roles | Totals grouped by category |
| GET | `/api/dashboard/trends` | All Roles | Monthly income/expense trends |
| GET | `/api/dashboard/recent` | All Roles | Last 5 transactions |

### Health Check

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/health` | Public | Server status check |

---

## Sample Request/Response

### Register User

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "role": "analyst"
}
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "analyst",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```
> JWT token is set in an HTTP-only cookie named `token`.

---

### Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123"
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "analyst",
      "status": "active"
    }
  }
}
```

---

### Create Transaction

**Request:**
```http
POST /api/transactions
Content-Type: application/json
Cookie: token=<jwt_token>

{
  "amount": 5000.00,
  "type": "income",
  "category": "salary",
  "date": "2024-01-15",
  "notes": "January salary"
}
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "id": "f1e2d3c4-b5a6-7890-fedc-ba0987654321",
      "amount": "5000.00",
      "type": "income",
      "category": "salary",
      "date": "2024-01-15",
      "notes": "January salary",
      "createdBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "isDeleted": false,
      "createdAt": "2024-01-15T10:35:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

---

### Get All Transactions (with filters)

**Request:**
```http
GET /api/transactions?type=income&startDate=2024-01-01&endDate=2024-12-31
Cookie: token=<jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Transactions fetched successfully",
  "data": {
    "transactions": [
      {
        "id": "f1e2d3c4-b5a6-7890-fedc-ba0987654321",
        "amount": "5000.00",
        "type": "income",
        "category": "salary",
        "date": "2024-01-15",
        "notes": "January salary",
        "createdBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "isDeleted": false,
        "creator": {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "count": 1
  }
}
```

---

### Dashboard Summary

**Request:**
```http
GET /api/dashboard/summary
Cookie: token=<jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard summary fetched successfully",
  "data": {
    "totalIncome": 15000.00,
    "totalExpenses": 8500.00,
    "netBalance": 6500.00
  }
}
```

> **Implementation Detail:** Uses a single SQL query with `SUM(CASE WHEN type='income' THEN amount ELSE 0 END)` — one database round-trip, zero application-level math.

---

### Monthly Trends

**Request:**
```http
GET /api/dashboard/trends
Cookie: token=<jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Monthly trends fetched successfully",
  "data": {
    "trends": [
      { "month": "2024-03", "income": 5000.00, "expenses": 3200.00 },
      { "month": "2024-02", "income": 5000.00, "expenses": 2800.00 },
      { "month": "2024-01", "income": 5000.00, "expenses": 2500.00 }
    ]
  }
}
```

---

### Error Response Examples

**400 Validation Error:**
```json
{
  "success": false,
  "message": "Amount must be a number greater than 0, Category is required"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. No token provided. Please login."
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Required role(s): admin. Your role: viewer"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

---

## Role-Based Access Matrix

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| Register/Login/Logout | ✅ | ✅ | ✅ |
| View own transactions | ✅ | ✅ | ✅ |
| View all transactions | ❌ | ✅ | ✅ |
| Create transactions | ❌ | ❌ | ✅ |
| Update transactions | ❌ | ❌ | ✅ |
| Delete transactions | ❌ | ❌ | ✅ |
| View dashboard | ✅ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## Assumptions

1. **Single Admin at Start**: The first user can register with `role: admin`. In production, admin creation would be seeded or restricted.
2. **No Pagination**: Transaction listing returns all matching records. For large datasets, pagination (limit/offset) would be added.
3. **Dashboard Shows Global Data**: Dashboard aggregates are computed across all non-deleted transactions, regardless of who created them.
4. **Soft Delete is Permanent**: There is no "restore" endpoint. A soft-deleted record is effectively invisible but preserved in the database.
5. **No Rate Limiting**: Not implemented to keep scope manageable. Would use `express-rate-limit` in production.
6. **Single Server**: No clustering or load balancing. Suitable for evaluation, not production scale.
7. **Cookie-only Auth**: No support for Authorization header / Bearer token. Cookies are the sole authentication mechanism.

---

## Tradeoffs

| Decision | Benefit | Cost |
|----------|---------|------|
| **UUIDs over auto-increment** | Prevents ID enumeration attacks; safe for public APIs | Slightly larger storage; less human-readable |
| **Raw SQL for dashboard** | Full control over aggregate functions; demonstrates SQL skills | Less abstraction than Sequelize query builders |
| **Custom validators over Joi/Zod** | Transparent logic; no external dependency; evaluator can read everything | More manual maintenance; less feature-rich |
| **HTTP-only cookies over localStorage** | XSS-resistant; automatic inclusion in requests | Requires CORS credentials config; CSRF consideration |
| **Soft delete over hard delete** | Data preservation; audit trail; reversibility potential | Database bloat over time; must filter `isDeleted` everywhere |
| **Sequelize sync over migrations** | Simpler setup; auto-creates tables | Less control in production; not recommended for production deployments |
| **No external middleware (helmet, etc.)** | Simpler codebase; focused on assignment requirements | Missing production security headers |

---

## HTTP Status Codes Used

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (new resource) |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing/invalid/expired JWT |
| 403 | Forbidden | Insufficient role; inactive account |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email registration |
| 500 | Internal Server Error | Unexpected server errors |

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **ORM**: Sequelize v6
- **Authentication**: JSON Web Tokens (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Environment Config**: dotenv
