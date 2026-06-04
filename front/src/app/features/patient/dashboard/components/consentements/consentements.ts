import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface Consent {
    uuid: string;
    practitioner: string;
    specialty: string;
    institution: string;
    scopes: string[];
    validity: string;
    grantedAt: Date;
    expiresAt: Date | null;
    lastActivity: string;
    active: boolean;
    revokedAt?: Date;
    revokeReason?: string;
}

export interface AuditEntry {
    uuid: string;
    actor: string;
    action: string;
    target: string;
    timestamp: string;
    ip?: string;
    badge?: string;
    badgeClass?: string;
    type: 'read' | 'download' | 'revoke' | 'grant';
}

export interface ScopeOption {
    value: string;
    label: string;
    icon: string;
}

export interface ComplianceItem {
    label: string;
    ok: boolean;
}

export interface NewConsentForm {
    practitioner: string;
    duration: string;
    scopes: string[];
    note: string;
}

export interface Notification {
    type: 'success' | 'error' | 'warning';
    msg: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

@Component({
    selector: 'app-consentements',
    standalone: true,
    imports: [CommonModule, FormsModule, DatePipe],
    templateUrl: './consentements.html',
})
export class Consentements implements OnInit {

    // ── State signals ──────────────────────────────────────────────────
    loading = signal(true);
    formOpen = signal(true);
    revokeModal = signal<string | null>(null);
    notification = signal<Notification | null>(null);

    private _consents = signal<Consent[]>([]);
    private _auditLog = signal<AuditEntry[]>([]);

    revokeReason = '';

    // ── Derived signals ────────────────────────────────────────────────
    activeConsents = computed(() => this._consents().filter(c => c.active));
    revokedConsents = computed(() => this._consents().filter(c => !c.active));
    auditLog = computed(() => this._auditLog());

    activeCount = computed(() => this.activeConsents().length);
    revokedCount = computed(() => this.revokedConsents().length);
    expiringCount = computed(() => this.activeConsents().filter(c => this.isExpiringSoon(c)).length);
    securityScore = computed(() => this.activeCount() === 0 ? 100 : 98);

    // ── Form state ─────────────────────────────────────────────────────
    newConsent: NewConsentForm = {
        practitioner: '',
        duration: '24h',
        scopes: [],
        note: '',
    };

    // ── Static data ────────────────────────────────────────────────────
    readonly scopeOptions: ScopeOption[] = [
        { value: 'complet', label: 'Complet', icon: 'folder_open' },
        { value: 'consultations', label: 'Consultations', icon: 'medical_services' },
        { value: 'analyses', label: 'Analyses', icon: 'biotech' },
        { value: 'ordonnances', label: 'Ordonnances', icon: 'medication' },
        { value: 'imagerie', label: 'Imagerie', icon: 'radiology' },
    ];

    readonly complianceItems: ComplianceItem[] = [
        { label: 'Consentement explicite enregistré', ok: true },
        { label: 'Durée d\'accès définie', ok: true },
        { label: 'Périmètre limité aux données requises', ok: true },
        { label: 'Journal d\'audit complet', ok: true },
        { label: 'Révocation disponible à tout moment', ok: true },
        { label: 'Notification au patient', ok: false },
    ];

    // ── Lifecycle ──────────────────────────────────────────────────────
    ngOnInit(): void {
        setTimeout(() => {
            this._consents.set(this._mockConsents());
            this._auditLog.set(this._mockAuditLog());
            this.loading.set(false);
        }, 600);
    }

    // ── Form actions ───────────────────────────────────────────────────
    toggleForm(): void {
        this.formOpen.update(v => !v);
    }

    toggleScope(value: string): void {
        const current = [...this.newConsent.scopes];
        const idx = current.indexOf(value);
        if (idx === -1) {
            // Si "complet" est sélectionné, désélectionner le reste et vice-versa
            if (value === 'complet') {
                this.newConsent.scopes = ['complet'];
            } else {
                this.newConsent.scopes = current.filter(s => s !== 'complet').concat(value);
            }
        } else {
            this.newConsent.scopes = current.filter(s => s !== value);
        }
    }

