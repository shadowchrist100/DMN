import { Routes } from '@angular/router';
import { Index } from './features/index';
import { roleGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
    { path: 'patient', loadChildren: () => import('./features/patient/patient.routes').then(m => m.PATIENT_ROUTES), canActivate: [roleGuard(['PATIENT'])] },
    { path: 'practitioner', loadChildren: () => import('./features/practitioner/practitioner.routes').then(m => m.PRACTITIONER_ROUTES), canActivate: [roleGuard(['PRACTITIONER'])] },
    { path: 'admin', loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES), canActivate: [roleGuard(['admin', 'admin_medical', 'admin_organisation'])] },
    { path: '403', loadComponent: () => import('./features/errors/403/acces-denied/acces-denied').then(m => m.AccesDenied) },
    { path: '404', loadComponent: () => import('./features/errors/404/not-found/not-found').then(m => m.NotFound) },
    { path: '', component: Index },
    { path: '**', redirectTo: '/404' }
];
