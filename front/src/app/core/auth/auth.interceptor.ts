import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthStore } from './auth.store';
import { API } from '../config/api.config';
import { mapApiUserToIuser, ApiUser } from './auth-service';

interface RefreshResponse {
  access_token: string;
  user: ApiUser;
}

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

function shouldSkip(url: string): boolean {
  const skips = ['/login', '/register', '/forgot', '/reset-password', '/refresh'];
  return skips.some(s => url.includes(s));
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  if (shouldSkip(req.url)) {
    return next(req);
  }

  const token = AuthStore.token();
  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401(req, next, router, http);
      }
      return throwError(() => error);
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function handle401(
  originalReq: HttpRequest<unknown>,
  next: HttpHandlerFn,
  router: Router,
  http: HttpClient
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    return http.post<RefreshResponse>(`${API.AUTH_BASE_URL}/refresh`, {}, { withCredentials: true }).pipe(
      switchMap((response) => {
        isRefreshing = false;
        const newToken = response.access_token;
        const user = mapApiUserToIuser(response.user);
        AuthStore.setAuth(user, newToken);
        refreshSubject.next(newToken);
        return next(addToken(originalReq, newToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        AuthStore.clearAuth();
        router.navigateByUrl('/auth/login');
        return throwError(() => err);
      })
    );
  }

  return refreshSubject.pipe(
    filter((t): t is string => t !== null),
    take(1),
    switchMap((newToken) => next(addToken(originalReq, newToken)))
  );
}
