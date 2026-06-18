import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../../core/auth/auth.store';
import { AdminService, AdminUser } from '../services/admin.service';
import { API } from '../../../core/config/api.config';

@Component({
  selector: 'app-admin-pending-users',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pending-users.html',
  styleUrl: './pending-users.css',
})
export class AdminPendingUsers {
  authStore = AuthStore;
  router = inject(Router);
  adminService = inject(AdminService);
  http = inject(HttpClient);

  users = signal<AdminUser[]>([]);
  loading = signal(true);
  roleFilter = signal<string>('');

  verifyLoading = signal<string | null>(null);
  reviewUser = signal<AdminUser | null>(null);
  rejectModal = signal<{ user: AdminUser } | null>(null);
  rejectReason = signal('');

  ngOnInit() {
    this.loadUsers();
  }

  private async loadUsers() {
    this.loading.set(true);
    try {
      const users = await this.adminService.getPendingUsers(this.roleFilter() || undefined);
      this.users.set(users);
    } catch (e) { console.error('load pending users failed', e); } finally {
      this.loading.set(false);
    }
  }

  filterByRole(role: string) {
    this.roleFilter.set(role.toUpperCase());
    this.loadUsers();
  }

  openReview(user: AdminUser) {
    this.reviewUser.set(user);
  }

  closeReview() {
    this.reviewUser.set(null);
  }

  async downloadDocument(userId: string, docId: number) {
    const token = AuthStore.token();
    if (!token) return;
    try {
      const blob = await firstValueFrom(
        this.http.get(`${API.AUTH_BASE_URL}/documents/${docId}/download`, {
          responseType: 'blob',
        })
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${docId}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('download failed', e);
    }
  }

  docLabel(type: string): string {
    const labels: Record<string, string> = {
      piece_identite: "Pièce d'identité",
      diplome: 'Diplôme',
      carte_ordre: "Carte de l'Ordre",
    };
    return labels[type] || type;
  }

  async onVerify(user: AdminUser) {
    this.verifyLoading.set(user.id);
    try {
      await this.adminService.verifyUser(user.id, { status: 'verified' });
      this.users.update(list => list.filter(u => u.id !== user.id));
      this.closeReview();
    } catch (e) { console.error('verify user failed', e); } finally {
      this.verifyLoading.set(null);
    }
  }

  openRejectModal(user: AdminUser) {
    this.rejectModal.set({ user });
    this.rejectReason.set('');
    this.closeReview();
  }

  closeRejectModal() {
    this.rejectModal.set(null);
    this.rejectReason.set('');
  }

  async onReject() {
    const modal = this.rejectModal();
    if (!modal) return;
    this.verifyLoading.set(modal.user.id);
    try {
      await this.adminService.verifyUser(modal.user.id, {
        status: 'rejected',
        rejection_reason: this.rejectReason() || undefined,
      });
      this.users.update(list => list.filter(u => u.id !== modal.user.id));
      this.closeRejectModal();
    } catch (e) { console.error('reject user failed', e); } finally {
      this.verifyLoading.set(null);
    }
  }

  onLogout() {
    this.authStore.clearAuth();
    this.router.navigate(['/auth/login']);
  }
}
