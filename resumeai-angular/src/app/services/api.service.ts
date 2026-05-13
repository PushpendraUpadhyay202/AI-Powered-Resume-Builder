import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { AuthService } from './auth.service';

const SERVICES = {
  auth:     'https://resume-ai-auth-f9dh.onrender.com',
  resume:   'https://resume-ai-resumes-rzy2.onrender.com',
  section:  'https://resume-ai-sections-tt5s.onrender.com',
  template: 'https://resume-ai-templates-fbj8.onrender.com',
  ai:       'https://resume-ai-ai-ewju.onrender.com',
  export:   'https://resume-ai-export.onrender.com', // Placeholder URL for export
  payment:  'https://resume-ai-payment.onrender.com',
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private authClient: AxiosInstance;
  private resumeClient: AxiosInstance;
  private sectionClient: AxiosInstance;
  private templateClient: AxiosInstance;
  private aiClient: AxiosInstance;
  private exportClient: AxiosInstance;

  constructor(private authService: AuthService) {
    this.authClient     = this.createClient(SERVICES.auth);
    this.resumeClient   = this.createClient(SERVICES.resume);
    this.sectionClient  = this.createClient(SERVICES.section);
    this.templateClient = this.createClient(SERVICES.template);
    this.aiClient       = this.createClient(SERVICES.ai);
    this.exportClient   = this.createClient(SERVICES.export);
  }

  private createClient(baseURL: string): AxiosInstance {
    const client = axios.create({ baseURL });
    client.interceptors.request.use(config => {
      const token = this.authService.token();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    client.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) {
          this.authService.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    );
    return client;
  }

  private unwrap(res: any): any {
    const { data } = res;
    if (!data.success) throw new Error(data.message || 'Request failed');
    return data.data;
  }

  // Auth API
  readonly auth = {
    register: (body: any) => this.authClient.post('/api/auth/register', body).then(r => this.unwrap(r)),
    login:    (body: any) => this.authClient.post('/api/auth/login', body).then(r => this.unwrap(r)),
    googleSignin: (idToken: string) => this.authClient.post('/api/auth/google-signin', { idToken }).then(r => this.unwrap(r)),
    profile:  ()        => this.authClient.get('/api/auth/profile').then(r => this.unwrap(r)),
    updateProfile: (body: any) => this.authClient.put('/api/auth/profile', body).then(r => this.unwrap(r)),
    changePassword: (id: any, body: any) => this.authClient.put(`/api/auth/password/${id}`, body).then(r => this.unwrap(r)),
  };

  // Resume API
  readonly resume = {
    create:    (body: any) => this.resumeClient.post('/api/resumes', body).then(r => this.unwrap(r)),
    duplicate: (id: any)   => this.resumeClient.post(`/api/resumes/duplicate/${id}`).then(r => this.unwrap(r)),
    get:       (id: any)   => this.resumeClient.get(`/api/resumes/${id}`).then(r => this.unwrap(r)),
    getByUser: (uid: any)  => this.resumeClient.get(`/api/resumes/user/${uid}`).then(r => this.unwrap(r)),
    update:    (id: any, body: any) => this.resumeClient.put(`/api/resumes/${id}`, body).then(r => this.unwrap(r)),
    publish:   (id: any)   => this.resumeClient.put(`/api/resumes/publish/${id}`).then(r => this.unwrap(r)),
    delete:    (id: any)   => this.resumeClient.delete(`/api/resumes/${id}`).then(r => this.unwrap(r)),
  };

  // Section API
  readonly section = {
    create:     (body: any) => this.sectionClient.post('/api/sections', body).then(r => this.unwrap(r)),
    getByResume: (rid: any) => this.sectionClient.get(`/api/sections/resume/${rid}`).then(r => this.unwrap(r)),
    update:     (id: any, body: any) => this.sectionClient.put(`/api/sections/${id}`, body).then(r => this.unwrap(r)),
    delete:     (id: any)  => this.sectionClient.delete(`/api/sections/${id}`).then(r => this.unwrap(r)),
    reorder:    (resumeId: any, ids: any) => this.sectionClient.put(`/api/sections/reorder/${resumeId}`, ids).then(r => this.unwrap(r)),
    bulkUpdate: (resumeId: any, sections: any) => this.sectionClient.put(`/api/sections/bulk/${resumeId}`, sections).then(r => this.unwrap(r)),
    toggleVisibility: (id: any) => this.sectionClient.put(`/api/sections/toggle/${id}`).then(r => this.unwrap(r)),
  };

  // Template API
  readonly template = {
    list: () => this.templateClient.get('/api/templates').then(r => this.unwrap(r)),
    get:  (id: any) => this.templateClient.get(`/api/templates/${id}`).then(r => this.unwrap(r)),
    getByCategory: (cat: string) => this.templateClient.get(`/api/templates/category/${cat}`).then(r => this.unwrap(r)),
    incrementUsage: (id: any) => this.templateClient.put(`/api/templates/use/${id}`).then(r => this.unwrap(r)),
  };

  // AI API
  readonly ai = {
    generateSummary: (body: any) => this.aiClient.post('/api/ai/generate-summary', body).then(r => this.unwrap(r)),
    generateBullets: (body: any) => this.aiClient.post('/api/ai/generate-bullets', body).then(r => this.unwrap(r)),
    improve:         (body: any) => this.aiClient.post('/api/ai/improve-section', body).then(r => this.unwrap(r)),
    checkAts:        (body: any) => this.aiClient.post('/api/ai/check-ats', body).then(r => this.unwrap(r)),
    quota:           ()          => this.aiClient.get('/api/ai/quota').then(r => this.unwrap(r)),
  };

  // Export API
  readonly export = {
    pdf: async (resumeId: any): Promise<Blob> => {
      const token = this.authService.token();
      const res = await fetch(`${SERVICES.export}/api/export/pdf/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      return res.blob();
    }
  };
}
