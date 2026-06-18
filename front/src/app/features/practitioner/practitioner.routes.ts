import { Routes } from "@angular/router";
import { Dashboard } from "./dashboard/dashboard";
import { Patients } from "./dashboard/widget/patients/patients";
import { PatientDossier } from "./patient-dossier/patient-dossier";
import { AccessRequest } from "./access-request/access-request";

export const PRACTITIONER_ROUTES: Routes = [
    {path:'dashboard', component:Dashboard },
    {path:'patients', component:Patients },
    {path:'patient/:npi', component:PatientDossier},
    {path:'access-request/new', component:AccessRequest},
]