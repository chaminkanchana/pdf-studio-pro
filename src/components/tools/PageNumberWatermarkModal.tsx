import React, { useState } from 'react';
import { X, Hash, Stamp, CheckCircle2, Loader2 } from 'lucide-react';
import { PageNumberConfig, WatermarkConfig } from '../../types/pdf';
import { 
  addPageNumbersToPdf, 
  addWatermarkToPdf, 
  downloadFile,
  uint8ArrayToArrayBuffer 
} from '../../services/pdfService';

interface PageNumberWatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBuffer: ArrayBuffer | null;
  fileName?: string;
  defaultMode?: 'numbers' | 'watermark';
  onToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onUpdatePdfBuffer?: (newBuffer: ArrayBuffer) => void;
}

export const PageNumberWatermarkModal: React.FC<PageNumberWatermarkModalProps> = ({
  isOpen,
  onClose,
  pdfBuffer,
  fileName = 'document.pdf',
  defaultMode = 'numbers',
  onToast,
  onUpdatePdfBuffer,
}) => {
  const [activeTab, setActiveTab] = useState<'numbers' | 'watermark'>(defaultMode);
  const [isProcessing, setIsProcessing] = useState(false);

  // Page numbers state
  const [numConfig, setNumConfig] = useState<PageNumberConfig>({
    position: 'bottom-center',
    format: 'page-of-total',
    startNumber: 1,
    fontSize: 10,
    color: '#64748B',
    skipFirstPage: true,
  });

  // Watermark state
  const [wmConfig, setWmConfig] = useState<WatermarkConfig>({
    text: 'CONFIDENTIAL',
    fontSize: 48,
    opacity: 0.18,
    color: '#DC2626',
    rotation: 45,
    applyToAllPages: true,
  });

  if (!isOpen) return null;

  const handleApplyNumbers = async () => {
    if (!pdfBuffer) {
      onToast('No PDF', 'Please load a PDF document first', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const outputBytes = await addPageNumbersToPdf(pdfBuffer, numConfig);
      const newBuffer = uint8ArrayToArrayBuffer(outputBytes);
      if (onUpdatePdfBuffer) onUpdatePdfBuffer(newBuffer);

      const baseName = fileName.replace(/\.[^/.]+$/, '');
      downloadFile(outputBytes, `${baseName}_Numbered.pdf`);
      onToast('Page Numbers Added', 'Document pagination has been generated and downloaded.', 'success');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add page numbers';
      onToast('Error', msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyWatermark = async () => {
    if (!pdfBuffer) {
      onToast('No PDF', 'Please load a PDF document first', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const outputBytes = await addWatermarkToPdf(pdfBuffer, wmConfig);
      const newBuffer = uint8ArrayToArrayBuffer(outputBytes);
      if (onUpdatePdfBuffer) onUpdatePdfBuffer(newBuffer);

      const baseName = fileName.replace(/\.[^/.]+$/, '');
      downloadFile(outputBytes, `${baseName}_Watermarked.pdf`);
      onToast('Watermark Added', 'Watermark stamp applied across document pages.', 'success');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add watermark';
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('numbers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'numbers' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Page Numbers</span>
            </button>
            <button
              onClick={() => setActiveTab('watermark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'watermark' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>Watermark</span>
            </button>
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
          {activeTab === 'numbers' ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Position on Page
                </label>
                <select
                  value={numConfig.position}
                  onChange={e => setNumConfig(prev => ({ ...prev, position: e.target.value as PageNumberConfig['position'] }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="bottom-center">Bottom Center (Standard Academic)</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right (Header)</option>
                  <option value="top-center">Top Center</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Format
                </label>
                <select
                  value={numConfig.format}
                  onChange={e => setNumConfig(prev => ({ ...prev, format: e.target.value as PageNumberConfig['format'] }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="page-of-total">Page 1 of 12 (Formal Submission)</option>
                  <option value="number">Simple Number (1, 2, 3)</option>
                  <option value="dash-number">- 1 - (Editorial)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Start Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={numConfig.startNumber}
                    onChange={e => setNumConfig(prev => ({ ...prev, startNumber: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Font Size (pt)
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="18"
                    value={numConfig.fontSize}
                    onChange={e => setNumConfig(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 10 }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={numConfig.skipFirstPage}
                  onChange={e => setNumConfig(prev => ({ ...prev, skipFirstPage: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Skip First Page (Leave title / cover page unnumbered)
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={wmConfig.text}
                  onChange={e => setWmConfig(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="e.g. DRAFT, CONFIDENTIAL, PREVIEW"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Angle Rotation (Degrees)
                  </label>
                  <select
                    value={wmConfig.rotation}
                    onChange={e => setWmConfig(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="45">Diagonal 45°</option>
                    <option value="-45">Diagonal -45°</option>
                    <option value="0">Horizontal 0°</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Watermark Color
                  </label>
                  <select
                    value={wmConfig.color}
                    onChange={e => setWmConfig(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="#DC2626">Alert Red (#DC2626)</option>
                    <option value="#64748B">Subtle Slate Gray (#64748B)</option>
                    <option value="#2563EB">Royal Blue (#2563EB)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Transparency / Opacity
                  </label>
                  <span className="font-mono text-slate-500">{Math.round(wmConfig.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={wmConfig.opacity}
                  onChange={e => setWmConfig(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wmConfig.applyToAllPages}
                  onChange={e => setWmConfig(prev => ({ ...prev, applyToAllPages: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Stamp watermark across all document pages
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={activeTab === 'numbers' ? handleApplyNumbers : handleApplyWatermark}
            disabled={isProcessing || !pdfBuffer}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply and Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
