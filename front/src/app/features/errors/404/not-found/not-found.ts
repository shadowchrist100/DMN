import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  private router = inject(Router);
  private location = inject(Location);

  goHome() {
    this.router.navigate(['/']);
  }

  goBack() {
    this.location.back();
  }
}
