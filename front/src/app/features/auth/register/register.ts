import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterStore } from './register.store';
import { StepTypeCompte } from "./step-type-compte/step-type-compte";
import { StepIdentity } from "./step-identity/step-identity";
import { StepEmergencyContact } from "./step-emergency-contact/step-emergency-contact";
import { StepAuth } from "./step-auth/step-auth";

@Component({
    selector: 'app-register',
    imports: [StepTypeCompte, StepIdentity, StepEmergencyContact, StepAuth],
    templateUrl: './register.html',
    styleUrl: './register.css',
})
export class Register {
    private router = inject(Router);
    store = RegisterStore;

    userType = signal<'PATIENT' | 'PRACTITIONER' | null>('PATIENT');

    handleContinue() {
        if (this.store.userType()) {
            this.store.nextStep();
        }else{

        }
    }
}
