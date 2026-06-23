import { Component, OnInit, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../../../core/auth/auth.store';
import { MedicalService, RelativeDTO } from '../../../services/medical.service';

@Component({
    selector: 'app-profil',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profil.html',
})
export class Profil implements OnInit {

    private medicalService = inject(MedicalService);

    editProfil = output<void>();
    addContact = output<void>();
    editContact = output<string>();

    authStore = AuthStore;
    medicalProfile = signal<{ blood_type: string | null; rhesus_factor: string | null } | null>(null);
    personnesLiees = signal<RelativeDTO[]>([]);
    loadingProfile = signal(true);
    loadingRelatives = signal(true);
    errorProfile = signal<string | null>(null);
    errorRelatives = signal<string | null>(null);

    get patient() {
        const identity = this.authStore.user()?.identity;
        if (!identity) return null;

        let age = 0;
        if (identity.birthDate) {
            age = Math.floor((Date.now() - new Date(identity.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        }

        return {
            nom: identity.lastName?.toUpperCase() || '—',
            prenoms: identity.firstName || '—',
            dateNaissance: identity.birthDate
                ? new Date(identity.birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—',
            age,
            sexe: identity.gender === 'male' ? 'Masculin' : identity.gender === 'female' ? 'Féminin' : '—',
            civil: identity.maritalStatus || '—',
            naissanceMultiple: identity.multipleBirth ? identity.multipleBirth > 1 : false,
            adresse: [identity.address, identity.city].filter(Boolean).join(', ') || '—',
            nin: identity.npi?.toString() || '—',
            photo: identity.photoPath || 'https://i.pravatar.cc/160?img=32',
        };
    }

    get contacts() {
        const user = this.authStore.user();
        if (!user) return [];
        return [
            { type: 'Téléphone', valeur: user.identity?.phone || '—', priorite: 1, etiquette: 'Personnel', valide: true },
            { type: 'Email', valeur: user.auth?.email || '—', priorite: 2, etiquette: 'Principal', valide: false },
            { type: 'Adresse', valeur: [user.identity?.address, user.identity?.city].filter(Boolean).join(', ') || '—', priorite: 3, etiquette: 'Domicile', valide: true },
        ];
    }

    ngOnInit(): void {
        const userId = AuthStore.userId();
        if (userId) {
            this.medicalService.getProfile(userId).subscribe({
                next: (profile) => {
                    this.medicalProfile.set(profile);
                    this.loadingProfile.set(false);
                },
                error: () => {
                    this.errorProfile.set('Erreur lors du chargement du profil médical.');
                    this.loadingProfile.set(false);
                },
            });

            this.medicalService.getRelatives(userId).subscribe({
                next: (relatives) => {
                    this.personnesLiees.set(relatives);
                    this.loadingRelatives.set(false);
                },
                error: () => {
                    this.errorRelatives.set('Erreur lors du chargement des personnes liées.');
                    this.loadingRelatives.set(false);
                },
            });
        }
    }
}
