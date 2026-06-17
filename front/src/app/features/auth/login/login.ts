import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PASSWORD_REGEX } from '../../../core/constants/PASSWORD_REGEX';
import { AuthService } from '../../../core/auth/auth-service';
import { AuthStore } from '../../../core/auth/auth.store';

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
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            identifiant: [''],
            password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
            userType: ['PRACTITIONER', [Validators.required]]
        })

        this.loginForm.get('identifiant')?.valueChanges.subscribe(() => {
            if (this.userType() === 'PRACTITIONER') {
                this.loginForm.controls['identifiant'].setValidators(Validators.required);
            }
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
            const { email, password } = this.loginForm.value;
            const response = await this.authService.login(email, password, this.userType());

            this.authStore.setAuth(response.user, response.token_type);

            if (response.requiresMfa) {
                this.router.navigateByUrl('/auth/mfa');
            } else {
                this.router.navigateByUrl(`/${this.userType() === 'PATIENT' ? 'patient' : 'practitioner'}/dashboard`);
            }
        } catch {
            this.serverError.set('L\'identifiant ou le mot de passe est incorrect.');
        } finally {
            this.isLoading.set(false);
        }
    }
}
