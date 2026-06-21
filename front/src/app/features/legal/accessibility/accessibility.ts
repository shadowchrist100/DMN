import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-legal-accessibility',
    standalone: true,
    templateUrl: './accessibility.html',
})
export class AccessibilityPage {
    private location = inject(Location);
    goBack() { this.location.back(); }
}
