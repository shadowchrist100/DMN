import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PASSWORD_REGEX } from '../../../core/constants/PASSWORD_REGEX';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    private formBuilder = inject(FormBuilder);

    loginForm = this.formBuilder.group({
        email : ['', [Validators.required, Validators.email] ],
        password : ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)] ]
    },{updateOn : 'blur'} )

    onSubmit(){
        if (this.loginForm.invalid) {
            
        }
        console.log(this.loginForm);
    }
}
