<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Get attendance records
     * Admin: Can view all employees' attendance
     * Employee: Can view only their own attendance
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $query = Attendance::with('user:id,name,employee_id,email');

            // Employee can only see their own attendance
            if ($user->role === 'employee') {
                $query->where('user_id', $user->id);
            }

            // Filter by date range
            if ($request->has('from_date') && $request->has('to_date')) {
                $query->whereBetween('date', [
                    $request->from_date,
                    $request->to_date
                ]);
            } elseif ($request->has('date')) {
                $query->where('date', $request->date);
            }

            // Filter by employee (admin only)
            if ($user->role === 'admin' && $request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            // Get weekly view
            if ($request->has('week')) {
                $weekStart = Carbon::parse($request->week)->startOfWeek();
                $weekEnd = $weekStart->copy()->endOfWeek();
                $query->whereBetween('date', [$weekStart->format('Y-m-d'), $weekEnd->format('Y-m-d')]);
            }

            $attendances = $query->orderBy('date', 'desc')
                                 ->orderBy('check_in', 'desc')
                                 ->paginate($request->get('per_page', 15));

            return response()->json([
                'status' => true,
                'data' => $attendances,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Attendance fetch error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch attendance records.',
            ], 500);
        }
    }

    /**
     * Check in (mark attendance)
     */
    public function checkIn(Request $request)
    {
        try {
            $user = $request->user();
            $today = Carbon::today()->format('Y-m-d');

            // Check if already checked in today
            $existingAttendance = Attendance::where('user_id', $user->id)
                                            ->where('date', $today)
                                            ->first();

            if ($existingAttendance && $existingAttendance->check_in) {
                return response()->json([
                    'status' => false,
                    'message' => 'You have already checked in today.',
                ], 400);
            }

            // Create or update attendance record
            $attendance = Attendance::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'date' => $today,
                ],
                [
                    'check_in' => Carbon::now()->format('H:i:s'),
                    'status' => 'present',
                ]
            );

            return response()->json([
                'status' => true,
                'message' => 'Checked in successfully.',
                'data' => $attendance,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Check-in error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to check in. Please try again.',
            ], 500);
        }
    }

    /**
     * Check out (mark attendance)
     */
    public function checkOut(Request $request)
    {
        try {
            $user = $request->user();
            $today = Carbon::today()->format('Y-m-d');

            // Find today's attendance
            $attendance = Attendance::where('user_id', $user->id)
                                   ->where('date', $today)
                                   ->first();

            if (!$attendance) {
                return response()->json([
                    'status' => false,
                    'message' => 'Please check in first.',
                ], 400);
            }

            if ($attendance->check_out) {
                return response()->json([
                    'status' => false,
                    'message' => 'You have already checked out today.',
                ], 400);
            }

            $attendance->check_out = Carbon::now()->format('H:i:s');
            $attendance->save();

            return response()->json([
                'status' => true,
                'message' => 'Checked out successfully.',
                'data' => $attendance,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Check-out error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to check out. Please try again.',
            ], 500);
        }
    }

    /**
     * Get today's attendance status
     */
    public function todayStatus(Request $request)
    {
        try {
            $user = $request->user();
            $today = Carbon::today()->format('Y-m-d');

            $attendance = Attendance::where('user_id', $user->id)
                                   ->where('date', $today)
                                   ->first();

            return response()->json([
                'status' => true,
                'data' => $attendance ? [
                    'checked_in' => (bool) $attendance->check_in,
                    'checked_out' => (bool) $attendance->check_out,
                    'check_in_time' => $attendance->check_in,
                    'check_out_time' => $attendance->check_out,
                    'status' => $attendance->status,
                ] : [
                    'checked_in' => false,
                    'checked_out' => false,
                    'check_in_time' => null,
                    'check_out_time' => null,
                    'status' => null,
                ],
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Today status error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch today\'s status.',
            ], 500);
        }
    }

    /**
     * Admin: Create or update attendance manually
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'date' => 'required|date',
                'check_in' => 'nullable|date_format:H:i:s',
                'check_out' => 'nullable|date_format:H:i:s|after:check_in',
                'status' => 'nullable|in:present,absent,late,half_day',
            ]);

            $attendance = Attendance::updateOrCreate(
                [
                    'user_id' => $validated['user_id'],
                    'date' => $validated['date'],
                ],
                [
                    'check_in' => $validated['check_in'] ?? null,
                    'check_out' => $validated['check_out'] ?? null,
                    'status' => $validated['status'] ?? 'present',
                ]
            );

            return response()->json([
                'status' => true,
                'message' => 'Attendance recorded successfully.',
                'data' => $attendance->load('user:id,name,employee_id'),
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Attendance creation error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to record attendance.',
            ], 500);
        }
    }
}

