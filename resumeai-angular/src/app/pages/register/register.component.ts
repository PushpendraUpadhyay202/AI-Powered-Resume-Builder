import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-8">
      <div class="w-full max-w-md animate-slide-up">
        <div class="flex items-center gap-2 mb-8">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-[#f0c040] to-[#e8b422] flex items-center justify-center shadow-lg shadow-[#e8b422]/20">
            <span class="text-[#0a0a1a]">✦</span>
          </div>
          <span class="font-bold text-xl text-white">Resume<span class="text-[#f0c040]">AI</span></span>
        </div>

        <h1 class="text-3xl font-bold text-white mb-2">Create account</h1>
        <p class="text-[#7070a0] text-sm mb-8">
          Already have one?
          <a routerLink="/login" class="text-[#f0c040] hover:text-[#f0c040]/80 font-medium transition-colors ml-1">Sign in</a>
        </p>

        <form (ngSubmit)="handleSubmit()" class="space-y-4">
          <div>
            <label class="label">Full Name</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7070a0] text-sm">👤</span>
              <input type="text" class="input-field pl-10" placeholder="John Doe" [(ngModel)]="form.fullName" name="fullName" required />
            </div>
          </div>
          <div>
            <label class="label">Email (@gmail.com only)</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7070a0] text-sm">✉</span>
              <input type="email" class="input-field pl-10" placeholder="you@gmail.com" [(ngModel)]="form.email" name="email" required />
            </div>
          </div>
          <div>
            <label class="label">Phone (10 digits)</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7070a0] text-sm">📞</span>
              <input type="tel" class="input-field pl-10" placeholder="9876543210" [(ngModel)]="form.phoneNumber" name="phoneNumber" required maxlength="10" minlength="10" />
            </div>
          </div>
          <div>
            <label class="label">Password (Min. 6 chars, A-Z, a-z, 0-9, special)</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7070a0] text-sm">🔒</span>
              <input
                [type]="showPw() ? 'text' : 'password'"
                class="input-field pl-10 pr-10"
                placeholder="Min. 6 characters"
                [(ngModel)]="form.password"
                name="password"
                required
              />
              <button type="button" (click)="showPw.set(!showPw())"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7070a0] hover:text-[#c0c0d8] transition-colors text-sm">
                {{ showPw() ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="btn-primary w-full py-3 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            @if (loading()) {
              <span class="w-4 h-4 border-2 border-[#0a0a1a]/40 border-t-[#0a0a1a] rounded-full animate-spin inline-block"></span>
              Creating account…
            } @else {
              Create free account
            }
          </button>

          <p class="text-xs text-[#4a4a7a] text-center pt-2">
            Free plan includes 10 AI requests and unlimited resumes.
          </p>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  form = {
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'User',
    subscriptionPlan: 'Free'
  };
  showPw = signal(false);
  loading = signal(false);

  async handleSubmit() {
    this.loading.set(true);
    try {
      await this.api.auth.register(this.form);
      this.toast.success('Account created! Please sign in.');
      this.router.navigate(['/login']);
    } catch (err: any) {
      const msg = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : (err?.response?.data?.message || err?.message || 'Registration failed');
      this.toast.error(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
