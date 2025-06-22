import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import {Router, RouterModule} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  invalidAttempt = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.invalidAttempt = true;
      setTimeout(() => (this.invalidAttempt = false), 500);
      return;
    }

    this.errorMessage = '';
    const registerData = {
      name: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Registration failed:', err);
        this.invalidAttempt = true;
        // setăm mesajul pe baza codului de status şi, eventual, a textului din err.error
        if (err.status === 409) {
          const serverMsg = err.error?.error ?? '';
          if (serverMsg.toLowerCase().includes('username')) {
            this.errorMessage = 'Username already exists. Please choose another one.';
          } else {
            // nu divulgăm dacă email-ul există
            this.errorMessage = 'Could not create account. Try a different email';
          }
        } else {
          this.errorMessage = 'A apărut o eroare. Încearcă din nou.';
        }
        setTimeout(() => (this.invalidAttempt = false), 500);
      },
    });
  }

}
