import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ɵInternalFormsSharedModule, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";
import { RegisterStore } from '../register.store';

const PHONE_RULES: Record<string, { label: string, length: number, pattern: RegExp }> = {
    '+229': { length: 10, label: 'Bénin', pattern: /^[0-9]{10}$/ },
    '+225': { length: 10, label: "Côte d'Ivoire", pattern: /^[0-9]{10}$/ },
    '+228': { length: 8, label: 'Togo', pattern: /^[0-9]{8}$/ },
    '+234': { length: 11, label: 'Nigeria', pattern: /^[0-9]{11}$/ },
    '+33': { length: 10, label: 'France', pattern: /^[0-9]{10}$/ },
}

@Component({
    selector: 'app-step-emergency-contact',
    imports: [ɵInternalFormsSharedModule, ReactiveFormsModule],
    templateUrl: './step-emergency-contact.html',
    styleUrl: './step-emergency-contact.css',
})
export class StepEmergencyContact {

    constructor(){
        effect(()=>{
            if (this.store.submited()) {
                if (this.emergencyForm.invalid) {
                    this.emergencyForm.markAllAsTouched();
                    this.store.setContinueSteps(false);
                }else{
                    this.store.setContinueSteps(true);
                }
            }

            untracked(()=>{
                this.store.setSubmited(false);
            })
        })
    }

    store = RegisterStore;
    private fb = inject(FormBuilder);
    emergencyForm!: FormGroup;

    phoneHint = signal<string>('Benin: 10 chiffres requis');

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.

        this.emergencyForm = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            phonePrefix: ['', [Validators.required]],
            phone: ['', [Validators.required, this.phoneByPrefixValidator() ]],
            relation: ['', [Validators.required]]
        }, { updateOn: 'blur' });

        this.emergencyForm.get('phonePrefix')?.valueChanges.subscribe((prefix: string) => {
            this.emergencyForm.get('phone')?.updateValueAndValidity();
            const role = PHONE_RULES[prefix];
            this.phoneHint.set(
                role ? `${role.label}: ${role.length} chiffres requis ` : 'Entrer votre numéro'
            );

        })
    }

    isInvalid(field: string) {
        const control = this.emergencyForm.get(field);
        return !!(control?.invalid && control.touched)
    }
    private phoneByPrefixValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const prefix = control.parent?.get('phonePrefix')?.value as string;
            const number = (control.value as string).replace(/\s/g, '')
            const rule = PHONE_RULES[prefix];
            if (!rule) return null;

            if (!rule.pattern.test(number)) {
                return {
                    phoneInvalid: {
                        expected: rule.length,
                        label: rule.label,
                        message: `Numéro ${rule.label} invalide — ${rule.length} chiffres requis`,
                    },
                };
            }

            return null;
        };

    }
}
    

