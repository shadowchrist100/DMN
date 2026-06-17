import { Routes } from "@angular/router";
import { Login } from "./login/login";
import { Register } from "./register/register";
import { ForgotPassword } from "./forgot-password/forgot-password";
import { ResetPassword } from "./reset-password/reset-password";
import { AdminLogin } from "./admin-login/admin-login";

export const AUTH_ROUTES: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'forgotPassword', component: ForgotPassword },
    { path: 'resetPassword', component: ResetPassword },
    { path: 'admin', component: AdminLogin },
];
