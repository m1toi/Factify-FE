import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './auth/guard/auth.guard';
import {PreferenceGuard} from './auth/preference.guard'
import {SkipIfHasPreferencesGuard} from './auth/skip-preference.guard';
import {ChatPageComponent} from './pages/chat-page/chat-page.component';
import {AdminGuard} from './auth/admin.guard';
import {VerifyReportDetailComponent} from './pages/verify-report-detail/verify-report-detail.component';

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

  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component')
        .then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/:id',
    loadComponent: () =>
      import('./pages/profile/profile.component')
        .then(m => m.ProfileComponent),
    canActivate: [AuthGuard],
    runGuardsAndResolvers:'paramsChange'
  },

  {path: 'chat', component: ChatPageComponent},
  { path: 'chat/:conversationId', component: ChatPageComponent },
  {
    path: 'verify-reports',
    loadComponent: () =>
      import('./pages/verify-reports/verify-reports.component').then(
        (m) => m.VerifyReportsComponent
      ),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'verify-reports/:id',
    component: VerifyReportDetailComponent,
    canActivate: [AuthGuard, AdminGuard]
  },

  { path: '**', redirectTo: 'login' }
];
