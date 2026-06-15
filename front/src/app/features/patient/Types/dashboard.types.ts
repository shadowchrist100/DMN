// dashboard.types.ts
// Centralise les types partagés entre le composant et les pipes

export type ViewKey =
    | 'dashboard'
    | 'historique'
    | 'prescriptions'
    | 'examens'
    | 'allergies'
    | 'pathologies'
    | 'consentements'
    | 'profil'
    | 'contacts'
    | 'contact-edit'
    | 'profil-edit'
    | 'acte';

export interface NavItem {
    key: ViewKey;
    label: string;
    icon: string;
}