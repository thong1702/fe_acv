import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../../core/services/auth.service';
import {PostService} from '../../../core/services/post.service';
import {CategoryService} from '../../../core/services/category.service';
import {DocumentService} from '../../../core/services/document.service';
import {UserService} from '../../../core/services/user.service';
import {OrganizationService} from '../../../core/services/organization.service';
import {AdminCountService} from '../../../core/services/admin-count.service';
import {environment} from '../../../../environments/environment';
import {forkJoin, of, Subscription} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private postService = inject(PostService);
  private categoryService = inject(CategoryService);
  private docService = inject(DocumentService);
  private userService = inject(UserService);
  private orgService = inject(OrganizationService);
  private countService = inject(AdminCountService);
  private http = inject(HttpClient);
  private router = inject(Router);

  sidebarCollapsed = signal(false);

  postCount = signal(0);
  categoryCount = signal(0);
  documentCount = signal(0);
  userCount = signal(0);
  organizationCount = signal(0);
  contactCount = signal(0);

  private countSub?: Subscription;

  today = new Date().toLocaleDateString('vi-VN', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});

  ngOnInit(): void {
    this.loadCounts();
    this.countSub = this.countService.refresh$.subscribe(() => {
      this.loadCounts();
    });
  }

  ngOnDestroy(): void {
    this.countSub?.unsubscribe();
  }

  loadCounts(): void {
    const isAdmin = this.authService.isAdmin();
    forkJoin({
      posts: this.postService.getPosts({ page: 0, size: 1 }).pipe(catchError(() => of({ totalElements: 0 }))),
      categories: this.categoryService.getCategories({ page: 0, size: 1 }).pipe(catchError(() => of({ totalElements: 0 }))),
      docs: this.docService.getDocuments({ page: 0, size: 1 }).pipe(catchError(() => of({ totalElements: 0 }))),
      users: isAdmin ? this.userService.getUsers({ page: 0, size: 1 }).pipe(catchError(() => of({ totalElements: 0 }))) : of({ totalElements: 0 }),
      orgs: this.orgService.getNodes().pipe(catchError(() => of([]))),
      contacts: this.http.get<any>(`${environment.apiHost}/api/contact?page=0&size=1`).pipe(catchError(() => of({ totalElements: 0 })))
    }).subscribe({
      next: (res) => {
        this.postCount.set(res.posts?.totalElements || 0);
        this.categoryCount.set(res.categories?.totalElements || 0);
        this.documentCount.set(res.docs?.totalElements || 0);
        this.userCount.set(res.users?.totalElements || 0);
        this.organizationCount.set(res.orgs?.length || 0);
        this.contactCount.set(res.contacts?.totalElements || 0);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
