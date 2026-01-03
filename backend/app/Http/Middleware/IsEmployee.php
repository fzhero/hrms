<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * IsEmployee Middleware
 * Strict middleware that only allows Employee users
 * Admins are blocked from accessing Employee-only routes
 */
class IsEmployee
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

        // Strict check: Only employee role is allowed
        if ($request->user()->role !== 'employee') {
            return response()->json([
                'status' => false,
                'message' => 'Forbidden. Employee access required. This resource is restricted to employees only.',
                'error_code' => 'INSUFFICIENT_PERMISSIONS',
            ], 403);
        }

        return $next($request);
    }
}

