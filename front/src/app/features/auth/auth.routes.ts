import { Routes } from "@angular/router";
import { Login } from "./login/login";
import { Register } from "./register/register";
import { UserChoose } from "./register/user-choose/user-choose";
import { PractitionerRegister } from "./register/practitioner-register/practitioner-register";
import { PatientRegister } from "./register/patient-register/patient-register";
import { ForgotPassword } from "./forgot-password/forgot-password";

export const AUTH_ROUTES : Routes = [
    {path: 'login', component: Login},
    {path: "register", component:Register},
    {path: "userChoose", component:UserChoose},
    {path: "practitionerRegister", component:PractitionerRegister},
    {path: "patientRegister", component:PatientRegister},
    {path: "forgotPassword", component:ForgotPassword}
]