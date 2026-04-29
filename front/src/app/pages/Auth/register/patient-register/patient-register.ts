import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { PASSWORD_REGEX } from '../../../../core/constants/PASSWORD_REGEX';

@Component({
    selector: 'app-patient-register',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './patient-register.html',
    styleUrl: './patient-register.css',
})
export class PatientRegister implements OnInit {
    private router = inject(Router);
    private fb = inject(FormBuilder);
    serverError = signal<string>('');

    showPassword = false;
    loading = false;
    patientForm!: FormGroup;

    ngOnInit(): void {
        this.patientForm = this.fb.group({
            identity: this.fb.group({
                firstName: ['', Validators.required],
                lastName: ['', Validators.required],
                birthDate: ['', [Validators.required, this.pastDateValidator()]],
                genre: ['', Validators.required],
                matrimonialStatus: ['', Validators.required],
                phone: ['', Validators.required],
            }),

            address: this.fb.group({
                city: ['', Validators.required],
                neighborhood: ['', Validators.required],
                country: ['', Validators.required],
            }),

            emergencyContact: this.fb.group({
                firstName: ['', Validators.required],
                lastName: ['', Validators.required],
                relation: ['', Validators.required],
                phone: ['', Validators.required],
            }),

            // confirmPassword validator scoped to the auth group only
            auth: this.fb.group({
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
                confirmPassword: ['', Validators.required],
            }, { validators: this.passwordMatchValidator() }),

        }, { updateOn: 'blur' });
    }

    // Validates that confirmPassword matches password, applied at the auth group level
    private passwordMatchValidator(): ValidatorFn {
        return (group: AbstractControl): ValidationErrors | null => {
            const password = group.get('password');
            const confirmPassword = group.get('confirmPassword');

            if (!password || !confirmPassword) return null;

            if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
                confirmPassword.setErrors({ ...confirmPassword.errors, mismatch: true });
                return { mismatch: true };
            }

            // Clear only the mismatch error if passwords now match
            if (confirmPassword.hasError('mismatch')) {
                const { mismatch, ...remaining } = confirmPassword.errors ?? {};
                confirmPassword.setErrors(Object.keys(remaining).length ? remaining : null);
            }

            return null;
        };
    }

    // Inline validator on the control — avoids mutating child state from a parent validator
    private pastDateValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;
            return new Date(control.value) > new Date()
                ? { invalidDate: true }
                : null;
        };
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    // Convenience helpers used in the template
    getGroup(section: string): FormGroup {
        return this.patientForm.get(section) as FormGroup;
    }

    getControl(section: string, field: string) {
        return this.patientForm.get(`${section}.${field}`);
    }

    isInvalid(section: string, field: string): boolean {
        const control = this.getControl(section, field);
        return !!(control?.invalid && control?.touched);
    }

    // Kept for backward compatibility with template group-level error checks
    getIdentity() { return this.getGroup('identity'); }
    getAddress() { return this.getGroup('address'); }
    getEmergencyContact() { return this.getGroup('emergencyContact'); }
    getAuth() { return this.getGroup('auth'); }

    onErrorClose(){
        this.serverError.set('');    
    }

    onSubmit(): void {
        if (this.patientForm.invalid) {
            this.patientForm.markAllAsTouched();
            return;
        }
        this.loading = true;
        // Replace with your actual service call
        console.log(this.patientForm.value);
        this.router.navigateByUrl('/success-inscription');
    }
}