import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { OrganizationService } from '../../../core/services/organization.service';
import { OrganizationNode } from '../../../core/models/models';
import { ORG_STRUCTURE_NODES } from '../../../core/constants/organization.constants';

const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="background-color:%23f1f5f9"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

@Component({
  selector: 'app-about-organization',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-organization.component.html',
  styleUrl: './about.component.scss'
})
export class AboutOrganizationComponent implements OnInit {
  private orgService = inject(OrganizationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  orgNodes = ORG_STRUCTURE_NODES;
  employees: OrganizationNode[] = [];
  loadingOrg = true;
  defaultAvatar = DEFAULT_AVATAR;

  selectedEmployee: OrganizationNode | null = null;

  ngOnInit(): void {
    this.titleService.setTitle('Tổ chức nhân sự | ACV Thẩm định giá');
    this.metaService.updateTag({
      name: 'description',
      content: 'Sơ đồ cơ cấu tổ chức bộ máy quản lý & điều hành và danh sách nhân sự chủ chốt, Thẩm định viên của Công ty TNHH Tư vấn và Định giá ACV.'
    });

    this.orgService.getNodes().subscribe({
      next: (nodes) => {
        this.employees = nodes as OrganizationNode[];
        this.loadingOrg = false;
        this.autoCenterTree();
      },
      error: () => {
        this.loadingOrg = false;
      }
    });
  }

  getBoardOfDirectors(): OrganizationNode[] {
    return this.employees.filter(emp => emp.personnelGroup?.includes('BAN_LANH_DAO'));
  }

  getValuers(): OrganizationNode[] {
    return this.employees.filter(emp => emp.personnelGroup?.includes('THAM_DINH_VIEN'));
  }

  getSpecialists(): OrganizationNode[] {
    return this.employees.filter(emp => emp.personnelGroup?.includes('CHUYEN_VIEN'));
  }

  openProfileModal(emp: OrganizationNode): void {
    this.selectedEmployee = emp;
  }

  closeProfileModal(): void {
    this.selectedEmployee = null;
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
    return [];
  }

  onAvatarError(event: any): void {
    event.target.src = this.defaultAvatar;
  }
}
