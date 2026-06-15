import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Consentement {
    id: string;
    praticien: string;
    specialite: string;
    etablissement: string;
    initiales: string;
    perimetre: string;
    validite: string;
    actif: boolean;
}

export interface AuditEntry {
    icon: string;
    action: string;
    detail: string;
    horodatage: string;
    meta: string;
    metaClass: string;
}

@Component({
    selector: 'app-consentements',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './consentements.html',
})
export class Consentements {

    searchQuery = signal('');
    selectedDuree = signal('24h');
    selectedPerimetre: string[] = [];

    readonly perimetreOptions = [
        { value: 'complet', label: 'Complet' },
        { value: 'consultations', label: 'Consultations' },
        { value: 'analyses', label: 'Analyses' },
        { value: 'ordonnances', label: 'Ordonnances' },
        { value: 'imagerie', label: 'Imagerie' },
    ];

    readonly dureeOptions = [
        { value: '24h', label: '24 Heures (Consultation ponctuelle)' },
        { value: '7j', label: '7 Jours' },
        { value: '30j', label: '30 Jours' },
        { value: 'indeterminee', label: 'Indéterminée (Révocable à tout moment)' },
    ];

    readonly consentements: Consentement[] = [
        { id: 'c1', praticien: 'Dr. Koffi ADJAMOSSI', specialite: 'Cardiologue', etablissement: 'CNHU-HKM', initiales: 'KA', perimetre: 'Complet', validite: 'Jusqu\'au 12/05/24', actif: true },
        { id: 'c2', praticien: 'Dr. Marie SOGLO', specialite: 'Médecin Généraliste', etablissement: 'Clinique BIOS', initiales: 'MS', perimetre: 'Analyses uniquement', validite: '24h restant', actif: true },
        { id: 'c3', praticien: 'Dr. Gaston DOSSOU', specialite: 'Hématologue', etablissement: 'CNHU-HKM', initiales: 'GD', perimetre: 'Complet', validite: 'Expiré', actif: false },
    ];

    readonly auditEntries: AuditEntry[] = [
        { icon: 'history_edu', action: 'Dr. Koffi ADJAMOSSI a consulté Dossier Cardiologie', detail: '', horodatage: "Aujourd'hui, 09:42", meta: 'IP: 197.234.xx.xx', metaClass: 'bg-slate-100 text-slate-500' },
        { icon: 'biotech', action: 'Labo Central a téléchargé Analyses Sanguines', detail: '', horodatage: 'Hier, 16:15', meta: 'Portail Santé', metaClass: 'bg-slate-100 text-slate-500' },
        { icon: 'block', action: 'Accès révoqué pour Clinique Saint-Jean', detail: '', horodatage: '10 Mai 2024, 11:20', meta: 'ACTION PATIENT', metaClass: 'bg-red-50 text-red-600' },
    ];

    readonly consentementsFiltres = computed(() => {
        const q = this.searchQuery().toLowerCase();
        return this.consentements.filter(c =>
            c.praticien.toLowerCase().includes(q) ||
            c.specialite.toLowerCase().includes(q) ||
            c.etablissement.toLowerCase().includes(q)
        );
    });

    togglePerimetre(value: string): void {
        if (this.selectedPerimetre.includes(value)) {
            this.selectedPerimetre = this.selectedPerimetre.filter(v => v !== value);
        } else {
            this.selectedPerimetre = [...this.selectedPerimetre, value];
        }
    }

    toggleConsentement(id: string): void {
        const c = this.consentements.find(c => c.id === id);
        if (c) c.actif = !c.actif;
    }
}
