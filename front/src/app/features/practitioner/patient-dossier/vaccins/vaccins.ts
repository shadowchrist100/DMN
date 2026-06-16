import { Component, OnInit, signal, inject, computed } from '@angular/core';
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
  vaccins = signal<Vaccin[]>([]);

  nbAJour = computed(() => this.vaccins().filter(v => v.statut === 'a_jour').length);
  nbRappelDu = computed(() => this.vaccins().filter(v => v.statut === 'rappel_du').length);

  ngOnInit(): void {
    this.dossierService.getVaccins().then(data => {
      this.vaccins.set(data);
      this.loading.set(false);
    });
  }
}
