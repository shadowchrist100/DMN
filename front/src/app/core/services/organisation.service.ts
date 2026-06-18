import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AvailableOrganization } from '../models/user.model';
import { API } from '../config/api.config';
import { lastValueFrom } from 'rxjs';

interface OrganizationDTO {
  id: string;
  name: string;
  type: string;
  city: string;
  address: string;
  phone: string | null;
  email: string | null;
}

@Injectable({ providedIn: 'root' })
export class OrganisationService {
  private http = inject(HttpClient);

  getAvailableOrganizations(): Promise<AvailableOrganization[]> {
    return lastValueFrom(
      this.http.get<OrganizationDTO[]>(`${API.MEDICAL_BASE_URL}/organizations`)
    ).then(orgs =>
      orgs.map(org => ({
        id: org.id,
        name: org.name,
        type: org.type,
        city: org.city,
        department: org.city,
      }))
    );
  }
}
