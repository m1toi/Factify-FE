import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, Validators, FormGroup} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { UserService } from '../../services/user.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;     // doar declarăm câmpul, fără inițializare aici
  submitted = false;
  message = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) { this.form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });}

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading = true;
    this.message = '';

    this.userService.forgotPassword(this.form.value.email!)
      .subscribe({
        next: res => {
          this.message = res.message;
          this.loading = false;
          this.form.reset();
          this.submitted = false;
        },
        error: err => {
          this.message = err.error?.error || 'A apărut o eroare.';
          this.loading = false;
        }
      });
  }

}
