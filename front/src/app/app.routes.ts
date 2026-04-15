import { Routes } from '@angular/router';
import { Login } from './pages/Auth/login/login';
import { Register } from './pages/Auth/register/register';

export const routes: Routes = [
    {path:'login', component: Login},
    {path: 'register', component: Register}
];
