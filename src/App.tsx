import React, { useState, useEffect } from 'react';
import { ToastMessage } from './types/pdf';
import { 
  createSamplePdf, 
  readFileAsArrayBuffer,
  uint8ArrayToArrayBuffer 
} from './services/pdfService';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { StudentToolkitBanner } from './components/home/StudentToolkitBanner';
import { ToolGrid } from './components/home/ToolGrid';
import { PdfEditorWorkspace } from './components/editor/PdfEditorWorkspace';
import { ToastContainer } from './components/common/ToastContainer';
import { ProjectSpecsModal } from './components/common/ProjectSpecsModal';

// Tool Modals
import { MergeToolModal } from './components/tools/MergeToolModal';
import { SplitToolModal } from './components/tools/SplitToolModal';
import { ConvertImageToPdfModal } from './components/tools/ConvertImageToPdfModal';
import { ConvertPdfToImageModal } from './components/tools/ConvertPdfToImageModal';
import { StudentCoverPageModal } from './components/tools/StudentCoverPageModal';
import { PageNumberWatermarkModal } from './components/tools/PageNumberWatermarkModal';
import { ExtractTextModal } from './components/tools/ExtractTextModal';
import { PdfSecurityModal } from './components/tools/PdfSecurityModal';
import { ComparePdfsModal } from './components/tools/ComparePdfsModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'editor'>('home');
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('Sample_University_Report.pdf');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isImgToPdfModalOpen, setIsImgToPdfModalOpen] = useState(false);
  const [isPdfToImgModalOpen, setIsPdfToImgModalOpen] = useState(false);
  const [isCoverPageModalOpen, setIsCoverPageModalOpen] = useState(false);
  const [isPageNumWatermarkOpen, setIsPageNumWatermarkOpen] = useState(false);
  const [numWatermarkMode, setNumWatermarkMode] = useState<'numbers' | 'watermark'>('numbers');
  const [isExtractTextModalOpen, setIsExtractTextModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);

  // Initialize dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load initial sample PDF so the application is immediately testable and functional
  useEffect(() => {
    createSamplePdf().then(sampleBytes => {
      const buf = uint8ArrayToArrayBuffer(sampleBytes);
      setPdfBuffer(buf);
      setFileName('University_CS402_Project_Report.pdf');
    }).catch(err => {
      console.error('Failed to create sample report:', err);
    });
  }, []);

  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Handle upload of PDF from Hero or Workspace
  const handleFileSelected = async (file: File) => {
    try {
      const buffer = await readFileAsArrayBuffer(file);
      setPdfBuffer(buffer);
      setFileName(file.name);
      setCurrentView('editor');
      addToast('Document Loaded', `Opened ${file.name} in visual workspace.`, 'success');
    } catch {
      addToast('Upload Error', 'Could not parse the selected PDF file.', 'error');
    }
  };

  // Generate / Reload Sample PDF
  const handleLoadSamplePdf = async () => {
    try {
      const sampleBytes = await createSamplePdf();
      const buf = uint8ArrayToArrayBuffer(sampleBytes);
      setPdfBuffer(buf);
      setFileName('University_CS402_Project_Report.pdf');
      setCurrentView('editor');
      addToast('Sample PDF Loaded', 'Multi-page academic report loaded for verification testing.', 'success');
    } catch {
      addToast('Error', 'Failed to generate sample PDF', 'error');
    }
  };

  // Route tool click from cards
  const handleSelectTool = (toolId: string) => {
    switch (toolId) {
      case 'visual-editor':
      case 'add-text':
      case 'student-annotate':
        setCurrentView('editor');
        break;

      case 'merge-pdf':
      case 'student-merge-assignments':
        setIsMergeModalOpen(true);
        break;

      case 'split-pdf':
      case 'extract-pages':
        setIsSplitModalOpen(true);
        break;

      case 'rotate-pdf':
      case 'delete-pages':
      case 'rearrange-pages':
      case 'duplicate-pages':
        setCurrentView('editor');
        addToast('Document Organization', 'Use the left page thumbnail sidebar to rotate, reorder, duplicate, or delete pages.', 'info');
        break;

      case 'jpg-to-pdf':
        setIsImgToPdfModalOpen(true);
        break;

      case 'pdf-to-jpg':
        setIsPdfToImgModalOpen(true);
        break;

      case 'student-cover-page':
        setIsCoverPageModalOpen(true);
        break;

      case 'page-numbers':
      case 'student-page-numbers':
        setNumWatermarkMode('numbers');
        setIsPageNumWatermarkOpen(true);
        break;

      case 'watermark':
        setNumWatermarkMode('watermark');
        setIsPageNumWatermarkOpen(true);
        break;

      case 'add-signature':
        setCurrentView('editor');
        addToast('Electronic Signature', 'Click the Signature button on the top workspace toolbar to insert your signature.', 'info');
        break;

      case 'redact':
        setCurrentView('editor');
        addToast('Permanent Redaction', 'Select the Redact tool on the top toolbar to draw permanent blackout masks over confidential text.', 'info');
        break;

      case 'remove-metadata':
      case 'flatten-pdf':
        setIsSecurityModalOpen(true);
        break;

      case 'extract-text':
        setIsExtractTextModalOpen(true);
        break;

      case 'compare-pdf':
        setIsCompareModalOpen(true);
        break;

      case 'word-to-pdf':
      case 'pdf-to-word':
      case 'excel-to-pdf':
      case 'powerpoint-to-pdf':
      case 'ocr-pdf':
      case 'protect-pdf':
        setIsSpecsModalOpen(true);
        addToast('Backend Service Required', 'This tool requires a server-side engine (LibreOffice / Tesseract OCR). See Audit Specs.', 'warning');
        break;

      default:
        setCurrentView('editor');
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={view => setCurrentView(view as 'home' | 'editor')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenSpecsModal={() => setIsSpecsModalOpen(true)}
        onLoadSamplePdf={handleLoadSamplePdf}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'home' ? (
          <>
            <HeroSection
              onFileSelected={handleFileSelected}
              onLoadSamplePdf={handleLoadSamplePdf}
              onNavigateToTool={handleSelectTool}
            />

            <StudentToolkitBanner
              onSelectTool={handleSelectTool}
            />

            <ToolGrid
              onSelectTool={handleSelectTool}
            />
          </>
        ) : (
          <PdfEditorWorkspace
            pdfBuffer={pdfBuffer}
            fileName={fileName}
            onUpdatePdfBuffer={setPdfBuffer}
            onLoadSamplePdf={handleLoadSamplePdf}
            onUploadFile={handleFileSelected}
            onToast={addToast}
          />
        )}
      </main>

      {/* Footer (shown on homepage and when viewing specs) */}
      {currentView === 'home' && (
        <Footer
          onOpenSpecsModal={() => setIsSpecsModalOpen(true)}
          onNavigateTool={handleSelectTool}
        />
      )}

      {/* Modals */}
      <MergeToolModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        initialBuffer={pdfBuffer}
        initialName={fileName}
        onToast={addToast}
      />

      <SplitToolModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        pdfBuffer={pdfBuffer}
        fileName={fileName}
        onToast={addToast}
      />

      <ConvertImageToPdfModal
        isOpen={isImgToPdfModalOpen}
        onClose={() => setIsImgToPdfModalOpen(false)}
        onToast={addToast}
      />

      <ConvertPdfToImageModal
        isOpen={isPdfToImgModalOpen}
        onClose={() => setIsPdfToImgModalOpen(false)}
        pdfBuffer={pdfBuffer}
        fileName={fileName}
        onToast={addToast}
      />

      <StudentCoverPageModal
        isOpen={isCoverPageModalOpen}
        onClose={() => setIsCoverPageModalOpen(false)}
        pdfBuffer={pdfBuffer}
        fileName={fileName}
        onToast={addToast}
        onUpdatePdfBuffer={setPdfBuffer}
      />

      <PageNumberWatermarkModal
        isOpen={isPageNumWatermarkOpen}
        onClose={() => setIsPageNumWatermarkOpen(false)}
        pdfBuffer={pdfBuffer}
        fileName={fileName}
        defaultMode={numWatermarkMode}
        onToast={addToast}
        onUpdatePdfBuffer={setPdfBuffer}
      />

      <ExtractTextModal
        isOpen={isExtractTextModalOpen}
        onClose={() => setIsExtractTextModalOpen(false)}
        pdfBuffer={pdfBuffer}
        fileName={fileName}
        onToast={addToast}
      />

      <PdfSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        pdfBuffer={pdfBuffer}
        fileName={fileName}
        onToast={addToast}
        onUpdatePdfBuffer={setPdfBuffer}
      />

      <ComparePdfsModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        initialBuffer1={pdfBuffer}
        onToast={addToast}
      />

      <ProjectSpecsModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
      />

      {/* Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </div>
  );
}
