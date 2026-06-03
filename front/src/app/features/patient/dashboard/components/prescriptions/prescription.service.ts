// // prescription.service.ts

// import { Injectable, inject } from '@angular/core';
// import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
// import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
// import { catchError, map, tap, delay } from 'rxjs/operators';

// import {
//     Prescription,
//     PrescriptionFilter,
//     PrescriptionStatus,
//     PrescriptionType,
//     LinkedDiagnosis,
//     LinkedVisit
// } from './prescription.model';
// // import { environment } from '../../../environments/environment';

// @Injectable({
//     providedIn: 'root'
// })
// export class PrescriptionService {

//     private apiUrl = `$/prescriptions`;
//     private http = inject(HttpClient);

//     // Cache local pour les données mock (à remplacer par API)
//     private prescriptionsCache = new BehaviorSubject<Prescription[]>([]);
//     private mockDataLoaded = false;

//     constructor() {
//         // Charger les données mock au démarrage (dev only)
//         // if (!environment.production) {
//         // }
//             this.loadMockData();

//     }

//     // ===== MÉTHODES DE RÉCUPÉRATION =====

//     /**
//      * Récupère toutes les prescriptions d'un patient
//      */
//     getPrescriptionsByPatient(patientId: string, filters?: PrescriptionFilter): Observable<Prescription[]> {
//         let params = new HttpParams().set('patient_id', patientId);

//         if (filters) {
//             if (filters.status.length > 0) {
//                 params = params.set('status', filters.status.join(','));
//             }
//             if (filters.type.length > 0) {
//                 params = params.set('type', filters.type.join(','));
//             }
//             if (filters.dateRange !== 'all') {
//                 params = params.set('period', filters.dateRange);
//             }
//             if (filters.diagnosisCode) {
//                 params = params.set('diagnosis', filters.diagnosisCode);
//             }
//             if (filters.searchTerm) {
//                 params = params.set('q', filters.searchTerm);
//             }
//         }

//         // En production: appel API réel
//         // if (environment.production) {
//         //     return this.http.get<{ prescriptions: Prescription[] }>(this.apiUrl, { params }).pipe(
//         //         map(response => response.prescriptions),
//         //         catchError(this.handleError)
//         //     );
//         // }

//         // En développement: données mock filtrées
//         return of(this.getMockPrescriptions()).pipe(
//             map(prescriptions => prescriptions.filter(p =>
//                 // Simuler le filtrage par patient
//                 true // Toutes les prescriptions mock appartiennent au même patient
//             )),
//             delay(300) // Simuler latence réseau
//         );
//     }

//     /**
//      * Récupère une prescription spécifique par ID
//      */
//     getPrescriptionById(prescriptionId: string): Observable<Prescription> {
//         // if (environment.production) {
//         //     return this.http.get<Prescription>(`${this.apiUrl}/${prescriptionId}`).pipe(
//         //         catchError(this.handleError)
//         //     );
//         // }

//         // Mock
//         const prescription = this.getMockPrescriptions().find(p => p.id === prescriptionId);
//         if (!prescription) {
//             return throwError(() => new Error(`Prescription ${prescriptionId} non trouvée`));
//         }
//         return of(prescription).pipe(delay(200));
//     }

//     /**
//      * Récupère les prescriptions actives d'un patient
//      */
//     getActivePrescriptions(patientId: string): Observable<Prescription[]> {
//         return this.getPrescriptionsByPatient(patientId).pipe(
//             map(prescriptions => prescriptions.filter(p => p.status === 'active'))
//         );
//     }

//     /**
//      * Récupère les prescriptions liées à un diagnostic spécifique
//      */
//     getPrescriptionsByDiagnosis(patientId: string, diagnosisCode: string): Observable<Prescription[]> {
//         return this.getPrescriptionsByPatient(patientId).pipe(
//             map(prescriptions =>
//                 prescriptions.filter(p =>
//                     p.linkedDiagnoses.some(d => d.code === diagnosisCode)
//                 )
//             )
//         );
//     }

//     // ===== MÉTHODES CRUD =====

//     /**
//      * Crée une nouvelle prescription
//      */
//     createPrescription(prescription: Partial<Prescription>): Observable<Prescription> {
//         // if (environment.production) {
//         //     return this.http.post<Prescription>(this.apiUrl, prescription).pipe(
//         //         tap(newPrescription => {
//         //             // Mettre à jour le cache local
//         //             const current = this.prescriptionsCache.value;
//         //             this.prescriptionsCache.next([...current, newPrescription]);
//         //         }),
//         //         catchError(this.handleError)
//         //     );
//         // }

