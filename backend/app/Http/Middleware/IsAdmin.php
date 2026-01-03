<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * IsAdmin Middleware
 * Strict middleware that only allows Admin users
 * Employees are blocked from accessing Admin routes
 */
class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized. Authentication required.',
            ], 401);
        }

        // Strict check: Only admin role is allowed
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Forbidden. Admin access required. You do not have permission to access this resource.',
                'error_code' => 'INSUFFICIENT_PERMISSIONS',
            ], 403);
        }

        return $next($request);
    }
}

