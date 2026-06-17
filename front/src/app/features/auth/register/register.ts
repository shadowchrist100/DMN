import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterStore } from './register.store';
import { StepTypeCompte } from "./step-type-compte/step-type-compte";
import { StepIdentity } from "./step-identity/step-identity";
import { StepEmergencyContact } from "./step-emergency-contact/step-emergency-contact";
import { StepAuth } from "./step-auth/step-auth";
import { StepProfessionalInfo } from "./step-professional-info/step-professional-info";
import { AuthService, RegisterPayload, mapSpeciality } from '../../../core/auth/auth-service';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
    selector: 'app-register',
    imports: [StepTypeCompte, StepIdentity, StepEmergencyContact, StepAuth, StepProfessionalInfo],
    templateUrl: './register.html',
    styleUrl: './register.css',
})
export class Register {
    store = RegisterStore;
    continue = signal<boolean>(false);
    error = signal<string>('');
    loading = signal<boolean>(false);
    private router = inject(Router);
    private authService = inject(AuthService);
    private authStore = AuthStore;

    steps = computed(() => {
        if (this.store.userType() === "PATIENT") {
            return [
                { id: 1, label: 'Type de compte', icon: 'person_search' },
                { id: 2, label: 'Identité', icon: 'badge' },
                { id: 3, label: "Contact d'urgence", icon: 'contact_emergency' },
                { id: 4, label: 'Sécurité & Accès', icon: 'lock_open' }
            ]
        } else {
            return [
                { id: 1, label: 'Type de compte', icon: 'person_search' },
                { id: 2, label: 'Identité', icon: 'badge' },
                { id: 3, label: 'Informations Professionels' },
                { id: 4, label: 'Sécurité & Accès', icon: 'lock_open' }
            ]
        }
    })

    isCurrentFormValid = computed(() => this.store.continueSteps())

    handleContinue() {
        this.store.setSubmited(true);
        if (this.isCurrentFormValid()) {
            if (this.store.currentStep() === 4) {
                this.submitRegistration();
            } else {
                this.store.nextStep();
                this.store.setSubmited(false);
                this.store.setContinueSteps(false);
            }
        }
    }

    private async submitRegistration() {
        const user = this.store.user();
        const userType = this.store.userType();
        const files = this.store.files();
        if (!user?.auth.email) return;

        this.loading.set(true);
        this.error.set('');

        try {
            const payload: RegisterPayload = {
                role: userType === 'PATIENT' ? 'patient' : 'practitioner',
                first_name: user.identity.firstName,
                last_name: user.identity.lastName,
                email: user.auth.email,
                password: user.auth.password,
                gender: user.identity.gender === 'male' ? 'homme' : 'femme',
                birth_date: user.identity.birthDate.toISOString().split('T')[0],
                matrimonial_status: user.identity.maritalStatus,
                phone: user.identity.phone,
                npi: String(user.identity.npi),
                city: user.identity.city,
                address: user.identity.address,
            };

            if (userType === 'PATIENT' && user.contact) {
                payload.emergencyContact = {
                    firstName: user.contact.firstName,
                    lastName: user.contact.lastName,
                    phone: user.contact.phone,
                    code_relation: user.contact.relation,
                    confirmed: true,
                };
            }

            if (userType === 'PRACTITIONER' && user.practitioner) {
                payload.order_number = String(user.practitioner.orderNumber);
                payload.speciality = mapSpeciality(user.practitioner.speciality);
                if (user.practitioner.organizations?.length) {
                    payload.organization_id = user.practitioner.organizations[0].organizationId;
                }
            }

            const documents: { type_document: string; file: File }[] = [];

            const docTypeMap: Record<string, string> = {
                CNI: 'piece_identite',
                PASSPORT: 'piece_identite',
                CIP: 'carte_ordre',
                DRIVING_LICENSE: 'piece_identite',
            };

            if (files.identityFile && files.identityDocType) {
                documents.push({
                    type_document: docTypeMap[files.identityDocType] || 'piece_identite',
                    file: files.identityFile,
                });
            }

            if (files.medicalCardFile) {
                documents.push({
                    type_document: 'diplome',
                    file: files.medicalCardFile,
                });
            }

            if (documents.length) {
                payload.documents = documents;
            }

            const response = await this.authService.register(payload);

            this.authStore.setAuth(response.user, response.access_token);
            this.router.navigateByUrl(`/${userType === 'PATIENT' ? 'patient' : 'practitioner'}/dashboard`);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
            this.error.set(msg);
        } finally {
            this.loading.set(false);
        }
    }

    handleBack() {
        this.store.prevStep();
        this.store.setSubmited(false);
        this.store.setContinueSteps(false);
    }
}
