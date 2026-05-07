import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PASSWORD_REGEX } from '../../../core/constants/PASSWORD_REGEX';

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


    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            identifiant: [''],
            password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
            userType: ['', [Validators.required]]
        })

        this.loginForm.get('identifiant')?.valueChanges.subscribe( () => {
            if (this.userType() === 'PRACTITIONER' ) {
                this.loginForm.controls['identifiant'].setValidators(Validators.required);
            }
        })
    }

    definedUserType(userType: string) {
        if (this.userType() !== userType) {
            this.userType.set(userType);
            this.loginForm.patchValue({
                userType : userType
            })
        }
        else {
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

    onSubmit() {
        if (this.loginForm?.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }
        this.isLoading.set(true);
        console.log(this.loginForm.value);
        this.router.navigateByUrl(`/${this.userType()=== 'PATIENT' ? 'patient': 'practitioner' }/dashboard`)
    }
}
