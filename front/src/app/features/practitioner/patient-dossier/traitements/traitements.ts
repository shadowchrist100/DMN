import { Component, OnInit, signal, inject, computed } from '@angular/core';
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
  traitements = signal<Traitement[]>([]);

  nbActifs = computed(() => this.traitements().filter(t => t.statut === 'actif').length);
  nbAExpirer = computed(() => this.traitements().filter(t => t.statut === 'a_expirer').length);
  nbTermines = computed(() => this.traitements().filter(t => t.statut === 'termine').length);

  ngOnInit(): void {
    this.dossierService.getTraitements().then(data => {
      this.traitements.set(data);
      this.loading.set(false);
    });
  }
}
