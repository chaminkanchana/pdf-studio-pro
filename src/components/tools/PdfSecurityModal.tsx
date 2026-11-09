import React, { useState, useEffect } from 'react';
import { X, Shield, UserX, Lock, CheckCircle2, Loader2, Info } from 'lucide-react';
import { DocumentMetadata } from '../../types/pdf';
import { 
  getPdfMetadata, 
  removePdfMetadata, 
  flattenPdf, 
  downloadFile,
  uint8ArrayToArrayBuffer 
} from '../../services/pdfService';

interface PdfSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBuffer: ArrayBuffer | null;
  fileName?: string;
  onToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onUpdatePdfBuffer?: (newBuffer: ArrayBuffer) => void;
}

export const PdfSecurityModal: React.FC<PdfSecurityModalProps> = ({
  isOpen,
  onClose,
  pdfBuffer,
  fileName = 'document.pdf',
  onToast,
  onUpdatePdfBuffer,
}) => {
  const [meta, setMeta] = useState<DocumentMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && pdfBuffer) {
      getPdfMetadata(pdfBuffer, fileName).then(setMeta).catch(() => setMeta(null));
    }
  }, [isOpen, pdfBuffer, fileName]);

  if (!isOpen) return null;

  const handleStripMetadata = async () => {
    if (!pdfBuffer) return;
    try {
      setIsProcessing(true);
      const cleanBytes = await removePdfMetadata(pdfBuffer);
      const newBuf = uint8ArrayToArrayBuffer(cleanBytes);
      if (onUpdatePdfBuffer) onUpdatePdfBuffer(newBuf);

      const baseName = fileName.replace(/\.[^/.]+$/, '');
      downloadFile(cleanBytes, `${baseName}_CleanMetadata.pdf`);
      onToast('Metadata Stripped', 'Author, creator, timestamps, and tracking tags removed.', 'success');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to strip metadata';
      onToast('Error', msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlatten = async () => {
    if (!pdfBuffer) return;
    try {
      setIsProcessing(true);
      const flattenedBytes = await flattenPdf(pdfBuffer);
      const newBuf = uint8ArrayToArrayBuffer(flattenedBytes);
      if (onUpdatePdfBuffer) onUpdatePdfBuffer(newBuf);

      const baseName = fileName.replace(/\.[^/.]+$/, '');
      downloadFile(flattenedBytes, `${baseName}_Flattened.pdf`);
      onToast('PDF Flattened', 'Interactive form fields and annotations baked into static pages.', 'success');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to flatten PDF';
      onToast('Error', msg, 'error');
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
              <Shield className="w-5 h-5 text-blue-600" />
              Document Privacy & Security
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
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Metadata Audit Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Stored Document Metadata
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Document Title:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{meta?.title || 'None / Not set'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Author / Identity:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{meta?.author || 'None / Anonymous'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Creator Software:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{meta?.creator || 'Standard PDF Engine'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Pages & Size:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {meta?.pageCount ?? 1} pages · {((meta?.fileSizeBytes ?? 0) / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          </div>

          {/* Action 1: Strip Metadata */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                <UserX className="w-4 h-4 text-blue-600" />
                Sanitize & Remove Metadata
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Strips author names, organizational metadata, software versions, and creation timestamps for confidential submissions.
              </p>
            </div>
            <button
              onClick={handleStripMetadata}
              disabled={isProcessing}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
            >
              Strip & Save
            </button>
          </div>

          {/* Action 2: Flatten Form Fields */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                <Lock className="w-4 h-4 text-emerald-600" />
                Flatten Document & Form Fields
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Renders fillable PDF form controls and annotations into static non-editable page graphics.
              </p>
            </div>
            <button
              onClick={handleFlatten}
              disabled={isProcessing}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shrink-0"
            >
              Flatten PDF
            </button>
          </div>
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
