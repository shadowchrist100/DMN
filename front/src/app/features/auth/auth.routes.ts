import { Routes } from "@angular/router";
import { Login } from "./login/login";
import { Register } from "./register/register";
import { ForgotPassword } from "./forgot-password/forgot-password";
import { Mfa } from "./mfa/mfa";
import { ResetPassword } from "./reset-password/reset-password";

export const AUTH_ROUTES: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'forgotPassword', component: ForgotPassword },
    { path: 'mfa', component: Mfa },
    { path: 'resetPassword', component: ResetPassword },
];
