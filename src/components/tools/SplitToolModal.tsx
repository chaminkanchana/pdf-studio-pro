import React, { useState, useEffect } from 'react';
import { X, Scissors, CheckCircle2, Loader2 } from 'lucide-react';
import { splitPdf, downloadFile } from '../../services/pdfService';
import { PDFDocument } from 'pdf-lib';

interface SplitToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBuffer: ArrayBuffer | null;
  fileName?: string;
  onToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SplitToolModal: React.FC<SplitToolModalProps> = ({
  isOpen,
  onClose,
  pdfBuffer,
  fileName = 'document.pdf',
  onToast,
}) => {
  const [pageCount, setPageCount] = useState(1);
  const [selectedPages, setSelectedPages] = useState<number[]>([1]);
  const [rangeInput, setRangeInput] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (pdfBuffer && isOpen) {
      PDFDocument.load(pdfBuffer, { ignoreEncryption: true })
        .then(doc => {
          const total = doc.getPageCount();
          setPageCount(total);
          setSelectedPages([1]);
          setRangeInput('1');
        })
        .catch(() => {
          setPageCount(1);
        });
    }
  }, [pdfBuffer, isOpen]);

  if (!isOpen) return null;

  const togglePage = (page: number) => {
    setSelectedPages(prev => {
      let next: number[];
      if (prev.includes(page)) {
        if (prev.length === 1) return prev; // Keep at least one
        next = prev.filter(p => p !== page);
      } else {
        next = [...prev, page].sort((a, b) => a - b);
      }
      setRangeInput(next.join(', '));
      return next;
    });
  };

  const selectAll = () => {
    const all = Array.from({ length: pageCount }, (_, i) => i + 1);
    setSelectedPages(all);
    setRangeInput(all.join(', '));
  };

  const handleRangeInputChange = (val: string) => {
    setRangeInput(val);
    const parsed: number[] = [];
    const parts = val.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let p = start; p <= end; p++) {
            if (p >= 1 && p <= pageCount && !parsed.includes(p)) {
              parsed.push(p);
            }
          }
        }
      } else {
        const p = Number(trimmed);
        if (!isNaN(p) && p >= 1 && p <= pageCount && !parsed.includes(p)) {
          parsed.push(p);
        }
      }
    }
    if (parsed.length > 0) {
      setSelectedPages(parsed.sort((a, b) => a - b));
    }
  };

  const handleExtract = async () => {
    if (!pdfBuffer) {
      onToast('No PDF Loaded', 'Please load a PDF before splitting', 'error');
      return;
    }

    if (selectedPages.length === 0) {
      onToast('Selection Empty', 'Please select at least one page to extract', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const extractedBytes = await splitPdf(pdfBuffer, selectedPages);
      const baseName = fileName.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_pages_${selectedPages.join('_')}.pdf`;
      downloadFile(extractedBytes, outName);
      onToast('Extraction Complete', `Extracted ${selectedPages.length} pages successfully!`, 'success');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to split document';
      onToast('Split Error', msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scissors className="w-5 h-5 text-blue-600" />
              Split & Extract Pages
            </h2>
            <p className="text-xs text-slate-500">
              Extract specific pages or chapter ranges into a standalone PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Document: <span className="font-mono text-blue-600 dark:text-blue-400">{fileName}</span>
            </span>
            <span className="text-slate-500 font-mono">Total: {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Page Range Expression (e.g., 1-2, 4)
            </label>
            <input
              type="text"
              value={rangeInput}
              onChange={e => handleRangeInputChange(e.target.value)}
              placeholder="e.g. 1-3, 5"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click Pages to Include:
              </span>
              <button
                onClick={selectAll}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Select All ({pageCount})
              </button>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => {
                const isSelected = selectedPages.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePage(p)}
                    className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {selectedPages.length} {selectedPages.length === 1 ? 'page' : 'pages'} selected for extraction
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExtract}
              disabled={selectedPages.length === 0 || isProcessing}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Extract & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
