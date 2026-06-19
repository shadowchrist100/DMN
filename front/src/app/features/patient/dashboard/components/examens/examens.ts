import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, Examen, TypeExamen, StatutExamen, StatutValeur } from '../../services/dashboard.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statutValeur(ex: Examen): StatutValeur {
    if (!ex.valeur_min_normal || !ex.valeur_max_normal) return 'na';
    const val = parseFloat(ex.valeur);
    if (isNaN(val)) return 'na';
    const range = ex.valeur_max_normal - ex.valeur_min_normal;
    if (val > ex.valeur_max_normal * 1.1) return 'critique';
    if (val > ex.valeur_max_normal) return 'eleve';
    if (val < ex.valeur_min_normal * 0.9) return 'critique';
    if (val < ex.valeur_min_normal) return 'bas';
    if (val > ex.valeur_max_normal - range * 0.1) return 'limite';
    return 'normal';
}

function barPercent(ex: Examen): number {
    if (!ex.valeur_min_normal || !ex.valeur_max_normal) return 0;
    const val = parseFloat(ex.valeur);
    if (isNaN(val)) return 0;
    const min = ex.valeur_min_normal * 0.7;
    const max = ex.valeur_max_normal * 1.3;
    return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
}

const TYPE_CONFIG: Record<TypeExamen, { icon: string; bg: string; text: string; border: string }> = {
    'Biologie': { icon: 'biotech', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Imagerie': { icon: 'radiology', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    'Radiologie': { icon: 'radiology', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    'Échographie': { icon: 'monitor_heart', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    'Cardiologie': { icon: 'ecg_heart', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Autre': { icon: 'science', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const STATUT_VALEUR_CONFIG: Record<StatutValeur, { badge: string; dot: string; label: string; bar: string }> = {
    normal: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Normal', bar: 'bg-emerald-500' },
    limite: { badge: 'bg-amber-100  text-amber-700', dot: 'bg-amber-500', label: 'Limite', bar: 'bg-amber-500' },
    eleve: { badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', label: 'Élevé', bar: 'bg-orange-500' },
    bas: { badge: 'bg-blue-100   text-blue-700', dot: 'bg-blue-500', label: 'Bas', bar: 'bg-blue-500' },
    critique: { badge: 'bg-red-100    text-red-700', dot: 'bg-red-600', label: 'Critique', bar: 'bg-red-600' },
    na: { badge: 'bg-slate-100  text-slate-500', dot: 'bg-slate-400', label: 'N/A', bar: 'bg-slate-300' },
};

@Component({
    selector: 'app-examens',
    standalone: true,
    imports: [CommonModule, FormsModule, DecimalPipe, DatePipe],
    templateUrl: './examens.html',
    styleUrls: ['./examens.css'],
})
export class Examens implements OnInit {
    private dashboardService = inject(DashboardService);

    // ── State ─────────────────────────────────────────────────────────────────
    loading = signal(true);
    examens = signal<Examen[]>([]);
    searchQuery = signal('');
    selectedType = signal<TypeExamen | 'Tous'>('Tous');
    selectedStatut = signal<StatutExamen | 'Tous'>('Tous');
    viewMode = signal<'table' | 'cards'>('table');
    selectedExamen = signal<Examen | null>(null);
    showModal = signal(false);
    showImageModal = signal(false);
    activeImagePath = signal<string | null>(null);

    // ── Config ────────────────────────────────────────────────────────────────
    readonly types: (TypeExamen | 'Tous')[] = ['Tous', 'Biologie', 'Imagerie', 'Radiologie', 'Échographie', 'Cardiologie', 'Autre'];
    readonly statuts: (StatutExamen | 'Tous')[] = ['Tous', 'Résultat disponible', 'En attente', 'En cours', 'Annulé'];
    readonly typeConfig = TYPE_CONFIG;
    readonly statutValeurConfig = STATUT_VALEUR_CONFIG;

    // ── Computed ──────────────────────────────────────────────────────────────
    filteredExamens = computed(() => {
        const q = this.searchQuery().toLowerCase();
        const t = this.selectedType();
        const s = this.selectedStatut();
        return this.examens().filter(e =>
            (t === 'Tous' || e.type_examen === t) &&
            (s === 'Tous' || e.statut === s) &&
            (e.libelle_examen.toLowerCase().includes(q) || e.code_loinc.toLowerCase().includes(q))
        );
    });

    stats = computed(() => {
        const list = this.examens();
        return {
            total: list.length,
            disponible: list.filter(e => e.statut === 'Résultat disponible').length,
            horsnorme: list.filter(e => {
                const sv = this.statutValeur(e);
                return sv === 'eleve' || sv === 'critique' || sv === 'bas';
            }).length,
            enAttente: list.filter(e => e.statut === 'En attente' || e.statut === 'En cours').length,
        };
    });

    critiquesAlert = computed(() =>
        this.examens().filter(e => this.statutValeur(e) === 'critique')
    );

    derniereMaj = computed(() => {
        const dates = this.examens().map(e => e.date_realisation).filter(Boolean);
        if (!dates.length) return 'Aucun résultat';
        const last = dates.reduce((a, b) => a > b ? a : b);
        return new Date(last).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    });

    ngOnInit(): void {
        this.dashboardService.getExamens().subscribe(data => {
            this.examens.set(data);
            this.loading.set(false);
        });
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    statutValeur(ex: Examen): StatutValeur { return statutValeur(ex); }
    barPercent(ex: Examen): number { return barPercent(ex); }

    barNormalStart(ex: Examen): number {
        if (!ex.valeur_min_normal || !ex.valeur_max_normal) return 0;
        const min = ex.valeur_min_normal * 0.7;
        const max = ex.valeur_max_normal * 1.3;
        return Math.max(0, ((ex.valeur_min_normal - min) / (max - min)) * 100);
    }

    barNormalWidth(ex: Examen): number {
        if (!ex.valeur_min_normal || !ex.valeur_max_normal) return 0;
        const min = ex.valeur_min_normal * 0.7;
        const max = ex.valeur_max_normal * 1.3;
        return ((ex.valeur_max_normal - ex.valeur_min_normal) / (max - min)) * 100;
    }

    hasImage(ex: Examen): boolean {
        return !!ex.image_path && ex.type_examen !== 'Biologie';
    }

    statutBadgeClass(statut: StatutExamen): string {
        return {
            'Résultat disponible': 'bg-emerald-100 text-emerald-700',
            'En attente': 'bg-amber-100 text-amber-700',
            'En cours': 'bg-blue-100 text-blue-700',
            'Annulé': 'bg-slate-100 text-slate-500',
        }[statut] ?? '';
    }

    statutDotClass(statut: StatutExamen): string {
        return {
            'Résultat disponible': 'bg-emerald-500',
            'En attente': 'bg-amber-500',
            'En cours': 'bg-blue-500',
            'Annulé': 'bg-slate-400',
        }[statut] ?? '';
    }

    // ── Actions ────────────────────────────────────────────────────────────────
    openDetail(ex: Examen): void {
        this.selectedExamen.set(ex);
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.selectedExamen.set(null);
    }

    openImage(path: string): void {
        this.activeImagePath.set(path);
        this.showImageModal.set(true);
    }

    closeImage(): void {
        this.showImageModal.set(false);
        this.activeImagePath.set(null);
    }

    trackByUuid(_: number, ex: Examen): string { return ex.uuid; }
}