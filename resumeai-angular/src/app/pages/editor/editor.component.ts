import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ResumeStoreService, TemplateStoreService, UIStoreService } from '../../services/store.service';
import { ToastService } from '../../services/toast.service';
import { parseContent, stringifyContent, defaultContent, SECTION_META } from '../../models';
import { SectionCardComponent } from '../../components/section-card/section-card.component';
import { LivePreviewComponent } from '../../components/live-preview/live-preview.component';
import { AddSectionModalComponent } from '../../components/add-section-modal/add-section-modal.component';
import { TemplateSwitcherComponent } from '../../components/template-switcher/template-switcher.component';
import { AiPanelComponent } from '../../components/ai-panel/ai-panel.component';
import { Section } from '../../models';

@Component({
  selector: 'app-editor',
  imports: [
    CommonModule, RouterLink,
    SectionCardComponent, LivePreviewComponent,
    AddSectionModalComponent, TemplateSwitcherComponent, AiPanelComponent
  ],
  template: `
    <div class="min-h-screen bg-[#0a0a1a] flex flex-col">
      <!-- Top bar -->
      <header class="h-14 flex items-center px-4 gap-3 border-b border-[#1a1a33]/60 bg-[#131327]/80 backdrop-blur-sm shrink-0 z-20">
        <a routerLink="/dashboard" class="flex items-center gap-1.5 text-[#7070a0] hover:text-white transition-colors mr-2 group">
          <span class="group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
          <span class="text-sm hidden sm:block">Dashboard</span>
        </a>
        <div class="w-px h-5 bg-[#1a1a33]/60"></div>

        <!-- Title -->
        <div class="flex-1 min-w-0">
          <h1 class="text-sm font-semibold text-white truncate">{{ store.currentResume()?.title || 'Untitled Resume' }}</h1>
          <p class="text-[11px] text-[#4a4a7a] hidden sm:block">{{ store.currentResume()?.targetJobTitle || 'No job title set' }}</p>
        </div>

        <!-- Save status -->
        <div class="flex items-center gap-2">
          @if (store.isDirty() && !saving()) {
            <div class="flex items-center gap-1.5 text-[11px] text-[#f0c040]/70">
              <div class="w-1.5 h-1.5 rounded-full bg-[#f0c040] animate-pulse"></div>
              <span class="hidden sm:block">Unsaved</span>
            </div>
          }
          @if (saving()) {
            <div class="flex items-center gap-1.5 text-[11px] text-[#7070a0]">
              <span class="w-3 h-3 border border-[#7070a0]/40 border-t-[#7070a0] rounded-full animate-spin inline-block"></span>
              <span class="hidden sm:block">Saving…</span>
            </div>
          }
          @if (!store.isDirty() && !saving()) {
            <div class="hidden sm:flex items-center gap-1.5 text-[11px] text-[#22c76a]/70">
              <div class="w-1.5 h-1.5 rounded-full bg-[#22c76a]"></div>
              <span>Saved</span>
            </div>
          }
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          @if (store.currentResume()) {
            <div class="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#131327] border border-[#2a2a4a]/60 mr-1" 
                 [class]="atsColor(store.currentResume()!.atsScore || 0)"
                 title="ATS Score">
              📈 {{ store.currentResume()?.atsScore || 0 }}%
            </div>
          }
          <button (click)="showTemplateSwitcher.set(true)" class="btn-ghost flex items-center gap-1.5 text-xs">
            ◧ <span class="hidden sm:block">Template</span>
          </button>
          <button (click)="showPreview.set(!showPreview())" class="btn-ghost flex items-center gap-1.5 text-xs">
            {{ showPreview() ? '🙈' : '👁' }} <span class="hidden sm:block">{{ showPreview() ? 'Hide' : 'Preview' }}</span>
          </button>
          <button (click)="handleManualSave()" [disabled]="saving() || !store.isDirty()" class="btn-ghost flex items-center gap-1.5 text-xs disabled:opacity-40">
            💾 <span class="hidden sm:block">Save</span>
          </button>
          @if (!store.currentResume()?.isPublic) {
            <button (click)="handlePublish()" class="btn-ghost flex items-center gap-1.5 text-xs text-[#22c76a] hover:bg-[#22c76a]/10">
              🌐 <span class="hidden sm:block">Publish</span>
            </button>
          }
          <button (click)="handleToggleStatus()" class="btn-ghost flex items-center gap-1.5 text-xs group" 
            [title]="'Click to mark as ' + (store.currentResume()?.status === 'COMPLETE' ? 'DRAFT' : 'COMPLETE')">
            <span class="transition-transform group-hover:scale-110">
              {{ store.currentResume()?.status === 'COMPLETE' ? '✅' : '📝' }}
            </span>
            <span class="hidden sm:block" [class.text-[#22c76a]]="store.currentResume()?.status === 'COMPLETE'">
              {{ store.currentResume()?.status || 'DRAFT' }}
            </span>
          </button>
          <button (click)="handleExportPdf()" [disabled]="exporting()" class="btn-primary flex items-center gap-1.5 text-xs">
            @if (exporting()) {
              <span class="w-3 h-3 border border-[#0a0a1a]/40 border-t-[#0a0a1a] rounded-full animate-spin inline-block"></span>
            } @else {
              ⬇
            }
            Export PDF
          </button>
        </div>
      </header>

      <!-- Editor body -->
      @if (loading()) {
        <div class="flex-1 flex items-center justify-center gap-3 text-[#7070a0]">
          <span class="w-5 h-5 border-2 border-[#7070a0]/40 border-t-[#7070a0] rounded-full animate-spin inline-block"></span>
          <span>Loading resume…</span>
        </div>
      } @else {
        <div class="flex flex-1 overflow-hidden">
          <!-- LEFT — Sections panel -->
          <aside class="flex flex-col border-r border-[#1a1a33]/60 bg-[#131327]/30 overflow-hidden transition-all duration-300"
            [class]="showPreview() ? 'w-[420px]' : 'flex-1'">

            <div class="flex items-center justify-between px-4 py-3 border-b border-[#1a1a33]/60 shrink-0">
              <span class="text-sm font-semibold text-[#c0c0d8]">
                Sections
                <span class="ml-2 text-xs font-normal text-[#4a4a7a]">({{ store.sections().length }})</span>
              </span>
              <div class="flex items-center gap-2">
                <button
                  (click)="aiTarget = { sectionId: null, sectionType: 'SUMMARY', title: 'AI Assistant' }; showAiPanel.set(true)"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#f0c040] bg-[#e8b422]/10 hover:bg-[#e8b422]/20 border border-[#e8b422]/20 rounded-lg transition-all"
                >
                  ✦ AI
                </button>
                <button
                  (click)="showAddSection.set(true)"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#1a1a33]/60 hover:bg-[#1a1a33] border border-[#2a2a4a]/60 rounded-lg transition-all"
                >
                  + Add
                </button>
              </div>
            </div>

            <!-- Sections list -->
            <div class="flex-1 overflow-y-auto p-3 space-y-2">
              @if (store.sections().length === 0) {
                <div class="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                  <span class="text-2xl text-[#2a2a4a] mb-3">⚠</span>
                  <p class="text-sm text-[#7070a0] mb-4">No sections yet.<br />Add your first section to get started.</p>
                  <button (click)="showAddSection.set(true)" class="btn-primary flex items-center gap-2 text-sm">
                    + Add Section
                  </button>
                </div>
              } @else {
                @for (section of store.sections(); track section.sectionId) {
                  <app-section-card
                    [section]="section"
                    (sectionUpdate)="handleUpdateSection($event.id, $event.patch)"
                    (sectionDelete)="handleDeleteSection($event)"
                    (aiRequest)="aiTarget = $event; showAiPanel.set(true)"
                  />
                }
              }
            </div>

            @if (store.sections().length > 1) {
              <div class="px-4 py-2.5 border-t border-[#1a1a33]/40 shrink-0">
                <p class="text-[11px] text-[#2a2a4a] text-center">Double-click section title to rename</p>
              </div>
            }
          </aside>

          <!-- RIGHT — Live preview -->
          @if (showPreview()) {
            <app-live-preview class="flex-1 flex flex-col overflow-hidden" />
          }
        </div>
      }

      <!-- Modals -->
      @if (showAddSection()) {
        <app-add-section-modal
          [existingTypes]="existingTypes"
          (add)="handleAddSection($event)"
          (close)="showAddSection.set(false)"
        />
      }
      @if (showTemplateSwitcher()) {
        <app-template-switcher (close)="showTemplateSwitcher.set(false)" />
      }
      @if (showAiPanel()) {
        <app-ai-panel
          [targetSection]="aiTarget"
          (close)="showAiPanel.set(false)"
          (apply$)="handleAiApply($event)"
        />
      }
    </div>
  `
})
export class EditorComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private api = inject(ApiService);
  readonly store = inject(ResumeStoreService);
  private tmplStore = inject(TemplateStoreService);
  private ui = inject(UIStoreService);
  private toast = inject(ToastService);

  loading = signal(true);
  saving = signal(false);
  exporting = signal(false);
  showAddSection = signal(false);
  showTemplateSwitcher = signal(false);
  showAiPanel = signal(false);
  showPreview = signal(true);
  aiTarget: any = null;

  private saveTimer: any = null;
  private resumeId!: string;

  get existingTypes(): string[] {
    return this.store.sections().map(s => s.sectionType);
  }

  async ngOnInit() {
    this.resumeId = this.route.snapshot.paramMap.get('resumeId')!;
    try {
      const [resume, sections, templateData] = await Promise.all([
        this.api.resume.get(this.resumeId),
        this.api.section.getByResume(this.resumeId),
        this.api.template.list(),
      ]);

      const parsedSections = (sections || [])
        .map((s: any) => ({ ...s, content: parseContent(s.content) }))
        .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

      this.store.setCurrentResume(resume);
      this.store.setSections(parsedSections);
      this.tmplStore.setTemplates(Array.isArray(templateData) ? templateData : []);

      const tmpl = (Array.isArray(templateData) ? templateData : []).find((t: any) => t.templateId === resume.templateId);
      if (tmpl) this.tmplStore.setSelectedTemplate(tmpl);
    } catch {
      this.toast.error('Failed to load resume');
      this.router.navigate(['/dashboard']);
    } finally {
      this.loading.set(false);
    }

    // Poll for dirty saves
    this.saveTimer = setInterval(() => {
      if (this.store.isDirty()) this.saveChanges();
    }, 2000);
  }

  async ngOnDestroy() {
    clearInterval(this.saveTimer);
    if (this.store.isDirty()) {
      await this.saveChanges();
    }
    this.store.reset();
  }

  public async saveChanges() {
    if (!this.store.isDirty() || !this.store.currentResume()) return;
    this.saving.set(true);
    try {
      const payload = this.store.sections().map((s, idx) => ({
        ...s,
        content: stringifyContent(s.content),
        displayOrder: idx,
      }));
      await this.api.section.bulkUpdate(this.store.currentResume()!.resumeId, payload);
      this.store.markClean();
    } catch { 
      this.toast.error('Auto-save failed'); 
    } finally { 
      this.saving.set(false); 
    }
  }

  async handleManualSave() {
    await this.saveChanges();
    this.toast.success('Saved!');
  }

  async handleAddSection(type: string) {
    const meta = SECTION_META[type];
    try {
      const newSec = await this.api.section.create({
        resumeId: Number(this.resumeId),
        sectionType: type,
        title: meta.label,
        content: stringifyContent(defaultContent(type)),
        displayOrder: this.store.sections().length,
      });
      this.store.addSection({ ...newSec, content: parseContent(newSec.content) });
      this.toast.success(`${meta.label} section added`);
    } catch { this.toast.error('Failed to add section'); }
  }

  handleUpdateSection(sectionId: number, patch: Partial<Section>) {
    this.store.updateSection(sectionId, patch);
  }

  async handleDeleteSection(sectionId: number) {
    if (!confirm('Delete this section?')) return;
    try {
      await this.api.section.delete(sectionId);
      this.store.removeSection(sectionId);
      this.toast.success('Section deleted');
    } catch { this.toast.error('Failed to delete section'); }
  }

  async handlePublish() {
    const resume = this.store.currentResume();
    if (!resume) return;
    try {
      await this.api.resume.publish(resume.resumeId);
      this.store.updateCurrentResume({ isPublic: true });
      this.toast.success('Resume published!');
    } catch { this.toast.error('Failed to publish'); }
  }

  async handleToggleStatus() {
    const resume = this.store.currentResume();
    if (!resume) return;
    const newStatus = resume.status === 'COMPLETE' ? 'DRAFT' : 'COMPLETE';
    try {
      await this.api.resume.update(resume.resumeId, { ...resume, status: newStatus });
      this.store.updateCurrentResume({ status: newStatus });
      this.toast.success(`Marked as ${newStatus}`);
    } catch { this.toast.error('Failed to update status'); }
  }

  async handleExportPdf() {
    const resume = this.store.currentResume();
    if (!resume) return;
    this.exporting.set(true);
    try {
      const blob = await this.api.export.pdf(resume.resumeId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${resume.title || 'resume'}.pdf`; a.click();
      URL.revokeObjectURL(url);
      this.toast.success('PDF exported!');
    } catch { this.toast.error('Export failed'); }
    finally { this.exporting.set(false); }
  }

  async handleAiApply(event: { output: string; mode: string }) {
    if (event.mode === 'ATS') {
      let scoreMatch = event.output.match(/(?:score[:\s]*|)(\d{1,3})(?:\s*\/100|%)/i);
      let score = 0;
      if (scoreMatch && scoreMatch[1]) {
        score = parseInt(scoreMatch[1], 10);
      } else {
        const fallbackMatch = event.output.match(/\b([1-9][0-9]|100)\b/);
        if (fallbackMatch) {
          score = parseInt(fallbackMatch[1], 10);
        }
      }

      const currentResume = this.store.currentResume();
      if (currentResume && score > 0 && score <= 100) {
        try {
          await this.api.resume.update(currentResume.resumeId, { ...currentResume, atsScore: score });
          this.store.updateCurrentResume({ atsScore: score });
          this.toast.success(`ATS Score updated to ${score}%`);
        } catch {
          this.toast.error('Failed to update ATS score');
        }
      } else {
        this.toast.error('Could not parse score from AI output');
      }
    } else if (this.aiTarget?.sectionId) {
      this.store.updateSection(this.aiTarget.sectionId, { content: { summary: event.output } });
    }
  }

  atsColor(score: number): string {
    if (score >= 80) return 'text-[#22c76a]';
    if (score >= 60) return 'text-[#f0c040]';
    return 'text-rose-400';
  }
}
