# Dayflow HRMS - Base Project Setup Complete ✅

## Setup Summary

The base project structure has been configured with role-based access control (RBAC) for the Dayflow HRMS system.

---

## ✅ Completed Setup Tasks

### 1. Backend (Laravel) Setup

#### Database Migration
- ✅ **Created migration**: `2024_01_01_000001_add_role_to_users_table.php`
  - Adds `role` enum field to users table
  - Values: `employee`, `hr`, `admin`
  - Default: `employee`

**To apply migration:**
```bash
cd backend
php artisan migrate
```

#### Middleware Created
- ✅ **CheckAdmin** (`backend/app/Http/Middleware/CheckAdmin.php`)
  - Restricts access to Admin only
  
- ✅ **CheckHR** (`backend/app/Http/Middleware/CheckHR.php`)
  - Allows access to HR and Admin
  
- ✅ **CheckEmployee** (`backend/app/Http/Middleware/CheckEmployee.php`)
  - Allows access to all authenticated users (Employee, HR, Admin)

**Middleware Registration:**
- ✅ Registered in `backend/app/Http/Kernel.php`
  - `role.admin` → CheckAdmin
  - `role.hr` → CheckHR
  - `role.employee` → CheckEmployee

#### Model Updates
- ✅ **User Model** (`backend/app/Models/User.php`)
  - Added `role` to `$fillable` array

#### Controller Updates
- ✅ **AuthController** (`backend/app/Http/Controllers/AuthController.php`)
  - Updated `register()`, `login()`, and `user()` methods
  - Now returns `role` in user response

#### API Configuration
- ✅ **CORS** (`backend/config/cors.php`)
  - Already configured for `http://localhost:3000`
  - Credentials support enabled

- ✅ **Sanctum** (`backend/config/sanctum.php`)
  - Already configured for API authentication

---

### 2. Frontend (React) Setup

#### API Service
- ✅ **Axios Configuration** (`frontend/src/api/axios.js`)
  - Base URL: `http://localhost:8000/api`
  - Auto-attaches Bearer token from localStorage
  - Handles 401 errors (auto-redirect to login)
  - Request/Response interceptors configured

#### Role Utilities
- ✅ **Role Helper Functions** (`frontend/src/utils/roles.js`)
  - `getUserRole()` - Get user role from localStorage
  - `getUser()` - Get user object
  - `isAdmin()` - Check if user is Admin
  - `isHR()` - Check if user is HR
  - `isEmployee()` - Check if user is Employee
  - `isAdminOrHR()` - Check if user is Admin or HR
  - `hasRole(roles)` - Check if user has any of specified roles
  - `isAuthenticated()` - Check if user is logged in

#### Route Guards
- ✅ **AdminRoute** (`frontend/src/routes/guards/AdminRoute.jsx`)
  - Protects routes for Admin only
  - Redirects to login if not authenticated
  - Redirects to dashboard if not Admin

- ✅ **HRRoute** (`frontend/src/routes/guards/HRRoute.jsx`)
  - Protects routes for HR and Admin
  - Redirects to login if not authenticated
  - Redirects to dashboard if not HR/Admin

- ✅ **EmployeeRoute** (`frontend/src/routes/guards/EmployeeRoute.jsx`)
  - Protects routes for all authenticated users
  - Redirects to login if not authenticated
  - Allows Admin/HR to access employee routes

#### Routes Updated
- ✅ **AppRoutes** (`frontend/src/routes/AppRoutes.jsx`)
  - Dashboard route now uses `EmployeeRoute` guard
  - Route guards imported and ready to use

---

## 🔧 How to Use

### Backend: Protecting Routes

```php
// In routes/api.php

// Admin only
Route::middleware(['auth:sanctum', 'role.admin'])->group(function () {
    Route::get('/admin/users', [AdminController::class, 'index']);
});

// HR and Admin
Route::middleware(['auth:sanctum', 'role.hr'])->group(function () {
    Route::get('/hr/employees', [HRController::class, 'index']);
});

// All authenticated users
Route::middleware(['auth:sanctum', 'role.employee'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
});
```

### Frontend: Protecting Routes

```jsx
// In AppRoutes.jsx

// Admin only route
<Route 
  path="/admin/settings" 
  element={
    <AdminRoute>
      <AdminSettings />
    </AdminRoute>
  } 
/>

// HR and Admin route
<Route 
  path="/hr/employees" 
  element={
    <HRRoute>
      <EmployeeManagement />
    </HRRoute>
  } 
/>

// All authenticated users
<Route 
  path="/profile" 
  element={
    <EmployeeRoute>
      <Profile />
    </EmployeeRoute>
  } 
/>
```

### Frontend: Conditional Rendering

```jsx
import { isAdmin, isHR, isAdminOrHR } from '../utils/roles'

function Component() {
  return (
    <div>
      {isAdmin() && <AdminPanel />}
      {isHR() && <HRPanel />}
      {isAdminOrHR() && <AdminHRPanel />}
    </div>
  )
}
```

---

## 🚀 Next Steps

### Before Starting Feature Implementation:

1. **Run Migration**
   ```bash
   cd backend
   php artisan migrate
   ```

2. **Update Existing Users** (if any)
   ```bash
   php artisan tinker
   # Then in tinker:
   User::whereNull('role')->update(['role' => 'employee']);
   ```

3. **Create Test Users** (optional)
   ```bash
   php artisan tinker
   # Admin user
   User::create([
       'name' => 'Admin User',
       'email' => 'admin@dayflow.com',
       'password' => Hash::make('password'),
       'role' => 'admin'
   ]);
   
   # HR user
   User::create([
       'name' => 'HR User',
       'email' => 'hr@dayflow.com',
       'password' => Hash::make('password'),
       'role' => 'hr'
   ]);
   ```

4. **Verify Setup**
   - Start Laravel server: `php artisan serve`
   - Start React dev server: `npm run dev`
   - Test login - user object should include `role` field
   - Test route guards - try accessing protected routes

---

## 📋 API Endpoints Available

### Public Routes
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Protected Routes (auth:sanctum)
- `GET /api/user` - Get authenticated user (includes role)

---

## 🔐 Role Hierarchy

```
Admin (highest)
  ├── Can access all routes
  ├── Can manage all employees
  └── Full system access

HR (middle)
  ├── Can access HR and Employee routes
  ├── Can manage employees
  └── Cannot access Admin-only features

Employee (lowest)
  ├── Can access Employee routes only
  ├── Can view own data
  └── Limited permissions
```

---

## ✅ Setup Verification Checklist

- [x] Folders verified (frontend/backend exist)
- [x] Axios service configured with base URL
- [x] Sanctum auth handling configured
- [x] Role migration created
- [x] Role middleware created (Admin, HR, Employee)
- [x] Middleware registered in Kernel
- [x] User model updated with role
- [x] AuthController returns role in responses
- [x] Frontend role utilities created
- [x] Frontend route guards created (AdminRoute, HRRoute, EmployeeRoute)
- [x] CORS configured
- [x] API routes structure ready

---

## 📝 Notes

- **Authentication**: Existing auth system is preserved and enhanced
- **Role Assignment**: Currently set to 'employee' by default on registration
- **Token Handling**: Sanctum tokens are stored in localStorage
- **Auto-Redirect**: 401 errors automatically redirect to login

---

**Setup Date**: Current  
**Status**: ✅ **Ready for feature implementation**

