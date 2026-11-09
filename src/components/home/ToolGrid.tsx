import React, { useState, useMemo } from 'react';
import { 
  PenTool, 
  Type, 
  FileSignature, 
  Stamp, 
  Hash, 
  ShieldAlert, 
  Files, 
  Scissors, 
  RotateCw, 
  Trash2, 
  ArrowUpDown, 
  Copy, 
  Image, 
  FileImage, 
  FileText, 
  FileCode, 
  Table, 
  Presentation, 
  GraduationCap, 
  Layers, 
  BookOpen, 
  Highlighter, 
  UserX, 
  Lock, 
  KeyRound, 
  Search, 
  SplitSquareVertical, 
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { ToolCategory, ToolItem } from '../../types/pdf';

interface ToolGridProps {
  onSelectTool: (toolId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  PenTool: <PenTool className="w-5 h-5" />,
  Type: <Type className="w-5 h-5" />,
  FileSignature: <FileSignature className="w-5 h-5" />,
  Stamp: <Stamp className="w-5 h-5" />,
  Hash: <Hash className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
  Files: <Files className="w-5 h-5" />,
  Scissors: <Scissors className="w-5 h-5" />,
  RotateCw: <RotateCw className="w-5 h-5" />,
  Trash2: <Trash2 className="w-5 h-5" />,
  ArrowUpDown: <ArrowUpDown className="w-5 h-5" />,
  Copy: <Copy className="w-5 h-5" />,
  Image: <Image className="w-5 h-5" />,
  FileImage: <FileImage className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  FileCode: <FileCode className="w-5 h-5" />,
  Table: <Table className="w-5 h-5" />,
  Presentation: <Presentation className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Highlighter: <Highlighter className="w-5 h-5" />,
  UserX: <UserX className="w-5 h-5" />,
  Lock: <Lock className="w-5 h-5" />,
  KeyRound: <KeyRound className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
  SplitSquareVertical: <SplitSquareVertical className="w-5 h-5" />,
  Eye: <Eye className="w-5 h-5" />,
};

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter(tool => {
      const matchesCategory = 
        activeCategory === 'all' || 
        tool.category === activeCategory ||
        (activeCategory === 'student' && tool.studentToolkit);

      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const categories: { key: ToolCategory; label: string }[] = [
    { key: 'all', label: 'All Tools' },
    { key: 'edit', label: 'Edit PDF' },
    { key: 'organize', label: 'Organize PDF' },
    { key: 'convert', label: 'Convert' },
    { key: 'student', label: 'Student Toolkit' },
    { key: 'security', label: 'Security' },
    { key: 'advanced', label: 'Advanced' },
  ];

  return (
    <section id="organize-section" className="py-16 bg-white dark:bg-[#0B1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Controls row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Comprehensive Document Suite
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select a specialized PDF utility or enter a search query below
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search PDF tools (e.g., merge, watermark)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Tabs (Segmented controls with click handlers) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors ${
                activeCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools Cards Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              No matching PDF tools found for "{searchQuery}"
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reset filters & view all tools
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map(tool => {
              const isWorking = tool.status === 'working';
              const iconElement = ICON_MAP[tool.iconName] || <FileText className="w-5 h-5" />;

              return (
                <div
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Icon and status badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {iconElement}
                      </div>

                      {isWorking ? (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Client-Side
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Backend
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span>{isWorking ? 'Open Tool' : 'View Requirements'}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
