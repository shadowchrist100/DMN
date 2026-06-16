import { Component, OnInit, signal, inject, computed } from '@angular/core';
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
  evenements = signal<EvenementHistorique[]>([]);

  nbConsultations = computed(() => this.evenements().filter(e => e.type === 'consultation').length);
  nbHospitalisations = computed(() => this.evenements().filter(e => e.type === 'hospitalisation').length);
  nbAnalyses = computed(() => this.evenements().filter(e => e.type === 'analyse').length);
  nbPrescriptions = computed(() => this.evenements().filter(e => e.type === 'prescription').length);
  nbTotal = computed(() => this.evenements().length);

  ngOnInit(): void {
    this.dossierService.getHistorique().then(data => {
      this.evenements.set(data);
      this.loading.set(false);
    });
  }
}
