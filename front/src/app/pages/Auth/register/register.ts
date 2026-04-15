import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { email } from '@angular/forms/signals';

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule],
    templateUrl: './register.html',
    styleUrl: './register.css',
})
export class Register {
    private formBuilder = inject(FormBuilder);

    registerForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.max(30)]],
        medicalId : ['', [Validators.required] ],
        specilatity : [''],
        facility : ['', Validators.required],
        email : ['', [Validators.required, Validators.email] ],
        password : ['', [Validators.required] ]
    })

    onSubmit(){
        if (this.registerForm.invalid) {
            
        }
        console.log(this.registerForm.value);
    }
}
