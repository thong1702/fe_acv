import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { CompanyInfoService } from '../../../core/services/company-info.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { CompanyInfo, OrganizationNode } from '../../../core/models/models';
import { catchError, forkJoin, of } from 'rxjs';
import { ORG_STRUCTURE_NODES } from '../../../core/constants/organization.constants';

/* ──────────── Tree node (flat → tree conversion) ──────────── */
interface OrgTreeNode extends OrganizationNode {
  children: OrgTreeNode[];
}

/* ─────────── Default avatar (inline SVG, no 404) ─────────── */
const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="background-color:%23f1f5f9"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

/* ─────────── Fallback company info ─────────── */
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  private companyService = inject(CompanyInfoService);
  private orgService = inject(OrganizationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  companyInfo: CompanyInfo | null = null;
  orgNodes = ORG_STRUCTURE_NODES;
  employees: OrganizationNode[] = [];
  loadingOrg = true;

  defaultAvatar = DEFAULT_AVATAR;

  ngOnInit(): void {
    this.titleService.setTitle('Giới thiệu doanh nghiệp | ACV Thẩm định giá');
    this.metaService.updateTag({
      name: 'description',
      content: 'Tìm hiểu về lịch sử hình thành, sơ đồ bộ máy điều hành và thông tin liên hệ chính thức của Công ty TNHH Tư vấn và Định giá ACV.'
    });

    // Load company info & org nodes in parallel
    forkJoin({
      company: this.companyService.getCompanyInfo().pipe(catchError(() => of(null))),
      nodes: this.orgService.getNodes().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ company, nodes }) => {
        this.companyInfo = company;
        this.employees = nodes as OrganizationNode[];
        this.loadingOrg = false;
        this.autoCenterTree();
      },
      error: () => {
        this.companyInfo = null;
        this.loadingOrg = false;
      }
    });
  }

  autoCenterTree(): void {
    setTimeout(() => {
      const container = document.querySelector('.org-tree-container');
      const root = document.querySelector('.org-structure-root');
      if (container && root) {
        const containerWidth = container.clientWidth;
        const rootWidth = root.scrollWidth;
        if (rootWidth > containerWidth) {
          container.scrollLeft = (rootWidth - containerWidth) / 2;
        }
      }
    }, 150);
  }

  getRootNode() {
    return this.orgNodes.find(n => n.type === 'root')!;
  }

  getSideNodesLeft() {
    return this.orgNodes.filter(n => n.type === 'side' && n.id.includes('KIEM_SOAT'));
  }

  getPrimaryNode() {
    return this.orgNodes.find(n => n.type === 'primary')!;
  }

  getSideNodesRight() {
    return this.orgNodes.filter(n => n.type === 'side' && n.id.includes('CO_VAN'));
  }

  getDeptNodes() {
    return this.orgNodes.filter(n => n.type === 'dept');
  }

  getEmployeesByDept(deptId: number): OrganizationNode[] {
    // Sort employees by orderIndex or id
    return this.employees
      .filter(emp => emp.parentId === deptId)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }

  onAvatarError(event: any): void {
    event.target.src = this.defaultAvatar;
  }
}
