<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EmployeeProfile;
use App\Models\Attendance;
use App\Models\Leave;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class EmployeeController extends Controller
{
    /**
     * Get employee profile
     * Employee: Can view their own profile
     * Admin: Can view any employee profile
     */
    public function getProfile(Request $request, $id = null)
    {
        try {
            $user = $request->user();
            $targetUserId = $id ?? $user->id;

            // Employee can only view their own profile
            if ($user->role === 'employee' && $targetUserId != $user->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized access.',
                ], 403);
            }

            $targetUser = User::with('employeeProfile')->findOrFail($targetUserId);

            return response()->json([
                'status' => true,
                'data' => [
                    'id' => $targetUser->id,
                    'employee_id' => $targetUser->employee_id,
                    'name' => $targetUser->name,
                    'email' => $targetUser->email,
                    'role' => $targetUser->role,
                    'profile' => $targetUser->employeeProfile,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Employee not found.',
            ], 404);
        }
    }

    /**
     * List all employees (read-only for employees)
     */
    public function listEmployees(Request $request)
    {
        try {
            $query = User::with('employeeProfile')
                        ->where('role', 'employee') // Only show employees, not admins
                        ->whereNotNull('employee_id'); // Only users with employee IDs

            // Search by name, email, or employee_id
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('employee_id', 'like', "%{$search}%");
                });
            }

            $employees = $query->orderBy('name', 'asc')
                              ->paginate($request->get('per_page', 50));

            return response()->json([
                'status' => true,
                'data' => $employees,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Employee list error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch employees.',
            ], 500);
        }
    }

    /**
     * View employee details (read-only)
     */
    public function viewEmployee(Request $request, $id)
    {
        try {
            $employee = User::with('employeeProfile')
                           ->where('role', 'employee')
                           ->whereNotNull('employee_id')
                           ->findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => [
                    'id' => $employee->id,
                    'employee_id' => $employee->employee_id,
                    'name' => $employee->name,
                    'email' => $employee->email,
                    'role' => $employee->role,
                    'profile' => $employee->employeeProfile,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Employee not found.',
            ], 404);
        }
    }

    /**
     * Get employee statuses for dashboard (attendance and leave status)
     */
    public function getEmployeeStatuses(Request $request)
    {
        try {
            $today = \Carbon\Carbon::today()->format('Y-m-d');
            $statuses = [];

            // Get all employees
            $employees = User::where('role', 'employee')
                            ->whereNotNull('employee_id')
                            ->get();

            // Get today's attendance
            $attendances = \App\Models\Attendance::where('date', $today)
                                                ->whereIn('user_id', $employees->pluck('id'))
                                                ->get()
                                                ->keyBy('user_id');

            // Get active leaves for today
            $leaves = \App\Models\Leave::where('status', 'approved')
                                     ->where('from_date', '<=', $today)
                                     ->where('to_date', '>=', $today)
                                     ->whereIn('user_id', $employees->pluck('id'))
                                     ->get()
                                     ->keyBy('user_id');

            foreach ($employees as $employee) {
                if ($leaves->has($employee->id)) {
                    $statuses[$employee->id] = 'on_leave';
                } elseif ($attendances->has($employee->id) && $attendances[$employee->id]->check_in) {
                    $statuses[$employee->id] = 'present';
                } else {
                    $statuses[$employee->id] = 'absent';
                }
            }

            return response()->json([
                'status' => true,
                'data' => $statuses,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Employee statuses error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch employee statuses.',
            ], 500);
        }
    }

    /**
     * Update employee profile
     * Employee: Can update their own profile
     * Admin: Can update any employee profile
     */
    public function updateProfile(Request $request, $id = null)
    {
        try {
            $user = $request->user();
            $targetUserId = $id ?? $user->id;

            // Employee can only update their own profile
            if ($user->role === 'employee' && $targetUserId != $user->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized access.',
                ], 403);
            }

            $targetUser = User::with('employeeProfile')->findOrFail($targetUserId);

            $validated = $request->validate([
                'name' => 'sometimes|string|min:3',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'department' => 'nullable|string|max:100',
                'designation' => 'nullable|string|max:100',
                'profile_photo' => 'nullable|string', // URL or base64 - handle as needed
            ]);

            // Update user basic info
            if (isset($validated['name'])) {
                $targetUser->name = $validated['name'];
                $targetUser->save();
            }

            // Update or create employee profile
            $profileData = array_filter([
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'department' => $validated['department'] ?? null,
                'designation' => $validated['designation'] ?? null,
                'profile_photo' => $validated['profile_photo'] ?? null,
            ], function($value) {
                return $value !== null;
            });

            if (!empty($profileData)) {
                $targetUser->employeeProfile()->updateOrCreate(
                    ['user_id' => $targetUserId],
                    $profileData
                );
            }

            $targetUser->refresh();
            $targetUser->load('employeeProfile');

            return response()->json([
                'status' => true,
                'message' => 'Profile updated successfully.',
                'data' => [
                    'id' => $targetUser->id,
                    'employee_id' => $targetUser->employee_id,
                    'name' => $targetUser->name,
                    'email' => $targetUser->email,
                    'role' => $targetUser->role,
                    'profile' => $targetUser->employeeProfile,
                ],
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Profile update error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update profile.',
            ], 500);
        }
    }
}

