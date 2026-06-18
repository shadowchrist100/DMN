import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-documents',
  imports: [],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class Documents {
  @Input() patientUserId: string | undefined;
}