    submitConsent(): void {
        if (!this.newConsent.practitioner || this.newConsent.scopes.length === 0) return;

        const expiresAt = this._computeExpiry(this.newConsent.duration);
        const newEntry: Consent = {
            uuid: crypto.randomUUID(),
            practitioner: this.newConsent.practitioner,
            specialty: 'Praticien',
            institution: 'Établissement',
            scopes: [...this.newConsent.scopes],
            validity: this._durationLabel(this.newConsent.duration),
            grantedAt: new Date(),
            expiresAt,
            lastActivity: 'À l\'instant',
            active: true,
        };

        this._consents.update(list => [newEntry, ...list]);

        // Ajouter au journal
        this._auditLog.update(log => [{
            uuid: crypto.randomUUID(),
            actor: 'Vous',
            action: 'avez accordé l\'accès à',
            target: this.newConsent.practitioner,
            timestamp: 'À l\'instant',
            badge: 'Nouveau consentement',
            badgeClass: 'bg-green-100 text-green-700',
            type: 'grant' as const,
        }, ...log]);

        // Reset
        this.newConsent = { practitioner: '', duration: '24h', scopes: [], note: '' };
        this.formOpen.set(false);
        this._showNotif('success', 'Consentement accordé avec succès.');
    }

    // ── Consent actions ────────────────────────────────────────────────
    toggleConsent(uuid: string): void {
        const consent = this._consents().find(c => c.uuid === uuid);
        if (!consent) return;
        if (consent.active) {
            this.revokeConsent(uuid);
        } else {
            this._consents.update(list =>
                list.map(c => c.uuid === uuid ? { ...c, active: true } : c)
            );
            this._showNotif('success', 'Accès réactivé.');
        }
    }

    revokeConsent(uuid: string): void {
        this.revokeReason = '';
        this.revokeModal.set(uuid);
    }

    cancelRevoke(): void {
        this.revokeModal.set(null);
        this.revokeReason = '';
    }

    confirmRevoke(): void {
        const uuid = this.revokeModal();
        if (!uuid) return;

        const consent = this._consents().find(c => c.uuid === uuid);

        this._consents.update(list =>
            list.map(c => c.uuid === uuid
                ? { ...c, active: false, revokedAt: new Date(), revokeReason: this.revokeReason || 'Action patient' }
                : c
            )
        );

        if (consent) {
            this._auditLog.update(log => [{
                uuid: crypto.randomUUID(),
                actor: 'Vous',
                action: 'avez révoqué l\'accès de',
                target: consent.practitioner,
                timestamp: 'À l\'instant',
                badge: 'Révocation',
                badgeClass: 'bg-red-100 text-red-700',
                type: 'revoke' as const,
            }, ...log]);
        }

        this.revokeModal.set(null);
        this.revokeReason = '';
        this._showNotif('warning', 'Accès révoqué. Le praticien n\'a plus accès à votre dossier.');
    }

    // ── Display helpers ────────────────────────────────────────────────
    toggleForm2(): void { this.toggleForm(); }

    isExpiringSoon(c: Consent): boolean {
        if (!c.expiresAt) return false;
        const hoursLeft = (c.expiresAt.getTime() - Date.now()) / 3_600_000;
        return hoursLeft < 48;
    }

    initials(name: string): string {
        return name
            .replace(/^Dr\.?\s*/i, '')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(n => n[0].toUpperCase())
            .join('');
    }

    scopeLabel(scopes: string[]): string {
        if (scopes.includes('complet')) return 'Accès complet';
        return scopes
            .map(s => this.scopeOptions.find(o => o.value === s)?.label ?? s)
            .join(', ');
    }

    scopeIcon(scope: string): string {
        return this.scopeOptions.find(o => o.value === scope)?.icon ?? 'article';
    }

    auditIcon(type: AuditEntry['type']): string {
        return { read: 'history_edu', download: 'download', revoke: 'block', grant: 'person_add' }[type];
    }

    auditIconBg(type: AuditEntry['type']): string {
        return {
            read: 'bg-blue-50',
            download: 'bg-indigo-50',
            revoke: 'bg-red-50',
            grant: 'bg-green-50',
        }[type];
    }

    auditIconColor(type: AuditEntry['type']): string {
        return {
            read: 'text-[#0059bb]',
            download: 'text-indigo-600',
            revoke: 'text-red-600',
            grant: 'text-green-600',
        }[type];
    }

