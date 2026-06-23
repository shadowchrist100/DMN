import { Component, OnInit, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../../../../core/auth/auth.store';
import { AuthService } from '../../../../../core/auth/auth-service';
import { MedicalService, PatientProfileUpdateReq } from '../../../services/medical.service';
import { Iuser } from '../../../../../core/models/user.model';
import { Gender, MaritalStatus } from '../../../../../core/types/user.types';

@Component({
    selector: 'app-profil-edit',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profil-edit.html',
})
export class ProfilEdit implements OnInit {

    private medicalService = inject(MedicalService);
    private authService = inject(AuthService);

    saved = output<void>();
    cancelled = output<void>();

    saving = signal(false);
    loading = signal(true);
    error = signal<string | null>(null);
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
                    this.loading.set(false);
                },
                error: () => {
                    this.error.set('Erreur lors du chargement du profil.');
                    this.loading.set(false);
                },
            });
        }
    }

    async onSave(): Promise<void> {
        const userId = AuthStore.userId();
        if (!userId) return;

        this.saving.set(true);
        try {
            const [adresse, ville] = this.formData.adresse.includes(',')
                ? this.formData.adresse.split(',').map(s => s.trim())
                : [this.formData.adresse, ''];

            await this.authService.updateProfile({
                first_name: this.formData.prenoms,
                last_name: this.formData.nom,
                gender: this.formData.sexe === 'M' ? 'homme' : this.formData.sexe === 'F' ? 'femme' : undefined,
                birth_date: this.formData.dateNaissance || undefined,
                matrimonial_status: this.formData.civil || undefined,
                address: adresse,
                city: ville,
            });

            const identityUpdates: Partial<Iuser['identity']> = {
                lastName: this.formData.nom,
                firstName: this.formData.prenoms,
                gender: (this.formData.sexe === 'M' ? 'male' : this.formData.sexe === 'F' ? 'female' : 'male') as Gender,
                address: adresse,
                city: ville,
            };
            if (this.formData.civil) {
                identityUpdates.maritalStatus = this.formData.civil as MaritalStatus;
            }
            AuthStore.updateUser(identityUpdates);

            const medicalPayload: PatientProfileUpdateReq = {};
            if (this.formData.blood_type) medicalPayload.blood_type = this.formData.blood_type;
            if (this.formData.rhesus_factor) medicalPayload.rhesus_factor = this.formData.rhesus_factor;

            if (Object.keys(medicalPayload).length > 0) {
                await firstValueFrom(this.medicalService.updatePatientProfile(userId, medicalPayload));
            }

            this.saved.emit();
        } catch (e) {
            this.error.set('Erreur lors de la sauvegarde. Veuillez réessayer.');
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.cancelled.emit();
    }
}
