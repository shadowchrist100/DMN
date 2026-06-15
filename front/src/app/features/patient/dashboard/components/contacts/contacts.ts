import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-contacts',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contacts.html',
})
export class Contacts {

    formData = {
        nom: '',
        relation: '',
        telephone: '',
        email: '',
        urgence: false,
    };

    patientId = 'DMN-2024-883';

    onSubmit(): void {
        // TODO: appeler ContactService.create()
    }
}
