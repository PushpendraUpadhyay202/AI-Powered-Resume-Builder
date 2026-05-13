import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Section, SECTION_META } from '../../models';
import { UIStoreService } from '../../services/store.service';
import { SectionEditorComponent } from './section-editor.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-section-card',
  imports: [CommonModule, SectionEditorComponent, FormsModule],
  template: `
    <div
      class="card border transition-all duration-200"
      [class]="isActive() ? 'border-[#e8b422]/40 shadow-lg shadow-[#e8b422]/5' : 'border-[#1a1a33]/60 hover:border-[#2a2a4a]/80'"
    >
      <!-- Card header -->
      <div class="flex items-center gap-2 p-3 cursor-pointer select-none"
        (click)="toggleExpand()">
        <!-- Drag handle -->
        <span class="text-[#4a4a7a] text-sm cursor-grab active:cursor-grabbing">⠿</span>

        <!-- Type badge -->
        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded" [class]="meta.color">
          {{ meta.icon }}
        </span>

        <!-- Title -->
        @if (editingTitle()) {
          <input
            class="input-field flex-1 py-1 text-sm"
            [(ngModel)]="localTitle"
            (blur)="saveTitleEdit()"
            (keydown.enter)="saveTitleEdit()"
            (click)="$event.stopPropagation()"
          />
        } @else {
          <span class="flex-1 text-sm font-medium text-[#c0c0d8] truncate"
            (dblclick)="startTitleEdit($event)">
            {{ section.title }}
          </span>
        }

        <!-- AI button -->
        @if (showAi) {
          <button
            (click)="$event.stopPropagation(); aiRequest.emit(section)"
            class="flex items-center gap-1 px-2 py-1 text-[10px] text-[#f0c040] bg-[#e8b422]/10 hover:bg-[#e8b422]/20 rounded-lg transition-all"
          >
            ✦ AI
          </button>
        }

        <!-- Delete -->
        <button
          (click)="$event.stopPropagation(); sectionDelete.emit(section.sectionId)"
          class="text-[#4a4a7a] hover:text-rose-400 transition-colors text-sm"
        >🗑</button>

        <!-- Expand chevron -->
        <span class="text-[#4a4a7a] text-sm">{{ expanded() ? '▲' : '▼' }}</span>
      </div>

      <!-- Expanded content -->
      @if (expanded()) {
        <div class="px-3 pb-3 border-t border-[#1a1a33]/60 pt-3">
          <app-section-editor
            [sectionType]="section.sectionType"
            [content]="section.content"
            (contentChange)="sectionUpdate.emit({ id: section.sectionId, patch: { content: $event } })"
          />
        </div>
      }
    </div>
  `
})
export class SectionCardComponent {
  @Input() section!: Section;
  @Output() sectionUpdate = new EventEmitter<{ id: number; patch: Partial<Section> }>();
  @Output() sectionDelete = new EventEmitter<number>();
  @Output() aiRequest = new EventEmitter<any>();

  private ui = inject(UIStoreService);

  expanded = signal(false);
  editingTitle = signal(false);
  localTitle = '';

  get meta() { return SECTION_META[this.section.sectionType] || SECTION_META['CUSTOM']; }
  get showAi() { return ['SUMMARY', 'EXPERIENCE'].includes(this.section.sectionType); }

  isActive() { return this.ui.activeSection() === this.section.sectionId; }

  toggleExpand() {
    const next = !this.expanded();
    this.expanded.set(next);
    this.ui.setActiveSection(next ? this.section.sectionId : null);
  }

  startTitleEdit(e: Event) {
    e.stopPropagation();
    this.localTitle = this.section.title;
    this.editingTitle.set(true);
  }

  saveTitleEdit() {
    this.editingTitle.set(false);
    if (this.localTitle.trim() !== this.section.title) {
      this.sectionUpdate.emit({ id: this.section.sectionId, patch: { title: this.localTitle.trim() } });
    }
  }
}
