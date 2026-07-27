import { Injectable, signal } from '@angular/core';

export interface ConfirmConfig {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  config = signal<ConfirmConfig | null>(null);

  confirm(options: ConfirmConfig | string, onConfirm?: () => void): void {
    if (typeof options === 'string') {
      this.config.set({
        title: 'Xác Nhận Xóa',
        message: options,
        confirmText: 'Xóa Ngay',
        cancelText: 'Hủy Bỏ',
        danger: true,
        onConfirm: onConfirm || (() => {})
      });
    } else {
      this.config.set({
        title: options.title || 'Xác Nhận Xóa',
        message: options.message,
        confirmText: options.confirmText || 'Xóa Ngay',
        cancelText: options.cancelText || 'Hủy Bỏ',
        danger: options.danger !== false,
        onConfirm: options.onConfirm,
        onCancel: options.onCancel
      });
    }
  }

  handleConfirm(): void {
    const cfg = this.config();
    if (cfg?.onConfirm) {
      cfg.onConfirm();
    }
    this.config.set(null);
  }

  handleCancel(): void {
    const cfg = this.config();
    if (cfg?.onCancel) {
      cfg.onCancel();
    }
    this.config.set(null);
  }
}
