import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-acces-denied',
  imports: [],
  templateUrl: './acces-denied.html',
  styleUrl: './acces-denied.css',
})
export class AccesDenied {
  private router = inject(Router);
  private location = inject(Location);

  goHome() {
    this.router.navigate(['/']);
  }

  goBack() {
    this.location.back();
  }
}
