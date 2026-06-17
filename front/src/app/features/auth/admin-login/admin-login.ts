import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PASSWORD_REGEX } from '../../../core/constants/PASSWORD_REGEX';
import { AuthService } from '../../../core/auth/auth-service';
import { AuthStore } from '../../../core/auth/auth.store';

const ADMIN_ROLES = ['admin', 'admin_medical', 'admin_organisation'];

@Component({
  selector: 'app-admin-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin implements OnInit {
  isLoading = signal(false);
  showPassword = signal(false);
  serverError = signal('');
  loginForm!: FormGroup;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private authStore = AuthStore;

  ngOnInit(): void {
    if (AuthStore.isAuthenticated()) {
      this.router.navigateByUrl('/admin/dashboard');
      return;
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
    });
  }

  isInvalid(field: string) {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.serverError.set('');

    try {
      const { email, password } = this.loginForm.value;
      const response = await this.authService.login(email, password, '');

      const actualRole = response.user.role;

      if (!actualRole || !ADMIN_ROLES.includes(actualRole)) {
        this.serverError.set('Accès réservé aux administrateurs. Veuillez utiliser le formulaire de connexion standard.');
        this.isLoading.set(false);
        return;
      }

      this.authStore.setAuth(response.user, response.access_token);
      this.router.navigateByUrl('/admin/dashboard');
    } catch {
      this.serverError.set('Email ou mot de passe incorrect.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
