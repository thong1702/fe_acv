import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {UserService} from '../../../core/services/user.service';
import {User} from '../../../core/models/models';
import {catchError, map, of} from 'rxjs';
import {AdminCountService} from '../../../core/services/admin-count.service';
import {ToastService} from '../../../core/services/toast.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);
  private countService = inject(AdminCountService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  showModal = false;
  editUserId: number | null = null;

  userForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['EDITOR', Validators.required],
    enabled: [true]
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().pipe(map(res => res.content), catchError(() => of([]))).subscribe({
      next: (users) => {
        this.users = users;
        this.filterUsers();
      }
    });
  }

  filterUsers(): void {
    if (!this.searchQuery) {
      this.filteredUsers = [...this.users];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredUsers = this.users.filter(u =>
        u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
  }

  onSearch(): void {
    this.filterUsers();
  }

  getAvatarGradient(role: string): string {
    return role === 'ADMIN'
      ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
      : 'linear-gradient(135deg, #0ea5e9, #6366f1)';
  }

  toggleStatus(user: User): void {
    if (!user.id) return;
    this.userService.toggleUserStatus(user.id, !user.enabled).subscribe({
      next: () => {
        this.toastService.success('Cập nhật trạng thái người dùng thành công.');
        this.loadUsers();
      },
      error: () => {
        this.toastService.error('Cập nhật trạng thái người dùng thất bại.');
        const u = this.users.find(x => x.id === user.id);
        if (u) {
          u.enabled = !u.enabled;
          this.filterUsers();
        }
      }
    });
  }

  deleteUser(user: User): void {
    if (!user.id) return;
    if (confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.username}" không?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.toastService.success('Xóa người dùng thành công.');
          this.loadUsers();
          this.countService.triggerRefresh();
        },
        error: () => {
          this.toastService.error('Xóa người dùng thất bại.');
          this.users = this.users.filter(u => u.id !== user.id);
          this.filterUsers();
          this.countService.triggerRefresh();
        }
      });
    }
  }

  openModal(user?: User): void {
    this.showModal = true;
    if (user) {
      this.editUserId = user.id || null;
      this.userForm.patchValue({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        enabled: user.enabled
      });
      this.userForm.get('password')?.clearValidators();
    } else {
      this.editUserId = null;
      this.userForm.reset({username: '', email: '', password: '', role: 'EDITOR', enabled: true});
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.userForm.get('password')?.updateValueAndValidity();
  }

  closeModal(): void {
    this.showModal = false;
    this.editUserId = null;
  }

  saveUser(): void {
    if (this.userForm.invalid) return;
    const userData = this.userForm.value as User;
    if (this.editUserId) {
      userData.id = this.editUserId;
      if (!userData.password) delete userData.password;
      this.userService.updateUser(this.editUserId, userData).subscribe({
        next: () => {
          this.toastService.success('Cập nhật tài khoản thành công.');
          this.loadUsers();
          this.closeModal();
          this.countService.triggerRefresh();
        },
        error: () => {
          this.toastService.error('Cập nhật tài khoản thất bại.');
          this.loadUsers();
          this.closeModal();
          this.countService.triggerRefresh();
        }
      });
    } else {
      this.userService.createUser(userData).subscribe({
        next: () => {
          this.toastService.success('Tạo tài khoản mới thành công.');
          this.loadUsers();
          this.closeModal();
          this.countService.triggerRefresh();
        },
        error: () => {
          this.toastService.error('Tạo tài khoản mới thất bại.');
          this.loadUsers();
          this.closeModal();
          this.countService.triggerRefresh();
        }
      });
    }
  }
}
