import { Routes } from "@angular/router";
import { Login } from "./login/login";
import { Register } from "./register/register";
import { ForgotPassword } from "./forgot-password/forgot-password";

export const AUTH_ROUTES : Routes = [
    {path: 'login', component: Login},
    {path: "register", component:Register},
    {path: "forgotPassword", component:ForgotPassword}
]