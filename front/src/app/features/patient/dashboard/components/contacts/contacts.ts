import { Component, OnInit, inject, signal } from '@angular/core';
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

    loading = signal(true);
    contacts = signal<RelativeDTO[]>([]);

    formData: RelativeCreateReq = {
        first_name: '',
        last_name: '',
        phone: '',
        code_relation: '',
    };

    saving = signal(false);

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
            error: () => this.loading.set(false),
        });
    }

    onSubmit(): void {
        if (!this.formData.first_name || !this.formData.last_name || !this.formData.phone) return;

        this.saving.set(true);
        this.relativeService.create(this.formData).subscribe({
            next: (created) => {
                this.contacts.update(list => [...list, created]);
                this.formData = { first_name: '', last_name: '', phone: '', code_relation: '' };
                this.saving.set(false);
            },
            error: () => this.saving.set(false),
        });
    }

    deleteContact(id: string): void {
        this.relativeService.delete(id).subscribe({
            next: () => this.contacts.update(list => list.filter(c => c.relative.id !== id)),
        });
    }
}
