import { Component, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RegisterStore } from '../register.store';

interface PasswordCriterion {
    label: string;
    hint: string;
    test: (value: string) => boolean;
}

const PASSWORD_CRITERIA: PasswordCriterion[] = [
    { label: '8 caractères minimum', hint: "Plus c'est long, mieux c'est.", test: (v) => v.length >= 8 },
    { label: 'Lettre majuscule', hint: 'Au moins une (A-Z).', test: (v) => /[A-Z]/.test(v) },
    { label: 'Chiffre & Symbole', hint: '0-9 et @#$!%...', test: (v) => /[0-9]/.test(v) && /[@#$!%*?&^()_\-+=]/.test(v) },
];

const STRENGTH_CONFIG = [
    { label: 'Très faible', color: 'text-error', bars: 1 },
    { label: 'Faible', color: 'text-error', bars: 1 },
    { label: 'Moyen', color: 'text-warning', bars: 2 },
    { label: 'Fort', color: 'text-success', bars: 3 },
    { label: 'Très fort', color: 'text-success', bars: 4 },
] as const;

const BAR_COLORS = ['', 'bg-error', 'bg-warning', 'bg-success', 'bg-success'];

@Component({
    selector: 'app-step-auth',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './step-auth.html',
    styleUrl: './step-auth.css',
})
export class StepAuth implements OnInit {
    private fb = inject(FormBuilder);
    private destroyRef = inject(DestroyRef);
    store = RegisterStore;

    authForm!: FormGroup;

    // Signaux d'état d'interface (UI State)
    showPassword = signal(false);
    showConfirmPassword = signal(false);
    passwordStrength = signal(0);
    criteriaStatus = signal<boolean[]>([false, false, false]);

    // État d'accès aux fichiers pour raccourcis template légers
    files = signal<{ identityFile: File | null; medicalCardFile: File | null }>({
        identityFile: null,
        medicalCardFile: null
    });

    readonly criteria = PASSWORD_CRITERIA;
    strengthConfig = computed(() => STRENGTH_CONFIG[this.passwordStrength()]);

    strengthBars = computed(() => {
        const filled = this.passwordStrength();
        return Array.from({ length: 4 }, (_, i) =>
            i < filled ? BAR_COLORS[filled] : 'bg-surface-container'
        );
    });

    ngOnInit(): void {
        this.store.setContinueSteps(false);

        // Initialisation de base du formulaire
        this.authForm = this.fb.group(
            {
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.minLength(8)]],
                confirmPassword: ['', [Validators.required]],
                identityDocType: ['', [Validators.required]],
                identityFile: [null, [Validators.required]],
                medicalCardFile: [null] // Configuré conditionnellement juste après
            },
            {
                validators: this.passwordMismatchValidator()
            }
        );

        // Ajustement des règles si professionnel médical
        this.setupRoleBasedValidators();

        // Calculateur de force réactif en temps réel
        this.authForm.get('password')!.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value: string) => {
                this.updateStrength(value ?? '');
            });

        this.authForm.statusChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((status) => {
                this.store.setContinueSteps(status === 'VALID');
            });

        this.authForm.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((val) => {
                if (this.authForm.valid) {
                    this.store.setUserAuth({ email: val.email, password: val.password });
                    this.store.setRegistrationFiles({
                        identityDocType: val.identityDocType ?? '',
                    });
                }
            });

        // Traitement initial si déjà soumis (comportement d'édition/re-validation)
        if (this.store.submited()) {
            if (this.authForm.invalid) {
                this.authForm.markAllAsTouched();
                this.store.setContinueSteps(false);
            }
        }
    }

    private setupRoleBasedValidators(): void {
        const medicalControl = this.authForm.get('medicalCardFile');
        if (this.store.userType() === 'PRACTITIONER') {
            medicalControl?.setValidators([Validators.required]);
        } else {
            medicalControl?.clearValidators();
            medicalControl?.setValue(null);
        }
        medicalControl?.updateValueAndValidity();
    }

    private updateStrength(value: string): void {
        const statuses = PASSWORD_CRITERIA.map((c) => c.test(value));
        this.criteriaStatus.set(statuses);

        if (!value) {
            this.passwordStrength.set(0);
            return;
        }

        const passed = statuses.filter(Boolean).length;
        const score = passed === 3 && value.length >= 12 ? 4 : passed;
        this.passwordStrength.set(score);

        // Validation additionnelle manuelle si la force est insuffisante (ex: exiger au moins Moyen)
        const passwordControl = this.authForm.get('password');
        if (score < 2 && passwordControl?.valid) {
            passwordControl.setErrors({ weakPassword: true });
        }
    }

    // Gestionnaire de sélection de documents
    onFileSelected(event: Event, controlName: 'identityFile' | 'medicalCardFile'): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            // Vérification de sécurité (taille maximale 5 Mo)
            if (file.size > 5 * 1024 * 1024) {
                this.authForm.get(controlName)?.setErrors({ maxSizeExceeded: true });
                return;
            }

            // Injection du fichier dans le contrôle réactif
            this.authForm.get(controlName)?.setValue(file);
            this.authForm.get(controlName)?.markAsTouched();
            this.authForm.get(controlName)?.updateValueAndValidity();

            // Mise à jour du signal pour affichage immédiat
            this.files.update(state => ({ ...state, [controlName]: file }));

            // Stockage dans le store pour le payload final
            this.store.setRegistrationFiles({
                identityDocType: this.authForm.get('identityDocType')?.value ?? '',
                identityFile: controlName === 'identityFile' ? file : this.files().identityFile,
                medicalCardFile: controlName === 'medicalCardFile' ? file : this.files().medicalCardFile,
            });
        }
    }

    removeFile(controlName: 'identityFile' | 'medicalCardFile', event: Event): void {
        event.stopPropagation(); // Évite le déclenchement du click sur la zone parente
        this.authForm.get(controlName)?.setValue(null);
        this.authForm.get(controlName)?.markAsTouched();
        this.authForm.get(controlName)?.updateValueAndValidity();

        this.files.update(state => ({ ...state, [controlName]: null }));

        this.store.setRegistrationFiles({
            identityDocType: this.authForm.get('identityDocType')?.value ?? '',
            identityFile: controlName === 'identityFile' ? null : this.files().identityFile,
            medicalCardFile: controlName === 'medicalCardFile' ? null : this.files().medicalCardFile,
        });
    }

    private passwordMismatchValidator(): ValidatorFn {
        return (group: AbstractControl): ValidationErrors | null => {
            const password = group.get('password');
            const confirmPassword = group.get('confirmPassword');

            if (!password || !confirmPassword) return null;

            if (password.value !== confirmPassword.value) {
                return { mismatch: true };
            }
            return null;
        };
    }

    isInvalid(field: string): boolean {
        const control = this.authForm.get(field);
        return !!(control?.invalid && (control.touched || this.store.submited()));
    }

    togglePassword(): void { this.showPassword.update((v) => !v); }
    toggleConfirmPassword(): void { this.showConfirmPassword.update((v) => !v); }
}