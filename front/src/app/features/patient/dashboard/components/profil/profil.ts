import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../../../core/auth/auth.store';
import { MedicalService } from '../../../services/medical.service';

@Component({
    selector: 'app-profil',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profil.html',
})
export class Profil implements OnInit {

    private medicalService = inject(MedicalService);

    authStore = AuthStore;
    medicalProfile = signal<{ blood_type: string | null; rhesus_factor: string | null } | null>(null);

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
            sexe: identity.gender === 'homme' ? 'Masculin' : identity.gender === 'femme' ? 'Féminin' : '—',
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

    get personnesLiees() {
        return [];
    }

    ngOnInit(): void {
        const userId = this.authStore.user()?.identity?.npi?.toString();
        if (userId) {
            this.medicalService.getProfile(userId).subscribe({
                next: (profile) => this.medicalProfile.set(profile),
            });
        }
    }
}
