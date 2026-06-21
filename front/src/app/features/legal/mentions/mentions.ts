import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-legal-mentions',
    standalone: true,
    templateUrl: './mentions.html',
})
export class MentionsPage {
    private location = inject(Location);
    goBack() { this.location.back(); }
}
