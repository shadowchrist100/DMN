import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API } from '../../../core/config/api.config';

export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  gender: string;
  phone: string;
  city: string;
  address: string;
  birth_date: string;
  photo_path: string | null;
  npi: string;
  status_account: string;
  created_at: string;
  identity_documents?: { id: number; type_document: string; file_name: string }[];
}

export interface AdminOrganization {
  id: string;
  name: string;
  type: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  verification_status: string;
  is_actif: boolean;
  created_by?: string;
  validated_by?: string;
  validated_at?: string;
  created_at?: string;
}

export interface OrganizationPayload {
  name: string;
  type: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
}

export interface VerifyPayload {
  status: 'verified' | 'rejected';
  rejection_reason?: string;
}

export interface ValidateOrgPayload {
  status: 'active' | 'suspended';
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  async getPendingUsers(role?: string): Promise<AdminUser[]> {
    const params: Record<string, string> = {};
    if (role) params['role'] = role;
    const res = await firstValueFrom(
      this.http.get<{ users: AdminUser[] }>(`${API.AUTH_BASE_URL}/admin/pending-users`, { params })
    );
    return res.users;
  }

  async verifyUser(userId: string, payload: VerifyPayload): Promise<void> {
    await firstValueFrom(
      this.http.post(`${API.AUTH_BASE_URL}/users/${userId}/verify`, payload)
    );
  }

  async getPendingOrganizations(): Promise<AdminOrganization[]> {
    const res = await firstValueFrom(
      this.http.get<AdminOrganization[] | { organizations: AdminOrganization[] }>(
        `${API.AUTH_BASE_URL}/admin/pending-organizations`
      )
    );
    if (Array.isArray(res)) return res;
    return (res as { organizations: AdminOrganization[] }).organizations ?? [];
  }

  async validateOrganization(orgId: string, payload: ValidateOrgPayload): Promise<void> {
    await firstValueFrom(
      this.http.post(`${API.AUTH_BASE_URL}/admin/validate-organization/${orgId}`, payload)
    );
  }

  async getOrganizations(status?: string): Promise<AdminOrganization[]> {
    const params: Record<string, string> = {};
    if (status) params['status'] = status;
    const res = await firstValueFrom(
      this.http.get<AdminOrganization[] | { organizations: AdminOrganization[] }>(
        `${API.AUTH_BASE_URL}/admin/organizations`,
        { params }
      )
    );
    if (Array.isArray(res)) return res;
    return (res as { organizations: AdminOrganization[] }).organizations ?? [];
  }

  async createOrganization(payload: OrganizationPayload): Promise<AdminOrganization> {
    const res = await firstValueFrom(
      this.http.post<AdminOrganization>(`${API.AUTH_BASE_URL}/organizations`, payload)
    );
    return res;
  }

  async updateOrganization(orgId: string, payload: Partial<OrganizationPayload>): Promise<AdminOrganization> {
    const res = await firstValueFrom(
      this.http.put<AdminOrganization>(`${API.AUTH_BASE_URL}/organizations/${orgId}`, payload)
    );
    return res;
  }

  async deleteOrganization(orgId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${API.AUTH_BASE_URL}/organizations/${orgId}`)
    );
  }
}
