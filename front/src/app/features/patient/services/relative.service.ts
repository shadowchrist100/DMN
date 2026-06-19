import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MedicalService, RelativeDTO, RelativeCreateReq, RelativeUpdateReq } from './medical.service';
import { AuthStore } from '../../../core/auth/auth.store';

@Injectable({ providedIn: 'root' })
export class RelativeService {

    private medical = inject(MedicalService);

    private get userId(): string {
        const uid = AuthStore.userId();
        if (!uid) throw new Error('Utilisateur non authentifié');
        return uid;
    }

    getAll(): Observable<RelativeDTO[]> {
        return this.medical.getRelatives(this.userId);
    }

    create(data: RelativeCreateReq): Observable<RelativeDTO> {
        return this.medical.createRelative(this.userId, data);
    }

    update(relativeId: string, data: RelativeUpdateReq): Observable<RelativeDTO> {
        return this.medical.updateRelative(this.userId, relativeId, data);
    }

    delete(relativeId: string): Observable<void> {
        return this.medical.deleteRelative(this.userId, relativeId);
    }
}
