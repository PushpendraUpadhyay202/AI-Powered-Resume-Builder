import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models';

const STORAGE_KEY = 'resumeai-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token = signal<string | null>(null);
  private _user = signal<User | null>(null);

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token() && !!this._user());

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { state } = JSON.parse(raw);
        if (state?.token && state?.user) {
          this._token.set(state.token);
          this._user.set(state.user);
        }
      }
    } catch {}
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      state: { token: this._token(), user: this._user(), isAuthenticated: this.isAuthenticated() }
    }));
  }

  setAuth(token: string, user: User): void {
    this._token.set(token);
    this._user.set(user);
    this.saveToStorage();
  }

  clearAuth(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  updateUser(user: User): void {
    this._user.set(user);
    this.saveToStorage();
  }
}
