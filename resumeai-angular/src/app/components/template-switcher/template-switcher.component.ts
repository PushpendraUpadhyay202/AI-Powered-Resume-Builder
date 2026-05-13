import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ResumeStoreService, TemplateStoreService } from '../../services/store.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-template-switcher',
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="close.emit()">
      <div class="card w-full max-w-2xl animate-slide-up overflow-hidden" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-5 border-b border-[#1a1a33]/60">
          <h3 class="font-semibold text-white">Switch Template</h3>
          <button (click)="close.emit()" class="text-[#7070a0] hover:text-white transition-colors text-lg">✕</button>
        </div>
        <div class="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
          @for (tmpl of tmplStore.templates(); track tmpl.templateId) {
            <button
              (click)="select(tmpl)"
              class="card border overflow-hidden hover:border-[#e8b422]/40 transition-all duration-200 group text-left"
              [class]="tmplStore.selectedTemplate()?.templateId === tmpl.templateId ? 'border-[#e8b422]/50 bg-[#e8b422]/5' : 'border-[#1a1a33]/60'"
            >
              <div class="h-24 bg-gradient-to-br from-[#1a1a33] to-[#131327] flex items-center justify-center relative">
                <span class="text-3xl opacity-30 group-hover:opacity-50 transition-opacity">📄</span>
                @if (tmpl.isPremium && auth.user()?.subscriptionPlan !== 'Premium') {
                  <div class="absolute inset-0 bg-[#0a0a1a]/60 flex items-center justify-center">
                    <span class="text-xl">🔒</span>
                  </div>
                }
                @if (tmplStore.selectedTemplate()?.templateId === tmpl.templateId) {
                  <div class="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#e8b422] flex items-center justify-center text-[10px] text-[#0a0a1a] font-bold">✓</div>
                }
              </div>
              <div class="p-3">
                <p class="text-sm font-medium text-white truncate">{{ tmpl.name }}</p>
                @if (tmpl.isPremium) {
                  <span class="text-[10px] text-[#f0c040]">⭐ Premium</span>
                } @else {
                  <span class="text-[10px] text-[#22c76a]">Free</span>
                }
              </div>
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class TemplateSwitcherComponent {
  @Output() close = new EventEmitter<void>();

  private api = inject(ApiService);
  readonly auth = inject(AuthService);
  readonly tmplStore = inject(TemplateStoreService);
  private resumeStore = inject(ResumeStoreService);
  private toast = inject(ToastService);

  async select(tmpl: any) {
    if (tmpl.isPremium && this.auth.user()?.subscriptionPlan !== 'Premium') {
      this.toast.error('Please upgrade to Plus to use this premium template');
      return;
    }
    this.tmplStore.setSelectedTemplate(tmpl);
    const resume = this.resumeStore.currentResume();
    if (resume) {
      try {
        await this.api.resume.update(resume.resumeId, { templateId: tmpl.templateId });
        const updated = await this.api.template.incrementUsage(tmpl.templateId);
        this.tmplStore.updateTemplate(tmpl.templateId, updated);
      } catch {}
    }
    this.close.emit();
  }
}
