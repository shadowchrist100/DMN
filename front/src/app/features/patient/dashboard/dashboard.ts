import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SideBar } from "./components/side-bar/side-bar";

interface MedicalAlert {
    id: string;
    title: string;
    message: string;
    type: 'medication' | 'vaccination' | 'appointment' | 'lab_result' | 'consent' | 'emergency' | 'reminder';
    priority: 'critical' | 'high' | 'medium' | 'low';
    date: Date;
    dueDate?: Date;
    source?: string; // Établissement source
    actionLabel?: string;
    actionType?: 'view_results' | 'schedule_appointment' | 'renew_prescription' | 'update_consent' | 'view_details';
    referenceId?: string; // ID vers la ressource liée
    dismissed: boolean;
    read: boolean;
}

interface AuditLog {
    id: string,
    type: 'emergency' | 'normal',
    practitioner: string,
    facility: string,
    timestamp: Date,
    purpose: string,
}


@Component({
    selector: 'app-dashboard',
    imports: [DatePipe, SideBar],
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
    userRole: 'patient' | 'practitioner' = 'patient';
    currentRoute = '/dashboard';


    // Compteurs
    unreadCount = 2;
    alertCount = 0;
    activeAlertsCount = 0;
    hasCriticalAlerts = false;
    criticalAlertMessage = '';

    // Données métier
    visitCount = 8;
    lastLabUpdate = 'Hier';
    activePrescriptions = 1;
    allAlerts: MedicalAlert[] = [];
    filteredAlerts: MedicalAlert[] = [];
    recentAccesses: AuditLog[] = [];

    // Filtres alertes
    alertFilter: 'all' | 'critical' | 'reminder' = 'all';

    private routeSub!: Subscription;
    private auditSub!: Subscription;

    private router = inject(Router);

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

    private loadMedicalAlerts(): void {
        // this.alertsSub = this.alertService.getPatientAlerts()
        //     .subscribe({
        //         next: (alerts) => {
        //             this.allAlerts = alerts;
        //             this.alertCount = alerts.filter(a => !a.dismissed).length;
        //             this.activeAlertsCount = alerts.filter(a => !a.dismissed && a.priority !== 'low').length;

        //             // Vérifier alertes critiques
        //             const critical = alerts.find(a => a.priority === 'critical' && !a.dismissed);
        //             if (critical) {
        //                 this.hasCriticalAlerts = true;
        //                 this.criticalAlertMessage = critical.message;
        //             }

        //             this.applyAlertFilter();
        //         },
        //         error: (err) => console.error('Erreur alertes:', err)
        //     });
    }
    // ===== FILTRES ALERTES =====
    filterAlerts(filter: 'all' | 'critical' | 'reminder'): void {
        this.alertFilter = filter;
        this.applyAlertFilter();
    }

    private applyAlertFilter(): void {
        let filtered = this.allAlerts.filter(a => !a.dismissed);

        if (this.alertFilter === 'critical') {
            filtered = filtered.filter(a => a.priority === 'critical' || a.priority === 'high');
        } else if (this.alertFilter === 'reminder') {
            filtered = filtered.filter(a => a.priority === 'medium' || a.priority === 'low');
        }

        // Trier par priorité puis par date
        this.filteredAlerts = filtered.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }



    getAlertIcon(type: string): string {
        const icons: Record<string, string> = {
            'medication': 'medication',
            'vaccination': 'vaccines',
            'appointment': 'event',
            'lab_result': 'lab_research',
            'consent': 'verified_user',
            'emergency': 'warning',
            'reminder': 'reminder'
        };
        return icons[type] || 'notifications';
    }

    // ===== GESTION NAVIGATION =====
    onNavigate(route: string): void {
        if (this.isMobile) {
            // Fermer tout menu mobile ouvert
            this.profileMenuOpen = false;
        }
        // this.router.navigate([route]);
    }

    toggleMobileMenu(): void {
        // this.navService.toggleMobileSidebar();
    }

    // ===== ACTIONS UTILISATEUR =====
    toggleProfileMenu(): void {
        this.profileMenuOpen = !this.profileMenuOpen;
    }

    onLogout(): void {
        // this.userService.logout();
        // this.router.navigate(['/login']);
    }

    openConsentementModal(): void {
        // this.router.navigate(['/consentements']);
    }

    async downloadMedicalRecord(): Promise<void> {
        // if (this.isDownloading) return;

        // this.isDownloading = true;

        // try {
        //     // Afficher notification de progression
        //     this.alertService.showInfo('Préparation de votre dossier...');

        //     // Appel au service de téléchargement
        //     const blob = await this.downloadService.generateFullMedicalRecord().toPromise();

        //     // Créer le lien de téléchargement
        //     const url = window.URL.createObjectURL(blob);
        //     const a = document.createElement('a');
        //     a.href = url;
        //     a.download = `DMN_Dossier_${this.userName}_${new Date().toISOString().split('T')[0]}.pdf`;
        //     document.body.appendChild(a);
        //     a.click();
        //     document.body.removeChild(a);
        //     window.URL.revokeObjectURL(url);

        //     // Notification de succès
        //     this.alertService.showSuccess('✅ Dossier téléchargé avec succès');

        //     // Logger l'action pour l'audit
        //     this.auditService.logPatientAction('download_medical_record', {
        //         format: 'pdf',
        //         timestamp: new Date().toISOString()
        //     });

        // } catch (error) {
        //     console.error('Erreur téléchargement:', error);
        //     this.alertService.showError('❌ Erreur lors du téléchargement. Veuillez réessayer.');
        // } finally {
        //     this.isDownloading = false;
        // }
    }

    onSearchWithinDossier(event: Event): void {
        // const query = (event.target as HTMLInputElement).value;
        // if (query.length >= 2) {
        //     this.router.navigate(['/recherche'], {
        //         queryParams: { q: query, scope: 'mon-dossier' }
        //     });
        // }
    }

    // ===== GESTION ALERTES =====
    openAlertsPanel(): void {
        this.router.navigate(['/alertes']);
    }

    handleAlertAction(alert: MedicalAlert): void {
        //     switch (alert.actionType) {
        //         case 'view_results':
        //             this.router.navigate(['/analyses', alert.referenceId]);
        //             break;
        //         case 'schedule_appointment':
        //             this.router.navigate(['/rdv', 'new'], { queryParams: { reason: alert.referenceId } });
        //             break;
        //         case 'renew_prescription':
        //             this.router.navigate(['/prescriptions', 'renew', alert.referenceId]);
        //             break;
        //         case 'update_consent':
        //             this.router.navigate(['/consentements']);
        //             break;
        //         case 'view_details':
        //             this.router.navigate(['/alertes', alert.id]);
        //             break;
        //         default:
        //             console.warn('Action non gérée:', alert.actionType);
        //     }
        //     // Marquer comme lue
        //     this.alertService.markAsRead(alert.id);
    }

    dismissAlert(alertId: string): void {
        // if (confirm('Ignorer cette alerte ? Vous pourrez la retrouver dans l\'historique.')) {
        //     this.alertService.dismissAlert(alertId).subscribe({
        //         next: () => {
        //             this.loadMedicalAlerts(); // Rafraîchir la liste
        //         },
        //         error: (err) => console.error('Erreur dismissal:', err)
        //     });
        // }
    }

    resolveCriticalAlert(): void {
        // const critical = this.allAlerts.find(a => a.priority === 'critical' && !a.dismissed);
        // if (critical) {
        //     this.handleAlertAction(critical);
        // }
    }




    // ===== GESTION AUDIT & SÉCURITÉ =====
    reportEmergencyAccess(accessId: string): void {
        // if (confirm('⚠️ Signaler cet accès d\'urgence comme abusif ?\n\nUn membre de l\'équipe conformité APDP vous contactera sous 24h.')) {
        //     this.auditService.reportSuspiciousAccess(accessId, 'patient_report')
        //         .subscribe({
        //             next: () => {
        //                 alert('✅ Signalement envoyé. Référence: #' + Math.random().toString(36).substr(2, 8).toUpperCase());
        //             },
        //             error: () => {
        //                 alert('❌ Erreur lors de l\'envoi. Veuillez réessayer ou contacter le support.');
        //             }
        //         });
        // }
    }



    // ===== AUTRES ACTIONS =====
    openNotifications(): void {
        // this.router.navigate(['/notifications']);
    }

    openHelp(): void {
        window.open('https://dmn.benin/help', '_blank');
    }

    openSettings(): void {
        // this.router.navigate(['/parametres']);
    }

    editAppointment(): void {
        // this.router.navigate(['/rdv', 'edit'], { queryParams: { next: '2023-10-24' } });
    }

    viewPrescription(): void {
        // this.router.navigate(['/prescriptions', 'latest']);
    }


}
