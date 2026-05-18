import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AdminOverview } from '../../../models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-slide-up">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">System Overview</h1>
        <p class="text-gray-400">High-level metrics and statistics across the platform.</p>
      </div>

      <div *ngIf="loading()" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
      </div>

      <div *ngIf="!loading() && overview()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Total Users Card -->
        <div class="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors"></div>
          <div class="flex items-start justify-between relative z-10">
            <div>
              <p class="text-gray-400 font-medium mb-1">Total Users</p>
              <h2 class="text-4xl font-bold text-white">{{ overview()?.totalUsers }}</h2>
            </div>
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-2xl">
              👥
            </div>
          </div>
        </div>

        <!-- Premium Users Card -->
        <div class="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-yellow-500/20 transition-colors"></div>
          <div class="flex items-start justify-between relative z-10">
            <div>
              <p class="text-gray-400 font-medium mb-1">Premium Accounts</p>
              <h2 class="text-4xl font-bold text-white">{{ overview()?.premiumUsers }}</h2>
            </div>
            <div class="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 text-2xl">
              ⭐
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-white/5">
             <div class="flex justify-between text-sm">
               <span class="text-gray-500">Free Accounts</span>
               <span class="text-gray-300 font-medium">{{ overview()?.freeUsers }}</span>
             </div>
             <!-- Visual progress bar -->
             <div class="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden flex">
               <div class="h-full bg-yellow-500" [style.width.%]="getPercentage(overview()?.premiumUsers, overview()?.totalUsers)"></div>
               <div class="h-full bg-gray-500" [style.width.%]="getPercentage(overview()?.freeUsers, overview()?.totalUsers)"></div>
             </div>
          </div>
        </div>

        <!-- Auth Providers Card -->
        <div class="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-green-500/20 transition-colors"></div>
          <div class="flex items-start justify-between relative z-10">
            <div>
              <p class="text-gray-400 font-medium mb-1">Google Logins</p>
              <h2 class="text-4xl font-bold text-white">{{ overview()?.googleUsers }}</h2>
            </div>
            <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 text-2xl">
              G
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-white/5">
             <div class="flex justify-between text-sm">
               <span class="text-gray-500">Local Logins</span>
               <span class="text-gray-300 font-medium">{{ overview()?.localUsers }}</span>
             </div>
             <div class="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden flex">
               <div class="h-full bg-green-500" [style.width.%]="getPercentage(overview()?.googleUsers, overview()?.totalUsers)"></div>
               <div class="h-full bg-blue-500" [style.width.%]="getPercentage(overview()?.localUsers, overview()?.totalUsers)"></div>
             </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);
  
  overview = signal<AdminOverview | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadOverview();
  }

  async loadOverview() {
    try {
      this.loading.set(true);
      const data = await this.api.admin.overview();
      this.overview.set(data);
    } catch (err: any) {
      console.error('Failed to load overview', err);
      this.error.set('Failed to load overview metrics.');
    } finally {
      this.loading.set(false);
    }
  }

  getPercentage(part?: number, total?: number): number {
    if (!part || !total || total === 0) return 0;
    return (part / total) * 100;
  }
}
