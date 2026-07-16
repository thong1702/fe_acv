import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CategoryService} from '../../../core/services/category.service';
import {Category} from '../../../core/models/models';
import {catchError, map, of} from 'rxjs';
import {AdminCountService} from '../../../core/services/admin-count.service';
import {ToastService} from '../../../core/services/toast.service';

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  'POST': {label: 'Tin Tức', color: '#6366f1', bg: '#eef2ff', icon: '📰'},
  'BUSINESS': {label: 'Lĩnh Vực', color: '#10b981', bg: '#ecfdf5', icon: '🏢'},
};

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './category-management.component.html'
})
export class CategoryManagementComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private countService = inject(AdminCountService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  filterType: 'ALL' | 'POST' | 'BUSINESS' = 'ALL';

  get allCount() {
    return this.categories.length;
  }

  get postCount() {
    return this.categories.filter(c => c.type === 'POST').length;
  }

  get bizCount() {
    return this.categories.filter(c => c.type === 'BUSINESS').length;
  }

  showModal = false;
  editCategoryId: number | null = null;
  categoryForm = this.fb.group({
    name: ['', Validators.required],
    slug: ['', Validators.required],
    type: ['POST', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().pipe(map(res => res.content), catchError(() => of([]))).subscribe({
      next: (cats) => {
        this.categories = cats;
        this.applyFilter();
      }
    });
  }

  setFilter(type: 'ALL' | 'POST' | 'BUSINESS'): void {
    this.filterType = type;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.filterType === 'ALL') {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(c => c.type === this.filterType);
    }
  }

  getTypeLabel(type: string): string {
    return TYPE_CONFIG[type]?.label || type;
  }

  getTypeColor(type: string): string {
    return TYPE_CONFIG[type]?.color || '#64748b';
  }

  getTypeBg(type: string): string {
    return TYPE_CONFIG[type]?.bg || '#f1f5f9';
  }

  getTypeIcon(type: string): string {
    return TYPE_CONFIG[type]?.icon || '📂';
  }

  deleteCategory(cat: Category): void {
    if (!cat.id) return;
    if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}" không?`)) {
      this.categoryService.deleteCategory(cat.id).subscribe({
        next: () => {
          this.toastService.success('Xóa danh mục thành công.');
          this.loadCategories();
          this.countService.triggerRefresh();
        },
        error: () => {
          this.toastService.error('Xóa danh mục thất bại.');
          this.categories = this.categories.filter(c => c.id !== cat.id);
          this.applyFilter();
          this.countService.triggerRefresh();
        }
      });
    }
  }

  openModal(cat?: Category): void {
    this.showModal = true;
    if (cat) {
      this.editCategoryId = cat.id || null;
      this.categoryForm.patchValue({name: cat.name, slug: cat.slug, type: cat.type, description: cat.description});
    } else {
      this.editCategoryId = null;
      this.categoryForm.reset({name: '', slug: '', type: 'POST', description: ''});
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editCategoryId = null;
  }

  onNameChange(): void {
    const name = this.categoryForm.get('name')?.value;
    if (name) this.categoryForm.patchValue({slug: this.generateSlug(name)});
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
    str = str.replace(/\s+/g, '-').replace(/-+/g, '-');
    return str.trim().replace(/^-+|-+$/g, '');
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) return;
    const catData = this.categoryForm.value as Category;
    if (this.editCategoryId) {
      catData.id = this.editCategoryId;
      this.categoryService.updateCategory(this.editCategoryId, catData).subscribe({
        next: () => {
          this.toastService.success('Cập nhật danh mục thành công.');
          this.loadCategories();
          this.closeModal();
          this.countService.triggerRefresh();
        },
        error: () => {
          this.toastService.error('Cập nhật danh mục thất bại.');
          this.loadCategories();
          this.closeModal();
          this.countService.triggerRefresh();
        }
      });
    } else {
      this.categoryService.createCategory(catData).subscribe({
        next: () => {
          this.toastService.success('Tạo danh mục mới thành công.');
          this.loadCategories();
          this.closeModal();
          this.countService.triggerRefresh();
        },
        error: () => {
          this.toastService.error('Tạo danh mục mới thất bại.');
          this.loadCategories();
          this.closeModal();
          this.countService.triggerRefresh();
        }
      });
    }
  }
}
