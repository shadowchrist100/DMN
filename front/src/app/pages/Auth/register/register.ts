import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule],
    templateUrl: './register.html',
    styleUrl: './register.css',
})
export class Register {
    private formBuilder = inject(FormBuilder);
    errors = signal<string>('');

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
            this.errors.set('Formulaire invalide')
        }
        console.log(this.registerForm.value);
    }
}
