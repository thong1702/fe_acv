import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {forkJoin, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {CategoryService} from '../../../core/services/category.service';
import {PostService} from '../../../core/services/post.service';
import {DocumentService} from '../../../core/services/document.service';
import {UserService} from '../../../core/services/user.service';
import {DocumentInfo, Post} from '../../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private postService = inject(PostService);
  private docService = inject(DocumentService);
  private userService = inject(UserService);

  catCount = 0;
  postCount = 0;
  docCount = 0;
  userCount = 0;

  recentPosts: Post[] = [];
  recentDocs: DocumentInfo[] = [];
  adminNote = localStorage.getItem('acv_admin_note') || '';

  saveNote(event: any): void {
    const val = event.target?.value || '';
    this.adminNote = val;
    localStorage.setItem('acv_admin_note', val);
  }

  private avatarColors: Record<string, string> = {
    'Tin tức': 'var(--primary-color)',
    'Công nghệ': '#0ea5e9',
    'Tuyển dụng': '#10b981',
    'Nội bộ': '#f59e0b',
  };

  ngOnInit(): void {
    forkJoin({
      cats: this.categoryService.getCategories({ page: 0, size: 1 }).pipe(catchError(() => of({ totalElements: 0 }))),
      posts: this.postService.getPosts({page: 0, size: 5}).pipe(catchError(() => of({
        content: [],
        totalElements: 0,
        totalPages: 1
      }))),
      docs: this.docService.getDocuments({page: 0, size: 5}).pipe(catchError(() => of({
        content: [],
        totalElements: 0,
        totalPages: 1
      }))),
      users: this.userService.getUsers({ page: 0, size: 1 }).pipe(catchError(() => of({ totalElements: 0 })))
    }).subscribe({
      next: (res) => {
        this.catCount = res.cats.totalElements || 0;
        this.postCount = res.posts.totalElements || 0;
        this.docCount = res.docs.totalElements || 0;
        this.userCount = res.users.totalElements || 0;
        this.recentPosts = res.posts.content || [];
        this.recentDocs = res.docs.content || [];
      }
    });
  }

  getAvatarColor(category: string): string {
    return this.avatarColors[category] || 'var(--primary-color)';
  }

  formatBytes(bytes: number, decimals = 1): string {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }
}
