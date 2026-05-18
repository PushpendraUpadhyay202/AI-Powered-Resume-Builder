import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ResumeStoreService, TemplateStoreService } from '../../services/store.service';
import { ToastService } from '../../services/toast.service';
import { Resume } from '../../models';
import { NewResumeModalComponent } from '../../components/new-resume-modal/new-resume-modal.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NewResumeModalComponent],
  template: `
    <div class="p-8 animate-fade-in">
      <!-- Header -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <p class="text-[#7070a0] text-sm mb-1">Welcome back</p>
          <h1 class="text-3xl font-bold text-white">
            Your <span class="text-[#f0c040]">Resumes</span>
          </h1>
        </div>
        <button (click)="showNewModal.set(true)" class="btn-primary flex items-center gap-2">
          <span>+</span> New Resume
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        @for (stat of stats(); track stat.label) {
          <div class="card p-5 flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-[#1a1a33]/60 flex items-center justify-center text-xl">{{ stat.icon }}</div>
            <div>
              <p class="text-2xl font-bold text-white font-mono">{{ stat.value }}</p>
              <p class="text-xs text-[#7070a0]">{{ stat.label }}</p>
            </div>
          </div>
        }
      </div>

      <!-- Resume grid -->
      @if (loading()) {
        <div class="flex items-center justify-center h-48 gap-3 text-[#7070a0]">
          <span class="w-5 h-5 border-2 border-[#7070a0]/40 border-t-[#7070a0] rounded-full animate-spin inline-block"></span>
          <span class="text-sm">Loading your resumes…</span>
        </div>
      } @else if (store.resumes().length === 0) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <div class="w-20 h-20 rounded-2xl bg-[#131327]/60 border border-[#1a1a33]/60 flex items-center justify-center mb-6 text-4xl">✦</div>
          <h3 class="text-xl font-bold text-white mb-2">No resumes yet</h3>
          <p class="text-[#7070a0] text-sm max-w-sm mb-6">Start building your first AI-powered resume. It only takes a few minutes.</p>
          <button (click)="showNewModal.set(true)" class="btn-primary flex items-center gap-2">
            <span>+</span> Create your first resume
          </button>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (resume of store.resumes(); track resume.resumeId) {
            <div
              class="card hover:border-[#4a4a7a]/60 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 cursor-pointer group overflow-hidden"
              (click)="openEditor(resume.resumeId)"
            >
              <!-- Preview strip -->
              <div class="h-28 bg-gradient-to-br from-[#1a1a33]/80 to-[#131327]/80 border-b border-[#1a1a33]/60 flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 opacity-5"
                  style="background-image: repeating-linear-gradient(0deg, transparent, transparent 20px, #e8b422 20px, #e8b422 21px);">
                </div>
                <span class="text-4xl text-[#4a4a7a] group-hover:text-[#7070a0] transition-colors">📄</span>

                <!-- Quick Actions -->
                <div class="absolute inset-0 bg-[#0a0a1a]/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="duplicate($event, resume)" class="p-2 bg-[#131327] rounded-lg hover:bg-[#1a1a33] text-[#f0c040]" title="Duplicate">✦</button>
                  <button (click)="deleteResume($event, resume)" class="p-2 bg-[#131327] rounded-lg hover:bg-rose-500/20 text-rose-400" title="Delete">🗑</button>
                </div>

                @if (resume.isPublic) {
                  <div class="absolute top-2 right-2 flex items-center gap-1 bg-[#22c76a]/20 border border-[#22c76a]/30 rounded-full px-2 py-0.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-[#22c76a]"></div>
                    <span class="text-[10px] text-[#22c76a] font-medium">Public</span>
                  </div>
                }
              </div>

              <div class="p-5">
                <h3 class="font-semibold text-white text-base truncate group-hover:text-[#f0c040]/80 transition-colors mb-1">
                  {{ resume.title || 'Untitled Resume' }}
                </h3>
                @if (resume.targetJobTitle) {
                  <p class="text-xs text-[#7070a0] truncate mb-3">{{ resume.targetJobTitle }}</p>
                }
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-[#4a4a7a]">{{ formatDate(resume.updatedAt) }}</span>
                  <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border"
                    [class]="resume.status === 'COMPLETE' ? 'text-[#22c76a] bg-[#22c76a]/10 border-[#22c76a]/20' : 'text-[#f0c040] bg-[#f0c040]/10 border-[#f0c040]/20'">
                    {{ resume.status || 'DRAFT' }}
                  </span>
                </div>
                <button class="w-full mt-4 flex items-center justify-center gap-2 text-xs text-[#7070a0] hover:text-white bg-[#1a1a33]/40 hover:bg-[#1a1a33] rounded-lg py-2 transition-all duration-200 border border-transparent">
                  ↗ Open Editor
                </button>
              </div>
            </div>
          }
          <!-- New card -->
          <button (click)="showNewModal.set(true)"
            class="card border-dashed border-[#2a2a4a]/60 hover:border-[#e8b422]/40 hover:bg-[#e8b422]/5 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 min-h-[180px] group">
            <div class="w-12 h-12 rounded-full border-2 border-dashed border-[#2a2a4a] group-hover:border-[#f0c040]/60 flex items-center justify-center transition-colors">
              <span class="text-[#4a4a7a] group-hover:text-[#f0c040] transition-colors text-xl">+</span>
            </div>
            <span class="text-sm text-[#7070a0] group-hover:text-[#f0c040] transition-colors font-medium">Create new resume</span>
          </button>
        </div>
      }

      @if (showNewModal()) {
        <app-new-resume-modal
          (close)="showNewModal.set(false)"
          (created)="onCreated($event)"
        />
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  readonly store = inject(ResumeStoreService);
  private templateStore = inject(TemplateStoreService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(true);
  showNewModal = signal(false);

  stats = computed(() => {
    const resumes = this.store.resumes();
    const completed = resumes.filter(r => r.status === 'COMPLETE');
    return [
      { label: 'Total Resumes', value: resumes.length, icon: '📄' },
      { label: 'Completed', value: completed.length, icon: '✅' },
    ];
  });

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) return;
    try {
      const [resumeData, templateData] = await Promise.all([
        this.api.resume.getByUser(user.userId),
        this.api.template.list(),
      ]);
      this.store.setResumes(Array.isArray(resumeData) ? resumeData : []);
      this.templateStore.setTemplates(Array.isArray(templateData) ? templateData : []);
    } catch (err) {
      console.error('Dashboard initialization error:', err);
      this.toast.error('Failed to load data');
    } finally {
      this.loading.set(false);
    }
  }

  openEditor(id: number) { this.router.navigate(['/editor', id]); }

  formatDate(iso?: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async duplicate(e: Event, resume: Resume) {
    e.stopPropagation();
    try {
      const dup = await this.api.resume.duplicate(resume.resumeId);
      this.store.setResumes([dup, ...this.store.resumes()]);
      this.toast.success('Resume duplicated');
    } catch { this.toast.error('Failed to duplicate resume'); }
  }

  async deleteResume(e: Event, resume: Resume) {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await this.api.resume.delete(resume.resumeId);
      this.store.setResumes(this.store.resumes().filter(r => r.resumeId !== resume.resumeId));
      this.toast.success('Resume deleted');
    } catch { this.toast.error('Failed to delete resume'); }
  }

  onCreated(id: number) {
    this.showNewModal.set(false);
    this.router.navigate(['/editor', id]);
  }
}
