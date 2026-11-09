import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { 
  Annotation, 
  AnnotationType 
} from '../../types/pdf';
import { 
  rotatePdfPages, 
  deletePdfPages, 
  reorderPdfPages, 
  duplicatePdfPages,
  applyAnnotationsToPdf, 
  downloadFile,
  uint8ArrayToArrayBuffer 
} from '../../services/pdfService';
import { PdfThumbnailSidebar } from './PdfThumbnailSidebar';
import { EditorToolbar } from './EditorToolbar';
import { PropertiesSidebar } from './PropertiesSidebar';
import { PdfCanvasViewer } from './PdfCanvasViewer';
import { SignatureModal } from './SignatureModal';
import { Upload, Sparkles, FileText } from 'lucide-react';

interface PdfEditorWorkspaceProps {
  pdfBuffer: ArrayBuffer | null;
  fileName: string;
  onUpdatePdfBuffer: (buffer: ArrayBuffer) => void;
  onLoadSamplePdf: () => void;
  onUploadFile: (file: File) => void;
  onToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const PdfEditorWorkspace: React.FC<PdfEditorWorkspaceProps> = ({
  pdfBuffer,
  fileName,
  onUpdatePdfBuffer,
  onLoadSamplePdf,
  onUploadFile,
  onToast,
}) => {
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.15);
  const [activeTool, setActiveTool] = useState<'select' | AnnotationType>('select');

  // Annotations & History
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modals
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Inspect page count whenever pdfBuffer changes
  useEffect(() => {
    if (pdfBuffer) {
      PDFDocument.load(pdfBuffer, { ignoreEncryption: true })
        .then(doc => {
          setPageCount(doc.getPageCount());
          if (currentPage > doc.getPageCount()) {
            setCurrentPage(1);
          }
        })
        .catch(err => {
          console.error('Failed to parse page count:', err);
        });
    }
  }, [pdfBuffer]);

  // Push new state to history
  const pushHistory = (newAnnotations: Annotation[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newAnnotations);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setAnnotations(newAnnotations);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setAnnotations(prev);
      setSelectedId(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setAnnotations(next);
      setSelectedId(null);
    }
  };

  const handleAddAnnotation = (ann: Annotation) => {
    const updated = [...annotations, ann];
    pushHistory(updated);
  };

  const handleUpdateAnnotation = (id: string, partial: Partial<Annotation>) => {
    const updated = annotations.map(a => (a.id === id ? { ...a, ...partial } : a));
    pushHistory(updated);
  };

  const handleDeleteAnnotation = (id: string) => {
    const updated = annotations.filter(a => a.id !== id);
    pushHistory(updated);
    setSelectedId(null);
    onToast('Deleted', 'Annotation removed from page', 'info');
  };

