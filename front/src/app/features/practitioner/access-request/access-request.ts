import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MedicalPractitionerService, PatientSearchResultDTO } from '../services/medical-practitioner.service';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
    selector: 'app-access-request',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen bg-[#f8f9ff] p-8 font-['Public_Sans']">
      <div class="max-w-3xl mx-auto">
        <button (click)="router.navigate(['/practitioner/dashboard'])"
          class="text-sm text-[#002B5C] font-bold flex items-center gap-1 mb-6 hover:underline">
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          Retour au tableau de bord
        </button>

        <h1 class="text-2xl font-black text-[#002B5C] mb-2">Nouvelle demande d'accès</h1>
        <p class="text-slate-500 text-sm mb-8">Recherchez un patient dans tout le syst\u00e8me pour demander l'acc\u00e8s \u00e0 son dossier m\u00e9dical.</p>

        <!-- Search -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
            Rechercher un patient par NPI
          </label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input #searchInput type="text" (input)="onSearch(searchInput.value)"
              placeholder="Saisissez le NPI du patient..."
              class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#002B5C] outline-none">
          </div>
          @if (searchQuery()) {
            <p class="text-xs text-slate-400 mt-2">{{ searchResults().length }} r\u00e9sultat(s) trouv\u00e9(s)</p>
          }
        </div>

        <!-- Results -->
        @if (searching()) {
          <div class="text-center py-12 text-slate-400">
            <span class="material-symbols-outlined text-4xl mb-2 block animate-spin">sync</span>
            <p class="text-sm">Recherche en cours...</p>
          </div>
        } @else {
          <div class="space-y-4">
            @for (patient of searchResults(); track patient.npi) {
              <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#002B5C] font-black">
                      {{ patient.npi.slice(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-800">Patient {{ patient.npi.slice(0, 8) }}</p>
                      <p class="text-xs text-slate-400 font-mono">NPI: {{ patient.npi }}</p>
                    </div>
                  </div>
                  <button (click)="selectedPatient.set(patient); reason.set(''); selectedPerimeter.set('all'); selectedDuration.set('24h')"
                    class="bg-[#002B5C] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#001f42] transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">verified_user</span>
                    Demander l'acc\u00e8s
                  </button>
                </div>
              </div>
            } @empty {
              @if (searchQuery()) {
                <div class="text-center py-12 text-slate-400">
                  <span class="material-symbols-outlined text-4xl mb-2 block">person_search</span>
                  <p class="text-sm">Aucun patient trouv\u00e9 pour "{{ searchQuery() }}"</p>
                </div>
              }
            }
          </div>
        }

        <!-- Access Request Form Modal -->
        @if (selectedPatient(); as patient) {
          <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
              <h2 class="text-lg font-black text-[#002B5C] mb-2">Demander l'acc\u00e8s au dossier</h2>
              <p class="text-sm text-slate-500 mb-6">
                Patient: <span class="font-bold text-slate-800">NPI {{ patient.npi }}</span>
              </p>

              <div class="space-y-4 mb-6">
                <div>
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Motif de la demande</label>
                  <textarea [ngModel]="reason()" (ngModelChange)="reason.set($event)" rows="3"
                    class="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#002B5C] outline-none"
                    placeholder="Expliquez bri\u00e8vement pourquoi vous avez besoin d'acc\u00e9der \u00e0 ce dossier..."></textarea>
                </div>

                <div>
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">P\u00e9rim\u00e8tre d'acc\u00e8s</label>
                  <div class="flex gap-2">
                    <button (click)="selectedPerimeter.set('all')"
                      class="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold border transition-all"
                      [class]="selectedPerimeter() === 'all'
                        ? 'bg-[#002B5C] text-white border-[#002B5C]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#002B5C]'">
                      Complet
                    </button>
                    <button (click)="selectedPerimeter.set('prescriptions')"
                      class="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold border transition-all"
                      [class]="selectedPerimeter() === 'prescriptions'
                        ? 'bg-[#002B5C] text-white border-[#002B5C]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#002B5C]'">
                      Prescriptions uniquement
                    </button>
                  </div>
                </div>

                <div>
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Dur\u00e9e</label>
                  <select [ngModel]="selectedDuration()" (ngModelChange)="selectedDuration.set($event)"
                    class="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#002B5C] outline-none">
                    <option value="24h">24 Heures</option>
                    <option value="7j">7 Jours</option>
                    <option value="30j">30 Jours</option>
                    <option value="indeterminee">Ind\u00e9termin\u00e9e</option>
                  </select>
                </div>
              </div>

              @if (error()) {
                <p class="text-red-600 text-sm mb-4">{{ error() }}</p>
              }
              @if (success()) {
                <p class="text-green-600 text-sm mb-4">{{ success() }}</p>
              }

              <div class="flex gap-3 justify-end">
                <button (click)="selectedPatient.set(null); error.set(''); success.set('')"
                  class="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
                <button (click)="submitRequest()" [disabled]="submitting()"
                  class="px-6 py-2.5 bg-[#002B5C] text-white rounded-lg text-sm font-bold hover:bg-[#001f42] transition-colors disabled:opacity-50 flex items-center gap-2">
                  @if (submitting()) {
                    <span class="material-symbols-outlined text-sm animate-spin">sync</span>
                  }
                  Envoyer la demande
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AccessRequest implements OnInit {
    private medicalPrac = inject(MedicalPractitionerService);
    router = inject(Router);
    authStore = AuthStore;

    searchQuery = signal('');
    searchResults = signal<PatientSearchResultDTO[]>([]);
    searching = signal(false);
    selectedPatient = signal<PatientSearchResultDTO | null>(null);
    reason = signal('');
    selectedPerimeter = signal('all');
    selectedDuration = signal('24h');
    submitting = signal(false);
    error = signal('');
    success = signal('');

    userId = computed(() => this.authStore.userId() ?? '');

    ngOnInit(): void {
    }

    async onSearch(query: string): Promise<void> {
        this.searchQuery.set(query);
        if (query.length < 2) {
            this.searchResults.set([]);
            return;
        }

        this.searching.set(true);
        try {
            const results = await firstValueFrom(this.medicalPrac.searchPatients(query));
            this.searchResults.set(results);
        } catch {
            this.searchResults.set([]);
        } finally {
            this.searching.set(false);
        }
    }

    async submitRequest(): Promise<void> {
        const patient = this.selectedPatient();
        if (!patient) return;

        this.submitting.set(true);
        this.error.set('');
        this.success.set('');

        try {
            const result = await firstValueFrom(
                this.medicalPrac.createAccessRequest(this.userId(), {
                    patient_user_id: patient.npi,
                    reason: this.reason(),
                    duration: this.selectedDuration(),
                    perimeter: this.selectedPerimeter(),
                })
            );
            this.success.set(`Demande d'acc\u00e8s envoy\u00e9e avec succ\u00e8s (R\u00e9f: ${result.id.slice(0, 8)}...)`);
            setTimeout(() => {
                this.selectedPatient.set(null);
                this.reason.set('');
                this.selectedPerimeter.set('all');
                this.selectedDuration.set('24h');
                this.success.set('');
            }, 2000);
        } catch (err: unknown) {
            const apiErr = err as { error?: { detail?: string } };
            this.error.set(apiErr?.error?.detail || "Erreur lors de l'envoi de la demande");
        } finally {
            this.submitting.set(false);
        }
    }
}
