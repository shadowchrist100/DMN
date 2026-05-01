<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Services\UserService;

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
    }
}
