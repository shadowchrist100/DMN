import { Component, OnInit, signal, inject, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DossierService, EvenementHistorique } from '../../services/dossier.service';

@Component({
  selector: 'app-historiques',
  imports: [CommonModule],
  templateUrl: './historiques.html',
  styleUrl: './historiques.css',
})
export class Historiques implements OnInit {
  private dossierService = inject(DossierService);
  loading = signal(true);
  error = signal<string | null>(null);
  evenements = signal<EvenementHistorique[]>([]);
  currentYear = new Date().getFullYear();

  @Input() patientUserId: string | undefined;

  nbConsultations = computed(() => this.evenements().filter(e => e.type === 'consultation').length);
  nbHospitalisations = computed(() => this.evenements().filter(e => e.type === 'hospitalisation').length);
  nbAnalyses = computed(() => this.evenements().filter(e => e.type === 'analyse').length);
  nbPrescriptions = computed(() => this.evenements().filter(e => e.type === 'prescription').length);
  nbPrescriptionsActives = computed(() => this.evenements().filter(e => e.type === 'prescription' && e.statut === 'active').length);
  nbTotal = computed(() => this.evenements().length);

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.dossierService.getHistorique(this.patientUserId);
      this.evenements.set(data);
    } catch (e) {
      this.error.set('Erreur lors du chargement de l\'historique');
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }
}
