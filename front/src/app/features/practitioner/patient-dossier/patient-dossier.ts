import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Historiques } from './historiques/historiques';
import { Analyses } from './analyses/analyses';
import { Traitements } from './traitements/traitements';
import { Pathologies } from './pathologies/pathologies';
import { Vaccins } from './vaccins/vaccins';
import { Documents } from './documents/documents';

export type TabId = 'overview' | 'historiques' | 'analyses' | 'traitements' | 'pathologies' | 'vaccins' | 'documents';

@Component({
  selector: 'app-patient-dossier',
  imports: [CommonModule, Historiques, Analyses, Traitements, Pathologies, Vaccins, Documents],
  templateUrl: './patient-dossier.html',
  styleUrl: './patient-dossier.css',
})
export class PatientDossier {
  selectedTab = signal<TabId>('overview');

  tabs: { id: TabId; label: string; icon: string; badge?: { text: string; class: string } }[] = [
    { id: 'overview', label: "Vue d'ensemble", icon: 'timeline' },
    { id: 'historiques', label: 'Historiques', icon: 'stethoscope', badge: { text: '24', class: 'bg-slate-100 text-slate-600' } },
    { id: 'analyses', label: 'Analyses', icon: 'biotech' },
    { id: 'traitements', label: 'Traitements', icon: 'medication', badge: { text: '3 actifs', class: 'bg-green-100 text-green-700' } },
    { id: 'pathologies', label: 'Pathologies', icon: 'medical_information' },
    { id: 'vaccins', label: 'Vaccins', icon: 'vaccines' },
    { id: 'documents', label: 'Documents', icon: 'description' },
  ];

  selectTab(tabId: TabId): void {
    this.selectedTab.set(tabId);
  }
}
