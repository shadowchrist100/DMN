import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { PASSWORD_REGEX } from '../../../../core/constants/PASSWORD_REGEX';
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-patient-form',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './patient-form.html',
    styleUrl: './patient-form.css',
})
export class PatientForm {
    private formBuilder = inject(FormBuilder);
    errors = signal<string>('');

    loginForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]]
    }, { updateOn: 'blur' })

    onSubmit() {
        if (this.loginForm.invalid) {
            this.errors.set('Formulaire invalide');
        }
        console.log(this.loginForm);
    }
}
