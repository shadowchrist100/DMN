import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ɵInternalFormsSharedModule, ReactiveFormsModule } from "@angular/forms";

@Component({
    selector: 'app-step-emergency-contact',
    imports: [ɵInternalFormsSharedModule, ReactiveFormsModule],
    templateUrl: './step-emergency-contact.html',
    styleUrl: './step-emergency-contact.css',
})
export class StepEmergencyContact { 
    private fb = inject(FormBuilder);
    emergencyForm!: FormGroup;

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.emergencyForm = this.fb.group({
            firstName: ['', [Validators.required] ],
            lastName: ['', [Validators.required] ],
            phone: ['', [Validators.required] ]
        })
    }

    isInvalid(field: string){
        const control = this.emergencyForm.get(field);
        return !!(control?.invalid && control.touched)
    }

}
