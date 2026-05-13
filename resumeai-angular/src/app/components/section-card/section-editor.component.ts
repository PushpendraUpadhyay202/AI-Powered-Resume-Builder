import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-section-editor',
  imports: [CommonModule, FormsModule],
  template: `
    @switch (sectionType) {
      @case ('SUMMARY') {
        <div>
          <label class="label">Professional Summary</label>
          <textarea
            class="input-field resize-none"
            rows="5"
            placeholder="Write a compelling summary about your professional background…"
            [ngModel]="summaryVal()"
            (ngModelChange)="contentChange.emit({ summary: $event })"
          ></textarea>
        </div>
      }
      @case ('EXPERIENCE') {
        <div class="space-y-4">
          @for (item of expItems(); track $index) {
            <div class="bg-[#1a1a33]/30 border border-[#2a2a4a]/40 rounded-xl p-4 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs text-[#7070a0] font-medium">Position {{ $index + 1 }}</span>
                @if (expItems().length > 1) {
                  <button (click)="removeItem('exp', $index)" class="text-[#4a4a7a] hover:text-rose-400 transition-colors text-sm">🗑</button>
                }
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Job Title</label>
                  <input class="input-field" placeholder="Software Engineer" [ngModel]="item.title" (ngModelChange)="updateExp($index, 'title', $event)" />
                </div>
                <div>
                  <label class="label">Company</label>
                  <input class="input-field" placeholder="Acme Corp" [ngModel]="item.company" (ngModelChange)="updateExp($index, 'company', $event)" />
                </div>
              </div>
              <div>
                <label class="label">Dates</label>
                <input class="input-field" placeholder="Jan 2022 – Present" [ngModel]="item.dates" (ngModelChange)="updateExp($index, 'dates', $event)" />
              </div>
              <div>
                <label class="label">Description</label>
                <textarea class="input-field resize-none" rows="3" placeholder="Describe your responsibilities…" [ngModel]="item.description" (ngModelChange)="updateExp($index, 'description', $event)"></textarea>
              </div>
            </div>
          }
          <button (click)="addItem('exp')" class="w-full btn-ghost border border-dashed border-[#2a2a4a] hover:border-[#4a4a7a] flex items-center justify-center gap-2 py-2.5">
            + Add Position
          </button>
        </div>
      }
      @case ('EDUCATION') {
        <div class="space-y-4">
          @for (item of eduItems(); track $index) {
            <div class="bg-[#1a1a33]/30 border border-[#2a2a4a]/40 rounded-xl p-4 space-y-3">
              <div class="flex justify-between">
                <span class="text-xs text-[#7070a0] font-medium">Entry {{ $index + 1 }}</span>
                @if (eduItems().length > 1) {
                  <button (click)="removeItem('edu', $index)" class="text-[#4a4a7a] hover:text-rose-400 text-sm">🗑</button>
                }
              </div>
              <div>
                <label class="label">School / University</label>
                <input class="input-field" placeholder="MIT" [ngModel]="item.school" (ngModelChange)="updateEdu($index, 'school', $event)" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Degree</label>
                  <input class="input-field" placeholder="B.Sc. Computer Science" [ngModel]="item.degree" (ngModelChange)="updateEdu($index, 'degree', $event)" />
                </div>
                <div>
                  <label class="label">Year</label>
                  <input class="input-field" placeholder="2020" [ngModel]="item.year" (ngModelChange)="updateEdu($index, 'year', $event)" />
                </div>
              </div>
            </div>
          }
          <button (click)="addItem('edu')" class="w-full btn-ghost border border-dashed border-[#2a2a4a] hover:border-[#4a4a7a] flex items-center justify-center gap-2 py-2.5">
            + Add Education
          </button>
        </div>
      }
      @case ('SKILLS') {
        <div class="space-y-3">
          <div class="flex flex-wrap gap-2">
            @for (skill of skillList(); track skill) {
              <span class="flex items-center gap-1.5 bg-[#1a1a33]/60 border border-[#2a2a4a]/60 rounded-full px-3 py-1 text-xs text-[#c0c0d8]">
                {{ skill }}
                <button (click)="removeSkill(skill)" class="text-[#7070a0] hover:text-rose-400 transition-colors">✕</button>
              </span>
            }
          </div>
          <div class="flex gap-2">
            <input class="input-field flex-1" placeholder="Add skill…" [(ngModel)]="newSkill" (keydown.enter)="addSkill()" />
            <button (click)="addSkill()" class="btn-secondary px-4">Add</button>
          </div>
        </div>
      }
      @case ('PROJECTS') {
        <div class="space-y-4">
          @for (item of projItems(); track $index) {
            <div class="bg-[#1a1a33]/30 border border-[#2a2a4a]/40 rounded-xl p-4 space-y-3">
              <div class="flex justify-between">
                <span class="text-xs text-[#7070a0] font-medium">Project {{ $index + 1 }}</span>
                @if (projItems().length > 1) {
                  <button (click)="removeItem('proj', $index)" class="text-[#4a4a7a] hover:text-rose-400 text-sm">🗑</button>
                }
              </div>
              <div>
                <label class="label">Project Name</label>
                <input class="input-field" placeholder="My Awesome Project" [ngModel]="item.title" (ngModelChange)="updateProj($index, 'title', $event)" />
              </div>
              <div>
                <label class="label">Technologies</label>
                <input class="input-field" placeholder="React, Node.js, PostgreSQL" [ngModel]="item.technologies" (ngModelChange)="updateProj($index, 'technologies', $event)" />
              </div>
              <div>
                <label class="label">Description</label>
                <textarea class="input-field resize-none" rows="3" [ngModel]="item.description" (ngModelChange)="updateProj($index, 'description', $event)"></textarea>
              </div>
            </div>
          }
          <button (click)="addItem('proj')" class="w-full btn-ghost border border-dashed border-[#2a2a4a] hover:border-[#4a4a7a] flex items-center justify-center gap-2 py-2.5">
            + Add Project
          </button>
        </div>
      }
      @case ('CERTIFICATIONS') {
        <div class="space-y-4">
          @for (item of certItems(); track $index) {
            <div class="bg-[#1a1a33]/30 border border-[#2a2a4a]/40 rounded-xl p-4 space-y-3">
              <div class="flex justify-between">
                <span class="text-xs text-[#7070a0] font-medium">Cert {{ $index + 1 }}</span>
                @if (certItems().length > 1) {
                  <button (click)="removeItem('cert', $index)" class="text-[#4a4a7a] hover:text-rose-400 text-sm">🗑</button>
                }
              </div>
              <div>
                <label class="label">Title</label>
                <input class="input-field" [ngModel]="item.title" (ngModelChange)="updateCert($index, 'title', $event)" />
              </div>
              <div>
                <label class="label">Issuer</label>
                <input class="input-field" [ngModel]="item.issuer" (ngModelChange)="updateCert($index, 'issuer', $event)" />
              </div>
            </div>
          }
          <button (click)="addItem('cert')" class="w-full btn-ghost border border-dashed border-[#2a2a4a] hover:border-[#4a4a7a] flex items-center justify-center gap-2 py-2.5">
            + Add Certification
          </button>
        </div>
      }
      @default {
        <div>
          <label class="label">Content</label>
          <textarea class="input-field resize-none" rows="4" [ngModel]="jsonContent()" (ngModelChange)="contentChange.emit($event)"></textarea>
        </div>
      }
    }
  `
})
export class SectionEditorComponent {
  @Input() sectionType = '';
  @Input() set content(val: any) { this._content.set(val); }
  @Output() contentChange = new EventEmitter<any>();

