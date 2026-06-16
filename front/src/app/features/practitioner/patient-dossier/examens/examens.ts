import { Component, OnInit, signal, inject, computed } from '@angular/core';
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
  examens = signal<Examen[]>([]);

  nbAnalyses = computed(() => this.examens().filter(e => e.type === 'analyse').length);
  nbImagerie = computed(() => this.examens().filter(e => e.type === 'imagerie').length);
  nbECG = computed(() => this.examens().filter(e => e.type === 'ecg').length);
  nbAnormaux = computed(() => this.examens().filter(e => e.statut === 'anormal').length);

  ngOnInit(): void {
    this.dossierService.getExamens().then(data => {
      this.examens.set(data);
      this.loading.set(false);
    });
  }
}
