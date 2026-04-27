import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../Auth/Services/auth-service';

@Component({
    selector: 'app-home',
    imports: [],
    templateUrl: './home.html',
    styleUrl: './home.css',
})
export class Home {
    private router = inject(Router);
    private authService = inject(AuthService);
    user = this.authService.user;
    errors = signal<string>('');
    setUser(type: string) {
        if (this.user() !== type) {
            this.authService.setUser(type);
        }
    }

    onNext() {
        switch (this.user()) {
            case 'patient':
                this.router.navigateByUrl('/patientRegister');
                break;
            case 'healthProvider':
                this.router.navigateByUrl('/healthProviderRegister');
                break;
            default:
                this.errors.set('Choisissez votre profil');
        }
    }
}
