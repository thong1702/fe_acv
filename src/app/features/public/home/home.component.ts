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

  specializedServices = [
    {
      title: 'Dịch vụ Thẩm định giá',
      icon: '⚖️',
      gradient: 'radial-gradient(circle at 30% 30%, #4a90e2 0%, #2b5f97 100%)',
      items: [
        'Thẩm định giá bất động sản',
        'Thẩm định giá máy móc thiết bị',
        'Thẩm định giá phương tiện vận tải',
        'Thẩm định giá là giá trị sở hữu trí tuệ về công nghệ, quy trình kinh doanh hoặc bằng sáng chế',
        'Xác định giá trị doanh nghiệp'
      ]
    },
    {
      title: 'Dịch vụ tư vấn',
      icon: '💡',
      gradient: 'radial-gradient(circle at 30% 30%, #3677ba 0%, #0f3f75 100%)',
      items: [
        'Tư vấn xử lý vướng mắc về các loại thuế, tiết kiệm chi phí thuế',
        'Tư vấn miễn, giảm, ưu đãi thuế, tư vấn hoàn thuế',
        'Tư vấn lập Báo cáo, quyết toán thuế',
        'Thuế thu nhập cá nhân và các dịch vụ thuế quốc tế',
        'Tư vấn thiết lập hệ thống kiểm soát nội bộ; xây dựng các quy chế kiểm soát nội bộ phù hợp với mô hình doanh nghiệp',
        'Tư vấn cho doanh nghiệp tham gia thị trường chứng khoán'
      ]
    },
    {
      title: 'Dịch vụ kế toán',
      icon: '📊',
      gradient: 'radial-gradient(circle at 30% 30%, #50e3c2 0%, #2b5f97 100%)',
      items: [
        'Ghi chép và giữ sổ sách kế toán cho doanh nghiệp',
        'Tư vấn lựa chọn hình thức sổ và tổ chức bộ máy kế toán',
        'Tư vấn xử lý các vướng mắc trong nghiệp vụ kế toán',
        'Tuyển chọn nhân viên kế toán và kế toán trưởng',
        'Tư vấn lập Báo cáo tài chính theo yêu cầu của Công ty mẹ',
        'Tư vấn cho doanh nghiệp chuyển đổi Báo cáo tài chính',
        'Tư vấn xây dựng hệ thống kế toán phù hợp với yêu cầu quản lý (bao gồm cả lựa chọn phần mềm kế toán phù hợp)'
      ]
    },
    {
      title: 'Dịch vụ Đào tạo',
      icon: '🎓',
      gradient: 'radial-gradient(circle at 30% 30%, #3a7bd5 0%, #3a6073 100%)',
      items: [
        'Tổ chức các khóa học về kế toán, kiểm toán, quản trị tài chính cho doanh nghiệp',
        'Đào tạo cấp chứng chỉ Kiểm toán thực hành',
        'Đào tạo về quản trị Doanh nghiệp',
        'Đào tạo kiểm toán nội bộ, quản lý rủi ro doanh nghiệp'
      ]
    }
  ];

  previewUrl: SafeResourceUrl | null = null;
  previewDocTitle = '';
  previewDocType = '';
  previewDocId: number | null = null;
  docxLoading = false;
  docxRenderError = false;

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
}
