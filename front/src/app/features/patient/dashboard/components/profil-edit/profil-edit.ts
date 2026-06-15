import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-profil-edit',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profil-edit.html',
})
export class ProfilEdit {

    formData = {
        nom: 'SOGLO',
        prenoms: 'Koffi Armand',
        dateNaissance: '1985-05-14',
        sexe: 'M',
        civil: 'marie',
        naissanceMultiple: false,
        adresse: 'Carré 402, Lot 12-A, Quartier Haie Vive, Cotonou, Littoral, Bénin',
    };

    npi = '1029384756';

    onSave(): void {
        // TODO: appeler PatientService.update()
    }
}
