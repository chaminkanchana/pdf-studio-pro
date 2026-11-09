import React, { useState } from 'react';
import { X, Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { imagesToPdf, downloadFile, readFileAsDataURL } from '../../services/pdfService';

interface ConvertImageToPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

interface ImageItem {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
}

export const ConvertImageToPdfModal: React.FC<ConvertImageToPdfModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'fit'>('a4');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newItems: ImageItem[] = [];

    for (const f of files) {
      if (f.type.startsWith('image/')) {
        try {
          const dataUrl = await readFileAsDataURL(f);
          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            name: f.name,
            dataUrl,
            size: f.size,
          });
        } catch {
          onToast('Read Error', `Could not read image: ${f.name}`, 'error');
        }
      }
    }

    setImages(prev => [...prev, ...newItems]);
    e.target.value = '';
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      onToast('No Images', 'Please upload at least one image', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const pdfBytes = await imagesToPdf(images, pageSize);
      downloadFile(pdfBytes, 'Converted_Images_PDFStudioPro.pdf');
      onToast('Conversion Complete', `Converted ${images.length} images into a PDF!`, 'success');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image conversion failed';
      onToast('Error', msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Convert JPG & PNG Images to PDF
            </h2>
            <p className="text-xs text-slate-500">
              Transform scans, phone photos, and diagrams into a clean PDF document
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
          {/* Controls bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Page Layout:</span>
              <select
                value={pageSize}
                onChange={e => setPageSize(e.target.value as 'a4' | 'fit')}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="a4">Standard A4 (Consistent margins)</option>
                <option value="fit">Fit Exact Image Dimensions</option>
              </select>
            </div>

            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Images</span>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAddImages}
                className="hidden"
              />
            </label>
          </div>

          {images.length === 0 ? (
            <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Click to upload JPG / PNG images
              </p>
              <p className="text-xs text-slate-500 mt-1">Select one or more pictures to assemble into a PDF</p>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAddImages}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-2">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        Page {idx + 1}: {img.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {(img.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === images.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="p-1 rounded text-red-400 hover:text-red-600 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {images.length} {images.length === 1 ? 'image' : 'images'} in sequence
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConvert}
              disabled={images.length === 0 || isProcessing}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Convert & Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
