import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {DocumentService} from '../../../core/services/document.service';
import {DocumentInfo} from '../../../core/models/models';
import {PaginationComponent} from '../../../shared/components/pagination/pagination.component';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {AdminCountService} from '../../../core/services/admin-count.service';
import {ToastService} from '../../../core/services/toast.service';
import {environment} from '../../../core/constants/environment';

@Component({
  selector: 'app-document-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PaginationComponent],
  templateUrl: './document-management.component.html',
  styleUrl: './document-management.component.scss'
})
export class DocumentManagementComponent implements OnInit {
  private docService = inject(DocumentService);
  private fb = inject(FormBuilder);
  private countService = inject(AdminCountService);
  private sanitizer = inject(DomSanitizer);
  private toastService = inject(ToastService);
  private http = inject(HttpClient);

  documents: DocumentInfo[] = [];

  previewUrl: SafeResourceUrl | null = null;
  previewDocTitle = '';
  previewDocType = '';
  previewDocId: number | null = null;
  docxLoading = false;
  docxRenderError = false;

  // Filters & Page settings
  searchQuery = '';
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  loading = false;

  // Modal Control
  showModal = false;
  isEditMode = false;
  selectedDocumentId: number | null = null;
  uploading = false;
  selectedFile: File | null = null;
  fileError = '';

  docForm = this.fb.group({
    docNumber: ['', Validators.required],
    publishDate: ['', Validators.required],
    title: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.docService.getDocuments({
      page: this.page,
      size: this.size,
      search: this.searchQuery || undefined
    }).subscribe({
      next: (res) => {
        this.documents = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách tài liệu:', err);
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadDocuments();
  }

  deleteDocument(doc: DocumentInfo): void {
    if (!doc.id) return;
    if (confirm(`Bạn có chắc chắn muốn xóa văn bản "${doc.docNumber}" không?`)) {
      this.docService.deleteDocument(doc.id).subscribe({
        next: () => {
          this.toastService.success('Xóa văn bản thành công.');
          this.loadDocuments();
          this.countService.triggerRefresh();
        },
        error: (err) => {
          this.toastService.error('Xóa văn bản thất bại.');
          console.error('Lỗi khi xóa văn bản:', err);
          this.countService.triggerRefresh();
        }
      });
    }
  }

  openModal(): void {
    this.isEditMode = false;
    this.selectedDocumentId = null;
    this.showModal = true;
    this.selectedFile = null;
    this.fileError = '';
    this.docForm.reset({
      docNumber: '',
      publishDate: '',
      title: '',
      description: ''
    });
  }

  openEditModal(doc: DocumentInfo): void {
    this.isEditMode = true;
    this.selectedDocumentId = doc.id || null;
    this.showModal = true;
    this.selectedFile = null;
    this.fileError = '';
    
    // Format publishDate to yyyy-MM-dd if it exists
    let formattedDate = '';
    if (doc.publishDate) {
      const dateObj = new Date(doc.publishDate);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString().split('T')[0];
      }
    }
    
    this.docForm.reset({
      docNumber: doc.docNumber || '',
      publishDate: formattedDate,
      title: doc.title || '',
      description: doc.description || ''
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedFile = null;
    this.isEditMode = false;
    this.selectedDocumentId = null;
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['.pdf', '.docx', '.xlsx', '.doc', '.xls'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!allowedTypes.includes(fileExt)) {
        this.fileError = 'Định dạng file không được hỗ trợ. Vui lòng chọn PDF, DOCX hoặc XLSX.';
        this.selectedFile = null;
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        this.fileError = 'Kích thước file không được vượt quá 100MB.';
        this.selectedFile = null;
        return;
      }

      this.fileError = '';
      this.selectedFile = file;
    }
  }

  uploadDocument(): void {
    if (this.docForm.invalid) return;
    if (!this.isEditMode && !this.selectedFile) return;

    this.uploading = true;

    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }
    formData.append('docNumber', this.docForm.value.docNumber!);
    formData.append('publishDate', this.docForm.value.publishDate!);
    formData.append('title', this.docForm.value.title!);
    formData.append('description', this.docForm.value.description || '');

    const request$ = this.isEditMode
      ? this.docService.updateDocument(this.selectedDocumentId!, formData)
      : this.docService.uploadDocument(formData);

    request$.subscribe({
      next: () => {
        this.uploading = false;
        this.toastService.success(this.isEditMode ? 'Cập nhật văn bản thành công.' : 'Tải lên văn bản thành công.');
        this.loadDocuments();
        this.closeModal();
        this.countService.triggerRefresh();
      },
      error: (err) => {
        this.uploading = false;
        this.toastService.error(this.isEditMode ? 'Cập nhật văn bản thất bại.' : 'Tải lên văn bản thất bại.');
        this.fileError = this.isEditMode ? 'Lỗi trong quá trình cập nhật văn bản.' : 'Lỗi trong quá trình tải lên file.';
        console.error('Lưu thất bại:', err);
      }
    });
  }

  previewDocument(doc: DocumentInfo): void {
    if (!doc.id) return;
    this.previewDocTitle = doc.title;
    this.previewDocType = doc.fileType ? doc.fileType.toUpperCase() : 'PDF';
    this.previewDocId = doc.id;
    const rawUrl = `${environment.apiHost}/api/documents/download/${doc.id}?inline=true#toolbar=0`;
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);

    if (this.previewDocType === 'DOCX' || this.previewDocType === 'DOC') {
      this.docxLoading = true;
      this.docxRenderError = false;

      const downloadUrl = `${environment.apiHost}/api/documents/download/${doc.id}`;
      this.http.get(downloadUrl, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          setTimeout(() => {
            const container = document.getElementById('docx-container');
            if (container) {
              container.innerHTML = '';
              import('docx-preview').then(docx => {
                docx.renderAsync(blob, container)
                  .then(() => {
                    this.docxLoading = false;
                  })
                  .catch(err => {
                    console.error('docx-preview rendering error:', err);
                    this.docxLoading = false;
                    this.docxRenderError = true;
                  });
              }).catch(err => {
                console.error('docx-preview import error:', err);
                this.docxLoading = false;
                this.docxRenderError = true;
              });
            } else {
              console.error('docx-container not found in DOM');
              this.docxLoading = false;
              this.docxRenderError = true;
            }
          }, 50);
        },
        error: (err) => {
          console.error('Failed to download document blob:', err);
          this.docxLoading = false;
          this.docxRenderError = true;
        }
      });
    }
  }

  closePreview(): void {
    this.previewUrl = null;
    this.previewDocTitle = '';
    this.previewDocType = '';
    this.previewDocId = null;
    this.docxLoading = false;
    this.docxRenderError = false;
  }

  getDownloadUrl(id: number): string {
    return this.docService.getDownloadUrl(id);
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
