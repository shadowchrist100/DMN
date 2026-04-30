import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PASSWORD_REGEX } from '../../../../core/constants/PASSWORD_REGEX';

@Component({
    selector: 'app-health-provider-register',
    imports: [ReactiveFormsModule],
    templateUrl: './health-provider-register.html',
    styleUrl: './health-provider-register.css',
})
export class HealthProviderRegister {
    private formBuilder = inject(FormBuilder);
    private router = inject(Router);
    errors = signal<string>('');
    showPassword = signal<boolean>(false);
    serverError = signal<string>('');

    registerForm = this.formBuilder.group({
        firstName: ['', Validators.required ],
        lastName: ['', [Validators.required, Validators.max(30)]],
        medicalId: ['', [Validators.required]],
        speciality: ['', [Validators.required]],
        organisation: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
        confirmPassword: ['', [Validators.required] ]
    })

    passwordMatchValidators(password:string, confirmPassword:string){
        return (control: AbstractControl): ValidationErrors | null =>{
            const pass = control.get(password);
            const target = control.get(confirmPassword);
            if (!pass  || !target)  return null;
            
            if (pass.value && target.value && pass.valid !== target.value  ) {
                target.setErrors({...target.errors, mismatch:true})
                return {mismatch: true};
            }

            if (target.hasError('mismatch')) {
                const {mismatch, ...remaining } = target.errors ?? {};
                target.setErrors(Object.keys(remaining).length ===0 ? null: remaining );
            }

            return null;
        }
    }
    onSubmit() {
        this.router.navigateByUrl('/success-inscription');
        if (this.registerForm.invalid) {
            this.errors.set('Formulaire invalide')
        }
        console.log(this.registerForm.value);
    }

    togglePasswordVisibility(){
        this.showPassword.set(!this.showPassword());
    }

    onErrorClose(){
        this.serverError.set('');
    }

    isInvalid(field: string){
        const control = this.registerForm.get(field);
        return !!(control?.invalid && control?.touched);
    }
}
