import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-legal-cookies',
    standalone: true,
    templateUrl: './cookies.html',
})
export class CookiesPage {
    private location = inject(Location);
    goBack() { this.location.back(); }
}
