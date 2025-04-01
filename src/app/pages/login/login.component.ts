import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserPreferenceService } from '../../services/user-preference.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  invalidAttempt = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userPreferenceService: UserPreferenceService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.invalidAttempt = true;
      setTimeout(() => (this.invalidAttempt = false), 500);
      return;
    }

    const loginData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(loginData).subscribe({
      next: (token) => {
        this.authService.saveToken(token);

        this.userPreferenceService.hasPreferences().subscribe({
          next: (hasPreferences) => {
            const target = hasPreferences ? '/home' : '/pick-interests';
            this.router.navigate([target]);
          },
          error: () => this.router.navigate(['/home']) // fallback
        });
      },
      error: (err) => {
        console.error('Login error:', err);
        this.invalidAttempt = true;
        setTimeout(() => (this.invalidAttempt = false), 500);
      }
    });
  }
}
