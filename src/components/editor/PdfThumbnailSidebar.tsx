import React, { useEffect, useRef } from 'react';
import { RotateCw, Trash2, Plus, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfWorker';

interface PdfThumbnailSidebarProps {
  pdfBuffer: ArrayBuffer | null;
  pageCount: number;
  currentPage: number;
  onSelectPage: (page: number) => void;
  onRotatePage: (page: number) => void;
  onDeletePage: (page: number) => void;
  onDuplicatePage: (page: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onAddBlankPage: () => void;
}

export const PdfThumbnailSidebar: React.FC<PdfThumbnailSidebarProps> = ({
  pdfBuffer,
  pageCount,
  currentPage,
  onSelectPage,
  onRotatePage,
  onDeletePage,
  onDuplicatePage,
  onMovePage,
  onAddBlankPage,
}) => {
  return (
    <aside className="w-56 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Pages ({pageCount})
        </span>
        <button
          onClick={onAddBlankPage}
          className="p-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60"
          title="Add blank page"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnails List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map(pageNum => {
          const isSelected = pageNum === currentPage;
          return (
            <div
              key={pageNum}
              className={`group relative p-2 rounded-xl border transition-all ${
                isSelected
                  ? 'border-blue-600 bg-white dark:bg-slate-800 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/40 hover:border-slate-300'
              }`}
            >
              {/* Thumbnail Container */}
              <div
                onClick={() => onSelectPage(pageNum)}
                className="cursor-pointer aspect-[1/1.414] bg-white rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center relative mb-1.5 shadow-xs"
              >
                <ThumbnailCanvas
                  pdfBuffer={pdfBuffer}
                  pageNum={pageNum}
                />
                <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900/70 text-white font-mono">
                  {pageNum}
                </span>
              </div>

              {/* Page action strip */}
              <div className="flex items-center justify-between text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors pt-0.5">
                <span className="text-[10px] font-bold font-mono text-slate-500">
                  P.{pageNum}
                </span>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => onMovePage(pageNum - 1, pageNum - 2)}
                    disabled={pageNum === 1}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20"
                    title="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onMovePage(pageNum - 1, pageNum)}
                    disabled={pageNum === pageCount}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20"
                    title="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onRotatePage(pageNum)}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600"
                    title="Rotate 90° clockwise"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDuplicatePage(pageNum)}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600"
                    title="Duplicate page"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {pageCount > 1 && (
                    <button
                      onClick={() => onDeletePage(pageNum)}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/60 text-slate-400 hover:text-red-500"
                      title="Delete page"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

const ThumbnailCanvas: React.FC<{ pdfBuffer: ArrayBuffer | null; pageNum: number }> = ({
  pdfBuffer,
  pageNum,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isCancelled = false;
    if (!pdfBuffer || !canvasRef.current) return;

    pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) }).promise.then(async doc => {
      if (isCancelled) return;
      if (pageNum > doc.numPages) return;
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.22 });
      const canvas = canvasRef.current;
      if (!canvas || isCancelled) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // @ts-ignore
      await page.render({ canvasContext: ctx, viewport }).promise;
    }).catch(() => {
      // Ignored on fast destroy
    });

    return () => {
      isCancelled = true;
    };
  }, [pdfBuffer, pageNum]);

  return <canvas ref={canvasRef} className="w-full h-full object-contain" />;
};
