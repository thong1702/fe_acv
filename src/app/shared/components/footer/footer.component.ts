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
          this.safeContactInfo = this.sanitizer.bypassSecurityTrustHtml(info.contactInfo);
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải thông tin footer:', err);
      }
    });
  }
}
