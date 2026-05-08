import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { PASSWORD_REGEX } from '../../../../core/constants/PASSWORD_REGEX';

@Component({
    selector: 'app-step-auth',
    imports: [ReactiveFormsModule],
    templateUrl: './step-auth.html',
    styleUrl: './step-auth.css',
})
export class StepAuth {
    private fb = inject(FormBuilder);
    authForm!: FormGroup;

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.authForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
            confirmPassword: ['', [Validators.required]]
        }, { updateOn: 'blur', validators: this.passwordMismathValidator() })
    }

    private passwordMismathValidator(): ValidatorFn {
        return (group: AbstractControl): ValidationErrors | null => {
            const password = group.get('password');
            const confirmPassword = group.get('confirmPassword');

            if (!password || !confirmPassword) return null;

            if (password.value !== confirmPassword.value) {
                confirmPassword.setErrors({ ...confirmPassword.errors, mismatch: true });
                return { mismatch: true }
            }
            else {
                if (confirmPassword.hasError('mismatch')) {
                    const { mismatch, ...remainingErrors } = confirmPassword.errors ?? {};
                    confirmPassword.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
                }
            }
            return null;
        }
    }

    isInvalid(field: string) {
        const control = this.authForm.get(field);
        return !!(control?.invalid && control.touched)
    }

}
