import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DossierService, Allergie } from '../../services/dossier.service';

@Component({
  selector: 'app-allergies',
  imports: [CommonModule],
  templateUrl: './allergies.html',
  styleUrl: './allergies.css',
})
export class Allergies implements OnInit {
  private dossierService = inject(DossierService);
  loading = signal(true);
  allergies = signal<Allergie[]>([]);
  dateVerification = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  allergiesActives = computed(() => this.allergies().filter(a => a.statut === 'active'));
  allergiesSeveres = computed(() => this.allergies().filter(a => a.severite === 'severe' && a.statut === 'active'));
  intolerances = computed(() => this.allergies().filter(a => a.type === 'alimentaire'));
  resolues = computed(() => this.allergies().filter(a => a.statut === 'resolue'));
  medicamenteuses = computed(() => this.allergies().filter(a => a.type === 'medicamenteuse'));
  alimentaires = computed(() => this.allergies().filter(a => a.type === 'alimentaire'));

  ngOnInit(): void {
    this.dossierService.getAllergies().then(data => {
      this.allergies.set(data);
      this.loading.set(false);
    });
  }
}
