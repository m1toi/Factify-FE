import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './auth/guard/auth.guard';
import {PreferenceGuard} from './auth/preference.guard'
import {SkipIfHasPreferencesGuard} from './auth/skip-preference.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'pick-interests',
    loadComponent: () =>
      import('./pages/pick-categories/pick-categories.component').then(m => m.PickCategoriesComponent),
    canActivate: [AuthGuard, SkipIfHasPreferencesGuard]
  },
  {
    path: 'create-post',
    loadComponent: () =>
      import('./pages/create-post/create-post.component').then(m => m.CreatePostComponent),
    canActivate: [AuthGuard]
  },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard, PreferenceGuard] },

  { path: '**', redirectTo: 'login' }
];