//         // Mock: générer un ID et ajouter au cache
//         const newPrescription: Prescription = {
//             ...prescription as Prescription,
//             id: `RX-${Date.now()}`,
//             signedAt: new Date(),
//             signatureHash: this.generateMockHash(),
//             icon: this.getIconByType(prescription.type || 'medication'),
//             colorClass: this.getColorClassByType(prescription.type || 'medication')
//         };

//         const current = this.getMockPrescriptions();
//         current.unshift(newPrescription);

//         return of(newPrescription).pipe(delay(300));
//     }

//     /**
//      * Met à jour une prescription existante
//      */
//     updatePrescription(prescriptionId: string, updates: Partial<Prescription>): Observable<Prescription> {
//         // if (environment.production) {
//         //     return this.http.patch<Prescription>(`${this.apiUrl}/${prescriptionId}`, updates).pipe(
//         //         catchError(this.handleError)
//         //     );
//         // }

//         // Mock
//         const prescriptions = this.getMockPrescriptions();
//         const index = prescriptions.findIndex(p => p.id === prescriptionId);

//         if (index === -1) {
//             return throwError(() => new Error(`Prescription ${prescriptionId} non trouvée`));
//         }

//         const updated = {
//             ...prescriptions[index],
//             ...updates,
//             lastModified: new Date()
//         };
//         prescriptions[index] = updated;

//         return of(updated).pipe(delay(200));
//     }

//     /**
//      * Supprime une prescription (soft delete)
//      */
//     deletePrescription(prescriptionId: string): Observable<{ success: boolean }> {
//         // if (environment.production) {
//         //     return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${prescriptionId}`).pipe(
//         //         catchError(this.handleError)
//         //     );
//         // }

//         // Mock
//         const prescriptions = this.getMockPrescriptions();
//         const index = prescriptions.findIndex(p => p.id === prescriptionId);

//         if (index !== -1) {
//             prescriptions.splice(index, 1);
//         }

//         return of({ success: true }).pipe(delay(200));
//     }

//     // ===== ACTIONS MÉTIER =====

//     /**
//      * Renouvelle une prescription
//      */
//     renewPrescription(prescriptionId: string, reason?: string): Observable<Prescription> {
//         // if (environment.production) {
//         //     return this.http.post<Prescription>(
//         //         `${this.apiUrl}/${prescriptionId}/renew`,
//         //         { reason }
//         //     ).pipe(catchError(this.handleError));
//         // }

//         // Mock
//         const prescriptions = this.getMockPrescriptions();
//         const prescription = prescriptions.find(p => p.id === prescriptionId);

//         if (!prescription) {
//             return throwError(() => new Error('Prescription non trouvée'));
//         }

//         if (!prescription.renewable) {
//             return throwError(() => new Error('Cette prescription n\'est pas renouvelable'));
//         }

//         if (prescription.currentRenewal && prescription.maxRenewals &&
//             prescription.currentRenewal >= prescription.maxRenewals) {
//             return throwError(() => new Error('Nombre maximum de renouvellements atteint'));
//         }

//         // Créer une nouvelle prescription basée sur l'originale
//         const renewed: Prescription = {
//             ...prescription,
//             id: `RX-${Date.now()}`,
//             startDate: new Date(),
//             endDate: this.calculateEndDate(new Date(), prescription.duration),
//             currentRenewal: (prescription.currentRenewal || 0) + 1,
//             status: 'active',
//             signedAt: new Date(),
//             signatureHash: this.generateMockHash()
//         };

//         prescriptions.unshift(renewed);

//         return of(renewed).pipe(delay(300));
//     }

//     /**
//      * Suspend une prescription active
//      */
//     suspendPrescription(prescriptionId: string, reason: string): Observable<Prescription> {
//         return this.updatePrescription(prescriptionId, {
//             status: 'suspended',
//             instructions: `Suspendu le ${new Date().toLocaleDateString('fr-FR')}. Motif: ${reason}`
//         });
//     }

//     /**
//      * Réactive une prescription suspendue
//      */
//     reactivatePrescription(prescriptionId: string): Observable<Prescription> {
//         return this.updatePrescription(prescriptionId, {
//             status: 'active',
//             instructions: undefined
//         });
//     }

