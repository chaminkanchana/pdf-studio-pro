import React, { useState, useEffect } from 'react';
import { X, Search, Copy, Download, Loader2, Check } from 'lucide-react';
import { extractTextFromPdf, downloadFile } from '../../services/pdfService';

interface ExtractTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBuffer: ArrayBuffer | null;
  fileName?: string;
  onToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExtractTextModal: React.FC<ExtractTextModalProps> = ({
  isOpen,
  onClose,
  pdfBuffer,
  fileName = 'document.pdf',
  onToast,
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    fullText: string;
    pageTexts: { pageNum: number; text: string; wordCount: number }[];
    totalWords: number;
    totalCharacters: number;
  } | null>(null);

  const [searchWord, setSearchWord] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && pdfBuffer) {
      setIsExtracting(true);
      extractTextFromPdf(pdfBuffer)
        .then(res => {
          setExtractedData(res);
        })
        .catch(err => {
          onToast('Extraction Error', err.message, 'error');
        })
        .finally(() => {
          setIsExtracting(false);
        });
    }
  }, [isOpen, pdfBuffer]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!extractedData) return;
    navigator.clipboard.writeText(extractedData.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onToast('Copied', 'Extracted text copied to clipboard', 'info');
  };

  const handleDownloadTxt = () => {
    if (!extractedData) return;
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const blob = new Blob([extractedData.fullText], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, `${baseName}_extracted_text.txt`, 'text/plain');
    onToast('Downloaded', 'Text file saved to your device', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Document Text & Word Count Analytics
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              {fileName}
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
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {isExtracting ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Extracting textual layers from PDF...
              </p>
              <p className="text-xs text-slate-400 mt-1">Analyzing character streams and line geometry</p>
            </div>
          ) : extractedData ? (
            <>
              {/* Analytics metrics strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Total Words</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                    {extractedData.totalWords.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Total Characters</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
                    {extractedData.totalCharacters.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Pages Analyzed</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                    {extractedData.pageTexts.length}
                  </span>
                </div>
              </div>

              {/* Text Search & Filter */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchWord}
                  onChange={e => setSearchWord(e.target.value)}
                  placeholder="Filter extracted paragraphs by keyword..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Text Box */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 max-h-64 overflow-y-auto font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
                {extractedData.fullText || '(No extractable selectable text found in this PDF. It may contain scanned raster images.)'}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              No document text available.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!extractedData}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy All Text'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              disabled={!extractedData}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .TXT File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
