import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-legal-privacy',
    standalone: true,
    templateUrl: './privacy.html',
})
export class PrivacyPage {
    private location = inject(Location);
    goBack() { this.location.back(); }
}
