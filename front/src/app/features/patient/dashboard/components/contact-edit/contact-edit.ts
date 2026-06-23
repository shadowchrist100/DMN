import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RelativeService } from '../../../services/relative.service';
import { RelativeUpdateReq, RelativeDTO } from '../../../services/medical.service';

@Component({
    selector: 'app-contact-edit',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contact-edit.html',
})
export class ContactEdit implements OnInit {

    private relativeService = inject(RelativeService);

    relativeId = input<string>('');

    saved = output<void>();
    cancelled = output<void>();

    saving = signal(false);
    loading = signal(true);
    error = signal<string | null>(null);

    isNew = signal(false);

    formData = {
        nom: '',
        relation: '',
        telephone: '',
        email: '',
        urgence: false,
    };

    ngOnInit(): void {
        const id = this.relativeId();
        if (!id) {
            this.isNew.set(true);
            this.loading.set(false);
            return;
        }
        this.relativeService.getAll().subscribe({
            next: (contacts) => {
                const c = contacts.find(x => x.relative.id === id);
                if (c) {
                    this.formData.nom = `${c.relative.first_name} ${c.relative.last_name}`;
                    this.formData.telephone = c.relative.phone;
                    this.formData.relation = c.code_relation;
                }
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Erreur lors du chargement du contact.');
                this.loading.set(false);
            },
        });
    }

    onSave(): void {
        const id = this.relativeId();

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

        const request = id
            ? this.relativeService.update(id, payload)
            : this.relativeService.create({
                first_name: payload.first_name || '',
                last_name: payload.last_name || '',
                phone: payload.phone || '',
                code_relation: payload.code_relation || '',
            });

        request.subscribe({
            next: () => {
                this.saving.set(false);
                this.saved.emit();
            },
            error: () => {
                this.error.set('Erreur lors de la sauvegarde du contact.');
                this.saving.set(false);
            },
        });
    }

    onCancel(): void {
        this.cancelled.emit();
    }
}
