import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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

    registerForm = this.formBuilder.group({
        firstName: ['', Validators.required ],
        lastName: ['', [Validators.required, Validators.max(30)]],
        medicalId: ['', [Validators.required]],
        speciality: [''],
        organisation: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required] ]
    })

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
}
