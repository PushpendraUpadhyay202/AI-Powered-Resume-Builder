import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AdminUserDto } from '../../../models';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-slide-up">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Users Management</h1>
          <p class="text-gray-400">View and manage all registered users.</p>
        </div>
        <button (click)="loadUsers()" class="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors flex items-center gap-2">
          <span>🔄</span> Refresh
        </button>
      </div>

      <div *ngIf="loading()" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
      </div>

      <div *ngIf="!loading() && users().length > 0" class="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-white/5 border-b border-white/5 text-gray-400 uppercase text-xs">
              <tr>
                <th class="px-6 py-4 font-semibold">User</th>
                <th class="px-6 py-4 font-semibold">Role</th>
                <th class="px-6 py-4 font-semibold">Plan</th>
                <th class="px-6 py-4 font-semibold">Provider</th>
                <th class="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr *ngFor="let user of users()" class="hover:bg-white/[0.02] transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                      {{ user.fullName.charAt(0) || 'U' }}
                    </div>
                    <div>
                      <p class="font-medium text-white">{{ user.fullName }}</p>
                      <p class="text-xs text-gray-500">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span [class]="'px-2.5 py-1 rounded-full text-xs font-medium ' + (user.role === 'Admin' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400')">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span [class]="'px-2.5 py-1 rounded-full text-xs font-medium ' + (user.subscriptionPlan === 'Premium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-gray-500/10 text-gray-400')">
                    {{ user.subscriptionPlan }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-gray-400 text-xs">{{ user.provider || 'LOCAL' }}</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button (click)="viewDetails(user)" class="p-2 text-gray-400 hover:text-blue-400 transition-colors tooltip" title="View Details">
                      👁️
                    </button>
                    <button (click)="confirmDelete(user)" class="p-2 text-gray-400 hover:text-red-400 transition-colors tooltip" title="Delete User">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="!loading() && users().length === 0" class="text-center py-20 bg-[#1a1a2e] border border-white/5 rounded-2xl">
        <span class="text-4xl mb-4 block">👥</span>
        <h3 class="text-xl font-bold text-white mb-2">No users found</h3>
        <p class="text-gray-400">The system has no registered users.</p>
      </div>
    </div>

    <!-- Details Modal -->
    <div *ngIf="selectedUser()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-[#131327] border border-white/10 rounded-2xl p-6 w-full max-w-md animate-slide-up shadow-2xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-white">User Details</h2>
          <button (click)="selectedUser.set(null)" class="text-gray-400 hover:text-white transition-colors">✖</button>
        </div>
        
        <div class="space-y-4 mb-6" *ngIf="selectedUser() as user">
          <div>
            <label class="text-xs text-gray-500 uppercase tracking-wider block mb-1">ID</label>
            <p class="text-white font-mono bg-white/5 px-3 py-2 rounded-lg">{{ user.id }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 uppercase tracking-wider block mb-1">Full Name</label>
            <p class="text-white font-medium bg-white/5 px-3 py-2 rounded-lg">{{ user.fullName }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 uppercase tracking-wider block mb-1">Email</label>
            <p class="text-white bg-white/5 px-3 py-2 rounded-lg">{{ user.email }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 uppercase tracking-wider block mb-1">Phone Number</label>
            <p class="text-white bg-white/5 px-3 py-2 rounded-lg">{{ user.phoneNumber || 'N/A' }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-gray-500 uppercase tracking-wider block mb-1">Role</label>
              <p class="text-white bg-white/5 px-3 py-2 rounded-lg">{{ user.role }}</p>
            </div>
            <div>
              <label class="text-xs text-gray-500 uppercase tracking-wider block mb-1">Provider</label>
              <p class="text-white bg-white/5 px-3 py-2 rounded-lg">{{ user.provider || 'LOCAL' }}</p>
            </div>
          </div>
        </div>
        
        <button (click)="selectedUser.set(null)" class="w-full btn-primary py-2.5">Close</button>
      </div>
    </div>
  `
})
export class UsersAdminComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  users = signal<AdminUserDto[]>([]);
  loading = signal(true);
  selectedUser = signal<AdminUserDto | null>(null);

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      this.loading.set(true);
      const data = await this.api.admin.users();
      this.users.set(data);
    } catch (err: any) {
      this.toast.error('Failed to load users');
    } finally {
      this.loading.set(false);
    }
  }

  async viewDetails(user: AdminUserDto) {
    try {
      // Could also just use the passed user, but this tests the details endpoint
      const details = await this.api.admin.userDetails(user.id);
      this.selectedUser.set(details);
    } catch (err: any) {
      this.toast.error('Failed to fetch user details');
    }
  }

  async confirmDelete(user: AdminUserDto) {
    if (confirm(`Are you sure you want to delete user ${user.email}? This action is irreversible.`)) {
      try {
        await this.api.admin.deleteUser(user.id);
        this.toast.success('User deleted successfully');
        this.loadUsers();
      } catch (err: any) {
        this.toast.error('Failed to delete user');
      }
    }
  }
}
