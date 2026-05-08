import { Component, output, OnInit } from '@angular/core';
import { userType, RegisterStore } from '../register.store';

@Component({
    selector: 'app-step-type-compte',
    imports: [],
    templateUrl: './step-type-compte.html',
    styleUrl: './step-type-compte.css',
})
export class StepTypeCompte implements OnInit {
    store = RegisterStore;
    type = output<userType>();

    ngOnInit(): void {
        // Initial emit if a type is already selected
        if (this.store.userType()) {
            this.type.emit(this.store.userType());
        }
    }

    toggleUser(userType: 'PATIENT' | 'PRACTITIONER') {
        if (this.store.userType() === userType) {
            this.store.setUserType(null);
        } else {
            this.store.setUserType(userType);
        }
        this.type.emit(this.store.userType());
    }
}
