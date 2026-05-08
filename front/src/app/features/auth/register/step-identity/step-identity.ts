import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RegisterStore } from '../register.store';

@Component({
    selector: 'app-step-identity',
    imports: [ReactiveFormsModule],
    templateUrl: './step-identity.html',
    styleUrl: './step-identity.css',
})
export class StepIdentity implements OnInit {
    identityForm!: FormGroup;
    store = RegisterStore;
    serverError = signal<string>('')
    fb = inject(FormBuilder);

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.identityForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', [Validators.required]],
            gender: ['', [Validators.required]],
            birthDate: ['', [Validators.required, this.pastDateValidator() ]],
            npi: ['', [Validators.required]],
            photoPath: ['', [Validators.required]],
            matrimonialStatus: ['', [Validators.required]],
            phone: ['', [Validators.required]],
            speciality: ['', [this.setSpecilityRequired()]]
        });
    }

    private setSpecilityRequired() {
        return (control: AbstractControl) => {
            if (this.store.userType() === "PRACTITIONER") {
                control.setValidators(Validators.required);
            }

        }
    }

    private pastDateValidator(): ValidatorFn{
        return (control : AbstractControl) : ValidationErrors | null => {
            if(!control.value) return null;
            return ( new Date() < new Date(control.value) ? {invalidDate: true} : null  );
        }
    }

    isInvalid(field: string){
        const control = this.identityForm.get(field);
        return !!(control?.invalid && control.touched)
    }
    
    onErrorClose(){
        
    }

}
