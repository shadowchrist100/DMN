import { Routes } from '@angular/router';
import { Login } from './pages/Auth/login/login';
import { PatientDashboard } from './pages/patients/patient-dashboard/patient-dashboard';
import { ProviderDashboard } from './pages/healthProvider/provider-dashboard/provider-dashboard';
import { Home } from './pages/home/home';
import { ResetPassword } from './pages/Auth/login/reset-password/reset-password';
import { PatientRegister } from './pages/Auth/register/patient-register/patient-register';
import { HealthProviderRegister } from './pages/Auth/register/health-provider-register/health-provider-register';
import { SuccessConnect } from './pages/Auth/register/success-connect/success-connect';
import { VerificationMail } from './pages/Auth/register/verification-mail/verification-mail';


export const routes: Routes = [
    {path:'login', component: Login},
    {path: 'patientRegister', component:PatientRegister },
    {path: 'healthProviderRegister', component: HealthProviderRegister },
    {path: 'verification', component:VerificationMail },
    {path: 'reset-password', component: ResetPassword},
    {path: 'success-inscription', component:SuccessConnect},
    {path:'patient/dashboard', component:PatientDashboard },
    {path:'doctor/dashboard', component: ProviderDashboard },
    {path: '', component: Home},
];
