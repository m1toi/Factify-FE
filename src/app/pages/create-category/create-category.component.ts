// src/app/pages/create-category/create-category.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-create-category',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    SidebarComponent
  ],
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.scss']
})
export class CreateCategoryComponent implements OnInit {
  categoryForm!: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.categoryForm.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
      }
    });
  }

  submitCategory() {
    if (this.categoryForm.invalid) return;

    this.categoryService.createCategory(this.categoryForm.value)
      .subscribe({
        next: () => this.router.navigate(['/create-post']),
        error: err => {
          // serverul ne trimite { error: "..." }
          this.errorMessage = err.error?.error || 'An unexpected error occurred';
        }
      });
  }

  cancel() {
    this.router.navigate(['/create-post']);
  }
}
