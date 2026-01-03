<?php

use App\Http\Controllers\AuthController;
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
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// Get authenticated user (any authenticated user can access)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
});

// ============================================
// ADMIN ONLY ROUTES (Strict Admin access)
// ============================================
Route::middleware(['auth:sanctum', 'role.admin'])->prefix('admin')->name('admin.')->group(function () {
    // Admin routes will be added here
    // Example:
    // Route::get('/users', [AdminController::class, 'index']);
    // Route::post('/users', [AdminController::class, 'store']);
    // Route::put('/users/{id}', [AdminController::class, 'update']);
    // Route::delete('/users/{id}', [AdminController::class, 'destroy']);
});

// ============================================
// EMPLOYEE ONLY ROUTES (Strict Employee access)
// ============================================
Route::middleware(['auth:sanctum', 'role.employee'])->prefix('employee')->name('employee.')->group(function () {
    // Employee-only routes will be added here
    // Example:
    // Route::get('/profile', [EmployeeController::class, 'profile']);
    // Route::put('/profile', [EmployeeController::class, 'updateProfile']);
});

// ============================================
// SHARED ROUTES (Both Admin and Employee)
// ============================================
// Routes accessible by both admin and employee (use conditional logic in controllers)
Route::middleware('auth:sanctum')->group(function () {
    // Shared routes will be added here
    // Example:
    // Route::get('/dashboard', [DashboardController::class, 'index']);
    // Route::get('/attendance', [AttendanceController::class, 'index']);
});