//     /**
//      * Annule une prescription
//      */
//     cancelPrescription(prescriptionId: string, reason: string): Observable<Prescription> {
//         return this.updatePrescription(prescriptionId, {
//             status: 'cancelled',
//             instructions: `Annulée le ${new Date().toLocaleDateString('fr-FR')}. Motif: ${reason}`
//         });
//     }

//     // ===== EXPORT =====

//     /**
//      * Exporte les prescriptions en PDF
//      */
//     exportPrescriptions(patientId: string, format: 'pdf' | 'csv' = 'pdf'): Observable<Blob> {
//         const params = new HttpParams()
//             .set('patient_id', patientId)
//             .set('format', format);

//         // if (environment.production) {
//         //     return this.http.get(`${this.apiUrl}/export`, {
//         //         params,
//         //         responseType: 'blob'
//         //     }).pipe(catchError(this.handleError));
//         // }

//         // Mock: générer un blob vide
//         const mockContent = `Prescriptions exportées pour patient ${patientId}\n\n[Contenu mock]`;
//         const blob = new Blob([mockContent], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' });

//         return of(blob).pipe(delay(500));
//     }

//     /**
//      * Télécharge l'ordonnance d'une prescription spécifique
//      */
//     downloadPrescriptionOrder(prescriptionId: string): Observable<Blob> {
//         // if (environment.production) {
//         //     return this.http.get(`${this.apiUrl}/${prescriptionId}/order`, {
//         //         responseType: 'blob'
//         //     }).pipe(catchError(this.handleError));
//         // }

//         // Mock
//         const mockContent = `Ordonnance #${prescriptionId}\n\n[Contenu mock]`;
//         const blob = new Blob([mockContent], { type: 'application/pdf' });

//         return of(blob).pipe(delay(300));
//     }

//     // ===== DONNÉES MOCK =====

//     /**
//      * Retourne les données mock (pour développement)
//      */
//     getMockPrescriptions(): Prescription[] {
//         if (!this.mockDataLoaded) {
//             this.loadMockData();
//         }
//         return this.prescriptionsCache.value;
//     }

//     private loadMockData(): void {
//         const mockVisit: LinkedVisit = {
//             id: 'VIS-2023-98421',
//             type: 'consultation',
//             date: new Date('2023-09-14T10:30:00'),
//             facility: 'CNHU-HKM, Cotonou',
//             practitioner: 'Dr. Kouandété Koffi',
//             summary: 'Consultation de cardiologie pour douleurs thoraciques'
//         };

//         const mockVisit2: LinkedVisit = {
//             id: 'VIS-2023-98500',
//             type: 'hospitalization',
//             date: new Date('2023-08-20T08:00:00'),
//             facility: 'Hôpital de Zone Calavi',
//             practitioner: 'Dr. Agossa Sévérin',
//             summary: 'Hospitalisation pour bilan cardiovasculaire'
//         };

//         const mockDiagnoses: LinkedDiagnosis[] = [
//             {
//                 code: 'I10',
//                 label: 'Hypertension artérielle essentielle',
//                 severity: 'moderate',
//                 status: 'confirmed'
//             },
//             {
//                 code: 'E78.0',
//                 label: 'Hypercholestérolémie pure',
//                 severity: 'mild',
//                 status: 'confirmed'
//             },
//             {
//                 code: 'I25.1',
//                 label: 'Maladie coronarienne athérosclérotique',
//                 severity: 'moderate',
//                 status: 'suspected'
//             }
//         ];

