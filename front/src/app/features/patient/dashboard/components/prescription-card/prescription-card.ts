// import { Component, input, output } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Prescription, PrescriptionStatus } from '../prescriptions/prescription.model';

// @Component({
//     selector: 'app-prescription-card',
//     imports: [CommonModule],
//     templateUrl: './prescription-card.html',
//     styleUrl: './prescription-card.css',
// })
// export class PrescriptionCard {
//     prescription = input.required<Prescription>();

//     viewDetails = output<string>();
//     renew = output<string>();
//     suspend = output<string>();
//     diagnosisClick = output<string>();
//     visitClick = output<string>();

//     onViewDetails(): void {
//         this.viewDetails.emit(this.prescription().id);
//     }

//     onRenew(event: Event): void {
//         event.stopPropagation();
//         this.renew.emit(this.prescription().id);
//     }

//     onSuspend(event: Event): void {
//         event.stopPropagation();
//         this.suspend.emit(this.prescription().id);
//     }

//     onDownload(event: Event): void {
//         event.stopPropagation();
//         // TODO: Télécharger le PDF de l'ordonnance
//         console.log('Download prescription:', this.prescription().id);
//     }

//     onDiagnosisClick(code: string, event: Event): void {
//         event.stopPropagation();
//         this.diagnosisClick.emit(code);
//     }

//     onVisitClick(visitId: string, event: Event): void {
//         event.stopPropagation();
//         this.visitClick.emit(visitId);
//     }

//     getStatusLabel(status: PrescriptionStatus): string {
//         const labels: Record<PrescriptionStatus, string> = {
//             active: 'Active',
//             suspended: 'Suspendue',
//             completed: 'Terminée',
//             cancelled: 'Annulée',
//             expired: 'Expirée'
//         };
//         return labels[status];
//     }

//     getStatusBadgeClass(status: PrescriptionStatus): string {
//         const classes: Record<PrescriptionStatus, string> = {
//             active: 'bg-green-50 text-green-700 border border-green-200',
//             suspended: 'bg-amber-50 text-amber-700 border border-amber-200',
//             completed: 'bg-slate-100 text-slate-600 border border-slate-200',
//             cancelled: 'bg-red-50 text-red-700 border border-red-200',
//             expired: 'bg-slate-100 text-slate-500 border border-slate-200'
//         };
//         return classes[status];
//     }

//     getVisitIcon(type: string): string {
//         const icons: Record<string, string> = {
//             consultation: 'stethoscope',
//             hospitalization: 'hospital',
//             emergency: 'emergency',
//             follow_up: 'follow_the_signs'
//         };
//         return icons[type] || 'event';
//     }
// }