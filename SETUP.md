# HRMS Project Setup Guide

Complete setup and installation guide for the Human Resource Management System (HRMS).

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Backend Setup (Laravel)](#backend-setup-laravel)
5. [Frontend Setup (React)](#frontend-setup-react)
6. [Database Setup](#database-setup)
7. [Environment Configuration](#environment-configuration)
8. [Running the Application](#running-the-application)
9. [Default Credentials](#default-credentials)
10. [Features Overview](#features-overview)
11. [API Endpoints](#api-endpoints)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

This is a full-stack HRMS (Human Resource Management System) built with:
- **Backend**: Laravel 9 (PHP 8.0+)
- **Frontend**: React 18 with Vite
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **Email**: Gmail SMTP

### Key Features
- Role-based access control (Admin/Employee)
- Employee management
- Attendance tracking
- Leave/time-off management
- Payroll management
- Email verification
- Password reset functionality

---

## 📦 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **PHP**: 8.0 or higher
- **Composer**: Latest version
- **Node.js**: 16.x or higher
- **npm** or **yarn**: Latest version
- **MySQL**: 5.7 or higher (or MariaDB 10.3+)
- **Git**: For version control

### Optional but Recommended
- **XAMPP/WAMP/MAMP**: For local MySQL server
- **Postman**: For API testing
- **VS Code**: Recommended IDE

---

## 📁 Project Structure

```
hrms/
├── backend/                 # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/ # API Controllers
│   │   ├── Models/         # Eloquent Models
│   │   └── Mail/           # Email Templates
│   ├── config/             # Configuration files
│   ├── database/
│   │   ├── migrations/     # Database migrations
│   │   └── seeders/        # Database seeders
│   ├── routes/
│   │   └── api.php         # API routes
│   └── .env                # Environment variables
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Routing configuration
│   │   ├── api/            # API configuration
│   │   └── styles/         # CSS files
│   └── package.json
│
└── SETUP.md                # This file
```

---

## 🔧 Backend Setup (Laravel)

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
composer install
```

### Step 3: Create Environment File
```bash
cp .env.example .env
```

If `.env.example` doesn't exist, create `.env` manually with the following structure:

```env
APP_NAME=HRMS
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hrms_db
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

FRONTEND_URL=http://localhost:3000
```

### Step 4: Generate Application Key
```bash
php artisan key:generate
```

### Step 5: Configure Database
1. Create a MySQL database named `hrms_db` (or your preferred name)
2. Update `.env` file with your database credentials:
   ```env
   DB_DATABASE=hrms_db
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

### Step 6: Run Migrations
```bash
php artisan migrate
```

### Step 7: Seed Test Data (Optional)
```bash
php artisan db:seed --class=TestEmployeesSeeder
```

This will create 5 test employees. See `TEST_EMPLOYEES_CREDENTIALS.md` for login details.

### Step 8: Start Laravel Development Server
```bash
php artisan serve
```

The backend API will be available at: `http://localhost:8000`

---

## ⚛️ Frontend Setup (React)

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File (Optional)
Create `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

### Step 4: Start Development Server
```bash
npm run dev
```

The frontend will be available at: `http://localhost:3000`

---

## 🗄️ Database Setup

### Manual Database Creation

1. **Using MySQL Command Line:**
   ```sql
   CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Using phpMyAdmin:**
   - Open phpMyAdmin
   - Click "New" to create a database
   - Name it `hrms_db`
   - Select collation: `utf8mb4_unicode_ci`
   - Click "Create"

### Database Tables

The following tables will be created automatically when you run migrations:

- `users` - User accounts (admin and employees)
- `employee_profiles` - Employee profile information
- `attendances` - Attendance records
- `leaves` - Leave requests
- `salary_structures` - Payroll information
- `email_verifications` - Email verification tokens
- `password_resets` - Password reset tokens
- `personal_access_tokens` - Sanctum authentication tokens

---

## ⚙️ Environment Configuration

### Backend (.env)

#### Database Configuration
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hrms_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

#### Mail Configuration (Gmail)
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="HRMS"
```

**Note**: For Gmail, you need to:
1. Enable 2-Step Verification
2. Generate an App Password
3. Use the App Password in `MAIL_PASSWORD`

#### Frontend URL
```env
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🚀 Running the Application

### Development Mode

1. **Start Backend:**
   ```bash
   cd backend
   php artisan serve
   ```
   Backend runs on: `http://localhost:8000`

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on: `http://localhost:3000`

3. **Access the Application:**
   - Employee Login: `http://localhost:3000/login`
   - Admin Login: `http://localhost:3000/admin/login`
   - Admin Signup: `http://localhost:3000/admin/signup`

### Production Build

1. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Backend Production:**
   ```bash
   cd backend
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

---
database name :- auth_db;
## 🔐 Default Credentials

### Test Employees

After running the seeder, you can use these credentials:

**All employees use the same password:** `Test@1234`

| Employee | Employee ID | Email | Password |
|----------|-------------|-------|----------|
| John Smith | HRJOSM20240001 | john.smith@test.com | Test@1234 |
| Sarah Johnson | HRSJOH20240002 | sarah.johnson@test.com | Test@1234 |
| Michael Brown | HRMIBR20240003 | michael.brown@test.com | Test@1234 |
| Emily Davis | HREDAV20240004 | emily.davis@test.com | Test@1234 |
| David Wilson | HRDAWI20240005 | david.wilson@test.com | Test@1234 |

See `TEST_EMPLOYEES_CREDENTIALS.md` for complete details.

### Admin Account

Create an admin account by:
1. Visiting: `http://localhost:3000/admin/signup`
2. Fill in the registration form
3. Login at: `http://localhost:3000/admin/login`

---

## ✨ Features Overview

### Admin Features
- ✅ Employee Management (Create, View, Edit, Delete)
- ✅ Attendance Management (View all employees' attendance)
- ✅ Leave Management (Approve/Reject leave requests)
- ✅ Payroll Management (View and update salary structures)
- ✅ Dashboard with employee overview
- ✅ Search functionality across all pages

### Employee Features
- ✅ Profile Management (View and edit own profile)
- ✅ Attendance Tracking (Check-in/Check-out, view history)
- ✅ Leave Requests (Apply for leave, view status)
- ✅ Payroll View (Read-only salary information)
- ✅ Dashboard with personal statistics

### Common Features
- ✅ Role-based access control
- ✅ Email verification
- ✅ Password reset
- ✅ Secure authentication (Laravel Sanctum)
- ✅ Responsive design
- ✅ Global loader for API calls

---

## 🔌 API Endpoints

### Public Endpoints
- `POST /api/register` - Employee registration
- `POST /api/login` - User login (Employee ID or Email)
- `POST /api/admin/register` - Admin registration
- `POST /api/verify-email` - Email verification
- `POST /api/resend-verification` - Resend verification email
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password

### Protected Endpoints (Require Authentication)

#### Employee Endpoints
- `GET /api/employee/profile` - Get own profile
- `PUT /api/employee/profile` - Update own profile
- `GET /api/employee/attendance` - Get own attendance
- `POST /api/employee/attendance/check-in` - Check in
- `POST /api/employee/attendance/check-out` - Check out
- `GET /api/employee/attendance/today` - Today's status
- `GET /api/employee/leaves` - Get own leave requests
- `POST /api/employee/leaves` - Create leave request
- `GET /api/employee/payroll` - Get own payroll

#### Admin Endpoints
- `GET /api/admin/employees` - List all employees
- `POST /api/admin/employees` - Create employee
- `PUT /api/admin/employees/{id}` - Update employee
- `DELETE /api/admin/employees/{id}` - Delete employee
- `GET /api/admin/attendance` - Get all attendance
- `GET /api/admin/leaves` - Get all leave requests
- `PUT /api/admin/leaves/{id}/status` - Approve/Reject leave
- `GET /api/admin/payrolls` - Get all payrolls
- `GET /api/admin/payrolls/{userId}` - Get specific payroll
- `PUT /api/admin/payrolls/{userId}` - Update salary structure

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Database Connection Error**
```
SQLSTATE[HY000] [1045] Access denied for user
```
**Solution:**
- Check database credentials in `.env`
- Ensure MySQL service is running
- Verify database exists

#### 2. **Migration Error**
```
SQLSTATE[42S01]: Base table or view already exists
```
**Solution:**
```bash
php artisan migrate:fresh
```
⚠️ **Warning**: This will delete all existing data!

#### 3. **CORS Error**
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:**
- Check `config/cors.php` in backend
- Ensure `FRONTEND_URL` is set correctly in `.env`
- Clear config cache: `php artisan config:clear`

#### 4. **Email Not Sending**
```
Failed to send email
```
**Solution:**
- Verify Gmail credentials in `.env`
- Check if App Password is correct
- Ensure 2-Step Verification is enabled
- Check `storage/logs/laravel.log` for detailed errors

#### 5. **Port Already in Use**
```
Address already in use
```
**Solution:**
- Change port: `php artisan serve --port=8001`
- Or kill the process using the port

#### 6. **Module Not Found (Frontend)**
```
Cannot find module 'xxx'
```
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 7. **Token Expired**
```
401 Unauthorized
```
**Solution:**
- Clear browser localStorage
- Login again
- Check if token is being sent in headers

### Clear Caches

**Backend:**
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

---

## 📝 Additional Notes

### Email Configuration
- The system uses Gmail SMTP for sending emails
- Employee activation emails are sent automatically when admin creates an employee
- Email verification is optional for admin-created employees (auto-verified)
- Self-registered employees need to verify their email

### Security Features
- Password hashing using bcrypt
- CSRF protection
- Rate limiting on login attempts
- Token-based authentication (Laravel Sanctum)
- Role-based access control

### Development Tips
- Use browser DevTools to debug API calls
- Check `storage/logs/laravel.log` for backend errors
- Use React DevTools for frontend debugging
- Enable `APP_DEBUG=true` in `.env` for detailed error messages

---

## 📚 Additional Documentation

- `TEST_EMPLOYEES_CREDENTIALS.md` - Test employee login credentials
- `AUTO_GENERATE_EMPLOYEE_ID.md` - Employee ID generation logic
- `REQUIREMENTS_REVIEW.md` - Project requirements documentation

---

## 🆘 Support

If you encounter any issues:
1. Check the Troubleshooting section above
2. Review Laravel logs: `backend/storage/logs/laravel.log`
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

## 📄 License

This project is for educational/demonstration purposes.

---

**Last Updated**: January 2026

