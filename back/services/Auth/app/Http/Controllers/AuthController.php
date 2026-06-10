<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Services\UserService;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_type' => ['required', Rule::in(['patient', 'practitioner'])],

            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Password::min(8)->letters()->mixedCase()->numbers()],
            'genre' => ['required', 'string', Rule::in(['homme', 'femme'])],
            'birth_date' => ['required', 'date'],
            'matrimonial_status' => ['required', 'string'],
            'phone' => ['required', 'string'],
            'npi' => ['nullable', 'string'],
            'photo_path' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'documents' => ['required_if', 'array', 'min:1'],
            'documents.*.type_document' => ['required_with:documents', 'string'],
            'documents.*.file' => ['required_with:documents', 'file', 'mimes:pdf,jpg,png', 'max:5120'],

            'order_number' => ['required_if:user_type,practitioner', 'string'],
            'speciality' => ['required_if:user_type,practitioner', 'string'],
            'organization_name' => ['required_if:user_type,practitioner', 'string'],
        ]);

        $data['password'] = bcrypt($data['password']);

        $user = $this->userService->register($data);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Inscription réussie. En attente de vérification.',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['message' => 'Identifiants invalides.'], 401);
        }

        $user = auth()->user();

        return response()->json([
            'message' => 'Connexion réussie.',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json([
            'user' => auth()->user(),
        ]);
    }

    public function logout(): JsonResponse
    {
        auth()->logout();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function refresh(): JsonResponse
    {
        $token = auth()->refresh();

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
        ]);
    }

    public function verify(int $userId): JsonResponse
    {
        $user = $this->userService->verifyUser($userId);

        return response()->json([
            'message' => 'Compte vérifié avec succès.',
            'user' => $user,
        ]);
    }
}
