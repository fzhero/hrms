<?php

namespace App\Http\Controllers;

use App\Models\SalaryStructure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PayrollController extends Controller
{
    /**
     * Get salary structure for a specific employee (Admin can view any, Employee can view only their own)
     */
    public function show(Request $request, $userId = null)
    {
        try {
            $user = $request->user();
            $targetUserId = $userId ?? $user->id;

            // Employee can only view their own salary
            if ($user->role === 'employee' && $targetUserId != $user->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized access.',
                ], 403);
            }

            $salaryStructure = SalaryStructure::where('user_id', $targetUserId)->first();

            // If no structure exists, return default structure
            if (!$salaryStructure) {
                $targetUser = User::find($targetUserId);
                $monthlyWage = $targetUser?->employeeProfile?->salary ?? 50000;
                $components = SalaryStructure::calculateComponents($monthlyWage);
                
                $salaryStructure = [
                    'user_id' => $targetUserId,
                    'monthly_wage' => $monthlyWage,
                    'yearly_wage' => $monthlyWage * 12,
                    'working_days_per_week' => 5,
                    'break_time_hours' => 1.0,
                    ...$components,
                ];
            } else {
                $salaryStructure = $salaryStructure->toArray();
            }

            return response()->json([
                'status' => true,
                'data' => $salaryStructure,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Salary fetch error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch salary information.',
            ], 500);
        }
    }

    /**
     * Update salary structure (Admin only)
     */
    public function update(Request $request, $userId)
    {
        try {
            $user = $request->user();

            // Only admin can update salary structures
            if ($user->role !== 'admin') {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Only admins can update salary structures.',
                ], 403);
            }

            $validated = $request->validate([
                'monthly_wage' => 'required|numeric|min:0',
                'working_days_per_week' => 'nullable|integer|min:1|max:7',
                'break_time_hours' => 'nullable|numeric|min:0|max:24',
            ], [
                'monthly_wage.required' => 'Monthly wage is required.',
                'monthly_wage.numeric' => 'Monthly wage must be a number.',
                'monthly_wage.min' => 'Monthly wage must be at least 0.',
            ]);

            // Calculate all components based on monthly wage
            $monthlyWage = $validated['monthly_wage'];
            $yearlyWage = $monthlyWage * 12;
            $components = SalaryStructure::calculateComponents($monthlyWage);

            $salaryStructure = SalaryStructure::updateOrCreate(
                ['user_id' => $userId],
                array_merge([
                    'monthly_wage' => $monthlyWage,
                    'yearly_wage' => $yearlyWage,
                    'working_days_per_week' => $validated['working_days_per_week'] ?? 5,
                    'break_time_hours' => $validated['break_time_hours'] ?? 1.0,
                ], $components)
            );

            // Also update the salary in employee_profile
            $targetUser = User::find($userId);
            if ($targetUser && $targetUser->employeeProfile) {
                $targetUser->employeeProfile->update(['salary' => $monthlyWage]);
            }

            return response()->json([
                'status' => true,
                'message' => 'Salary structure updated successfully.',
                'data' => $salaryStructure->load('user:id,name,employee_id'),
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Salary update error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update salary structure.',
            ], 500);
        }
    }

    /**
     * Get all employees' payroll information (Admin only)
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // Only admin can view all payrolls
            if ($user->role !== 'admin') {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Only admins can view all payrolls.',
                ], 403);
            }

            $query = User::with(['salaryStructure', 'employeeProfile'])
                ->where('role', 'employee');

            // Search filter
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('employee_id', 'like', "%{$search}%");
                });
            }

            $employees = $query->paginate($request->get('per_page', 15));

            // Format response with salary data
            $employees->getCollection()->transform(function($employee) {
                $salaryStructure = $employee->salaryStructure;
                if (!$salaryStructure && $employee->employeeProfile) {
                    $monthlyWage = $employee->employeeProfile->salary ?? 0;
                    $components = SalaryStructure::calculateComponents($monthlyWage);
                    $salaryStructure = (object) [
                        'monthly_wage' => $monthlyWage,
                        'yearly_wage' => $monthlyWage * 12,
                        'working_days_per_week' => 5,
                        'break_time_hours' => 1.0,
                        ...$components,
                    ];
                }
                $employee->salary_data = $salaryStructure;
                return $employee;
            });

            return response()->json([
                'status' => true,
                'data' => $employees,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Payroll list error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch payroll information.',
            ], 500);
        }
    }
}
