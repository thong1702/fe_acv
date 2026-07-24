import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CompanyHistoryComponent } from '../../../shared/components/company-history/company-history.component';

@Component({
  selector: 'app-about-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, CompanyHistoryComponent],
  templateUrl: './about-overview.component.html',
  styleUrl: './about.component.scss'
})
export class AboutOverviewComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit(): void {
    this.titleService.setTitle('Giới thiệu ACV | Thẩm định giá ACV');
    this.metaService.updateTag({
      name: 'description',
      content: 'Giới thiệu về Công ty TNHH Tư vấn và Định giá ACV - Lịch sử 15 năm phát triển, giá trị cốt lõi và các dịch vụ thẩm định giá chuyên nghiệp.'
    });
  }
}
