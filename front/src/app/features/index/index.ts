import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-index',
    imports: [],
    templateUrl: './index.html',
    styleUrl: './index.css',
})
export class Index {
    private router = inject(Router)
    handleSignIn() {
        this.router.navigateByUrl("/auth/login")
    }

    handleSignOn(){
        this.router.navigateByUrl('auth/register');
    }
}
