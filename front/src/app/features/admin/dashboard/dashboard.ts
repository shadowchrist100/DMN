import { Component, computed, inject, signal } from '@angular/core';
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

  sidebarOpen = signal(false);
  pendingUsersCount = signal(0);
  pendingOrgsCount = signal(0);
  totalOrgsCount = signal(0);
  loading = signal(true);

  isMobile = false;

  navItems = computed(() => {
    const role = this.authStore.userRole();
    const base = [
      { key: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
    ];

    if (role === 'admin' || role === 'admin_medical') {
      base.push(
        { key: 'pending-users', label: 'Utilisateurs en attente', icon: 'person_off' },
        { key: 'pending-organizations', label: 'Organisations en attente', icon: 'domain_disabled' },
      );
    }

    if (role === 'admin' || role === 'admin_medical' || role === 'admin_organisation') {
      base.push(
        { key: 'organizations', label: 'Organisations', icon: 'apartment' },
      );
    }

    return base;
  });

  ngOnInit() {
    this.checkScreenSize();
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
    } catch (e) { console.error('load stats failed', e); } finally {
      this.loading.set(false);
    }
  }

  onLogout() {
    this.authStore.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  toggleSidebar() { this.sidebarOpen.update(v => !v); }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 1024;
  }
}
