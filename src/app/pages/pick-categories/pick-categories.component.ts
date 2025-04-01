import { Component, OnInit } from '@angular/core';
import { CategoryService, Category } from '../../services/category.service';
import { UserPreferenceService } from '../../services/user-preference.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-pick-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CheckboxModule],
  templateUrl: './pick-categories.component.html',
  styleUrls: ['./pick-categories.component.scss']
})
export class PickCategoriesComponent implements OnInit {
  categories: Category[] = [];
  selectedCategoryIds: number[] = [];

  constructor(
    private categoryService: CategoryService,
    private userPreferenceService: UserPreferenceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Failed to load categories:', err)
    });
  }

  submitPreferences(): void {
    if (this.selectedCategoryIds.length === 0) return;
    console.log('Sending categoryIds:', this.selectedCategoryIds);
    this.userPreferenceService.submitPreferences(this.selectedCategoryIds).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => console.error('Error saving preferences:', err)
    });
  }
}