  // Add signature as annotation
  const handleConfirmSignature = (dataUrl: string) => {
    const newAnn: Annotation = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'signature',
      page: currentPage,
      x: 100,
      y: 200,
      width: 180,
      height: 70,
      color: '#0F172A',
      opacity: 1,
      imageData: dataUrl,
    };
    handleAddAnnotation(newAnn);
    setSelectedId(newAnn.id);
    setActiveTool('select');
    onToast('Signature Inserted', 'Drag to position your signature on the page', 'success');
  };

  // Add image as annotation
  const handleAddImage = (dataUrl: string) => {
    const newAnn: Annotation = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'image',
      page: currentPage,
      x: 100,
      y: 150,
      width: 200,
      height: 150,
      color: '#2563EB',
      opacity: 1,
      imageData: dataUrl,
    };
    handleAddAnnotation(newAnn);
    setSelectedId(newAnn.id);
    setActiveTool('select');
    onToast('Image Inserted', 'Image added to page. You can drag and position it.', 'success');
  };

  // Rotate Page
  const handleRotatePage = async (page: number) => {
    if (!pdfBuffer) return;
    try {
      const newBytes = await rotatePdfPages(pdfBuffer, { [page]: 90 });
      const newBuf = uint8ArrayToArrayBuffer(newBytes);
      onUpdatePdfBuffer(newBuf);
      onToast('Rotated Page', `Page ${page} rotated 90° clockwise`, 'success');
    } catch {
      onToast('Error', 'Failed to rotate page', 'error');
    }
  };

  // Delete Page
  const handleDeletePage = async (page: number) => {
    if (!pdfBuffer) return;
    if (pageCount <= 1) {
      onToast('Cannot Delete', 'Document must have at least one page', 'error');
      return;
    }
    try {
      const newBytes = await deletePdfPages(pdfBuffer, [page]);
      const newBuf = uint8ArrayToArrayBuffer(newBytes);
      onUpdatePdfBuffer(newBuf);
      // Remove annotations on deleted page and adjust remaining pages
      const updatedAnns = annotations
        .filter(a => a.page !== page)
        .map(a => (a.page > page ? { ...a, page: a.page - 1 } : a));
      pushHistory(updatedAnns);

      if (currentPage >= pageCount) {
        setCurrentPage(Math.max(1, pageCount - 1));
      }
      onToast('Page Deleted', `Removed page ${page}`, 'success');
    } catch {
      onToast('Error', 'Failed to delete page', 'error');
    }
  };

  // Duplicate Page
  const handleDuplicatePage = async (page: number) => {
    if (!pdfBuffer) return;
    try {
      const newBytes = await duplicatePdfPages(pdfBuffer, [page]);
      const newBuf = uint8ArrayToArrayBuffer(newBytes);
      onUpdatePdfBuffer(newBuf);
      onToast('Page Duplicated', `Duplicated page ${page}`, 'success');
    } catch {
      onToast('Error', 'Failed to duplicate page', 'error');
    }
  };

  // Reorder / Move page
  const handleMovePage = async (fromIdx: number, toIdx: number) => {
    if (!pdfBuffer) return;
    if (toIdx < 0 || toIdx >= pageCount) return;

    try {
      const order = Array.from({ length: pageCount }, (_, i) => i + 1);
      const moved = order.splice(fromIdx, 1)[0];
      order.splice(toIdx, 0, moved);

      const newBytes = await reorderPdfPages(pdfBuffer, order);
      const newBuf = uint8ArrayToArrayBuffer(newBytes);
      onUpdatePdfBuffer(newBuf);
      setCurrentPage(toIdx + 1);
      onToast('Page Reordered', `Moved page to position ${toIdx + 1}`, 'success');
    } catch {
      onToast('Error', 'Failed to move page', 'error');
    }
  };

  // Add Blank Page
  const handleAddBlankPage = async () => {
    if (!pdfBuffer) return;
    try {
      const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      doc.addPage([595.28, 841.89]); // A4
      const newBytes = await doc.save();
      const newBuf = uint8ArrayToArrayBuffer(newBytes);
      onUpdatePdfBuffer(newBuf);
      setCurrentPage(pageCount + 1);
      onToast('Blank Page Added', 'Inserted new A4 blank page at end of document', 'success');
    } catch {
      onToast('Error', 'Failed to insert blank page', 'error');
    }
  };

  // Export PDF with burned annotations
  const handleExportPdf = async () => {
    if (!pdfBuffer) return;
    try {
      setIsExporting(true);
      const finalBytes = await applyAnnotationsToPdf(pdfBuffer, annotations);
      const baseName = fileName.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_Edited_PDFStudioPro.pdf`;
      downloadFile(finalBytes, outName);
      onToast('PDF Exported', 'Document with all visual annotations downloaded successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      onToast('Export Error', msg, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // If no document is loaded, render empty workspace prompt
  if (!pdfBuffer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-[#070C18]">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
            <FileText className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No PDF Document Open
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Upload an existing PDF or load the verification sample report to access the full visual editing workspace.
          </p>

          <div className="space-y-3">
            <label className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Select PDF from Computer</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    onUploadFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </label>

            <button
              onClick={onLoadSamplePdf}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Load Academic Sample Document</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedAnnotation = annotations.find(a => a.id === selectedId) || null;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Toolbar */}
      <EditorToolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        currentPage={currentPage}
        totalPages={pageCount}
        onPageChange={setCurrentPage}
        zoom={zoom}
        onZoomChange={setZoom}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
        onAddImage={handleAddImage}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
      />

      {/* Main 3-pane Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnails Pane */}
        <PdfThumbnailSidebar
          pdfBuffer={pdfBuffer}
          pageCount={pageCount}
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          onRotatePage={handleRotatePage}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
          onMovePage={handleMovePage}
          onAddBlankPage={handleAddBlankPage}
        />

        {/* Center Canvas Pane */}
        <PdfCanvasViewer
          pdfBuffer={pdfBuffer}
          currentPage={currentPage}
          zoom={zoom}
          activeTool={activeTool}
          annotations={annotations}
          selectedId={selectedId}
          onSelectAnnotation={setSelectedId}
          onAddAnnotation={handleAddAnnotation}
          onUpdateAnnotation={handleUpdateAnnotation}
        />

        {/* Right Properties Pane */}
        <PropertiesSidebar
          selectedAnnotation={selectedAnnotation}
          onUpdateAnnotation={partial => {
            if (selectedId) handleUpdateAnnotation(selectedId, partial);
          }}
          onDeleteAnnotation={handleDeleteAnnotation}
        />
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onConfirmSignature={handleConfirmSignature}
      />
    </div>
  );
};
