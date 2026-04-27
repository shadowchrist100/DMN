import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { PASSWORD_REGEX } from '../../../../core/constants/PASSWORD_REGEX';

@Component({
    selector: 'app-health-provider-form',
    imports: [ReactiveFormsModule],
    templateUrl: './health-provider-form.html',
    styleUrl: './health-provider-form.css',
})
export class HealthProviderForm {
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
