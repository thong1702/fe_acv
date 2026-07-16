import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { PublicLayoutComponent } from './shared/layouts/public-layout.component';

export const routes: Routes = [
  // Public Website Shell (Navbar & Footer included)
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./features/public/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'posts',
        loadComponent: () => import('./features/public/posts/post-list.component').then(m => m.PostListComponent)
      },
      {
        path: 'posts/:slug',
        loadComponent: () => import('./features/public/posts/post-detail.component').then(m => m.PostDetailComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./features/public/documents/document-list.component').then(m => m.DocumentListComponent)
      }
    ]
  },

  // Admin CMS Login
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/admin-login.component').then(m => m.AdminLoginComponent)
  },

  // Admin CMS Dashboard & Operations (Protected)
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/user-management.component').then(m => m.UserManagementComponent),
        data: { role: 'ADMIN' }
      },
      {
        path: 'company-info',
        loadComponent: () => import('./features/admin/company-info/company-info-management.component').then(m => m.CompanyInfoManagementComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/categories/category-management.component').then(m => m.CategoryManagementComponent)
      },
      {
        path: 'posts',
        loadComponent: () => import('./features/admin/posts/post-management.component').then(m => m.PostManagementComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./features/admin/documents/document-management.component').then(m => m.DocumentManagementComponent)
      },
      {
        path: 'organization',
        loadComponent: () => import('./features/admin/organization/organization-management.component').then(m => m.OrganizationManagementComponent)
      }
    ]
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: ''
  }
];
