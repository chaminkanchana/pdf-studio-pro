import React from 'react';
import { FileText, Sun, Moon, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSpecsModal: () => void;
  onLoadSamplePdf: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
  onOpenSpecsModal,
  onLoadSamplePdf,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            PDF Studio <span className="text-blue-600 dark:text-blue-400">Pro</span>
          </span>
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 ${
              currentView === 'home' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            All Tools
          </button>

          <button
            onClick={() => onNavigate('editor')}
            className={`transition-colors whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 ${
              currentView === 'editor' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            Visual Editor
          </button>

          <button
            onClick={() => {
              onNavigate('home');
              setTimeout(() => {
                const el = document.getElementById('organize-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="transition-colors whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400"
          >
            Organize & Merge
          </button>

          <button
            onClick={() => {
              onNavigate('home');
              setTimeout(() => {
                const el = document.getElementById('convert-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="transition-colors whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400"
          >
            Image Convert
          </button>

          <button
            onClick={() => {
              onNavigate('home');
              setTimeout(() => {
                const el = document.getElementById('student-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="transition-colors whitespace-nowrap text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Student Toolkit
          </button>

          <button
            onClick={onOpenSpecsModal}
            className="transition-colors whitespace-nowrap text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Audit Specs
          </button>
        </nav>

        {/* Zone 3: 1 primary action + theme toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={onLoadSamplePdf}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap"
            title="Load an authentic sample university PDF to instantly test all tools"
          >
            <span>Load Sample PDF</span>
          </button>

          <button
            onClick={() => onNavigate('editor')}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            Open Workspace
          </button>
        </div>
      </div>
    </header>
  );
};
