import { Component, inject, OnInit, signal, computed } from '@angular/core';
import {
    AbstractControl, FormBuilder, FormGroup,
    ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators
} from '@angular/forms';
import { PASSWORD_REGEX } from '../../../../core/constants/PASSWORD_REGEX';
import { RegisterStore } from '../register.store';

// ── Critères de force du mot de passe ──────────────────────────────
interface PasswordCriterion {
    label: string;
    hint: string;
    test: (value: string) => boolean;
}

const PASSWORD_CRITERIA: PasswordCriterion[] = [
    {
        label: '8 caractères minimum',
        hint: "Plus c'est long, mieux c'est.",
        test: (v) => v.length >= 8,
    },
    {
        label: 'Lettre majuscule',
        hint: 'Au moins un (A-Z).',
        test: (v) => /[A-Z]/.test(v),
    },
    {
        label: 'Chiffre & Symbole',
        hint: '0-9 et @#$!%...',
        test: (v) => /[0-9]/.test(v) && /[@#$!%*?&^()_\-+=]/.test(v),
    },
];

// ── Labels et couleurs selon la force ──────────────────────────────
const STRENGTH_CONFIG = [
    { label: 'Trop faible', color: 'text-error', bars: 1 },
    { label: 'Faible', color: 'text-error', bars: 1 },
    { label: 'Moyen', color: 'text-warning', bars: 2 },
    { label: 'Fort', color: 'text-success', bars: 3 },
    { label: 'Très fort', color: 'text-success', bars: 4 },
] as const;

const BAR_COLORS = [
    '',                                          // 0 — vide
    'bg-error',                                  // 1 — très faible
    'bg-warning',                                // 2 — moyen
    'bg-success',                                // 3 — fort
    'bg-success',                                // 4 — très fort
];

@Component({
    selector: 'app-step-auth',
    imports: [ReactiveFormsModule],
    templateUrl: './step-auth.html',
    styleUrl: './step-auth.css',
})
export class StepAuth implements OnInit {
    private fb = inject(FormBuilder);
    store = RegisterStore;

    authForm!: FormGroup;

    // Visibilité des champs
    showPassword = signal(false);
    showConfirmPassword = signal(false);

    // Force du mot de passe (0-4)
    passwordStrength = signal(0);

    // Critères exposés au template
    readonly criteria = PASSWORD_CRITERIA;

    // Tableau de booléens : quel critère est satisfait ?
    criteriaStatus = signal<boolean[]>([false, false, false]);

    // Config strength courante
    strengthConfig = computed(() => STRENGTH_CONFIG[this.passwordStrength()]);

    // Couleur de chaque barre (4 barres)
    strengthBars = computed(() => {
        const filled = this.passwordStrength();
        return Array.from({ length: 4 }, (_, i) =>
            i < filled ? BAR_COLORS[filled] : 'bg-surface-container'
        );
    });

    ngOnInit(): void {
        this.store.setContinueSteps(false);

        this.authForm = this.fb.group(
            {
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
                confirmPassword: ['', [Validators.required]],
            },
            { updateOn: 'blur', validators: this.passwordMismatchValidator() }
        );

        // Suivi de la force en temps réel (pas updateOn: blur)
        this.authForm.get('password')!.valueChanges.subscribe((value: string) => {
            this.updateStrength(value ?? '');
        });

        this.authForm.valueChanges.subscribe(() => {
            this.store.setContinueSteps(this.authForm.valid);
        });

        if (this.store.submited()) {
            if (this.authForm.invalid) {
                this.authForm.markAllAsTouched();
                this.store.setContinueSteps(false);
            } else {
                this.store.setContinueSteps(true);
            }
        }
    }

    // ── Force du mot de passe ────────────────────────────────────────
    private updateStrength(value: string): void {
        const statuses = PASSWORD_CRITERIA.map((c) => c.test(value));
        this.criteriaStatus.set(statuses);

        if (!value) {
            this.passwordStrength.set(0);
            return;
        }

        const passed = statuses.filter(Boolean).length; // 0-3

        // Bonus si tous les critères + longueur >= 12
        const score = passed === 3 && value.length >= 12 ? 4 : passed;
        this.passwordStrength.set(score);
    }

    // ── Validateur mismatch ──────────────────────────────────────────
    private passwordMismatchValidator(): ValidatorFn {
        return (group: AbstractControl): ValidationErrors | null => {
            const password = group.get('password');
            const confirmPassword = group.get('confirmPassword');

            if (!password || !confirmPassword) return null;

            if (password.value !== confirmPassword.value) {
                confirmPassword.setErrors({ ...confirmPassword.errors, mismatch: true });
                return { mismatch: true };
            } else {
                if (confirmPassword.hasError('mismatch')) {
                    const { mismatch, ...remaining } = confirmPassword.errors ?? {};
                    confirmPassword.setErrors(Object.keys(remaining).length ? remaining : null);
                }
            }

            return null;
        };
    }

    // ── Helpers template ─────────────────────────────────────────────
    isInvalid(field: string): boolean {
        const control = this.authForm.get(field);
        return !!(control?.invalid && control.touched);
    }

    togglePassword(): void {
        this.showPassword.update((v) => !v);
    }

    toggleConfirmPassword(): void {
        this.showConfirmPassword.update((v) => !v);
    }
}