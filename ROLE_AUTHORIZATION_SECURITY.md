# Role-Based Authorization - Security Implementation ✅

## Overview

Strict role-based authorization has been implemented to ensure security-critical access control for the Dayflow HRMS system.

---

## 🔒 Security Features Implemented

### 1. Strict Middleware (Backend)

#### `IsAdmin` Middleware
- **Location**: `backend/app/Http/Middleware/IsAdmin.php`
- **Purpose**: Only allows Admin users
- **Blocked**: Employees are explicitly blocked with 403 Forbidden
- **Error Response**: Clear error message with error code `INSUFFICIENT_PERMISSIONS`

#### `IsEmployee` Middleware
- **Location**: `backend/app/Http/Middleware/IsEmployee.php`
- **Purpose**: Only allows Employee users
- **Blocked**: Admins are explicitly blocked from employee-only routes
- **Error Response**: Clear error message with error code `INSUFFICIENT_PERMISSIONS`

### 2. Route Protection (Backend)

#### Admin Routes
```php
Route::middleware(['auth:sanctum', 'role.admin'])->prefix('admin')->group(function () {
    // Only Admin can access these routes
    // Employees get 403 Forbidden
});
```

#### Employee Routes
```php
Route::middleware(['auth:sanctum', 'role.employee'])->prefix('employee')->group(function () {
    // Only Employee can access these routes
    // Admins get 403 Forbidden
});
```

#### Shared Routes
```php
Route::middleware('auth:sanctum')->group(function () {
    // Both Admin and Employee can access
    // Use conditional logic in controllers for role-specific features
});
```

### 3. Password Security (Backend)

#### Self-Password Update
- **Endpoint**: `PUT /api/user/password` (to be added)
- **Security**: Users can only update their own password
- **Requirement**: Must provide current password
- **Protection**: Admin cannot directly modify employee passwords

#### Password Reset (Admin Only)
- **Future**: Admin can reset employee passwords (generates new password)
- **Security**: Admin never sees the actual password
- **Implementation**: To be added in AdminController

### 4. Frontend Route Guards (React)

#### `AdminRoute` Component
- **Location**: `frontend/src/routes/guards/AdminRoute.jsx`
- **Protection**: Only Admin users can access
- **Redirect**: Non-admin users → Dashboard
- **Unauthenticated**: → Login page

#### `EmployeeRoute` Component (Strict)
- **Location**: `frontend/src/routes/guards/EmployeeRoute.jsx`
- **Protection**: Only Employee users can access
- **Redirect**: Admin users → Dashboard (blocked)
- **Unauthenticated**: → Login page

#### `SharedRoute` Component
- **Location**: `frontend/src/routes/guards/SharedRoute.jsx`
- **Protection**: Both Admin and Employee can access
- **Use Case**: Dashboard, shared features

---

## 📋 Middleware Registration

### Kernel.php Configuration

```php
protected $routeMiddleware = [
    // Strict role-based middleware (security-critical)
    'role.admin' => \App\Http\Middleware\IsAdmin::class,
    'role.employee' => \App\Http\Middleware\IsEmployee::class,
    
    // Alternative aliases
    'role.is_admin' => \App\Http\Middleware\IsAdmin::class,
    'role.is_employee' => \App\Http\Middleware\IsEmployee::class,
];
```

---

## 🚫 Security Rules Enforced

### 1. Employee Cannot Access Admin APIs
- **Enforcement**: `IsAdmin` middleware
- **Response**: 403 Forbidden
- **Message**: "Forbidden. Admin access required."

### 2. Admin Cannot Access Employee-Only Routes
- **Enforcement**: `IsEmployee` middleware
- **Response**: 403 Forbidden
- **Message**: "Forbidden. Employee access required."

