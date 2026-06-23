import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API } from '../../core/config/api.config';

@Component({
    selector: 'app-urgence-validation',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        @if (loading()) {
          <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-slate-600">Vérification de votre code...</p>
          </div>
        } @else if (success()) {
          <span class="material-symbols-outlined text-6xl text-green-500 mb-4">check_circle</span>
          <h1 class="text-2xl font-bold text-green-700 mb-2">Accès autorisé</h1>
          <p class="text-slate-600 mb-6">{{ successMessage() }}</p>
          <p class="text-sm text-slate-400">Vous pouvez fermer cette page.</p>
        } @else if (error()) {
          <span class="material-symbols-outlined text-6xl text-red-400 mb-4">error_outline</span>
          <h1 class="text-2xl font-bold text-red-600 mb-2">Échec de l'autorisation</h1>
          <p class="text-slate-600 mb-6">{{ errorMessage() }}</p>
          <button (click)="router.navigate(['/'])"
            class="px-6 py-2.5 bg-secondary text-white rounded-lg font-bold hover:bg-[#001f45] transition-colors">
            Retour à l'accueil
          </button>
        }
      </div>
    </div>
    `,
})
export class UrgenceValidation implements OnInit {
    private route = inject(ActivatedRoute);
    private http = inject(HttpClient);
    router = inject(Router);

    loading = signal(true);
    success = signal(false);
    error = signal(false);
    successMessage = signal('');
    errorMessage = signal('');

    ngOnInit(): void {
        const token = this.route.snapshot.queryParamMap.get('token');
        const code = this.route.snapshot.queryParamMap.get('code');

        if (!token || !code) {
            this.loading.set(false);
            this.error.set(true);
            this.errorMessage.set('Lien invalide : token ou code manquant.');
            return;
        }

        this.validateUrgence(token, code);
    }

    private async validateUrgence(token: string, code: string): Promise<void> {
        try {
            const res = await firstValueFrom(
                this.http.post<{ status: string; message: string }>(
                    `${API.AUTH_BASE_URL}/urgence/approuver`,
                    { token, code }
                )
            );
            this.loading.set(false);
            this.success.set(true);
            this.successMessage.set(res.message || 'Le praticien peut maintenant accéder au dossier médical.');
        } catch (e: any) {
            this.loading.set(false);
            this.error.set(true);
            this.errorMessage.set(
                e?.error?.error || e?.error?.detail || 'Erreur lors de la validation. Le lien est peut-être expiré ou déjà utilisé.'
            );
        }
    }
}
