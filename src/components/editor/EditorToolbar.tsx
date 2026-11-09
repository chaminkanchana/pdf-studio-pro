import React, { useRef } from 'react';
import { 
  MousePointer, 
  Type, 
  Image as ImageIcon, 
  PenTool, 
  Highlighter, 
  Square, 
  Circle, 
  Minus, 
  FileSignature, 
  ShieldAlert, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { AnnotationType } from '../../types/pdf';

interface EditorToolbarProps {
  activeTool: 'select' | AnnotationType;
  onSelectTool: (tool: 'select' | AnnotationType) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenSignatureModal: () => void;
  onAddImage: (dataUrl: string) => void;
  onExportPdf: () => void;
  isExporting: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeTool,
  onSelectTool,
  currentPage,
  totalPages,
  onPageChange,
  zoom,
  onZoomChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenSignatureModal,
  onAddImage,
  onExportPdf,
  isExporting,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onAddImage(reader.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between gap-4 select-none shrink-0 overflow-x-auto no-scrollbar">
      {/* Primary Editing Tools */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSelectTool('select')}
          className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTool === 'select'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Select & move objects"
        >
          <MousePointer className="w-4 h-4" />
          <span className="hidden xl:inline">Select</span>
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          onClick={() => onSelectTool('text')}
          className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTool === 'text'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Add text to document"
        >
          <Type className="w-4 h-4" />
          <span className="hidden xl:inline">Text</span>
        </button>

        <button
          onClick={() => onSelectTool('draw')}
          className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTool === 'draw'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Freehand pen drawing"
        >
          <PenTool className="w-4 h-4" />
          <span className="hidden xl:inline">Draw</span>
        </button>

        <button
          onClick={() => onSelectTool('highlight')}
          className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTool === 'highlight'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Highlight text block"
        >
          <Highlighter className="w-4 h-4" />
          <span className="hidden xl:inline">Highlight</span>
        </button>

        <button
          onClick={() => onSelectTool('rectangle')}
          className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTool === 'rectangle'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Add rectangle box"
        >
          <Square className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTool('circle')}
          className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTool === 'circle'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Add circle / oval"
        >
          <Circle className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTool('line')}
          className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTool === 'line'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Add line"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTool('redaction')}
          className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTool === 'redaction'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Permanent blackout redaction"
        >
          <ShieldAlert className="w-4 h-4" />
          <span className="hidden xl:inline">Redact</span>
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Signature */}
        <button
          onClick={onOpenSignatureModal}
          className="p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          title="Insert drawn or typed signature"
        >
          <FileSignature className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Signature</span>
        </button>

        {/* Image insertion */}
        <button
          onClick={() => imageInputRef.current?.click()}
          className="p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          title="Embed image or stamp"
        >
          <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="hidden sm:inline">Image</span>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageFile}
            className="hidden"
          />
        </button>
      </div>

      {/* Undo / Redo & Pagination */}
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Page Switcher */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono font-medium px-1.5">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onZoomChange(Math.max(0.6, zoom - 0.15))}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-medium w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2.5, zoom + 0.15))}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => onZoomChange(1.0)}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Reset to 100%"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Export Action */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExportPdf}
          disabled={isExporting}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Save & Download PDF</span>
        </button>
      </div>
    </div>
  );
};
