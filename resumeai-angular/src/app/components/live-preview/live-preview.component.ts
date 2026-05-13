import { Component, inject, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeStoreService, TemplateStoreService } from '../../services/store.service';
import { parseContent } from '../../models';

function buildSectionHtml(sections: any[]): string {
  return sections.map(s => {
    const content = parseContent(s.content);
    let body = '';
    
    if (s.sectionType === 'SUMMARY') {
      body = `<p style="margin: 0; color: #4b5563;">${content?.summary || content || ''}</p>`;
    } else if (Array.isArray(content)) {
      body = content.map((item: any) => {
        const title = item.title || item.school || item.organization || '';
        const subtitle = item.company || item.degree || item.role || '';
        const dates = item.dates || item.year || '';
        const desc = item.description || item.technologies || item.issuer || '';
        
        return `
          <div class="content-item" style="margin-bottom: 12px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-weight: bold; color: #111;">${title}</span>
              <span style="font-size: 12px; color: #6b7280;">${dates}</span>
            </div>
            <div style="color: #4b5563; font-style: italic; font-size: 13px;">${subtitle}</div>
            ${desc ? `<div style="margin-top: 4px; color: #374151; font-size: 13px;">${desc}</div>` : ''}
          </div>
        `;
      }).join('');
    } else if (content?.skills) {
      const skills = Array.isArray(content.skills) ? content.skills : [];
      body = `<div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${skills.map((skill: string) => `<span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${skill}</span>`).join('')}
      </div>`;
    }

    return `
      <div class="resume-section" style="margin-bottom: 24px; page-break-inside: avoid;">
        <h3 style="color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">
          ${s.title}
        </h3>
        ${body}
      </div>
    `;
  }).join('');
}

function injectDataIntoTemplate(htmlLayout: string | null, cssStyles: string | null, resume: any, sections: any[]): string {
  if (!htmlLayout) return buildFallbackHtml(resume, sections);

  let html = htmlLayout;
  // Basic token replacement
  html = html.replace(/\{\{resume\.title\}\}/g, resume?.title || '');
  html = html.replace(/\{\{resume\.targetJobTitle\}\}/g, resume?.targetJobTitle || '');
  
  // Section replacement
  const sectionsHtml = buildSectionHtml(sections);
  html = html.replace(/\{\{sections\}\}/g, sectionsHtml);

  const baseStyles = `
    @page { size: A4; margin: 0; }
    body { 
      margin: 0; 
      padding: 0; 
      background: #f3f4f6; 
      display: flex; 
      flex-direction: column; 
      align-items: center;
    }
    .page-container {
      background: white;
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      box-sizing: border-box;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      margin: 20px 0;
      position: relative;
      /* Visual page break lines */
      background-image: linear-gradient(to bottom, transparent 296.5mm, #e5e7eb 296.5mm, #e5e7eb 297mm, transparent 297mm);
      background-size: 100% 297mm;
    }
    .resume-section { page-break-inside: avoid; }
    .content-item { page-break-inside: avoid; }
    @media print {
      body { background: white; }
      .page-container { 
        margin: 0; 
        box-shadow: none; 
        background-image: none;
        width: 100%;
      }
    }
  `;

  const styleTag = `<style>${baseStyles} ${cssStyles || ''}</style>`;
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${styleTag}</head>`);
  } else {
    html = styleTag + html;
  }

  // Wrap content in page-container if not present
  if (!html.includes('class="page-container"')) {
    html = html.replace('<body>', '<body><div class="page-container">');
    html = html.replace('</body>', '</div></body>');
  }

  return html;
}

function buildFallbackHtml(resume: any, sections: any[]): string {
  const sectionHtml = buildSectionHtml(sections);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  @page { size: A4; margin: 0; }
  body { 
    font-family: 'Inter', system-ui, -apple-system, sans-serif; 
    margin: 0; 
    padding: 0;
    background: #f3f4f6;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #333; 
    font-size: 14px; 
    line-height: 1.6; 
  }
  .page-container {
    background: white;
    width: 210mm;
    min-height: 297mm;
    padding: 20mm;
    box-sizing: border-box;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    margin: 20px 0;
    /* Visual page break indicators */
    background-image: linear-gradient(to bottom, transparent 296.5mm, #e5e7eb 296.5mm, #e5e7eb 297mm, transparent 297mm);
    background-size: 100% 297mm;
  }
  h1 { font-size: 28px; margin: 0; color: #111; font-weight: 800; }
  h2 { font-size: 16px; font-weight: 500; color: #4b5563; margin: 4px 0 24px; }
  .header { border-bottom: 3px solid #111; padding-bottom: 16px; margin-bottom: 32px; }
  .resume-section { page-break-inside: avoid; }
  @media print {
    body { background: white; }
    .page-container { margin: 0; box-shadow: none; background-image: none; width: 100%; }
  }
</style></head><body>
<div class="page-container">
  <div class="header">
    <h1>${resume?.title || 'Resume'}</h1>
    <h2>${resume?.targetJobTitle || ''}</h2>
  </div>
  ${sectionHtml}
</div>
</body></html>`;
}

