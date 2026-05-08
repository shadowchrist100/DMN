import { signal } from "@angular/core";

export type userType = 'PATIENT' | 'PRACTITIONER' | null;

const _userType = signal<userType>(null);
const _currentStep = signal(4);

export const RegisterStore = {
    currentStep: _currentStep.asReadonly(),
    userType: _userType.asReadonly(),

    setUserType(type: userType){
        _userType.set(type);
    },

    nextStep(){
        _currentStep.update(s => s+1 );
    },

    prevStep(){
        _currentStep.update(s=> s-1);
    }
    
}