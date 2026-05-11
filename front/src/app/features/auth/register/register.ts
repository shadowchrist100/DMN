import { Component, computed, signal } from '@angular/core';
import { RegisterStore } from './register.store';
import { StepTypeCompte } from "./step-type-compte/step-type-compte";
import { StepIdentity } from "./step-identity/step-identity";
import { StepEmergencyContact } from "./step-emergency-contact/step-emergency-contact";
import { StepAuth } from "./step-auth/step-auth";
import { StepProfessionalInfo } from "./step-professional-info/step-professional-info";

@Component({
    selector: 'app-register',
    imports: [StepTypeCompte, StepIdentity, StepEmergencyContact, StepAuth, StepProfessionalInfo],
    templateUrl: './register.html',
    styleUrl: './register.css',
})
export class Register {
    store = RegisterStore;
    continue = signal<boolean>(false);
    steps = computed(()=>{
        if (this.store.userType() === "PATIENT" ) {
            return [
                {id:1 , label: 'Type de compte', icon:'person_search' },
                {id:2, label: 'Identité', icon: 'badge' },
                {id:3, label: 'Contact d\'urgence', icon:'contact_emergency' },
                {id:4, label: 'Sécurité & Accès', icon: 'lock_open' }
            ]
        }else{
            return [
                {id:1 , label: 'Type de compte', icon: 'person_search' },
                {id:2, label: 'Identité', icon: 'badge'},
                {id:3, label: 'Informations Professionels' },
                {id:4, label: 'Sécurité & Accès', icon: 'lock_open' }
            ]
        }
    })

    handleContinue() {
        this.store.setSubmited(true);
        if (this.store.continueSteps()) {
            this.store.nextStep();
        } else {

        }
    }

    handleBack() {
        this.store.prevStep();
        this.store.setSubmited(false);
        this.store.setContinueSteps(false);
    }

}
