import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DossierService, Pathologie } from '../../services/dossier.service';

@Component({
  selector: 'app-pathologies',
  imports: [CommonModule],
  templateUrl: './pathologies.html',
  styleUrl: './pathologies.css',
})
export class Pathologies implements OnInit {
  private dossierService = inject(DossierService);
  loading = signal(true);
  pathologies = signal<Pathologie[]>([]);

  nbChroniques = computed(() => this.pathologies().filter(p => p.type === 'chronique').length);
  nbAigues = computed(() => this.pathologies().filter(p => p.type === 'aigue').length);
  nbAntecedents = computed(() => this.pathologies().filter(p => p.type === 'antecedent').length);
  nbActives = computed(() => this.pathologies().filter(p => p.statut === 'active' || p.statut === 'controlee').length);

  ngOnInit(): void {
    this.dossierService.getPathologies().then(data => {
      this.pathologies.set(data);
      this.loading.set(false);
    });
  }
}
