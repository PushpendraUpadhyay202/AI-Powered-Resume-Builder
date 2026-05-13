import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { ToastService } from '../../services/toast.service';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/templates', icon: '◧', label: 'Templates' },
  { to: '/profile',   icon: '◉', label: 'Profile' },
];

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen bg-[#0a0a1a]">
      <!-- Sidebar -->
      <aside class="w-64 flex flex-col border-r border-[#1a1a33]/60 bg-[#131327]/40 backdrop-blur-sm">
        <!-- Logo -->
        <div class="p-6 border-b border-[#1a1a33]/60">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-[#f0c040] to-[#e8b422] flex items-center justify-center shadow-lg shadow-[#e8b422]/20">
              <span class="text-[#0a0a1a] font-bold">✦</span>
            </div>
            <div>
              <span class="font-bold text-white text-lg leading-none">Resume</span>
              <span class="font-bold text-[#f0c040] text-lg leading-none">AI</span>
            </div>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 p-4 space-y-1">
          @for (item of navItems; track item.to) {
            <a
              [routerLink]="item.to"
              routerLinkActive="bg-[#e8b422]/10 text-[#f0c040] border border-[#e8b422]/20"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-[#a0a0c0] hover:text-white hover:bg-[#1a1a33]/60 group"
            >
              <span class="text-base">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- User section -->
        <div class="p-4 border-t border-[#1a1a33]/60">
          <div class="flex items-center gap-3 px-3 py-2 rounded-xl mb-2">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
              {{ userInitial }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-[#c0c0d8] truncate">{{ auth.user()?.email }}</p>
              <p class="text-[11px] text-[#7070a0] capitalize">{{ (auth.user()?.subscriptionPlan?.toLowerCase()) || 'free' }} plan</p>
            </div>
          </div>
          
          @if (auth.user()?.subscriptionPlan !== 'Premium') {
            <button
              (click)="upgrade()"
              class="w-full mb-2 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-400 to-amber-600 text-[#0a0a1a] hover:from-amber-300 hover:to-amber-500 transition-all duration-200 shadow-lg shadow-amber-500/20"
            >
              <span>✦</span>
              Upgrade to Plus
            </button>
          }

          <button
            (click)="logout()"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#7070a0] hover:text-rose-400 hover:bg-rose-400/5 transition-all duration-200"
          >
            <span>⬤</span>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="flex-1 overflow-auto">
        <router-outlet />
      </main>
    </div>
  `
})
export class LayoutComponent {
  readonly auth = inject(AuthService);
  private payment = inject(PaymentService);
  private toast = inject(ToastService);
  private router = inject(Router);

  navItems = NAV_ITEMS;

  get userInitial(): string {
    return this.auth.user()?.email?.[0]?.toUpperCase() || 'U';
  }

  async upgrade() {
    const result = await this.payment.upgradeToPremium();
    if (result.success) {
      this.toast.success('Successfully upgraded! Please sign in again to activate your benefits.');
      // Forcing logout to refresh token with new plan
      setTimeout(() => this.logout(), 2000);
    } else {
      this.toast.error(result.message);
    }
  }

  logout() {
    this.auth.clearAuth();
    this.router.navigate(['/login']);
  }
}
