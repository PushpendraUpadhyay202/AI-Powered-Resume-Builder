import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { TemplateStoreService } from '../../services/store.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-templates',
  imports: [CommonModule],
  template: `
    <div class="p-8 animate-fade-in">
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-[#f0c040] text-xl">◧</span>
          <h1 class="text-3xl font-bold text-white">Resume <span class="text-[#f0c040]">Templates</span></h1>
        </div>
        <p class="text-[#7070a0] text-sm">Choose a template to use when creating your next resume.</p>
      </div>

      <!-- Filter -->
      <div class="flex gap-2 mb-6">
        @for (f of ['all', 'free', 'premium']; track f) {
          <button
            (click)="filter.set(f)"
            class="px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-200"
            [class]="filter() === f
              ? 'bg-[#e8b422]/20 text-[#f0c040] border border-[#e8b422]/30'
              : 'text-[#7070a0] hover:text-white border border-[#1a1a33]/60 hover:border-[#4a4a7a]'"
          >{{ f }}</button>
        }
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center h-48 gap-3 text-[#7070a0]">
          <span class="w-5 h-5 border-2 border-[#7070a0]/40 border-t-[#7070a0] rounded-full animate-spin inline-block"></span>
          <span class="text-sm">Loading templates…</span>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (tmpl of filtered(); track tmpl.templateId) {
            <div class="card overflow-hidden group hover:border-[#4a4a7a]/60 transition-all duration-300">
              <!-- Preview -->
              <div class="h-40 bg-gradient-to-br from-[#1a1a33] to-[#131327] flex items-center justify-center relative">
                @if (tmpl.isPremium) {
                  <div class="absolute top-2 right-2 flex items-center gap-1 bg-[#e8b422]/20 border border-[#e8b422]/30 rounded-full px-2 py-0.5">
                    <span class="text-[10px] text-[#f0c040] font-medium">⭐ Premium</span>
                  </div>
                }
                <span class="text-5xl opacity-30">📄</span>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-white text-sm mb-1">{{ tmpl.name }}</h3>
                @if (tmpl.category) {
                  <p class="text-xs text-[#7070a0]">{{ tmpl.category }}</p>
                }
                <div class="mt-3 flex items-center justify-between">
                  <span class="text-[11px] text-[#4a4a7a]">{{ tmpl.usageCount || 0 }} uses</span>
                  @if (tmpl.isPremium) {
                    <span class="flex items-center gap-1 text-[#7070a0] text-xs"><span>🔒</span> Premium</span>
                  } @else {
                    <span class="text-[11px] text-[#22c76a]">Free</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class TemplatesComponent implements OnInit {
  private api = inject(ApiService);
  readonly tmplStore = inject(TemplateStoreService);
  private toast = inject(ToastService);

  loading = signal(false);
  filter = signal('all');

  filtered() {
    const f = this.filter();
    return this.tmplStore.templates().filter(t => {
      if (f === 'free') return !t.isPremium;
      if (f === 'premium') return t.isPremium;
      return true;
    });
  }

  async ngOnInit() {
    if (this.tmplStore.templates().length) return;
    this.loading.set(true);
    try {
      const data = await this.api.template.list();
      this.tmplStore.setTemplates(Array.isArray(data) ? data : []);
    } catch { this.toast.error('Failed to load templates'); }
    finally { this.loading.set(false); }
  }
}
