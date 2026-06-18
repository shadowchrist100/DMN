import { Component, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RelativeService } from '../../../services/relative.service';
import { RelativeUpdateReq } from '../../../services/medical.service';

@Component({
    selector: 'app-contact-edit',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contact-edit.html',
})
export class ContactEdit {

    private relativeService = inject(RelativeService);

    relativeId = input<string>('');

    saving = signal(false);

    formData = {
        nom: '',
        relation: '',
        telephone: '',
        email: '',
        urgence: false,
    };

    onSave(): void {
        const id = this.relativeId();
        if (!id) return;

        this.saving.set(true);
        const payload: RelativeUpdateReq = {};
        if (this.formData.nom) {
            const parts = this.formData.nom.split(' ');
            if (parts.length >= 2) {
                payload.last_name = parts.slice(1).join(' ');
                payload.first_name = parts[0];
            } else {
                payload.last_name = this.formData.nom;
            }
        }
        if (this.formData.telephone) payload.phone = this.formData.telephone;
        if (this.formData.email) payload.email = this.formData.email;
        if (this.formData.relation) payload.code_relation = this.formData.relation;
        payload.emergency_contact = this.formData.urgence;

        this.relativeService.update(id, payload).subscribe({
            next: () => this.saving.set(false),
            error: () => this.saving.set(false),
        });
    }
}
