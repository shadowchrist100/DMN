import { Gender,MaritalStatus,userRole } from "../types/user.types";

export interface PractitionerOrganization {
    organizationId: string;
    organizationName: string;
    role: string;
}

export interface Iuser {
    identity: {
        lastName: string,
        firstName: string,
        birthDate: Date,
        gender: Gender,
        npi: number,
        maritalStatus: MaritalStatus,
        multipleBirth: null | number,
        phone: string,
        city: string,
        address: string,
        photoPath: string,
    },
    practitioner: {
        orderNumber: number,
        speciality: string;
        organizations: PractitionerOrganization[];
    } | null,
    contact: {
        firstName: string,
        lastName: string,
        phone: string,
        relation: string
    } | null,
    auth: {
        email: string,
        password: string
    },
    role: userRole,
}

export interface AvailableOrganization {
    id: string;
    name: string;
    type: string;
    city: string;
    department: string;
}

export interface RegistrationFiles {
    identityDocType: string;
    identityFile: File | null;
    medicalCardFile: File | null;
    photoFile: File | null;
}