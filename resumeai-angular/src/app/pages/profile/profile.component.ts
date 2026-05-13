import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 max-w-xl animate-fade-in">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-1">Your <span class="text-[#f0c040]">Profile</span></h1>
        <p class="text-[#7070a0] text-sm">Manage your account information.</p>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center h-48 gap-3 text-[#7070a0]">
          <span class="w-5 h-5 border-2 border-[#7070a0]/40 border-t-[#7070a0] rounded-full animate-spin inline-block"></span>
          <span class="text-sm">Loading profile…</span>
        </div>
      } @else {
        <!-- Account Info Card -->
        <div class="card p-5 mb-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-xl font-bold text-white">
              {{ userInitial }}
            </div>
            <div>
              <p class="font-semibold text-white">{{ auth.user()?.email }}</p>
              <p class="text-sm capitalize"
                [class]="auth.user()?.subscriptionPlan === 'PREMIUM' ? 'text-[#f0c040]' : 'text-[#7070a0]'">
                {{ (auth.user()?.subscriptionPlan?.toLowerCase()) || 'free' }} plan
              </p>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div class="card p-5">
          <h2 class="font-semibold text-white mb-4">Edit Profile</h2>
          <form (ngSubmit)="handleSave()" class="space-y-4">
            <div>
              <label class="label">Full Name</label>
              <input type="text" class="input-field" placeholder="John Doe" [(ngModel)]="form.fullName" name="fullName" />
            </div>
            <div>
              <label class="label">Phone</label>
              <input type="tel" class="input-field" placeholder="+1 234 567 8900" [(ngModel)]="form.phone" name="phone" />
            </div>
            <button
              type="submit"
              [disabled]="saving()"
              class="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              @if (saving()) {
                <span class="w-4 h-4 border-2 border-[#0a0a1a]/40 border-t-[#0a0a1a] rounded-full animate-spin inline-block"></span>
                Saving…
              } @else {
                Save Changes
              }
            </button>
          </form>
        </div>
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  readonly auth = inject(AuthService);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  loading = signal(true);
  saving = signal(false);
  form = { fullName: '', phone: '' };

  get userInitial(): string {
    return this.auth.user()?.email?.[0]?.toUpperCase() || 'U';
  }

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) return;
    try {
      const data = await this.api.auth.profile();
      this.form = { 
        fullName: data.fullName || '', 
        phone: data.phoneNumber || '' // Backend uses phoneNumber
      };
    } catch { this.toast.error('Failed to load profile'); }
    finally { this.loading.set(false); }
  }

  async handleSave() {
    const user = this.auth.user();
    if (!user) return;
    this.saving.set(true);
    try {
      // Map frontend 'phone' to backend 'phoneNumber'
      const payload = {
        fullName: this.form.fullName,
        phoneNumber: this.form.phone
      };
      await this.api.auth.updateProfile(payload);
      this.auth.updateUser({ ...user, ...this.form });
      this.toast.success('Profile updated!');
    } catch (err: any) {
      this.toast.error(err?.message || 'Update failed');
    } finally { this.saving.set(false); }
  }
}
