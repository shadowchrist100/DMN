import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DashboardComponent } from "./components/dashboardComponent/dashboardComponent";
import {  TimeLinesComponent } from "./components/time-lines/time-lines";
import { Prescriptions } from "./components/prescriptions/prescriptions";
import { Consentements } from "./components/consentements/consentements";
import { Allergies } from "../dashboard/components/allergies/allergies";
import { Examens } from "./components/examens/examens";

@Component({
    selector: 'app-dashboard',
    imports: [DashboardComponent, TimeLinesComponent, Prescriptions, Consentements, Allergies, Examens],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
    // État UI
    isMobile = window.innerWidth < 1024;
    profileMenuOpen = false;
    loadingAudit = true;
    isDownloading = false;

    // Données utilisateur
    userName = '';
    userAvatar = '';


    // Compteurs
    alertCount = 0;

    private routeSub!: Subscription;
    private auditSub!: Subscription;

    private router = inject(Router);

    view = signal<String>('dashboard');

    constructor(
        // private router: Router,
        // private navService: NavigationService,
        // private auditService: AuditService,
        // private userService: UserService
    ) { }

    ngOnInit(): void {
        // Charger le profil utilisateur
        this.loadUserProfile();

        // Charger le journal d'accès
        this.loadAuditLog();

        // Suivre les changements de route pour mettre à jour l'état actif
        // this.routeSub = this.router.events
        //     .pipe(filter(event => event instanceof NavigationEnd))
        //     .subscribe((event: NavigationEnd) => {
        //         this.currentRoute = event.urlAfterRedirects.split('?')[0];
        //         this.profileMenuOpen = false; // Fermer le menu profil après navigation
        //     });

        // Gestion responsive
        this.checkScreenSize();
    }

    ngOnDestroy(): void {
        this.routeSub?.unsubscribe();
        this.auditSub?.unsubscribe();
    }

    // @HostListener('window:resize', ['$event'])
    // onResize(): void {
    //     this.checkScreenSize();
    // }

    private checkScreenSize(): void {
        this.isMobile = window.innerWidth < 1024;
    }

    private loadUserProfile(): void {
        // const user: UserProfile = this.userService.getCurrentUser();
        // this.userName = user.firstName;
        // this.userAvatar = user.avatarUrl || 'assets/images/default-avatar.png';
        // this.userRole = user.role;
    }

    private loadAuditLog(): void {
        this.loadingAudit = true;
        // this.auditSub = this.auditService.getRecentAccesses(5)
        //     .subscribe({
        //         next: (logs) => {
        //             this.recentAccesses = logs;
        //             this.loadingAudit = false;
        //         },
        //         error: (err) => {
        //             console.error('Erreur chargement audit:', err);
        //             this.loadingAudit = false;
        //             // Fallback: afficher message d'erreur dans la vue
        //         }
        //     });
    }


    openSettings(): void {
        // this.router.navigate(['/parametres']);
    }
    
    onSearchWithinDossier(event: Event): void {
        // const query = (event.target as HTMLInputElement).value;
        // if (query.length >= 2) {
        //     this.router.navigate(['/recherche'], {
        //         queryParams: { q: query, scope: 'mon-dossier' }
        //     });
        // }
    }

    toggleView(view: String){
        this.view.set(view);
    }

    // ===== ACTIONS UTILISATEUR =====
    toggleProfileMenu(): void {
        this.profileMenuOpen = !this.profileMenuOpen;
    }

    onLogout(): void {
        // this.userService.logout();
        // this.router.navigate(['/login']);
    }

    // ===== GESTION ALERTES =====
    openAlertsPanel(): void {
        this.router.navigate(['/alertes']);
    }

    // ===== AUTRES ACTIONS =====
    openNotifications(): void {
        // this.router.navigate(['/notifications']);
    }

    openHelp(): void {
        window.open('https://dmn.benin/help', '_blank');
    }

}
