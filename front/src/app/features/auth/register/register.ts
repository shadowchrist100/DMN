import { Component, inject, input, output, signal } from '@angular/core';
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
    store = RegisterStore;
    continue = signal<boolean>(false);

    userType = signal<'PATIENT' | 'PRACTITIONER' | null>('PATIENT');

    handleContinue() {
        console.log(this.store.userType());
        
        if (this.store.continueSteps()) {
            this.store.nextStep();
        }else{

        }
    }
}
