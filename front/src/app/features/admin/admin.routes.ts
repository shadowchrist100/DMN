import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/auth.guard';
import { AdminDashboard } from './dashboard/dashboard';
import { AdminPendingUsers } from './pending-users/pending-users';
import { AdminPendingOrganizations } from './pending-organizations/pending-organizations';
import { AdminOrganizations } from './organizations/organizations';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard(['admin', 'admin_medical', 'admin_organisation'])],
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'pending-users', component: AdminPendingUsers, canActivate: [roleGuard(['admin', 'admin_medical'])] },
      { path: 'pending-organizations', component: AdminPendingOrganizations, canActivate: [roleGuard(['admin', 'admin_medical'])] },
      { path: 'organizations', component: AdminOrganizations },
    ],
  },
];
