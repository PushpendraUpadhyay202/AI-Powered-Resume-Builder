import { Injectable, signal, computed } from '@angular/core';
import { Resume, Section, Template } from '../models';

@Injectable({ providedIn: 'root' })
export class ResumeStoreService {
  private _resumes = signal<Resume[]>([]);
  private _currentResume = signal<Resume | null>(null);
  private _sections = signal<Section[]>([]);
  private _isDirty = signal(false);

  readonly resumes = this._resumes.asReadonly();
  readonly currentResume = this._currentResume.asReadonly();
  readonly sections = this._sections.asReadonly();
  readonly isDirty = this._isDirty.asReadonly();

  setResumes(r: Resume[]) { this._resumes.set(r); }
  setCurrentResume(r: Resume | null) { this._currentResume.set(r); this._isDirty.set(false); }
  setSections(s: Section[]) { this._sections.set(s); }

  updateCurrentResume(patch: Partial<Resume>) {
    const cur = this._currentResume();
    if (cur) { this._currentResume.set({ ...cur, ...patch }); this._isDirty.set(true); }
  }

  addSection(section: Section) {
    this._sections.update(s => [...s, section]);
    this._isDirty.set(true);
  }

  updateSection(sectionId: number, patch: Partial<Section>) {
    this._sections.update(s => s.map(sec => sec.sectionId === sectionId ? { ...sec, ...patch } : sec));
    this._isDirty.set(true);
  }

  removeSection(sectionId: number) {
    this._sections.update(s => s.filter(sec => sec.sectionId !== sectionId));
    this._isDirty.set(true);
  }

  reorderSections(sections: Section[]) {
    this._sections.set(sections);
    this._isDirty.set(true);
  }

  markClean() { this._isDirty.set(false); }

  reset() {
    this._currentResume.set(null);
    this._sections.set([]);
    this._isDirty.set(false);
  }
}

@Injectable({ providedIn: 'root' })
export class TemplateStoreService {
  private _templates = signal<Template[]>([]);
  private _selectedTemplate = signal<Template | null>(null);

  readonly templates = this._templates.asReadonly();
  readonly selectedTemplate = this._selectedTemplate.asReadonly();

  setTemplates(t: Template[]) { this._templates.set(t); }
  setSelectedTemplate(t: Template | null) { this._selectedTemplate.set(t); }
  updateTemplate(id: number, patch: Partial<Template>) {
    this._templates.update(t => t.map(item => item.templateId === id ? { ...item, ...patch } : item));
  }
}

@Injectable({ providedIn: 'root' })
export class UIStoreService {
  private _activeSection = signal<number | null>(null);
  private _aiQuota = signal<any>(null);

  readonly activeSection = this._activeSection.asReadonly();
  readonly aiQuota = this._aiQuota.asReadonly();

  setActiveSection(id: number | null) { this._activeSection.set(id); }
  setAiQuota(q: any) { this._aiQuota.set(q); }
}
