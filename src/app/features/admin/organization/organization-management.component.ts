import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrganizationService } from '../../../core/services/organization.service';
import { OrganizationNode } from '../../../core/models/models';
import { AdminCountService } from '../../../core/services/admin-count.service';
import { ORG_STRUCTURE_NODES } from '../../../core/constants/organization.constants';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-organization-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PaginationComponent],
  templateUrl: './organization-management.component.html',
  styleUrl: './organization-management.component.scss'
})
export class OrganizationManagementComponent implements OnInit {
  private orgService = inject(OrganizationService);
  private countService = inject(AdminCountService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  nodes: OrganizationNode[] = [];
  filteredNodes: OrganizationNode[] = [];
  paginatedNodes: OrganizationNode[] = [];
  page = 0;
  size = 10;
  totalPages = 1;
  parentFilterList: OrganizationNode[] = [];
  eligibleParents: OrganizationNode[] = [];
  departments = ORG_STRUCTURE_NODES;

  loading = true;
  saving = false;
  showModal = false;
  isEditMode = false;
  editNodeId?: number;
  uploadingAvatar = false;
  avatarPreview = '';

  defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="background-color:%23f1f5f9"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

  searchQuery = '';
  filterParentId = '';

  nodeForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    position: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(1000)]],
    email: ['', [Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(20)]],
    orderIndex: [1],
    parentId: ['', [Validators.required]],
    avatarUrl: ['']
  });

  ngOnInit(): void {
    this.loadNodes();
  }

  loadNodes(): void {
    this.loading = true;
    this.orgService.getNodes().subscribe({
      next: (data) => {
        this.nodes = data;
        this.parentFilterList = data.filter(n => this.isManager(n.id));
        this.filterNodes();
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách cơ cấu:', err);
        this.loading = false;
      }
    });
  }

  filterNodes(): void {
    let result = [...this.nodes];

    // Apply Search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(n => 
        n.name.toLowerCase().includes(q) || 
        n.position.toLowerCase().includes(q)
      );
    }

    // Apply Parent ID Filter
    if (this.filterParentId) {
      const pId = parseInt(this.filterParentId);
      result = result.filter(n => n.parentId === pId);
    }

    this.filteredNodes = result;
    this.totalPages = Math.ceil(result.length / this.size) || 1;
    if (this.page >= this.totalPages) {
      this.page = 0;
    }
    this.updatePaginatedNodes();
  }

  updatePaginatedNodes(): void {
    const start = this.page * this.size;
    this.paginatedNodes = this.filteredNodes.slice(start, start + this.size);
  }

  onPageChange(page: number): void {
    this.page = page;
    this.updatePaginatedNodes();
  }

  isManager(id?: number): boolean {
    if (!id) return false;
    return this.nodes.some(n => n.parentId === id);
  }

  onAvatarError(event: any): void {
    event.target.src = this.defaultAvatar;
  }

  onAvatarSelect(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.toastService.warning('Tệp ảnh vượt quá dung lượng cho phép 5MB.');
      return;
    }

    this.uploadingAvatar = true;
    this.orgService.uploadAvatar(file).subscribe({
      next: (res) => {
        this.uploadingAvatar = false;
        this.avatarPreview = res.url;
        this.nodeForm.patchValue({ avatarUrl: res.url });
        this.toastService.success('Tải ảnh đại diện thành công.');
      },
      error: (err) => {
        this.uploadingAvatar = false;
        this.toastService.error('Tải ảnh đại diện thất bại. Vui lòng thử lại!');
        console.error(err);
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.editNodeId = undefined;
    this.avatarPreview = '';
    this.nodeForm.reset({
      name: '',
      position: '',
      description: '',
      email: '',
      phone: '',
      orderIndex: 1,
      parentId: '',
      avatarUrl: ''
    });
    this.eligibleParents = [...this.nodes];
    this.showModal = true;
  }

  openEditModal(node: OrganizationNode): void {
    this.isEditMode = true;
    this.editNodeId = node.id;
    this.avatarPreview = node.avatarUrl || '';
    this.nodeForm.patchValue({
      name: node.name,
      position: node.position,
      description: node.description || '',
      email: node.email || '',
      phone: node.phone || '',
      orderIndex: node.orderIndex || 0,
      parentId: node.parentId ? node.parentId.toString() : '',
      avatarUrl: node.avatarUrl || ''
    });

    // Exclude current node and all its transitive descendants to prevent cyclic parent reference!
    this.eligibleParents = this.nodes.filter(n => n.id !== node.id && !this.isDescendant(n.id, node.id));
    this.showModal = true;
  }

  isDescendant(nodeId?: number, potentialAncestorId?: number): boolean {
    if (!nodeId || !potentialAncestorId) return false;
    let current = this.nodes.find(n => n.id === nodeId);
    while (current && current.parentId) {
      if (current.parentId === potentialAncestorId) {
        return true;
      }
      current = this.nodes.find(n => n.id === current?.parentId);
    }
    return false;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (this.nodeForm.invalid) return;

    this.saving = true;
    const formVal = this.nodeForm.value;
    const parentIdVal = formVal.parentId ? parseInt(formVal.parentId) : null;

    const payload: Partial<OrganizationNode> = {
      name: formVal.name!,
      position: formVal.position!,
      description: formVal.description || '',
      email: formVal.email || '',
      phone: formVal.phone || '',
      orderIndex: formVal.orderIndex || 0,
      parentId: parentIdVal as any,
      avatarUrl: formVal.avatarUrl || ''
    };

    if (this.isEditMode && this.editNodeId) {
      this.orgService.updateNode(this.editNodeId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.toastService.success('Cập nhật nhân sự thành công.');
          this.loadNodes();
          this.countService.triggerRefresh();
        },
        error: (err) => {
          this.saving = false;
          this.toastService.error(err?.error?.message || 'Có lỗi xảy ra khi cập nhật nhân sự.');
        }
      });
    } else {
      this.orgService.createNode(payload).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.toastService.success('Thêm nhân sự mới thành công.');
          this.loadNodes();
          this.countService.triggerRefresh();
        },
        error: (err) => {
          this.saving = false;
          this.toastService.error(err?.error?.message || 'Có lỗi xảy ra khi tạo nhân sự mới.');
        }
      });
    }
  }

  deleteNode(node: OrganizationNode): void {
    if (!node.id) return;
    if (confirm(`Bạn có chắc chắn muốn xóa nhân sự "${node.name}" khỏi cơ cấu tổ chức không?`)) {
      this.orgService.deleteNode(node.id).subscribe({
        next: () => {
          this.toastService.success('Xóa nhân sự thành công.');
          this.loadNodes();
          this.countService.triggerRefresh();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Không thể xóa nhân sự này.');
        }
      });
    }
  }

  getDepartmentName(deptId?: number): string {
    if (!deptId) return 'Chưa phân bộ phận';
    const dept = this.departments.find(d => d.deptId === deptId);
    return dept ? dept.name : 'Chưa phân bộ phận';
  }
}