//         const mockPrescriptions: Prescription[] = [
//             {
//                 id: 'RX-001',
//                 type: 'medication',
//                 name: 'AMLODIPINE',
//                 dosage: '5mg',
//                 form: 'comprimé sécable',
//                 genericName: 'Amlodipine',
//                 posology: {
//                     quantity: 1,
//                     unit: 'comprimé',
//                     frequency: '1 fois par jour',
//                     timing: 'le matin',
//                     route: 'orale'
//                 },
//                 startDate: new Date('2023-09-14'),
//                 endDate: new Date('2023-12-14'),
//                 duration: { value: 3, unit: 'mois' },
//                 renewable: true,
//                 maxRenewals: 3,
//                 currentRenewal: 1,
//                 status: 'active',
//                 linkedDiagnoses: [mockDiagnoses[0]],
//                 linkedVisit: mockVisit,
//                 prescriber: {
//                     name: 'Dr. Kouandété Koffi',
//                     role: 'Médecin',
//                     specialty: 'Cardiologue',
//                     rpps: '10000000001'
//                 },
//                 instructions: 'Prendre au petit-déjeuner avec un verre d\'eau. Surveillance tensionnelle recommandée.',
//                 precautions: ['Éviter le pamplemousse', 'Signaler tout œdème'],
//                 contraindications: ['Hypotension sévère', 'Choc cardiogénique'],
//                 signedAt: new Date('2023-09-14T10:45:00'),
//                 signatureHash: 'a1b2c3d4e5f6g7h8i9j0',
//                 icon: 'medication',
//                 colorClass: 'bg-blue-100 text-blue-700'
//             },
//             {
//                 id: 'RX-002',
//                 type: 'medication',
//                 name: 'ASPEGIC',
//                 dosage: '100mg',
//                 form: 'sachet-dose',
//                 genericName: 'Aspirine',
//                 posology: {
//                     quantity: 1,
//                     unit: 'sachet',
//                     frequency: '1 fois par jour',
//                     timing: 'au milieu du déjeuner',
//                     route: 'orale'
//                 },
//                 startDate: new Date('2023-09-14'),
//                 endDate: new Date('2023-10-14'),
//                 duration: { value: 1, unit: 'mois' },
//                 renewable: false,
//                 status: 'active',
//                 linkedDiagnoses: [mockDiagnoses[0], mockDiagnoses[2]],
//                 linkedVisit: mockVisit,
//                 prescriber: {
//                     name: 'Dr. Kouandété Koffi',
//                     role: 'Médecin',
//                     specialty: 'Cardiologue',
//                     rpps: '10000000001'
//                 },
//                 instructions: 'Diluer dans un demi-verre d\'eau avant ingestion. Prendre au cours du repas.',
//                 precautions: ['Signaler tout saignement', 'Éviter l\'alcool'],
//                 contraindications: ['Ulcère gastrique actif', 'Hémophilie'],
//                 signedAt: new Date('2023-09-14T10:45:00'),
//                 signatureHash: 'k1l2m3n4o5p6q7r8s9t0',
//                 icon: 'medication',
//                 colorClass: 'bg-blue-100 text-blue-700'
//             },
//             {
//                 id: 'RX-003',
//                 type: 'medication',
//                 name: 'ATORVASTATINE',
//                 dosage: '20mg',
//                 form: 'comprimé pelliculé',
//                 genericName: 'Atorvastatine',
//                 posology: {
//                     quantity: 1,
//                     unit: 'comprimé',
//                     frequency: '1 fois par jour',
//                     timing: 'le soir',
//                     route: 'orale'
//                 },
//                 startDate: new Date('2023-08-20'),
//                 endDate: new Date('2024-02-20'),
//                 duration: { value: 6, unit: 'mois' },
//                 renewable: true,
//                 maxRenewals: 6,
//                 currentRenewal: 2,
//                 status: 'active',
//                 linkedDiagnoses: [mockDiagnoses[1]],
//                 linkedVisit: mockVisit2,
//                 prescriber: {
//                     name: 'Dr. Agossa Sévérin',
//                     role: 'Médecin',
//                     specialty: 'Médecin Généraliste',
//                     rpps: '10000000002'
//                 },
//                 instructions: 'Prendre le soir au coucher. Contrôle lipidique à 3 mois.',
//                 precautions: ['Signaler toute douleur musculaire', 'Éviter le pamplemousse'],
//                 contraindications: ['Insuffisance hépatique active', 'Grossesse'],
//                 signedAt: new Date('2023-08-20T14:30:00'),
//                 signatureHash: 'u1v2w3x4y5z6a7b8c9d0',
//                 icon: 'medication',
//                 colorClass: 'bg-blue-100 text-blue-700'
//             },
//             {
//                 id: 'RX-004',
//                 type: 'lab_test',
//                 name: 'Bilan Lipidique Complet',
//                 dosage: '',
//                 posology: {
//                     quantity: 1,
//                     unit: 'ml',
//                     frequency: '1 fois',
//                     route: 'autre'
//                 },
//                 startDate: new Date('2023-11-14'),
//                 renewable: false,
//                 status: 'completed',
//                 linkedDiagnoses: [mockDiagnoses[1]],
//                 linkedVisit: mockVisit,
//                 prescriber: {
//                     name: 'Dr. Kouandété Koffi',
//                     role: 'Médecin',
//                     specialty: 'Cardiologue',
//                     rpps: '10000000001'
//                 },
//                 instructions: 'À jeun depuis 12h. Apporter cette prescription au laboratoire.',
//                 signedAt: new Date('2023-09-14T10:50:00'),
//                 signatureHash: 'e1f2g3h4i5j6k7l8m9n0',
//                 icon: 'biotech',
//                 colorClass: 'bg-purple-100 text-purple-700'
//             },
//             {
//                 id: 'RX-005',
//                 type: 'imaging',
//                 name: 'Échographie Cardiaque',
//                 dosage: '',
//                 posology: {
//                     quantity: 1,
//                     unit: 'ml',
//                     frequency: '1 fois',
//                     route: 'autre'
//                 },
//                 startDate: new Date('2023-09-20'),
//                 renewable: false,
//                 status: 'completed',
//                 linkedDiagnoses: [mockDiagnoses[0], mockDiagnoses[2]],
//                 linkedVisit: mockVisit,
//                 prescriber: {
//                     name: 'Dr. Kouandété Koffi',
//                     role: 'Médecin',
//                     specialty: 'Cardiologue',
//                     rpps: '10000000001'
//                 },
//                 instructions: 'Apporter les résultats au prochain rendez-vous.',
//                 signedAt: new Date('2023-09-14T10:55:00'),
//                 signatureHash: 'o1p2q3r4s5t6u7v8w9x0',
//                 icon: 'ecg',
//                 colorClass: 'bg-indigo-100 text-indigo-700'
//             },
//             {
//                 id: 'RX-006',
//                 type: 'medication',
//                 name: 'PARACÉTAMOL',
//                 dosage: '1000mg',
//                 form: 'comprimé',
//                 genericName: 'Paracétamol',
//                 posology: {
//                     quantity: 1,
//                     unit: 'comprimé',
//                     frequency: 'En cas de douleur, max 3 par jour',
//                     timing: 'espacés de 6h minimum',
//                     route: 'orale'
//                 },
//                 startDate: new Date('2023-07-01'),
//                 endDate: new Date('2023-07-15'),
//                 duration: { value: 15, unit: 'jours' },
//                 renewable: false,
//                 status: 'completed',
//                 linkedDiagnoses: [{ code: 'R52', label: 'Douleur aiguë', status: 'confirmed' }],
//                 linkedVisit: {
//                     id: 'VIS-2023-97000',
//                     type: 'emergency',
//                     date: new Date('2023-07-01'),
//                     facility: 'Urgences CNHU-HKM',
//                     practitioner: 'Dr. Mensah Koffi'
//                 },
//                 prescriber: {
//                     name: 'Dr. Mensah Koffi',
//                     role: 'Médecin',
//                     specialty: 'Urgentiste'
//                 },
//                 instructions: 'Ne pas dépasser 3g par jour.',
//                 signedAt: new Date('2023-07-01T15:30:00'),
//                 signatureHash: 'y1z2a3b4c5d6e7f8g9h0',
//                 icon: 'medication',
//                 colorClass: 'bg-blue-100 text-blue-700'
//             },
//             {
//                 id: 'RX-007',
//                 type: 'medication',
//                 name: 'LOSARTAN',
//                 dosage: '50mg',
//                 form: 'comprimé',
//                 genericName: 'Losartan',
//                 posology: {
//                     quantity: 1,
//                     unit: 'comprimé',
//                     frequency: '1 fois par jour',
//                     timing: 'le matin',
//                     route: 'orale'
//                 },
//                 startDate: new Date('2023-06-01'),
//                 endDate: new Date('2023-08-01'),
//                 duration: { value: 2, unit: 'mois' },
//                 renewable: false,
//                 status: 'suspended',
//                 linkedDiagnoses: [mockDiagnoses[0]],
//                 linkedVisit: mockVisit2,
//                 prescriber: {
//                     name: 'Dr. Agossa Sévérin',
//                     role: 'Médecin',
//                     specialty: 'Médecin Généraliste'
//                 },
//                 instructions: 'Suspendu le 15/07/2023 en raison d\'effets indésirables (vertiges). Remplacé par Amlodipine.',
//                 signedAt: new Date('2023-06-01T09:00:00'),
//                 lastModified: new Date('2023-07-15T11:00:00'),
//                 signatureHash: 'i1j2k3l4m5n6o7p8q9r0',
//                 icon: 'medication',
//                 colorClass: 'bg-blue-100 text-blue-700'
//             },
//             {
//                 id: 'RX-008',
//                 type: 'therapy',
//                 name: 'Réadaptation Cardiaque',
//                 dosage: '',
//                 posology: {
//                     quantity: 1,
//                     unit: 'ml',
//                     frequency: '3 séances par semaine',
//                     timing: 'pendant 6 semaines',
//                     route: 'autre'
//                 },
//                 startDate: new Date('2023-10-01'),
//                 endDate: new Date('2023-11-15'),
//                 duration: { value: 6, unit: 'semaines' },
//                 renewable: true,
//                 maxRenewals: 2,
//                 currentRenewal: 0,
//                 status: 'active',
//                 linkedDiagnoses: [mockDiagnoses[2]],
//                 linkedVisit: mockVisit,
//                 prescriber: {
//                     name: 'Dr. Kouandété Koffi',
//                     role: 'Médecin',
//                     specialty: 'Cardiologue'
//                 },
//                 instructions: 'Programme d\'exercices supervisés. Apporter cette prescription à chaque séance.',
//                 signedAt: new Date('2023-09-14T11:00:00'),
//                 signatureHash: 's1t2u3v4w5x6y7z8a9b0',
//                 icon: 'fitness_center',
//                 colorClass: 'bg-green-100 text-green-700'
//             }
//         ];

