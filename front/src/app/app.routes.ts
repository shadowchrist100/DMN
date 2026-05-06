import { Routes } from '@angular/router';
import { Index } from './features/index';

export const routes: Routes = [
    {path:'auth', loadChildren: ()=>import('./features/auth/auth.routes').then( m=>m.AUTH_ROUTES )  },
    {path: "", component: Index }
];