  _content = signal<any>(null);
  newSkill = '';

  summaryVal = computed(() => {
    const c = this._content();
    return typeof c === 'object' ? (c?.summary || '') : (c || '');
  });

  expItems = computed(() => {
    const c = this._content();
    return Array.isArray(c) ? c : [{ company: '', title: '', dates: '', description: '' }];
  });

  eduItems = computed(() => {
    const c = this._content();
    return Array.isArray(c) ? c : [{ school: '', degree: '', year: '' }];
  });

  skillList = computed(() => {
    const c = this._content();
    return Array.isArray(c) ? c : (c?.skills || []);
  });

  projItems = computed(() => {
    const c = this._content();
    return Array.isArray(c) ? c : [{ title: '', technologies: '', description: '' }];
  });

  certItems = computed(() => {
    const c = this._content();
    return Array.isArray(c) ? c : [{ title: '', issuer: '' }];
  });

  jsonContent = computed(() => {
    const c = this._content();
    return typeof c === 'string' ? c : JSON.stringify(c, null, 2);
  });

  updateExp(idx: number, field: string, val: string) {
    const items = [...this.expItems()];
    items[idx] = { ...items[idx], [field]: val };
    this.contentChange.emit(items);
  }

  updateEdu(idx: number, field: string, val: string) {
    const items = [...this.eduItems()];
    items[idx] = { ...items[idx], [field]: val };
    this.contentChange.emit(items);
  }

  updateProj(idx: number, field: string, val: string) {
    const items = [...this.projItems()];
    items[idx] = { ...items[idx], [field]: val };
    this.contentChange.emit(items);
  }

  updateCert(idx: number, field: string, val: string) {
    const items = [...this.certItems()];
    items[idx] = { ...items[idx], [field]: val };
    this.contentChange.emit(items);
  }

  addItem(type: string) {
    const defaults: Record<string, any> = {
      exp:  { company: '', title: '', dates: '', description: '' },
      edu:  { school: '', degree: '', year: '' },
      proj: { title: '', technologies: '', description: '' },
      cert: { title: '', issuer: '' },
    };
    const map: Record<string, any> = {
      exp:  this.expItems,
      edu:  this.eduItems,
      proj: this.projItems,
      cert: this.certItems,
    };
    this.contentChange.emit([...map[type](), defaults[type]]);
  }

  removeItem(type: string, idx: number) {
    const map: Record<string, any> = {
      exp:  this.expItems,
      edu:  this.eduItems,
      proj: this.projItems,
      cert: this.certItems,
    };
    this.contentChange.emit(map[type]().filter((_: any, i: number) => i !== idx));
  }

  addSkill() {
    const s = this.newSkill.trim();
    if (!s) return;
    const skills = [...this.skillList(), s];
    this.contentChange.emit({ skills });
    this.newSkill = '';
  }

  removeSkill(skill: string) {
    const skills = this.skillList().filter((s: string) => s !== skill);
    this.contentChange.emit({ skills });
  }
}
