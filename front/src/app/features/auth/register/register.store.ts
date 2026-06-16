import { signal } from "@angular/core";
import { userRole } from "../../../core/types/user.types";
import { Iuser, PractitionerOrganization } from "../../../core/models/user.model";

const _userType = signal<userRole>(null);
const _user = signal<Iuser | null>(null);
const _currentStep = signal(1);
const _continueSteps = signal<boolean | null>(null);
const _submited = signal<boolean>(false);

export const RegisterStore = {
    currentStep: _currentStep.asReadonly(),
    userType: _userType.asReadonly(),
    user: _user.asReadonly(),
    continueSteps: _continueSteps.asReadonly(),
    submited: _submited.asReadonly(),

    setUserType(type: userRole) {
        _userType.set(type);
    },

    setUserIdentity(identity: Iuser['identity']) {
        _user.update(u => ({
            ...(u ?? {} as Iuser),
            identity,
        }));
    },

    setUserContact(contact: Iuser['contact']) {
        _user.update(u => ({
            ...(u ?? {} as Iuser),
            contact,
        }));
    },

    setUserAuth(auth: Iuser['auth']) {
        _user.update(u => ({
            ...(u ?? {} as Iuser),
            auth,
        }));
    },

    setPractitionerInfo(orderNumber: number, speciality: string, organizations: PractitionerOrganization[]) {
        _user.update(u => ({
            ...(u ?? {} as Iuser),
            practitioner: { orderNumber, speciality, organizations },
        }));
    },

    setUserRole() {
        _user.update(u => ({
            ...(u ?? {} as Iuser),
            role: _userType(),
        }));
    },

    nextStep() {
        _currentStep.update(s => s + 1);
    },

    prevStep() {
        _currentStep.update(s => s - 1);
    },

    setContinueSteps(val: boolean) {
        _continueSteps.set(val);
    },

    setSubmited(val: boolean) {
        _submited.set(val);
    }
}
