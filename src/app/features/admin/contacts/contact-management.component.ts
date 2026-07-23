import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../core/constants/environment';

export interface ContactRequestItem {
  id: number;
  fullName: String;
  phone: string;
  email: string;
  serviceType: string;
  content: string;
  status: number; // 0: Chưa phản hồi, 1: Đã phản hồi
  createdAt: string;
}

@Component({
  selector: 'app-contact-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './contact-management.component.html',
  styleUrl: './contact-management.component.scss'
})
export class ContactManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  requests: ContactRequestItem[] = [];
  loading = false;

  // Filters & Pagination
  searchQuery = '';
  selectedStatus: number | '' = '';
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  // Modal View Detail
  showDetailModal = false;
  selectedItem: ContactRequestItem | null = null;

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    let url = `${environment.apiHost}/api/contact?page=${this.page}&size=${this.size}`;
    if (this.searchQuery) {
      url += `&search=${encodeURIComponent(this.searchQuery)}`;
    }
    if (this.selectedStatus !== '') {
      url += `&status=${this.selectedStatus}`;
    }

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.requests = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách liên hệ:', err);
        this.toastService.error('Không thể tải danh sách yêu cầu liên hệ');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.loadRequests();
  }

  onStatusFilterChange(): void {
    this.page = 0;
    this.loadRequests();
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadRequests();
  }

  openDetail(item: ContactRequestItem): void {
    this.selectedItem = item;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedItem = null;
  }

  toggleStatus(item: ContactRequestItem): void {
    const newStatus = item.status === 0 ? 1 : 0;
    const updateUrl = `${environment.apiHost}/api/contact/${item.id}/status`;

    this.http.put<ContactRequestItem>(updateUrl, { status: newStatus }).subscribe({
      next: (updated) => {
        item.status = updated.status;
        const msg = updated.status === 1 ? 'Đã đánh dấu ĐÃ PHẢN HỒI' : 'Đã chuyển về CHƯA PHẢN HỒI';
        this.toastService.success(msg);
      },
      error: (err) => {
        console.error('Lỗi khi đổi trạng thái:', err);
        this.toastService.error('Cập nhật trạng thái thất bại');
      }
    });
  }

  deleteRequest(item: ContactRequestItem): void {
    if (confirm(`Bạn có chắc chắn muốn xóa yêu cầu tư vấn của "${item.fullName}" không?`)) {
      const deleteUrl = `${environment.apiHost}/api/contact/${item.id}`;
      this.http.delete(deleteUrl).subscribe({
        next: () => {
          this.toastService.success('Xóa yêu cầu thành công.');
          this.loadRequests();
          if (this.showDetailModal) {
            this.closeDetail();
          }
        },
        error: (err) => {
          console.error('Lỗi khi xóa:', err);
          this.toastService.error('Xóa yêu cầu thất bại');
        }
      });
    }
  }
}
