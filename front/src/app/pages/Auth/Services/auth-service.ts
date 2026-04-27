import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly _user = signal<string>('');
    readonly user = this._user.asReadonly();

    setUser(type: string){
        this._user.set(type);
    }

}