@Component({
  selector: 'app-live-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-1 bg-[#0f111a] flex flex-col overflow-hidden">
      <!-- Preview header -->
      <div class="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#161925]">
        <div class="flex items-center gap-3">
          <div class="flex gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-[#28c840]"></div>
          </div>
          <div class="h-4 w-px bg-white/10 mx-1"></div>
          <span class="text-[11px] font-medium text-white/40 tracking-wider uppercase">Live Preview</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span class="text-[10px] font-semibold text-emerald-500/90 uppercase tracking-tighter">Connected</span>
          </div>
          <span class="text-[11px] text-white/30 font-medium">
            {{ tmplStore.selectedTemplate()?.name || 'Standard' }}
          </span>
        </div>
      </div>

      <!-- Iframe wrapper -->
      <div class="flex-1 overflow-auto bg-[#0a0c14] custom-scrollbar p-8 flex justify-center">
        <div class="relative w-full max-w-[850px] min-h-full">
          <!-- Page info badge -->
          <div class="absolute -left-16 top-0 hidden xl:flex flex-col gap-2">
             <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors cursor-help" title="A4 Format">
               <span class="text-[10px] font-bold">A4</span>
             </div>
          </div>

          <div class="bg-white rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 transform origin-top">
            <iframe
              #previewIframe
              title="Resume Preview"
              class="w-full block"
              style="height: calc(100vh - 120px); border: none; min-height: 1122px;"
              sandbox="allow-same-origin"
            ></iframe>
          </div>
          
          <div class="mt-8 mb-12 text-center">
            <p class="text-[11px] text-white/20 font-medium tracking-widest uppercase">End of Preview</p>
          </div>
        </div>
      </div>
    </div>

    <style>
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.15);
      }
    </style>
  `
})
export class LivePreviewComponent {
  @ViewChild('previewIframe') iframeRef!: ElementRef<HTMLIFrameElement>;

  readonly resumeStore = inject(ResumeStoreService);
  readonly tmplStore = inject(TemplateStoreService);

  constructor() {
    effect(() => {
      const resume = this.resumeStore.currentResume();
      const sections = this.resumeStore.sections();
      const tmpl = this.tmplStore.selectedTemplate();
      this.updatePreview(resume, sections, tmpl);
    });
  }

  private updatePreview(resume: any, sections: any[], tmpl: any) {
    setTimeout(() => {
      const iframe = this.iframeRef?.nativeElement;
      if (!iframe) return;
      const html = resume
        ? injectDataIntoTemplate(tmpl?.htmlLayout || null, tmpl?.cssStyles || null, resume, sections)
        : '<html><body style="font-family:sans-serif;color:#999;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0a0c14"><p>Loading preview…</p></body></html>';
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      doc.open();
      doc.write(html);
      doc.close();

      // Dynamic height adjustment to fit content
      setTimeout(() => {
        const body = doc.body;
        const html = doc.documentElement;
        const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        iframe.style.height = (height + 50) + 'px';
      }, 100);
    }, 0);
  }
}
