import { Component, inject } from '@angular/core';
import { AuthService } from '../../Services/auth-service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-success-connect',
    imports: [],
    templateUrl: './success-connect.html',
    styleUrl: './success-connect.css',
})
export class SuccessConnect {
    private authService = inject(AuthService);
    private router = inject(Router);
    user = this.authService.user;
    onSubmit() {
        console.log(this.user());
        
        switch (this.user()){
            case 'patient' :
                this.router.navigateByUrl('/patient/dashboard');
                break;
            case 'healthProvider':
                this.router.navigateByUrl('/doctor/dashboard');
                break;
        }
    }
}
