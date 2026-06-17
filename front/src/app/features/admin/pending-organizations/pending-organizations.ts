import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../core/auth/auth.store';
import { AdminService, AdminOrganization } from '../services/admin.service';

@Component({
  selector: 'app-admin-pending-organizations',
  imports: [CommonModule, RouterLink],
  templateUrl: './pending-organizations.html',
  styleUrl: './pending-organizations.css',
})
export class AdminPendingOrganizations {
  authStore = AuthStore;
  router = inject(Router);
  adminService = inject(AdminService);

  organizations = signal<AdminOrganization[]>([]);
  loading = signal(true);
  actionLoading = signal<string | null>(null);

  ngOnInit() {
    this.loadOrgs();
  }

  private async loadOrgs() {
    this.loading.set(true);
    try {
      const orgs = await this.adminService.getPendingOrganizations();
      this.organizations.set(orgs);
    } catch (e) { console.error('load pending orgs failed', e); } finally {
      this.loading.set(false);
    }
  }

  async onValidate(org: AdminOrganization) {
    this.actionLoading.set(org.id);
    try {
      await this.adminService.validateOrganization(org.id, { status: 'active' });
      this.organizations.update(list => list.filter(o => o.id !== org.id));
    } catch (e) { console.error('validate org failed', e); } finally {
      this.actionLoading.set(null);
    }
  }

  async onSuspend(org: AdminOrganization) {
    this.actionLoading.set(org.id);
    try {
      await this.adminService.validateOrganization(org.id, { status: 'suspended' });
      this.organizations.update(list => list.filter(o => o.id !== org.id));
    } catch (e) { console.error('suspend org failed', e); } finally {
      this.actionLoading.set(null);
    }
  }

  onLogout() {
    this.authStore.clearAuth();
    this.router.navigate(['/auth/login']);
  }
}
