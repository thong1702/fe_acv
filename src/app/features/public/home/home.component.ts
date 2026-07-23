import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {catchError, forkJoin, map, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {CompanyInfoService} from '../../../core/services/company-info.service';
import {CategoryService} from '../../../core/services/category.service';
import {PostService} from '../../../core/services/post.service';
import {DocumentService} from '../../../core/services/document.service';
import { Category, CompanyInfo, DocumentInfo, Post } from '../../../core/models/models';
import { Title, Meta, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../core/constants/environment';
import { CountUpDirective } from '../../../shared/directives/count-up.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CountUpDirective],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private companyService = inject(CompanyInfoService);
  private categoryService = inject(CategoryService);
  private postService = inject(PostService);
  private docService = inject(DocumentService);
  private sanitizer = inject(DomSanitizer);
  private http = inject(HttpClient);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  companyInfo: CompanyInfo | null = null;
  businessSectors: Category[] = [];
  latestPosts: Post[] = [];
  latestDocuments: DocumentInfo[] = [];

  previewUrl: SafeResourceUrl | null = null;
  previewDocTitle = '';
  previewDocType = '';
  previewDocId: number | null = null;
  previewIsImage = false;
  docxLoading = false;
  docxRenderError = false;
  pdfLoading = false;
  pdfPages: string[] = [];
  showPreviewModal = false;

  ngOnInit(): void {
    this.titleService.setTitle('Công ty TNHH Tư vấn và Định giá ACV');
    this.metaService.updateTag({
      name: 'description',
      content: 'Công ty TNHH Tư vấn và Định giá ACV - Đơn vị tư vấn, thẩm định giá tài sản, doanh nghiệp, bất động sản uy tín với hơn 14 năm kinh nghiệm.'
    });

    forkJoin({
      company: this.companyService.getCompanyInfo().pipe(catchError(() => of(null))),
      sectors: this.categoryService.getCategoriesByType('BUSINESS').pipe(map(res => res.content), catchError(() => of([]))),
      posts: this.postService.getPosts({
        page: 0,
        size: 6,
        status: 'PUBLISHED'
      }).pipe(catchError(() => of({content: []} as any))),
      docs: this.docService.getDocuments({page: 0, size: 5}).pipe(catchError(() => of({content: []} as any)))
    }).subscribe({
      next: (res) => {
        this.companyInfo = res.company;
        this.businessSectors = res.sectors || [];
        this.latestPosts = res.posts?.content || [];
        this.latestDocuments = res.docs?.content || [];
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu trang chủ:', err);
      }
    });
  }

  previewDocument(doc: DocumentInfo): void {
    if (!doc.id) return;
    this.showPreviewModal = true;
    this.previewDocTitle = doc.title;
    this.previewDocType = doc.fileType ? doc.fileType.toUpperCase() : 'PDF';
    this.previewDocId = doc.id;

    const filePath = doc.filePath || '';
    const isDirectUrl = filePath.startsWith('http://') || filePath.startsWith('https://');

    this.previewIsImage = false;
    if (isDirectUrl) {
      if (this.previewDocType === 'PDF') {
        this.pdfLoading = true;
        this.previewUrl = null;
        const pdfPath = filePath.includes('#') ? filePath : `${filePath}#toolbar=0&navpanes=0`;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfPath);
        this.pdfLoading = false;
      } else if (this.previewDocType === 'DOCX' || this.previewDocType === 'DOC') {
        this.docxLoading = true;
        this.docxRenderError = false;
        this.previewUrl = null;
        fetch(filePath)
          .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.blob(); })
          .then(blob => {
            setTimeout(() => {
              const container = document.getElementById('docx-container');
              if (container) {
                container.innerHTML = '';
                import('docx-preview').then(docx => {
                  docx.renderAsync(blob, container)
                    .then(() => { this.docxLoading = false; })
                    .catch(() => { this.docxLoading = false; this.docxRenderError = true; });
                }).catch(() => { this.docxLoading = false; this.docxRenderError = true; });
              } else { this.docxLoading = false; this.docxRenderError = true; }
            }, 50);
          })
          .catch(() => { this.docxLoading = false; this.docxRenderError = true; });
      } else {
        const pdfPath = filePath.includes('#') ? filePath : `${filePath}#toolbar=0&navpanes=0`;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfPath);
      }
      return;
    }

    const rawUrl = `${environment.apiHost}/api/documents/download/${doc.id}?inline=true#toolbar=0&navpanes=0`;
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
                  .then(() => { this.docxLoading = false; })
                  .catch(() => { this.docxLoading = false; this.docxRenderError = true; });
              }).catch(() => { this.docxLoading = false; this.docxRenderError = true; });
            } else { this.docxLoading = false; this.docxRenderError = true; }
          }, 50);
        },
        error: () => { this.docxLoading = false; this.docxRenderError = true; }
      });
    }
  }

  private fallbackPdfFetch(id: number, filePath: string): void {
    const downloadApi = `${environment.apiHost}/api/documents/download/${id}?inline=true`;
    fetch(downloadApi)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(pdfBlob);
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        this.pdfLoading = false;
      })
      .catch(() => {
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(filePath);
        this.pdfLoading = false;
      });
  }

  closePreview(): void {
    this.showPreviewModal = false;
    this.previewUrl = null;
    this.previewDocTitle = '';
    this.previewDocType = '';
    this.previewDocId = null;
    this.previewIsImage = false;
    this.docxLoading = false;
    this.docxRenderError = false;
    this.pdfLoading = false;
    this.pdfPages = [];
  }

  getDownloadUrl(id: number): string {
    return this.docService.getDownloadUrl(id);
  }
}
