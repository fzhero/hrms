<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        try {
            // Validate request data
            $validated = $request->validate([
                'name' => 'required|string|min:3',
                'email' => 'required|email|unique:users',
                'password' => 'required|min:6|confirmed',
            ]);

            // Create user (default role is 'employee')
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'employee', // Default role
            ]);

            // Generate token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Return success response
            return response()->json([
                'status' => true,
                'message' => 'User registered successfully',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
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
            \Log::error('Registration error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return error with details in development
            return response()->json([
                'status' => false,
                'message' => 'Registration failed. Please try again.',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Login user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            // Validate request data
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            // Find user by email
            $user = User::where('email', $validated['email'])->first();

            // Check if user exists and password is correct
            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid credentials',
                ], 401);
            }

            // Delete existing tokens (optional - for single device login)
            // $user->tokens()->delete();

            // Generate new token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Return success response
            return response()->json([
                'status' => true,
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'employee',
                ],
            ], 200);

        } catch (ValidationException $e) {
            // Return validation errors
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Return generic error
            return response()->json([
                'status' => false,
                'message' => 'Login failed. Please try again.',
            ], 500);
        }
    }

    /**
     * Get authenticated user
     * Protected route - requires authentication
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        return response()->json([
            'status' => true,
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role ?? 'employee',
            ],
        ], 200);
    }

    /**
     * Update user password
     * Security: Only users can update their own password
     * Admins CANNOT directly modify employee passwords
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePassword(Request $request)
    {
        try {
            $user = $request->user();

            // Validate request
            $validated = $request->validate([
                'current_password' => 'required',
                'password' => 'required|min:6|confirmed',
            ]);

            // Verify current password
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Current password is incorrect.',
                ], 422);
            }

            // Update password (user can only update their own password)
            $user->password = Hash::make($validated['password']);
            $user->save();

            return response()->json([
                'status' => true,
                'message' => 'Password updated successfully.',
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update password. Please try again.',
            ], 500);
        }
    }

    /**
     * Admin can reset user password (but cannot see the password)
     * Security: Only admin can use this endpoint
     * This generates a new password for the user
     * 
     * @param Request $request
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetUserPassword(Request $request, $userId)
    {
        // This method should only be called from an Admin controller
        // Protected by role.admin middleware
        // This is a placeholder - implement in AdminController
        
        return response()->json([
            'status' => false,
            'message' => 'This endpoint should be accessed through AdminController.',
        ], 403);
    }
}
