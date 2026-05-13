import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm animate-slide-up"
          [class]="getClass(toast.type)"
        >
          <span>{{ toast.message }}</span>
          <button (click)="toastService.remove(toast.id)" class="ml-2 opacity-60 hover:opacity-100 transition-opacity">✕</button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  getClass(type: string): string {
    const base = 'bg-[#1a1a33] border text-[#e8e8f0]';
    if (type === 'success') return `${base} border-[#22c76a]/30 shadow-[#22c76a]/10`;
    if (type === 'error')   return `${base} border-red-500/30 shadow-red-500/10`;
    return `${base} border-[#2a2a4a]`;
  }
}
