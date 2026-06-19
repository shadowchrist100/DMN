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
        $allowedRoles = ['admin_organisation'];

        if (in_array($request->user()?->role, ['admin', 'admin_medical'])) {
            $allowedRoles[] = 'admin_medical';
        }

        $data = $request->validate([
            'role' => ['required', Rule::in($allowedRoles)],
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

        $users = $query->with('identityDocuments')->orderBy('created_at', 'desc')->get()->map(fn($user) => [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role,
            'gender' => $user->gender,
            'phone' => $user->phone,
            'city' => $user->city,
            'address' => $user->address,
            'birth_date' => $user->birth_date?->format('Y-m-d'),
            'photo_path' => $user->photo_path,
            'npi' => $user->npi,
            'status_account' => $user->status_account,
            'created_at' => $user->created_at,
            'identity_documents' => $user->identityDocuments->map(fn($doc) => [
                'id' => $doc->id,
                'type_document' => $doc->type_document,
                'file_name' => basename($doc->file_path),
            ]),
        ]);

        return response()->json(['users' => $users]);
    }

    public function listPendingOrganizations(Request $request): JsonResponse
    {
        $params = ['status' => 'En attente'];

        if ($request->user()->role === 'admin_organisation') {
            $params['created_by'] = $request->user()->id;
        }

        $result = $this->orgClient->list($params);

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
        $params = $request->only('status');

        if ($request->user()->role === 'admin_organisation') {
            $params['created_by'] = $request->user()->id;
        }

        $result = $this->orgClient->list($params);

        return response()->json($result);
    }
}
