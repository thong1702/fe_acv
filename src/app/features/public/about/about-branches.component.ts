import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-branches',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-branches.component.html',
  styleUrl: './about.component.scss'
})
export class AboutBranchesComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit(): void {
    this.titleService.setTitle('Hệ thống chi nhánh | ACV Thẩm định giá');
    this.metaService.updateTag({
      name: 'description',
      content: 'Hệ thống các Chi nhánh chính thức của Công ty TNHH Tư vấn và Định giá ACV tại TP. Hồ Chí Minh và Nghệ An.'
    });
  }
}
