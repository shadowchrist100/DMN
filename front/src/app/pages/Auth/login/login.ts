import { Component, inject, signal } from '@angular/core';
import { PatientForm } from './patient-form/patient-form';
import { HealthProviderForm } from './health-provider-form/health-provider-form';

@Component({
    selector: 'app-login',
    imports: [PatientForm, HealthProviderForm],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    view = signal<string>('patient');
    
}
