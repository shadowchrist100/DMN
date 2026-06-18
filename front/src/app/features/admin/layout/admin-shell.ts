import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.html',
})
export class AdminShell implements OnInit {
  authStore = AuthStore;
  router = inject(Router);
  adminService = inject(AdminService);

  sidebarOpen = signal(false);
  isMobile = window.innerWidth < 1024;
  pendingUsersCount = signal(0);
  pendingOrgsCount  = signal(0);

  navItems = computed(() => {
    const role = this.authStore.userRole();
    const items: { key: string; label: string; icon: string }[] = [
      { key: 'dashboard',    label: 'Tableau de bord',          icon: 'dashboard' },
    ];
    if (role === 'admin' || role === 'admin_medical') {
      items.push(
        { key: 'pending-users',          label: 'Utilisateurs en attente',    icon: 'person_off' },
        { key: 'pending-organizations',  label: 'Organisations en attente',   icon: 'domain_disabled' },
      );
    }
    if (role === 'admin' || role === 'admin_medical' || role === 'admin_organisation') {
      items.push({ key: 'organizations', label: 'Organisations', icon: 'apartment' });
    }
    return items;
  });

  ngOnInit() {
    this.loadBadgeCounts();
  }

  private async loadBadgeCounts() {
    try {
      const [pu, po] = await Promise.all([
        this.adminService.getPendingUsers().catch(() => []),
        this.adminService.getPendingOrganizations().catch(() => []),
      ]);
      this.pendingUsersCount.set(pu.length);
      this.pendingOrgsCount.set(po.length);
    } catch { /* silencieux */ }
  }

  toggleSidebar() { this.sidebarOpen.update(v => !v); }

  onLogout() {
    AuthStore.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  getBadge(key: string): number {
    if (key === 'pending-users')         return this.pendingUsersCount();
    if (key === 'pending-organizations') return this.pendingOrgsCount();
    return 0;
  }
}
