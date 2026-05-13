import { Component, Input, Output, EventEmitter, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ResumeStoreService, UIStoreService } from '../../services/store.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-ai-panel',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" (click)="close.emit()">
      <div class="card w-full max-w-lg animate-slide-up overflow-hidden" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="flex items-center gap-3 p-4 border-b border-[#1a1a33]/60 bg-gradient-to-r from-[#e8b422]/5 to-transparent">
          <div class="w-8 h-8 rounded-lg bg-[#e8b422]/20 border border-[#e8b422]/30 flex items-center justify-center">
            <span class="text-[#f0c040]">✦</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-white text-sm">AI Assistant</h3>
            <p class="text-xs text-[#7070a0]">Target: <span class="text-[#f0c040]">{{ targetSection?.title || 'Resume' }}</span></p>
          </div>
          <button (click)="close.emit()" class="text-[#7070a0] hover:text-white transition-colors">✕</button>
        </div>

        <!-- Mode tabs -->
        <div class="flex border-b border-[#1a1a33]/60">
          @for (m of modes; track m.id) {
            <button
              (click)="mode.set(m.id)"
              class="flex-1 py-2.5 text-xs font-medium transition-all"
              [class]="mode() === m.id ? 'text-[#f0c040] border-b-2 border-[#e8b422] bg-[#e8b422]/5' : 'text-[#7070a0] hover:text-white'"
            >{{ m.label }}</button>
          }
        </div>

        <!-- Body -->
        <div class="p-4 space-y-3">
          <div>
            <label class="label">Input / Context</label>
            <textarea
              class="input-field resize-none"
              rows="4"
              placeholder="Describe your experience, role, or paste existing content to improve…"
              [(ngModel)]="input"
            ></textarea>
          </div>

          <button
            (click)="generate()"
            [disabled]="loading()"
            class="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            @if (loading()) {
              <span class="w-4 h-4 border-2 border-[#0a0a1a]/40 border-t-[#0a0a1a] rounded-full animate-spin inline-block"></span>
              Generating…
            } @else {
              ✦ Generate
            }
          </button>

          @if (ui.aiQuota()) {
            <div class="flex justify-center mt-2">
              <span class="text-[10px] font-semibold text-[#7070a0] tracking-widest uppercase bg-[#1a1a33]/60 px-3 py-1.5 rounded-full border border-[#e8b422]/20">
                AI Credits: <span class="text-[#f0c040]">{{ ui.aiQuota().used ?? ui.aiQuota().Used ?? 0 }} / {{ ui.aiQuota().limit ?? ui.aiQuota().Limit ?? 0 }}</span>
              </span>
            </div>
          }

          @if (output()) {
            <div>
              <label class="label">Result</label>
              <div class="bg-[#0a0a1a]/60 border border-[#1a1a33] rounded-xl p-3 text-sm text-[#c0c0d8] whitespace-pre-wrap max-h-48 overflow-y-auto">
                {{ output() }}
              </div>
              <div class="flex gap-2 mt-2">
                <button (click)="apply()" class="btn-primary flex-1 flex items-center justify-center gap-1.5">
                  ✓ Apply
                </button>
                <button (click)="generate()" class="btn-secondary flex items-center justify-center gap-1.5">
                  ↺ Regenerate
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class AiPanelComponent implements OnInit {
  @Input() targetSection: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() apply$ = new EventEmitter<string>();

  private api = inject(ApiService);
  private resumeStore = inject(ResumeStoreService);
  readonly ui = inject(UIStoreService);
  private toast = inject(ToastService);

  mode = signal('SUMMARY');
  input = '';
  output = signal('');
  loading = signal(false);

  modes = [
    { id: 'SUMMARY', label: 'Summary' },
    { id: 'BULLETS', label: 'Bullets' },
    { id: 'IMPROVE', label: 'Improve' },
    { id: 'ATS', label: 'ATS Check' },
  ];

  ngOnInit() {
    this.api.ai.quota().then(q => this.ui.setAiQuota(q)).catch(() => {});
    if (this.targetSection?.content) {
      const c = this.targetSection.content;
      this.input = (typeof c === 'string' ? c : JSON.stringify(c)).substring(0, 200);
    }
  }

  async generate() {
    if (!this.input.trim()) { this.toast.error('Please provide some input'); return; }
    this.loading.set(true);
    this.output.set('');
    try {
      const payload = {
        resumeId: this.resumeStore.currentResume()?.resumeId,
        input: this.input.trim(),
        sectionType: this.targetSection?.sectionType,
      };
      let result: any;
      const m = this.mode();
      if (m === 'SUMMARY') result = await this.api.ai.generateSummary(payload);
      else if (m === 'BULLETS') result = await this.api.ai.generateBullets(payload);
      else if (m === 'IMPROVE') result = await this.api.ai.improve(payload);
      else if (m === 'ATS') result = await this.api.ai.checkAts(payload);
      this.output.set(result);
      this.api.ai.quota().then(q => this.ui.setAiQuota(q)).catch(() => {});
    } catch (err: any) {
      this.toast.error(err?.message || 'AI generation failed');
    } finally { this.loading.set(false); }
  }

  apply() {
    if (!this.output()) return;
    this.apply$.emit(this.output());
    this.toast.success('AI content applied!');
    this.close.emit();
  }
}