    dismissNotif(): void {
        this.notification.set(null);
    }

    // ── Private helpers ────────────────────────────────────────────────
    private _showNotif(type: Notification['type'], msg: string): void {
        this.notification.set({ type, msg });
        setTimeout(() => this.notification.set(null), 4000);
    }

    private _computeExpiry(duration: string): Date | null {
        const now = new Date();
        switch (duration) {
            case '24h': return new Date(now.getTime() + 24 * 3_600_000);
            case '7d': return new Date(now.getTime() + 7 * 86_400_000);
            case '30d': return new Date(now.getTime() + 30 * 86_400_000);
            case 'indefinite': return null;
            default: return null;
        }
    }

    private _durationLabel(duration: string): string {
        return {
            '24h': '24 heures',
            '7d': '7 jours',
            '30d': '30 jours',
            'indefinite': 'Indéterminée',
        }[duration] ?? duration;
    }

    // ── Mock data ───────────────────────────────────────────────────────
    private _mockConsents(): Consent[] {
        return [
            {
                uuid: '1',
                practitioner: 'Dr. Koffi ADJAMOSSI',
                specialty: 'Cardiologue',
                institution: 'CNHU-HKM',
                scopes: ['complet'],
                validity: 'Jusqu\'au 12/05/2024',
                grantedAt: new Date('2024-04-12'),
                expiresAt: new Date(Date.now() + 72 * 3_600_000), // 72h
                lastActivity: 'Aujourd\'hui, 09:42',
                active: true,
            },
            {
                uuid: '2',
                practitioner: 'Dr. Marie SOGLO',
                specialty: 'Médecin Généraliste',
                institution: 'Clinique BIOS',
                scopes: ['analyses', 'ordonnances'],
                validity: '24h restant',
                grantedAt: new Date('2024-05-09'),
                expiresAt: new Date(Date.now() + 20 * 3_600_000), // 20h → expiring soon
                lastActivity: 'Hier, 16:15',
                active: true,
            },
            {
                uuid: '3',
                practitioner: 'Dr. Lionel CAPO-CHICHI',
                specialty: 'Pneumologue',
                institution: 'Polyclinique Les Cocotiers',
                scopes: ['consultations', 'imagerie'],
                validity: '30 jours',
                grantedAt: new Date('2024-04-01'),
                expiresAt: new Date('2024-05-01'),
                lastActivity: '01 Mai 2024',
                active: false,
                revokedAt: new Date('2024-05-01'),
                revokeReason: 'Fin de suivi',
            },
            {
                uuid: '4',
                practitioner: 'Clinique Saint-Jean',
                specialty: 'Établissement de santé',
                institution: 'Cotonou',
                scopes: ['complet'],
                validity: 'Indéterminée',
                grantedAt: new Date('2024-03-15'),
                expiresAt: null,
                lastActivity: '10 Mai 2024',
                active: false,
                revokedAt: new Date('2024-05-10'),
                revokeReason: 'Action patient',
            },
        ];
    }

    private _mockAuditLog(): AuditEntry[] {
        return [
            {
                uuid: 'a1',
                actor: 'Dr. Koffi ADJAMOSSI',
                action: 'a consulté',
                target: 'Dossier Cardiologie',
                timestamp: 'Aujourd\'hui, 09:42',
                ip: '197.234.xx.xx',
                type: 'read',
            },
            {
                uuid: 'a2',
                actor: 'Labo Central',
                action: 'a téléchargé',
                target: 'Analyses Sanguines',
                timestamp: 'Hier, 16:15',
                badge: 'Portail Santé',
                badgeClass: 'bg-slate-100 text-slate-500',
                type: 'download',
            },
            {
                uuid: 'a3',
                actor: 'Vous',
                action: 'avez révoqué l\'accès de',
                target: 'Clinique Saint-Jean',
                timestamp: '10 Mai 2024, 11:20',
                badge: 'Action patient',
                badgeClass: 'bg-red-100 text-red-700',
                type: 'revoke',
            },
            {
                uuid: 'a4',
                actor: 'Dr. Marie SOGLO',
                action: 'a consulté',
                target: 'Ordonnances 2024',
                timestamp: '09 Mai 2024, 14:30',
                ip: '41.248.xx.xx',
                type: 'read',
            },
        ];
    }
}