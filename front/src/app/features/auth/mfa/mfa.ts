import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth-service';

@Component({
  selector: 'app-mfa',
  imports: [ReactiveFormsModule],
  templateUrl: './mfa.html',
  styleUrl: './mfa.css',
})
export class Mfa {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  error = signal('');

  form = this.fb.group({
    digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
    digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
    digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
    digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
    digit5: ['', [Validators.required, Validators.pattern('[0-9]')]],
    digit6: ['', [Validators.required, Validators.pattern('[0-9]')]],
  });

  get code(): string {
    const v = this.form.value;
    return `${v.digit1}${v.digit2}${v.digit3}${v.digit4}${v.digit5}${v.digit6}`;
  }

  onInput(event: Event, next: string) {
    const input = event.target as HTMLInputElement;
    if (input.value.length === 1 && next) {
      const nextInput = document.querySelector<HTMLInputElement>(`[data-otp="${next}"]`);
      nextInput?.focus();
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.error.set('');

    try {
      await this.authService.verifyMfa(this.code);
      this.router.navigateByUrl('/practitioner/dashboard');
    } catch {
      this.error.set('Code invalide. Veuillez réessayer.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
