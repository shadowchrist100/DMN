import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth-service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = signal(false);
  message = signal('');
  error = signal('');
  showPassword = signal(false);

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  isInvalid(field: string) {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  passwordsMatch(): boolean {
    return this.form.value.password === this.form.value.confirmPassword;
  }

  async onSubmit() {
    if (this.form.invalid || !this.passwordsMatch()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.message.set('');
    this.error.set('');

    try {
      const token = this.route.snapshot.queryParams['token'];
      if (!token) { this.error.set('Lien invalide ou expiré.'); this.isLoading.set(false); return; }
      await this.authService.resetPassword(token, this.form.value.password!);
      this.message.set('Mot de passe réinitialisé avec succès.');
      setTimeout(() => this.router.navigateByUrl('/auth/login'), 2000);
    } catch {
      this.error.set('Une erreur est survenue. Le lien est peut-être expiré.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
