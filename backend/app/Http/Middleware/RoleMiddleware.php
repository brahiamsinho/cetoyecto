<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        if (! $user->hasRole($role)) {
            return response()->json(['message' => 'No autorizado. Se requiere rol: ' . $role], 403);
        }

        return $next($request);
    }
}
