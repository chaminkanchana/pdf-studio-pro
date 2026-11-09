import React, { useState } from 'react';
import { X, FileImage, Download, Loader2, CheckCircle2, Archive } from 'lucide-react';
import { pdfToImages, downloadFile } from '../../services/pdfService';
import JSZip from 'jszip';

interface ConvertPdfToImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBuffer: ArrayBuffer | null;
  fileName?: string;
  onToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ConvertPdfToImageModal: React.FC<ConvertPdfToImageModalProps> = ({
  isOpen,
  onClose,
  pdfBuffer,
  fileName = 'document.pdf',
  onToast,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [isRendering, setIsRendering] = useState(false);
  const [renderedImages, setRenderedImages] = useState<{ pageNum: number; dataUrl: string; width: number; height: number }[]>([]);

  if (!isOpen) return null;

  const handleRender = async () => {
    if (!pdfBuffer) {
      onToast('No PDF', 'Please load a PDF to render into images', 'error');
      return;
    }

    try {
      setIsRendering(true);
      const results = await pdfToImages(pdfBuffer, format, 2.0); // 2x scale for crisp quality
      setRenderedImages(results);
      onToast('Rendering Complete', `Rendered ${results.length} pages into ${format.toUpperCase()} images`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to render PDF pages';
      onToast('Render Error', msg, 'error');
    } finally {
      setIsRendering(false);
    }
  };

  const downloadSingleImage = (img: { pageNum: number; dataUrl: string }) => {
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = img.dataUrl;
    a.download = `${baseName}_page_${img.pageNum}.${format === 'jpeg' ? 'jpg' : 'png'}`;
    a.click();
  };

  const downloadAllAsZip = async () => {
    if (renderedImages.length === 0) return;
    try {
      const zip = new JSZip();
      const baseName = fileName.replace(/\.[^/.]+$/, '');

      renderedImages.forEach(img => {
        const base64Data = img.dataUrl.split(',')[1];
        const ext = format === 'jpeg' ? 'jpg' : 'png';
        zip.file(`${baseName}_page_${img.pageNum}.${ext}`, base64Data, { base64: true });
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, `${baseName}_images.zip`, 'application/zip');
      onToast('ZIP Created', 'All images downloaded as a ZIP archive!', 'success');
    } catch {
      onToast('ZIP Error', 'Failed to generate ZIP archive', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileImage className="w-5 h-5 text-blue-600" />
              Convert PDF to High-Resolution Images
            </h2>
            <p className="text-xs text-slate-500">
              Render document pages to crisp PNG or JPEG images
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
          {/* Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Format:</span>
              <div className="flex items-center bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setFormat('png')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    format === 'png' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  PNG (Lossless)
                </button>
                <button
                  onClick={() => setFormat('jpeg')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    format === 'jpeg' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  JPEG (Compact)
                </button>
              </div>
            </div>

            <button
              onClick={handleRender}
              disabled={isRendering || !pdfBuffer}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              {isRendering ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Rasterizing Pages...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Render Document Pages</span>
                </>
              )}
            </button>
          </div>

          {/* Rendered images grid */}
          {renderedImages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Rendered Pages ({renderedImages.length})
                </span>
                <button
                  onClick={downloadAllAsZip}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Download All as ZIP</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {renderedImages.map(img => (
                  <div
                    key={img.pageNum}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between"
                  >
                    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 mb-2 aspect-[3/4] flex items-center justify-center">
                      <img
                        src={img.dataUrl}
                        alt={`Page ${img.pageNum}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Page {img.pageNum}
                      </span>
                      <button
                        onClick={() => downloadSingleImage(img)}
                        className="p-1 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                        title="Download page image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end">
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
