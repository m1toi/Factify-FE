import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, Validators, FormGroup} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;    // doar declarăm
  token = '';
  submitted = false;
  message = '';
  resetSuccessful = false;


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  passwordsMatch(group: any) {
    return group.get('newPassword')!.value === group.get('confirmPassword')!.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid || !this.token) return;
    this.userService.resetPassword(this.token, this.form.value.newPassword!)
      .subscribe({
        next: res => {
          this.message = res.message;
          this.form.reset();
          this.submitted = false;
          this.resetSuccessful = true; // ← marchează succesul
        },
        error: err => this.message = err.error?.error || 'Reset failed.'
      });
  }
}
