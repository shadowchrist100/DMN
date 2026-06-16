import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth-service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  isLoading = signal(false);
  message = signal('');
  error = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isInvalid(field: string) {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.message.set('');
    this.error.set('');

    try {
      const res = await this.authService.forgotPassword(this.form.value.email!);
      this.message.set(res.message);
    } catch {
      this.error.set('Une erreur est survenue. Vérifiez votre adresse email.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
