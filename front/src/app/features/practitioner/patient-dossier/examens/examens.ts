import { Component, OnInit, signal, inject, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DossierService, Examen } from '../../services/dossier.service';

@Component({
  selector: 'app-examens',
  imports: [CommonModule],
  templateUrl: './examens.html',
  styleUrl: './examens.css',
})
export class Examens implements OnInit {
  private dossierService = inject(DossierService);
  loading = signal(true);
  error = signal<string | null>(null);
  examens = signal<Examen[]>([]);
  currentYear = new Date().getFullYear();

  @Input() patientUserId: string | undefined;

  nbAnalyses = computed(() => this.examens().filter(e => e.type === 'analyse').length);
  nbImagerie = computed(() => this.examens().filter(e => e.type === 'imagerie').length);
  nbECG = computed(() => this.examens().filter(e => e.type === 'ecg').length);
  nbAnormaux = computed(() => this.examens().filter(e => e.statut === 'anormal').length);

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.dossierService.getExamens(this.patientUserId);
      this.examens.set(data);
    } catch (e) {
      this.error.set('Erreur lors du chargement des examens');
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }
}
