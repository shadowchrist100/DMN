import { Injectable } from '@angular/core';
import { TimelineEvent, TimelineFilter, EventType } from '../models/timeline-event.model';


@Injectable({
    providedIn: 'root',
})
export class TimelinesServices { 
    getMockTimeline(): TimelineEvent[] {
        return [
            {
                id: 'evt-001',
                type: 'consultation',
                title: 'Consultation Générale - Suivi HTA',
                description: 'Contrôle trimestriel de l\'hypertension artérielle',
                date: new Date('2024-01-15T14:30:00'),
                facility: 'Hôpital de Zone de Calavi',
                practitioner: { name: 'Dr. Sévérin Adjaho', role: 'Médecin Généraliste' },
                priority: 'medium',
                status: 'completed',
                vitals: [
                    { label: 'Tension', value: '120', unit: 'mmHg', normalRange: { min: 90, max: 140 } },
                    { label: 'Pouls', value: '72', unit: 'bpm', normalRange: { min: 60, max: 100 } },
                    { label: 'Poids', value: '78.5', unit: 'kg' }
                ],
                diagnosis: 'HTA contrôlée, poursuite du traitement',
                notes: 'Patient observant, pas d\'effets secondaires rapportés. Prochain RDV dans 3 mois.',
                createdAt: new Date('2024-01-15T14:30:00'),
                isEditable: false,
                consentRequired: true,
                icon: 'stethoscope',
                badge: { text: 'Complété', type: 'completed' },
                actionLabel: 'Voir le compte-rendu',
                actionType: 'view'
            },
            {
                id: 'evt-002',
                type: 'lab_result',
                title: 'Bilan Sanguin Complet',
                date: new Date('2024-01-10T08:15:00'),
                facility: 'Laboratoire BIO-BENIN',
                practitioner: { name: 'Dr. Amina Soumanou', role: 'Biologiste Médicale' },
                priority: 'high',
                status: 'completed',
                labResults: [
                    { name: 'Glycémie à jeun', value: 1.12, unit: 'g/L', normalMin: 0.70, normalMax: 1.10, isAbnormal: true },
                    { name: 'Créatinine', value: 8.2, unit: 'mg/L', normalMin: 6.0, normalMax: 11.0, isAbnormal: false },
                    { name: 'Cholestérol Total', value: 2.1, unit: 'g/L', normalMin: 1.5, normalMax: 2.0, isAbnormal: true }
                ],
                notes: 'Légère élévation de la glycémie et du cholestérol. Surveillance diététique recommandée.',
                attachments: [{ name: 'Rapport_complet.pdf', url: '/files/lab-2024-01-10.pdf', type: 'application/pdf' }],
                createdAt: new Date('2024-01-10T08:15:00'),
                isEditable: false,
                consentRequired: true,
                icon: 'biotech',
                badge: { text: '⚠️ 2 valeurs hors norme', type: 'alert' },
                actionLabel: 'Télécharger les résultats',
                actionType: 'download'
            },
            {
                id: 'evt-003',
                type: 'prescription',
                title: 'Renouvellement Ordonnance',
                date: new Date('2024-01-08T10:00:00'),
                facility: 'Pharmacie la Grâce',
                practitioner: { name: 'Dr. Sévérin Adjaho', role: 'Médecin Généraliste' },
                priority: 'medium',
                status: 'completed',
                medications: [
                    {
                        name: 'Amlodipine 5mg',
                        dosage: '5mg',
                        posology: '1 comprimé le matin',
                        duration: '3 mois',
                        startDate: new Date('2024-01-08'),
                        endDate: new Date('2024-04-08'),
                        status: 'active'
                    },
                    {
                        name: 'Paracétamol 1g',
                        dosage: '1g',
                        posology: 'Si douleur, max 3/jour',
                        duration: '5 jours',
                        startDate: new Date('2024-01-08'),
                        status: 'completed'
                    }
                ],
                createdAt: new Date('2024-01-08T10:00:00'),
                isEditable: false,
                consentRequired: true,
                icon: 'medication',
                badge: { text: '1 ordonnance active', type: 'completed' },
                actionLabel: 'Voir l\'ordonnance',
                actionType: 'view'
            },
            {
                id: 'evt-004',
                type: 'vaccination',
                title: 'Rappel Vaccinal Tétanos',
                date: new Date('2023-12-20T09:30:00'),
                facility: 'Centre de Santé Urbain Gbegamey',
                practitioner: { name: 'Infirmier K. Mensah', role: 'Infirmier Vaccinateur' },
                priority: 'low',
                status: 'completed',
                notes: 'Vaccin Tétanos lot #TN-2023-BJ-442. Prochain rappel: Décembre 2033.',
                createdAt: new Date('2023-12-20T09:30:00'),
                isEditable: false,
                consentRequired: false,
                icon: 'vaccines',
                badge: { text: 'À jour', type: 'completed' }
            },
            {
                id: 'evt-005',
                type: 'hospitalization',
                title: 'Hospitalisation Urgence - Appendicectomie',
                description: 'Admission pour douleur abdominale aiguë',
                date: new Date('2023-11-15T02:30:00'),
                facility: 'CNHU-HKM Cotonou',
                practitioner: { name: 'Dr. Fatou Bello', role: 'Chirurgien Viséral' },
                priority: 'critical',
                status: 'archived',
                diagnosis: 'Appendicite aiguë compliquée',
                notes: 'Intervention chirurgicale le 15/11 à 04:15. Sortie le 18/11. Suites opératoires simples.',
                createdAt: new Date('2023-11-15T02:30:00'),
                updatedAt: new Date('2023-11-18T10:00:00'),
                isEditable: false,
                consentRequired: true,
                icon: 'hospital',
                badge: { text: 'Archivé', type: 'archived' },
                actionLabel: 'Voir le dossier d\'hospitalisation',
                actionType: 'view'
            }
        ];
    }
}