//         this.prescriptionsCache.next(mockPrescriptions);
//         this.mockDataLoaded = true;
//     }

//     // ===== HELPERS =====

//     private calculateEndDate(startDate: Date, duration?: { value: number; unit: string }): Date | undefined {
//         if (!duration) return undefined;

//         const endDate = new Date(startDate);

//         switch (duration.unit) {
//             case 'jours':
//                 endDate.setDate(endDate.getDate() + duration.value);
//                 break;
//             case 'semaines':
//                 endDate.setDate(endDate.getDate() + (duration.value * 7));
//                 break;
//             case 'mois':
//                 endDate.setMonth(endDate.getMonth() + duration.value);
//                 break;
//         }

//         return endDate;
//     }

//     private getIconByType(type: PrescriptionType): string {
//         const icons: Record<PrescriptionType, string> = {
//             medication: 'medication',
//             medical_device: 'medical_information',
//             lab_test: 'biotech',
//             imaging: 'radiology',
//             therapy: 'fitness_center'
//         };
//         return icons[type] || 'description';
//     }

//     private getColorClassByType(type: PrescriptionType): string {
//         const colors: Record<PrescriptionType, string> = {
//             medication: 'bg-blue-100 text-blue-700',
//             medical_device: 'bg-slate-100 text-slate-700',
//             lab_test: 'bg-purple-100 text-purple-700',
//             imaging: 'bg-indigo-100 text-indigo-700',
//             therapy: 'bg-green-100 text-green-700'
//         };
//         return colors[type] || colors.medication;
//     }

//     private generateMockHash(): string {
//         return Math.random().toString(36).substring(2, 15) +
//             Math.random().toString(36).substring(2, 15);
//     }

//     // ===== GESTION DES ERREURS =====

//     private handleError(error: HttpErrorResponse): Observable<never> {
//         let errorMessage = 'Une erreur est survenue';

//         if (error.error instanceof ErrorEvent) {
//             // Erreur côté client
//             errorMessage = `Erreur: ${error.error.message}`;
//         } else {
//             // Erreur côté serveur
//             errorMessage = `Erreur serveur ${error.status}: ${error.message}`;

//             switch (error.status) {
//                 case 404:
//                     errorMessage = 'Prescription non trouvée';
//                     break;
//                 case 403:
//                     errorMessage = 'Accès non autorisé';
//                     break;
//                 case 500:
//                     errorMessage = 'Erreur interne du serveur';
//                     break;
//             }
//         }

//         console.error('PrescriptionService Error:', errorMessage);

//         // TODO: Intégrer avec un service de notification/toast
//         // this.notificationService.showError(errorMessage);

//         return throwError(() => error);
//     }
// }