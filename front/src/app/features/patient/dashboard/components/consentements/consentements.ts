import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MedicalService, AuthorizationDTO, PendingAccessRequestDTO } from '../../../services/medical.service';
import { AuthStore } from '../../../../../core/auth/auth.store';
import { DashboardService } from '../../services/dashboard.service';

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
    horodatage: string;
    metaClass: string;
    meta: string;
}

@Component({
    selector: 'app-consentements',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './consentements.html',
})
export class Consentements implements OnInit {

    private medicalService = inject(MedicalService);
    private dashboardService = inject(DashboardService);

    searchQuery = signal('');
    selectedDuree = signal('24h');
    selectedPerimetre: string[] = [];
    loading = signal(true);
    refreshing = signal(false);
    authorizations = signal<AuthorizationDTO[]>([]);
    pendingRequests = signal<PendingAccessRequestDTO[]>([]);

    respondingId = signal<string | null>(null);
    respondSuccess = signal('');
    acceptFormRequest = signal<PendingAccessRequestDTO | null>(null);
    acceptPerimeter = signal('all');
    acceptDuration = signal('24h');

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

    readonly consentements = computed<Consentement[]>(() =>
        this.authorizations().map(a => ({
            id: a.id,
            praticien: a.practitioner_name || 'Praticien',
            specialite: a.practitioner_speciality || '—',
            etablissement: '—',
            initiales: (a.practitioner_name || 'XX').split(' ').map(s => s[0]).join('').slice(0, 2),
            perimetre: a.perimeter === 'all' ? 'Complet' : a.perimeter || 'Complet',
            validite: a.expire_at ? `Jusqu'au ${new Date(a.expire_at).toLocaleDateString('fr-FR')}` : 'Indéterminée',
            actif: a.is_actif,
        }))
    );

    readonly consentementsFiltres = computed(() => {
        const q = this.searchQuery().toLowerCase();
        return this.consentements().filter(c =>
            c.praticien.toLowerCase().includes(q) ||
            c.specialite.toLowerCase().includes(q) ||
            c.etablissement.toLowerCase().includes(q)
        );
    });

    readonly auditEntries = computed<AuditEntry[]>(() =>
        this.authorizations().map(a => ({
            icon: 'assignment_ind',
            action: `Accès accordé à ${a.practitioner_name || 'un praticien'}`,
            horodatage: a.granted_at ? new Date(a.granted_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
            metaClass: a.is_actif ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-100',
            meta: a.is_actif ? 'Actif' : 'Inactif',
        }))
    );

    ngOnInit(): void {
        this.loadData();
    }

    private loadData(): void {
        const userId = AuthStore.user()?.identity?.npi?.toString();
        if (!userId) {
            this.loading.set(false);
            return;
        }

        this.loading.set(true);
        this.medicalService.getAuthorizations(userId).subscribe({
            next: (data) => {
                this.authorizations.set(data);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });

        this.medicalService.getPendingAccessRequests(userId).subscribe({
            next: (data) => this.pendingRequests.set(data),
        });
    }

    togglePerimetre(value: string): void {
        if (this.selectedPerimetre.includes(value)) {
            this.selectedPerimetre = this.selectedPerimetre.filter(v => v !== value);
        } else {
            this.selectedPerimetre = [...this.selectedPerimetre, value];
        }
    }

    toggleConsentement(id: string): void {
        this.authorizations.update(list =>
            list.map(a => a.id === id ? { ...a, is_actif: !a.is_actif } : a)
        );
    }

    showAcceptForm(request: PendingAccessRequestDTO): void {
        this.acceptFormRequest.set(request);
        this.acceptPerimeter.set(request.perimeter || 'all');
        this.acceptDuration.set(request.duration || '24h');
    }

    cancelAcceptForm(): void {
        this.acceptFormRequest.set(null);
    }

    async confirmAccept(): Promise<void> {
        const request = this.acceptFormRequest();
        if (!request) return;

        this.respondingId.set(request.id);
        try {
            await firstValueFrom(this.dashboardService.respondToRequest(
                request.id, 'accept',
                this.acceptPerimeter(),
                this.acceptDuration(),
            ));
            this.respondSuccess.set('Accès accordé avec succès');
            this.pendingRequests.update(list => list.filter(r => r.id !== request.id));
            this.acceptFormRequest.set(null);
            const userId = AuthStore.user()?.identity?.npi?.toString();
            if (userId) {
                this.medicalService.getAuthorizations(userId).subscribe(data => this.authorizations.set(data));
            }
        } catch {
            this.respondSuccess.set('Erreur lors de l\'acceptation');
        } finally {
            this.respondingId.set(null);
            setTimeout(() => this.respondSuccess.set(''), 3000);
        }
    }

    async declineRequest(requestId: string): Promise<void> {
        this.respondingId.set(requestId);
        try {
            await firstValueFrom(this.dashboardService.respondToRequest(requestId, 'decline'));
            this.pendingRequests.update(list => list.filter(r => r.id !== requestId));
        } catch {
            // ignore
        } finally {
            this.respondingId.set(null);
        }
    }
}
