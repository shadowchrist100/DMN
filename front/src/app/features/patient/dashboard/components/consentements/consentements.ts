import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MedicalService, AuthorizationDTO, PendingAccessRequestDTO, PractitionerSearchResult } from '../../../services/medical.service';
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
    dashboardService = inject(DashboardService);

    searchQuery = signal('');
    selectedDuree = signal('24h');
    selectedPerimetre: string[] = [];
    loading = signal(true);
    errorMessage = signal<string | null>(null);
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

    // ── New consent form ──
    showCreateForm = signal(false);
    searchPractitionerQuery = signal('');
    practitionerResults = signal<PractitionerSearchResult[]>([]);
    selectedPractitioner = signal<PractitionerSearchResult | null>(null);
    createPerimeter = signal('all');
    createDuration = signal('24h');
    creating = signal(false);

    // ── Renewal ──
    renewId = signal<string | null>(null);
    renewDuration = signal('24h');
    renewing = signal(false);

    private searchSubject = new Subject<string>();

    ngOnInit(): void {
        this.loadData();
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(q => {
                const uid = AuthStore.userId();
                if (!q.trim() || !uid) return of([]);
                return this.dashboardService.searchPractitioners(uid, q);
            }),
        ).subscribe(results => this.practitionerResults.set(results));
    }

    onSearchPractitioner(q: string): void {
        this.searchPractitionerQuery.set(q);
        this.searchSubject.next(q);
    }

    selectPractitioner(p: PractitionerSearchResult): void {
        this.selectedPractitioner.set(p);
        this.searchPractitionerQuery.set(`${p.first_name} ${p.last_name}`);
        this.practitionerResults.set([]);
    }

    startCreateConsent(): void {
        this.showCreateForm.set(true);
        this.selectedPractitioner.set(null);
        this.searchPractitionerQuery.set('');
        this.createPerimeter.set('all');
        this.createDuration.set('24h');
    }

    cancelCreateConsent(): void {
        this.showCreateForm.set(false);
    }

    async confirmCreateConsent(): Promise<void> {
        const practitioner = this.selectedPractitioner();
        if (!practitioner) return;
        const uid = AuthStore.userId();
        if (!uid) return;

        this.creating.set(true);
        try {
            await firstValueFrom(this.dashboardService.createAuthorization(uid, {
                practitioner_user_id: practitioner.user_id,
                duration: this.createDuration(),
                perimeter: this.createPerimeter(),
            }));
            this.showCreateForm.set(false);
            this.medicalService.getAuthorizations(uid).subscribe(data => this.authorizations.set(data));
        } catch {
            this.errorMessage.set('Erreur lors de la création du consentement.');
        } finally {
            this.creating.set(false);
        }
    }

    startRenew(auth: AuthorizationDTO): void {
        this.renewId.set(auth.id);
        this.renewDuration.set(auth.duration || '24h');
    }

    cancelRenew(): void {
        this.renewId.set(null);
    }

    async confirmRenew(): Promise<void> {
        const id = this.renewId();
        if (!id) return;
        this.renewing.set(true);
        try {
            await firstValueFrom(this.dashboardService.renewAuthorization(id, {
                action: 'accept',
                duration: this.renewDuration(),
            }));
            this.renewId.set(null);
            const uid = AuthStore.userId();
            if (uid) {
                this.medicalService.getAuthorizations(uid).subscribe(data => this.authorizations.set(data));
            }
        } catch {
            this.errorMessage.set('Erreur lors du renouvellement.');
        } finally {
            this.renewing.set(false);
        }
    }

    isExpired(auth: AuthorizationDTO): boolean {
        if (!auth.expire_at) return false;
        return new Date(auth.expire_at) < new Date();
    }

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

    private loadData(): void {
        const userId = AuthStore.userId();
        if (!userId) {
            this.loading.set(false);
            return;
        }

        this.loading.set(true);
        this.errorMessage.set(null);
        this.medicalService.getAuthorizations(userId).subscribe({
            next: (data) => {
                this.authorizations.set(data);
                this.loading.set(false);
            },
            error: () => { this.errorMessage.set('Impossible de charger les consentements.'); this.loading.set(false); },
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

    async revokeConsentement(id: string): Promise<void> {
        const auth = this.authorizations().find(a => a.id === id);
        if (!auth) return;
        const confirmed = confirm(
            `Révoquer l'accès de ${auth.practitioner_name || 'ce praticien'} ?`
        );
        if (!confirmed) return;

        this.respondingId.set(id);
        try {
            await firstValueFrom(this.dashboardService.revokeAuthorization(id));
            this.authorizations.update(list => list.filter(a => a.id !== id));
        } catch {
            this.errorMessage.set('Erreur lors de la révocation de l\'accès.');
        } finally {
            this.respondingId.set(null);
        }
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
            const userId = AuthStore.userId();
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
            this.errorMessage.set('Erreur lors du refus de la demande.');
        } finally {
            this.respondingId.set(null);
        }
    }
}
