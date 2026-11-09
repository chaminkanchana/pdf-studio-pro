import React, { useState, useEffect, useRef } from 'react';
import { X, SplitSquareVertical, Upload, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfWorker';
import { readFileAsArrayBuffer } from '../../services/pdfService';

interface ComparePdfsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBuffer1?: ArrayBuffer | null;
  onToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ComparePdfsModal: React.FC<ComparePdfsModalProps> = ({
  isOpen,
  onClose,
  initialBuffer1,
  onToast,
}) => {
  const [buf1, setBuf1] = useState<ArrayBuffer | null>(initialBuffer1 || null);
  const [buf2, setBuf2] = useState<ArrayBuffer | null>(null);
  const [doc1Name, setDoc1Name] = useState(initialBuffer1 ? 'Original Version' : 'Upload Doc 1');
  const [doc2Name, setDoc2Name] = useState('Upload Doc 2');

  const [pageCount1, setPageCount1] = useState(0);
  const [pageCount2, setPageCount2] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const canvas1Ref = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialBuffer1) {
      setBuf1(initialBuffer1);
    }
  }, [initialBuffer1]);

  // Render pages when buffers or currentPage changes
  useEffect(() => {
    if (!isOpen) return;

    const render = async () => {
      setIsLoading(true);
      try {
        if (buf1 && canvas1Ref.current) {
          const doc1 = await pdfjsLib.getDocument({ data: new Uint8Array(buf1) }).promise;
          setPageCount1(doc1.numPages);
          const p1 = Math.min(currentPage, doc1.numPages);
          const page = await doc1.getPage(p1);
          const vp = page.getViewport({ scale: 1.2 });
          const canvas = canvas1Ref.current;
          canvas.width = vp.width;
          canvas.height = vp.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // @ts-ignore
            await page.render({ canvasContext: ctx, viewport: vp }).promise;
          }
        }

        if (buf2 && canvas2Ref.current) {
          const doc2 = await pdfjsLib.getDocument({ data: new Uint8Array(buf2) }).promise;
          setPageCount2(doc2.numPages);
          const p2 = Math.min(currentPage, doc2.numPages);
          const page = await doc2.getPage(p2);
          const vp = page.getViewport({ scale: 1.2 });
          const canvas = canvas2Ref.current;
          canvas.width = vp.width;
          canvas.height = vp.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // @ts-ignore
            await page.render({ canvasContext: ctx, viewport: vp }).promise;
          }
        }
      } catch (err: unknown) {
        console.error('Error comparing documents:', err);
      } finally {
        setIsLoading(false);
      }
    };

    render();
  }, [isOpen, buf1, buf2, currentPage]);

  if (!isOpen) return null;

  const handleUpload1 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    const b = await readFileAsArrayBuffer(f);
    setBuf1(b);
    setDoc1Name(f.name);
    setCurrentPage(1);
  };

  const handleUpload2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    const b = await readFileAsArrayBuffer(f);
    setBuf2(b);
    setDoc2Name(f.name);
    setCurrentPage(1);
  };

  const maxPages = Math.max(pageCount1, pageCount2, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-5xl w-full flex flex-col h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SplitSquareVertical className="w-5 h-5 text-blue-600" />
              Side-by-Side Document Comparator
            </h2>

            {/* Pagination Controls */}
            {(buf1 || buf2) && (
              <div className="flex items-center gap-2 ml-4 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-semibold">
                  Page {currentPage} of {maxPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(maxPages, p + 1))}
                  disabled={currentPage >= maxPages}
                  className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 2-column view */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-100 dark:bg-slate-950">
          {/* Column 1 */}
          <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                Doc A: {doc1Name}
              </span>
              <label className="cursor-pointer text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Upload</span>
                <input type="file" accept=".pdf,application/pdf" onChange={handleUpload1} className="hidden" />
              </label>
            </div>

            <div className="flex-1 p-4 flex items-center justify-center overflow-auto min-h-[300px]">
              {buf1 ? (
                <canvas ref={canvas1Ref} className="shadow-md rounded border border-slate-200 dark:border-slate-700 max-w-full" />
              ) : (
                <div className="text-center text-slate-400 text-xs">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                  Select Document A to compare
                </div>
              )}
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                Doc B: {doc2Name}
              </span>
              <label className="cursor-pointer text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Upload</span>
                <input type="file" accept=".pdf,application/pdf" onChange={handleUpload2} className="hidden" />
              </label>
            </div>

            <div className="flex-1 p-4 flex items-center justify-center overflow-auto min-h-[300px]">
              {buf2 ? (
                <canvas ref={canvas2Ref} className="shadow-md rounded border border-slate-200 dark:border-slate-700 max-w-full" />
              ) : (
                <div className="text-center text-slate-400 text-xs">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                  Select Document B (Rev / Revision draft)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Compare visual differences between drafts before final assignment submission.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
