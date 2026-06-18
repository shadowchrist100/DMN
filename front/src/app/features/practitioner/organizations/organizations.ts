import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { AuthService } from '../../../core/auth/auth-service';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col flex-1 min-h-screen">

      <!-- Header -->
      <header class="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm
                     px-6 py-4 hidden lg:flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-secondary text-lg">apartment</span>
          <h2 class="font-black text-[#002B5C] text-base uppercase tracking-wide">Organisations</h2>
        </div>
        <p class="text-sm text-slate-500">
          {{ authStore.user()?.identity?.firstName }} {{ authStore.user()?.identity?.lastName }}
        </p>
      </header>

      <!-- Content -->
      <div class="flex-1 p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">

        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide">
          <a routerLink="/practitioner/dashboard" class="hover:text-[#002B5C] font-medium transition-colors">Dashboard</a>
          <span class="material-symbols-outlined text-[12px] text-slate-300">chevron_right</span>
          <span class="text-[#002B5C] font-bold">Organisations</span>
        </nav>

        <div>
          <h1 class="text-2xl font-black text-[#002B5C] mb-1">Mes Organisations</h1>
          <p class="text-slate-500 text-sm">Gérez vos établissements de santé et affiliations.</p>
        </div>

        <!-- Stats rapides -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-blue-600">apartment</span>
            </div>
            <div>
              <p class="text-2xl font-black text-[#002B5C]">—</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Établissements</p>
            </div>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-green-600">local_hospital</span>
            </div>
            <div>
              <p class="text-2xl font-black text-[#002B5C]">—</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hôpitaux</p>
            </div>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-indigo-600">clinic_medical</span>
            </div>
            <div>
              <p class="text-2xl font-black text-[#002B5C]">—</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Cliniques</p>
            </div>
          </div>
        </div>

        <!-- Placeholder module -->
        <div class="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <span class="material-symbols-outlined text-6xl text-slate-200 mb-4 block"
                style="font-variation-settings:'FILL' 1">apartment</span>
          <h3 class="text-lg font-bold text-slate-700 mb-2">Module des organisations</h3>
          <p class="text-sm text-slate-400 max-w-sm mx-auto">
            Vos établissements de santé et affiliations s'afficheront ici.
          </p>
          <button routerLink="/practitioner/dashboard"
                  class="mt-6 inline-flex items-center gap-2 bg-[#002B5C] text-white
                         px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#001f42] transition-colors">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Retour au tableau de bord
          </button>
        </div>

      </div>
    </div>
  `,
})
export class Organizations {
  protected authStore = AuthStore;
  private router = inject(Router);
  private authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout().catch(() => {});
    AuthStore.clearAuth();
    this.router.navigate(['/auth/login']);
  }
}
