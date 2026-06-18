import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { ConsentService, Consent } from '../services/consent.service';

@Component({
  selector: 'app-consents',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="flex flex-col flex-1 min-h-screen font-['Public_Sans']">

      <!-- Header -->
      <header class="hidden lg:flex sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm
                     px-6 py-4 items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[#002B5C] text-lg">verified_user</span>
          <div>
            <h2 class="font-black text-[#002B5C] text-base uppercase tracking-wide">Consentements</h2>
            <p class="text-[10px] text-slate-400 uppercase tracking-widest">
              Gestion des accès aux dossiers patients
            </p>
          </div>
        </div>
        <!-- Reload -->
        <button (click)="load()" [disabled]="loading()"
                class="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#002B5C]
                       transition-colors disabled:opacity-40">
          <span class="material-symbols-outlined text-sm"
                [class.animate-spin]="loading()">refresh</span>
          Actualiser
        </button>
      </header>

      <!-- Content -->
      <div class="flex-1 p-6 md:p-8 space-y-6">

        <!-- Breadcrumb & titre -->
        <div>
          <nav class="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide mb-3">
            <a routerLink="/practitioner/dashboard"
               class="hover:text-[#002B5C] font-medium transition-colors">Dashboard</a>
            <span class="material-symbols-outlined text-[12px] text-slate-300">chevron_right</span>
            <span class="text-[#002B5C] font-bold">Consentements</span>
          </nav>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-black text-slate-900">Consentements &amp; Accès</h1>
              <p class="text-sm text-slate-500 mt-1">
                <span class="font-bold text-[#002B5C]">{{ activeCount() }}</span>
                accès actifs en ce moment
              </p>
            </div>

            <!-- Stats capsules -->
            <div class="flex gap-2 flex-wrap">
              <div class="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-center min-w-[72px]">
                <p class="text-xl font-black text-emerald-700">{{ activeCount() }}</p>
                <p class="text-[10px] uppercase tracking-widest text-emerald-600">Actifs</p>
              </div>
              <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center min-w-[72px]">
                <p class="text-xl font-black text-amber-700">{{ pendingCount() }}</p>
                <p class="text-[10px] uppercase tracking-widest text-amber-600">En attente</p>
              </div>
              <div class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center min-w-[72px]">
                <p class="text-xl font-black text-slate-500">{{ expiredCount() }}</p>
                <p class="text-[10px] uppercase tracking-widest text-slate-400">Expirés</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Conformité banner -->
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60
                    p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <div class="bg-amber-500/10 p-2 rounded-lg shrink-0">
            <span class="material-symbols-outlined text-amber-700 text-lg"
                  style="font-variation-settings:'FILL' 1">gpp_good</span>
          </div>
          <div class="flex-1">
            <p class="font-bold text-amber-900 text-sm">Conformité APDP &amp; PSSIE</p>
            <p class="text-amber-700/80 text-xs mt-0.5">
              Tout accès au dossier médical nécessite le consentement explicite du patient.
              Les accès d'urgence sont journalisés et audités.
            </p>
          </div>
          <span class="bg-white/80 text-amber-700 px-2.5 py-1 rounded-lg text-[10px]
                       font-bold border border-amber-200 hidden sm:inline-block">APDP</span>
        </div>

        <!-- Filtres -->
        <div class="flex flex-wrap gap-2">
          @for (f of filterTabs; track f.value) {
          <button (click)="filter.set(f.value)"
                  class="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  [class.bg-[#002B5C]]="filter() === f.value"
                  [class.text-white]="filter() === f.value"
                  [class.bg-white]="filter() !== f.value"
                  [class.text-slate-600]="filter() !== f.value"
                  [class.border]="filter() !== f.value"
                  [class.border-slate-200]="filter() !== f.value">
            {{ f.label }}
          </button>
          }
        </div>

        <!-- Erreur -->
        @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span class="material-symbols-outlined text-red-500">error</span>
          <div>
            <p class="font-bold text-red-700 text-sm">Impossible de charger les consentements</p>
            <p class="text-red-500 text-xs mt-0.5">{{ error() }}</p>
          </div>
          <button (click)="load()"
                  class="ml-auto text-xs font-bold text-red-700 hover:underline">Réessayer</button>
        </div>
        }

        <!-- Liste -->
        @if (loading()) {
        <div class="flex items-center justify-center py-24">
          <div class="w-8 h-8 border-4 border-[#002B5C] border-t-transparent rounded-full animate-spin"></div>
        </div>
        } @else if (filtered().length === 0) {
        <div class="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <span class="material-symbols-outlined text-6xl text-slate-200 mb-4 block"
                style="font-variation-settings:'FILL' 1">verified_user</span>
          <p class="text-lg font-bold text-slate-700">Aucun consentement trouvé</p>
          <p class="text-sm text-slate-500 mt-1">Vous n'avez aucun consentement pour ce filtre.</p>
        </div>
        } @else {
        <div class="space-y-4">
          @for (c of filtered(); track c.id) {
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm
                      hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-start justify-between gap-4">

              <!-- Avatar + infos -->
              <div class="flex items-start gap-4 flex-1 min-w-0">
                <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0
                            bg-blue-50 text-blue-600 font-black text-base">
                  {{ initials(c.patientName) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <h3 class="font-bold text-slate-900 text-base">{{ c.patientName }}</h3>
                    <!-- Statut badge -->
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase
                                 {{ statusClass(c.status) }}">
                      {{ statusLabel(c.status) }}
                    </span>
                    @if (c.isUrgent) {
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase
                                 bg-red-50 text-red-700 border border-red-200">
                      ⚡ Urgence
                    </span>
                    }
                  </div>

                  <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                    <span class="flex items-center gap-1 font-mono text-slate-400">
                      NPI: {{ c.patientNpi }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">visibility</span>
                      {{ c.perimeter }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">schedule</span>
                      Durée: {{ c.duration }}
                    </span>
                    @if (c.grantedAt) {
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">check_circle</span>
                      Accordé le: {{ c.grantedAt | date:'dd/MM/yyyy' }}
                    </span>
                    }
                    @if (c.expiresAt) {
                    <span class="flex items-center gap-1"
                          [class.text-red-500]="c.status === 'expired'"
                          [class.text-amber-600]="c.status === 'active'">
                      <span class="material-symbols-outlined text-sm">event</span>
                      {{ c.status === 'expired' ? 'Expiré le' : 'Expire le' }}:
                      {{ c.expiresAt | date:'dd/MM/yyyy' }}
                    </span>
                    }
                    @if (c.reason) {
                    <span class="flex items-center gap-1 italic text-slate-400">
                      <span class="material-symbols-outlined text-sm">info</span>
                      {{ c.reason }}
                    </span>
                    }
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 shrink-0">
                @if (c.status === 'active') {
                <a [routerLink]="['/practitioner/patient', c.patientNpi]"
                   class="px-4 py-2 rounded-xl text-sm font-bold bg-[#002B5C] text-white
                          hover:bg-[#001f42] transition-colors flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">folder_open</span>
                  Ouvrir le dossier
                </a>
                } @else if (c.status === 'pending') {
                <span class="px-4 py-2 rounded-xl text-sm font-bold bg-amber-50 text-amber-600
                             border border-amber-200 flex items-center gap-1.5 cursor-default">
                  <span class="material-symbols-outlined text-sm">hourglass_empty</span>
                  En attente
                </span>
                } @else {
                <span class="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-400
                             flex items-center gap-1.5 cursor-default">
                  <span class="material-symbols-outlined text-sm">block</span>
                  Expiré
                </span>
                }
              </div>

            </div>
          </div>
          }
        </div>
        }

      </div><!-- /content -->

      <!-- Footer -->
      <footer class="bg-white border-t border-slate-200 px-6 py-3 text-center">
        <p class="text-[10px] text-slate-400 uppercase tracking-widest">
          © 2026 Ministère de la Santé — DMN Portal
        </p>
      </footer>
    </div>
  `,
})
export class Consents implements OnInit {
  private consentService = inject(ConsentService);

  // ── État réactif ─────────────────────────────────────────────────────────
  consents  = signal<Consent[]>([]);
  filter    = signal<'all' | 'active' | 'pending' | 'expired'>('all');
  loading   = signal(true);
  error     = signal<string | null>(null);

  // ── Computed ─────────────────────────────────────────────────────────────
  filtered = computed(() => {
    const f = this.filter();
    if (f === 'all') return this.consents();
    return this.consents().filter(c => c.status === f);
  });

  activeCount  = computed(() => this.consents().filter(c => c.status === 'active').length);
  pendingCount = computed(() => this.consents().filter(c => c.status === 'pending').length);
  expiredCount = computed(() => this.consents().filter(c => c.status === 'expired').length);

  // ── Onglets de filtre ────────────────────────────────────────────────────
  filterTabs = [
    { value: 'all',     label: 'Tous'        },
    { value: 'active',  label: 'Actifs'      },
    { value: 'pending', label: 'En attente'  },
    { value: 'expired', label: 'Expirés'     },
  ] as const;

  // ── Cycle de vie ─────────────────────────────────────────────────────────
  ngOnInit() {
    // On s'assure que le userId est initialisé (depuis le service partagé)
    const uid = this.consentService.userId();
    if (!uid) {
      // Fallback : lecture du store Auth (userId décodé depuis le JWT)
      const fallbackId = AuthStore.userId() ?? '';
      if (fallbackId) this.consentService.setUserId(fallbackId);
    }
    this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.consentService.getConsents();
      this.consents.set(data);
    } catch (err: any) {
      const msg = err?.error?.detail ?? err?.message ?? 'Erreur inconnue';
      this.error.set(msg);
      this.consents.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  // ── Helpers d'affichage ──────────────────────────────────────────────────
  initials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  statusLabel(s: string): string {
    const labels: Record<string, string> = {
      active:  'Actif',
      pending: 'En attente',
      expired: 'Expiré',
    };
    return labels[s] ?? s;
  }

  statusClass(s: string): string {
    const classes: Record<string, string> = {
      active:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
      pending: 'bg-amber-50 text-amber-700 border border-amber-200',
      expired: 'bg-slate-100 text-slate-500 border border-slate-200',
    };
    return classes[s] ?? 'bg-slate-100 text-slate-500';
  }
}
