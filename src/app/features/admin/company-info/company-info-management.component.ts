import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CompanyInfoService} from '../../../core/services/company-info.service';
import {RichTextEditorComponent} from '../../../shared/components/rich-text-editor/rich-text-editor.component';
import {CompanyInfo} from '../../../core/models/models';
import {ToastService} from '../../../core/services/toast.service';

@Component({
  selector: 'app-company-info-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RichTextEditorComponent],
  templateUrl: './company-info-management.component.html',
  styleUrl: './company-info-management.component.scss'
})
export class CompanyInfoManagementComponent implements OnInit {
  private companyService = inject(CompanyInfoService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';
  activeTab = 'contact';

  companyInfoId?: number;

  infoForm = this.fb.group({
    introduction: [''],
    history: [''],
    contactInfo: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadCompanyInfo();
  }

  loadCompanyInfo(): void {
    this.loading = true;
    this.companyService.getCompanyInfo().subscribe({
      next: (info) => {
        if (info) {
          this.companyInfoId = info.id;
          this.infoForm.patchValue({
            introduction: info.introduction,
            history: info.history,
            contactInfo: info.contactInfo
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải thông tin doanh nghiệp:', err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.infoForm.invalid) return;

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const updatedInfo = {
      id: this.companyInfoId,
      ...this.infoForm.value
    } as CompanyInfo;

    this.companyService.updateCompanyInfo(updatedInfo).subscribe({
      next: (res) => {
        this.saving = false;
        this.toastService.success('Cập nhật thông tin doanh nghiệp thành công!');
        this.successMessage = 'Cập nhật thông tin doanh nghiệp thành công!';
        this.companyInfoId = res.id;
      },
      error: (err) => {
        this.saving = false;
        this.toastService.error('Cập nhật thông tin doanh nghiệp thất bại.');
        this.errorMessage = 'Có lỗi xảy ra trong quá trình cập nhật thông tin.';
        console.error('Lỗi khi lưu thông tin công ty:', err);
      }
    });
  }
}
