import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private show(message: string, type: Toast['type']) {
    const id = Math.random().toString(36).slice(2);
    this._toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.remove(id), 3500);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error'); }
  info(msg: string)    { this.show(msg, 'info'); }

  remove(id: string) {
    this._toasts.update(t => t.filter(x => x.id !== id));
  }
}
