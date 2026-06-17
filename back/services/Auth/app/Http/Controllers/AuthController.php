<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password as PasswordRule;
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
            'role' => ['required', Rule::in(['patient', 'practitioner', 'admin'])],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', PasswordRule::min(8)->letters()->mixedCase()->numbers()],
            'gender' => ['required', 'string', Rule::in(['homme', 'femme'])],
            'birth_date' => ['required_if:role,patient,practitioner', 'date'],
            'matrimonial_status' => ['required_if:role,patient,practitioner', 'string'],
            'phone' => ['required', 'string'],
            'npi' => ['required_if:role,patient,practitioner', 'string'],
            'photo_path' => ['nullable', 'string'],
            'city' => ['required_if:role,patient,practitioner', 'string', 'max:255'],
            'address' => ['required_if:role,patient,practitioner', 'string', 'max:255'],

            'documents' => ['nullable', 'array', 'min:1'],
            'documents.*.type_document' => [
                'required', 'string',
                Rule::in(['diplome', 'carte_ordre', 'piece_identite']),
            ],
            'documents.*.file' => [
                'required',
                'file',
                'mimetypes:application/pdf,image/jpeg,image/png',
                'max:5120',
            ],

            'order_number' => ['required_if:role,practitioner', 'string'],
            'speciality' => ['required_if:role,practitioner', 'string'],
            'organization_id' => ['required_if:role,practitioner', 'string'],

            'emergencyContact.firstName' => ['required_if:role,patient', 'string'],
            'emergencyContact.lastName' => ['required_if:role,patient', 'string'],
            'emergencyContact.phone' => ['required_if:role,patient', 'string'],
            'emergencyContact.code_relation' => ['required_if:role,patient', 'string'],
        ]);

        $user = $this->userService->register($data);

        $user->sendEmailVerificationNotification();

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Inscription réussie. Veuillez vérifier votre email.',
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

        $message = $user->status_account === 'unverified'
            ? 'Connexion réussie. Votre compte est en attente de vérification.'
            : 'Connexion réussie.';

        return response()->json([
            'message' => $message,
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

    public function verify(Request $request, User $user): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $user = $this->userService->verifyUser((string) $user->id);

        return response()->json([
            'message' => 'Compte vérifié avec succès.',
            'user' => $user,
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::broker()->sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Email de réinitialisation envoyé.']);
        }

        return response()->json([
            'message' => 'Impossible d\'envoyer l\'email de réinitialisation.',
        ], 400);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)->letters()->mixedCase()->numbers()],
        ]);

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
        }

        return response()->json([
            'message' => 'Token de réinitialisation invalide ou expiré.',
        ], 400);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'id' => ['required', 'string'],
            'hash' => ['required', 'string'],
            'expires' => ['required', 'integer'],
            'signature' => ['required', 'string'],
        ]);

        $user = User::findOrFail($request->id);

        if (!hash_equals((string) $request->hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Lien de vérification invalide.'], 400);
        }

        if (!URL::hasValidSignature($request)) {
            return response()->json(['message' => 'Lien de vérification invalide ou expiré.'], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.']);
        }

        $user->markEmailAsVerified();

        return response()->json(['message' => 'Email vérifié avec succès.']);
    }

    public function resendVerificationEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Aucun compte trouvé avec cet email.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email de vérification renvoyé.']);
    }
}
