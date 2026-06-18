import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SelectedPatientService {
  private readonly STORAGE_KEY = 'selectedPatientNpi';
  selectedNpi = signal<string | null>(this.load());

  private load(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  select(npi: string): void {
    this.selectedNpi.set(npi);
    localStorage.setItem(this.STORAGE_KEY, npi);
  }

  clear(): void {
    this.selectedNpi.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
