import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { AuthService } from '../../../core/auth/auth-service';

@Component({
  selector: 'app-practitioner-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './practitioner-shell.html',
})
export class PractitionerShell {
  authStore = AuthStore;
  router = inject(Router);
  private authService = inject(AuthService);

  sidebarOpen = signal(false);
  isMobile = window.innerWidth < 1024;

  practitioner = computed(() => ({
    name: `Dr. ${this.authStore.user()?.identity?.firstName ?? ''} ${this.authStore.user()?.identity?.lastName ?? ''}`,
    specialty: this.authStore.user()?.practitioner?.speciality ?? 'Médecine Générale',
    rpps: String(this.authStore.user()?.practitioner?.orderNumber ?? ''),
    avatar: this.authStore.user()?.identity?.photoPath ?? '',
  }));

  navItems = [
    { route: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
    { route: 'patients', label: 'Mes patients', icon: 'group' },
    { route: 'consents', label: 'Consentements', icon: 'verified_user' },
    { route: 'organizations', label: 'Organisations', icon: 'apartment' },
  ];

  toggleSidebar() { this.sidebarOpen.update(v => !v); }

  navigateToDossier() {
    const npi = localStorage.getItem('selectedPatientNpi');
    if (npi) this.router.navigate(['/practitioner/patient', npi]);
    else this.router.navigate(['/practitioner/patients']);
  }

  onLogout() {
    this.authService.logout().catch(() => { });
    AuthStore.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  isVerified(): boolean {
    const s = this.authStore.user()?.statusAccount;
    return s === 'verified' || s === 'active';
  }
}
