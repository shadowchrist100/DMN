import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ObservationClinique {
    label: string;
    valeur: string;
    unite: string;
    statut: 'normal' | 'hors_norme';
}

export interface Diagnostic {
    code: string;
    libelle: string;
    statut: string;
    severite: string;
}

@Component({
    selector: 'app-acte-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './acte-view.html',
})
export class ActeView {

    visite = {
        id: '#VIS-2023-98421',
        titre: 'Consultation de Cardiologie',
        date: '14 Septembre 2023',
        etablissement: 'CNHU-HKM, Cotonou',
        medecin: 'Dr. Kouandété Koffi',
        specialite: 'Cardiologue Spécialiste',
        motif: 'Douleurs thoraciques atypiques et essoufflement à l\'effort depuis 2 semaines.',
    };

    observations: ObservationClinique[] = [
        { label: 'Tension Artérielle', valeur: '145/92', unite: 'mmHg', statut: 'hors_norme' },
        { label: 'Fréquence Cardiaque', valeur: '88', unite: 'BPM', statut: 'normal' },
        { label: 'Saturation O2', valeur: '98', unite: '%', statut: 'normal' },
    ];

    diagnostics: Diagnostic[] = [
        { code: 'I10', libelle: 'Hypertension artérielle essentielle', statut: 'Confirmé', severite: 'Modérée' },
        { code: 'E78.0', libelle: 'Hypercholestérolémie pure', statut: 'En cours de traitement', severite: 'Légère' },
    ];

    prescriptions = [
        { nom: 'AMLODIPINE 5mg', posologie: '1 comprimé chaque matin', duree: '3 mois' },
        { nom: 'ASPEGIC 100mg', posologie: '1 sachet au milieu du déjeuner', duree: '1 mois' },
    ];

    rapports = [
        { nom: 'ECG de repos', date: '14/09/2023', icon: 'ecg' },
        { nom: 'Radio Thorax (Face)', date: '14/09/2023', icon: 'radiology' },
    ];
}
