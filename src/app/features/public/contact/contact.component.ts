import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { CompanyInfoService } from '../../../core/services/company-info.service';
import { CompanyInfo } from '../../../core/models/models';
import { environment } from '../../../core/constants/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private companyInfoService = inject(CompanyInfoService);

  companyInfo: CompanyInfo | null = null;
  submitting = false;
  submitSuccess = false;

  contactForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s\-()]{9,15}$/)]],
    email: ['', [Validators.email]],
    serviceType: ['Thẩm Định Giá Bất Động Sản', Validators.required],
    content: ['']
  });

  servicesList = [
    'Thẩm Định Giá Bất Động Sản',
    'Thẩm Định Giá Doanh Nghiệp',
    'Thẩm Định Giá Động Sản (Máy Móc Thiết Bị)',
    'Thẩm Định Giá Dự Án Đầu Tư',
    'Dịch Vụ Kiểm Toán & Kế Toán',
    'Tư Vấn Pháp Lý & Tài Chính',
    'Yêu Cầu Khác'
  ];

  ngOnInit(): void {
    this.companyInfoService.getCompanyInfo().subscribe({
      next: (info) => { this.companyInfo = info; },
      error: () => {}
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.toastService.error('Vui lòng kiểm tra và điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    this.submitting = true;
    const submitUrl = `${environment.apiHost}/api/contact/submit`;

    this.http.post(submitUrl, this.contactForm.value).subscribe({
      next: () => {
        this.submitting = false;
        this.submitSuccess = true;
        this.toastService.success('Gửi yêu cầu tư vấn thành công! Chuyên viên ACV sẽ sớm liên hệ với Quý khách.');
        this.contactForm.reset({
          fullName: '',
          phone: '',
          email: '',
          serviceType: 'Thẩm Định Giá Bất Động Sản',
          content: ''
        });
      },
      error: (err) => {
        this.submitting = false;
        console.error('Lỗi khi gửi yêu cầu tư vấn:', err);
        this.toastService.error('Không thể gửi yêu cầu. Vui lòng thử lại sau hoặc liên hệ Hotline trực tiếp!');
      }
    });
  }
}
