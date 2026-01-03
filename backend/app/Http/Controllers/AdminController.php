<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EmployeeProfile;
use App\Services\EmployeeIdGenerator;
use App\Services\PasswordGenerator;
use App\Services\PasswordValidator;
use App\Mail\EmployeeActivationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    /**
     * Admin Signup - Create admin account
     * Public endpoint for initial admin registration
     */
    public function register(Request $request)
    {
        try {
            // Validate request data
            $validated = $request->validate([
                'name' => 'required|string|min:3',
                'email' => 'required|email|unique:users',
                'password' => 'required|min:8|confirmed',
                'company_name' => 'nullable|string|max:255',
                'company_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Force role to 'admin' for admin signup
            $role = 'admin';

            // Enhanced password validation
            $passwordValidation = PasswordValidator::validate(
                $validated['password'],
                $validated['email'],
                null // No employee ID for admin
            );
            
            if (!$passwordValidation['valid']) {
                return response()->json([
                    'status' => false,
                    'message' => 'Password validation failed',
                    'errors' => [
                        'password' => $passwordValidation['errors']
                    ],
                ], 422);
            }

            // Handle company logo upload if provided
            $logoPath = null;
            if ($request->hasFile('company_logo')) {
                $logoPath = $request->file('company_logo')->store('company_logos', 'public');
            }

            // Create admin user (no employee_id for admin)
            $user = User::create([
                'employee_id' => null, // Admin doesn't have employee ID
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $role,
                'email_verified_at' => now(), // Auto-verify admin emails
            ]);

            // Store company information (you can create a companies table or store in config)
            // For now, we'll store it in a simple way - you can enhance this later
            if (isset($validated['company_name']) || $logoPath) {
                // You might want to create a companies table or store in config
                // For now, we'll just log it or store in a simple config file
                \Log::info('Company registration', [
                    'user_id' => $user->id,
                    'company_name' => $validated['company_name'] ?? null,
                    'logo_path' => $logoPath,
                ]);
            }

            // Generate token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Return success response
            return response()->json([
                'status' => true,
                'message' => 'Admin account created successfully',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Admin registration error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Registration failed. Please try again.',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Create a new employee/user (Admin only)
     * 
     * This method creates a user with:
     * - Auto-generated Employee ID
     * - Auto-generated password
     * - Email verification required
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createEmployee(Request $request)
    {
        try {
            // Validate request data
            $validated = $request->validate([
                'name' => 'required|string|min:3',
                'email' => 'required|email|unique:users',
                'role' => 'nullable|in:admin,employee',
                'company_name' => 'nullable|string',
                'phone' => 'nullable|string',
                'joining_date' => 'nullable|date',
                'department' => 'nullable|string',
                'designation' => 'nullable|string',
            ]);

            // Set default role to 'employee' if not provided
            $role = $validated['role'] ?? 'employee';

            // Parse name into first name and last name
            $nameParts = EmployeeIdGenerator::parseName($validated['name']);
            
            // Auto-generate Employee ID
            $employeeId = EmployeeIdGenerator::generate(
                $nameParts['firstName'],
                $nameParts['lastName'],
                $validated['company_name'] ?? null,
                $validated['joining_date'] ?? null
            );

            // Ensure uniqueness (handle rare collisions)
            $originalEmployeeId = $employeeId;
            $counter = 1;
            while (User::where('employee_id', $employeeId)->exists()) {
                // If collision, try to increment serial number
                $base = substr($originalEmployeeId, 0, -4); // Remove last 4 digits
                $serial = str_pad((intval(substr($originalEmployeeId, -4)) + $counter), 4, '0', STR_PAD_LEFT);
                $employeeId = $base . $serial;
                $counter++;
                
                // Safety check to prevent infinite loop
                if ($counter > 9999) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Unable to generate unique employee ID. Please contact system administrator.',
                    ], 500);
                }
            }

            // Auto-generate password
            $generatedPassword = PasswordGenerator::generate(12);

            // Create user with auto-generated password
            // Auto-verify email for admin-created employees so they can login immediately
            $user = User::create([
                'employee_id' => $employeeId,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($generatedPassword),
                'role' => $role,
                'email_verified_at' => now(), // Auto-verify for admin-created employees
            ]);

            // Create employee profile if additional data provided
            if (isset($validated['phone']) || isset($validated['department']) || isset($validated['designation']) || isset($validated['joining_date'])) {
                $user->employeeProfile()->create([
                    'phone' => $validated['phone'] ?? null,
                    'department' => $validated['department'] ?? null,
                    'designation' => $validated['designation'] ?? null,
                    'joining_date' => isset($validated['joining_date']) ? date('Y-m-d', strtotime($validated['joining_date'])) : null,
                ]);
            }

            // Send activation email with credentials
            try {
                $loginUrl = config('app.frontend_url', url('/login'));
                Mail::to($user->email)->send(
                    new EmployeeActivationMail(
                        $user->employee_id,
                        $user->name,
                        $user->email,
                        $generatedPassword,
                        $loginUrl
                    )
                );
            } catch (\Exception $e) {
                // Log email error but don't fail the request
                \Log::error('Failed to send activation email: ' . $e->getMessage());
            }

            // Return success response with credentials
            return response()->json([
                'status' => true,
                'message' => 'Employee created successfully.',
                'user' => [
                    'id' => $user->id,
                    'employee_id' => $user->employee_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'credentials' => [
                    'employee_id' => $user->employee_id,
                    'password' => $generatedPassword,
                ],
                'note' => 'Employee can login immediately with Employee ID and password. Activation email has been sent.',
            ], 201);

        } catch (ValidationException $e) {
            // Return validation errors
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Log the actual error for debugging
            \Log::error('Employee creation error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return error with details in development
            return response()->json([
                'status' => false,
                'message' => 'Failed to create employee. Please try again.',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * List all employees (Admin only)
     */
    public function listEmployees(Request $request)
    {
        try {
            $query = User::with('employeeProfile');

            // Filter by role
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }

            // Search by name, email, or employee_id
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('employee_id', 'like', "%{$search}%");
                });
            }

            $employees = $query->orderBy('created_at', 'desc')
                              ->paginate($request->get('per_page', 15));

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
     * Get single employee details (Admin only)
     */
    public function getEmployee(Request $request, $id)
    {
        try {
            $employee = User::with('employeeProfile')->findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => [
                    'id' => $employee->id,
                    'employee_id' => $employee->employee_id,
                    'name' => $employee->name,
                    'email' => $employee->email,
                    'role' => $employee->role,
                    'email_verified_at' => $employee->email_verified_at,
                    'password_changed_at' => $employee->password_changed_at,
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
     * Update employee (Admin only)
     */
    public function updateEmployee(Request $request, $id)
    {
        try {
            $employee = User::with('employeeProfile')->findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|min:3',
                'email' => 'sometimes|email|unique:users,email,' . $id,
                'role' => 'sometimes|in:admin,employee',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'department' => 'nullable|string|max:100',
                'designation' => 'nullable|string|max:100',
                'joining_date' => 'nullable|date',
                'salary' => 'nullable|numeric|min:0',
            ]);

            // Update user basic info
            if (isset($validated['name'])) {
                $employee->name = $validated['name'];
            }
            if (isset($validated['email'])) {
                $employee->email = $validated['email'];
            }
            if (isset($validated['role'])) {
                $employee->role = $validated['role'];
            }
            $employee->save();

            // Update or create employee profile
            $profileData = array_filter([
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'department' => $validated['department'] ?? null,
                'designation' => $validated['designation'] ?? null,
                'joining_date' => isset($validated['joining_date']) ? date('Y-m-d', strtotime($validated['joining_date'])) : null,
                'salary' => $validated['salary'] ?? null,
            ], function($value) {
                return $value !== null;
            });

            if (!empty($profileData)) {
                $employee->employeeProfile()->updateOrCreate(
                    ['user_id' => $id],
                    $profileData
                );
            }

            $employee->refresh();
            $employee->load('employeeProfile');

            return response()->json([
                'status' => true,
                'message' => 'Employee updated successfully.',
                'data' => [
                    'id' => $employee->id,
                    'employee_id' => $employee->employee_id,
                    'name' => $employee->name,
                    'email' => $employee->email,
                    'role' => $employee->role,
                    'profile' => $employee->employeeProfile,
                ],
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Employee update error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update employee.',
            ], 500);
        }
    }

    /**
     * Delete employee (Admin only)
     */
    public function deleteEmployee(Request $request, $id)
    {
        try {
            $employee = User::findOrFail($id);

            // Prevent deleting yourself
            if ($employee->id === $request->user()->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'You cannot delete your own account.',
                ], 400);
            }

            $employee->delete();

            return response()->json([
                'status' => true,
                'message' => 'Employee deleted successfully.',
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Employee deletion error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete employee.',
            ], 500);
        }
    }
}
