import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Meta, Title} from '@angular/platform-browser';
import {PostService} from '../../../core/services/post.service';
import {CategoryService} from '../../../core/services/category.service';
import {Category, Post} from '../../../core/models/models';
import {PaginationComponent} from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  templateUrl: './post-list.component.html'
})
export class PostListComponent implements OnInit {
  private postService = inject(PostService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  posts: Post[] = [];
  categories: Category[] = [];

  loading = false;
  searchQuery = '';
  selectedCategoryId?: number;

  // Pagination
  page = 0;
  size = 12;
  totalPages = 0;

  ngOnInit(): void {
    this.titleService.setTitle('Tin tức & Sự kiện | Corporate Portal');
    this.metaService.updateTag({
      name: 'description',
      content: 'Xem toàn bộ các bài viết tin tức, hoạt động, thông tin ngành nghề và sự kiện mới nhất của doanh nghiệp chúng tôi.'
    });

    // Load categories first
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.content;
      }
    });

    // Watch query params
    this.route.queryParams.subscribe(params => {
      this.page = params['page'] ? parseInt(params['page']) : 0;
      this.searchQuery = params['search'] || '';
      this.selectedCategoryId = params['categoryId'] ? parseInt(params['categoryId']) : undefined;
      this.loadPosts();
    });
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getPosts({
      page: this.page,
      size: this.size,
      search: this.searchQuery,
      categoryId: this.selectedCategoryId,
      status: 'PUBLISHED'
    }).subscribe({
      next: (res) => {
        this.posts = res.content;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải danh sách bài viết:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.updateRoute();
  }

  filterByCategory(catId?: number): void {
    this.selectedCategoryId = catId;
    this.page = 0;
    this.updateRoute();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.updateRoute();
  }

  private updateRoute(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.page || null,
        search: this.searchQuery || null,
        categoryId: this.selectedCategoryId || null
      },
      queryParamsHandling: 'merge'
    });
  }
}
