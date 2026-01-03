<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\EmployeeIdGenerator;
use App\Services\PasswordValidator;
use App\Mail\EmailVerificationMail;
use App\Mail\PasswordResetMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
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
                'password' => 'required|min:8|confirmed',
                'role' => 'nullable|in:employee', // Only employees can register
                'phone' => 'nullable|string',
            ]);

            // Force role to 'employee' for public registration (admin cannot sign up)
            $role = 'employee';

            // Parse name into first name and last name
            $nameParts = EmployeeIdGenerator::parseName($validated['name']);
            
            // Auto-generate Employee ID (no company name for public registration)
            $employeeId = EmployeeIdGenerator::generate(
                $nameParts['firstName'],
                $nameParts['lastName'],
                null, // No company name for public employee registration
                null // Joining date - can be added later if needed
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
                    throw new \Exception('Unable to generate unique employee ID. Please contact administrator.');
                }
            }

            // Enhanced password validation
            $passwordValidation = PasswordValidator::validate(
                $validated['password'],
                $validated['email'],
                $employeeId
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

            // Create user
            $user = User::create([
                'employee_id' => $employeeId,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $role,
            ]);
            
            // Create employee profile if phone provided
            if (isset($validated['phone'])) {
                $user->employeeProfile()->create([
                    'phone' => $validated['phone'],
                ]);
            }

            // Generate email verification token
            $verificationToken = Str::random(64);
            DB::table('email_verifications')->insert([
                'email' => $user->email,
                'token' => Hash::make($verificationToken),
                'created_at' => now(),
            ]);

            // Send verification email
            try {
                $verificationUrl = config('app.frontend_url', url('/')) . '/verify-email?token=' . $verificationToken . '&email=' . urlencode($user->email);
                Mail::to($user->email)->send(new EmailVerificationMail($user, $verificationUrl));
            } catch (\Exception $e) {
                \Log::error('Failed to send verification email: ' . $e->getMessage());
            }

            // Return success response (don't auto-login, require email verification)
            return response()->json([
                'status' => true,
                'message' => 'Registration successful. Please check your email to verify your account.',
                'email_verification_required' => true,
                'user' => [
                    'id' => $user->id,
                    'employee_id' => $user->employee_id,
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
            // Rate limiting for login attempts
            $key = 'login.' . $request->ip();
            $maxAttempts = 5;
            $decayMinutes = 15;
            
            if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
                $seconds = RateLimiter::availableIn($key);
                return response()->json([
                    'status' => false,
                    'message' => 'Too many login attempts. Please try again in ' . ceil($seconds / 60) . ' minutes.',
                    'retry_after' => $seconds,
                ], 429);
            }

            // Validate request data
            $validated = $request->validate([
                'email' => 'required', // Can be email or employee_id
                'password' => 'required',
            ]);

            // Find user by email or employee_id
            $user = User::where('email', $validated['email'])
                       ->orWhere('employee_id', $validated['email'])
                       ->first();

            // Check if user exists and password is correct
            if (!$user || !Hash::check($validated['password'], $user->password)) {
                // Increment rate limiter
                RateLimiter::hit($key, $decayMinutes * 60);
                
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid credentials',
                ], 401);
            }

            // Clear rate limiter on successful login
            RateLimiter::clear($key);

            // Email verification is optional for employees (admin-created employees are auto-verified)
            // Only enforce for self-registered users who haven't verified yet
            // This allows admin-created employees to login immediately with ID and password

            // Delete existing tokens (optional - for single device login)
            // $user->tokens()->delete();

            // Generate new token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Check if user needs to change password (first login with system-generated password)
            $needsPasswordChange = $user->isFirstLogin();

            // Return success response
            return response()->json([
                'status' => true,
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'employee_id' => $user->employee_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'employee',
                ],
                'requires_password_change' => $needsPasswordChange,
                'message_hint' => $needsPasswordChange ? 'Please change your password for security.' : null,
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
                'employee_id' => $request->user()->employee_id,
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
     * For first login: User must provide system-generated password as current_password
     * For regular change: User must provide their current password
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
                'password' => 'required|min:8|confirmed',
            ]);

            // Verify current password (system-generated or user's current password)
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Current password is incorrect.',
                    'errors' => [
                        'current_password' => ['The current password you entered is incorrect.']
                    ],
                ], 422);
            }

            // Prevent reusing the same password
            if (Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'New password must be different from current password.',
                    'errors' => [
                        'password' => ['Please choose a different password.']
                    ],
                ], 422);
            }

            // Enhanced password validation
            $passwordValidation = PasswordValidator::validate(
                $validated['password'],
                $user->email,
                $user->employee_id
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

            // Update password (user can only update their own password)
            $user->password = Hash::make($validated['password']);
            $user->password_changed_at = now();
            $user->save();

            return response()->json([
                'status' => true,
                'message' => 'Password updated successfully. You can now use your new password to login.',
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Password update error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update password. Please try again.',
            ], 500);
        }
    }

    /**
     * Verify email address
     */
    public function verifyEmail(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'token' => 'required|string',
            ]);

            $verification = DB::table('email_verifications')
                ->where('email', $validated['email'])
                ->latest()
                ->first();

            if (!$verification) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid verification token.',
                ], 400);
            }

            // Check if token is valid (24 hour expiration)
            if (Carbon::parse($verification->created_at)->addHours(24)->isPast()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Verification token has expired. Please request a new one.',
                ], 400);
            }

            // Verify token
            if (!Hash::check($validated['token'], $verification->token)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid verification token.',
                ], 400);
            }

            // Update user email_verified_at
            $user = User::where('email', $validated['email'])->first();
            if ($user) {
                $user->email_verified_at = now();
                $user->save();
            }

            // Delete used verification token
            DB::table('email_verifications')
                ->where('email', $validated['email'])
                ->delete();

            return response()->json([
                'status' => true,
                'message' => 'Email verified successfully. You can now login.',
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Email verification error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to verify email.',
            ], 500);
        }
    }

    /**
     * Resend email verification
     */
    public function resendVerification(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|exists:users,email',
            ]);

            $user = User::where('email', $validated['email'])->first();

            if ($user->email_verified_at) {
                return response()->json([
                    'status' => false,
                    'message' => 'Email is already verified.',
                ], 400);
            }

            // Generate new verification token
            $verificationToken = Str::random(64);
            DB::table('email_verifications')->insert([
                'email' => $user->email,
                'token' => Hash::make($verificationToken),
                'created_at' => now(),
            ]);

            // Send verification email
            try {
                $verificationUrl = config('app.frontend_url', url('/')) . '/verify-email?token=' . $verificationToken . '&email=' . urlencode($user->email);
                Mail::to($user->email)->send(new EmailVerificationMail($user, $verificationUrl));
            } catch (\Exception $e) {
                \Log::error('Failed to send verification email: ' . $e->getMessage());
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to send verification email. Please try again later.',
                ], 500);
            }

            return response()->json([
                'status' => true,
                'message' => 'Verification email sent successfully.',
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Resend verification error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to resend verification email.',
            ], 500);
        }
    }

    /**
     * Request password reset
     */
    public function forgotPassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|exists:users,email',
            ]);

            $user = User::where('email', $validated['email'])->first();

            // Generate password reset token
            $resetToken = Str::random(64);
            $expiresAt = now()->addMinutes(60); // 1 hour expiration

            DB::table('password_resets')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token' => Hash::make($resetToken),
                    'created_at' => now(),
                    'expires_at' => $expiresAt,
                ]
            );

            // Send password reset email
            try {
                $resetUrl = config('app.frontend_url', url('/')) . '/reset-password?token=' . $resetToken . '&email=' . urlencode($user->email);
                Mail::to($user->email)->send(new PasswordResetMail($user, $resetUrl, 60));
            } catch (\Exception $e) {
                \Log::error('Failed to send password reset email: ' . $e->getMessage());
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to send password reset email. Please try again later.',
                ], 500);
            }

            return response()->json([
                'status' => true,
                'message' => 'Password reset link has been sent to your email.',
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Forgot password error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to process password reset request.',
            ], 500);
        }
    }

    /**
     * Reset password using token
     */
    public function resetPassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|exists:users,email',
                'token' => 'required|string',
                'password' => 'required|min:8|confirmed',
            ]);

            $reset = DB::table('password_resets')
                ->where('email', $validated['email'])
                ->first();

            if (!$reset) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid or expired reset token.',
                ], 400);
            }

            // Check if token is expired
            if (Carbon::parse($reset->expires_at)->isPast()) {
                DB::table('password_resets')->where('email', $validated['email'])->delete();
                return response()->json([
                    'status' => false,
                    'message' => 'Reset token has expired. Please request a new one.',
                ], 400);
            }

            // Verify token
            if (!Hash::check($validated['token'], $reset->token)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid reset token.',
                ], 400);
            }

            // Get user
            $user = User::where('email', $validated['email'])->first();

            // Enhanced password validation
            $passwordValidation = PasswordValidator::validate(
                $validated['password'],
                $user->email,
                $user->employee_id
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

            // Update password
            $user->password = Hash::make($validated['password']);
            $user->password_changed_at = now();
            $user->save();

            // Delete used reset token
            DB::table('password_resets')->where('email', $validated['email'])->delete();

            return response()->json([
                'status' => true,
                'message' => 'Password reset successfully. You can now login with your new password.',
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Password reset error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to reset password.',
            ], 500);
        }
    }
}
