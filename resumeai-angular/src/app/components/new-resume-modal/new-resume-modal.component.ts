import { Component, Output, EventEmitter, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { TemplateStoreService } from '../../services/store.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-new-resume-modal',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="close.emit()">
      <div class="card w-full max-w-md animate-slide-up overflow-hidden" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-5 border-b border-[#1a1a33]/60">
          <h3 class="font-semibold text-white">New Resume</h3>
          <button (click)="close.emit()" class="text-[#7070a0] hover:text-white transition-colors text-lg">✕</button>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label class="label">Resume Title</label>
            <input type="text" class="input-field" placeholder="My Resume" [(ngModel)]="title" />
          </div>
          <div>
            <label class="label">Target Job Title</label>
            <input type="text" class="input-field" placeholder="Software Engineer" [(ngModel)]="jobTitle" />
          </div>
          @if (templateStore.templates().length > 0) {
            <div>
              <label class="label">Template</label>
              <select class="input-field" [(ngModel)]="selectedTemplateId">
                @for (tmpl of availableTemplates(); track tmpl.templateId) {
                  <option [value]="tmpl.templateId">
                    {{ tmpl.name }} {{ tmpl.isPremium ? '(⭐ Premium)' : '' }}
                  </option>
                }
              </select>
            </div>
          }
        </div>
        <div class="flex gap-3 p-5 border-t border-[#1a1a33]/60">
          <button (click)="close.emit()" class="btn-secondary flex-1">Cancel</button>
          <button (click)="create()" [disabled]="!title || loading()" class="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2">
            @if (loading()) {
              <span class="w-4 h-4 border-2 border-[#0a0a1a]/40 border-t-[#0a0a1a] rounded-full animate-spin inline-block"></span>
            }
            Create Resume
          </button>
        </div>
      </div>
    </div>
  `
})
export class NewResumeModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<number>();

  private auth = inject(AuthService);
  private api = inject(ApiService);
  readonly templateStore = inject(TemplateStoreService);
  private toast = inject(ToastService);

  title = '';
  jobTitle = '';
  selectedTemplateId: number | null = null;
  loading = signal(false);

  availableTemplates = computed(() => {
    const user = this.auth.user();
    const all = this.templateStore.templates();
    if (user?.subscriptionPlan === 'Premium') return all;
    return all.filter(t => !t.isPremium);
  });

  ngOnInit() {
    if (this.templateStore.templates().length > 0) {
      this.selectedTemplateId = this.templateStore.templates()[0].templateId;
    }
  }

  async create() {
    if (!this.title) return;
    this.loading.set(true);
    try {
      const user = this.auth.user()!;
      const body: any = { title: this.title, userId: user.userId };
      if (this.jobTitle) body.targetJobTitle = this.jobTitle;
      const resume = await this.api.resume.create(body);
      if (this.selectedTemplateId) {
        const updated = await this.api.template.incrementUsage(this.selectedTemplateId);
        this.templateStore.updateTemplate(this.selectedTemplateId, updated);
      }
      this.toast.success('Resume created!');
      this.created.emit(resume.resumeId);
    } catch (err: any) {
      this.toast.error(err?.message || 'Failed to create resume');
    } finally {
      this.loading.set(false);
    }
  }
}
