import { Component, OnInit, signal, inject, computed, Input } from '@angular/core';
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
  error = signal<string | null>(null);
  pathologies = signal<Pathologie[]>([]);
  dateVerification = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  @Input() patientUserId: string | undefined;

  nbChroniques = computed(() => this.pathologies().filter(p => p.type === 'chronique').length);
  nbAigues = computed(() => this.pathologies().filter(p => p.type === 'aigue').length);
  nbAntecedents = computed(() => this.pathologies().filter(p => p.type === 'antecedent').length);
  nbActives = computed(() => this.pathologies().filter(p => p.statut === 'active' || p.statut === 'controlee').length);

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.dossierService.getPathologies(this.patientUserId);
      this.pathologies.set(data);
    } catch (e) {
      this.error.set('Erreur lors du chargement des pathologies');
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }
}
