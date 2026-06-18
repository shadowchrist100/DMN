import { computed, signal } from "@angular/core"
import { Iuser } from "../models/user.model";

const _user = signal<Iuser | null>(null);
const _token = signal<string | null>(null);

function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || typeof payload['exp'] !== 'number') return true;
  return payload['exp'] * 1000 < Date.now();
}

export const AuthStore = {
  user: _user.asReadonly(),
  token: _token.asReadonly(),
  isAuthenticated: computed(() => !!_user() && !!_token() && !isTokenExpired(_token()!)),
  userRole: computed(() => _user()?.role ?? null),
  userId: computed(() => {
    const token = _token();
    if (!token) return null;
    const payload = decodeToken(token);
    if (!payload || typeof payload['id'] !== 'string') return null;
    return payload['id'] as string;
  }),

  setAuth(user: Iuser, token: string) {
    _user.set(user);
    _token.set(token);
    try {
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_token', token);
    } catch {}
  },

  clearAuth() {
    _user.set(null);
    _token.set(null);
    try {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    } catch {}
  },

  hasRole(roles: string[]): boolean {
    const role = _user()?.role;
    return role ? roles.includes(role) : false;
  },

  updateToken(token: string) {
    _token.set(token);
    try {
      localStorage.setItem('auth_token', token);
    } catch {}
  },

  initFromStorage(): boolean {
    try {
      const raw = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');
      if (raw && token && !isTokenExpired(token)) {
        const user = JSON.parse(raw) as Iuser;
        _user.set(user);
        _token.set(token);
        return true;
      }
    } catch {}
    return false;
  },
}
