# 🚀 Authentication Starter - Hackathon Template

A complete, production-ready authentication starter project for hackathons with React frontend and Laravel backend.

## 📁 Project Structure

```
/project-root
│
├── frontend/        # React application (Vite)
│
└── backend/         # Laravel REST API
```

## ✨ Features

- ✅ **Frontend**: React with Vite, React Router, Axios
- ✅ **Backend**: Laravel 9 with Sanctum authentication
- ✅ **Complete Auth Flow**: Login, Signup, Protected Routes
- ✅ **Form Validation**: Client-side and server-side
- ✅ **CORS Configured**: Ready for frontend-backend communication
- ✅ **Clean UI**: Modern, minimal, hackathon-ready design
- ✅ **Token Management**: Automatic token handling with localStorage

---

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **PHP** (v8.0 or higher)
- **Composer** (PHP package manager)
- **MySQL** or **SQLite** database

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

### Step 3: Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` file and configure your database:

**For XAMPP MySQL (Recommended):**

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=auth_db
DB_USERNAME=root
DB_PASSWORD=
```

**For SQLite (easier for quick setup):**

```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

If using SQLite, create the database file:

```bash
touch database/database.sqlite
```

### Step 3.5: XAMPP Database Setup (If using MySQL)

**Quick Method using phpMyAdmin:**

1. Start XAMPP (Apache + MySQL)
2. Open: http://localhost/phpmyadmin
3. Click "SQL" tab
4. Copy and paste the SQL from `backend/database/create_database.sql`
5. Click "Go" to execute

**See detailed instructions in:** `backend/database/XAMPP_SETUP.md`

### Step 4: Generate Application Key

```bash
php artisan key:generate
```

### Step 5: Run Migrations

```bash
php artisan migrate
```

### Step 6: Start Laravel Server

```bash
php artisan serve
```

The backend API will be available at: **http://localhost:8000**

---

## 🎨 Frontend Setup (React)

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration (Optional)

Create a `.env` file in the `frontend` directory if you need to change the API URL:

```env
VITE_API_URL=http://localhost:8000/api
```

**Note**: The default API URL is already configured in `src/api/axios.js` as `http://localhost:8000/api`

### Step 4: Start Development Server

```bash
npm run dev
```

The frontend will be available at: **http://localhost:3000**

---

## 📡 API Endpoints

### Public Endpoints

#### Register User
```
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Success Response:**
```json
{
  "status": true,
  "message": "User registered successfully",
  "token": "1|xxxxxxxxxxxx",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login
```
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "status": true,
  "message": "Login successful",
  "token": "1|xxxxxxxxxxxx",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Protected Endpoints

#### Get Authenticated User
```
GET /api/user
Authorization: Bearer {token}
```

**Success Response:**
```json
{
  "status": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 🔐 Validation Rules

### Register
- **name**: Required, string, minimum 3 characters
- **email**: Required, valid email format, unique
- **password**: Required, minimum 6 characters
- **password_confirmation**: Required, must match password

### Login
- **email**: Required, valid email format
- **password**: Required

---

## 🎯 Usage

1. **Start Backend**: `cd backend && php artisan serve`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:3000`
4. **Sign Up**: Create a new account
5. **Login**: Sign in with your credentials
6. **Dashboard**: Access protected route after authentication

---

## 📦 Technologies Used

### Frontend
- React 18
- React Router DOM 6
- Axios
- Vite

### Backend
- Laravel 10
- Laravel Sanctum
- MySQL/SQLite

---

## 🐛 Troubleshooting

### CORS Issues
If you encounter CORS errors, make sure:
- Backend CORS is configured in `backend/config/cors.php`
- Frontend is running on `http://localhost:3000`
- Backend is running on `http://localhost:8000`

### Database Connection Issues
- Verify database credentials in `.env`
- Ensure database exists
- Check if migrations ran successfully: `php artisan migrate:status`

### Token Issues
- Clear browser localStorage if tokens are invalid
- Check if Sanctum is properly configured
- Verify API routes are using `auth:sanctum` middleware

---

## 📝 Notes

- Tokens are stored in `localStorage` on the frontend
- Protected routes automatically redirect to login if not authenticated
- All API responses follow a consistent format
- Code is clean, commented, and production-ready

---

## 🚀 Ready for Hackathons!

This starter template is designed to save you time during hackathons. Just:
1. Clone or download
2. Run setup commands
3. Start building your amazing project!

**Happy Hacking! 🎉**

