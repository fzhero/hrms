<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckHR
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized. Please login.',
            ], 401);
        }

        $userRole = $request->user()->role;
        
        // Allow both HR and Admin
        if (!in_array($userRole, ['hr', 'admin'])) {
            return response()->json([
                'status' => false,
                'message' => 'Forbidden. HR or Admin access required.',
            ], 403);
        }

        return $next($request);
    }
}

