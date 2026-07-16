import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Meta, Title, DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {DocumentService} from '../../../core/services/document.service';
import {DocumentInfo} from '../../../core/models/models';
import {PaginationComponent} from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss'
})
export class DocumentListComponent implements OnInit {
  private docService = inject(DocumentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private sanitizer = inject(DomSanitizer);
  private http = inject(HttpClient);

  documents: DocumentInfo[] = [];
  loading = false;
  searchQuery = '';

  previewUrl: SafeResourceUrl | null = null;
  previewDocTitle = '';
  previewDocType = '';
  previewDocId: number | null = null;
  docxLoading = false;
  docxRenderError = false;

  // Pagination
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    this.titleService.setTitle('Văn bản pháp luật | Corporate Portal');
    this.metaService.updateTag({
      name: 'description',
      content: 'Tra cứu hệ thống văn bản pháp luật, văn bản điều hành, thông báo chính thức ban hành của doanh nghiệp.'
    });

    // Watch query params
    this.route.queryParams.subscribe(params => {
      this.page = params['page'] ? parseInt(params['page']) : 0;
      this.searchQuery = params['search'] || '';
      this.loadDocuments();
    });
  }

  loadDocuments(): void {
    this.loading = true;
    this.docService.getDocuments({
      page: this.page,
      size: this.size,
      search: this.searchQuery
    }).subscribe({
      next: (res) => {
        this.documents = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách văn bản:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.updateRoute();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.updateRoute();
  }

  previewDocument(doc: DocumentInfo): void {
    if (!doc.id) return;
    this.previewDocTitle = doc.title;
    this.previewDocType = doc.fileType ? doc.fileType.toUpperCase() : 'PDF';
    this.previewDocId = doc.id;
    const rawUrl = `http://localhost:8080/api/documents/download/${doc.id}?inline=true#toolbar=0`;
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);

    if (this.previewDocType === 'DOCX' || this.previewDocType === 'DOC') {
      this.docxLoading = true;
      this.docxRenderError = false;

      const downloadUrl = `http://localhost:8080/api/documents/download/${doc.id}`;
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

  private updateRoute(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.page || null,
        search: this.searchQuery || null
      },
      queryParamsHandling: 'merge'
    });
  }
}
