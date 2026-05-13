import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SECTION_TYPES, SECTION_META } from '../../models';

@Component({
  selector: 'app-add-section-modal',
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="close.emit()">
      <div class="card w-full max-w-md animate-slide-up overflow-hidden" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-5 border-b border-[#1a1a33]/60">
          <h3 class="font-semibold text-white">Add Section</h3>
          <button (click)="close.emit()" class="text-[#7070a0] hover:text-white transition-colors text-lg">✕</button>
        </div>
        <div class="p-4 grid grid-cols-2 gap-2">
          @for (type of availableTypes; track type) {
            <button
              (click)="add.emit(type); close.emit()"
              class="flex items-center gap-3 p-3 rounded-xl border border-[#1a1a33]/60 hover:border-[#2a2a4a] hover:bg-[#1a1a33]/40 transition-all group text-left"
            >
              <span class="text-base" [class]="meta(type).color">{{ meta(type).icon }}</span>
              <span class="text-sm text-[#c0c0d8] group-hover:text-white transition-colors">{{ meta(type).label }}</span>
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class AddSectionModalComponent {
  @Input() existingTypes: string[] = [];
  @Output() add = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  get availableTypes(): string[] {
    return SECTION_TYPES.filter(t => !this.existingTypes.includes(t));
  }

  meta(type: string) { return SECTION_META[type] || SECTION_META['CUSTOM']; }
}
