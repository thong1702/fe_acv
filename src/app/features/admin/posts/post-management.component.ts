import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {PostService} from '../../../core/services/post.service';
import {CategoryService} from '../../../core/services/category.service';
import {Category, Post} from '../../../core/models/models';
import {RichTextEditorComponent} from '../../../shared/components/rich-text-editor/rich-text-editor.component';
import {PaginationComponent} from '../../../shared/components/pagination/pagination.component';
import {catchError, map, of} from 'rxjs';
import {AdminCountService} from '../../../core/services/admin-count.service';
import {ToastService} from '../../../core/services/toast.service';

@Component({
  selector: 'app-post-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RichTextEditorComponent, PaginationComponent],
  templateUrl: './post-management.component.html'
})
export class PostManagementComponent implements OnInit {
  private postService = inject(PostService);
  private categoryService = inject(CategoryService);
  private countService = inject(AdminCountService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  posts: Post[] = [];
  categories: Category[] = [];

  searchQuery = '';
  filterCategoryId: string = '';
  filterStatus: string = '';

  page = 0;
  size = 10;
  totalPages = 1;
  loading = false;
  showForm = false;
  uploadingImage = false;
  editPostId: number | null = null;

  postForm = this.fb.group({
    title: ['', Validators.required],
    slug: ['', Validators.required],
    categoryId: ['', Validators.required],
    status: ['DRAFT', Validators.required],
    thumbnail: [''],
    summary: ['', Validators.required],
    content: ['', Validators.required]
  });

  ngOnInit(): void {
    this.categoryService.getCategories().pipe(map(res => res.content), catchError(() => of([]))).subscribe({
      next: (cats) => this.categories = cats
    });
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    
    const categoryIdVal = this.filterCategoryId ? Number(this.filterCategoryId) : undefined;
    const statusVal = this.filterStatus ? (this.filterStatus as 'DRAFT' | 'PUBLISHED') : undefined;

    this.postService.getPosts({
      page: this.page,
      size: this.size,
      search: this.searchQuery || undefined,
      categoryId: categoryIdVal,
      status: statusVal
    }).pipe(catchError(() => of({content: [], totalElements: 0, totalPages: 1}))).subscribe({
      next: (res) => {
        this.posts = res.content || [];
        this.totalPages = res.totalPages || 1;
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadPosts();
  }

  deletePost(post: Post): void {
    if (!post.id) return;
    if (confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}" không?`)) {
      this.postService.deletePost(post.id).subscribe({
        next: () => {
          this.toastService.success('Xóa bài viết thành công.');
          this.loadPosts();
          this.countService.triggerRefresh();
        },
        error: () => {
          this.toastService.error('Xóa bài viết thất bại.');
          this.posts = this.posts.filter(p => p.id !== post.id);
          this.countService.triggerRefresh();
        }
      });
    }
  }

  openForm(post?: Post): void {
    this.showForm = true;
    if (post) {
      this.editPostId = post.id || null;
      this.postForm.patchValue({
        title: post.title,
        slug: post.slug,
        categoryId: post.category?.id?.toString() || '',
        status: post.status,
        thumbnail: post.thumbnail,
        summary: post.summary,
        content: post.content
      });
    } else {
      this.editPostId = null;
      this.postForm.reset({
        title: '',
        slug: '',
        categoryId: '',
        status: 'DRAFT',
        thumbnail: '',
        summary: '',
        content: ''
      });
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.editPostId = null;
  }

  onTitleChange(): void {
    const titleControl = this.postForm.get('title');
    if (titleControl?.value) {
      this.postForm.patchValue({slug: this.generateSlug(titleControl.value)});
    }
  }

  onThumbnailSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadingImage = true;
      this.postService.uploadImage(file).subscribe({
        next: (res) => {
          this.uploadingImage = false;
          this.postForm.patchValue({ thumbnail: res.url });
          this.toastService.success('Tải ảnh đại diện thành công.');
        },
        error: (err) => {
          this.uploadingImage = false;
          this.toastService.error('Tải ảnh đại diện thất bại.');
          console.error(err);
        }
      });
    }
  }

  generateSlug(str: string): string {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/([^a-z0-9\s-]|_)/g, '');
    str = str.replace(/\s+/g, '-');
    str = str.replace(/-+/g, '-');
    return str.trim().replace(/^-+|-+$/g, '');
  }

  savePost(): void {
    if (this.postForm.invalid) return;
    const formVal = this.postForm.value;
    const cat = this.categories.find(c => c.id === parseInt(formVal.categoryId || ''));
    if (!cat) {
      this.toastService.warning('Danh mục không hợp lệ.');
      return;
    }

    const postData: any = {
      title: formVal.title!,
      slug: formVal.slug!,
      category: cat,
      categoryId: cat.id,
      status: formVal.status,
      thumbnail: formVal.thumbnail || '',
      thumbnailUrl: formVal.thumbnail || '',
      summary: formVal.summary!,
      content: formVal.content!,
      viewCount: 0
    };

    if (this.editPostId) {
      this.postService.updatePost(this.editPostId, postData).subscribe({
        next: () => {
          this.toastService.success('Cập nhật bài viết thành công.');
          this.loadPosts();
          this.closeForm();
          this.countService.triggerRefresh();
        },
        error: () => {
          this.toastService.error('Cập nhật bài viết thất bại.');
          this.loadPosts();
          this.closeForm();
          this.countService.triggerRefresh();
        }
      });
    } else {
      this.postService.createPost(postData).subscribe({
        next: () => {
          this.toastService.success('Tạo bài viết mới thành công.');
          this.loadPosts();
          this.closeForm();
          this.countService.triggerRefresh();
        },
        error: () => {
          this.toastService.error('Tạo bài viết mới thất bại.');
          this.loadPosts();
          this.closeForm();
          this.countService.triggerRefresh();
        }
      });
    }
  }
}
