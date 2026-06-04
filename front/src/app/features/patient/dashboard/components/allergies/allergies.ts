import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Interfaces ───────────────────────────────────────────────────────────────
export type Criticite = 'Élevée' | 'Modérée' | 'Basse' | 'Inconnue';
export type StatutAllergie = 'Allergie Active' | 'Confirmé' | 'Suspecté' | 'Actif' | 'Résolu';
export type TypeAllergie = 'Médicaments' | 'Alimentation' | 'Environnement' | 'Autre';

export interface Allergie {
    id: number;
    substance: string;
    type: TypeAllergie;
    sousType: string;
    icon: string;
    criticite: Criticite;
    statut: StatutAllergie;
    reactions: string[];
    dateDeclaration: string;
    declarePar: string;
    notes?: string;
}

export type SortOption = 'criticite' | 'date' | 'statut';

@Component({
    selector: 'app-allergies',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './allergies.html',
    styleUrls: ['./allergies.css'],
})
export class Allergies {

    // ── État UI ────────────────────────────────────────────────────────────────
    sortOption = signal<SortOption>('criticite');
    selectedId = signal<number | null>(null);
    showModal = signal(false);

    // ── Données ────────────────────────────────────────────────────────────────
    readonly allergies: Allergie[] = [
        {
            id: 1,
            substance: 'Pénicilline G',
            type: 'Médicaments',
            sousType: 'Antibiotique',
            icon: 'medication',
            criticite: 'Élevée',
            statut: 'Allergie Active',
            reactions: ['Choc Anaphylactique', 'Urticaire généralisée', 'Œdème de Quincke'],
            dateDeclaration: '12/03/2018',
            declarePar: 'Dr. Ahossi Sébastien',
            notes: 'Risque de réaction croisée avec les Céphalosporines (alerte IA). Porter un bracelet médical.',
        },
        {
            id: 2,
            substance: 'Lactose (Produits Laitiers)',
            type: 'Alimentation',
            sousType: 'Intolérance',
            icon: 'restaurant',
            criticite: 'Basse',
            statut: 'Confirmé',
            reactions: ['Douleurs abdominales', 'Ballonnements', 'Inconfort gastrique sévère'],
            dateDeclaration: '05/07/2020',
            declarePar: 'Dr. Bello Aïssatou',
            notes: 'Régime sans lactose recommandé. Tolérance possible aux fromages affinés.',
        },
        {
            id: 3,
            substance: 'Acariens / Poussière',
            type: 'Environnement',
            sousType: 'Allergie',
            icon: 'psychology',
            criticite: 'Inconnue',
            statut: 'Suspecté',
            reactions: ['Rhinite allergique', 'Conjonctivite', 'Éternuements fréquents'],
            dateDeclaration: '22/11/2021',
            declarePar: 'Dr. Dossou Mireille',
            notes: 'Tests cutanés en attente. Bilan allergologique planifié pour Q1 2024.',
        },
        {
            id: 4,
            substance: 'Ibuprofène (AINS)',
            type: 'Médicaments',
            sousType: 'Anti-inflammatoire',
            icon: 'medication',
            criticite: 'Basse',
            statut: 'Actif',
            reactions: ['Urticaire localisée', 'Prurit léger'],
            dateDeclaration: '14/09/2023',
            declarePar: 'Dr. Kouandété Koffi',
        },
    ];

    // ── Computed ───────────────────────────────────────────────────────────────
    readonly critiquesAlerts = computed(() =>
        this.allergies.filter(a => a.criticite === 'Élevée')
    );

    readonly listeTriee = computed(() => {
        return [...this.allergies].sort((a, b) => {
            const opt = this.sortOption();
            if (opt === 'criticite') {
                const order: Record<Criticite, number> = { 'Élevée': 0, 'Modérée': 1, 'Basse': 2, 'Inconnue': 3 };
                return order[a.criticite] - order[b.criticite];
            }
            if (opt === 'date') return b.dateDeclaration.localeCompare(a.dateDeclaration);
            return a.statut.localeCompare(b.statut);
        });
    });

    readonly selectedAllergie = computed(() =>
        this.allergies.find(a => a.id === this.selectedId()) ?? null
    );

    // ── Statistiques ───────────────────────────────────────────────────────────
    get stats() {
        return {
            total: this.allergies.length,
            actives: this.allergies.filter(a => a.statut === 'Allergie Active' || a.statut === 'Actif').length,
            intolerances: this.allergies.filter(a => a.sousType === 'Intolérance').length,
            suspectees: this.allergies.filter(a => a.statut === 'Suspecté').length,
        };
    }

    // ── Helpers de style ───────────────────────────────────────────────────────
    criticiteClasses(c: Criticite): { badge: string; border: string; dot: string } {
        const map: Record<Criticite, { badge: string; border: string; dot: string }> = {
            'Élevée': { badge: 'bg-red-100 text-red-700', border: 'border-l-red-600', dot: 'bg-red-500' },
            'Modérée': { badge: 'bg-orange-100 text-orange-700', border: 'border-l-orange-400', dot: 'bg-orange-500' },
            'Basse': { badge: 'bg-yellow-50 text-yellow-700', border: 'border-l-blue-400', dot: 'bg-blue-400' },
            'Inconnue': { badge: 'bg-slate-100 text-slate-500', border: 'border-l-emerald-400', dot: 'bg-slate-400' },
        };
        return map[c];
    }

    typeIconClasses(type: TypeAllergie): { bg: string; text: string } {
        const map: Record<TypeAllergie, { bg: string; text: string }> = {
            'Médicaments': { bg: 'bg-red-50', text: 'text-red-700' },
            'Alimentation': { bg: 'bg-blue-50', text: 'text-blue-700' },
            'Environnement': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
            'Autre': { bg: 'bg-slate-50', text: 'text-slate-700' },
        };
        return map[type];
    }

    // ── Actions ────────────────────────────────────────────────────────────────
    onSortChange(value: string): void {
        this.sortOption.set(value as SortOption);
    }

    openDetail(id: number): void {
        this.selectedId.set(id);
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.selectedId.set(null);
    }
}