import { Component, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Types ────────────────────────────────────────────────────────────────────
export type TypeExamen =
    | 'Biologie'
    | 'Imagerie'
    | 'Radiologie'
    | 'Échographie'
    | 'Cardiologie'
    | 'Autre';

export type StatutExamen =
    | 'Résultat disponible'
    | 'En attente'
    | 'En cours'
    | 'Annulé';

export type StatutValeur = 'normal' | 'eleve' | 'bas' | 'critique' | 'limite' | 'na';

export interface Examen {
    uuid: string;
    libelle_examen: string;
    type_examen: TypeExamen;
    statut: StatutExamen;
    date_realisation: Date;
    code_loinc: string;
    valeur: string;
    unite: string;
    valeur_min_normal: number | null;
    valeur_max_normal: number | null;
    interpretation: string;
    image_path: string | null;
}

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

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_EXAMENS: Examen[] = [
    {
        uuid: 'e001', libelle_examen: 'Glycémie à jeun', type_examen: 'Biologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-05-24'),
        code_loinc: '2339-0', valeur: '1.26', unite: 'g/L',
        valeur_min_normal: 0.70, valeur_max_normal: 1.10,
        interpretation: 'Valeur supérieure à la normale. Tendance diabétique à surveiller.',
        image_path: null,
    },
    {
        uuid: 'e002', libelle_examen: 'HbA1c', type_examen: 'Biologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-05-24'),
        code_loinc: '4548-4', valeur: '7.2', unite: '%',
        valeur_min_normal: 4.0, valeur_max_normal: 6.0,
        interpretation: 'Hémoglobine glyquée critique. Consultation endocrinologue requise.',
        image_path: null,
    },
    {
        uuid: 'e003', libelle_examen: 'Cholestérol LDL', type_examen: 'Biologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-05-24'),
        code_loinc: '13457-7', valeur: '1.62', unite: 'g/L',
        valeur_min_normal: 0.50, valeur_max_normal: 1.60,
        interpretation: 'Légèrement au-dessus de la limite recommandée.',
        image_path: null,
    },
    {
        uuid: 'e004', libelle_examen: 'Sodium (Na+)', type_examen: 'Biologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-05-24'),
        code_loinc: '2951-2', valeur: '141', unite: 'mmol/L',
        valeur_min_normal: 135, valeur_max_normal: 145,
        interpretation: 'Natrémie dans les valeurs de référence.', image_path: null,
    },
    {
        uuid: 'e005', libelle_examen: 'Créatinine', type_examen: 'Biologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-05-24'),
        code_loinc: '2160-0', valeur: '9.1', unite: 'mg/L',
        valeur_min_normal: 7.0, valeur_max_normal: 12.0,
        interpretation: 'Fonction rénale normale.', image_path: null,
    },
    {
        uuid: 'e006', libelle_examen: 'NFS – Hémoglobine', type_examen: 'Biologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-04-10'),
        code_loinc: '718-7', valeur: '11.2', unite: 'g/dL',
        valeur_min_normal: 12.0, valeur_max_normal: 17.5,
        interpretation: 'Anémie légère. Supplémentation en fer à envisager.', image_path: null,
    },
    {
        uuid: 'e007', libelle_examen: 'Échographie abdominale', type_examen: 'Échographie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-03-15'),
        code_loinc: '36643-5', valeur: 'N/A', unite: '',
        valeur_min_normal: null, valeur_max_normal: null,
        interpretation: 'Foie homogène, pas de lésion focale. Rate et reins normaux. Légère stéatose hépatique non alcoolique débutante.',
        image_path: '/assets/imagerie/echo-abdomen-2024.jpg',
    },
    {
        uuid: 'e008', libelle_examen: 'Radiographie Thorax (Face)', type_examen: 'Radiologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-03-15'),
        code_loinc: '36643-5', valeur: 'N/A', unite: '',
        valeur_min_normal: null, valeur_max_normal: null,
        interpretation: 'Silhouette cardiaque dans les limites normales. Pas d\'opacité suspecte. Coupoles diaphragmatiques libres.',
        image_path: '/assets/imagerie/radio-thorax-2024.jpg',
    },
    {
        uuid: 'e009', libelle_examen: 'ECG de repos', type_examen: 'Cardiologie',
        statut: 'Résultat disponible', date_realisation: new Date('2024-02-20'),
        code_loinc: '11524-6', valeur: '88', unite: 'BPM',
        valeur_min_normal: 60, valeur_max_normal: 100,
        interpretation: 'Rythme sinusal régulier. Aucun trouble de la repolarisation. Intervalle QT normal.',
        image_path: '/assets/imagerie/ecg-2024.jpg',
    },
    {
        uuid: 'e010', libelle_examen: 'TSH (Thyroïde)', type_examen: 'Biologie',
        statut: 'En attente', date_realisation: new Date('2024-05-30'),
        code_loinc: '3016-3', valeur: '—', unite: 'mUI/L',
        valeur_min_normal: 0.4, valeur_max_normal: 4.0,
        interpretation: 'Résultat en attente du laboratoire.', image_path: null,
    },
    {
        uuid: 'e011', libelle_examen: 'Échographie cardiaque (ETT)', type_examen: 'Échographie',
        statut: 'En cours', date_realisation: new Date('2024-05-28'),
        code_loinc: '42148-7', valeur: 'N/A', unite: '',
        valeur_min_normal: null, valeur_max_normal: null,
        interpretation: 'Examen en cours de traitement par le cardiologue.', image_path: null,
    },
];

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
export class Examens {

    // ── State ─────────────────────────────────────────────────────────────────
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
        return MOCK_EXAMENS.filter(e =>
            (t === 'Tous' || e.type_examen === t) &&
            (s === 'Tous' || e.statut === s) &&
            (e.libelle_examen.toLowerCase().includes(q) || e.code_loinc.toLowerCase().includes(q))
        );
    });

    stats = computed(() => ({
        total: MOCK_EXAMENS.length,
        disponible: MOCK_EXAMENS.filter(e => e.statut === 'Résultat disponible').length,
        horsnorme: MOCK_EXAMENS.filter(e => {
            const sv = this.statutValeur(e);
            return sv === 'eleve' || sv === 'critique' || sv === 'bas';
        }).length,
        enAttente: MOCK_EXAMENS.filter(e => e.statut === 'En attente' || e.statut === 'En cours').length,
    }));

    critiquesAlert = computed(() =>
        MOCK_EXAMENS.filter(e => this.statutValeur(e) === 'critique')
    );

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