import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
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
export class AboutOrganizationComponent implements OnInit, OnDestroy {
  private orgService = inject(OrganizationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  orgNodes = ORG_STRUCTURE_NODES;
  employees: OrganizationNode[] = [];
  displayLeaders: OrganizationNode[] = [];
  loadingOrg = true;
  defaultAvatar = DEFAULT_AVATAR;

  selectedEmployee: OrganizationNode | null = null;

  // Infinite Slider controls for Ban Lãnh Đạo
  currentTrackIndex = 0;
  visibleCards = 3;
  cloneOffset = 3;
  isTransitioning = true;
  private autoSlideTimer: any = null;
  private resetTimeout: any = null;
  isPaused = false;
  progressState = true;

  resetProgressBar(): void {
    this.progressState = false;
    setTimeout(() => {
      this.progressState = true;
    }, 20);
  }

  private touchStartX = 0;
  private touchEndX = 0;

  @HostListener('window:resize')
  onResize(): void {
    this.updateVisibleCards();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Tổ chức nhân sự | ACV Thẩm định giá');
    this.metaService.updateTag({
      name: 'description',
      content: 'Sơ đồ cơ cấu tổ chức bộ máy quản lý & điều hành và danh sách nhân sự chủ chốt, Thẩm định viên của Công ty TNHH Tư vấn và Định giá ACV.'
    });

    this.updateVisibleCards();

    this.orgService.getNodes().subscribe({
      next: (nodes) => {
        this.employees = nodes as OrganizationNode[];
        this.loadingOrg = false;
        this.autoCenterTree();
        this.setupInfiniteLeaders();
        this.startAutoSlide();
      },
      error: () => {
        this.loadingOrg = false;
        this.setupInfiniteLeaders();
        this.startAutoSlide();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  getBoardOfDirectors(): OrganizationNode[] {
    return this.employees.filter(emp => emp.personnelGroup?.includes('BAN_LANH_DAO'));
  }

  setupInfiniteLeaders(): void {
    const raw = this.getBoardOfDirectors();
    if (raw.length === 0) {
      this.displayLeaders = [];
      return;
    }

    if (raw.length <= this.visibleCards) {
      this.displayLeaders = [...raw];
      this.currentTrackIndex = 0;
      return;
    }

    this.cloneOffset = this.visibleCards;
    const prepended = raw.slice(-this.cloneOffset);
    const appended = raw.slice(0, this.cloneOffset);

    this.displayLeaders = [...prepended, ...raw, ...appended];
    this.currentTrackIndex = this.cloneOffset;
  }

  updateVisibleCards(): void {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width <= 576) {
        this.visibleCards = 1;
      } else if (width <= 992) {
        this.visibleCards = 2;
      } else {
        this.visibleCards = 3;
      }
      this.setupInfiniteLeaders();
    }
  }

  nextLeader(): void {
    const rawLen = this.getBoardOfDirectors().length;
    if (rawLen <= this.visibleCards) return;

    this.isTransitioning = true;
    this.currentTrackIndex++;
    this.resetProgressBar();

    if (this.currentTrackIndex >= rawLen + this.cloneOffset) {
      this.scheduleLoopReset(this.cloneOffset);
    }
  }

  prevLeader(): void {
    const rawLen = this.getBoardOfDirectors().length;
    if (rawLen <= this.visibleCards) return;

    this.isTransitioning = true;
    this.currentTrackIndex--;
    this.resetProgressBar();

    if (this.currentTrackIndex < this.cloneOffset) {
      this.scheduleLoopReset(rawLen + this.cloneOffset - 1);
    }
  }

  private scheduleLoopReset(targetIndex: number): void {
    if (this.resetTimeout) clearTimeout(this.resetTimeout);
    this.resetTimeout = setTimeout(() => {
      this.isTransitioning = false;
      this.currentTrackIndex = targetIndex;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.isTransitioning = true;
        });
      });
    }, 500);
  }

  goToLeader(realIndex: number): void {
    const rawLen = this.getBoardOfDirectors().length;
    if (rawLen <= this.visibleCards) return;
    this.isTransitioning = true;
    this.currentTrackIndex = realIndex + this.cloneOffset;
    this.resetProgressBar();
  }

  getRealActiveIndex(): number {
    const rawLen = this.getBoardOfDirectors().length;
    if (rawLen === 0) return 0;
    const normalized = (this.currentTrackIndex - this.cloneOffset) % rawLen;
    return normalized < 0 ? normalized + rawLen : normalized;
  }

  getDotIndices(): number[] {
    const rawLen = this.getBoardOfDirectors().length;
    if (rawLen <= this.visibleCards) return [];
    return Array.from({ length: rawLen }, (_, i) => i);
  }

  getSliderTransform(): string {
    const k = this.currentTrackIndex;
    const v = this.visibleCards;
    return `translateX(calc(-1 * ${k} * (100% + 24px) / ${v}))`;
  }

  getSliderTransition(): string {
    return this.isTransitioning ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
  }

  startAutoSlide(): void {
    this.stopAutoSlide();
    this.autoSlideTimer = setInterval(() => {
      if (!this.isPaused && this.getBoardOfDirectors().length > this.visibleCards) {
        this.nextLeader();
      }
    }, 2500);
  }

  stopAutoSlide(): void {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = null;
    }
  }

  pauseAutoSlide(): void {
    this.isPaused = true;
  }

  resumeAutoSlide(): void {
    this.isPaused = false;
  }

  onTouchStart(event: TouchEvent): void {
    this.pauseAutoSlide();
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
    this.resumeAutoSlide();
  }

  // Expanded Degree Toggle State
  expandedDegreeMap: { [key: number]: boolean } = {};

  toggleDegree(leaderId: number | undefined, event: Event): void {
    event.stopPropagation();
    if (leaderId === undefined) return;
    this.expandedDegreeMap[leaderId] = !this.expandedDegreeMap[leaderId];
  }

  isDegreeExpanded(leaderId: number | undefined): boolean {
    if (leaderId === undefined) return false;
    return !!this.expandedDegreeMap[leaderId];
  }

  getBadgeTier(position: string | undefined): 'gold' | 'silver' | 'primary' {
    if (!position) return 'primary';
    const posUpper = position.toUpperCase();
    if (posUpper.includes('CHỦ TỊCH') || (posUpper.includes('TỔNG GIÁM ĐỐC') && !posUpper.includes('PHÓ'))) {
      return 'gold';
    }
    if (posUpper.includes('PHÓ TỔNG GIÁM ĐỐC') || posUpper.includes('PHÓ GIÁM ĐỐC')) {
      return 'silver';
    }
    return 'primary';
  }

  getInitials(name: string | undefined): string {
    if (!name || !name.trim()) return 'ACV';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    if (parts.length === 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0][0] + parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  isCenterSlide(index: number): boolean {
    if (this.visibleCards === 3) {
      return index === this.currentTrackIndex + 1;
    }
    return index === this.currentTrackIndex;
  }

  private handleSwipe(): void {
    const swipeThreshold = 40;
    if (this.touchStartX - this.touchEndX > swipeThreshold) {
      this.nextLeader();
    } else if (this.touchEndX - this.touchStartX > swipeThreshold) {
      this.prevLeader();
    }
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

  getDegreesList(degree: string | undefined): string[] {
    if (!degree || !degree.trim()) return [];
    return degree
      .split(/[\n–—]/)
      .flatMap(part => part.split(' - '))
      .map(item => item.trim())
      .filter(item => item.length > 0);
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

  onAvatarError(event: any, leader?: OrganizationNode): void {
    if (leader) {
      leader.avatarUrl = '';
    }
    if (event && event.target) {
      event.target.src = this.defaultAvatar;
    }
  }
}


