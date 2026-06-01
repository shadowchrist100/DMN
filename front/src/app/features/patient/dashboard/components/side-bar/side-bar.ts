import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-side-bar',
    imports: [],
    template: `
   
  `,
    templateUrl: './side-bar.html',
    styleUrl: './side-bar.css',
})
export class SideBar {
    @Input() currentRoute: string = '';
    @Output() navigation = new EventEmitter<string>();

    navItems = [
        { route: '/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
        { route: '/consentements', label: 'Consentement', icon: 'verified_user' }, // ✅ Prioritaire
        { route: '/audit', label: 'Journal d\'accès', icon: 'history_toggle_off' }, // ✅ Nouveau
        { route: '/dossiers', label: 'Dossiers Médicaux', icon: 'description' },
        { route: '/prescriptions', label: 'Prescriptions', icon: 'medication' },
        { route: '/analyses', label: 'Analyses', icon: 'biotech' },
    ];

    navigate(route: string) {
        this.navigation.emit(route);
    }

    createNewRecord() {
        // Create new record logic
    }
}
