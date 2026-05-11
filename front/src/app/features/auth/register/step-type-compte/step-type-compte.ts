import { Component, output, OnInit, signal } from '@angular/core';
import { userType, RegisterStore } from '../register.store';
import { FormControl, ReactiveFormsModule, Validators, } from '@angular/forms';

@Component({
    selector: 'app-step-type-compte',
    imports: [ReactiveFormsModule],
    templateUrl: './step-type-compte.html',
    styleUrl: './step-type-compte.css',
})
export class StepTypeCompte implements OnInit {
    store = RegisterStore;
    acceptPolitic!: FormControl;

    ngOnInit(): void {
        // Initial emit if a type is already selected
        this.acceptPolitic = new FormControl(false, [Validators.requiredTrue])
        this.acceptPolitic.valueChanges.subscribe((accepted) => {
            this.checkValidation(accepted);
        })
    }

    toggleUser(userType: 'PATIENT' | 'PRACTITIONER') {
        console.log(this.store.userType());
        this.store.setUserType(userType);
        console.log(this.store.userType());
        this.checkValidation(this.acceptPolitic.value)
    }

    checkValidation(isPoliticAccepted: boolean | null) {
        const isValid = !!(this.store.userType() && isPoliticAccepted);
        this.store.setContinueSteps(isValid);
    }

}