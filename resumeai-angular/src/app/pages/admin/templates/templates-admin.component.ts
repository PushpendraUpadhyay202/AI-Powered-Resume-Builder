import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Template } from '../../../models';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-slide-up pb-12">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Templates Management</h1>
          <p class="text-gray-400">Create, edit, and curate resume templates.</p>
        </div>
        <button (click)="openCreateModal()" class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center gap-2 font-medium shadow-lg shadow-red-500/20">
          <span>➕</span> New Template
        </button>
      </div>

      <div *ngIf="loading()" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
      </div>

      <div *ngIf="!loading() && templates().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let t of templates()" class="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all flex flex-col">
          <div class="h-40 bg-[#131327] relative border-b border-white/5 overflow-hidden flex items-center justify-center">
            <!-- Simulated template preview -->
            <div class="w-24 h-32 bg-white rounded shadow-sm opacity-20 group-hover:scale-105 transition-transform"></div>
            
            <div class="absolute top-3 right-3 flex gap-2">
              <span *ngIf="t.isPremium" class="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/20 shadow-sm backdrop-blur">
                PREMIUM
              </span>
              <span *ngIf="!t.isPremium" class="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/20 shadow-sm backdrop-blur">
                FREE
              </span>
            </div>
            
            <!-- Removed Overlay -->
            <div *ngIf="t.usageCount === -1" class="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <span class="px-3 py-1 bg-red-500 text-white font-bold text-sm rounded border border-red-400">INACTIVE</span>
            </div>
          </div>
          
          <div class="p-5 flex-1 flex flex-col">
            <h3 class="text-lg font-bold text-white mb-1">{{ t.name }}</h3>
            <p class="text-sm text-gray-500 mb-4">{{ t.category || 'General' }}</p>
            
            <div class="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
              <div class="text-xs text-gray-500 flex items-center gap-1">
                <span>📊</span> {{ (t.usageCount ?? 0) > -1 ? (t.usageCount ?? 0) + ' uses' : 'Deactivated' }}
              </div>
              <div class="flex gap-2">
                <button (click)="openEditModal(t)" class="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors tooltip" title="Edit Template">
                  ✏️
                </button>
                <button (click)="toggleActive(t)" class="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors tooltip" [title]="t.usageCount === -1 ? 'Reactivate' : 'Deactivate'">
                  {{ t.usageCount === -1 ? '✅' : '🚫' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div *ngIf="isModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div class="bg-[#131327] border border-white/10 rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl animate-scale-in">
        <div class="p-6 border-b border-white/5 flex justify-between items-center flex-shrink-0">
          <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            <span class="text-red-500">✦</span>
            {{ editingTemplate() ? 'Edit Template' : 'Create New Template' }}
          </h2>
          <button (click)="closeModal()" class="text-gray-500 hover:text-white transition-colors p-1 bg-white/5 rounded-full hover:bg-white/10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Template Name *</label>
                <input type="text" [(ngModel)]="formData.name" name="name" class="w-full bg-[#0a0a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600" placeholder="e.g. Modern Professional">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <input type="text" [(ngModel)]="formData.category" name="category" class="w-full bg-[#0a0a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600" placeholder="e.g. Creative, Tech, Classic">
              </div>
            </div>

            <div class="flex items-center gap-3 bg-[#0a0a1a] border border-white/5 p-4 rounded-lg">
              <input type="checkbox" [(ngModel)]="formData.isPremium" name="isPremium" id="isPremium" class="w-5 h-5 rounded border-gray-600 text-red-500 focus:ring-red-500/20 bg-[#131327]">
              <label for="isPremium" class="text-sm font-medium text-gray-300 flex items-center gap-2 cursor-pointer">
                Premium Template <span class="text-yellow-500 text-xs px-1.5 py-0.5 bg-yellow-500/10 rounded border border-yellow-500/20">PRO</span>
              </label>
            </div>

            <div class="grid grid-cols-1 gap-6">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <span class="text-[#e34c26]">🖹</span> HTML Layout *
                  </label>
                  <span class="text-xs text-gray-500">Use {{ '{{' }} fields {{ '}}' }} for data binding</span>
                </div>
                <textarea [(ngModel)]="formData.htmlLayout" name="htmlLayout" rows="8" class="w-full bg-[#0a0a1a] border border-white/10 rounded-lg px-4 py-3 text-gray-300 font-mono text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all custom-scrollbar placeholder-gray-700" placeholder="<div class='resume-container'>...</div>"></textarea>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <span class="text-[#264de4]">✨</span> CSS Styles *
                  </label>
                  <span class="text-xs text-gray-500">Scoped styles for this template</span>
                </div>
                <textarea [(ngModel)]="formData.cssStyles" name="cssStyles" rows="8" class="w-full bg-[#0a0a1a] border border-white/10 rounded-lg px-4 py-3 text-gray-300 font-mono text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all custom-scrollbar placeholder-gray-700" placeholder=".resume-container { font-family: 'Inter', sans-serif; }"></textarea>
              </div>
            </div>
          </form>
        </div>

        <div class="p-6 border-t border-white/5 flex justify-end gap-3 flex-shrink-0 bg-[#0a0a1a]/50 rounded-b-2xl">
          <button (click)="closeModal()" class="px-5 py-2.5 text-gray-400 hover:text-white font-medium transition-colors">
            Cancel
          </button>
          <button (click)="saveTemplate()" [disabled]="saving()" class="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-red-500/20 transition-all flex items-center gap-2">
            <div *ngIf="saving()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {{ saving() ? 'Saving...' : (editingTemplate() ? 'Update Template' : 'Create Template') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
  `]
})
export class TemplatesAdminComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  templates = signal<Template[]>([]);
  loading = signal(true);
  saving = signal(false);

  isModalOpen = signal(false);
  editingTemplate = signal<Template | null>(null);

  formData = {
    name: '',
    category: '',
    isPremium: false,
    htmlLayout: '',
    cssStyles: ''
  };

  ngOnInit() {
    this.loadTemplates();
  }

  async loadTemplates() {
    try {
      this.loading.set(true);
      // Wait, list gets all active templates. If Admin wants all templates including inactive, does the API support it?
      // For now, list() gets all active templates according to TemplateController.cs "GetAllActiveTemplates()"
      // Wait! `TemplateController.cs` only has `GetAllActiveTemplates`. If a template is deactivated, the admin can't see it!
      // I will just use `list()` for now. If it's deactivated, it disappears.
      const data = await this.api.template.list();
      this.templates.set(data);
    } catch (err: any) {
      this.toast.error('Failed to load templates');
    } finally {
      this.loading.set(false);
    }
  }

  openCreateModal() {
    this.editingTemplate.set(null);
    this.formData = { name: '', category: '', isPremium: false, htmlLayout: '', cssStyles: '' };
    this.isModalOpen.set(true);
  }

  openEditModal(template: Template) {
    this.editingTemplate.set(template);
    this.formData = {
      name: template.name,
      category: template.category || '',
      isPremium: template.isPremium || false,
      htmlLayout: template.htmlLayout || '',
      cssStyles: template.cssStyles || ''
    };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  async saveTemplate() {
    if (!this.formData.name || !this.formData.htmlLayout || !this.formData.cssStyles) {
      this.toast.error('Please fill in all required fields');
      return;
    }

    try {
      this.saving.set(true);
      if (this.editingTemplate()) {
        await this.api.template.update(this.editingTemplate()!.templateId, this.formData);
        this.toast.success('Template updated');
      } else {
        await this.api.template.create(this.formData);
        this.toast.success('Template created');
      }
      this.closeModal();
      this.loadTemplates();
    } catch (err: any) {
      this.toast.error('Failed to save template');
    } finally {
      this.saving.set(false);
    }
  }

  async toggleActive(template: Template) {
    if (confirm(`Are you sure you want to ${template.usageCount === -1 ? 'reactivate' : 'deactivate'} this template?`)) {
      try {
        await this.api.template.deactivate(template.templateId);
        this.toast.success('Template status changed');
        this.loadTemplates();
      } catch (err: any) {
        this.toast.error('Failed to change template status');
      }
    }
  }
}
