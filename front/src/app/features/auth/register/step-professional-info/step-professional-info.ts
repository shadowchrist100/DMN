import { Component, inject } from '@angular/core';
import { RegisterStore } from '../register.store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-step-professional-info',
    imports: [],
    templateUrl: './step-professional-info.html',
    styleUrl: './step-professional-info.css',
})
export class StepProfessionalInfo {
    constructor() {

    }

    store = RegisterStore;
    private fb = inject(FormBuilder);
    professionalInfoForm!: FormGroup;

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.professionalInfoForm = this.fb.group({
            orderNumber: ['', Validators.required],
            speciality: ['', Validators.required],
            organization: this.fb.group({
                name: ['', Validators.required],
                type: ['', Validators.required],
                phonePrefix: ['', Validators.required],
                phone: ['', Validators.required],
                city: ['', Validators.required],
                departpement: ['', Validators.required],
                address: []
            }),
        })
    }

    isInvalid = (field: string) =>
        this.professionalInfoForm.get(field)?.invalid && this.professionalInfoForm.get(field)?.touched;

    isOrganizationFieldInvalid = (field: string) =>
        this.professionalInfoForm.get('organization.' + field)?.invalid &&
        this.professionalInfoForm.get('organization.' + field)?.touched;

}
