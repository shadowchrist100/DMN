import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from './auth.store';
import { mapApiUserToIuser, ApiUser } from './auth-service';
import { API } from '../config/api.config';

interface RefreshResponse {
  access_token: string;
  user: ApiUser;
}

function getDashboardPath(role: string): string {
  if (role === 'PATIENT') return '/patient/dashboard';
  if (role === 'PRACTITIONER') return '/practitioner/dashboard';
  if (['admin', 'admin_medical', 'admin_organisation'].includes(role)) return '/admin/dashboard';
  return '/auth/login';
}

function checkRole(allowedRoles: string[], router: Router): boolean {
  const userRole = AuthStore.userRole();
  if (!userRole || !allowedRoles.includes(userRole)) {
    router.navigateByUrl(getDashboardPath(userRole ?? ''));
    return false;
  }
  return true;
}

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return async () => {
    const router = inject(Router);
    const http = inject(HttpClient);

    if (AuthStore.isAuthenticated()) {
      return checkRole(allowedRoles, router);
    }

    try {
      const response = await firstValueFrom(
        http.post<RefreshResponse>(
          `${API.AUTH_BASE_URL}/refresh`,
          {},
          { withCredentials: true }
        )
      );
      const user = mapApiUserToIuser(response.user);
      AuthStore.setAuth(user, response.access_token);
      return checkRole(allowedRoles, router);
    } catch {
      router.navigateByUrl('/auth/login');
      return false;
    }
  };
}
