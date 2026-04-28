import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
    selector: 'app-patient-register',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './patient-register.html',
    styleUrl: './patient-register.css',
})
export class PatientRegister {
    private router = inject(Router);
    private formBuilder = inject(FormBuilder);
    patientForm = this.formBuilder.group({
        firstName : ['', [Validators.required] ],
        lastName : ['', [Validators.required] ],
        birthDate : ['', [Validators.required] ],
        genre : ['', [Validators.required] ],
        matrimonialStatus: ['', [Validators.required] ] ,
        email: ['', [Validators.required] ],
        contact: ['', [Validators.required] ],
        adresse: ['', [Validators.required] ],
        contactFirstName: ['', [Validators.required] ],
        contactLastName: ['', [Validators.required] ],
        contactRelation: ['', [Validators.required] ],
        contactContact: ['', [Validators.required] ],
    })


    OnSubmit() {
        if (this.patientForm.invalid) {
            console.log("form invalid");
        }
        this.router.navigateByUrl('/success-inscription');
    }
    
}
