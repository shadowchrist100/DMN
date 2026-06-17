import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth-service';
import { AuthStore } from '../../../core/auth/auth.store';

const ROLE_REDIRECT: Record<string, string> = {
  PATIENT: '/patient/dashboard',
  PRACTITIONER: '/practitioner/dashboard',
  admin: '/admin/dashboard',
  admin_medical: '/admin/dashboard',
  admin_organisation: '/admin/dashboard',
};

function getDashboardPath(role: string): string {
  return ROLE_REDIRECT[role] ?? '/auth/login';
}

@Component({
    selector: 'app-login',
    imports: [RouterLink, ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login implements OnInit {
    userType = signal<string>('PRACTITIONER');
    isLoading = signal<boolean>(false);
    showPassword = signal<boolean>(false);
    formBuilder = inject(FormBuilder);
    serverError = signal<string>('');
    loginForm!: FormGroup;
    private router = inject(Router);
    private authService = inject(AuthService);
    private authStore = AuthStore;

    ngOnInit(): void {
        if (AuthStore.isAuthenticated()) {
            this.router.navigateByUrl(getDashboardPath(AuthStore.userRole()!));
            return;
        }

        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
            userType: ['PRACTITIONER', [Validators.required]]
        })
    }

    definedUserType(userType: string) {
        if (this.userType() !== userType) {
            this.userType.set(userType);
            this.loginForm.patchValue({ userType })
        } else {
            this.userType.set('');
        }
    }

    toggleShowPassword() {
        this.showPassword.set(!this.showPassword());
    }

    isInvalid(field: string) {
        const control = this.loginForm.get(field);
        return !!(control?.invalid && control?.touched)
    }

    async onSubmit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.serverError.set('');

        try {
            const { email } = this.loginForm.value;
            const response = await this.authService.login(email, this.loginForm.value.password, this.userType());

            const actualRole = response.user.role;
            const selectedType = this.userType();

            if (selectedType === 'PATIENT' && actualRole !== 'PATIENT') {
                this.serverError.set('Ce compte n\'est pas un patient. Veuillez sélectionner le bon type de compte.');
                this.isLoading.set(false);
                return;
            }
            if (selectedType === 'PRACTITIONER' && actualRole !== 'PRACTITIONER') {
                this.serverError.set('Ce compte n\'est pas un praticien. Veuillez sélectionner le bon type de compte.');
                this.isLoading.set(false);
                return;
            }
            if (selectedType === 'ORGANISATION' && actualRole !== 'admin_organisation') {
                this.serverError.set('Ce compte n\'est pas un administrateur d\'organisation. Veuillez sélectionner le bon type de compte.');
                this.isLoading.set(false);
                return;
            }

            this.authStore.setAuth(response.user, response.access_token);
            this.router.navigateByUrl(getDashboardPath(actualRole!));
        } catch {
            this.serverError.set('Email ou mot de passe incorrect.');
        } finally {
            this.isLoading.set(false);
        }
    }
}
