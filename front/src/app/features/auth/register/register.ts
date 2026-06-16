import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterStore } from './register.store';
import { StepTypeCompte } from "./step-type-compte/step-type-compte";
import { StepIdentity } from "./step-identity/step-identity";
import { StepEmergencyContact } from "./step-emergency-contact/step-emergency-contact";
import { StepAuth } from "./step-auth/step-auth";
import { StepProfessionalInfo } from "./step-professional-info/step-professional-info";
import { AuthService } from '../../../core/auth/auth-service';
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
        if (!user?.auth.email) return;

        try {
            const response = await this.authService.register({
                userType: this.store.userType(),
                identity: user.identity,
                contact: user.contact ?? undefined,
                practitioner: user.practitioner ?? undefined,
                auth: user.auth,
            });

            this.authStore.setAuth(response.user, response.token);
            this.router.navigateByUrl(`/${this.store.userType() === 'PATIENT' ? 'patient' : 'practitioner'}/dashboard`);
        } catch {
            console.error('Erreur lors de l\'inscription');
        }
    }

    handleBack() {
        this.store.prevStep();
        this.store.setSubmited(false);
        this.store.setContinueSteps(false);
    }
}
