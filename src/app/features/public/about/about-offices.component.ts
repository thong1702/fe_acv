import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-offices',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-offices.component.html',
  styleUrl: './about.component.scss'
})
export class AboutOfficesComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit(): void {
    this.titleService.setTitle('Hệ thống văn phòng đại diện | ACV Thẩm định giá');
    this.metaService.updateTag({
      name: 'description',
      content: 'Hệ thống 5 Văn phòng đại diện chính thức của Công ty TNHH Tư vấn và Định giá ACV tại Hà Nội, Vĩnh Phúc (Phú Thọ), Điện Biên, Lào Cai, Quảng Ngãi.'
    });
  }
}
