import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, ArrowRight, Sparkles, Shield, Zap, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onFileSelected: (file: File) => void;
  onLoadSamplePdf: () => void;
  onNavigateToTool: (toolId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onFileSelected,
  onLoadSamplePdf,
  onNavigateToTool,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        onFileSelected(file);
      } else if (file.type.startsWith('image/')) {
        onNavigateToTool('jpg-to-pdf');
      } else {
        alert('Please drop a valid PDF or image file.');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <section className="relative pt-12 pb-16 overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-[#0B1120] dark:via-[#0F172A] dark:to-[#0B1120]">
      {/* Background decorative subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          {/* Top subtle academic kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Precision Browser PDF Engine · Built with React & WebAssembly</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
            Every PDF Tool You Need, <br className="hidden sm:block" />
            <span className="text-blue-600 dark:text-blue-400">All in One Place.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Edit, Convert, Merge, Split, Compress and Manage Your PDF Documents Easily. Private, lightning-fast client processing.
          </p>
        </div>

        {/* Drag and Drop Upload Card */}
        <div className="max-w-2xl mx-auto mb-10">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative p-8 sm:p-10 rounded-2xl border-2 border-dashed transition-all duration-200 text-center ${
              isDragging
                ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 hover:border-blue-400 dark:hover:border-blue-500 shadow-xl shadow-slate-200/50 dark:shadow-none'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInput}
              className="hidden"
              id="hero-file-upload"
            />

            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Drag & Drop your PDF file here
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Or click the button below to browse files from your computer
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Select PDF File</span>
              </button>

              <button
                onClick={onLoadSamplePdf}
                className="w-full sm:w-auto px-5 py-3 text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-2"
                title="Generates a live multi-page academic sample PDF for instant testing"
              >
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Test with Sample Report</span>
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Files never leave your browser
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Instant sub-second processing
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                Max size: Up to 100MB
              </span>
            </div>
          </div>
        </div>

        {/* Fast Action Shortcuts */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateToTool('visual-editor')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left group"
          >
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold block mb-0.5">
              Launch Workspace
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 flex items-center justify-between">
              Visual Editor
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => onNavigateToTool('merge-pdf')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left group"
          >
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mb-0.5">
              Multi-File
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 flex items-center justify-between">
              Merge PDFs
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => onNavigateToTool('student-cover-page')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left group"
          >
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block mb-0.5">
              University Special
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 flex items-center justify-between">
              Thesis Cover
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => onNavigateToTool('jpg-to-pdf')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left group"
          >
            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold block mb-0.5">
              Scanner & Photos
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 flex items-center justify-between">
              JPG to PDF
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
