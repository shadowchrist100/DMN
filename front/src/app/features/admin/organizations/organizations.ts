import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../../core/auth/auth.store';
import { AdminService, AdminOrganization, OrganizationPayload } from '../services/admin.service';

@Component({
  selector: 'app-admin-organizations',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './organizations.html',
  styleUrl: './organizations.css',
})
export class AdminOrganizations {
  authStore = AuthStore;
  router = inject(Router);
  adminService = inject(AdminService);

  organizations = signal<AdminOrganization[]>([]);
  loading = signal(true);
  actionLoading = signal<string | null>(null);

  showForm = signal(false);
  editOrg = signal<AdminOrganization | null>(null);
  formPayload = signal<OrganizationPayload>({ name: '', type: '', city: '', address: '', phone: '', email: '' });
  formLoading = signal(false);
  formError = signal('');

  deleteConfirm = signal<AdminOrganization | null>(null);

  canCreate = computed(() => this.authStore.hasRole(['admin', 'admin_medical', 'admin_organisation']));

  ngOnInit() {
    this.loadOrgs();
  }

  private async loadOrgs() {
    this.loading.set(true);
    try {
      const orgs = await this.adminService.getOrganizations();
      this.organizations.set(orgs);
    } catch (e) { console.error('load orgs failed', e); } finally {
      this.loading.set(false);
    }
  }

  openCreateForm() {
    this.editOrg.set(null);
    this.formPayload.set({ name: '', type: '', city: '', address: '', phone: '', email: '' });
    this.formError.set('');
    this.showForm.set(true);
  }

  openEditForm(org: AdminOrganization) {
    this.editOrg.set(org);
    this.formPayload.set({
      name: org.name,
      type: org.type,
      city: org.city,
      address: org.address,
      phone: org.phone ?? '',
      email: org.email ?? '',
    });
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editOrg.set(null);
    this.formError.set('');
  }

  updatePayload(key: keyof OrganizationPayload, value: any) {
    this.formPayload.update(p => ({ ...p, [key]: value }));
  }

  async onSubmit() {
    const payload = this.formPayload();
    if (!payload.name || !payload.type || !payload.city || !payload.address) {
      this.formError.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.formLoading.set(true);
    this.formError.set('');

    try {
      if (this.editOrg()) {
        await this.adminService.updateOrganization(this.editOrg()!.id, payload);
      } else {
        await this.adminService.createOrganization(payload);
      }
      await this.loadOrgs();
      this.closeForm();
    } catch (e) { console.error('save org failed', e); } finally {
      this.formLoading.set(false);
    }
  }

  openDeleteConfirm(org: AdminOrganization) {
    this.deleteConfirm.set(org);
  }

  closeDeleteConfirm() {
    this.deleteConfirm.set(null);
  }

  async onDelete() {
    const org = this.deleteConfirm();
    if (!org) return;
    this.actionLoading.set(org.id);
    try {
      await this.adminService.deleteOrganization(org.id);
      this.organizations.update(list => list.filter(o => o.id !== org.id));
      this.closeDeleteConfirm();
    } catch (e) { console.error('delete org failed', e); } finally {
      this.actionLoading.set(null);
    }
  }

  onLogout() {
    this.authStore.clearAuth();
    this.router.navigate(['/auth/login']);
  }
}
