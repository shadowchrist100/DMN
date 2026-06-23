import { Component, OnInit, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RelativeService } from '../../../services/relative.service';
import { RelativeDTO, RelativeCreateReq } from '../../../services/medical.service';

@Component({
    selector: 'app-contacts',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contacts.html',
})
export class Contacts implements OnInit {

    private relativeService = inject(RelativeService);

    saved = output<void>();
    cancelled = output<void>();

    loading = signal(true);
    contacts = signal<RelativeDTO[]>([]);
    saving = signal(false);
    isUrgence = signal(false);
    error = signal<string | null>(null);

    formData = {
        first_name: '',
        last_name: '',
        phone: '',
        code_relation: '',
    };

    ngOnInit(): void {
        this.loadContacts();
    }

    private loadContacts(): void {
        this.loading.set(true);
        this.relativeService.getAll().subscribe({
            next: (data) => {
                this.contacts.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Erreur lors du chargement des contacts.');
                this.loading.set(false);
            },
        });
    }

    onSubmit(): void {
        if (!this.formData.first_name || !this.formData.last_name || !this.formData.phone) return;

        this.saving.set(true);
        const payload: RelativeCreateReq = {
            first_name: this.formData.first_name,
            last_name: this.formData.last_name,
            phone: this.formData.phone,
            code_relation: this.formData.code_relation,
        };
        this.relativeService.create(payload).subscribe({
            next: (created) => {
                this.contacts.update(list => [...list, created]);
                this.formData = { first_name: '', last_name: '', phone: '', code_relation: '' };
                this.isUrgence.set(false);
                this.saving.set(false);
                this.saved.emit();
            },
            error: () => {
                this.error.set('Erreur lors de la création du contact.');
                this.saving.set(false);
            },
        });
    }

    onCancel(): void {
        this.cancelled.emit();
    }

    deleteContact(id: string): void {
        this.relativeService.delete(id).subscribe({
            next: () => this.contacts.update(list => list.filter(c => c.relative.id !== id)),
        });
    }
}
