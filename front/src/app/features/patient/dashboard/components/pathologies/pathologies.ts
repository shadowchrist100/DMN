import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { DiseaseDTO } from '../../../services/medical.service';
import { map } from 'rxjs';

export interface Pathologie {
  id: number;
  code: string;
  libelle: string;
  type: 'chronique' | 'aigue' | 'héréditaire' | 'autre';
  statut: 'active' | 'en_rémission' | 'guérie' | 'suspecte';
  severite: 'légère' | 'modérée' | 'sévère';
  dateDebut: string;
  dateFin?: string;
  traitementEnCours: boolean;
  notes?: string;
}

@Component({
  selector: 'app-pathologies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pathologies.html',
  styleUrls: ['./pathologies.css'],
})
export class Pathologies implements OnInit {
  private dashboardService = inject(DashboardService);

  loading   = signal(true);
  pathologies = signal<Pathologie[]>([]);
  showDetail  = signal<Pathologie | null>(null);
  filterStatut = signal<string>('all');
  filterType   = signal<string>('all');

  readonly actives = computed(() =>
    this.pathologies().filter(p => p.statut === 'active')
  );

  readonly filtered = computed(() => {
    let list = this.pathologies();
    if (this.filterStatut() !== 'all')
      list = list.filter(p => p.statut === this.filterStatut());
    if (this.filterType() !== 'all')
      list = list.filter(p => p.type === this.filterType());
    return list;
  });

  readonly stats = computed(() => ({
    total:      this.pathologies().length,
    actives:    this.pathologies().filter(p => p.statut === 'active').length,
    chroniques: this.pathologies().filter(p => p.type === 'chronique').length,
    traitees:   this.pathologies().filter(p => p.traitementEnCours).length,
  }));

  ngOnInit(): void {
    this.dashboardService.getPathologies().pipe(
      map((dtos: DiseaseDTO[]) => dtos.map((d, i) => this.mapPathologie(d, i))),
    ).subscribe({
      next: (data) => { this.pathologies.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  private mapPathologie(dto: DiseaseDTO, index: number): Pathologie {
    return {
      id: index + 1,
      code: dto.code_cim || '—',
      libelle: dto.libelle || '—',
      type: 'chronique',
      statut: dto.statut_verification === 'CONFIRMED' ? 'active' : 'suspecte',
      severite: 'modérée',
      dateDebut: dto.date || '—',
      traitementEnCours: dto.statut_verification === 'CONFIRMED',
      notes: dto.note_clinique || undefined,
    };
  }

  getStatutLabel(s: string): string {
    const labels: Record<string, string> = {
      active: 'Active', en_rémission: 'En rémission', guérie: 'Guérie', suspecte: 'Suspecte',
    };
    return labels[s] ?? s;
  }

  getStatutClasses(s: string): string {
    const map: Record<string, string> = {
      active:        'bg-red-50 text-red-700 border border-red-200',
      en_rémission:  'bg-amber-50 text-amber-700 border border-amber-200',
      guérie:        'bg-emerald-50 text-emerald-700 border border-emerald-200',
      suspecte:      'bg-slate-100 text-slate-600 border border-slate-200',
    };
    return map[s] ?? 'bg-slate-100 text-slate-600';
  }

  getSeveriteClasses(s: string): string {
    const map: Record<string, string> = {
      légère:  'bg-green-100 text-green-700',
      modérée: 'bg-amber-100 text-amber-700',
      sévère:  'bg-red-100 text-red-700',
    };
    return map[s] ?? 'bg-slate-100 text-slate-600';
  }

  getTypeIcon(t: string): string {
    const map: Record<string, string> = {
      chronique: 'monitoring', aigue: 'flash_on', héréditaire: 'genetics', autre: 'help_clinic',
    };
    return map[t] ?? 'medical_information';
  }

  openDetail(p: Pathologie): void { this.showDetail.set(p); }
  closeDetail(): void { this.showDetail.set(null); }
}
