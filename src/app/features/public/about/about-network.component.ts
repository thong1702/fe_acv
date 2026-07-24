import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CompanyNetworkComponent } from '../../../shared/components/company-network/company-network.component';

@Component({
  selector: 'app-about-network',
  standalone: true,
  imports: [CommonModule, RouterModule, CompanyNetworkComponent],
  templateUrl: './about-network.component.html',
  styleUrl: './about.component.scss'
})
export class AboutNetworkComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit(): void {
    this.titleService.setTitle('Mạng lưới hoạt động | ACV Thẩm định giá');
    this.metaService.updateTag({
      name: 'description',
      content: 'Mạng lưới hoạt động phủ sóng toàn quốc của Công ty TNHH Tư vấn và Định giá ACV trên 63 tỉnh thành với 7 vị trí trọng điểm.'
    });
  }
}
