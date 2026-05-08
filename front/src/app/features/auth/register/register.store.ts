import { signal } from "@angular/core";

export type userType = 'PATIENT' | 'PRACTITIONER' | null;

const _userType = signal<userType>(null);
const _currentStep = signal(1);
const _continueSteps = signal<boolean | null >(null)

export const RegisterStore = {
    currentStep: _currentStep.asReadonly(),
    userType: _userType.asReadonly(),
    continueSteps: _continueSteps.asReadonly(),

    setUserType(type: userType){
        _userType.set(type);
    },

    nextStep(){
        _currentStep.update(s => s+1 );
    },

    prevStep(){
        _currentStep.update(s=> s-1);
    },

    setContinueSteps(val:boolean){
        _continueSteps.set(val);
    }
    
}