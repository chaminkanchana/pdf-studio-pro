import React from 'react';
import { FileText, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onOpenSpecsModal: () => void;
  onNavigateTool: (toolId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSpecsModal, onNavigateTool }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                PDF Studio Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              University Software Engineering Capstone Project. High-performance, client-side browser document manipulation engine built with React, WebAssembly & Canvas.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4 shrink-0" />
              <span>100% Client-Side Private Processing</span>
            </div>
          </div>

          {/* Core Tools */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Editing & Organizing
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigateTool('visual-editor')} className="hover:text-white transition-colors text-left">
                  Visual Canvas Editor
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTool('merge-pdf')} className="hover:text-white transition-colors text-left">
                  Merge Multiple PDFs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTool('split-pdf')} className="hover:text-white transition-colors text-left">
                  Split & Extract Pages
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTool('rotate-pdf')} className="hover:text-white transition-colors text-left">
                  Rotate Page Orientation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTool('rearrange-pages')} className="hover:text-white transition-colors text-left">
                  Drag & Reorder Pages
                </button>
              </li>
            </ul>
          </div>

          {/* Student Suite */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Student Toolkit
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigateTool('student-cover-page')} className="hover:text-white transition-colors text-left">
                  University Report Cover Generator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTool('student-merge-assignments')} className="hover:text-white transition-colors text-left">
                  Combine Lecture & Lab Notes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTool('page-numbers')} className="hover:text-white transition-colors text-left">
                  Academic Header/Footer Numbering
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTool('extract-text')} className="hover:text-white transition-colors text-left">
                  Extract Text & Word Count
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTool('add-signature')} className="hover:text-white transition-colors text-left">
                  Sign Submissions Electronically
                </button>
              </li>
            </ul>
          </div>

          {/* Conversion & Verification */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Conversion & Audit
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigateTool('jpg-to-pdf')} className="hover:text-white transition-colors text-left">
                  Convert JPG / PNG to PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTool('pdf-to-jpg')} className="hover:text-white transition-colors text-left">
                  Render PDF to High-Res Images
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTool('remove-metadata')} className="hover:text-white transition-colors text-left">
                  Strip Document Metadata
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTool('compare-pdf')} className="hover:text-white transition-colors text-left">
                  Compare Two PDF Drafts
                </button>
              </li>
              <li>
                <button onClick={onOpenSpecsModal} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors text-left">
                  Verification & Capability Checklist →
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 PDF Studio Pro. Academic and commercial evaluation edition.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Zero telemetry · Zero server document caching
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
