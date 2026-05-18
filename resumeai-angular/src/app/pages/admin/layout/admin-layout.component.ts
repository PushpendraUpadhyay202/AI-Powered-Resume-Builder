import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-[#0a0a1a] flex flex-col md:flex-row font-sans text-gray-200">
      
      <!-- Mobile header -->
      <div class="md:hidden flex items-center justify-between p-4 bg-[#131327] border-b border-white/5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <span class="text-white text-sm font-bold">A</span>
          </div>
          <span class="font-bold text-white tracking-wide">Admin<span class="text-red-500">Panel</span></span>
        </div>
        <button (click)="mobileMenuOpen = !mobileMenuOpen" class="text-gray-400 p-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path *ngIf="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path *ngIf="mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Sidebar -->
      <aside [class.hidden]="!mobileMenuOpen" class="md:block w-full md:w-64 bg-[#131327] border-r border-white/5 flex-shrink-0 relative z-20">
        <div class="p-6 hidden md:flex items-center gap-3 border-b border-white/5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
            <span class="text-white font-bold">A</span>
          </div>
          <span class="font-bold text-xl text-white tracking-wide">Admin<span class="text-red-500">Panel</span></span>
        </div>

        <div class="p-4 space-y-1">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Management</p>
          
          <a routerLink="/admin/dashboard" routerLinkActive="bg-red-500/10 text-red-400" 
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
            <span class="text-lg group-hover:scale-110 transition-transform">📊</span>
            <span class="font-medium">Overview</span>
          </a>

          <a routerLink="/admin/users" routerLinkActive="bg-red-500/10 text-red-400" 
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
            <span class="text-lg group-hover:scale-110 transition-transform">👥</span>
            <span class="font-medium">Users</span>
          </a>

          <a routerLink="/admin/templates" routerLinkActive="bg-red-500/10 text-red-400" 
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
            <span class="text-lg group-hover:scale-110 transition-transform">📄</span>
            <span class="font-medium">Templates</span>
          </a>
        </div>

        <div class="absolute bottom-0 w-full p-4 border-t border-white/5 bg-[#131327]">
          <div class="flex items-center gap-3 mb-4 px-2">
            <div class="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center text-red-400 border border-red-500/20">
              {{ user()?.fullName?.charAt(0) || 'A' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ user()?.fullName }}</p>
              <p class="text-xs text-gray-500 truncate">{{ user()?.email }}</p>
            </div>
          </div>
          <button (click)="logout()" class="w-full py-2 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <span>🚪</span> Back to App
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <!-- Background decorative effects -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="flex-1 overflow-auto p-4 md:p-8 z-10">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.user;
  mobileMenuOpen = false;

  logout() {
    this.router.navigate(['/dashboard']);
  }
}
