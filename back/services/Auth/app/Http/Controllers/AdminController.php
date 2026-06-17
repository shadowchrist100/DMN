<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\MedicalOrganizationServiceClient;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Tymon\JWTAuth\Facades\JWTAuth;

class AdminController extends Controller
{
    private UserService $userService;
    private MedicalOrganizationServiceClient $orgClient;

    public function __construct(UserService $userService, MedicalOrganizationServiceClient $orgClient)
    {
        $this->userService = $userService;
        $this->orgClient = $orgClient;
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

    public function listPendingOrganizations(): JsonResponse
    {
        $result = $this->orgClient->list(['status' => 'En attente']);

        return response()->json($result);
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

    public function validateOrganization(Request $request, string $organization): JsonResponse
    {
        $request->validate([
            'status' => ['required', Rule::in(['active', 'suspended'])],
        ]);

        $data = $request->only('status');
        $data['validated_by'] = $request->user()->id;

        $result = $this->orgClient->validate($organization, $data);

        return response()->json($result);
    }

    public function listOrganizations(Request $request): JsonResponse
    {
        $result = $this->orgClient->list($request->only('status'));

        return response()->json($result);
    }
}
