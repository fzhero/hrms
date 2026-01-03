<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class LeaveController extends Controller
{
    /**
     * Get leave requests
     * Admin: Can view all leave requests
     * Employee: Can view only their own leave requests
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $query = Leave::with('user:id,name,employee_id,email');

            // Employee can only see their own leaves
            if ($user->role === 'employee') {
                $query->where('user_id', $user->id);
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by type
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            // Filter by date range
            if ($request->has('from_date') && $request->has('to_date')) {
                $query->where(function($q) use ($request) {
                    $q->whereBetween('from_date', [$request->from_date, $request->to_date])
                      ->orWhereBetween('to_date', [$request->from_date, $request->to_date])
                      ->orWhere(function($q2) use ($request) {
                          $q2->where('from_date', '<=', $request->from_date)
                             ->where('to_date', '>=', $request->to_date);
                      });
                });
            }

            $leaves = $query->orderBy('created_at', 'desc')
                           ->paginate($request->get('per_page', 15));

            return response()->json([
                'status' => true,
                'data' => $leaves,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Leave fetch error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch leave requests.',
            ], 500);
        }
    }

    /**
     * Create leave request (Employee only)
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'type' => 'required|in:sick,annual,casual,emergency,other,paid,unpaid',
                'from_date' => 'required|date|after_or_equal:today',
                'to_date' => 'required|date|after_or_equal:from_date',
                'reason' => 'required|string|min:10|max:500',
                'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
            ], [
                'reason.min' => 'The reason must be at least 10 characters long.',
                'reason.max' => 'The reason must not exceed 500 characters.',
                'reason.required' => 'The reason field is required.',
                'from_date.after_or_equal' => 'The from date must be today or a future date.',
                'to_date.after_or_equal' => 'The to date must be the same as or after the from date.',
                'attachment.mimes' => 'Attachment must be a PDF, JPG, JPEG, or PNG file.',
                'attachment.max' => 'Attachment size must not exceed 5MB.',
            ]);

            // Check for duplicate/exact same leave request
            $exactDuplicate = Leave::where('user_id', $user->id)
                                  ->where('from_date', $validated['from_date'])
                                  ->where('to_date', $validated['to_date'])
                                  ->whereIn('status', ['pending', 'approved'])
                                  ->exists();

            if ($exactDuplicate) {
                return response()->json([
                    'status' => false,
                    'message' => 'You already have a leave request for these exact dates.',
                    'errors' => [
                        'from_date' => ['A leave request already exists for these dates.'],
                        'to_date' => ['A leave request already exists for these dates.'],
                    ],
                ], 422);
            }

            // Check for overlapping leave requests (pending or approved only)
            // Rejected and cancelled leaves can be resubmitted
            $overlapping = Leave::where('user_id', $user->id)
                               ->whereIn('status', ['pending', 'approved'])
                               ->where(function($q) use ($validated) {
                                   // Check if new leave overlaps with existing leaves
                                   // Case 1: New leave starts within existing leave period
                                   $q->where(function($q1) use ($validated) {
                                       $q1->where('from_date', '<=', $validated['from_date'])
                                          ->where('to_date', '>=', $validated['from_date']);
                                   })
                                   // Case 2: New leave ends within existing leave period
                                   ->orWhere(function($q2) use ($validated) {
                                       $q2->where('from_date', '<=', $validated['to_date'])
                                          ->where('to_date', '>=', $validated['to_date']);
                                   })
                                   // Case 3: New leave completely contains existing leave
                                   ->orWhere(function($q3) use ($validated) {
                                       $q3->where('from_date', '>=', $validated['from_date'])
                                          ->where('to_date', '<=', $validated['to_date']);
                                   })
                                   // Case 4: Existing leave completely contains new leave
                                   ->orWhere(function($q4) use ($validated) {
                                       $q4->where('from_date', '<=', $validated['from_date'])
                                          ->where('to_date', '>=', $validated['to_date']);
                                   });
                               })
                               ->exists();

            if ($overlapping) {
                return response()->json([
                    'status' => false,
                    'message' => 'You already have a pending or approved leave request that overlaps with the selected dates.',
                    'errors' => [
                        'from_date' => ['This date range overlaps with an existing leave request.'],
                        'to_date' => ['This date range overlaps with an existing leave request.'],
                    ],
                ], 422);
            }

            // Handle file upload if present
            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $fileName = time() . '_' . $user->id . '_' . $file->getClientOriginalName();
                $attachmentPath = $file->storeAs('leave_attachments', $fileName, 'public');
            }

            $leave = Leave::create([
                'user_id' => $user->id,
                'type' => $validated['type'],
                'from_date' => $validated['from_date'],
                'to_date' => $validated['to_date'],
                'reason' => $validated['reason'],
                'status' => 'pending',
                'attachment' => $attachmentPath,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Leave request submitted successfully.',
                'data' => $leave->load('user:id,name,employee_id'),
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Leave creation error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to submit leave request.',
            ], 500);
        }
    }

    /**
     * Get single leave request
     */
    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();
            $leave = Leave::with('user:id,name,employee_id,email')->findOrFail($id);

            // Employee can only view their own leaves
            if ($user->role === 'employee' && $leave->user_id !== $user->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized access.',
                ], 403);
            }

            return response()->json([
                'status' => true,
                'data' => $leave,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Leave request not found.',
            ], 404);
        }
    }

    /**
     * Update leave request status (Admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:approved,rejected',
                'admin_comment' => 'nullable|string|max:500',
            ]);

            $leave = Leave::with('user')->findOrFail($id);

            if ($leave->status !== 'pending') {
                return response()->json([
                    'status' => false,
                    'message' => 'This leave request has already been processed.',
                ], 400);
            }

            $leave->status = $validated['status'];
            $leave->admin_comment = $validated['admin_comment'] ?? null;
            $leave->save();

            return response()->json([
                'status' => true,
                'message' => 'Leave request ' . $validated['status'] . ' successfully.',
                'data' => $leave->load('user:id,name,employee_id,email'),
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Leave status update error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update leave request.',
            ], 500);
        }
    }

    /**
     * Cancel leave request (Employee only - if pending)
     */
    public function cancel(Request $request, $id)
    {
        try {
            $user = $request->user();
            $leave = Leave::findOrFail($id);

            // Only employee can cancel their own pending leaves
            if ($leave->user_id !== $user->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized access.',
                ], 403);
            }

            if ($leave->status !== 'pending') {
                return response()->json([
                    'status' => false,
                    'message' => 'Only pending leave requests can be cancelled.',
                ], 400);
            }

            $leave->status = 'cancelled';
            $leave->save();

            return response()->json([
                'status' => true,
                'message' => 'Leave request cancelled successfully.',
                'data' => $leave,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Leave cancellation error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to cancel leave request.',
            ], 500);
        }
    }
}

