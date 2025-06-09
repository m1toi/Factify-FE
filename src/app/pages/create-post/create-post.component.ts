import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import {Select} from 'primeng/select';
import {SidebarComponent} from '../sidebar/sidebar.component';

@Component({
  selector: 'app-create-post',
  standalone: true,
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    FormsModule,
    Select,
    SidebarComponent
  ]
})
export class CreatePostComponent implements OnInit {
  postForm!: FormGroup;
  categories: any[] = [];

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.postForm = this.fb.group({
      question: ['', Validators.required],
      answer: ['', Validators.required],
      categoryId: [null, Validators.required],
    });

    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  submitPost() {
    if (this.postForm.valid) {
      this.postService.createPost(this.postForm.value).subscribe({
        next: () => this.router.navigate(['/home']),
        error: err => console.error('Post creation failed:', err),
      });
    }
  }
}
