import { signal } from "@angular/core";
import { userRole } from "../../../core/types/user.types";
import { Iuser, PractitionerOrganization, RegistrationFiles } from "../../../core/models/user.model";

const _userType = signal<userRole>(null);
const _user = signal<Iuser | null>(null);
const _currentStep = signal(1);
const _continueSteps = signal<boolean | null>(null);
const _submited = signal<boolean>(false);
const _files = signal<RegistrationFiles>({
    identityDocType: '',
    identityFile: null,
    medicalCardFile: null,
    photoFile: null,
});

export const RegisterStore = {
    currentStep: _currentStep.asReadonly(),
    userType: _userType.asReadonly(),
    user: _user.asReadonly(),
    continueSteps: _continueSteps.asReadonly(),
    submited: _submited.asReadonly(),
    files: _files.asReadonly(),

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

    setPractitionerInfo(orderNumber: string, speciality: string, organizations: PractitionerOrganization[]) {
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

    setRegistrationFiles(files: Partial<RegistrationFiles>) {
        _files.update(f => ({ ...f, ...files }));
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
