export interface User {
  userId: number;
  email: string;
  fullName?: string;
  phone?: string;
  subscriptionPlan?: string;
  role?: string;
  provider?: string;
}

export interface AdminOverview {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  localUsers: number;
  googleUsers: number;
}

export interface AdminUserDto {
  id: number;
  fullName: string;
  email: string;
  role: string;
  subscriptionPlan: string;
  provider: string;
  phoneNumber: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface Resume {
  resumeId: number;
  title: string;
  targetJobTitle?: string;
  atsScore?: number;
  isPublic?: boolean;
  status?: string;
  updatedAt?: string;
  templateId?: number;
}

export interface Section {
  sectionId: number;
  resumeId: number;
  sectionType: string;
  title: string;
  content: any;
  displayOrder?: number;
  isVisible?: boolean;
}

export interface Template {
  templateId: number;
  name: string;
  category?: string;
  isPremium?: boolean;
  previewUrl?: string;
  usageCount?: number;
  htmlLayout?: string;
  cssStyles?: string;
}

export const SECTION_META: Record<string, { label: string; color: string; icon: string }> = {
  SUMMARY:        { label: 'Summary',        color: 'text-blue-400 bg-blue-400/10',    icon: '✦' },
  EXPERIENCE:     { label: 'Experience',     color: 'text-purple-400 bg-purple-400/10', icon: '◈' },
  EDUCATION:      { label: 'Education',      color: 'text-green-400 bg-green-400/10',  icon: '◉' },
  SKILLS:         { label: 'Skills',         color: 'text-yellow-400 bg-yellow-400/10', icon: '◈' },
  CERTIFICATIONS: { label: 'Certifications', color: 'text-orange-400 bg-orange-400/10', icon: '◎' },
  PROJECTS:       { label: 'Projects',       color: 'text-pink-400 bg-pink-400/10',    icon: '◇' },
  LANGUAGES:      { label: 'Languages',      color: 'text-teal-400 bg-teal-400/10',   icon: '◆' },
  VOLUNTEER:      { label: 'Volunteer',      color: 'text-rose-400 bg-rose-400/10',   icon: '◈' },
  CUSTOM:         { label: 'Custom',         color: 'text-gray-400 bg-gray-400/10',   icon: '◈' },
};

export const SECTION_TYPES = Object.keys(SECTION_META);

export function parseContent(content: any): any {
  if (!content) return null;
  if (typeof content === 'object') return content;
  try { return JSON.parse(content); } catch { return content; }
}

export function stringifyContent(content: any): string {
  if (typeof content === 'string') return content;
  return JSON.stringify(content);
}

export function defaultContent(type: string): any {
  switch (type) {
    case 'SUMMARY':        return { summary: '' };
    case 'EXPERIENCE':     return [{ company: '', title: '', dates: '', description: '' }];
    case 'EDUCATION':      return [{ school: '', degree: '', year: '' }];
    case 'SKILLS':         return { skills: [] };
    case 'CERTIFICATIONS': return [{ title: '', issuer: '' }];
    case 'PROJECTS':       return [{ title: '', technologies: '', description: '' }];
    case 'LANGUAGES':      return [{ language: '', level: '' }];
    case 'VOLUNTEER':      return [{ organization: '', role: '', dates: '', description: '' }];
    case 'CUSTOM':         return { fullName: '', email: '', phone: '' };
    default:               return {};
  }
}
