import { Component, OnInit, signal, inject, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DossierService, Traitement } from '../../services/dossier.service';

@Component({
  selector: 'app-traitements',
  imports: [CommonModule],
  templateUrl: './traitements.html',
  styleUrl: './traitements.css',
})
export class Traitements implements OnInit {
  private dossierService = inject(DossierService);
  loading = signal(true);
  error = signal<string | null>(null);
  traitements = signal<Traitement[]>([]);

  @Input() patientUserId: string | undefined;

  nbActifs = computed(() => this.traitements().filter(t => t.statut === 'actif').length);
  nbAExpirer = computed(() => this.traitements().filter(t => t.statut === 'a_expirer').length);
  nbTermines = computed(() => this.traitements().filter(t => t.statut === 'termine').length);

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.dossierService.getTraitements(this.patientUserId);
      this.traitements.set(data);
    } catch (e) {
      this.error.set('Erreur lors du chargement des traitements');
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }
}
