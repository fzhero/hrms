<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckEmployee
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

        // Employees can access, but Admin/HR can also access employee routes
        $userRole = $request->user()->role;
        
        if (!in_array($userRole, ['employee', 'hr', 'admin'])) {
            return response()->json([
                'status' => false,
                'message' => 'Forbidden. Valid user access required.',
            ], 403);
        }

        return $next($request);
    }
}

