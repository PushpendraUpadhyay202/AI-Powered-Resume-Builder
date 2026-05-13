import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#0a0a1a] flex">
      <!-- Left decorative panel -->
      <div class="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#131327] to-[#0a0a1a] items-center justify-center p-12">
        <div class="absolute inset-0">
          <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e8b422]/5 rounded-full blur-3xl"></div>
          <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div class="absolute inset-0 opacity-[0.03]"
            style="background-image: linear-gradient(#e8b422 1px, transparent 1px), linear-gradient(90deg, #e8b422 1px, transparent 1px); background-size: 40px 40px;">
          </div>
        </div>
        <div class="relative z-10 max-w-md">
          <div class="flex items-center gap-3 mb-10">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f0c040] to-[#e8b422] flex items-center justify-center shadow-lg shadow-[#e8b422]/30">
              <span class="text-[#0a0a1a] text-lg">✦</span>
            </div>
            <span class="font-bold text-2xl text-white">Resume<span class="text-[#f0c040]">AI</span></span>
          </div>
          <h2 class="text-4xl font-bold text-white leading-tight mb-4">
            Craft resumes that<br />
            <span class="text-[#f0c040] italic">get you hired.</span>
          </h2>
          <p class="text-[#7070a0] text-base leading-relaxed mb-8">
            AI-powered resume builder with live preview, ATS optimization, and beautiful templates.
          </p>
          @for (f of features; track f) {
            <div class="flex items-center gap-3 mb-3">
              <div class="w-5 h-5 rounded-full bg-[#22c76a]/20 border border-[#22c76a]/40 flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-[#22c76a]"></div>
              </div>
              <span class="text-[#7070a0] text-sm">{{ f }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Right form panel -->
      <div class="flex-1 flex items-center justify-center p-8">
        <div class="w-full max-w-md animate-slide-up">
          <!-- Mobile logo -->
          <div class="flex items-center gap-2 mb-8 lg:hidden">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f0c040] to-[#e8b422] flex items-center justify-center">
              <span class="text-[#0a0a1a] text-sm">✦</span>
            </div>
            <span class="font-bold text-xl text-white">Resume<span class="text-[#f0c040]">AI</span></span>
          </div>

          <h1 class="text-3xl font-bold text-white mb-2">Sign in</h1>
          <p class="text-[#7070a0] text-sm mb-8">
            Don't have an account?
            <a routerLink="/register" class="text-[#f0c040] hover:text-[#f0c040]/80 font-medium transition-colors ml-1">Create one free</a>
          </p>

          <form (ngSubmit)="handleSubmit()" class="space-y-5">
            <div>
              <label class="label">Email address (@gmail.com only)</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7070a0] text-sm">✉</span>
                <input
                  type="email"
                  class="input-field pl-10"
                  placeholder="you@gmail.com"
                  [(ngModel)]="email"
                  name="email"
                  required
                />
              </div>
            </div>

            <div>
              <label class="label">Password</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7070a0] text-sm">🔒</span>
                <input
                  [type]="showPw() ? 'text' : 'password'"
                  class="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  [(ngModel)]="password"
                  name="password"
                  required
                />
                <button
                  type="button"
                  (click)="showPw.set(!showPw())"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7070a0] hover:text-[#c0c0d8] transition-colors text-sm"
                >{{ showPw() ? '🙈' : '👁' }}</button>
              </div>
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <span class="w-4 h-4 border-2 border-[#0a0a1a]/40 border-t-[#0a0a1a] rounded-full animate-spin inline-block"></span>
                Signing in…
              } @else {
                Sign in
              }
            </button>
          </form>

          <div class="mt-6">
            <div class="relative mb-6">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/10"></div></div>
              <div class="relative flex justify-center text-xs uppercase"><span class="bg-[#0a0a1a] px-3 text-[#7070a0] tracking-widest font-medium">Or continue with</span></div>
            </div>

            <div id="googleBtn" class="w-full flex justify-center"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .S99477-L9S7ee {
      border-radius: 8px !important;
    }
  `]
})
export class LoginComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  email = '';
  password = '';
  showPw = signal(false);
  loading = signal(false);

  features = [
    'AI-generated content tailored to your role',
    'Live preview with template switching',
    'ATS score analysis & suggestions',
    'One-click PDF export',
  ];

  ngAfterViewInit() {
    this.initGoogleSignIn();
  }

  private initGoogleSignIn() {
    if (typeof (window as any).google !== 'undefined') {
      (window as any).google.accounts.id.initialize({
        client_id: '885554078531-b3dce8j4a68l7ho3t2a4q2q00ju9busu.apps.googleusercontent.com',
        callback: this.handleGoogleCallback.bind(this)
      });
      (window as any).google.accounts.id.renderButton(
        document.getElementById('googleBtn'),
        { theme: 'filled_black', size: 'large', width: '380', shape: 'rectangular' }
      );
    } else {
      setTimeout(() => this.initGoogleSignIn(), 500);
    }
  }

  async handleGoogleCallback(response: any) {
    this.loading.set(true);
    try {
      const data = await this.api.auth.googleSignin(response.credential);
      this.auth.setAuth(data.token, data.user);
      this.toast.success('Welcome back!');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.toast.error('Google sign-in failed');
    } finally {
      this.loading.set(false);
    }
  }

  async handleSubmit() {
    this.loading.set(true);
    try {
      const data = await this.api.auth.login({ email: this.email, password: this.password });
      this.auth.setAuth(data.token, data.user);
      this.toast.success('Welcome back!');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.toast.error(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }
}
