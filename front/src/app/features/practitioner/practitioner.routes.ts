import { Routes } from "@angular/router";
import { Dashboard } from "./dashboard/dashboard";
import { Patients } from "./dashboard/widget/patients/patients";
import { PatientDossier } from "./patient-dossier/patient-dossier";

export const PRACTITIONER_ROUTES: Routes = [
    {path:'dashboard', component:Dashboard },
    {path:'patients', component:Patients },
    {path:'patient', component:PatientDossier}
]