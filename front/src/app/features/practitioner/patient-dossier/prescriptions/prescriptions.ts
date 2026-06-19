import { Component, OnInit, signal, inject, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DossierService, PrescriptionItem } from '../../services/dossier.service';

@Component({
  selector: 'app-prescriptions',
  imports: [CommonModule],
  templateUrl: './prescriptions.html',
})
export class Prescriptions implements OnInit {
  private dossierService = inject(DossierService);
  loading = signal(true);
  error = signal<string | null>(null);
  prescriptions = signal<PrescriptionItem[]>([]);

  @Input() patientUserId: string | undefined;

  nbTotal = computed(() => this.prescriptions().length);
  nbExamens = computed(() => this.prescriptions().filter(p => p.type === 'examen').length);
  nbMedicaments = computed(() => this.prescriptions().filter(p => p.type === 'medicament').length);
  nbActives = computed(() => this.prescriptions().filter(p => p.statut === 'active').length);

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.dossierService.getPrescriptions(this.patientUserId);
      this.prescriptions.set(data);
    } catch (e) {
      this.error.set('Erreur lors du chargement des prescriptions');
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }
}
