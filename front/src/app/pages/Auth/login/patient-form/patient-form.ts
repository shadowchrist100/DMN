import { Component, inject, output, signal } from '@angular/core';
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
    view = output<string>();
    private formBuilder = inject(FormBuilder);
    errors = signal<string>('');
    serverError = signal<string>('');
    showPassword = signal<boolean>(false);
    loading = signal<boolean>(false);

    loginForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]]
    }, { updateOn: 'blur' })

    isInvalid(field: string){
        const control = this.loginForm.get(field);
        return !! (control?.invalid && control?.touched);
    }

    onErrorClose(){
        this.serverError.set('');
    }

    togglePasswordVisibility(){
        this.showPassword.set(!this.showPassword());
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            this.serverError.set('Formulaire invalide');
            return;
        }
        this.loading.set(true);
        console.log(this.loginForm);
        
    }

    switchForm(value: string){
        this.view.emit(value);
    }
}
