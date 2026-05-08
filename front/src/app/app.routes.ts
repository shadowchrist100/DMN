import { Routes } from '@angular/router';
import { Index } from './features/index';

export const routes: Routes = [
    {path:'auth', loadChildren: ()=>import('./features/auth/auth.routes').then( m=>m.AUTH_ROUTES )  },
    {path: "patient", loadChildren: ()=> import('./features/patient/patient.routes').then( m => m.PATIENT_ROUTES ) },
    {path:"practitioner", loadChildren: ()=> import('./features/practitioner/practitioner.routes').then( m => m.PRACTITIONER_ROUTES )  },
    {path: "", component: Index }
];
