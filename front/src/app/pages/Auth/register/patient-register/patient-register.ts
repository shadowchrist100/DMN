import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";

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
        nom : [],
        dateNaissance : [],
        genre : [],
        mail: [],
        telephone: [],
        addresse: [],
        nomContact: [],
        relation: [],
        contact: [],

    })


    OnSubmit() {
        this.router.navigateByUrl('/success-inscription');
    }
    
}
