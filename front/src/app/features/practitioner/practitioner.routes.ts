import { Routes } from "@angular/router";
import { PractitionerShell } from "./layout/practitioner-shell";
import { Dashboard } from "./dashboard/dashboard";
import { Patients } from "./dashboard/widget/patients/patients";
import { PatientDossier } from "./patient-dossier/patient-dossier";
import { AccessRequest } from "./access-request/access-request";
import { Consents } from "./consents/consents";
import { Organizations } from "./organizations/organizations";

export const PRACTITIONER_ROUTES: Routes = [
  {
    path: '',
    component: PractitionerShell,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'patients', component: Patients },
      { path: 'patient/:npi', component: PatientDossier },
      { path: 'consents', component: Consents },
      { path: 'organizations', component: Organizations },
      { path: 'access-request/new', component: AccessRequest },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
