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
    serverError = signal<string>('');

    // Signals
    photoPreview = signal<string | null>(null);
    photoFile = signal<File | null>(null);
    photoError = signal<string | null>(null);
    fb = inject(FormBuilder);

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.identityForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', [Validators.required]],
            gender: ['', [Validators.required]],
            birthDate: ['', [Validators.required, this.pastDateValidator()]],
            npi: ['', [Validators.required]],
            photoPath: ['', [Validators.required]],
            matrimonialStatus: ['', [Validators.required]],
            phone: ['', [Validators.required]],
            speciality: ['', [this.setSpecilityRequired()]]
        }, { updateOn: 'blur' });

        this.identityForm.valueChanges.subscribe(() => {
            this.store.setContinueSteps(this.identityForm.valid)
        })

    }

    private setSpecilityRequired() {
        return (control: AbstractControl) => {
            if (this.store.userType() === "PRACTITIONER") {
                control.setValidators(Validators.required);
            }

        }
    }

    private pastDateValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;
            return (new Date() < new Date(control.value) ? { invalidDate: true } : null);
        }
    }

    isInvalid(field: string) {
        const control = this.identityForm.get(field);
        return !!(control?.invalid && control.touched)
    }

    onErrorClose() {

    }

    onSubmited() {
        if (this.store.submited()) {
            if (this.identityForm.invalid) {
                this.identityForm.markAllAsTouched();
                this.store.setContinueSteps(false);
            } else {
                this.store.setContinueSteps(true);
            }
        }
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

        this.photoFile.set(file);

        // Génération de l'aperçu
        const reader = new FileReader();
        reader.onload = (e) => this.photoPreview.set(e.target?.result as string);
        reader.readAsDataURL(file);
    }

    removePhoto(): void {
        this.photoPreview.set(null);
        this.photoFile.set(null);
        this.photoError.set(null);
    }

}
