<?php

namespace App\Http\Controllers;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    //
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }
    
    public function login(){

    }

    public function register(Request $request){
        $userData = $request->validate([
            'user_type' => ['required', Rule::in(['patient', 'practitioner']) ],
            'identity.firstName' => ['required', 'string' ],
            'identity.lastName' => ['required', 'string',  ],
            'identity.genre' => ['required', 'string' ],
            'identity.birthDate' => ['required', 'date'],
            'identity.npi' => ['required'] ,
            'identity.photo_path' => ['nullable'] ,
            'identity.matrimonialStatus' => ['required'],
            'identity.phone' => ['required', 'string'],
            'auth.email' => ['required', 'email', 'unique:users'],
            'auth.password' => ['required', Password::min(8)->letters()->mixedCase()->numbers() ],
            'practitioner.speciality' => ['required_if:user_type,practitioner'],
            'emergencyContact.lastName' => ['required_if:user_type,patient', 'string'],
            'emergencyContact.firstName' => ['required_if:user_type,patient', 'string'],
            'emergencyContact.phone' => ['required_if:user_type,patient', 'string']
        ]);

        $user = $this->userService->register($userData);
        $token = $user->createToken('access_token', ['role' =>$userData['user_type'] ])->plainTextToken;
        return $this->respond_with_token($token,$user);
    }

    public function respond_with_token(string $token, User $user): JsonResponse{
        $refresh_token = random_bytes(64);
        $refresh_token_hash = hash('sha256',$refresh_token);
        RefreshToken::create([
            'user_id' => $user->id,
            'refresh_token_hash' => $refresh_token_hash,
            'expire_at' => now()->addDays(30)
        ]);
        
        $cookie = cookie('refreshToken', $refresh_token,60*24*30,'/',null,false,true,false,null);

        return response()->json([
            'user' => $user,
            'accessToken' => $token,
        ])->withCookie($cookie);
    }
}
