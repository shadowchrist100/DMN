import { Component, OnInit, inject, signal } from '@angular/core';
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

    loading = signal(true);
    consultations = signal<ConsultationDTO[]>([]);

    get userId(): string | null {
        return AuthStore.userId();
    }

    ngOnInit(): void {
        const uid = this.userId;
        if (!uid) { this.loading.set(false); return; }
        this.medical.getConsultations(uid).subscribe({
            next: (data) => { this.consultations.set(data); this.loading.set(false); },
            error: () => { this.loading.set(false); },
        });
    }

    get visite() {
        const c = this.consultations()[0];
        if (!c) return null;
        return {
            id: `#${c.id.slice(0, 8)}`,
            titre: c.motif || 'Consultation',
            date: c.rapport_text ? new Date(c.rapport_text).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—',
            etablissement: c.healthcare_nom || '—',
            medecin: c.practitioner_name || '—',
            specialite: c.practitioner_speciality || '—',
            motif: c.motif || '—',
        };
    }

    get observations() {
        const c = this.consultations()[0];
        if (!c) return [];
        return [
            { label: 'Observations', valeur: c.observations_text || '—', unite: '', statut: 'normal' },
            { label: 'Rapport', valeur: c.rapport_text || '—', unite: '', statut: 'normal' },
        ];
    }

    get notesCliniques(): string {
        return this.consultations()[0]?.observations_text || '';
    }

    get recommandation(): string {
        return '';
    }

    get derniereMaj(): string {
        const c = this.consultations()[0];
        if (!c || !c.rapport_text) return '—';
        const d = new Date(c.rapport_text);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    get diagnostics() {
        return [] as { code: string; libelle: string; statut: string; severite: string }[];
    }

    get prescriptions() {
        return [] as { nom: string; posologie: string; duree: string }[];
    }

    get rapports() {
        return [] as { nom: string; date: string; icon: string }[];
    }
}
