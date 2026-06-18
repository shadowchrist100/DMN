import { Component, OnInit, signal, inject, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DossierService, Vaccin } from '../../services/dossier.service';

@Component({
  selector: 'app-vaccins',
  imports: [CommonModule],
  templateUrl: './vaccins.html',
  styleUrl: './vaccins.css',
})
export class Vaccins implements OnInit {
  private dossierService = inject(DossierService);
  loading = signal(true);
  error = signal<string | null>(null);
  vaccins = signal<Vaccin[]>([]);

  @Input() patientUserId: string | undefined;

  nbAJour = computed(() => this.vaccins().filter(v => v.statut === 'a_jour').length);
  nbRappelDu = computed(() => this.vaccins().filter(v => v.statut === 'rappel_du').length);

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.dossierService.getVaccins(this.patientUserId);
      this.vaccins.set(data);
    } catch (e) {
      this.error.set('Erreur lors du chargement des vaccins');
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }
}
