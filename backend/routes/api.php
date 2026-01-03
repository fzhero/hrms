<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
// Employee registration (employees can sign up themselves - employee role only)
Route::post('/register', [AuthController::class, 'register']);

// Admin registration (public - for initial admin setup)
Route::post('/admin/register', [AdminController::class, 'register']);

// Login (supports Employee ID or Email)
Route::post('/login', [AuthController::class, 'login']);

// Email verification
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/resend-verification', [AuthController::class, 'resendVerification']);

// Password reset
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// Get authenticated user (any authenticated user can access)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
});

// ============================================
// ADMIN ONLY ROUTES (Strict Admin access)
// ============================================
Route::middleware(['auth:sanctum', 'role.admin'])->prefix('admin')->name('admin.')->group(function () {
    // Employee Management
    Route::get('/employees', [AdminController::class, 'listEmployees']);
    Route::post('/employees', [AdminController::class, 'createEmployee']);
    Route::get('/employees/{id}', [AdminController::class, 'getEmployee']);
    Route::put('/employees/{id}', [AdminController::class, 'updateEmployee']);
    Route::delete('/employees/{id}', [AdminController::class, 'deleteEmployee']);
    
    // Leave Management
    Route::get('/leaves', [\App\Http\Controllers\LeaveController::class, 'index']);
    Route::put('/leaves/{id}/status', [\App\Http\Controllers\LeaveController::class, 'updateStatus']);
    
    // Attendance Management
    Route::get('/attendances', [\App\Http\Controllers\AttendanceController::class, 'index']);
    Route::post('/attendances', [\App\Http\Controllers\AttendanceController::class, 'store']);
    
    // Payroll Management (Admin can view all and update any)
    Route::get('/payrolls', [\App\Http\Controllers\PayrollController::class, 'index']);
    Route::get('/payrolls/{userId}', [\App\Http\Controllers\PayrollController::class, 'show']);
    Route::put('/payrolls/{userId}', [\App\Http\Controllers\PayrollController::class, 'update']);
});

// ============================================
// EMPLOYEE ONLY ROUTES (Strict Employee access)
// ============================================
Route::middleware(['auth:sanctum', 'role.employee'])->prefix('employee')->name('employee.')->group(function () {
    // Profile Management
    Route::get('/profile', [\App\Http\Controllers\EmployeeController::class, 'getProfile']);
    Route::put('/profile', [\App\Http\Controllers\EmployeeController::class, 'updateProfile']);
    
    // Leave Requests
    Route::get('/leaves', [\App\Http\Controllers\LeaveController::class, 'index']);
    Route::post('/leaves', [\App\Http\Controllers\LeaveController::class, 'store']);
    Route::get('/leaves/{id}', [\App\Http\Controllers\LeaveController::class, 'show']);
    Route::post('/leaves/{id}/cancel', [\App\Http\Controllers\LeaveController::class, 'cancel']);
    
    // Attendance
    Route::get('/attendances', [\App\Http\Controllers\AttendanceController::class, 'index']);
    Route::post('/attendances/check-in', [\App\Http\Controllers\AttendanceController::class, 'checkIn']);
    Route::post('/attendances/check-out', [\App\Http\Controllers\AttendanceController::class, 'checkOut']);
    Route::get('/attendances/today', [\App\Http\Controllers\AttendanceController::class, 'todayStatus']);
    
    // View all employees (read-only for employees)
    Route::get('/employees', [\App\Http\Controllers\EmployeeController::class, 'listEmployees']);
    Route::get('/employees/{id}', [\App\Http\Controllers\EmployeeController::class, 'viewEmployee']);
    Route::get('/employees/statuses/today', [\App\Http\Controllers\EmployeeController::class, 'getEmployeeStatuses']);
    
    // Payroll (Employee can only view their own - read-only)
    Route::get('/payroll', [\App\Http\Controllers\PayrollController::class, 'show']);
});

// ============================================
// SHARED ROUTES (Both Admin and Employee)
// ============================================
// Routes accessible by both admin and employee (use conditional logic in controllers)
Route::middleware('auth:sanctum')->group(function () {
    // Profile (both admin and employee can access their own profile)
    Route::get('/profile', [\App\Http\Controllers\EmployeeController::class, 'getProfile']);
    Route::put('/profile', [\App\Http\Controllers\EmployeeController::class, 'updateProfile']);
    
    // Admin can also access employee profiles via /admin/employees/{id}
    // Employee can access their own via /employee/profile or /profile
});
