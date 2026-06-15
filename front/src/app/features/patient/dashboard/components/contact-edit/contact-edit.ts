import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-contact-edit',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contact-edit.html',
})
export class ContactEdit {

    formData = {
        nom: 'Mme. Aminata TOURE',
        relation: 'spouse',
        telephone: '+229 97 11 22 33',
        email: 'aminata.toure@email.bj',
        urgence: true,
    };

    patientId = 'DMN-2024-883';

    onSave(): void {
        // TODO: appeler ContactService.update()
    }
}