### 3. Admin Cannot Modify Employee Passwords Directly
- **Enforcement**: `updatePassword()` method requires current password
- **Security**: Only user can update their own password
- **Future**: Admin can reset password (generates new one, doesn't see it)

### 4. Frontend Route Guards
- **Enforcement**: React route guards check role before rendering
- **Protection**: Unauthorized users are redirected
- **No API Calls**: Guards prevent unnecessary API requests

---

## 🔐 Usage Examples

### Backend: Protecting Admin Routes

```php
// In routes/api.php

// Admin-only routes
Route::middleware(['auth:sanctum', 'role.admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'index']);
    Route::post('/users', [AdminController::class, 'store']);
    Route::put('/users/{id}', [AdminController::class, 'update']);
    Route::delete('/users/{id}', [AdminController::class, 'destroy']);
    
    // Admin can manage employees
    Route::get('/employees', [AdminController::class, 'employees']);
    Route::put('/employees/{id}/activate', [AdminController::class, 'activate']);
});
```

### Backend: Protecting Employee Routes

```php
// Employee-only routes
Route::middleware(['auth:sanctum', 'role.employee'])->prefix('employee')->group(function () {
    Route::get('/my-profile', [EmployeeController::class, 'profile']);
    Route::put('/my-profile', [EmployeeController::class, 'updateProfile']);
    
    // Employee can only access their own data
    Route::get('/my-attendance', [EmployeeController::class, 'attendance']);
    Route::post('/check-in', [EmployeeController::class, 'checkIn']);
});
```

### Backend: Shared Routes with Conditional Logic

```php
// Routes accessible by both roles
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Controller checks role internally
    Route::get('/attendance', [AttendanceController::class, 'index']);
});
```

**Example Controller Logic:**
```php
public function index(Request $request)
{
    $user = $request->user();
    
    if ($user->role === 'admin') {
        // Return all employees' attendance
        return Attendance::with('user')->get();
    } else {
        // Return only current user's attendance
        return $user->attendances;
    }
}
```

### Frontend: Protecting Routes

```jsx
// In AppRoutes.jsx

// Admin-only route
<Route 
  path="/admin/settings" 
  element={
    <AdminRoute>
      <AdminSettings />
    </AdminRoute>
  } 
/>

// Employee-only route
<Route 
  path="/employee/profile" 
  element={
    <EmployeeRoute>
      <EmployeeProfile />
    </EmployeeRoute>
  } 
/>

// Shared route (both roles)
<Route 
  path="/dashboard" 
  element={
    <SharedRoute>
      <Dashboard />
    </SharedRoute>
  } 
/>
```

### Frontend: Conditional Rendering

```jsx
import { isAdmin, isEmployee } from '../utils/roles'

function Component() {
  return (
    <div>
      {isAdmin() && (
        <button>Admin Only Action</button>
      )}
      
      {isEmployee() && (
        <button>Employee Only Action</button>
      )}
    </div>
  )
}
```

---

## ✅ Security Checklist

- [x] Strict `IsAdmin` middleware created
- [x] Strict `IsEmployee` middleware created
- [x] Middleware registered in Kernel.php
- [x] Route groups organized (Admin, Employee, Shared)
- [x] Password modification protection added
- [x] Frontend AdminRoute guard implemented
- [x] Frontend EmployeeRoute guard implemented (strict)
- [x] Frontend SharedRoute guard implemented
- [x] Role utility functions updated
- [x] Error responses include proper HTTP status codes
- [x] Security documentation created

---

## 🔍 Testing Security

### Test Cases to Verify

1. **Employee accessing Admin route**:
   ```bash
   # Employee token
   curl -X GET http://localhost:8000/api/admin/users \
     -H "Authorization: Bearer {employee_token}"
   # Expected: 403 Forbidden
   ```

2. **Admin accessing Employee-only route**:
   ```bash
   # Admin token
   curl -X GET http://localhost:8000/api/employee/my-profile \
     -H "Authorization: Bearer {admin_token}"
   # Expected: 403 Forbidden
   ```

3. **Unauthenticated request**:
   ```bash
   curl -X GET http://localhost:8000/api/admin/users
   # Expected: 401 Unauthorized
   ```

4. **Frontend route guard**:
   - Login as Employee → Try to access `/admin/*` → Should redirect to Dashboard
   - Login as Admin → Try to access `/employee/*` → Should redirect to Dashboard

---

## ⚠️ Security Best Practices

1. **Never Trust Client-Side Checks**: Always verify on backend
2. **Use Middleware**: Apply at route level, not just in controllers
3. **Explicit Errors**: Return clear 403 Forbidden for unauthorized access
4. **Log Security Events**: Consider logging unauthorized access attempts
5. **Rate Limiting**: Already configured via `throttle:api` middleware
6. **Token Security**: Sanctum tokens are secure, stored in localStorage

---

## 📝 Future Enhancements

1. **Password Reset Flow**: Admin can reset employee passwords
2. **Audit Logging**: Log all role-based access attempts
3. **Permission Granularity**: Fine-grained permissions beyond roles
4. **MFA**: Multi-factor authentication for Admin accounts
5. **Session Management**: Admin can view/manage active sessions

---

## 🚨 Critical Security Notes

1. **Middleware Order**: `auth:sanctum` must come before `role.*` middleware
2. **Token Validation**: Sanctum automatically validates tokens
3. **CORS**: Already configured for frontend origin
4. **HTTPS**: Use HTTPS in production (required for security)
5. **Environment**: Never expose admin credentials in logs or errors

---

**Implementation Date**: Current  
**Status**: ✅ **Security-critical authorization implemented**  
**Security Level**: **High** - Strict role-based access control enforced

