<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Tymon\JWTAuth\Facades\JWTAuth;

class AdminController extends Controller
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function createAdmin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'role' => ['required', Rule::in(['admin_organisation', 'admin_medical'])],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Password::min(8)->letters()->mixedCase()->numbers()],
            'gender' => ['required', 'string', Rule::in(['homme', 'femme'])],
            'phone' => ['required', 'string'],
            'city' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
        ]);

        $fields = [
            'first_name', 'last_name', 'email', 'password', 'gender',
            'phone', 'city', 'address', 'role',
        ];

        $user = User::create(
            array_merge(
                array_intersect_key($data, array_flip($fields)),
                ['status_account' => 'verified']
            )
        );

        $user->markEmailAsVerified();

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Compte administrateur créé avec succès.',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
        ], 201);
    }

    public function listPendingUsers(Request $request): JsonResponse
    {
        $role = $request->query('role');

        $query = User::where('status_account', 'unverified');

        if ($role && in_array($role, ['patient', 'practitioner'])) {
            $query->where('role', $role);
        }

        return response()->json([
            'users' => $query->orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function listPendingOrganizations(Request $request): JsonResponse
    {
        return response()->json([
            'organizations' => Organization::where('status', 'pending')
                ->with('creator')
                ->orderBy('created_at', 'desc')
                ->get(),
        ]);
    }

    public function verifyUser(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'status' => ['required', Rule::in(['verified', 'rejected'])],
            'rejection_reason' => ['required_if:status,rejected', 'string'],
        ]);

        if ($user->status_account === 'verified') {
            return response()->json(['message' => 'Ce compte est déjà vérifié.'], 400);
        }

        if ($request->status === 'rejected') {
            $user->update([
                'status_account' => 'rejected',
            ]);

            return response()->json([
                'message' => 'Compte rejeté.',
                'user' => $user,
            ]);
        }

        $user = $this->userService->verifyUser((string) $user->id);

        return response()->json([
            'message' => 'Compte vérifié avec succès.',
            'user' => $user,
        ]);
    }

    public function validateOrganization(Request $request, Organization $organization): JsonResponse
    {
        $request->validate([
            'status' => ['required', Rule::in(['active', 'suspended'])],
            'suspension_reason' => ['required_if:status,suspended', 'string'],
        ]);

        if ($organization->status !== 'pending' && $organization->status !== 'suspended') {
            return response()->json(['message' => "L'organisation a déjà été traitée."], 400);
        }

        $organization->update([
            'status' => $request->status,
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
        ]);

        $message = $request->status === 'active'
            ? 'Organisation validée avec succès.'
            : 'Organisation suspendue.';

        return response()->json([
            'message' => $message,
            'organization' => $organization->load('creator', 'validator'),
        ]);
    }

    public function listOrganizations(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $query = Organization::with('creator', 'validator');

        if ($status && in_array($status, ['pending', 'active', 'suspended'])) {
            $query->where('status', $status);
        }

        return response()->json([
            'organizations' => $query->orderBy('created_at', 'desc')->get(),
        ]);
    }
}
