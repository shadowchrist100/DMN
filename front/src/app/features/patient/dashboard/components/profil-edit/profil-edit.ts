import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../../../../core/auth/auth.store';
import { MedicalService, PatientProfileUpdateReq } from '../../../services/medical.service';

@Component({
    selector: 'app-profil-edit',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profil-edit.html',
})
export class ProfilEdit implements OnInit {

    private medicalService = inject(MedicalService);

    saving = signal(false);
    derniereMaj = signal('—');
    currentYear = new Date().getFullYear();

    formData = {
        nom: '',
        prenoms: '',
        dateNaissance: '',
        sexe: '',
        civil: '',
        naissanceMultiple: false,
        adresse: '',
        blood_type: '',
        rhesus_factor: '',
    };

    npi = '';

    ngOnInit(): void {
        const identity = AuthStore.user()?.identity;
        if (identity) {
            this.formData.nom = identity.lastName || '';
            this.formData.prenoms = identity.firstName || '';
            this.formData.dateNaissance = identity.birthDate
                ? new Date(identity.birthDate).toISOString().split('T')[0]
                : '';
            this.formData.sexe = identity.gender === 'male' ? 'M' : identity.gender === 'female' ? 'F' : '';
            this.formData.civil = identity.maritalStatus || '';
            this.formData.adresse = [identity.address, identity.city].filter(Boolean).join(', ');
            this.npi = identity.npi?.toString() || '';
        }

        const userId = AuthStore.userId();
        if (userId) {
            this.medicalService.getProfile(userId).subscribe({
                next: (profile) => {
                    this.formData.blood_type = profile.blood_type || '';
                    this.formData.rhesus_factor = profile.rhesus_factor || '';
                    if (profile.date_creation) {
                        this.derniereMaj.set(new Date(profile.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));
                    }
                },
            });
        }
    }

    onSave(): void {
        const userId = AuthStore.userId();
        if (!userId) return;

        this.saving.set(true);
        const payload: PatientProfileUpdateReq = {};
        if (this.formData.blood_type) payload.blood_type = this.formData.blood_type;
        if (this.formData.rhesus_factor) payload.rhesus_factor = this.formData.rhesus_factor;

        this.medicalService.updatePatientProfile(userId, payload).subscribe({
            next: () => this.saving.set(false),
            error: () => this.saving.set(false),
        });
    }
}
