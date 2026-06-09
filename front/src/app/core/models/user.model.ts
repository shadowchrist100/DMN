import { Gender, MaritalStatus, userRole } from "../types/user.types"

export interface Iuser {
    identity: {
        lastName: string,
        firstName: string,
        birthDate: Date,
        gender: Gender,
        npi: number,
        maritalStatus: MaritalStatus,
        multipleBirth: null | number ,
        phone: string,
        city: string,
        address: string,
        photoPath: string,
    },
    practitioner: {
        orderNumber: number,
        speciality: string,
        organizationName: string
    } | null ,
    contact: {
        firstName: string,
        lastName: string,
        phone: string,
        relation: string
    }| null,
    auth: {
        email: string,
        password:string
    },
    role: userRole,
}