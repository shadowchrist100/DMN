import { Component, effect, inject, OnInit, signal, untracked, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RegisterStore } from '../register.store';

const PHONE_RULES: Record<string, { lentgh: number; label: string; pattern: RegExp }> = {
    '+229': { label: 'Benin', lentgh: 10, pattern: /^[0-9]{10}$/ },
    // '+225': { label: 'Benin', lentgh: 10, pattern: /^[0-9]{10}$/ }
}

@Component({
    selector: 'app-step-identity',
    imports: [ReactiveFormsModule],
    templateUrl: './step-identity.html',
    styleUrl: './step-identity.css',
})
export class StepIdentity implements OnInit {
    private destroyRef = inject(DestroyRef);
    private fb = inject(FormBuilder);

    identityForm!: FormGroup;
    store = RegisterStore;
    phoneHint = signal<string>('Entrez votre numéro sans indicatif');
    photoPreview = signal<string | null>(null);
    photoFile = signal<File | null>(null);
    photoError = signal<string | null>(null);

    constructor() {
        effect(() => {
            if (this.store.submited()) {
                if (this.identityForm?.invalid) {
                    this.identityForm.markAllAsTouched();
                    this.store.setContinueSteps(false);
                } else {
                    this.store.setContinueSteps(true);
                }
                untracked(() => { this.store.setSubmited(false); });
            }
        })
    }

    ngOnInit(): void {
        this.identityForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', [Validators.required]],
            gender: ['', [Validators.required]],
            birthDate: ['', [Validators.required, this.pastDateValidator()]],
            npi: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
            photoPath: [null],
            maritalStatus: ['', [this.maritalStatusValidator()]],
            phone: ['', [Validators.required, this.phoneByPrefixValidator()]],
            phonePrefix: ['', [Validators.required]],
            city: ['', [Validators.required]],
            address: ['', [Validators.required]],
            isMultipleBirth: [null, [Validators.required]],
            birthOrder: [{ value: '', disabled: true }]
        }, { updateOn: 'blur' });

        this.identityForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((val) => {
            this.store.setContinueSteps(this.identityForm.valid);
            if (this.identityForm.valid) {
                this.store.setUserIdentity({
                    lastName: val.lastName,
                    firstName: val.firstName,
                    birthDate: new Date(val.birthDate),
                    gender: val.gender,
                    npi: Number(val.npi),
                    maritalStatus: val.maritalStatus ?? 'single',
                    multipleBirth: val.isMultipleBirth ? Number(val.birthOrder) : null,
                    phone: `${val.phonePrefix} ${val.phone}`,
                    city: val.city,
                    address: val.address,
                    photoPath: val.photoPath ? URL.createObjectURL(val.photoPath) : '',
                });
            }
        });

        this.identityForm.get("phonePrefix")!.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((prefix: string) => {
            this.identityForm.get('phone')!.updateValueAndValidity();
            const rule = PHONE_RULES[prefix];
            this.phoneHint.set(
                rule ? `${rule.label} : ${rule.lentgh} chiffres requis` : 'Entrer votre numéro'
            )
        })

        this.watchMultipleBirth();
    }

    private phoneByPrefixValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            // Remonte au FormGroup pour lire le préfixe
            const prefix = control.parent?.get('phonePrefix')?.value as string;
            const number = (control.value as string)?.replace(/\s/g, ''); // ignore les espaces

            if (!number) return null;

            const rule = PHONE_RULES[prefix];

            if (!rule) return null; // préfixe inconnu → pas de règle à appliquer

            if (!rule.pattern.test(number)) {
                return {
                    phoneInvalid: {
                        expected: rule.lentgh,
                        label: rule.label,
                        message: `Numéro ${rule.label} invalide — ${rule.lentgh} chiffres requis`
                    }
                };
            }
            return null;
        };
    }

    private maritalStatusValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const userType = this.store.userType();
            if (userType === "PATIENT" || userType === "PRACTITIONER") {
                return control.value ? null : { required: true };
            }
            return null;
        }
    }

    private pastDateValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;
            return (new Date() < new Date(control.value) ? { invalidDate: true } : null);
        }
    }

    private watchMultipleBirth(): void {
        this.identityForm.get('isMultipleBirth')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isMultiple: boolean) => {
            const birthOrderControl = this.identityForm.get('birthOrder');

            if (isMultiple) {
                // Si oui, le rang devient obligatoire et le champ est activé
                birthOrderControl?.enable();
                birthOrderControl?.setValidators([Validators.required]);
            } else {
                // Si non, on réinitialise la valeur, on retire les règles et on désactive le champ
                birthOrderControl?.setValue('');
                birthOrderControl?.clearValidators();
                birthOrderControl?.disable();
            }
            // Forcer la mise à jour des états de validation du champ
            birthOrderControl?.updateValueAndValidity();
        });
    }

    isInvalid(field: string) {
        const control = this.identityForm.get(field);
        // console.log(control);

        // console.log(control?.errors);

        return !!(control?.invalid && control.touched)
    }


    onPhotoSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        this.photoError.set(null);

        if (!file) return;

        // Validation format
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            this.photoError.set('Format non supporté. Utilisez JPG ou PNG.');
            return;
        }

        // Validation taille (5 Mo)
        if (file.size > 5 * 1024 * 1024) {
            this.photoError.set('Fichier trop lourd. Maximum 5 Mo autorisé.');
            return;
        }

        this.identityForm.patchValue({
            photoPath: file,
        })

        this.photoFile.set(file);
        this.store.setRegistrationFiles({ photoFile: file });
        this.identityForm.patchValue({ photoPath: file })

        // Génération de l'aperçu
        const reader = new FileReader();
        reader.onload = (e) => this.photoPreview.set(e.target?.result as string);
        reader.readAsDataURL(file);
    }

    removePhoto(): void {
        this.photoPreview.set(null);
        this.photoFile.set(null);
        this.photoError.set(null);
        this.identityForm.patchValue({ photoPath: null });
        this.store.setRegistrationFiles({ photoFile: null });
    }

}
