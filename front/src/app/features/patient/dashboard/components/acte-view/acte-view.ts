import { Component, OnInit, inject, signal, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalService, ConsultationDTO } from '../../../services/medical.service';
import { AuthStore } from '../../../../../core/auth/auth.store';

@Component({
    selector: 'app-acte-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './acte-view.html',
})
export class ActeView implements OnInit {
    private medical = inject(MedicalService);
    private authStore = AuthStore;

    @Input() actId: string = '';

    loading = signal(true);
    errorMessage = signal<string | null>(null);
    consultations = signal<ConsultationDTO[]>([]);

    get userId(): string | null {
        return AuthStore.userId();
    }

    ngOnInit(): void {
        const uid = this.userId;
        if (!uid) { this.loading.set(false); return; }
        this.loading.set(true);
        this.errorMessage.set(null);
        this.medical.getMedicalActs(uid).subscribe({
            next: (data) => { this.consultations.set(data); this.loading.set(false); },
            error: () => { this.errorMessage.set('Impossible de charger les actes médicaux.'); this.loading.set(false); },
        });
    }

    private selectedAct = computed(() => {
        const acts = this.consultations();
        if (this.actId) {
            return acts.find(a => a.id === this.actId) || null;
        }
        return acts[0] || null;
    });

    get visite() {
        const c = this.selectedAct();
        if (!c) return null;
        const typeLabels: Record<string, string> = {
            'Consultation': 'Consultation',
            'Examen': 'Examen',
            'VACCINATION': 'Vaccination',
        };
        const typeLabel = typeLabels[c.type_acte] || 'Acte médical';
        return {
            id: `#${c.id.slice(0, 8)}`,
            titre: c.motif || typeLabel,
            typeLabel,
            date: c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—',
            etablissement: c.healthcare_nom || '—',
            medecin: c.practitioner_name || '—',
            specialite: c.practitioner_speciality || '—',
            motif: c.motif || '—',
        };
    }

    get observations() {
        const c = this.selectedAct();
        if (!c) return [];
        return [
            { label: 'Observations', valeur: c.observations_text || '—', unite: '', statut: 'normal' },
            { label: 'Rapport', valeur: c.rapport_text || '—', unite: '', statut: 'normal' },
        ];
    }

    get diagnostics() {
        return this.selectedAct()?.diagnoses || [];
    }

    get medications() {
        return this.selectedAct()?.medications || [];
    }

    get examPrescriptions() {
        return this.selectedAct()?.exam_prescriptions || [];
    }

    get vaccinePrescriptions() {
        return this.selectedAct()?.vaccine_prescriptions || [];
    }

    get careInstructions() {
        return this.selectedAct()?.care_instructions || [];
    }

    get notesCliniques(): string {
        return this.selectedAct()?.observations_text || '';
    }

    get recommandation(): string {
        return this.selectedAct()?.raisons || '';
    }

    get derniereMaj(): string {
        const c = this.selectedAct();
        if (!c || !c.rapport_text) return '—';
        return '—';
    }
}
