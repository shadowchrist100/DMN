import { Component, computed, effect, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RegisterStore } from '../register.store';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormsModule } from '@angular/forms';
import { OrganisationService } from '../../../../core/services/organisation.service';
import { AvailableOrganization, PractitionerOrganization } from '../../../../core/models/user.model';

@Component({
    selector: 'app-step-professional-info',
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './step-professional-info.html',
    styleUrl: './step-professional-info.css',
})
export class StepProfessionalInfo implements OnInit {
    private destroyRef = inject(DestroyRef);
    private fb = inject(FormBuilder);
    private organisationService = inject(OrganisationService);

    store = RegisterStore;
    professionalInfoForm!: FormGroup;
    availableOrganizations = signal<AvailableOrganization[]>([]);
    selectedOrgs = signal<PractitionerOrganization[]>([]);
    searchQuery = signal('');

    filteredOrganizations = computed(() => {
        const query = this.searchQuery().toLowerCase();
        const selectedIds = new Set(this.selectedOrgs().map(o => o.organizationId));
        return this.availableOrganizations().filter(
            org => !selectedIds.has(org.id) && (!query || org.name.toLowerCase().includes(query) || org.city.toLowerCase().includes(query))
        );
    });

    constructor() {
        effect(() => {
            if (this.store.submited()) {
                if (this.professionalInfoForm?.invalid) {
                    this.professionalInfoForm.markAllAsTouched();
                    this.store.setContinueSteps(false);
                } else {
                    this.store.setContinueSteps(true);
                }
            }
        })
    }

    get organizationsArray(): FormArray {
        return this.professionalInfoForm.get('organizations') as FormArray;
    }

    ngOnInit(): void {
        this.professionalInfoForm = this.fb.group({
            orderNumber: ['', Validators.required],
            speciality: ['', Validators.required],
            organizations: this.fb.array([]),
        }, { updateOn: 'blur' });

        this.organisationService.getAvailableOrganizations().then(orgs => {
            this.availableOrganizations.set(orgs);
        });

        this.professionalInfoForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            const valid = this.professionalInfoForm.get('orderNumber')?.valid
                && this.professionalInfoForm.get('speciality')?.valid
                && this.organizationsArray.length > 0;
            this.store.setContinueSteps(!!valid);
        });
    }

    addOrganization(org: AvailableOrganization) {
        const selected = [...this.selectedOrgs(), { organizationId: org.id, organizationName: org.name, role: '' }];
        this.selectedOrgs.set(selected);
        this.organizationsArray.push(this.fb.group({
            organizationId: [org.id],
            organizationName: [org.name],
            role: ['', Validators.required],
        }));
        this.rebuildPractitionerData();
    }

    removeOrganization(orgId: string) {
        this.selectedOrgs.set(this.selectedOrgs().filter(o => o.organizationId !== orgId));
        const idx = this.organizationsArray.controls.findIndex(
            c => c.get('organizationId')?.value === orgId
        );
        if (idx >= 0) this.organizationsArray.removeAt(idx);
        this.rebuildPractitionerData();
    }

    onRoleChange(orgId: string, role: string) {
        this.selectedOrgs.update(orgs =>
            orgs.map(o => o.organizationId === orgId ? { ...o, role } : o)
        );
        const idx = this.organizationsArray.controls.findIndex(
            c => c.get('organizationId')?.value === orgId
        );
        if (idx >= 0) {
            this.organizationsArray.at(idx).get('role')?.setValue(role, { emitEvent: false });
        }
        this.rebuildPractitionerData();
    }

    private rebuildPractitionerData() {
        const validOrgs = this.selectedOrgs().filter(o => o.role.trim().length > 0);
        if (validOrgs.length > 0) {
            this.store.setPractitionerInfo(
                Number(this.professionalInfoForm.value.orderNumber),
                this.professionalInfoForm.value.speciality,
                validOrgs,
            );
        }
    }

    isInvalid = (field: string) =>
        this.professionalInfoForm.get(field)?.invalid && this.professionalInfoForm.get(field)?.touched;
}
