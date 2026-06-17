import { Component, effect, inject, signal, untracked, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";
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
    imports: [ReactiveFormsModule],
    templateUrl: './step-emergency-contact.html',
    styleUrl: './step-emergency-contact.css',
})
export class StepEmergencyContact implements OnInit {
    private destroyRef = inject(DestroyRef);
    private fb = inject(FormBuilder);
    store = RegisterStore;
    emergencyForm!: FormGroup;
    phoneHint = signal<string>('Benin: 10 chiffres requis');

    constructor() {
        effect(() => {
            if (this.store.submited()) {
                if (this.emergencyForm?.invalid) {
                    this.emergencyForm.markAllAsTouched();
                    this.store.setContinueSteps(false);
                } else {
                    this.store.setContinueSteps(true);
                }
            }
            untracked(() => {
                this.store.setSubmited(false);
            })
        })
    }

    ngOnInit(): void {
        this.emergencyForm = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            phonePrefix: ['', [Validators.required]],
            phone: ['', [Validators.required, this.phoneByPrefixValidator()]],
            relation: ['', [Validators.required]],
            emergencyContactConfirmed: [false, [Validators.requiredTrue]],
        }, { updateOn: 'blur' });

        this.emergencyForm.get('phonePrefix')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((prefix: string) => {
            this.emergencyForm.get('phone')?.updateValueAndValidity();
            const role = PHONE_RULES[prefix];
            this.phoneHint.set(
                role ? `${role.label}: ${role.length} chiffres requis ` : 'Entrer votre numéro'
            );
        });

        this.emergencyForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((val) => {
            this.store.setContinueSteps(this.emergencyForm.valid);
            if (this.emergencyForm.valid) {
                this.store.setUserContact({
                    firstName: val.firstName,
                    lastName: val.lastName,
                    phone: `${val.phonePrefix} ${val.phone}`,
                    relation: val.relation,
                });
            }
        });
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
    

