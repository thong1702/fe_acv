import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {CompanyInfoService} from '../../../core/services/company-info.service';
import {CompanyInfo} from '../../../core/models/models';
import {catchError, of} from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  private companyService = inject(CompanyInfoService);
  private sanitizer = inject(DomSanitizer);
  companyInfo: CompanyInfo | null = null;
  safeContactInfo: SafeHtml | null = null;
  currentYear = new Date().getFullYear();

ngOnInit(): void {
    this.companyService.getCompanyInfo().pipe(
      catchError(() => of(null))
    ).subscribe({
      next: (info) => {
        this.companyInfo = info;
        if (info?.contactInfo) {
          const cleanedContact = info.contactInfo
            .replace(/([?📍\s]*)(<strong>Trụ sở chính:<\/strong>)/gi, '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" style="display:inline-block; vertical-align:-2px; margin-right:6px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>$2')
            .replace(/([?📍\s]*)(<strong>Văn phòng GD:<\/strong>)/gi, '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" style="display:inline-block; vertical-align:-2px; margin-right:6px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>$2')
            .replace(/([?📞\s]*)(<strong>Hotline:<\/strong>)/gi, '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" style="display:inline-block; vertical-align:-2px; margin-right:6px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>$2')
            .replace(/([?✉️✉\s]*)(<strong>Email:<\/strong>)/gi, '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" style="display:inline-block; vertical-align:-2px; margin-right:6px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>$2');

          this.safeContactInfo = this.sanitizer.bypassSecurityTrustHtml(cleanedContact);
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải thông tin footer:', err);
      }
    });
  }
}
