import React, { useState } from 'react';
import { X, Upload, ArrowUp, ArrowDown, Trash2, FileText, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { mergePdfs, downloadFile, readFileAsArrayBuffer } from '../../services/pdfService';

interface MergeToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  initialBuffer?: ArrayBuffer | null;
  initialName?: string;
}

interface MergeItem {
  id: string;
  name: string;
  size: number;
  buffer: ArrayBuffer;
}

export const MergeToolModal: React.FC<MergeToolModalProps> = ({
  isOpen,
  onClose,
  onToast,
  initialBuffer,
  initialName = 'Document.pdf',
}) => {
  const [files, setFiles] = useState<MergeItem[]>(() => {
    if (initialBuffer) {
      return [{
        id: 'init-1',
        name: initialName,
        size: initialBuffer.byteLength,
        buffer: initialBuffer,
      }];
    }
    return [];
  });

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);

    const newItems: MergeItem[] = [];
    for (const f of incoming) {
      if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
        try {
          const buf = await readFileAsArrayBuffer(f);
          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            name: f.name,
            size: f.size,
            buffer: buf,
          });
        } catch {
          onToast('File Read Error', `Could not read ${f.name}`, 'error');
        }
      }
    }

    setFiles(prev => [...prev, ...newItems]);
    e.target.value = '';
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      onToast('Requires Multiple Files', 'Please add at least 2 PDF files to merge', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const buffers = files.map(f => f.buffer);
      const mergedBytes = await mergePdfs(buffers);
      downloadFile(mergedBytes, 'Merged_Document_PDFStudioPro.pdf');
      onToast('Merge Successful', `Combined ${files.length} PDFs into a single file!`, 'success');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown merge failure';
      onToast('Merge Failed', msg, 'error');
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
              <FileText className="w-5 h-5 text-blue-600" />
              Merge Multiple PDF Documents
            </h2>
            <p className="text-xs text-slate-500">
              Combine files in your desired order into a unified PDF
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
          {/* Add file button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Document Queue ({files.length})
            </span>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>Add PDF Files</span>
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={handleAddFiles}
                className="hidden"
              />
            </label>
          </div>

          {files.length === 0 ? (
            <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Click to select PDF files
              </p>
              <p className="text-xs text-slate-500 mt-1">Select 2 or more PDFs to combine</p>
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={handleAddFiles}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === files.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 rounded text-red-400 hover:text-red-600 transition-colors ml-1"
                      title="Remove"
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
            {files.length >= 2 ? `${files.length} documents ready to merge` : 'Need at least 2 files'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleMerge}
              disabled={files.length < 2 || isProcessing}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Merging Documents...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Merge and Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
