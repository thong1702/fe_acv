import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (confirmService.config(); as cfg) {
      <div class="confirm-backdrop animate-fade" (click)="confirmService.handleCancel()">
        <div class="confirm-card animate-pop" (click)="$event.stopPropagation()">
          <div class="confirm-header">
            <div class="confirm-icon-wrap" [class.danger]="cfg.danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
            <h3>{{ cfg.title }}</h3>
          </div>
          <div class="confirm-body">
            <p class="confirm-message">{{ cfg.message }}</p>
          </div>
          <div class="confirm-actions">
            <button type="button" class="btn-confirm-cancel" (click)="confirmService.handleCancel()">
              {{ cfg.cancelText }}
            </button>
            <button type="button" class="btn-confirm-ok" [class.danger]="cfg.danger" (click)="confirmService.handleConfirm()">
              {{ cfg.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .confirm-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      z-index: 999999 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .confirm-card {
      background: white;
      border-radius: 20px;
      padding: 28px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);
      border: 1px solid rgba(226, 232, 240, 0.8);
      text-align: center;
    }

    .confirm-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .confirm-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #fee2e2;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.08);

      svg {
        width: 28px;
        height: 28px;
      }
    }

    .confirm-header h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .confirm-body {
      margin-bottom: 24px;
    }

    .confirm-message {
      font-size: 0.95rem;
      color: #475569;
      line-height: 1.5;
      margin: 0;
    }

    .confirm-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .btn-confirm-cancel, .btn-confirm-ok {
      flex: 1;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-confirm-cancel {
      background: #f1f5f9;
      color: #475569;

      &:hover {
        background: #e2e8f0;
        color: #0f172a;
      }
    }

    .btn-confirm-ok.danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(239, 68, 68, 0.4);
      }
    }

    .animate-pop {
      animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes popIn {
      0% {
        opacity: 0;
        transform: scale(0.92) translateY(10px);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `]
})
export class ConfirmDialogComponent {
  confirmService = inject(ConfirmDialogService);
}
