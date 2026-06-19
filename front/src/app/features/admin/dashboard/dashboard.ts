import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class AdminDashboard {
  authStore = AuthStore;
  router = inject(Router);
  adminService = inject(AdminService);

  pendingUsersCount = signal(0);
  pendingOrgsCount  = signal(0);
  totalOrgsCount    = signal(0);
  loading           = signal(true);

  ngOnInit() {
    this.loadStats();
  }

  private async loadStats() {
    try {
      const [pendingUsers, pendingOrgs, allOrgs] = await Promise.all([
        this.adminService.getPendingUsers().catch(() => []),
        this.adminService.getPendingOrganizations().catch(() => []),
        this.adminService.getOrganizations().catch(() => []),
      ]);
      this.pendingUsersCount.set(pendingUsers.length);
      this.pendingOrgsCount.set(pendingOrgs.length);
      this.totalOrgsCount.set(allOrgs.length);
    } catch (e) {
      console.error('load stats failed', e);
    } finally {
      this.loading.set(false);
    }
  }

  currentYear = new Date().getFullYear();
}
