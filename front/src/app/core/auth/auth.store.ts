import { computed, signal } from "@angular/core"
import { Iuser } from "../models/user.model";

// Etat Initial
const _user = signal<Iuser | null>(null);
const _token = signal<string | null>(null);

export const AuthStore = {
    // sélecteur ReadOnly
    user: _user.asReadonly(),
    token: _token.asReadonly(),
    isAuthenticated: computed(() => !!_user()),
    userRole: computed(() => _user()?.role ?? null),

    setAuth(user: Iuser, token: string) {
        _user.set(user);
        _token.set(token);
    },

    clearAuth() {
        _user.set(null);
        _token.set(null);
    }
}