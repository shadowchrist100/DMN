import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, Allergie, Criticite, TypeAllergie, StatutAllergie } from '../../services/dashboard.service';

export type SortOption = 'criticite' | 'date' | 'statut';

@Component({
    selector: 'app-allergies',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './allergies.html',
    styleUrls: ['./allergies.css'],
})
export class Allergies implements OnInit {
    private dashboardService = inject(DashboardService);

    loading = signal(true);
    errorMessage = signal<string | null>(null);
    sortOption = signal<SortOption>('criticite');
    selectedId = signal<number | null>(null);
    showModal = signal(false);

    allergies = signal<Allergie[]>([]);

    readonly critiquesAlerts = computed(() =>
        this.allergies().filter(a => a.criticite === 'Élevée')
    );

    readonly listeTriee = computed(() => {
        const opt = this.sortOption();
        const list = this.allergies();
        return [...list].sort((a, b) => {
            if (opt === 'criticite') {
                const order: Record<Criticite, number> = { 'Élevée': 0, 'Modérée': 1, 'Basse': 2, 'Inconnue': 3 };
                return order[a.criticite] - order[b.criticite];
            }
            if (opt === 'date') return b.dateDeclaration.localeCompare(a.dateDeclaration);
            return a.statut.localeCompare(b.statut);
        });
    });

    readonly selectedAllergie = computed(() =>
        this.allergies().find(a => a.id === this.selectedId()) ?? null
    );

    get stats() {
        const list = this.allergies();
        return {
            total: list.length,
            actives: list.filter(a => a.statut === 'Allergie Active' || a.statut === 'Actif').length,
            intolerances: list.filter(a => a.sousType === 'Intolérance').length,
            suspectees: list.filter(a => a.statut === 'Suspecté').length,
        };
    }

    ngOnInit(): void {
        this.loading.set(true);
        this.errorMessage.set(null);
        this.dashboardService.getAllergies().subscribe({
            next: (data) => {
                this.allergies.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                this.errorMessage.set('Impossible de charger les allergies.');
                this.loading.set(false);
            },
        });
    }

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